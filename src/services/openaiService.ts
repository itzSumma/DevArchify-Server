import OpenAI from "openai";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const SITE_URL = process.env.SITE_URL || "http://localhost:3000";
const SITE_NAME = process.env.SITE_NAME || "DevArchify";

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set in .env");
  return new OpenAI({
    apiKey,
    baseURL: OPENROUTER_BASE_URL,
    defaultHeaders: {
      "HTTP-Referer": SITE_URL,
      "X-Title": SITE_NAME,
    },
  });
}

export function buildMessages(
  history: { role: string; content: string }[]
): { role: "user" | "assistant"; content: string }[] {
  const messages = history.map((msg) => ({
    role: (msg.role === "model" ? "assistant" : msg.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
    content: msg.content,
  }));

  while (messages.length > 0 && messages[0].role !== "user") {
    messages.shift();
  }

  return messages;
}

function handleOpenAIError(err: unknown): never {
  if (err instanceof OpenAI.APIError) {
    const errorMap: Record<number, string> = {
      400: "Bad request",
      401: "Invalid API key",
      403: "API key lacks permissions",
      429: "Quota exceeded (insufficient_quota) — check billing or key limits",
      500: "OpenAI server error",
    };
    const label = errorMap[err.status] || `HTTP ${err.status}`;
    console.error(`[AI ERROR] ${label}: ${err.message}`);
    throw new Error(`AI ${label}`);
  }
  console.error("[AI ERROR] Non-API error:", err instanceof Error ? err.message : String(err));
  throw err;
}

export async function* streamChatResponse(
  messages: { role: "user" | "assistant"; content: string }[],
  prompt: string
): AsyncGenerator<string> {
  const openai = getClient();
  let stream;
  try {
    stream = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [...messages, { role: "user", content: prompt }],
      stream: true,
    });
  } catch (err) {
    handleOpenAIError(err);
  }
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || "";
    if (text) yield text;
  }
}

export async function generateContent(prompt: string): Promise<string> {
  const openai = getClient();
  try {
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    return completion.choices[0]?.message?.content || "";
  } catch (err) {
    handleOpenAIError(err);
  }
}
