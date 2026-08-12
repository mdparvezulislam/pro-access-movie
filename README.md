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
pnpm db:seed                      # Reset DB & load seed catalog

# Admin Seeding & Media Utilities
pnpm seed:admin                   # Seeds admin@flex.bd with admin role
pnpm media:cleanup                # Audit storage buckets for orphaned media

# Run development server
pnpm dev

# Run quality checks & verification
pnpm lint        # ESLint check
pnpm typecheck   # TypeScript strict verification
pnpm test        # Vitest smoke test suite
pnpm build       # Production bundle build
```

---

## 🖼 Media & Storage Architecture (Phase 03)

1. **Private Storage Buckets**:
   - `flex-posters`: Poster images (max 8MB, MIME: JPEG/PNG/WEBP).
   - `flex-backdrops`: Hero backdrop artwork (max 8MB, MIME: JPEG/PNG/WEBP).
   - `flex-people`: Cast & crew headshots (max 8MB, MIME: JPEG/PNG/WEBP).
   - `flex-trailers`: Content trailers (max 500MB, MIME: MP4/WebM).
   - All buckets are private (`public = false`); objects delivered strictly via server-side signed URLs.

2. **Server-Side Upload Route Handler (`POST /api/media/upload`)**:
   - Requires admin authentication (`requireAdminAuth()`).
   - Validates MIME types, maximum file size, and content polymorphic references (`movie_id`, `series_id`, `person_id`).
   - Stores metadata in `public.media_files` tracking table (`bucket`, `path`, `mime_type`, `size_bytes`, `status`).

3. **Signed URL Delivery & Fallbacks**:
   - `getSignedMediaUrl(path, bucket)` generates temporary signed URLs.
   - Gracefully returns neutral fallback placeholder images when media is unassigned or missing, preventing page render crashes.

---

## 🔐 Auth & Security Infrastructure

1. **Role System**:
   - Roles stored in `public.user_roles` (`admin`, `moderator`).
   - `public.is_admin(user_id)` SECURITY DEFINER helper function.

2. **Middleware Route Protection (`src/middleware.ts`)**:
   - Intercepts all `/admin/**` requests.
   - Verifies active session & admin role server-side.

---

## 📂 Project Structure

```
src/
├── app/                  — App Router layout, pages, and API routes (/api/media/upload)
├── components/
│   ├── admin/            — ImageUploader and MediaGallery components
│   ├── ui/               — Primitive shadcn components
│   └── common/           — Navbar, HeroBanner, ContentRail, Footer
├── features/             — Modular feature domains (auth, content, admin)
├── lib/
│   ├── content/          — Server-side content services with resolved media URLs
│   ├── media/            — Storage services, signed URL generation, and upload logic
│   └── supabase/         — Browser & Server client factories
scripts/
├── seed-admin.ts         — Admin seeding CLI script (pnpm seed:admin)
└── cleanup-media.ts      — Storage orphan audit script (pnpm media:cleanup)
```
