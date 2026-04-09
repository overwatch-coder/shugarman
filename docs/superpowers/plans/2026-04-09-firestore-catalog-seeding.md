# Firestore Catalog Seeding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a rerunnable Firestore seed script that upserts catalog products and categories from the current storefront mock data.

**Architecture:** Add a dedicated TypeScript CLI under `apps/web/scripts` that reads the existing mock catalog from `storefront-data.ts`, maps it into Firestore schema documents, and writes seed-owned docs with stable IDs. Preserve `createdAt` on existing products, always replace seeded products/categories on rerun, and support a strict `--dry-run` mode for verification before writes.

**Tech Stack:** Next.js workspace, TypeScript, `firebase-admin`, `tsx`, existing Firestore schema types

---

## File Map

- Modify: `apps/web/package.json`
- Modify: `apps/web/lib/schemas.ts`
- Create: `apps/web/scripts/seed-firestore.ts`
- Create: `apps/web/scripts/lib/seed/firebase-admin-seed.ts`
- Create: `apps/web/scripts/lib/seed/options.ts`
- Create: `apps/web/scripts/lib/seed/mappers.ts`
- Create: `apps/web/scripts/lib/seed/write.ts`
- Create: `apps/web/scripts/lib/seed/report.ts`

### Task 1: Add Seed Command Wiring

**Files:**
- Modify: `apps/web/package.json`

- [ ] **Step 1: Add the runner dependency**

Add `tsx` to `devDependencies`.

- [ ] **Step 2: Add the seed command**

Add this script:

```json
"seed:firestore": "tsx scripts/seed-firestore.ts"
```

- [ ] **Step 3: Verify package shape**

Run: `npm --workspace web run typecheck`
Expected: existing workspace still typechecks before the script files are introduced.

- [ ] **Step 4: Commit wiring**

```bash
git add apps/web/package.json
git commit -m "chore(web): add firestore seed command"
```

### Task 2: Add Category Schema Support

**Files:**
- Modify: `apps/web/lib/schemas.ts`

- [ ] **Step 1: Add the minimal Firestore category type**

Add:

```ts
export interface CategoryDoc {
  slug: string
  name: string
  order: number
}
```

Place it near other Firestore document interfaces.

- [ ] **Step 2: Run typecheck**

Run: `npm --workspace web run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit schema support**

```bash
git add apps/web/lib/schemas.ts
git commit -m "feat(web): add category firestore schema"
```

### Task 3: Build CLI Option Parsing

**Files:**
- Create: `apps/web/scripts/lib/seed/options.ts`
- Test via: `apps/web/scripts/seed-firestore.ts`

- [ ] **Step 1: Implement strict option parsing**

Create a parser that accepts only `--dry-run` and throws on any unknown flag.

```ts
export interface SeedOptions {
  dryRun: boolean
}

