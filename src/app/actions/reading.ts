"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeUserImage } from "@/lib/openai";
import { isUserAllowedForAI } from "@/lib/ai-whitelist";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { getCardById, formatCardsForPrompt } from "@/lib/tarot-cards";
import { parseDateString, formatDateForAI } from "@/lib/date-validation";
import {
  getTranslations,
  type Locale,
  defaultLocale,
  locales,
} from "@/lib/i18n";
import { uploadImageToS3 } from "@/lib/s3";
import { validateQrToken } from "./qr";

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
    const localeValue = formData.get("locale") as string;
    const locale: Locale = (locales as readonly string[]).includes(localeValue)
      ? (localeValue as Locale)
      : defaultLocale;

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
        throw new Error(
          getTranslations(locale).common.insufficientCreditsPurchase
        );
      }
      // If we reach here, user has credits >= 1
      hasCredits = true;
    } else {
      // Whitelisted users have unlimited access
      hasCredits = true;
    }

    // Validate required fields - question is always required, birthDate only if provided
    if (!question) {
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

    // Parse date from dd-mm-yy format (only if birthDate is provided)
    let parsedDate: Date;
    let formattedDate: string;

    if (birthDate && birthDate.trim().length > 0) {
      // Date is provided, validate and parse it
      try {
        parsedDate = parseDateString(birthDate);
        formattedDate = formatDateForAI(parsedDate);
      } catch (error) {
        throw new Error(
          error instanceof Error
            ? error.message
            : "Invalid date format. Please use dd-mm-yy format"
        );
      }
    } else {
      // No date provided (skipDate is true), use a default date (e.g., current date or a placeholder)
      // Using current date as default
      parsedDate = new Date();
      formattedDate = formatDateForAI(parsedDate);
    }

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

    // Parallel execution: Upload to S3 and analyze image in GPT simultaneously
    let s3Url: string | null = null;
    let imageAnalysisResult: string | null = null;

    if (formattedUserImage && isAllowed) {
      // Run S3 upload and GPT image analysis in parallel
      const [uploadResult, analysisResult] = await Promise.all([
        uploadImageToS3(userImageBase64!, userId).catch((error) => {
          console.error("S3 upload failed:", error);
          return null;
        }),
        analyzeUserImage(formattedUserImage, locale).catch((error) => {
          console.error("Image analysis failed:", error);
          return null;
        }),
      ]);

      s3Url = uploadResult;
      imageAnalysisResult = analysisResult;
    } else if (formattedUserImage && !isAllowed) {
      // For non-whitelisted users, still upload to S3 but skip GPT analysis
      s3Url = await uploadImageToS3(userImageBase64!, userId).catch((error) => {
        console.error("S3 upload failed:", error);
        return null;
      });
    }

    // Save to database without predictionText - it will be generated via streaming
    // Store imageAnalysisResult in a JSON field for later use in streaming
    const reading = await prisma.reading.create({
      data: {
        userId,
        question,
        birthDate: parsedDate,
        predictionText: "", // Empty initially, will be filled during streaming
        userImageUrl: s3Url, // Store full S3 URL instead of truncated base64
        cardsImageUrl: null, // No longer used
        selectedCards: selectedCardsArray,
        cardSelectionMode,
        tarotReaderId,
        shareToken,
      },
    });

    // Store imageAnalysisResult and other streaming params in a temporary way
    // We'll pass them to the streaming API via the reading metadata
    // For now, we'll store imageAnalysisResult in the database using a workaround
    // by updating the reading with metadata (we can use selectedCards JSON field or create a new field)
    // Actually, we'll pass imageAnalysisResult via API route body instead

    // Deduct credit only if user is not in whitelist
    // Note: We deduct credit now, before streaming starts
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

    // Return readingId and imageAnalysisResult for streaming
    // imageAnalysisResult will be passed to streaming API

    revalidatePath("/dashboard");
    revalidatePath("/readings");

    return {
      success: true,
      readingId: reading.id,
      shareToken: reading.shareToken,
      imageAnalysisResult: imageAnalysisResult || null, // Pass to streaming API
      isAllowed, // Pass to streaming API to know if we should use AI or stub
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

export async function createReadingFromQr(formData: FormData, qrToken: string) {
  try {
    // Validate QR token first
    const tokenValidation = await validateQrToken(qrToken);

    if (!tokenValidation.success || !tokenValidation.qrCode) {
      throw new Error(
        tokenValidation.error || "Invalid or expired QR code token"
      );
    }

    const qrCode = tokenValidation.qrCode;
    const userId = qrCode.userId;

    // Get form data
    const userImageBase64 = formData.get("userImage") as string | null;
    const selectedCardsJson = formData.get("selectedCards") as string | null;
    const cardSelectionMode = "random"; // Always random for QR form
    const birthDate = formData.get("birthDate") as string;
    const question = formData.get("question") as string;
    const tarotReaderId =
      (formData.get("tarotReaderId") as string) || "default";
    const localeValue = formData.get("locale") as string;
    const locale: Locale = (locales as readonly string[]).includes(localeValue)
      ? (localeValue as Locale)
      : defaultLocale;

    // Check if QR code creator is in whitelist (unlimited credits)
    const qrCodeCreator = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, credits: true },
    });

    if (!qrCodeCreator) {
      throw new Error("QR code creator not found");
    }

    const isWhitelisted = isUserAllowedForAI(qrCodeCreator.email);

    // Track whether QR code creator has credits for AI access
    let hasCredits = false;

    // Check credits only if not in whitelist
    if (!isWhitelisted) {
      if (qrCodeCreator.credits < 1) {
        throw new Error(
          getTranslations(locale).common.insufficientCreditsPurchase
        );
      }
      hasCredits = true;
    } else {
      hasCredits = true;
    }

    // Validate required fields
    if (!question) {
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

    // Parse date from dd-mm-yy format (only if birthDate is provided)
    let parsedDate: Date;
    let formattedDate: string;

    if (birthDate && birthDate.trim().length > 0) {
      try {
        parsedDate = parseDateString(birthDate);
        formattedDate = formatDateForAI(parsedDate);
      } catch (error) {
        throw new Error(
          error instanceof Error
            ? error.message
            : "Invalid date format. Please use dd-mm-yy format"
        );
      }
    } else {
      parsedDate = new Date();
      formattedDate = formatDateForAI(parsedDate);
    }

    // Generate unique share token for public access
    const shareToken = randomUUID();

    // Check if QR code creator is allowed to use AI
    const isAllowed = isWhitelisted || hasCredits;

    // Prepare image data
    const formatImageBase64 = (base64: string): string => {
      if (base64.startsWith("data:image/")) {
        return base64;
      }
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

    // Parallel execution: Upload to S3 and analyze image in GPT simultaneously
    let s3Url: string | null = null;
    let imageAnalysisResult: string | null = null;

    if (formattedUserImage && isAllowed) {
      const [uploadResult, analysisResult] = await Promise.all([
        uploadImageToS3(userImageBase64!, userId).catch((error) => {
          console.error("S3 upload failed:", error);
          return null;
        }),
        analyzeUserImage(formattedUserImage, locale).catch((error) => {
          console.error("Image analysis failed:", error);
          return null;
        }),
      ]);

      s3Url = uploadResult;
      imageAnalysisResult = analysisResult;
    } else if (formattedUserImage && !isAllowed) {
      s3Url = await uploadImageToS3(userImageBase64!, userId).catch((error) => {
        console.error("S3 upload failed:", error);
        return null;
      });
    }

    // Save to database with qrCodeId
    const reading = await prisma.reading.create({
      data: {
        userId, // QR code creator's ID
        question,
        birthDate: parsedDate,
        predictionText: "", // Empty initially, will be filled during streaming
        userImageUrl: s3Url,
        cardsImageUrl: null,
        selectedCards: selectedCardsArray,
        cardSelectionMode,
        tarotReaderId,
        shareToken,
        qrCodeId: qrCode.id, // Link reading to QR code
      },
    });

    // Update QR code usage count
    await prisma.qrCode.update({
      where: { id: qrCode.id },
      data: {
        currentUses: {
          increment: 1,
        },
        // Deactivate if max uses reached
        isActive:
          qrCode.currentUses + 1 < qrCode.maxUses ? qrCode.isActive : false,
      },
    });

    // Deduct credit from QR code creator only if not in whitelist
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

    revalidatePath("/readings");
    revalidatePath("/qr");

    return {
      success: true,
      readingId: reading.id,
      shareToken: reading.shareToken,
      imageAnalysisResult: imageAnalysisResult || null,
      isAllowed,
    };
  } catch (error) {
    console.error("Error creating reading from QR:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create reading from QR",
    };
  }
}
