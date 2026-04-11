# SHUGARMAN iSTORE

A full-stack phone store with a Next.js 16 storefront, Firebase backend, and a built-in admin panel. Supports PWA (installable), Cloudinary image uploads, and real-time Firestore data.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack) — monorepo via Turborepo
- **Backend**: Firebase (Auth, Firestore, Admin SDK)
- **Styling**: Tailwind CSS v4, shadcn/ui, Framer Motion
- **State**: Zustand + TanStack Query
- **Images**: Cloudinary
- **PWA**: Serwist (service worker + web manifest)
- **Node**: ≥ 20, package manager: npm 11

## Getting Started

**1. Install dependencies**

```bash
npm install
```

**2. Set up environment variables**

Create `apps/web/.env.local`:

```env
# Firebase client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**3. Seed the database**

```bash
npm run seed:firestore
```

**4. Create the first admin user**

```bash
npm run admin:create -- --email "admin@example.com" --password "your-password" --display-name "Admin Name"
```

**5. Run the dev server**

```bash
npm run dev
```

The storefront runs at `http://localhost:3000`. Admin panel is at `/admin`.

## Scripts (run from monorepo root)

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | Run ESLint |
| `npm run seed:firestore` | Seed products & categories into Firestore |
| `npm run admin:create` | Create/update admin user in Firebase Auth + Firestore |
| `npm run admin:rotate-password` | Update admin password in Firebase Auth |

All root scripts forward to the `web` workspace automatically.

### Script options

```bash
# Seed dry run (no writes)
npm run seed:firestore -- --dry-run

# Admin create with custom email
npm run admin:create -- --email "admin@example.com" --password "secret"

# Rotate password
npm run admin:rotate-password -- --password "new-password"
```

## PWA

The app is installable as a PWA. The service worker is **disabled in development** and generated only on production build:

```bash
npm run build && npm run start
```

## Project Structure

```
shugarman/
├── apps/
│   └── web/               # Next.js application
│       ├── app/           # App Router (pages, layouts, API routes)
│       ├── components/    # UI components (admin/, shared/, etc.)
│       ├── lib/           # Firebase, actions, utilities
│       ├── public/        # Static assets & PWA icons
│       └── scripts/       # Firestore seed & admin CLI scripts
└── packages/
    ├── ui/                # Shared component library
    ├── eslint-config/     # Shared ESLint config
    └── typescript-config/ # Shared TypeScript config
```

They also depend on the client Firebase config already present in the same file for normal app login flows.

## Login Flow After Bootstrap

1. Run the admin bootstrap command once.
2. Open the admin login page in the app.
3. Sign in with the same email and password you created.
4. The app verifies both Firebase Auth and the Firestore `admins/{uid}` document before creating the admin session.
