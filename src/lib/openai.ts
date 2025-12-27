import OpenAI from "openai";
import { TarotReaderId, getTarotReader } from "./tarot-readers";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CreateReadingParams {
  userImageBase64: string;
  cardsImageBase64?: string;
  selectedCardsNames?: string;
  birthDate: string;
  question: string;
  tarotReaderId: TarotReaderId;
  locale: "ru" | "en";
}

export async function createTarotReading({
  userImageBase64,
  cardsImageBase64,
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

  // Determine response language
  const responseLanguage = locale === "ru" ? "Russian" : "English";
  const addressForm = locale === "ru" ? "ты" : "you";

  // 1. Base information and role (prompt in English for better model performance)
  let textPrompt = `
ROLE: You are an experienced, empathetic, and wise tarot reader. Your task is to provide an inspiring and useful prediction.
CONTEXT:
- Birth date: ${birthDate}
- Querent's question: "${question}"

ANALYSIS INSTRUCTIONS:
1. USER PHOTO ANALYSIS: Look at the querent's photo. Describe their energy, mood, or character traits that you perceive (for example, "I see determination in your eyes" or "I sense a soft, kind energy"). Connect this to the question.
`;

  // 2. Add card context
  if (selectedCardsNames) {
    textPrompt += `
2. CARD ANALYSIS: The following cards appeared in the spread: ${selectedCardsNames}.
For EACH card, write a separate paragraph:
- Card name.
- Its meaning in the context of the question.
- How this card resonates with the person in the photo.
`;
  } else if (cardsImageBase64) {
    textPrompt += `
2. CARD ANALYSIS: Look at the second photo (card spread). Identify the cards you see.
For EACH identified card, write a separate paragraph:
- Card name.
- Its meaning in the context of the question.
`;
  } else {
    // Fallback if no cards (though function logic implies they should exist)
    textPrompt += `
2. INTUITIVE READING: Based on the photo, provide an intuitive answer.
`;
  }

  // 3. Final instructions for tone and output
  textPrompt += `
3. FINAL ANSWER (SYNTHESIS):
Make a comprehensive conclusion about the entire spread. Answer the question "${question}" directly.

IMPORTANT TEXT REQUIREMENTS:
- TONE: Supportive, mystical, but grounded and useful. Avoid frightening prophecies. Interpret any "negative" cards as warnings or areas for growth/opportunities.
- STYLE: Write vividly and interestingly, use beautiful metaphors. Address the user as "${addressForm}" with respect.
- FORMATTING: Use Markdown (bold font for card names, lists). Do not write a solid wall of text.
- LANGUAGE: IMPORTANT - You MUST respond entirely in ${responseLanguage}. All your text, including card names, interpretations, and advice, must be in ${responseLanguage}.
`;

  content.push({
    type: "text",
    text: textPrompt,
  });

  // Add user image
  content.push({
    type: "image_url",
    image_url: {
      url: userImageBase64,
      detail: "low", // Use low detail to save tokens
    },
  });

  // Add cards image only if provided (not when using selected cards)
  if (cardsImageBase64 && !selectedCardsNames) {
    content.push({
      type: "image_url",
      image_url: {
        url: cardsImageBase64,
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
