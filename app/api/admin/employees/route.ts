import { cookies } from "next/headers";

const SUPABASE_URL = "https://dywqaaopzrshoezbgbol.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5d3FhYW9wenJzaG9lemJnYm9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Nzg4NTIsImV4cCI6MjA5NDM1NDg1Mn0.In6XpcdMbVHRG5InEokGtJXtP4olbWnC7y_SHuVsZCE";

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  return session === "authenticated";
}

export async function GET() {
  if (!(await requireAdmin())) {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/employees?select=id,name,is_active,created_at&order=name`,
      {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        cache: "no-store",
      }
    );
    const data = await res.json();
    if (!res.ok) return Response.json({ error: JSON.stringify(data) }, { status: res.status });
    return Response.json(data ?? []);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const { name } = await request.json();
    if (!name?.trim()) return Response.json({ error: "الاسم مطلوب" }, { status: 400 });

    const res = await fetch(`${SUPABASE_URL}/rest/v1/employees`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ name: name.trim() }),
      cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok) return Response.json({ error: JSON.stringify(data) }, { status: res.status });
    return Response.json(Array.isArray(data) ? data[0] : data, { status: 201 });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "server error" }, { status: 500 });
  }
}
