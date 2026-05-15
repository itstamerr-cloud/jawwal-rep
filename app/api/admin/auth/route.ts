import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Tamer@2026";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (!password || password !== ADMIN_PASSWORD) {
      return Response.json({ error: "كلمة سر خاطئة" }, { status: 401 });
    }
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
