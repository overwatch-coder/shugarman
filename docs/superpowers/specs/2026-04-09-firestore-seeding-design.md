# Firestore Seeding Design

## Goal

Create a repeatable Firestore provisioning and seeding workflow for Sugar Man iStore that can be run any time a Firebase project is changed or a new database needs baseline data. The workflow must upsert, not reset, and must use brand-owned template files for store/settings/content while using the current storefront mock catalog as the product source.

## Scope

This design covers:

- A rerunnable local script for Firestore setup and seed upserts.
- Upserting products, store settings, and storefront home content.
- Leaving orders empty.
- Leaving admin-user creation out of v1.
- Reusing existing Firebase Admin credentials and TypeScript schema types.

This design does not cover:

- Firestore security rules.
- Admin user provisioning.
- Destructive reset of collections.
- Media upload/import workflows.
- Migrating all storefront mock helpers to Firestore-backed storage in the same change.

## Source Of Truth

### Products

Use the current storefront mock catalog and product detail data in the web app as the seed source for Firestore `products/{slug}` documents.

Reasoning:

- The app already depends on these product structures.
- The brand template files do not contain a full catalog.
- This minimizes transformation risk and gives immediate parity with the current storefront.

### Store Settings And Brand Content

Use brand-owned content from the repository templates as the primary source for store identity and storefront content, especially:

- `templates/Shugarman iStore Listing.md`
- `templates/sugar_man_istore_detailed_prd.html`
- `templates/sugar_man_kinetic/DESIGN.md`

These sources provide business identity, contact details, services, hours, tone, and homepage/content direction.

### Orders

Do not seed orders in v1. The `orders` collection should be created naturally by real checkout submissions.

## Recommended Approach

Implement a Node/TypeScript seed script inside the web app workspace that runs with the existing Firebase Admin configuration and writes directly to Firestore.

This is preferred over Firebase CLI import/export or an admin-only runtime endpoint because:

- it is easier to keep typed and deterministic,
- it can transform multiple source formats into one Firestore shape,
- it is safe to rerun with upsert semantics,
- it fits the current monorepo and environment model.

## Data Model Targets

The script will upsert the following Firestore targets:

- `products/{slug}` using `ProductDoc`
- `settings/store` using `StoreSettingsDoc`
- `content/home` using `HomeContentDoc`

Collections/documents outside those targets are left untouched.

## Idempotency Model

The workflow must be rerunnable and non-destructive.

Behavior:

- If a seeded document already exists, overwrite only the known seeded document with the newly generated payload.
- If a seeded document does not exist, create it.
- Do not enumerate and delete other documents in the same collection.
- Do not touch `orders` or `admins`.

This ensures the script can be used on a fresh project and on an existing project without erasing unrelated data.

## Script Responsibilities

The seed entrypoint should:

1. Validate required Firebase Admin environment variables.
2. Load source data from templates and storefront mock modules.
3. Normalize source data into Firestore schema shapes.
4. Upsert documents with stable IDs and predictable paths.
5. Print a summary of what was written.
6. Support a dry-run mode for inspection without writes.

## Proposed File Structure

The implementation should introduce focused files rather than one large script.

- `apps/web/scripts/seed-firestore.ts`
  Main CLI entrypoint.

- `apps/web/scripts/lib/seed/options.ts`
  Parse CLI flags such as `--dry-run`.

- `apps/web/scripts/lib/seed/sources.ts`
  Load brand template data and current storefront mock sources.

- `apps/web/scripts/lib/seed/mappers.ts`
  Convert raw source data into `ProductDoc`, `StoreSettingsDoc`, and `HomeContentDoc` payloads.

- `apps/web/scripts/lib/seed/write.ts`
  Encapsulate Firestore upsert behavior and batched writes.

- `apps/web/scripts/lib/seed/report.ts`
  Print dry-run and write summaries.

If existing repo conventions favor fewer files, this can be compressed slightly, but the boundaries should remain the same.

## Seed Content Mapping

### Products

For each mock product/product detail pair:

- Use product slug as Firestore document ID.
- Populate storefront-facing fields already used by the DAL.
- Preserve images, rating, review count, specs, installment info, color options, and related product links where available.
- Fill timestamps deterministically at seed time.

### Store Settings

Map brand identity and business listing data into `settings/store`:

- name
- tagline
- description
- phone
- whatsapp
- email
- address
- city
- region
- country
- hours
- social

Template data wins where present. Existing placeholder/mock values should only be used as fallback when the templates do not provide a value.

### Home Content

Map template-guided content into `content/home`:

- hero messaging from the PRD
- category tiles based on the storefront architecture and current home sections
- trust points based on the PRD/business listing selling points and store promises

The first version should prioritize a valid, typed `HomeContentDoc` that aligns with the current UI and DAL expectations, not a perfect CMS model.

## Operational UX

Add an npm script that can be run anytime, for example:

- `npm run seed:firestore`

Optional flags:

- `npm run seed:firestore -- --dry-run`

The script should log:

- target Firebase project ID,
- dry-run vs write mode,
- number of products prepared,
- whether settings/store will be written,
- whether content/home will be written,
- final success/failure summary.

## Error Handling

The script must fail fast when:

- required Firebase Admin env vars are missing,
- template parsing fails,
- required product fields such as slug or name are invalid,
- Firestore write operations return an error.

The script must not silently swallow write failures.

For dry-run mode, validation should still be strict so invalid seed data is caught before any real execution.

## Testing Strategy

Implementation should follow TDD where practical for pure transformations.

Priority coverage:

- mapper tests for template-to-settings conversion,
- mapper tests for mock catalog to `ProductDoc`,
- validation tests for missing required env vars,
- dry-run tests that confirm no writes are attempted,
- narrow integration verification by running the script against the configured Firebase project.

Because the repo does not currently expose an established test harness for scripts, the first implementation may use targeted script-level assertions and focused TypeScript validation, but transformation logic should still be kept pure enough to test directly.

## Verification Requirements

Before considering implementation complete, verify:

- TypeScript passes for the app workspace.
- Dry run succeeds and prints the expected summary.
- Real seed run succeeds against the configured Firebase project.
- A read-back check confirms at least:
  - `settings/store` exists,
  - `content/home` exists,
  - one seeded product exists under `products/{slug}`.

## Future Extensions

This design should leave room for:

- seeding brands as a separate collection,
- optional admin seeding by UID,
- additional storefront content sections,
- Firestore rules deployment and validation,
- image migration/storage upload workflows,
- partial seed scopes such as `--only=products`.

## Final Decision Summary

- Seed source for products: existing storefront mock catalog.
- Seed source for settings/content: brand template files.
- Orders: do not seed.
- Admin users: do not seed in v1.
- Rerun behavior: idempotent upsert only, no destructive reset.
- Delivery model: local TypeScript seed script in the web workspace.