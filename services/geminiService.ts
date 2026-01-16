import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Only POST allowed");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).send("Missing GEMINI_API_KEY");
  }

  const { message, history = [] } = req.body;

  const ai = new GoogleGenAI({ apiKey });

  const chat = ai.chats.create({
    model: "gemini-1.5-flash",
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

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");

  try {
    const stream = await chat.sendMessageStream({ message });

    for await (const chunk of stream) {
      if (chunk.text) {
        res.write(chunk.text);
      }
    }

    res.end();
  } catch (err) {
    res.write("\n\n[STREAM ERROR]");
    res.end();
  }
}
