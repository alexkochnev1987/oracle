"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTarotReading, CreateReadingParams } from "@/lib/openai";
import { createTarotReadingStub } from "@/lib/tarot-reading-stub";
import { isUserAllowedForAI } from "@/lib/ai-whitelist";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { getCardById, formatCardsForPrompt } from "@/lib/tarot-cards";

// Parse date from dd-mm-yy format
function parseDate(dateString: string): Date {
  const parts = dateString.split("-");
  if (parts.length !== 3) {
    throw new Error("Invalid date format. Expected dd-mm-yy");
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  let year = parseInt(parts[2], 10);

  // Convert 2-digit year to 4-digit year
  // Assume years 00-30 are 2000-2030, years 31-99 are 1931-1999
  if (year < 100) {
    year = year <= 30 ? 2000 + year : 1900 + year;
  }

  const date = new Date(year, month, day);

  // Validate date
  if (
    date.getDate() !== day ||
    date.getMonth() !== month ||
    date.getFullYear() !== year
  ) {
    throw new Error("Invalid date");
  }

  // Check if date is not in the future
  if (date > new Date()) {
    throw new Error("Birth date cannot be in the future");
  }

  return date;
}

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

    // Check user credits only if not in whitelist
    if (!isWhitelisted) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      });

      if (!user || user.credits < 1) {
        throw new Error(
          locale === "ru"
            ? "Недостаточно кредитов. Пожалуйста, приобретите кредиты для создания расклада."
            : "Insufficient credits. Please purchase credits to create a reading."
        );
      }
    }

    if (!birthDate || !question) {
      throw new Error("Missing required fields");
    }

    // Validate that 3 cards are selected
    if (!selectedCardsJson) {
      throw new Error(
        locale === "ru"
          ? "Пожалуйста, выберите 3 карты"
          : "Please select 3 cards"
      );
    }

    const selectedCardsArray = JSON.parse(selectedCardsJson) as string[];
    if (selectedCardsArray.length !== 3) {
      throw new Error(
        locale === "ru"
          ? "Пожалуйста, выберите ровно 3 карты"
          : "Please select exactly 3 cards"
      );
    }

    // Parse date from dd-mm-yy format
    let parsedDate: Date;
    try {
      parsedDate = parseDate(birthDate);
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Invalid date format. Please use dd-mm-yy format"
      );
    }

    // Format date as YYYY-MM-DD for AI
    const formattedDate = `${parsedDate.getFullYear()}-${String(
      parsedDate.getMonth() + 1
    ).padStart(2, "0")}-${String(parsedDate.getDate()).padStart(2, "0")}`;

    // Generate unique share token for public access
    const shareToken = randomUUID();

    // Check if user is allowed to use AI (already checked above for whitelist)
    const isAllowed = isWhitelisted;

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
