import OpenAI from "openai";
import { prisma } from "../lib/prisma";
import { TestCase, TestResult, AIEvaluationScore } from "./types";

/**
 * AI-powered evaluation system using GPT-4o to assess test results
 */
export class AIEvaluator {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required for AI evaluation");
    }
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Evaluate all test results for a test run
   */
  async evaluateTestRun(testRunId: string): Promise<void> {
    console.log(`Starting AI evaluation for test run: ${testRunId}`);

    // Get all test results for this run
    const testResults = await (prisma as any).testResult.findMany({
      where: {
        testCase: {
          testRunId,
        },
      },
      include: {
        testCase: true,
      },
    });

    console.log(`Found ${testResults.length} test results to evaluate`);

    // Evaluate each result
    for (const result of testResults) {
      console.log(`Evaluating result: ${result.id}`);

      try {
        const evaluation = await this.evaluateTestResult(
          {
            id: result.testCase.id,
            name: result.testCase.name,
            imageUrl: result.testCase.imageUrl,
            question: result.testCase.question,
            expectedThemes: result.testCase.expectedThemes as string[],
            difficulty: result.testCase.difficulty as
              | "easy"
              | "medium"
              | "hard",
            category: result.testCase.category as
              | "portrait"
              | "abstract"
              | "nature"
              | "object",
          },
          {
            id: result.id,
            testCaseId: result.testCaseId,
            oracleType: result.oracleType,
            imageAnalysis: result.imageAnalysis,
            tarotReading: result.tarotReading,
            responseTimeMs: result.responseTimeMs,
            tokenUsage: result.tokenUsage || 0,
            aiEvaluationScore: result.aiEvaluationScore as AIEvaluationScore,
            overallScore: result.overallScore,
            createdAt: result.createdAt,
          }
        );

        // Update the result with evaluation scores
        await (prisma as any).testResult.update({
          where: { id: result.id },
          data: {
            aiEvaluationScore: evaluation as any,
            overallScore: this.calculateOverallScore(evaluation),
          },
        });

        console.log(
          `  ✓ Evaluated with score: ${this.calculateOverallScore(
            evaluation
          ).toFixed(2)}`
        );
      } catch (error) {
        console.error(
          `  ✗ Evaluation failed: ${
            error instanceof Error ? error.message : error
          }`
        );
      }
    }

    console.log("AI evaluation completed");
  }

  /**
   * Evaluate a single test result
   */
  async evaluateTestResult(
    testCase: TestCase,
    result: TestResult
  ): Promise<AIEvaluationScore> {
    const evaluationPrompt = this.buildEvaluationPrompt(testCase, result);

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: this.getEvaluationSystemPrompt(),
        },
        {
          role: "user",
          content: evaluationPrompt,
        },
      ],
      max_tokens: 1500,
      temperature: 0.3, // Lower temperature for more consistent evaluation
    });

    const evaluationText = response.choices[0]?.message?.content || "";
    return this.parseEvaluationResponse(evaluationText);
  }

  /**
   * Build the evaluation prompt for a specific test case and result
   */
  private buildEvaluationPrompt(
    testCase: TestCase,
    result: TestResult
  ): string {
    return `
Please evaluate the following AI-generated image analysis and tarot reading:

## Test Case Information
- **Test Name**: ${testCase.name}
- **Category**: ${testCase.category}
- **Difficulty**: ${testCase.difficulty}
- **Question**: "${testCase.question}"
- **Expected Themes**: ${testCase.expectedThemes.join(", ")}
- **Oracle Type**: ${result.oracleType}

## AI-Generated Content

### Selected Tarot Cards
${result.imageAnalysis}

### Tarot Reading
${result.tarotReading}

## Performance Metrics
- **Response Time**: ${result.responseTimeMs}ms
- **Estimated Tokens**: ${result.tokenUsage}

Please provide your evaluation in the specified JSON format.
    `.trim();
  }

  /**
   * System prompt for the AI evaluator
   */
  private getEvaluationSystemPrompt(): string {
    return `
You are an expert AI evaluator specializing in assessing the quality of image analysis and tarot reading generation systems.

Your task is to evaluate AI-generated content across multiple dimensions and provide detailed, constructive feedback.

## Evaluation Criteria

### Card Selection Relevance (1-10)
- Are the selected tarot cards appropriate for the question asked?
- Do the cards work well together in the reading context?
- Is the card combination meaningful and insightful?

### Reading Coherence and Depth (1-10)
- Is the tarot reading logically structured and flowing?
- Does it provide meaningful insights and guidance?
- Is the language engaging and appropriate for the context?

### Oracle Consistency (1-10)
- Does the reading match the expected personality/style of the oracle type?
- Is the tone and approach consistent throughout?
- Are the oracle-specific characteristics well-represented?

### User Experience Quality (1-10)
- Would this reading be valuable and satisfying to a user?
- Is it personalized and relevant to their situation?
- Does it provide actionable insights or meaningful reflection?

### Relevance to Question (1-10)
- How well does the reading address the specific question asked?
- Are the insights connected to the user's inquiry?
- Is the guidance appropriate for the question's context?

## Response Format

You must respond with a valid JSON object in this exact format:

{
  "imageAnalysisAccuracy": <score 1-10>,
  "readingCoherence": <score 1-10>,
  "oracleConsistency": <score 1-10>,
  "userExperienceQuality": <score 1-10>,
  "relevanceToQuestion": <score 1-10>,
  "detailedFeedback": {
    "imageAnalysis": "<detailed feedback on image analysis quality>",
    "tarotReading": "<detailed feedback on tarot reading quality>",
    "suggestions": [
      "<specific improvement suggestion 1>",
      "<specific improvement suggestion 2>",
      "<specific improvement suggestion 3>"
    ]
  }
}

Be thorough but concise in your feedback. Focus on specific, actionable insights.
    `.trim();
  }

  /**
   * Parse the AI evaluation response into structured data
   */
  private parseEvaluationResponse(response: string): AIEvaluationScore {
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in evaluation response");
      }

      const evaluation = JSON.parse(jsonMatch[0]);

      // Validate the structure
      const requiredFields = [
        "imageAnalysisAccuracy", // Now represents card selection relevance
        "readingCoherence",
        "oracleConsistency",
        "userExperienceQuality",
        "relevanceToQuestion",
        "detailedFeedback",
      ];

      for (const field of requiredFields) {
        if (!(field in evaluation)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validate score ranges
      const scoreFields = [
        "imageAnalysisAccuracy", // Now represents card selection relevance
        "readingCoherence",
        "oracleConsistency",
        "userExperienceQuality",
        "relevanceToQuestion",
      ];

      for (const field of scoreFields) {
        const score = evaluation[field];
        if (typeof score !== "number" || score < 1 || score > 10) {
          throw new Error(`Invalid score for ${field}: ${score}`);
        }
      }

      return evaluation as AIEvaluationScore;
    } catch (error) {
      console.error("Failed to parse evaluation response:", error);
      console.error("Response was:", response);

      // Return a default evaluation in case of parsing failure
      return {
        imageAnalysisAccuracy: 5, // Card selection relevance
        readingCoherence: 5,
        oracleConsistency: 5,
        userExperienceQuality: 5,
        relevanceToQuestion: 5,
        detailedFeedback: {
          imageAnalysis: "Evaluation parsing failed - manual review required",
          tarotReading: "Evaluation parsing failed - manual review required",
          suggestions: [
            "Review evaluation system",
            "Check response format",
            "Manual evaluation needed",
          ],
        },
      };
    }
  }

  /**
   * Calculate overall score from individual dimension scores
   */
  private calculateOverallScore(evaluation: AIEvaluationScore): number {
    const scores = [
      evaluation.imageAnalysisAccuracy,
      evaluation.readingCoherence,
      evaluation.oracleConsistency,
      evaluation.userExperienceQuality,
      evaluation.relevanceToQuestion,
    ];

    // Weighted average (you can adjust weights as needed)
    const weights = [0.2, 0.25, 0.2, 0.25, 0.1]; // Sum = 1.0

    let weightedSum = 0;
    for (let i = 0; i < scores.length; i++) {
      weightedSum += scores[i] * weights[i];
    }

    return Math.round(weightedSum * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get evaluation summary for a test run
   */
  async getEvaluationSummary(testRunId: string) {
    const results = await (prisma as any).testResult.findMany({
      where: {
        testCase: {
          testRunId,
        },
      },
      include: {
        testCase: true,
      },
    });

    if (results.length === 0) {
      return null;
    }

    const scores = results.map(
      (r: any) => r.aiEvaluationScore as AIEvaluationScore
    );
    const overallScores = results.map((r: any) => r.overallScore);

    return {
      totalTests: results.length,
      averageOverallScore:
        overallScores.reduce((a: number, b: number) => a + b, 0) /
        overallScores.length,
      averageScores: {
        imageAnalysisAccuracy:
          scores.reduce(
            (a: number, b: AIEvaluationScore) => a + b.imageAnalysisAccuracy,
            0
          ) / scores.length,
        readingCoherence:
          scores.reduce(
            (a: number, b: AIEvaluationScore) => a + b.readingCoherence,
            0
          ) / scores.length,
        oracleConsistency:
          scores.reduce(
            (a: number, b: AIEvaluationScore) => a + b.oracleConsistency,
            0
          ) / scores.length,
        userExperienceQuality:
          scores.reduce(
            (a: number, b: AIEvaluationScore) => a + b.userExperienceQuality,
            0
          ) / scores.length,
        relevanceToQuestion:
          scores.reduce(
            (a: number, b: AIEvaluationScore) => a + b.relevanceToQuestion,
            0
          ) / scores.length,
      },
      scoreDistribution: {
        excellent: overallScores.filter((s: number) => s >= 8).length,
        good: overallScores.filter((s: number) => s >= 6 && s < 8).length,
        average: overallScores.filter((s: number) => s >= 4 && s < 6).length,
        poor: overallScores.filter((s: number) => s < 4).length,
      },
    };
  }
}
