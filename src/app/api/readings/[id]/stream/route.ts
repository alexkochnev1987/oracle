import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTarotReadingStream } from "@/lib/openai";
import { createTarotReadingStub } from "@/lib/tarot-reading-stub";
import { isUserAllowedForAI } from "@/lib/ai-whitelist";
import { formatDateForAI } from "@/lib/date-validation";
import { getCardById, formatCardsForPrompt } from "@/lib/tarot-cards";
import { type Locale, defaultLocale, locales } from "@/lib/i18n";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const { id } = await params;

    // Get reading from database
    const reading = await prisma.reading.findUnique({
      where: { id },
    });

    if (!reading || reading.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check if reading already has predictionText (already completed)
    if (reading.predictionText && reading.predictionText.trim().length > 0) {
      return NextResponse.json(
        { error: "Reading already completed" },
        { status: 400 }
      );
    }

    // Get request body for imageAnalysisResult and other params
    const body = await request.json().catch(() => ({}));
    const imageAnalysisResult = body.imageAnalysisResult || null;
    const validLocale: Locale = (locales as readonly string[]).includes(
      body.locale as string
    )
      ? (body.locale as Locale)
      : defaultLocale;

    // Check if user is in whitelist
    const userEmail = session.user.email;
    const isWhitelisted = isUserAllowedForAI(userEmail);

    // Verify user has credits before making GPT request (security check)
    // Even though credit was deducted in createReading, we should verify again
    // to prevent race conditions or malicious requests
    let hasCredits = false;
    if (!isWhitelisted) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      });

      if (!user || user.credits < 1) {
        // User doesn't have credits - use stub instead
        hasCredits = false;
      } else {
        hasCredits = true;
      }
    } else {
      // Whitelisted users have unlimited access
      hasCredits = true;
    }

    // Determine if user is allowed to use AI
    const isAllowed = isWhitelisted || hasCredits;

    // Format date for AI when available
    const formattedDate = reading.birthDate
      ? formatDateForAI(reading.birthDate)
      : undefined;

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
          // Use streaming AI if user is allowed (whitelisted or has credits)
          // Credit was already deducted in createReading, so we should use AI
          if (isAllowed) {
            try {
              const streamGenerator = createTarotReadingStream({
                userImageBase64: reading.userImageUrl ? undefined : undefined, // We already have imageAnalysisResult
                imageAnalysisResult: imageAnalysisResult || undefined,
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
              // Fallback to stub
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
            // Use stub for users without credits (shouldn't happen as credit is deducted upfront)
            const stubText = await createTarotReadingStub({
              userImageBase64: undefined,
              selectedCardsNames,
              birthDate: formattedDate,
              question: reading.question,
              tarotReaderId: reading.tarotReaderId as any,
              locale: validLocale,
            });
            fullText = stubText;
            // Send stub text as single chunk
            controller.enqueue(encoder.encode(stubText));
          }

          // Save full text to database
          await prisma.reading.update({
            where: { id },
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
    console.error("Error in stream route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
