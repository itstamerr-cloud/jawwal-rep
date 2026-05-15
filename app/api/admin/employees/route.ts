import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("employees").select("id, name, is_active, created_at").order("name");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(request: Request) {
  const { name } = await request.json();
  if (!name?.trim()) return Response.json({ error: "الاسم مطلوب" }, { status: 400 });
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("employees").insert({ name: name.trim() }).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
