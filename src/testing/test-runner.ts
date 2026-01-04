import { readFile } from "fs/promises";
import { join } from "path";
import { prisma } from "../lib/prisma";
import { createTarotReading, analyzeUserImage } from "../lib/openai";
import { TarotReaderId } from "../lib/tarot-readers";
import { Locale } from "../lib/i18n";
import { getRandomSpread, formatCardsForPrompt } from "../lib/tarot-cards";
import { TestCase, TestResult, AIEvaluationScore } from "./types";

export interface TestRunConfig {
  name: string;
  description?: string;
  testCases: TestCase[];
  oracles: TarotReaderId[];
  locale: Locale;
  birthDate?: string;
}

export interface TestExecutionResult {
  testRunId: string;
  results: TestResult[];
  summary: {
    totalTests: number;
    successfulTests: number;
    failedTests: number;
    averageResponseTime: number;
    totalTokenUsage: number;
  };
}

/**
 * Main test runner class for executing AI model tests
 */
export class TestRunner {
  private readonly defaultBirthDate = "1990-01-01";

  /**
   * Execute a complete test run
   */
  async runTests(config: TestRunConfig): Promise<TestExecutionResult> {
    console.log(`Starting test run: ${config.name}`);
    console.log(`Test cases: ${config.testCases.length}`);
    console.log(`Oracles: ${config.oracles.join(", ")}`);

    // Create test run record
    const testRun = await (prisma as any).testRun.create({
      data: {
        name: config.name,
        description: config.description || "",
      },
    });

    // Create test case records
    const testCaseRecords = await Promise.all(
      config.testCases.map((testCase) =>
        (prisma as any).testCase.create({
          data: {
            testRunId: testRun.id,
            name: testCase.name,
            imageUrl: testCase.imageUrl,
            question: testCase.question,
            expectedThemes: testCase.expectedThemes,
            difficulty: testCase.difficulty,
            category: testCase.category,
          },
        })
      )
    );

    const results: TestResult[] = [];
    let totalResponseTime = 0;
    let totalTokenUsage = 0;
    let successfulTests = 0;
    let failedTests = 0;

    // Execute tests for each oracle and test case combination
    for (const oracle of config.oracles) {
      console.log(`\nTesting oracle: ${oracle}`);

      for (let i = 0; i < config.testCases.length; i++) {
        const testCase = config.testCases[i];
        const testCaseRecord = testCaseRecords[i];

        console.log(`  Running test: ${testCase.name}`);

        try {
          const result = await this.executeTestCase(
            testCase,
            testCaseRecord.id,
            oracle,
            config.locale,
            config.birthDate || this.defaultBirthDate
          );

          results.push(result);
          totalResponseTime += result.responseTimeMs;
          totalTokenUsage += result.tokenUsage || 0;
          successfulTests++;

          console.log(`    ✓ Completed in ${result.responseTimeMs}ms`);
        } catch (error) {
          console.error(
            `    ✗ Failed: ${error instanceof Error ? error.message : error}`
          );
          failedTests++;
        }
      }
    }

    console.log(
      `\nTest run completed: ${successfulTests} successful, ${failedTests} failed`
    );

    return {
      testRunId: testRun.id,
      results,
      summary: {
        totalTests: config.testCases.length * config.oracles.length,
        successfulTests,
        failedTests,
        averageResponseTime: totalResponseTime / successfulTests || 0,
        totalTokenUsage,
      },
    };
  }

  /**
   * Execute a single test case for a specific oracle
   */
  private async executeTestCase(
    testCase: TestCase,
    testCaseId: string,
    oracle: TarotReaderId,
    locale: Locale,
    birthDate: string
  ): Promise<TestResult> {
    const startTime = Date.now();

    // Generate random tarot cards for the reading (3-5 cards)
    const cardCount = Math.floor(Math.random() * 3) + 3; // 3-5 cards
    const selectedCards = getRandomSpread(cardCount);
    const selectedCardsNames = formatCardsForPrompt(selectedCards, locale);

    console.log(`    Generated ${cardCount} cards: ${selectedCardsNames}`);

    // Generate tarot reading with selected cards
    const tarotReading = await createTarotReading({
      selectedCardsNames,
      birthDate,
      question: testCase.question,
      tarotReaderId: oracle,
      locale,
    });

    const responseTimeMs = Date.now() - startTime;

    // Create placeholder AI evaluation score (will be filled by AI evaluator)
    const aiEvaluationScore: AIEvaluationScore = {
      imageAnalysisAccuracy: 0, // Not used for card-only tests
      readingCoherence: 0,
      oracleConsistency: 0,
      userExperienceQuality: 0,
      relevanceToQuestion: 0,
      detailedFeedback: {
        imageAnalysis: `Cards used: ${selectedCardsNames}`,
        tarotReading: "",
        suggestions: [],
      },
    };

    // Save result to database
    const testResult = await (prisma as any).testResult.create({
      data: {
        testCaseId,
        oracleType: oracle,
        imageAnalysis: `Cards: ${selectedCardsNames}`, // Store selected cards info
        tarotReading,
        responseTimeMs,
        tokenUsage: this.estimateTokenUsage(selectedCardsNames + tarotReading),
        aiEvaluationScore: aiEvaluationScore as any,
        overallScore: 0, // Will be calculated by AI evaluator
      },
    });

    return {
      id: testResult.id,
      testCaseId,
      oracleType: oracle,
      imageAnalysis: `Cards: ${selectedCardsNames}`,
      tarotReading,
      responseTimeMs,
      tokenUsage: testResult.tokenUsage || 0,
      aiEvaluationScore,
      overallScore: 0,
      createdAt: testResult.createdAt,
    };
  }

  /**
   * Load test image and convert to base64
   */
  private async loadTestImage(imageUrl: string): Promise<string> {
    try {
      // Remove leading slash and construct path
      const imagePath = join(
        process.cwd(),
        "public",
        imageUrl.replace(/^\//, "")
      );
      const imageBuffer = await readFile(imagePath);

      // For SVG files, we need to convert to base64
      if (imagePath.endsWith(".svg")) {
        const base64 = imageBuffer.toString("base64");
        return `data:image/svg+xml;base64,${base64}`;
      }

      // For other image types
      const base64 = imageBuffer.toString("base64");
      const extension = imagePath.split(".").pop()?.toLowerCase();
      const mimeType = this.getMimeType(extension || "");
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      throw new Error(`Failed to load test image: ${imageUrl}`);
    }
  }

  /**
   * Get MIME type for image extension
   */
  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      svg: "image/svg+xml",
      webp: "image/webp",
    };
    return mimeTypes[extension] || "image/jpeg";
  }

  /**
   * Estimate token usage (rough approximation)
   */
  private estimateTokenUsage(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  /**
   * Get all available oracle types
   */
  static getAllOracleTypes(): TarotReaderId[] {
    return [
      "cosmic-oracle",
      "astral-sorcerer",
      "alien-seer",
      "mechanical-prophet",
    ];
  }
}

/**
 * Utility function to create a quick test run
 */
export async function runQuickTest(
  testCases: TestCase[],
  options: {
    oracles?: TarotReaderId[];
    locale?: Locale;
    name?: string;
  } = {}
): Promise<TestExecutionResult> {
  const runner = new TestRunner();

  const config: TestRunConfig = {
    name: options.name || `Quick Test - ${new Date().toISOString()}`,
    testCases,
    oracles: options.oracles || TestRunner.getAllOracleTypes(),
    locale: options.locale || "en",
  };

  return runner.runTests(config);
}
