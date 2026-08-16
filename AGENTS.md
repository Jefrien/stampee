# AGENTS.md — Stampee

This file is a guide for AI coding agents working on the Stampee codebase. It assumes no prior knowledge of the project.

## Project overview

Stampee is a single-business digital loyalty card and stamp card application. A business owner creates campaigns (loyalty card designs), issues cards to customers, and lets staff stamp or redeem them. There is no marketplace or public multi-tenant signup for businesses — every deployment is effectively for one business, accessed from `/login`.

The codebase is a React 18 + TypeScript single-page application (SPA) built with Vite. It is designed to be self-hosted and connected to a dedicated Supabase project for authentication, Postgres database, and storage.

## Tech stack

- **Framework / runtime:** React 18.3.1, React DOM 18.3.1
- **Language:** TypeScript 5.8.2 (target ES2022, module ESNext, bundler resolution)
- **Build tool:** Vite 6.4.1 with `@vitejs/plugin-react`
- **Styling:** Tailwind CSS 3.4.19, custom CSS in `index.css`
- **UI primitives:** Radix UI (`dialog`, `dropdown-menu`, `accordion`, `switch`, `slot`)
- **Routing:** React Router DOM 6.22.3
- **Backend / data:** Supabase (Auth, Postgres, Storage, RPC functions)
- **Analytics:** Vercel Analytics
- **Icons:** `lucide-react`, custom `Burger` icon in `lib/iconRegistry.tsx`
- **QR:** `react-qr-code`, `qr-scanner`
- **Lottie:** `lottie-react`
- **Other utilities:** `clsx`, `tailwind-merge`, `class-variance-authority`, `simple-icons`

## Project structure

```
.
├── App.tsx                 # Root component: routing, SEO, auth wiring
├── index.tsx               # React root mount
├── index.html              # HTML shell with SEO meta tags
├── index.css               # Tailwind directives + custom CSS
├── types.ts                # Shared TypeScript types and interfaces
├── components/             # React components (pages + UI)
│   ├── ui/                 # Reusable Tailwind/Radix UI primitives
│   ├── *Page.tsx           # Route-level page components
│   ├── AuthProvider.tsx    # Authentication context
│   ├── RequireAuth.tsx     # Auth route guard
│   ├── RequireRole.tsx     # Role-based route guard
│   ├── Sidebar.tsx         # Dashboard navigation
│   └── ...
├── data/                   # Static data and templates
│   ├── templates.tsx       # Built-in loyalty card templates
│   ├── articles.data.js    # Article metadata for sitemap
│   └── ...
├── lib/                    # Application logic and data access
│   ├── db/                 # Supabase data access modules
│   ├── storage/            # Supabase storage helpers
│   ├── supabase.ts         # Supabase client setup
│   ├── siteConfig.ts       # Environment-derived app config
│   ├── links.ts            # URL builders
│   ├── utils.ts            # Tailwind `cn` + color helpers
│   ├── iconRegistry.tsx    # Icon registry for templates
│   └── ...
├── services/               # Small service modules (e.g. rewardService.ts)
├── scripts/                # Build-time scripts
│   ├── generate-sitemap.mjs
│   └── generate-favicon.mjs
├── supabase/               # Database schema and helpers
│   ├── migration.sql       # Canonical fresh-install schema + RPCs
│   ├── seed.sql            # Development-only demo owner seed
│   └── legacy-patches/     # Targeted upgrade/repair scripts
├── public/                 # Static assets and generated sitemap
├── vercel.json             # Vercel SPA rewrite rules
└── package.json
```

## Build and development commands

All commands use `npm`.

```bash
# Install dependencies
npm install

# Start the Vite dev server (port 3000, host 0.0.0.0)
npm run dev

# Generate public/sitemap.xml
npm run generate:sitemap

# Production build (also regenerates the sitemap)
npm run build

# Preview the production build locally
npm run preview
```

There is no automated test suite. The main verification step is `npm run build`, which type-checks and bundles the app.

## Environment variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Required:

- `VITE_APP_URL` — public app URL, e.g. `http://localhost:5173`
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key

Optional:

- `VITE_ENABLE_DEMO_WORKSPACE` — set to `true` to enable the demo workspace. In development it defaults to enabled unless explicitly set to `false`; in production it defaults to disabled.
- `VITE_SUPPORT_EMAIL` — support email displayed in the app (defaults to `hello@stampee.co`)

Do not commit `.env.local` or any file containing secrets.

## Database setup

The app expects a Supabase project initialized with the schema in `supabase/migration.sql`. This file is the canonical fresh-install script and is safe to re-run in the Supabase SQL Editor.

1. Run `supabase/migration.sql` first for a fresh install.
2. Optionally run `supabase/seed.sql` second for a local/dev demo owner account.

Demo seed credentials (development only):

