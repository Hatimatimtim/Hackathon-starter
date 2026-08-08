import { NextRequest, NextResponse } from "next/server";
import { validateLogin } from "@/lib/userStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const { user, session } = validateLogin(email, password);

    const response = NextResponse.json({
      success: true,
      user,
      sessionToken: session.token,
    });

    // Set HTTP cookie for auth persistence
    response.cookies.set("kcai_auth_token", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Login failed." },
      { status: 401 }
    );
  }
}
