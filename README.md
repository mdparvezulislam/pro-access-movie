# PRO ACCESS MOVIE — Streaming Platform Architecture & Guidelines

**PRO ACCESS MOVIE** is a high-performance, Bangladesh-focused premium movie and TV streaming platform built with **Next.js 16.3 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Supabase**, and **OpenRouter AI**.

## Tech Stack
- **Framework**: Next.js 16.3 (App Router)
- **UI Engine**: React 19 + Tailwind CSS v4 + Framer Motion
- **Icons & Typography**: Lucide React, Inter & Hind Siliguri fonts
- **Database & Auth**: Supabase (PostgreSQL, Supabase Auth, Storage)
- **AI Gateway**: OpenRouter (Server-side LLM Abstraction)

## Project Structure
- `src/app`: App router routes (Public app & Admin Studio)
- `src/components`: Reusable UI components, design tokens, layout shells, and primitives
- `src/features`: Domain logic (Auth, User History, Watchlist, Media, Admin Actions)
- `src/lib`: Core services (Supabase server/browser/admin clients, OpenRouter gateway, Ad Engine, Env validation)
- `supabase`: Database migrations, seed data, and schema definitions

## Development Scripts
- `pnpm dev`: Start Next.js development server
- `pnpm build`: Build production bundle
- `pnpm typecheck`: Run TypeScript type checking
- `pnpm lint`: Run ESLint rules validation
- `pnpm test`: Execute Vitest unit test suite
