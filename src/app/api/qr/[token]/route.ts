import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateQrToken } from "@/app/actions/qr";
import { createReadingFromQr } from "@/app/actions/reading";
import { createTarotReadingStream } from "@/lib/openai";
import { createTarotReadingStub } from "@/lib/tarot-reading-stub";
import { formatDateForAI } from "@/lib/date-validation";
import { getCardById, formatCardsForPrompt } from "@/lib/tarot-cards";
import { type Locale, defaultLocale, locales } from "@/lib/i18n";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const validation = await validateQrToken(token);

    if (!validation.success || !validation.qrCode) {
      return NextResponse.json(
        { error: validation.error || "Invalid QR code token" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      qrCode: {
        id: validation.qrCode.id,
        isActive: validation.qrCode.isActive,
        expiresAt: validation.qrCode.expiresAt,
        currentUses: validation.qrCode.currentUses,
        maxUses: validation.qrCode.maxUses,
      },
    });
  } catch (error) {
    console.error("Error validating QR token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Validate token again before processing
    const validation = await validateQrToken(token);

    if (!validation.success || !validation.qrCode) {
      return NextResponse.json(
        { error: validation.error || "Invalid QR code token" },
        { status: 404 }
      );
    }

    // Get form data from request
    const formData = await request.formData();

    // Get locale from form data
    const localeValue = (formData.get("locale") as string) || "ru";

    // Create reading using QR token
    const result = await createReadingFromQr(formData, token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create reading" },
        { status: 400 }
      );
    }

    // Start streaming in background (don't wait for it)
    // The reading will be generated asynchronously
    if (result.readingId) {
      // Generate reading in background
      generateReadingInBackground(
        result.readingId,
        result.imageAnalysisResult,
        result.isAllowed,
        localeValue
      ).catch((error) => {
        console.error("Error generating reading in background:", error);
      });
    }

    return NextResponse.json({
      success: true,
      message: "Reading created successfully",
      readingId: result.readingId,
    });
  } catch (error) {
    console.error("Error processing QR form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to generate reading in background
async function generateReadingInBackground(
  readingId: string,
  imageAnalysisResult: string | null,
  isAllowed: boolean,
  localeValue: string
) {
  try {
    // Get reading from database
    const reading = await prisma.reading.findUnique({
      where: { id: readingId },
    });

    if (!reading) {
      console.error("Reading not found:", readingId);
      return;
    }

    // Check if already completed
    if (reading.predictionText && reading.predictionText.trim().length > 0) {
      return;
    }

    const validLocale: Locale = (locales as readonly string[]).includes(
      localeValue
    )
      ? (localeValue as Locale)
      : defaultLocale;

    // Format date for AI
    const formattedDate = formatDateForAI(reading.birthDate);

    // Parse selected cards and get their names
    const selectedCardsArray =
      reading.selectedCards && Array.isArray(reading.selectedCards)
        ? (reading.selectedCards as string[])
        : [];
    const cards = selectedCardsArray
      .map((cardId) => getCardById(cardId))
      .filter((card) => card !== undefined);
    const selectedCardsNames = formatCardsForPrompt(
      cards as any[],
      validLocale
    );

    let fullText = "";

    // Generate reading
    if (isAllowed) {
      try {
        const streamGenerator = createTarotReadingStream({
          userImageBase64: undefined,
          imageAnalysisResult: imageAnalysisResult || undefined,
          selectedCardsNames,
          birthDate: formattedDate,
          question: reading.question,
          tarotReaderId: reading.tarotReaderId as any,
          locale: validLocale,
        });

        for await (const chunk of streamGenerator) {
          fullText += chunk;
        }
      } catch (error) {
        console.error("Streaming AI failed:", error);
        // Fallback to stub
        fullText = await createTarotReadingStub({
          userImageBase64: undefined,
          selectedCardsNames,
          birthDate: formattedDate,
          question: reading.question,
          tarotReaderId: reading.tarotReaderId as any,
          locale: validLocale,
        });
      }
    } else {
      // Use stub
      fullText = await createTarotReadingStub({
        userImageBase64: undefined,
        selectedCardsNames,
        birthDate: formattedDate,
        question: reading.question,
        tarotReaderId: reading.tarotReaderId as any,
        locale: validLocale,
      });
    }

    // Save full text to database
    await prisma.reading.update({
      where: { id: readingId },
      data: {
        predictionText: fullText,
      },
    });
  } catch (error) {
    console.error("Error in background reading generation:", error);
  }
}

