import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession, clearSession, parseSessionToken } from "@/lib/userStore";

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("kcai_auth_token")?.value;
    if (cookieToken) {
      const userFromToken = parseSessionToken(cookieToken);
      if (userFromToken) {
        return NextResponse.json({ authenticated: true, user: userFromToken });
      }
    }

    const session = getCurrentSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }
    return NextResponse.json({ authenticated: true, user: session.user });
  } catch (err) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}

export async function POST(req: NextRequest) {
  try {
    clearSession();
    const response = NextResponse.json({ success: true, message: "Logged out successfully." });
    response.cookies.set("kcai_auth_token", "", {
      httpOnly: true,
      path: "/",
      expires: new Date(0),
    });
    return response;
  } catch (err) {
    return NextResponse.json({ error: "Logout failed." }, { status: 500 });
  }
}