| Field    | Value                |
|----------|----------------------|
| Email    | `admin@stampee.local` |
| Password | `Admin1234`          |
| Slug     | `demo`               |

The `supabase/legacy-patches/` directory contains targeted upgrade or repair scripts for older or existing projects. Do not run them on a fresh install unless a specific issue requires it.

## Key application concepts

### Users and roles

- `owner` — the business owner. Can create campaigns, manage staff, view analytics, and manage all account settings.
- `staff` — created by the owner from `Settings -> Staff`. Uses a 4–6 digit PIN to log in at the staff portal. Can stamp/redeem cards and view customers and issued cards.

### Campaigns

A campaign defines a loyalty card design: colors, icon, stamp count, reward name, background/logo images, and social links. Campaigns live in the `public.campaigns` table. The app serializes between the runtime `Template` type (which contains a React icon component) and the stored `StoredTemplate` type (which stores an `iconKey` string).

### Issued cards

When a customer receives a card, a row is created in `public.issued_cards`. The card stores a `template_snapshot` JSONB copy of the campaign design at the time of issue, so existing cards keep their look even if the campaign is later edited or deleted.

### Public access

Public card viewing, campaign signups, and staff scan entry are handled through security-definer RPC functions, not table-level read policies. Relevant RPCs include `get_public_card`, `get_scan_entry_context`, `inspect_scanned_card`, `register_public_campaign_signup`, and `get_public_campaign_signup_context`.

## Code style guidelines

- Follow the existing React + TypeScript + Tailwind patterns.
- Use the `cn()` helper from `lib/utils.ts` for conditional Tailwind class merging.
- Use the UI primitives in `components/ui/` before inventing new ones.
- Prefer explicit function components: `const ComponentName: React.FC<Props> = (...) => ...`.
- Use absolute imports with the `@/` alias (resolved to the project root).
- Match surrounding quote style (single quotes in `.ts`/`.tsx` files, double quotes in some `.tsx` components).
- No separate formatter or linter is configured; keep the style consistent with nearby code.

## Testing instructions

There is currently no test runner configured. Verify changes with:

```bash
npm run build
```

Also test the affected user flows against a Supabase project with `supabase/migration.sql` applied. The demo seed account in `supabase/seed.sql` is the fastest way to get a working local owner account.

## Security considerations

- Never commit secrets (`.env`, `.env.local`, Supabase service keys).
- Row Level Security (RLS) is enabled on all tables in `supabase/migration.sql`. Public reads go through RPC functions only.
- Staff accounts are managed through security-definer RPCs (`create_staff_account`, `update_staff_pin`, `delete_staff_account`).
- The demo workspace and `supabase/seed.sql` are for development only.
- The `VITE_ENABLE_DEMO_WORKSPACE` flag creates a known demo account; do not enable it in production.
- Campaign asset uploads are validated for file type and size, stored in the public `campaign-assets` bucket, and scoped to the authenticated user's folder (`<ownerId>/<kind>/<uuid>.<ext>`).
- The Supabase client falls back to placeholder values when environment variables are missing so the app remains renderable, but it disables session persistence and shows a service-unavailable banner.

## Deployment

You can deploy the built `dist/` folder anywhere that serves a static Vite SPA. Vercel is the documented target:

1. Add the same `VITE_...` environment variables to the deployment platform.
2. Ensure the Supabase project is initialized with `supabase/migration.sql`.
3. `vercel.json` rewrites client-side routes to `index.html`.
4. Vercel Web Analytics is optional but already instrumented in `App.tsx`.

## Important files to know

| File | Purpose |
|------|---------|
| `App.tsx` | Application routes, lazy-loaded pages, SEO manager, public wrappers |
| `components/AuthProvider.tsx` | All auth state and mutations (login, signup, staff, profile) |
| `types.ts` | Core domain types: `Template`, `StoredTemplate`, `Customer`, `IssuedCard`, `User`, etc. |
| `lib/supabase.ts` | Supabase client creation and configuration detection |
| `lib/siteConfig.ts` | App origin, support email, demo workspace flag |
| `lib/templateSerialization.ts` | Convert between runtime `Template` and stored `StoredTemplate` |
| `lib/db/*.ts` | Supabase queries and mutations grouped by domain |
| `lib/storage/campaignAssets.ts` | Logo/background image upload and cleanup |
| `supabase/migration.sql` | Full database schema, RLS policies, triggers, RPC functions |

## Notes for agents

- Before changing the database shape, update both `supabase/migration.sql` and any affected `lib/db/*.ts` modules and TypeScript types in `types.ts`.
- If you add a new public route, update `vercel.json` if needed and consider whether it needs an entry in `scripts/generate-sitemap.mjs`.
- The app uses lazy loading via `React.lazy` for all route components; keep code-split entry points in `App.tsx`.
- `useSubscription` currently reports all limits as `Infinity` and `isProTier` as `true`; this is intentional for the current beta state.
