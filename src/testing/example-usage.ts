/**
 * Example usage of the AI Testing Framework
 *
 * This file demonstrates how to run tests programmatically
 */

import { TestRunner, runQuickTest } from "./test-runner";
import { AIEvaluator } from "./ai-evaluator";
import { ReportGenerator } from "./report-generator";
import { basicTestDataset, getRandomTestCases } from "./test-dataset";

async function runExampleTests() {
  console.log("🎯 Running Example AI Tests\n");

  try {
    // Example 1: Quick test with a few random test cases
    console.log("📋 Running Quick Test...");
    const quickTestCases = getRandomTestCases(basicTestDataset.testCases, 3);

    const quickResult = await runQuickTest(quickTestCases, {
      oracles: ["cosmic-oracle", "alien-seer"],
      locale: "en",
      name: "Example Quick Test",
    });

    console.log(
      `✅ Quick test completed: ${quickResult.summary.successfulTests} successful tests`
    );
    console.log(
      `⏱️  Average response time: ${quickResult.summary.averageResponseTime.toFixed(
        0
      )}ms`
    );
    console.log(
      `🔤 Total tokens used: ${quickResult.summary.totalTokenUsage}\n`
    );

    // Example 2: Run AI evaluation
    console.log("🤖 Running AI Evaluation...");
    const evaluator = new AIEvaluator();
    await evaluator.evaluateTestRun(quickResult.testRunId);

    const summary = await evaluator.getEvaluationSummary(quickResult.testRunId);
    if (summary) {
      console.log(
        `📊 Average overall score: ${summary.averageOverallScore.toFixed(2)}/10`
      );
      console.log(`📈 Score breakdown:`);
      console.log(
        `   Card Selection: ${summary.averageScores.imageAnalysisAccuracy.toFixed(
          2
        )}/10`
      );
      console.log(
        `   Reading Coherence: ${summary.averageScores.readingCoherence.toFixed(
          2
        )}/10`
      );
      console.log(
        `   Oracle Consistency: ${summary.averageScores.oracleConsistency.toFixed(
          2
        )}/10`
      );
      console.log(
        `   User Experience: ${summary.averageScores.userExperienceQuality.toFixed(
          2
        )}/10`
      );
      console.log(
        `   Question Relevance: ${summary.averageScores.relevanceToQuestion.toFixed(
          2
        )}/10\n`
      );
    }

    // Example 3: Generate report
    console.log("📄 Generating HTML Report...");
    const reportGenerator = new ReportGenerator();
    const reportPath = `test-report-${Date.now()}.html`;
    await reportGenerator.exportTestRun(
      quickResult.testRunId,
      reportPath,
      "html"
    );
    console.log(`✅ Report saved to: ${reportPath}\n`);

    console.log("🎉 Example tests completed successfully!");
    console.log(`📋 Test Run ID: ${quickResult.testRunId}`);
  } catch (error) {
    console.error(
      "❌ Example tests failed:",
      error instanceof Error ? error.message : error
    );
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  runExampleTests();
}

export { runExampleTests };


