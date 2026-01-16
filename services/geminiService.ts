import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message, Role, SYSTEM_PROMPT } from "../types";

let chatSession: Chat | null = null;

const getAiClient = (): GoogleGenAI => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const initializeChat = () => {
  try {
    const ai = getAiClient();
    chatSession = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.4,
      }
    });
  } catch (error) {
    console.error("Failed to initialize chat:", error);
  }
};

export const sendMessageStream = async function* (
  message: string,
  history: Message[],
  imagePart?: { inlineData: { data: string; mimeType: string } }
) {
  if (!chatSession) {
    initializeChat();
  }
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }

  try {
    const msg = imagePart ? [message, imagePart] : message;
    const result = await chatSession.sendMessageStream({ message: msg });
    
    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text;
      }
    }
  } catch (error) {
    console.error("Error in sendMessageStream:", error);
    throw error;
  }
};
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    return res.status(200).json(data);

  } catch {
    return res.status(500).json({ error: "Gemini API failed" });
  }
}
