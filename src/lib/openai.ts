import OpenAI from "openai";
import { TarotReaderId, getTarotReader } from "./tarot-readers";
import { getTranslations } from "./i18n";
import { buildReadingPrompt } from "./reading-prompt-builder";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CreateReadingParams {
  userImageBase64?: string;
  selectedCardsNames?: string;
  birthDate: string;
  question: string;
  tarotReaderId: TarotReaderId;
  locale: "ru" | "en";
}

export async function createTarotReading({
  userImageBase64,
  selectedCardsNames,
  birthDate,
  question,
  tarotReaderId,
  locale,
}: CreateReadingParams): Promise<string> {
  // Get localized tarot reader
  const reader = getTarotReader(tarotReaderId, locale);

  // Build content array based on whether we have card names or image
  const content: any[] = [];

  // Get translations
  const translations = getTranslations(locale);
  const responseLanguage = translations.promptLanguage.responseLanguage;
  const addressForm = translations.promptLanguage.addressForm;
  const firstPerson = translations.promptLanguage.firstPerson;
  const mantraTitle = translations.mantra.title;

  // Build localized prompt using the prompt builder
  const textPrompt = buildReadingPrompt({
    birthDate,
    question,
    userImageBase64,
    selectedCardsNames,
    locale,
    addressForm,
    firstPerson,
    responseLanguage,
    mantraTitle,
  });

  content.push({
    type: "text",
    text: textPrompt,
  });

  // Add user image only if provided
  if (userImageBase64) {
    content.push({
      type: "image_url",
      image_url: {
        url: userImageBase64,
        detail: "low", // Use low detail to save tokens
      },
    });
  }

  // System prompt is already localized
  const systemMessageContent = reader.systemPrompt;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemMessageContent,
      },
      {
        role: "user",
        content,
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
