import OpenAI from "openai";

export async function askOpenRouter(
  question: string,
  document: string
): Promise<string> {
  const openrouter = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || "placeholder_key",
    baseURL: "https://openrouter.ai/api/v1",
  });

  const prompt = `
You are KCAI, an enterprise Knowledge & Compliance AI Agent.

Your ONLY source of truth is the uploaded knowledge & policy documentation provided below.

STRICT OPERATIONAL RULES:
1. Answer ONLY using facts explicitly stated in the provided document context.
2. Do NOT use outside knowledge, external assumptions, or unsupported facts.
3. Whenever quoting or providing details, include source citations in format [Document: <filename>, Page: <page_number>].
4. Keep your answer clear, professional, well-formatted using Markdown (bullet points, bold highlights), and concise.

UPLOADED DOCUMENT CONTEXT:
=========================================
${document}
=========================================

USER QUESTION:
${question}

ANSWER:
`;

  try {
    const completion = await openrouter.chat.completions.create({
      model: "openrouter/auto",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return (
      completion.choices[0]?.message?.content ||
      "I couldn't find that information in the uploaded document."
    );
  } catch (err) {
    const completion = await openrouter.chat.completions.create({
      model: "google/gemini-flash-1.5",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return (
      completion.choices[0]?.message?.content ||
      "I couldn't find that information in the uploaded document."
    );
  }
}