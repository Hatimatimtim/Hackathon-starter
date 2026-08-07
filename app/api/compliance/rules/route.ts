import { NextResponse } from "next/server";
import {
  getCustomRules,
  addCustomRule,
  deleteCustomRule,
  toggleCustomRule,
  CustomRule,
} from "@/lib/documentStore";

export async function GET() {
  try {
    const customRules = getCustomRules();
    return NextResponse.json({
      success: true,
      rules: customRules,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch custom rules." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, category, description, severity } = body;

    if (!title || !category || !description) {
      return NextResponse.json(
        { error: "Title, category, and description are required fields." },
        { status: 400 }
      );
    }

    const newRule = addCustomRule({
      title,
      category: category || "Internal Policy",
      description,
      severity: severity || "MEDIUM",
      active: true,
    });

    return NextResponse.json({
      success: true,
      rule: newRule,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create custom rule." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Rule ID is required." }, { status: 400 });
    }

    const updated = toggleCustomRule(id);
    if (!updated) {
      return NextResponse.json({ error: "Rule not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      rule: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to toggle rule." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Rule ID is required." }, { status: 400 });
    }

    const deleted = deleteCustomRule(id);
    if (!deleted) {
      return NextResponse.json({ error: "Rule not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Custom rule deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete rule." },
      { status: 500 }
    );
  }
}
