import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateQrToken } from "@/app/actions/qr";
import { createReadingFromQr } from "@/app/actions/reading";
import { createTarotReadingStream } from "@/lib/openai";
import { formatDateForAI } from "@/lib/date-validation";
import { getCardById, formatCardsForPrompt } from "@/lib/tarot-cards";
import { type Locale, defaultLocale, locales } from "@/lib/i18n";
import { createTarotReadingStub } from "@/lib/tarot-reading-stub";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
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
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
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

    if (!result.readingId) {
      return NextResponse.json(
        { error: "Failed to create reading" },
        { status: 500 }
      );
    }

    // Get reading from database
    const reading = await prisma.reading.findUnique({
      where: { id: result.readingId },
    });

    if (!reading) {
      return NextResponse.json({ error: "Reading not found" }, { status: 404 });
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

    // Create a readable stream for the response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullText = "";

        try {
          // Use streaming AI if user is allowed
          if (result.isAllowed) {
            try {
              const streamGenerator = createTarotReadingStream({
                userImageBase64: undefined,
                imageAnalysisResult: result.imageAnalysisResult || undefined,
                selectedCardsNames,
                birthDate: formattedDate,
                question: reading.question,
                tarotReaderId: reading.tarotReaderId as any,
                locale: validLocale,
              });

              for await (const chunk of streamGenerator) {
                fullText += chunk;
                // Send chunk to client
                controller.enqueue(encoder.encode(chunk));
              }
            } catch (error) {
              console.error("Streaming AI failed:", error);

              const stubText = await createTarotReadingStub({
                userImageBase64: undefined,
                selectedCardsNames,
                birthDate: formattedDate,
                question: reading.question,
                tarotReaderId: reading.tarotReaderId as any,
                locale: validLocale,
              });
              fullText = stubText;
              controller.enqueue(encoder.encode(stubText));
            }
          } else {
            // Use stub for users without credits
            const stubText = await createTarotReadingStub({
              userImageBase64: undefined,
              selectedCardsNames,
              birthDate: formattedDate,
              question: reading.question,
              tarotReaderId: reading.tarotReaderId as any,
              locale: validLocale,
            });
            fullText = stubText;
            controller.enqueue(encoder.encode(stubText));
          }

          // Save full text to database
          await prisma.reading.update({
            where: { id: result.readingId },
            data: {
              predictionText: fullText,
            },
          });

          // Close the stream
          controller.close();
        } catch (error) {
          console.error("Error in streaming:", error);
          controller.error(error);
        }
      },
    });

    // Return streaming response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error processing QR form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
