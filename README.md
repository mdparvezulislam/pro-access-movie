# FLEX — Streaming Platform Architecture & Guidelines

FLEX is a high-performance streaming platform built with **Next.js 16.3 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Supabase**, and **OpenRouter AI**.

---

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Local Supabase Database Setup
pnpm exec supabase start         # Start local Supabase containers
pnpm exec supabase db push        # Apply all SQL migrations

# Admin Seeding (Requires local Supabase or configured .env.local)
pnpm seed:admin                   # Seeds admin@flex.bd with admin role

# Run development server
pnpm dev

# Run quality checks & verification
pnpm lint        # ESLint check
pnpm typecheck   # TypeScript strict verification
pnpm test        # Vitest smoke test suite
pnpm build       # Production bundle build
```

---

## 🔐 Auth & Security Infrastructure (Phase 01)

1. **Role System**:
   - Roles are stored in `public.user_roles` (`admin`, `moderator`).
   - `public.is_admin(user_id)` is a `SECURITY DEFINER` function checking user roles or service-role JWTs.
   - `public.make_admin(target_user_id)` is callable only by existing admins or via service-role.

2. **Middleware Route Protection (`src/middleware.ts`)**:
   - All `/admin/**` routes are intercepted server-side.
   - Requires a valid session AND `is_admin` RPC verification.
   - Unauthenticated visitors are redirected to `/login?next=/admin`.
   - Non-admin users are redirected to `/`.

3. **Row Level Security (RLS)**:
   - `public.profiles`: Readable by authenticated users; writable only by profile owners (`auth.uid() = id`).
   - `public.user_roles`: Readable by authenticated users; insert/delete restricted to admins.
   - `public.app_settings`: Key/value store readable by authenticated users; writable only by admins.

---

## 🛠 Architectural Conventions

1. **Strict TypeScript**:
   - `noImplicitAny` and strict null checks enforced.
   - `any` is strictly prohibited unless accompanied by an explicit inline comment justification.

2. **Server Components First**:
   - All pages and components default to React Server Components (RSC).
   - Use `"use client"` sparingly—only for interactive elements (event handlers, state hooks).

3. **Feature Modularization (`src/features/*`)**:
   - Domain logic belongs inside `src/features/<feature>/lib/`.
   - Feature folders contain self-contained `components/`, `hooks/`, and `lib/`.

4. **Environment Boundary Protection**:
   - `OPENROUTER_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are strictly server-only.
   - Only `NEXT_PUBLIC_` prefixed variables may be accessed on the client.
   - Env variables are validated at runtime via `src/lib/env.ts`.

---

## 📂 Project Structure

```
src/
├── app/                  — App Router layout, pages, and global error boundaries
├── components/
│   ├── ui/               — Primitive shadcn components
│   ├── common/           — App shell components (Navbar, HeroBanner, ContentRail, Footer)
│   └── providers/        — Client providers
├── features/
│   ├── auth/             — Auth Server Actions, session hooks, and role helpers
│   └── content/          — Content feature submodules
├── lib/
│   ├── ai/               — OpenRouter gateway configuration
│   ├── supabase/         — Browser and Server client factories
│   ├── validation/       — Zod validation schemas
│   └── env.ts            — Runtime environment validator
└── middleware.ts         — Route protection middleware for /admin
supabase/
├── migrations/           — Idempotent SQL migrations (001 to 005)
└── tests/                — RLS policy verification SQL scripts
```
