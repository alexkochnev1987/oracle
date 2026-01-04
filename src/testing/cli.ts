#!/usr/bin/env tsx

import { Command } from "commander";
import { TestRunner, TestRunConfig } from "./test-runner";
import { AIEvaluator } from "./ai-evaluator";
import { ReportGenerator } from "./report-generator";
import { PerformanceMonitor } from "./performance-monitor";
import {
  getTestDataset,
  getAvailableDatasets,
  filterTestCasesByCategory,
  filterTestCasesByDifficulty,
  getRandomTestCases,
} from "./test-dataset";
import { TarotReaderId } from "../lib/tarot-readers";
import { Locale } from "../lib/i18n";
import { prisma } from "../lib/prisma";

const program = new Command();

program
  .name("ai-test")
  .description("AI Model Testing Framework for Oracle Application")
  .version("1.0.0");

/**
 * Run tests command
 */
program
  .command("run")
  .description("Run AI model tests")
  .option(
    "-d, --dataset <name>",
    "Test dataset name",
    "Basic AI Testing Dataset"
  )
  .option(
    "-o, --oracles <oracles>",
    "Comma-separated list of oracles to test",
    "all"
  )
  .option(
    "-c, --category <category>",
    "Filter by category (portrait, abstract, nature, object)"
  )
  .option("-l, --locale <locale>", "Test locale", "en")
  .option("-n, --name <name>", "Test run name")
  .option(
    "--difficulty <difficulty>",
    "Filter by difficulty (easy, medium, hard)"
  )
  .option("--count <count>", "Limit number of test cases", parseInt)
  .option("--evaluate", "Run AI evaluation after tests")
  .option("--export <file>", "Export results to file")
  .action(async (options) => {
    try {
      console.log("🚀 Starting AI Model Tests\n");

      // Load test dataset
      const dataset = getTestDataset(options.dataset);
      if (!dataset) {
        console.error(`❌ Dataset not found: ${options.dataset}`);
        console.log("Available datasets:");
        getAvailableDatasets().forEach((d) => console.log(`  - ${d.name}`));
        process.exit(1);
      }

      // Filter test cases
      let testCases = dataset.testCases;

      if (options.category) {
        testCases = filterTestCasesByCategory(testCases, options.category);
        console.log(`📂 Filtered by category: ${options.category}`);
      }

      if (options.difficulty) {
        testCases = filterTestCasesByDifficulty(testCases, options.difficulty);
        console.log(`📊 Filtered by difficulty: ${options.difficulty}`);
      }

      if (options.count) {
        testCases = getRandomTestCases(testCases, options.count);
        console.log(`🎲 Limited to ${options.count} random test cases`);
      }

      if (testCases.length === 0) {
        console.error("❌ No test cases found with the specified filters");
        process.exit(1);
      }

      // Parse oracles
      const allOracles: TarotReaderId[] = [
        "cosmic-oracle",
        "astral-sorcerer",
        "alien-seer",
        "mechanical-prophet",
      ];
      const oracles =
        options.oracles === "all"
          ? allOracles
          : (options.oracles as string)
              .split(",")
              .map((o: string) => o.trim() as TarotReaderId);

      // Validate oracles
      const invalidOracles = oracles.filter((o) => !allOracles.includes(o));
      if (invalidOracles.length > 0) {
        console.error(`❌ Invalid oracles: ${invalidOracles.join(", ")}`);
        console.log("Available oracles:", allOracles.join(", "));
        process.exit(1);
      }

      // Create test configuration
      const config: TestRunConfig = {
        name: options.name || `Test Run - ${new Date().toISOString()}`,
        testCases,
        oracles,
        locale: options.locale as Locale,
      };

      console.log(`📋 Test Configuration:`);
      console.log(`   Dataset: ${dataset.name}`);
      console.log(`   Test Cases: ${testCases.length}`);
      console.log(`   Oracles: ${oracles.join(", ")}`);
      console.log(`   Locale: ${config.locale}`);
      console.log(`   Total Tests: ${testCases.length * oracles.length}\n`);

      // Run tests
      const runner = new TestRunner();
      const result = await runner.runTests(config);

      console.log("\n✅ Test Execution Complete!");
      console.log(`📊 Results Summary:`);
      console.log(`   Total Tests: ${result.summary.totalTests}`);
      console.log(`   Successful: ${result.summary.successfulTests}`);
      console.log(`   Failed: ${result.summary.failedTests}`);
      console.log(
        `   Average Response Time: ${result.summary.averageResponseTime.toFixed(
          0
        )}ms`
      );
      console.log(`   Total Token Usage: ${result.summary.totalTokenUsage}`);

      // Run AI evaluation if requested
      if (options.evaluate) {
        console.log("\n🤖 Running AI Evaluation...");
        const evaluator = new AIEvaluator();
        await evaluator.evaluateTestRun(result.testRunId);

        const summary = await evaluator.getEvaluationSummary(result.testRunId);
        if (summary) {
          console.log("\n📈 Evaluation Summary:");
          console.log(
            `   Average Overall Score: ${summary.averageOverallScore.toFixed(
              2
            )}/10`
          );
          console.log(`   Score Distribution:`);
          console.log(
            `     Excellent (8-10): ${summary.scoreDistribution.excellent}`
          );
          console.log(`     Good (6-8): ${summary.scoreDistribution.good}`);
          console.log(
            `     Average (4-6): ${summary.scoreDistribution.average}`
          );
          console.log(`     Poor (<4): ${summary.scoreDistribution.poor}`);
        }
      }

      // Export results if requested
      if (options.export) {
        console.log(`\n📄 Exporting results to: ${options.export}`);
        const reportGenerator = new ReportGenerator();
        await reportGenerator.exportTestRun(result.testRunId, options.export);
        console.log("✅ Export complete!");
      }

      console.log(`\n🎉 Test run completed! ID: ${result.testRunId}`);
    } catch (error) {
      console.error(
        "❌ Test run failed:",
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

/**
 * Evaluate existing test run
 */
program
  .command("evaluate <testRunId>")
  .description("Run AI evaluation on existing test results")
  .action(async (testRunId: string) => {
    try {
      console.log(`🤖 Running AI Evaluation for test run: ${testRunId}`);

      const evaluator = new AIEvaluator();
      await evaluator.evaluateTestRun(testRunId);

      const summary = await evaluator.getEvaluationSummary(testRunId);
      if (summary) {
        console.log("\n📈 Evaluation Summary:");
        console.log(`   Total Tests: ${summary.totalTests}`);
        console.log(
          `   Average Overall Score: ${summary.averageOverallScore.toFixed(
            2
          )}/10`
        );
        console.log(`   Average Scores by Dimension:`);
        console.log(
          `     Image Analysis: ${summary.averageScores.imageAnalysisAccuracy.toFixed(
            2
          )}/10`
        );
        console.log(
          `     Reading Coherence: ${summary.averageScores.readingCoherence.toFixed(
            2
          )}/10`
        );
        console.log(
          `     Oracle Consistency: ${summary.averageScores.oracleConsistency.toFixed(
            2
          )}/10`
        );
        console.log(
          `     User Experience: ${summary.averageScores.userExperienceQuality.toFixed(
            2
          )}/10`
        );
        console.log(
          `     Question Relevance: ${summary.averageScores.relevanceToQuestion.toFixed(
            2
          )}/10`
        );
      }

      console.log("\n✅ Evaluation complete!");
    } catch (error) {
      console.error(
        "❌ Evaluation failed:",
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

/**
 * Export test results
 */
program
  .command("export <testRunId> <outputFile>")
  .description("Export test results to file")
  .option("-f, --format <format>", "Export format (json, html, csv)", "json")
  .action(async (testRunId: string, outputFile: string, options) => {
    try {
      console.log(`📄 Exporting test run ${testRunId} to ${outputFile}`);

      const reportGenerator = new ReportGenerator();
      await reportGenerator.exportTestRun(
        testRunId,
        outputFile,
        options.format
      );

      console.log("✅ Export complete!");
    } catch (error) {
      console.error(
        "❌ Export failed:",
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

/**
 * List test runs
 */
program
  .command("list")
  .description("List all test runs")
  .option("-l, --limit <limit>", "Limit number of results", parseInt, 10)
  .action(async (options) => {
    try {
      const testRuns = await (prisma as any).testRun.findMany({
        orderBy: { createdAt: "desc" },
        take: options.limit,
        include: {
          _count: {
            select: {
              testCases: true,
            },
          },
        },
      });

      if (testRuns.length === 0) {
        console.log("No test runs found.");
        return;
      }

      console.log("📋 Recent Test Runs:\n");
      testRuns.forEach((run: any) => {
        console.log(`🆔 ${run.id}`);
        console.log(`   Name: ${run.name}`);
        console.log(`   Created: ${run.createdAt.toISOString()}`);
        console.log(`   Test Cases: ${run._count.testCases}`);
        if (run.description) {
          console.log(`   Description: ${run.description}`);
        }
        console.log("");
      });
    } catch (error) {
      console.error(
        "❌ Failed to list test runs:",
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

/**
 * Show datasets
 */
program
  .command("datasets")
  .description("List available test datasets")
  .action(() => {
    const datasets = getAvailableDatasets();

    console.log("📚 Available Test Datasets:\n");
    datasets.forEach((dataset) => {
      console.log(`📖 ${dataset.name}`);
      console.log(`   Version: ${dataset.version}`);
      console.log(`   Description: ${dataset.description}`);
      console.log(`   Test Cases: ${dataset.testCases.length}`);

      // Show breakdown by category
      const categories = ["portrait", "abstract", "nature", "object"] as const;
      const breakdown = categories
        .map((cat) => ({
          category: cat,
          count: dataset.testCases.filter((tc) => tc.category === cat).length,
        }))
        .filter((b) => b.count > 0);

      if (breakdown.length > 0) {
        console.log(
          `   Categories: ${breakdown
            .map((b) => `${b.category}(${b.count})`)
            .join(", ")}`
        );
      }
      console.log("");
    });
  });

/**
 * Performance monitoring commands
 */
program
  .command("performance")
  .description("Performance monitoring and analysis")
  .option("-d, --days <days>", "Number of days to analyze", parseInt, 7)
  .option("-o, --oracle <oracle>", "Specific oracle to analyze")
  .action(async (options) => {
    try {
      if (options.oracle) {
        // Oracle-specific performance analysis
        console.log(
          `📊 Performance Analysis for ${options.oracle} (last ${options.days} days)\n`
        );

        const trends = await PerformanceMonitor.getOraclePerformanceTrend(
          options.oracle,
          options.days
        );

        console.log("📈 Performance Trends:");
        console.log(
          `   Response Time: ${trends.responseTime.average.toFixed(0)}ms (${
            trends.responseTime.trend
          })`
        );
        console.log(
          `   Token Usage: ${trends.tokenUsage.average.toFixed(0)} tokens (${
            trends.tokenUsage.trend
          })`
        );
        console.log(
          `   Overall Score: ${trends.overallScore.average.toFixed(2)}/10 (${
            trends.overallScore.trend
          })`
        );
      } else {
        // Overall performance summary
        console.log(`📊 Performance Summary (last ${options.days} days)\n`);

        const summary = await PerformanceMonitor.generatePerformanceSummary(
          options.days
        );

        console.log("📈 Key Metrics:");
        console.log(`   Total Tests: ${summary.totalTests}`);
        console.log(`   Tests per Day: ${summary.testsPerDay.toFixed(1)}`);
        console.log(
          `   Average Response Time: ${summary.averageResponseTime.toFixed(
            0
          )}ms`
        );
        console.log(
          `   Average Token Usage: ${summary.averageTokenUsage.toFixed(
            0
          )} tokens`
        );
        console.log(`   Average Score: ${summary.averageScore.toFixed(2)}/10`);
        console.log(`   Performance Trend: ${summary.performanceTrend}`);
        console.log(`   Top Performing Oracle: ${summary.topPerformingOracle}`);

        console.log("\n💡 Recommendations:");
        summary.recommendations.forEach((rec) => console.log(`   • ${rec}`));

        // Show alerts
        const alerts = await PerformanceMonitor.getPerformanceAlerts();
        const totalAlerts =
          alerts.slowResponses.length +
          alerts.highTokenUsage.length +
          alerts.lowScores.length;

        if (totalAlerts > 0) {
          console.log("\n⚠️  Performance Alerts:");
          if (alerts.slowResponses.length > 0) {
            console.log(
              `   • ${alerts.slowResponses.length} slow responses detected`
            );
          }
          if (alerts.highTokenUsage.length > 0) {
            console.log(
              `   • ${alerts.highTokenUsage.length} high token usage instances`
            );
          }
          if (alerts.lowScores.length > 0) {
            console.log(`   • ${alerts.lowScores.length} low quality scores`);
          }
        } else {
          console.log("\n✅ No performance alerts detected");
        }
      }
    } catch (error) {
      console.error(
        "❌ Performance analysis failed:",
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

/**
 * Compare oracles performance
 */
program
  .command("compare")
  .description("Compare performance across all oracles")
  .option("-d, --days <days>", "Number of days to analyze", parseInt, 30)
  .action(async (options) => {
    try {
      console.log(
        `🔍 Oracle Performance Comparison (last ${options.days} days)\n`
      );

      const comparison =
        await PerformanceMonitor.getOraclePerformanceComparison(options.days);

      console.log("📊 Performance Metrics by Oracle:");
      console.log("");

      // Sort by average score
      const sortedOracles = Object.entries(comparison).sort(
        ([, a], [, b]) => b.averageScore - a.averageScore
      );

      sortedOracles.forEach(([oracle, metrics], index) => {
        const rank = index + 1;
        const medal =
          rank === 1
            ? "🥇"
            : rank === 2
            ? "🥈"
            : rank === 3
            ? "🥉"
            : `${rank}.`;

        console.log(`${medal} ${oracle}`);
        console.log(`   Average Score: ${metrics.averageScore.toFixed(2)}/10`);
        console.log(
          `   Response Time: ${metrics.averageResponseTime.toFixed(0)}ms`
        );
        console.log(
          `   Token Usage: ${metrics.averageTokenUsage.toFixed(0)} tokens`
        );
        console.log(
          `   Efficiency: ${metrics.efficiency.toFixed(2)} score/1k tokens`
        );
        console.log(`   Test Count: ${metrics.testCount}`);
        console.log("");
      });
    } catch (error) {
      console.error(
        "❌ Oracle comparison failed:",
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

// Parse command line arguments
if (require.main === module) {
  program.parse();
}
