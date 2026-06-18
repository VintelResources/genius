import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

type LanguageId = "ru" | "fr" | "en" | "es" | "la" | "af" | "sw" | "zh" | "yo";

type ChatRequest = {
  languageId: LanguageId;
  languageName: string;
  locale: string;
  message: string;
  history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
};

const LANGUAGE_RULES: Record<LanguageId, string> = {
  ru: "Teach in Russian. Use Cyrillic naturally. Keep explanations beginner-friendly when needed.",
  fr: "Teach in French. Use clear French with examples.",
  en: "Teach in English. Be concise, practical, and encouraging.",
  es: "Teach in Spanish. Use clear examples and corrections.",
  la: "Teach in Latin where possible, but give very clear instructional structure.",
  af: "Teach in Afrikaans. Keep the phrasing simple and practical.",
  sw: "Teach in Swahili. Use natural, beginner-friendly examples.",
  zh: "Teach in Chinese. Use simplified Chinese and include pinyin where useful.",
  yo: "Teach in Yoruba. Respect tone marks where possible and use clear examples."
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest;

    if (!body.message?.trim()) {
      return Response.json({ error: "Message is required." }, { status: 400 });
    }

    const languageRule = LANGUAGE_RULES[body.languageId] ?? `Teach in ${body.languageName}.`;

    const historyText = (body.history ?? [])
      .slice(-8)
      .map((item) => `${item.role.toUpperCase()}: ${item.content}`)
      .join("\n");

    const prompt = `
You are GENIUS Voice Language Coach.

Target language: ${body.languageName}
Locale: ${body.locale}

Rules:
- ${languageRule}
- Answer primarily in the target language.
- Teach the user whatever they ask, inside the target language.
- Be a patient tutor, not just a chatbot.
- Correct mistakes gently.
- Always include:
  1. a direct answer,
  2. one short explanation,
  3. 2 to 4 example sentences,
  4. one practice question for the learner.
- Keep formatting readable.
- Avoid refusing simple educational requests.
- Never switch to another language unless a tiny clarification is essential.

Conversation so far:
${historyText || "No prior conversation."}

User request:
${body.message}
`.trim();

    const result = await generateText({
      model: openai("gpt-4.1-mini"),
      system: "You are an expert multilingual tutor for GENIUS.",
      prompt,
      temperature: 0.7
    });

    return Response.json({
      reply: result.text
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unexpected server error."
      },
      { status: 500 }
    );
  }
}

