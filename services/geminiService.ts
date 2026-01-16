import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: "edge", // ⚡ streaming nhanh hơn node
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Only POST allowed", { status: 405 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response("Missing GEMINI_API_KEY", { status: 500 });
  }

  const { message, history = [] } = await req.json();

  const ai = new GoogleGenAI({ apiKey });

  const chat = ai.chats.create({
    model: "gemini-1.5-flash", // ✅ ổn định + có free quota
    config: {
      temperature: 0.4,
      systemInstruction:
        "Bạn là trợ lý AI hỗ trợ tạo giáo án rõ ràng, súc tích.",
    },
    history: history.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
  });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await chat.sendMessageStream({
          message,
        });

        for await (const chunk of result) {
          if (chunk.text) {
            controller.enqueue(
              new TextEncoder().encode(chunk.text)
            );
          }
        }

        controller.close();
      } catch (err) {
        controller.enqueue(
          new TextEncoder().encode("\n\n[STREAM ERROR]")
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
