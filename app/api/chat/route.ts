import { NextResponse } from "next/server";
import { askGemini } from "@/services/gemini";
import { askOpenRouter } from "@/services/openrouter";
import { getDocument } from "@/lib/documentStore";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    console.log("========== CHAT REQUEST ==========");
    console.log("Message:", message);

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const document = getDocument();

    console.log(
      "Document available:",
      document ? "YES" : "NO"
    );

    if (!document) {
      return NextResponse.json(
        { error: "No document has been uploaded yet." },
        { status: 400 }
      );
    }

    console.log(
      "Document length:",
      document.length
    );

    // ==========================================
    // PRIMARY AI — GEMINI
    // ==========================================

    try {
      console.log("Calling Gemini...");

      const answer = await askGemini(
        message,
        document
      );

      console.log("Gemini answer:", answer);
      console.log("========== GEMINI SUCCESS ==========");

      return NextResponse.json({
        answer,
      });

    } catch (geminiError) {

      console.error(
        "Gemini failed. Switching to OpenRouter..."
      );

      console.error(geminiError);
    }


    // ==========================================
    // BACKUP AI — OPENROUTER
    // ==========================================

    try {
      console.log("Calling OpenRouter...");

      const answer = await askOpenRouter(
        message,
        document
      );

      console.log(
        "OpenRouter answer:",
        answer
      );

      console.log(
        "========== OPENROUTER SUCCESS =========="
      );

      return NextResponse.json({
        answer,
      });

    } catch (openRouterError) {

      console.error(
        "OpenRouter also failed:"
      );

      console.error(openRouterError);

      return NextResponse.json(
        {
          error:
            "Both AI services are temporarily unavailable. Please try again.",
        },
        {
          status: 503,
        }
      );
    }


  } catch (error) {

    console.error(
      "========== CHAT ERROR =========="
    );

    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to process chat request.",
      },
      {
        status: 500,
      }
    );
  }
}