# Firestore Seeding Design

## Goal

Create a repeatable Firestore seeding workflow for Sugar Man iStore that can be run any time a Firebase project is changed or a Firestore database needs baseline data. The workflow must upsert, not reset, and must use the current storefront mock catalog as the sole data source.

## Scope

This design covers:

- A rerunnable local script for Firestore seed upserts against an already provisioned Firebase project.
- Upserting the product catalog: `products/{slug}` documents and `categories/{slug}` documents.
- Leaving orders empty (created by real checkout submissions only).
- Leaving admin-user creation out of v1.
- Reusing existing Firebase Admin credentials and TypeScript schema types.

This design does not cover:

- Store settings (`settings/store`) — treated as static brand configuration done once outside the seed script.
- Homepage/storefront content (`content/home`) — treated as static brand content done once outside the seed script.
- Template file parsing — no external template files are required.
- Firestore security rules.
- Admin user provisioning.
- Destructive reset of collections.
- Media upload/import workflows.

## Source Of Truth

### Products

Use the current storefront mock catalog and product detail data in the web app as the sole seed source for Firestore `products/{slug}` documents.

- Source file: `apps/web/lib/storefront-data.ts`
- Product card array: `products: ProductCard[]` — 6 product card records
- Product detail map: `productDetails: Record<string, ProductDetail>` — currently 1 full detail record (`iphone-15`)

Reasoning:

- The app already depends on these product structures.
- This minimizes transformation risk and gives immediate parity with the current storefront.
- No external template files are required or parsed.

### Categories

Seed a `categories` collection using the canonical category slugs used by the shop filter UI.

Categories to seed in v1 (matching `shop-page-client.tsx` hardcoded filter array):

| slug | name |
|---|---|
| smartphones | Smartphones |
| tablets | Tablets |
| laptops | Laptops |
| wearables | Wearables |

These four are seeded as `categories/{slug}` documents with deterministic ordering (`order: 1` through `order: 4`).

### Orders

Do not seed orders in v1. The `orders` collection is created naturally by real checkout submissions.

## Recommended Approach

Implement a Node/TypeScript seed script inside the web app workspace that uses a dedicated seed-only Firebase Admin initializer and writes directly to Firestore.

This is preferred over Firebase CLI import/export or an admin-only runtime endpoint because:

- it is easier to keep typed and deterministic,
- it transforms one source format (mock catalog) into a predictable Firestore shape,
- it is safe to rerun with upsert semantics,
- it fits the current monorepo and environment model.

## Data Model Targets

The script will upsert the following Firestore targets:

- `products/{slug}` using `ProductDoc`
- `categories/{slug}` using `CategoryDoc` (a new minimal type added to `schemas.ts`)

Collections/documents outside those targets are left untouched.

### CategoryDoc

Add a `CategoryDoc` type to `apps/web/lib/schemas.ts`:

```ts
export interface CategoryDoc {
  slug: string;
  name: string;
  order: number;
}
```

Firestore path: `categories/{slug}`

## Idempotency Model

The workflow must be rerunnable and non-destructive.

Seed ownership contract:

- The source-of-truth seed manifest for products is the current set of mock product slugs from `storefront-data.ts`.
- The source-of-truth seed manifest for categories is the four canonical slugs defined in this spec.
- Documents in those manifests are considered seed-owned.
- Documents outside those manifests are not seed-owned and must be left untouched.

Behavior:

- If a seeded document already exists, overwrite only the known seeded document with the newly generated payload.
- If a seeded document does not exist, create it.
- Do not enumerate and delete other documents in the same collection.
- Do not touch `orders`, `admins`, `settings`, or `content`.

This ensures the script can be used on a fresh project and on an existing project without erasing unrelated data.

## Script Responsibilities

The seed entrypoint should:

1. Validate required Firebase Admin environment variables.
2. Load source data from storefront mock modules.
3. Normalize source data into Firestore schema shapes.
4. Upsert documents with stable IDs and predictable paths.
5. Print a summary of what was written.
6. Support a dry-run mode for inspection without writes.

Authentication contract for v1:

- The seeding script requires the split Firebase Admin service-account env vars.
- The script must not rely on the app runtime fallback path in `firebase-admin.ts`.
- ADC is out of scope for v1.
- The script must log the resolved Firebase project ID and auth mode before any write attempt.
- The implementation uses a dedicated seed-only initializer that hard-fails when required split service-account env vars are missing.

## Proposed File Structure

The implementation should introduce focused files rather than one large script.

- `apps/web/scripts/seed-firestore.ts`
  Main CLI entrypoint. Orchestrates validation, loading, mapping, writing, and reporting.

- `apps/web/scripts/lib/seed/firebase-admin-seed.ts`
  Dedicated admin initializer for the seed script. Unlike the app runtime initializer, this file requires split service-account env vars and never falls back to public project configuration.

- `apps/web/scripts/lib/seed/options.ts`
  Parse CLI flags such as `--dry-run`.

- `apps/web/scripts/lib/seed/mappers.ts`
  Convert raw source data into `ProductDoc` and `CategoryDoc` payloads.

- `apps/web/scripts/lib/seed/write.ts`
  Encapsulate Firestore upsert behavior (read-then-set for `createdAt` preservation).

