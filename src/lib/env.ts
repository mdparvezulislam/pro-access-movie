import { z } from "zod";

export const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required for server operations"),
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY is required for server AI gateway"),
  OPENROUTER_MODEL: z.string().default("anthropic/claude-3.5-sonnet"),
  OPENROUTER_BASE_URL: z.string().url().default("https://openrouter.ai/api/v1"),
});

export const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  NEXT_PUBLIC_APP_NAME: z.string().default("PRO ACCESS MOVIE"),
});

/**
 * Environment variable access helper ensuring strict boundary separation
 * between public browser-safe variables and private server secrets.
 */
export const env = {
  get NEXT_PUBLIC_SUPABASE_URL() {
    return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://bhgxjdfnnzthsnzzhssj.supabase.co";
  },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test_anon_key";
  },
  get NEXT_PUBLIC_APP_NAME() {
    return process.env.NEXT_PUBLIC_APP_NAME || "PRO ACCESS MOVIE";
  },
  get SUPABASE_SERVICE_ROLE_KEY() {
    return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  },
  get OPENROUTER_API_KEY() {
    return process.env.OPENROUTER_API_KEY || "";
  },
  get OPENROUTER_MODEL() {
    return process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet";
  },
  get OPENROUTER_BASE_URL() {
    return process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
  },
  get SUPABASE_URL() {
    return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://bhgxjdfnnzthsnzzhssj.supabase.co";
  },
  get SUPABASE_ANON_KEY() {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || "";
  },
};
