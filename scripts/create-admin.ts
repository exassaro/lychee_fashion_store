/**
 * Creates (or promotes) an admin user.
 *   npm run create-admin -- owner@example.com "a-strong-password"
 * If the user already exists, only the admins row is added (password unchanged).
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/supabase/database.types";

const [email, password] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
if (!email) {
  console.error('Usage: npm run create-admin -- <email> "<password>"');
  process.exit(1);
}

const supabase = createClient<Database>(url, serviceKey, { auth: { persistSession: false } });

async function findUserByEmail(target: string) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === target.toLowerCase());
    if (match) return match;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function main() {
  let user = await findUserByEmail(email);

  if (!user) {
    if (!password || password.length < 8) {
      console.error("New user: provide a password of at least 8 characters.");
      process.exit(1);
    }
    const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) throw error;
    user = data.user;
    console.log(`✓ Created auth user ${email}`);
  } else {
    console.log(`• Auth user ${email} already exists`);
  }

  const { error } = await supabase.from("admins").upsert({ user_id: user.id, email: user.email ?? email });
  if (error) throw error;
  console.log(`✓ ${email} is now an admin. Sign in at /admin/login`);
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
