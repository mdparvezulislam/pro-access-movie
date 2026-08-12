import postgres from "postgres";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function applyMigration() {
  const dbUrl = process.env.DATABASE_URL || process.argv[2];

  if (!dbUrl) {
    console.error("❌ DATABASE_URL missing! Pass connection string as argument or set DATABASE_URL in .env.local.");
    console.error("Example: pnpm exec tsx scripts/apply-migration-direct.ts 'postgres://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres'");
    process.exit(1);
  }

  console.log("Connecting to PostgreSQL database...");
  const sql = postgres(dbUrl, { ssl: "require" });

  try {
    const migrationPath = path.resolve(process.cwd(), "supabase/migrations/022_import_system_repair.sql");
    const migrationSql = fs.readFileSync(migrationPath, "utf-8");

    console.log("Applying migration 022_import_system_repair.sql...");
    await sql.unsafe(migrationSql);
    console.log("✅ Migration applied successfully!");

    // Verify tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    console.log("\nExisting Tables in public schema:");
    tables.forEach((t) => console.log(`  - public.${t.table_name}`));

    await sql.end();
  } catch (err: unknown) {
    console.error("❌ Migration failed:", err instanceof Error ? err.message : err);
    await sql.end();
    process.exit(1);
  }
}

applyMigration();