- `apps/web/scripts/lib/seed/report.ts`
  Print dry-run and write summaries.

- `apps/web/lib/schemas.ts`
  Add `CategoryDoc` type (minimal addition to existing file).

Path resolution contract for v1:

- The canonical command owner is `apps/web/package.json`.
- The canonical invocation from the monorepo root is `npm --workspace web run seed:firestore`.
- The first implementation adds `tsx` as a dev dependency so the command runs directly in TypeScript without a build step.

## Seed Content Mapping

### Products

For each mock product card in `storefront-data.ts`, create one `ProductDoc` using the product slug as the Firestore document ID.

If a matching detailed record exists in `productDetails`, use it as the primary source for detail-heavy fields.

If a matching detailed record does not exist, apply the following deterministic defaults so the full catalog remains seedable in v1:

- `rating`: `0`
- `reviewCount`: `0`
- `colors`: `[]`
- `storageOptions`: `[]`
- `inStock`: `true`
- `images`: one-element array derived from the card image and alt text
- `specs`: `[]`
- `installment`: `null`
- `relatedSlugs`: `[]`
- `featured`: `false`
- `badge`: keep card badge if present
- `category`: infer from subtitle — headphone/audio products map to `wearables`; all others default to `smartphones`
- `createdAt`: preserve existing Firestore `createdAt` on reruns when the document exists; otherwise set on first seed
- `updatedAt`: set to the current seed-run timestamp on every successful upsert

Additional deterministic mapping rules:

- `relatedSlugs`: when a detail record exists, map `relatedProducts` to their slugs in source order; if missing, use `[]`
- `featured`: `true` only for products in `products.slice(0, 4)`, otherwise `false`
- `subtitle`, `image`, and `imageAlt` always come from the card source even when a detail record exists

Ownership rule for products:

- The script uses full-document replacement (`set` without merge) for each seed-owned document.
- Manual edits to a seeded product document are intentionally replaced on rerun.
- Unknown product documents not created by the seed script remain untouched.

### Categories

For each canonical category entry, create one `CategoryDoc` using the slug as the Firestore document ID.

| order | slug | name |
|---|---|---|
| 1 | smartphones | Smartphones |
| 2 | tablets | Tablets |
| 3 | laptops | Laptops |
| 4 | wearables | Wearables |

Upsert rule: full replacement on every run. `CategoryDoc` has no time-based fields.

## Operational UX

Commands:

- `npm run seed:firestore` — real write run
- `npm run seed:firestore -- --dry-run` — inspection run with no writes

The script must log:

- target Firebase project ID,
- resolved auth mode (`service-account-env`),
- dry-run vs write mode,
- number of products prepared,
- number of categories prepared,
- final success/failure summary.

The script must print the complete touched-path summary:

- a sorted list of `{ path, operation }` entries where `operation` is one of `create` or `replace`.

Runtime command contract for v1:

- `apps/web/package.json` exposes `seed:firestore` backed by `tsx scripts/seed-firestore.ts`
- supported flags in v1: `--dry-run`
- the command must work from a clean checkout when run as `npm --workspace web run seed:firestore`

## Error Handling

The script must fail fast when:

- required Firebase Admin env vars are missing,
- required product fields such as slug or name are invalid or missing from the mock source,
- Firestore write operations return an error.

The script must not silently swallow write failures.

For dry-run mode, validation must still be strict so invalid seed data is caught before any real execution.

Exact product upsert algorithm for v1:

1. Compute the seed-owned product slug set from the current mock `products` array.
2. For each slug, read the existing Firestore doc at `products/{slug}`.
3. If the doc exists and `createdAt` is a valid ISO string, preserve it.
4. Otherwise, set `createdAt` to the current seed-run timestamp string.
5. Always set `updatedAt` to the current seed-run timestamp string.
6. Build the full `ProductDoc` payload.
7. Write with full replacement (`set` without merge).

Category upsert algorithm for v1:

- Write each `CategoryDoc` with full replacement on every successful real run.

## Verification Requirements

Before considering implementation complete, verify:

- TypeScript passes for the app workspace.
- Dry run succeeds and prints the expected summary without errors.
- Real seed run succeeds against the configured Firebase project.
- A second real seed run succeeds without deletes or count drift.
- A read-back check confirms:
  - all 6 seeded product slugs exist under `products/{slug}`,
  - all 4 seeded category slugs exist under `categories/{slug}`.
- The touched-path summary for seeded paths is identical between the first and second run (same paths, `replace` operations after first run).

## Future Extensions

This design should leave room for:

- seeding brands as a separate collection,
- optional admin seeding by UID,
- Firestore rules deployment and validation,
- image migration/storage upload workflows,
- partial seed scopes such as `--only=products`,
- making shop-page-client.tsx data-driven from `categories` collection.

## Final Decision Summary

- Seed source for products: existing storefront mock catalog only.
- Seed source for categories: four canonical slugs defined in this spec.
- Store settings and homepage content: static, out of scope for seed script.
- Orders: do not seed.
- Admin users: do not seed in v1.
- Rerun behavior: idempotent upsert only, no destructive reset.
- Delivery model: local TypeScript seed script in the web workspace.
- Auth mode: split Firebase Admin service-account env vars only in v1.