export function parseSeedOptions(argv: string[]): SeedOptions {
  const flags = new Set(argv)

  for (const flag of flags) {
    if (flag !== "--dry-run") {
      throw new Error(`Unknown flag: ${flag}`)
    }
  }

  return { dryRun: flags.has("--dry-run") }
}
```

- [ ] **Step 2: Wire parser into entrypoint stub**

Create a temporary `seed-firestore.ts` that parses args and logs mode.

- [ ] **Step 3: Run the dry-run stub**

Run: `npm --workspace web run seed:firestore -- --dry-run`
Expected: logs dry-run mode without write attempts.

- [ ] **Step 4: Commit option parsing**

```bash
git add apps/web/scripts/lib/seed/options.ts apps/web/scripts/seed-firestore.ts
git commit -m "feat(web): add seed cli option parsing"
```

### Task 4: Add Dedicated Firebase Admin Seed Initializer

**Files:**
- Create: `apps/web/scripts/lib/seed/firebase-admin-seed.ts`

- [ ] **Step 1: Implement hard-failing env validation**

Require these env vars:

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

Use the same newline normalization pattern as the existing runtime initializer.

- [ ] **Step 2: Export one shared seed Firestore instance**

Use `getApps()` / `initializeApp()` / `cert()` and export both:

```ts
export function getSeedProjectId(): string
export const seedDb: Firestore
```

- [ ] **Step 3: Verify missing-env failure**

Run from a clean env for the command invocation, for example by unsetting the three required vars for a single command invocation.
Expected: FAIL fast with a clear error naming the missing env var(s).

- [ ] **Step 4: Commit initializer**

```bash
git add apps/web/scripts/lib/seed/firebase-admin-seed.ts
git commit -m "feat(web): add seed firebase admin initializer"
```

### Task 5: Implement Catalog Mapping

**Files:**
- Create: `apps/web/scripts/lib/seed/mappers.ts`
- Read from: `apps/web/lib/storefront-data.ts`
- Read types from: `apps/web/lib/schemas.ts`

- [ ] **Step 1: Implement category constants and mapper**

Create a canonical category array:

```ts
const CATEGORY_SEEDS: CategoryDoc[] = [
  { slug: "smartphones", name: "Smartphones", order: 1 },
  { slug: "tablets", name: "Tablets", order: 2 },
  { slug: "laptops", name: "Laptops", order: 3 },
  { slug: "wearables", name: "Wearables", order: 4 },
]
```

Export `buildCategoryDocs(): CategoryDoc[]` returning a fresh copy.

- [ ] **Step 2: Implement product mapping helpers**

Add pure helpers for:

- `inferCategory(card): string`
- `buildFallbackImages(card): ProductImage[]`
- `mapRelatedSlugs(detail): string[]`
- `isFeaturedProduct(index): boolean`
- `validateRequiredCardFields(card): void`

- [ ] **Step 3: Implement product document mapper**

Export:

```ts
export function buildProductDocs(nowIso: string, existingCreatedAtBySlug: Map<string, string>): ProductDoc[]
```

Rules:

- Use `products` array order as the canonical seed order.
- Use detail fields when present.
- For products without detail records, set `rating` to `0`, `reviewCount` to `0`, `colors` to `[]`, `storageOptions` to `[]`, `inStock` to `true`, `images` from the card, `specs` to `[]`, `installment` to `null`, and `relatedSlugs` to `[]`.
- Keep `badge` from the card when present.
- Always source `subtitle`, `image`, and `imageAlt` from the card, even when a detail record exists.
- Mark `featured` as `true` only for products in `products.slice(0, 4)`.
- Infer `category` deterministically: headphone/audio products map to `wearables`; everything else defaults to `smartphones` for v1.
- Preserve existing `createdAt` from the map when valid.
- When no valid existing `createdAt` exists, set `createdAt` to `nowIso`.
- Always set `updatedAt` to `nowIso`.
- Fail fast when a required product source field such as `slug` or `name` is missing or blank.

- [ ] **Step 4: Validate mapper output with the dry-run stub**

Run: `npm --workspace web run seed:firestore -- --dry-run`
Expected: dry-run can prepare 6 products and 4 categories without type/runtime errors.

- [ ] **Step 5: Commit mappers**

```bash
git add apps/web/scripts/lib/seed/mappers.ts apps/web/scripts/seed-firestore.ts
git commit -m "feat(web): map storefront catalog into seed docs"
```

### Task 6: Implement Firestore Upsert Writer

**Files:**
- Create: `apps/web/scripts/lib/seed/write.ts`
- Read from: `apps/web/scripts/lib/seed/firebase-admin-seed.ts`
- Read from: `apps/web/scripts/lib/seed/mappers.ts`

- [ ] **Step 1: Implement existing-createdAt lookup**

Add a helper that reads each `products/{slug}` doc before writing and returns:

```ts
Map<string, string>
```

Only preserve ISO-looking string values. Ignore invalid values.

- [ ] **Step 2: Implement write planning**

Create a write-plan type:

```ts
export interface TouchedPath {
  path: string
  operation: "create" | "replace"
}
```

Build touched-path entries for every seeded product and category.

- [ ] **Step 3: Implement real writes**

Write each product/category with `set` and no merge.
Determine `create` vs `replace` from document existence checks.

- [ ] **Step 4: Respect dry-run mode**

Dry run may read existing docs for classification and `createdAt` preservation, but must not issue writes.

- [ ] **Step 5: Validate with dry run**

Run: `npm --workspace web run seed:firestore -- --dry-run`
Expected: sorted touched-path summary for 10 total paths, no write errors.

- [ ] **Step 6: Commit writer**

```bash
git add apps/web/scripts/lib/seed/write.ts apps/web/scripts/seed-firestore.ts
git commit -m "feat(web): add firestore seed upsert writer"
```

### Task 7: Implement Reporting and Final Entrypoint Flow

**Files:**
- Create: `apps/web/scripts/lib/seed/report.ts`
- Modify: `apps/web/scripts/seed-firestore.ts`

- [ ] **Step 1: Implement startup summary logging**

Log:

- project ID
- auth mode (`service-account-env`)
- mode (`dry-run` or `write`)
- prepared product count
- prepared category count

- [ ] **Step 2: Implement touched-path report printer**

Sort output lexicographically by path.

- [ ] **Step 3: Implement final completion summary**

Print a final success summary on completion and a final failure summary on any handled error path.

- [ ] **Step 4: Implement top-level error handling**

Wrap the entrypoint in `main().catch(...)`, print the message, and exit with code `1`.

- [ ] **Step 5: Run the focused checks**

Run: `npm --workspace web run typecheck`
Expected: PASS.

Run: `npm --workspace web run seed:firestore -- --dry-run`
Expected: PASS with summary and 10 touched paths.

- [ ] **Step 6: Commit reporting flow**

```bash
git add apps/web/scripts/lib/seed/report.ts apps/web/scripts/seed-firestore.ts
git commit -m "feat(web): finalize firestore seed cli"
```

### Task 8: Verify Real Firestore Behavior

**Files:**
- No code changes required unless validation exposes a local defect

- [ ] **Step 1: Run first real seed**

Run: `npm --workspace web run seed:firestore`
Expected: PASS, writes 6 product docs and 4 category docs.

- [ ] **Step 2: Run second real seed**

Run: `npm --workspace web run seed:firestore`
Expected: PASS, stable IDs reused, all touched paths reported as `replace`.

- [ ] **Step 3: Compare touched-path summaries across both real runs**

Capture the touched-path output from the first and second run and compare them.
Expected: same 10 paths in both runs, with the second run reporting `replace` for every path.

- [ ] **Step 4: Read back seeded docs**

Use a narrow verification command or temporary script to confirm all seeded paths exist:

- `products/iphone-15-pro-max`
- `products/galaxy-s23-ultra`
- `products/google-pixel-8-pro`
- `products/sony-wh1000xm5`
- `products/iphone-15`
- `products/ipad-pro-12-9`
- `categories/smartphones`
- `categories/tablets`
- `categories/laptops`
- `categories/wearables`

- [ ] **Step 5: Check createdAt preservation**

Confirm at least one existing product keeps its original `createdAt` across reruns while `updatedAt` changes.

- [ ] **Step 6: Commit final verified implementation**

```bash
git add apps/web/package.json apps/web/lib/schemas.ts apps/web/scripts
git commit -m "feat(web): add firestore catalog seeding workflow"
```

## Notes

- Keep the first implementation narrow: products + categories only.
- Do not modify homepage, settings, or DAL consumers in this plan.
- Do not add fallback parsing for external templates.
- Prefer small pure functions in `mappers.ts` so later tests can be added without refactoring.