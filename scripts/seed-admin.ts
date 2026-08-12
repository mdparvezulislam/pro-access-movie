import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

// Load local environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes("placeholder")) {
  console.error("❌ Error: Valid SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local to seed admin account.");
  process.exit(1);
}

const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@flex.bd";
const adminPassword = process.env.ADMIN_SEED_PASSWORD || "FlexAdmin123!";

async function seedAdmin() {
  console.log(`🚀 Initializing admin seed script for: ${adminEmail}...`);

  const supabase = createClient(supabaseUrl!, serviceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // 1. Create or retrieve admin user in auth.users
  const { data: userData, error: createError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      display_name: "FLEX Super Admin",
      language_preference: "en",
    },
  });

  let userId: string | undefined = userData?.user?.id;

  if (createError) {
    if (createError.message.includes("already been registered")) {
      console.log("ℹ️ Admin email already registered in auth.users. Fetching user ID...");
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        throw new Error(`Failed to list users: ${listError.message}`);
      }
      const existingUser = usersData.users.find((u) => u.email === adminEmail);
      userId = existingUser?.id;
    } else {
      throw new Error(`Failed to create admin user: ${createError.message}`);
    }
  }

  if (!userId) {
    throw new Error("Could not determine admin user ID.");
  }

  console.log(`✅ Admin User ID: ${userId}`);

  // 2. Insert or update admin profile & role in public.profiles and public.user_roles
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      display_name: "PRO ACCESS Admin",
      role: "admin",
      language_preference: "en",
      theme_preference: "dark",
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

  if (profileError) {
    console.error(`⚠️ Profile update notice: ${profileError.message}`);
  }

  const { error: roleError } = await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

  if (roleError) {
    console.error(`❌ Failed to grant admin role in user_roles: ${roleError.message}`);
    process.exit(1);
  }

  console.log(`🎉 Admin account successfully assigned admin role!`);
  console.log(`   User ID: ${userId}`);
  console.log(`   Role: admin (public.profiles & public.user_roles)`);
}

seedAdmin().catch((err) => {
  console.error("❌ Seed script failed:", err);
  process.exit(1);
});
