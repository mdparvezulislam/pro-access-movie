import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

console.log("Environment Keys Present:");
Object.keys(process.env).forEach((k) => {
  if (k.includes("SUPABASE") || k.includes("DB") || k.includes("POSTGRES") || k.includes("URL") || k.includes("KEY") || k.includes("PASS")) {
    console.log(`- ${k}: [length ${process.env[k]?.length}]`);
  }
});
