import { NextResponse } from "next/server";
import { askGemini } from "@/services/gemini";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const reply = await askGemini(message);

    return NextResponse.json({ reply });
  } catch (error: any) {
  console.error("========== GEMINI ERROR ==========");
  console.error(error);

  if (error.response) {
    console.error(await error.response.text());
  }

  console.error("==================================");

  return NextResponse.json(
    { error: error.message },
    { status: 500 }
  );
}
}