import { cookies } from "next/headers";

const SUPABASE_URL = "https://dywqaaopzrshoezbgbol.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5d3FhYW9wenJzaG9lemJnYm9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Nzg4NTIsImV4cCI6MjA5NDM1NDg1Mn0.In6XpcdMbVHRG5InEokGtJXtP4olbWnC7y_SHuVsZCE";

async function requireAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "authenticated";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await request.json();

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/employees?id=eq.${id}`,
      {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );
    const data = await res.json();
    if (!res.ok) return Response.json({ error: JSON.stringify(data) }, { status: res.status });
    return Response.json(Array.isArray(data) ? data[0] : data);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "server error" }, { status: 500 });
  }
}
