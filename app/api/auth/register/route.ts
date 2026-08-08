import { NextRequest, NextResponse } from "next/server";
import { registerUser, UserRole } from "@/lib/userStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Full Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const validRoles: UserRole[] = ["CISO", "Compliance Auditor", "Security Analyst", "System Admin"];
    const userRole: UserRole = validRoles.includes(role) ? role : "Compliance Auditor";

    const { user, session } = registerUser({
      name,
      email,
      password,
      role: userRole,
    });

    const response = NextResponse.json({
      success: true,
      user,
      sessionToken: session.token,
    });

    response.cookies.set("kcai_auth_token", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Registration failed." },
      { status: 400 }
    );
  }
}
