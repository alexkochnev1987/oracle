/**
 * AI Model Testing Framework
 *
 * This framework provides comprehensive testing capabilities for the Oracle application's
 * AI models, including image analysis and tarot reading generation.
 */

export {
  TestRunner,
  type TestRunConfig,
  type TestExecutionResult,
} from "./test-runner";
export { AIEvaluator } from "./ai-evaluator";
export { ReportGenerator } from "./report-generator";
export { PerformanceMonitor } from "./performance-monitor";
export {
  basicTestDataset,
  getAvailableDatasets,
  getTestDataset,
  filterTestCasesByCategory,
  filterTestCasesByDifficulty,
  getRandomTestCases,
} from "./test-dataset";
export * from "./types";

// Re-export CLI for programmatic usage
export { default as CLI } from "./cli";

/**
 * Quick test utilities
 */
export { runQuickTest } from "./test-runner";
