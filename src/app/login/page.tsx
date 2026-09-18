"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  async function signInWithDiscord() {
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-neutral-950 text-neutral-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">No Way Back</h1>
        <p className="mt-2 text-neutral-400">Frostmourne · Realm First Progression</p>
      </div>
      <button
        onClick={signInWithDiscord}
        className="flex items-center gap-2 rounded-lg bg-[#5865F2] px-6 py-3 font-medium text-white transition hover:bg-[#4752c4]"
      >
        Entrar con Discord
      </button>
    </div>
  );
}
