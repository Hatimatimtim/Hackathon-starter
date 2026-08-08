import { GoogleGenerativeAI } from "@google/generative-ai";

export async function askGemini(
  question: string,
  document: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || "placeholder_key";
  const genAI = new GoogleGenerativeAI(apiKey);

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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err1) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err2) {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    }
  }
}