import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { employee_id, report_date, jawwal_revenue, paltel_revenue, collections, visits_count, visited_accounts } = body;

  if (!employee_id || !report_date) {
    return Response.json({ error: "الموظف والتاريخ مطلوبان" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("daily_reports")
    .upsert(
      {
        employee_id,
        report_date,
        jawwal_revenue: jawwal_revenue ?? 0,
        paltel_revenue: paltel_revenue ?? 0,
        collections: collections ?? 0,
        visits_count: visits_count ?? 0,
        visited_accounts: visited_accounts ?? null,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "employee_id,report_date" }
    )
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
