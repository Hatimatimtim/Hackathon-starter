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

Your primary sources of truth are:
1. The uploaded document context provided below.
2. Technical knowledge about the KCAI website platform (document upload, compliance audits, GDPR/SOC2, user login/register).

STRICT OPERATIONAL RULES:
1. If the user asks about the KCAI website or platform features, provide a helpful technical answer.
2. If the user asks about the uploaded document(s), answer ONLY using facts explicitly present in the provided document context. Cite sources as [Document: <filename>, Page: <page_number>].
3. If the user's question is OUT OF CONTEXT, OUT OF BOX, or UNRELATED to the website or uploaded documents (e.g., general trivia, recipes, sports, random topics), respond EXACTLY:
   "The requested information is not present in the uploaded source documents or website context."
4. Keep your response professional, concise, and structured with Markdown bullet points.

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
      "The requested information is not present in the uploaded source documents or website context."
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
      "The requested information is not present in the uploaded source documents or website context."
    );
  }
}