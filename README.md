# FLEX — Streaming Platform Architecture & Guidelines

FLEX is a high-performance streaming platform built with **Next.js 16.3 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Supabase**, and **OpenRouter AI**.

---

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run quality checks & verification
pnpm lint        # ESLint check
pnpm typecheck   # TypeScript strict verification
pnpm test        # Vitest smoke test suite
pnpm build       # Production bundle build
```

---

## 🛠 Architectural Conventions

1. **Strict TypeScript**:
   - `noImplicitAny` and strict null checks enforced.
   - `any` is strictly prohibited unless accompanied by an explicit inline comment justification.

2. **Server Components First**:
   - All pages and components default to React Server Components (RSC).
   - Use `"use client"` sparingly—only for interactive elements (event handlers, state hooks).
   - Keep page roots as pure Server Components.

3. **Feature Modularization (`src/features/*`)**:
   - Domain logic belongs inside `src/features/<feature>/lib/`.
   - Feature folders contain self-contained `components/`, `hooks/`, and `lib/`.
   - Route handlers and server actions must remain thin and delegate to feature libraries.

4. **Content State Machine**:
   - Content records transition strictly through: `draft` → `review` → `published` → `archived`.
   - Public components and RLS policies **MUST NEVER** read `draft` or `archived` items.

5. **Input Validation**:
   - All Server Actions, API routes, and forms must validate inputs using **Zod** schemas from `src/lib/validation/` or `src/features/*/lib/`.

6. **Environment Boundary Protection**:
   - `OPENROUTER_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are strictly server-only.
   - Only `NEXT_PUBLIC_` prefixed variables may be accessed on the client.
   - Env variables are validated at runtime via `src/lib/env.ts`.

7. **Database & Security**:
   - RLS (Row Level Security) is the primary security boundary.
   - Browser clients only execute queries allowed by Supabase RLS policies.

8. **UI & Iconography**:
   - Component primitives reside in `@/components/ui/` (shadcn).
   - Iconography is restricted to **Lucide React** (`lucide-react`) exclusively.
   - Framer Motion is reserved for functional state transitions and focus feedback only.

---

## 📂 Project Structure

```
src/
├── app/            — App Router layout, pages, and route handlers
├── components/
│   ├── ui/         — shadcn primitive UI components
│   └── common/     — Shared layout primitives (Navbar, Hero, ContentRail, Footer)
├── features/       — Feature domains (auth, content, playback, ads, user, admin)
├── lib/
│   ├── ai/         — OpenRouter gateway configuration
│   ├── supabase/   — Browser and Server client factories
│   ├── validation/ — Zod validation schemas
│   └── env.ts      — Runtime environment validator
└── types/          — Shared domain types and lifecycle state enums
supabase/           — DB migrations directory & environment reference
```
