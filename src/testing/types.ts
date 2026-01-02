export interface TestCase {
  id: string;
  name: string;
  imageUrl: string;
  question: string;
  expectedThemes: string[];
  difficulty: "easy" | "medium" | "hard";
  category: "portrait" | "abstract" | "nature" | "object";
}

export interface TestDataset {
  name: string;
  description: string;
  version: string;
  testCases: TestCase[];
}

export interface TestResult {
  id: string;
  testCaseId: string;
  oracleType: string;
  imageAnalysis: string;
  tarotReading: string;
  responseTimeMs: number;
  tokenUsage?: number;
  aiEvaluationScore: AIEvaluationScore;
  overallScore: number;
  createdAt: Date;
}

export interface AIEvaluationScore {
  imageAnalysisAccuracy: number; // 1-10 (now represents card selection relevance)
  readingCoherence: number; // 1-10
  oracleConsistency: number; // 1-10
  userExperienceQuality: number; // 1-10
  relevanceToQuestion: number; // 1-10
  detailedFeedback: {
    imageAnalysis: string; // Now contains card information
    tarotReading: string;
    suggestions: string[];
  };
}

export interface TestRunSummary {
  id: string;
  name: string;
  timestamp: Date;
  totalTests: number;
  averageScores: {
    overall: number;
    imageAnalysisAccuracy: number; // Card selection relevance
    readingCoherence: number;
    oracleConsistency: number;
    userExperienceQuality: number;
    relevanceToQuestion: number;
  };
  bestOracle: string;
  worstOracle: string;
  performanceMetrics: {
    averageResponseTime: number;
    totalTokenUsage: number;
    averageTokensPerTest: number;
  };
}

export interface TestRunReport {
  testRun: TestRunSummary;
  results: TestResult[];
  comparisons: {
    byOracle: Record<
      string,
      {
        averageScore: number;
        testCount: number;
        strengths: string[];
        weaknesses: string[];
      }
    >;
    byCategory: Record<
      string,
      {
        averageScore: number;
        testCount: number;
        bestOracle: string;
        worstOracle: string;
      }
    >;
    byDifficulty: Record<
      string,
      {
        averageScore: number;
        testCount: number;
        performanceTrend: string;
      }
    >;
  };
}
