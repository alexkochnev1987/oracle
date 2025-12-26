import OpenAI from "openai";
import { TarotReaderId, getTarotReader } from "./tarot-readers";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CreateReadingParams {
  userImageBase64: string;
  cardsImageBase64: string;
  birthDate: string;
  question: string;
  tarotReaderId: TarotReaderId;
}

export async function createTarotReading({
  userImageBase64,
  cardsImageBase64,
  birthDate,
  question,
  tarotReaderId,
}: CreateReadingParams): Promise<string> {
  const reader = getTarotReader(tarotReaderId);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: reader.systemPrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Дата рождения пользователя: ${birthDate}\nВопрос пользователя: ${question}\n\nПроанализируй фото 1 (человек) и фото 2 (расклад карт Таро) и дай прогноз.`,
          },
          {
            type: "image_url",
            image_url: {
              url: userImageBase64,
              detail: "low", // Use low detail to save tokens
            },
          },
          {
            type: "image_url",
            image_url: {
              url: cardsImageBase64,
              detail: "low", // Use low detail to save tokens
            },
          },
        ],
      },
    ],
    max_tokens: 2000,
    temperature: 0.8,
  });

  const predictionText = response.choices[0]?.message?.content || "";

  if (!predictionText) {
    throw new Error("Failed to generate prediction");
  }

  return predictionText;
}
