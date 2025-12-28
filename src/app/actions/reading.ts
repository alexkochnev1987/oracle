"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTarotReading, CreateReadingParams } from "@/lib/openai";
import { createTarotReadingStub } from "@/lib/tarot-reading-stub";
import { isUserAllowedForAI } from "@/lib/ai-whitelist";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { getCardById, formatCardsForPrompt } from "@/lib/tarot-cards";
import {
  parseDateString,
  formatDateForAI,
} from "@/lib/date-validation";
import { getTranslations, type Locale } from "@/lib/i18n";

export async function createReading(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // In NextAuth v5, user.id might be in session.user.id or session.user.email
    const userId = (session.user as any).id;

    if (!userId) {
      throw new Error("User ID not found in session");
    }

    // Get form data
    const userImageBase64 = formData.get("userImage") as string | null;
    const selectedCardsJson = formData.get("selectedCards") as string | null;
    const cardSelectionMode =
      (formData.get("cardSelectionMode") as string) || "random";
    const birthDate = formData.get("birthDate") as string;
    const question = formData.get("question") as string;
    const tarotReaderId =
      (formData.get("tarotReaderId") as string) || "default";
    const locale = (formData.get("locale") as "ru" | "en") || "ru";

    // Check if user is in whitelist (unlimited credits)
    const userEmail = session.user.email;
    const isWhitelisted = isUserAllowedForAI(userEmail);

    // Track whether user has credits for AI access
    let hasCredits = false;

    // Check user credits only if not in whitelist
    if (!isWhitelisted) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      });

      if (!user || user.credits < 1) {
        throw new Error(getTranslations(locale).common.insufficientCreditsPurchase);
      }
      // If we reach here, user has credits >= 1
      hasCredits = true;
    } else {
      // Whitelisted users have unlimited access
      hasCredits = true;
    }

    if (!birthDate || !question) {
      throw new Error("Missing required fields");
    }

    // Validate that 3 cards are selected
    const t = getTranslations(locale as Locale);
    if (!selectedCardsJson) {
      throw new Error(t.common.pleaseSelect3Cards);
    }

    const selectedCardsArray = JSON.parse(selectedCardsJson) as string[];
    if (selectedCardsArray.length !== 3) {
      throw new Error(t.common.pleaseSelectExactly3Cards);
    }

    // Parse date from dd-mm-yy format
    let parsedDate: Date;
    try {
      parsedDate = parseDateString(birthDate);
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Invalid date format. Please use dd-mm-yy format"
      );
    }

    // Format date as YYYY-MM-DD for AI
    const formattedDate = formatDateForAI(parsedDate);

    // Generate unique share token for public access
    const shareToken = randomUUID();

    // Check if user is allowed to use AI (whitelist or has credits)
    const isAllowed = isWhitelisted || hasCredits;

    // Prepare image data - ensure proper format for OpenAI API
    // OpenAI expects data URI format: data:image/jpeg;base64,{base64string}
    const formatImageBase64 = (base64: string): string => {
      if (base64.startsWith("data:image/")) {
        return base64; // Already formatted
      }
      // Assume JPEG if no prefix, can be improved to detect actual format
      return `data:image/jpeg;base64,${base64}`;
    };

    const formattedUserImage = userImageBase64
      ? formatImageBase64(userImageBase64)
      : undefined;

    // Parse selected cards and get their names
    const cards = selectedCardsArray
      .map((cardId) => getCardById(cardId))
      .filter((card) => card !== undefined);
    const selectedCardsNames = formatCardsForPrompt(cards as any[], locale);

    // Create AI prediction - use real AI for whitelisted users, stub for others
    let predictionText: string;
    try {
      if (isAllowed) {
        // Use real AI with image analysis or card names
        predictionText = await createTarotReading({
          userImageBase64: formattedUserImage,
          selectedCardsNames,
          birthDate: formattedDate,
          question,
          tarotReaderId: tarotReaderId as any,
          locale,
        });
      } else {
        // Use stub for non-whitelisted users
        predictionText = await createTarotReadingStub({
          userImageBase64: formattedUserImage,
          selectedCardsNames,
          birthDate: formattedDate,
          question,
          tarotReaderId: tarotReaderId as any,
          locale,
        });
      }
    } catch (error) {
      console.error("Error generating AI prediction:", error);
      // Fallback to stub if AI fails
      if (isAllowed) {
        console.warn(
          "AI request failed, falling back to stub for user:",
          userEmail
        );
        predictionText = await createTarotReadingStub({
          userImageBase64: formattedUserImage,
          selectedCardsNames,
          birthDate: formattedDate,
          question,
          tarotReaderId: tarotReaderId as any,
          locale,
        });
      } else {
        throw error;
      }
    }

    // Save to database
    const reading = await prisma.reading.create({
      data: {
        userId,
        question,
        birthDate: parsedDate,
        predictionText,
        userImageUrl: userImageBase64
          ? userImageBase64.substring(0, 100) + "..."
          : null, // Store reference only
        cardsImageUrl: null, // No longer used
        selectedCards: selectedCardsArray,
        cardSelectionMode,
        tarotReaderId,
        shareToken,
      },
    });

    // Deduct credit only if user is not in whitelist
    if (!isWhitelisted) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          credits: {
            decrement: 1,
          },
        },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/readings");

    return {
      success: true,
      readingId: reading.id,
      shareToken: reading.shareToken,
    };
  } catch (error) {
    console.error("Error creating reading:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create reading",
    };
  }
}
