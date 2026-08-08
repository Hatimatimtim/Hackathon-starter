import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, resetUserPassword } from "@/lib/userStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, newPassword, resetToken } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email address is required." },
        { status: 400 }
      );
    }

    const user = findUserByEmail(email);

    // Action 1: Request Password Reset Token / Verification Code
    if (action === "request_reset" || (!action && !newPassword)) {
      if (!user) {
        return NextResponse.json(
          { success: false, error: "No registered enterprise account found with this email address." },
          { status: 404 }
        );
      }

      // Generate verification code for demonstration/testing
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      return NextResponse.json({
        success: true,
        message: `Password reset code sent to ${email}!`,
        verificationCode, // Returned for instant demo testing
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    // Action 2: Reset Password to New Password
    if (action === "reset_password" || newPassword) {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      const updatedUser = resetUserPassword(email, newPassword);

      return NextResponse.json({
        success: true,
        message: `Password updated successfully for ${updatedUser.name}! You can now sign in with your new password.`,
        user: updatedUser,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid password reset request action." },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to reset password." },
      { status: 500 }
    );
  }
}
