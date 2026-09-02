import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createSupabaseAuthClient } from "@/lib/auth/supabase-client";
import { getDb } from "@/lib/db/client";
import { createCurrentUserRepository } from "@/lib/db/auth-repositories";
import { BackedLogo } from "@/components/brand/BackedLogo";
import { Arrow } from "@/components/icons/Arrow";
import Link from "next/link";

export const metadata: Metadata = { title: "You | BACKED", robots: { index: false, follow: false } };

export default async function MePage() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) redirect("/login");

  const token = (await cookies()).get("backed_session")?.value ?? null;
  const user = process.env.DATABASE_URL
    ? await getCurrentUser(token, { auth: createSupabaseAuthClient(url, anonKey), users: createCurrentUserRepository(getDb()) })
    : await getCurrentUser(token, { auth: createSupabaseAuthClient(url, anonKey), users: { findByAuthUserId: async () => null } });

  if (!user) redirect("/login");

  return (
    <main className="mePage">
      <header><BackedLogo /><span>{user.email?.toUpperCase()}</span></header>
      <section className="meHero">
        <p className="eyebrow">SIGNED IN</p>
        <h1>{user.displayName.toUpperCase()}<span>.</span></h1>
        <p>This is the start of your profile — Promises you’ve made, Backs you’ve put behind others, all in one place. That part’s still being built.</p>
        <div className="meActions">
          <Link className="button primary" href="/promise">MAKE A PROMISE <Arrow direction="ne" /></Link>
          <Link className="button" href="/back">BACK SOMEONE <Arrow direction="ne" /></Link>
        </div>
      </section>
    </main>
  );
}
