import { cookies } from "next/headers";

const SUPABASE_URL = "https://dywqaaopzrshoezbgbol.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5d3FhYW9wenJzaG9lemJnYm9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Nzg4NTIsImV4cCI6MjA5NDM1NDg1Mn0.In6XpcdMbVHRG5InEokGtJXtP4olbWnC7y_SHuVsZCE";

async function requireAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "authenticated";
}

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const employeeId = searchParams.get("employee_id");
    const mode = searchParams.get("mode") ?? "default";

    const fields =
      mode === "export"
        ? "id,report_date,jawwal_revenue,paltel_revenue,collections,visits_count,visited_accounts,submitted_at,updated_at,employees(name)"
        : "id,report_date,jawwal_revenue,paltel_revenue,collections,visits_count,visited_accounts,submitted_at,employees(name)";

    const params = new URLSearchParams({ select: fields });

    if (date) {
      params.set("report_date", `eq.${date}`);
      params.set("order", "submitted_at.desc");
    } else {
      params.set("order", "report_date.asc");
      if (from) params.set("report_date", `gte.${from}`);
      if (to) {
        // when both from and to are set we need range, handle via multiple params
      }
      if (from && to) {
        params.delete("report_date");
      }
    }

    if (employeeId) params.set("employee_id", `eq.${employeeId}`);

    let url = `${SUPABASE_URL}/rest/v1/daily_reports?${params.toString()}`;

    // Supabase REST supports multiple filters via repeated query params
    if (from && to && !date) {
      url = `${SUPABASE_URL}/rest/v1/daily_reports?select=${encodeURIComponent(fields)}&report_date=gte.${from}&report_date=lte.${to}&order=report_date.asc${employeeId ? `&employee_id=eq.${employeeId}` : ""}`;
    } else if (date) {
      url = `${SUPABASE_URL}/rest/v1/daily_reports?select=${encodeURIComponent(fields)}&report_date=eq.${date}&order=submitted_at.desc`;
    } else if (from && !to) {
      url = `${SUPABASE_URL}/rest/v1/daily_reports?select=${encodeURIComponent(fields)}&report_date=gte.${from}&order=report_date.asc${employeeId ? `&employee_id=eq.${employeeId}` : ""}`;
    } else if (to && !from) {
      url = `${SUPABASE_URL}/rest/v1/daily_reports?select=${encodeURIComponent(fields)}&report_date=lte.${to}&order=report_date.asc${employeeId ? `&employee_id=eq.${employeeId}` : ""}`;
    } else if (employeeId) {
      url = `${SUPABASE_URL}/rest/v1/daily_reports?select=${encodeURIComponent(fields)}&employee_id=eq.${employeeId}&order=report_date.desc`;
    }

    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) return Response.json({ error: JSON.stringify(data) }, { status: res.status });
    return Response.json(data ?? []);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "server error" },
      { status: 500 }
    );
  }
}
