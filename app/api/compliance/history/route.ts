import { NextResponse } from "next/server";
import { getAuditHistory } from "@/lib/documentStore";

export async function GET() {
  try {
    const history = getAuditHistory();
    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch audit history." },
      { status: 500 }
    );
  }
}
