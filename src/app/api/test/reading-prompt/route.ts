import { NextResponse } from "next/server";
import { createTarotReadingForTest } from "@/lib/openai";
import { TarotReaderId } from "@/lib/tarot-readers";

// Only available in development mode
const isDevelopment = process.env.NODE_ENV === "development";

// All 4 oracles to test
const ALL_ORACLES: TarotReaderId[] = [
  "cosmic-oracle",
  "astral-sorcerer",
  "alien-seer",
  "mechanical-prophet",
];

interface TestCase {
  imageDescription: string;
  birthDate: string;
  question: string;
  cards: string;
}

export async function POST(request: Request) {
  if (!isDevelopment) {
    return NextResponse.json(
      { error: "This endpoint is only available in development mode" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { tests, locale = "ru" } = body as {
      tests: TestCase[];
      locale?: "ru" | "en";
    };

    if (!tests || !Array.isArray(tests)) {
      return NextResponse.json(
        { error: "Tests array is required" },
        { status: 400 }
      );
    }

    if (tests.length === 0) {
      return NextResponse.json(
        { error: "At least one test case is required" },
        { status: 400 }
      );
    }

    const results = [];

    // Process each test sequentially
    for (let testIndex = 0; testIndex < tests.length; testIndex++) {
      const test = tests[testIndex];

      // Validate test case
      if (
        !test.imageDescription ||
        !test.birthDate ||
        !test.question ||
        !test.cards
      ) {
        // Add error for this test case
        for (const oracle of ALL_ORACLES) {
          results.push({
            testIndex: testIndex + 1,
            oracle,
            reading: null,
            success: false,
            error:
              "Missing required fields: imageDescription, birthDate, question, or cards",
          });
        }
        continue;
      }

      // For each test, run on all 4 oracles
      // Use Promise.all to run oracles in parallel for the same test
      const oraclePromises = ALL_ORACLES.map(async (oracle) => {
        try {
          const reading = await createTarotReadingForTest({
            imageAnalysisResult: test.imageDescription,
            selectedCardsNames: test.cards,
            birthDate: test.birthDate,
            question: test.question,
            tarotReaderId: oracle,
            locale: locale as "ru" | "en",
          });

          return {
            testIndex: testIndex + 1,
            oracle,
            reading,
            success: true,
            error: null,
          };
        } catch (error) {
          return {
            testIndex: testIndex + 1,
            oracle,
            reading: null,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      });

      // Wait for all oracles to complete for this test
      const testResults = await Promise.all(oraclePromises);
      results.push(...testResults);
    }

    return NextResponse.json({
      locale,
      totalTests: tests.length,
      totalOracles: ALL_ORACLES.length,
      totalResults: results.length,
      results,
    });
  } catch (error) {
    console.error("Error in reading prompt test API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
