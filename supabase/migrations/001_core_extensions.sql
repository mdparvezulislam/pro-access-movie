-- Migration: 001_core_extensions.sql
-- Enables foundational PostgreSQL extensions required for UUID generation, cryptography, and text search.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA extensions;
