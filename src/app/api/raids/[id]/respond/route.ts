import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { respondToRaidAs } from "@/lib/raid-response";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { status } = (await request.json().catch(() => ({}))) as { status?: string };
  if (status !== "confirmed" && status !== "absent") {
    return NextResponse.json({ error: "Respuesta inválida" }, { status: 400 });
  }

  const { error } = await respondToRaidAs(supabase, user.id, id, status);
  if (error) return NextResponse.json({ error }, { status: 400 });

  revalidatePath(`/raids/${id}`);
  return NextResponse.json({ ok: true });
}
