import OpenAI from "openai";
import { TarotReaderId, getTarotReader } from "./tarot-readers";
import { getTranslations } from "./i18n";
import { buildReadingPrompt } from "./reading-prompt-builder";

// Lazy initialization of OpenAI client to avoid errors during build
let openaiInstance: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not set. Please provide it in your environment variables."
      );
    }
    openaiInstance = new OpenAI({
      apiKey,
    });
  }
  return openaiInstance;
}

/**
 * Analyzes a user image and returns a textual description.
 * This is the first step in the two-step process for creating readings with images.
 * @param userImageBase64 - Base64 encoded image (with or without data URI prefix)
 * @param locale - Locale for the prompt ("ru" or "en")
 * @returns Textual description of the image, or null if analysis fails
 */
export async function analyzeUserImage(
  userImageBase64: string,
  locale: "ru" | "en"
): Promise<string | null> {
  try {
    const translations = getTranslations(locale);
    const imageAnalysisPrompts = translations.imageAnalysisPrompts;

    // Ensure image is in correct format for OpenAI API
    const formatImageBase64 = (base64: string): string => {
      if (base64.startsWith("data:image/")) {
        return base64;
      }
      return `data:image/jpeg;base64,${base64}`;
    };

    const formattedImage = formatImageBase64(userImageBase64);

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: imageAnalysisPrompts.systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: imageAnalysisPrompts.userPrompt,
            },
            {
              type: "image_url",
              image_url: {
                url: formattedImage,
                detail: "low",
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const analysisText = response.choices[0]?.message?.content || "";

    if (!analysisText) {
      console.warn("Image analysis returned empty response");
      return null;
    }

    console.log("Image analysis result:", analysisText);
    return analysisText;
  } catch (error) {
    console.error("Error analyzing user image:", error);
    return null;
  }
}

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
  // Step 1: Analyze image if provided (first request)
  let imageAnalysisResult: string | null = null;
  if (userImageBase64) {
    try {
      console.log("Starting image analysis...");
      imageAnalysisResult = await analyzeUserImage(userImageBase64, locale);
      if (!imageAnalysisResult) {
        console.warn(
          "Image analysis returned null, continuing without photo analysis"
        );
      } else {
        console.log("Image analysis completed successfully");
      }
    } catch (error) {
      console.warn(
        "Image analysis failed, continuing without photo:",
        error instanceof Error ? error.message : error
      );
      // Continue without photo - not critical for prediction
    }
  }

  // Get localized tarot reader
  const reader = getTarotReader(tarotReaderId, locale);

  // Get translations
  const translations = getTranslations(locale);
  const responseLanguage = translations.promptLanguage.responseLanguage;
  const addressForm = translations.promptLanguage.addressForm;
  const firstPerson = translations.promptLanguage.firstPerson;
  const mantraTitle = translations.mantra.title;

  // Step 2: Build reading prompt with image analysis result (if available)
  // Note: We pass userImageBase64 only if imageAnalysisResult is null (fallback to old behavior)
  // Otherwise, we use imageAnalysisResult which contains the textual description
  const textPrompt = buildReadingPrompt({
    birthDate,
    question,
    userImageBase64: imageAnalysisResult ? undefined : userImageBase64,
    imageAnalysisResult: imageAnalysisResult || undefined,
    selectedCardsNames,
    locale,
    addressForm,
    firstPerson,
    responseLanguage,
    mantraTitle,
  });

  // Step 3: Create prediction request (text-only, no image)
  // The image analysis result is already included in the text prompt
  const systemMessageContent = reader.systemPrompt;

  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemMessageContent,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: textPrompt,
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

/**
 * Creates a tarot reading for testing purposes with pre-analyzed image description.
 * This function is used for testing prompt quality and accepts imageAnalysisResult directly.
 * @param params - Reading parameters including pre-analyzed image description
 * @returns Generated reading text
 */
export async function createTarotReadingForTest({
  imageAnalysisResult,
  selectedCardsNames,
  birthDate,
  question,
  tarotReaderId,
  locale,
}: {
  imageAnalysisResult?: string;
  selectedCardsNames?: string;
  birthDate: string;
  question: string;
  tarotReaderId: TarotReaderId;
  locale: "ru" | "en";
}): Promise<string> {
  // Get localized tarot reader
  const reader = getTarotReader(tarotReaderId, locale);

  // Get translations
  const translations = getTranslations(locale);
  const responseLanguage = translations.promptLanguage.responseLanguage;
  const addressForm = translations.promptLanguage.addressForm;
  const firstPerson = translations.promptLanguage.firstPerson;
  const mantraTitle = translations.mantra.title;

  // Build reading prompt with image analysis result (if available)
  const textPrompt = buildReadingPrompt({
    birthDate,
    question,
    userImageBase64: undefined,
    imageAnalysisResult: imageAnalysisResult || undefined,
    selectedCardsNames,
    locale,
    addressForm,
    firstPerson,
    responseLanguage,
    mantraTitle,
  });

  // Create prediction request (text-only, no image)
  const systemMessageContent = reader.systemPrompt;

  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemMessageContent,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: textPrompt,
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
