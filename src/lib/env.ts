import { z } from "zod";

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required for server operations"),
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY is required for server AI gateway"),
  OPENROUTER_MODEL: z.string().default("anthropic/claude-3.5-sonnet"),
  OPENROUTER_BASE_URL: z.string().url().default("https://openrouter.ai/api/v1"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  NEXT_PUBLIC_APP_NAME: z.string().default("PRO ACCESS MOVIE"),
});

/**
 * Environment variable access helper ensuring strict boundary separation
 * between public browser-safe variables and private server secrets.
 */
function getEnv() {
  const isServer = typeof window === "undefined";

  const publicEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://placeholder-project.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder.anon_key",
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "PRO ACCESS MOVIE",
  };

  const parsedPublic = clientSchema.safeParse(publicEnv);
  if (!parsedPublic.success) {
    console.error("Invalid public environment variables:", parsedPublic.error.flatten().fieldErrors);
    throw new Error("Invalid public environment variables");
  }

  if (!isServer) {
    return {
      ...parsedPublic.data,
      SUPABASE_URL: parsedPublic.data.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: parsedPublic.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: undefined,
      OPENROUTER_API_KEY: undefined,
      OPENROUTER_MODEL: undefined,
      OPENROUTER_BASE_URL: undefined,
    };
  }

  const serverEnv = {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder.service_role_key",
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || "sk-or-v1-placeholder-key",
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet",
    OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  };

  const parsedServer = serverSchema.safeParse(serverEnv);
  if (!parsedServer.success) {
    console.error("Invalid server environment variables:", parsedServer.error.flatten().fieldErrors);
    throw new Error("Invalid server environment variables");
  }

  return {
    ...parsedPublic.data,
    ...parsedServer.data,
    SUPABASE_URL: parsedPublic.data.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: parsedPublic.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export const env = getEnv();
