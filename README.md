# Shugarman iStore Monorepo

This workspace contains the Next.js storefront app in `apps/web` plus the supporting scripts used to seed Firestore and bootstrap admin access.

## Common Commands

Run these from the monorepo root:

```bash
npm run seed:firestore
npm run admin:create -- --password "your-password"
npm run admin:rotate-password -- --password "new-password"
```

The root scripts forward to the `web` workspace so you do not need to remember the `--workspace web` prefix.

## Firestore Seed Script

Seeds catalog data into Firestore.

```bash
npm run seed:firestore
```

Dry run:

```bash
npm run seed:firestore -- --dry-run
```

Behavior:

- upserts `products/{slug}` from the storefront mock catalog
- upserts `categories/{slug}` for the shop category set
- preserves valid existing `createdAt` for seeded product docs

## Admin Bootstrap Script

Creates or updates a Firebase Auth user and upserts the matching Firestore admin document.

Default email:

```bash
npm run admin:create -- --password "your-password"
```

Custom email:

```bash
npm run admin:create -- --email "other-admin@example.com" --password "your-password"
```

Custom display name:

```bash
npm run admin:create -- --email "other-admin@example.com" --password "your-password" --display-name "Admin Name"
```

Dry run:

```bash
npm run admin:create -- --password "your-password" --dry-run
```

Default behavior:

- default email: `bellamoner98@gmail.com`
- default display name: `Bella Moner`
- Firestore role: `admin`
- Firestore path: `admins/{uid}`

## Admin Password Rotation Script

Updates the Firebase Auth password only. It does not read or write Firestore.

Default email:

```bash
npm run admin:rotate-password -- --password "new-password"
```

Custom email:

```bash
npm run admin:rotate-password -- --email "other-admin@example.com" --password "new-password"
```

Dry run:

```bash
npm run admin:rotate-password -- --password "new-password" --dry-run
```

## Environment

These scripts load `apps/web/.env.local` automatically and require the Firebase Admin env vars to be present there:

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

They also depend on the client Firebase config already present in the same file for normal app login flows.

## Login Flow After Bootstrap

1. Run the admin bootstrap command once.
2. Open the admin login page in the app.
3. Sign in with the same email and password you created.
4. The app verifies both Firebase Auth and the Firestore `admins/{uid}` document before creating the admin session.
