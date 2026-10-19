import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SEED = {
  password: "openlove-dev",
  emails: {
    a: "partner_a@example.com",
    b: "partner_b@example.com",
    stranger: "stranger@example.com",
  },
  startDate: "2020-02-14",
} as const;

export function localAdmin(
  url = process.env.SUPABASE_URL ?? "",
  key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
): SupabaseClient {
  const host = URL.canParse(url) ? new URL(url).hostname : "";
  if (host !== "127.0.0.1" && host !== "localhost")
    throw new Error(`Service role refused: SUPABASE_URL must be local, got "${host}"`);
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function ensureUser(admin: SupabaseClient, email: string): Promise<string> {
  const created = await admin.auth.admin.createUser({
    email,
    password: SEED.password,
    email_confirm: true,
  });
  if (created.data.user) return created.data.user.id;
  // shortcut: first page only (50 users), enough for a local dev DB
  const { data, error } = await admin.auth.admin.listUsers();
  const id = data.users.find((u) => u.email === email)?.id;
  if (!id) throw error ?? created.error ?? new Error(`cannot create ${email}`);
  return id;
}

export async function seed(admin: SupabaseClient): Promise<{ coupleId: string }> {
  const a = await ensureUser(admin, SEED.emails.a);
  const b = await ensureUser(admin, SEED.emails.b);
  await ensureUser(admin, SEED.emails.stranger);

  const existing = await admin.from("couple_members").select("couple_id").eq("user_id", a);
  if (existing.error) throw existing.error;
  let coupleId: string | undefined = existing.data[0]?.couple_id;
  if (!coupleId) {
    const couple = await admin
      .from("couples")
      .insert({ start_date: SEED.startDate })
      .select("id")
      .single();
    if (couple.error) throw couple.error;
    coupleId = couple.data.id as string;
  }
  const members = await admin.from("couple_members").upsert([
    { user_id: a, couple_id: coupleId, role: "partner_a" },
    { user_id: b, couple_id: coupleId, role: "partner_b" },
  ]);
  if (members.error) throw members.error;
  return { coupleId };
}

if (process.argv[1] === import.meta.filename) {
  const { coupleId } = await seed(localAdmin());
  console.log(`Seeded couple ${coupleId}; password for all accounts: ${SEED.password}`);
}
