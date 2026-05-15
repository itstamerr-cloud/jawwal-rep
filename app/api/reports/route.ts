const SUPABASE_URL = "https://dywqaaopzrshoezbgbol.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5d3FhYW9wenJzaG9lemJnYm9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Nzg4NTIsImV4cCI6MjA5NDM1NDg1Mn0.In6XpcdMbVHRG5InEokGtJXtP4olbWnC7y_SHuVsZCE";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      employee_id,
      report_date,
      jawwal_revenue,
      paltel_revenue,
      collections,
      visits_count,
      visited_accounts,
    } = body;

    if (!employee_id || !report_date) {
      return Response.json({ error: "الموظف والتاريخ مطلوبان" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/daily_reports?on_conflict=employee_id,report_date`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify({
          employee_id,
          report_date,
          jawwal_revenue: jawwal_revenue ?? 0,
          paltel_revenue: paltel_revenue ?? 0,
          collections: collections ?? 0,
          visits_count: visits_count ?? 0,
          visited_accounts: visited_accounts ?? null,
          submitted_at: now,
          updated_at: now,
        }),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return Response.json({ error: text }, { status: res.status });
    }

    const data = await res.json();
    return Response.json(Array.isArray(data) ? data[0] : data, { status: 201 });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "server error" },
      { status: 500 }
    );
  }
}
