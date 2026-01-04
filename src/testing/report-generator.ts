import { writeFile } from 'fs/promises';
import { join } from 'path';
import { prisma } from '../lib/prisma';
import { TestRunReport, TestRunSummary, TestResult, AIEvaluationScore } from './types';

/**
 * Report generator for test results with multiple export formats
 */
export class ReportGenerator {
  
  /**
   * Export a test run to various formats
   */
  async exportTestRun(
    testRunId: string, 
    outputPath: string, 
    format: 'json' | 'html' | 'csv' = 'json'
  ): Promise<void> {
    const report = await this.generateTestRunReport(testRunId);
    
    switch (format) {
      case 'json':
        await this.exportToJSON(report, outputPath);
        break;
      case 'html':
        await this.exportToHTML(report, outputPath);
        break;
      case 'csv':
        await this.exportToCSV(report, outputPath);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Generate comprehensive test run report
   */
  async generateTestRunReport(testRunId: string): Promise<TestRunReport> {
    // Get test run details
    const testRun = await (prisma as any).testRun.findUnique({
      where: { id: testRunId },
      include: {
        testCases: {
          include: {
            results: true,
          },
        },
      },
    });

    if (!testRun) {
      throw new Error(`Test run not found: ${testRunId}`);
    }

    // Collect all results
    const allResults: TestResult[] = [];
    for (const testCase of testRun.testCases) {
      for (const result of testCase.results) {
        allResults.push({
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
        });
      }
    }

    // Calculate summary statistics
    const summary = this.calculateTestRunSummary(testRun, allResults);
    
    // Generate comparisons
    const comparisons = this.generateComparisons(testRun.testCases, allResults);

    return {
      testRun: summary,
      results: allResults,
      comparisons,
    };
  }

  /**
   * Calculate test run summary statistics
   */
  private calculateTestRunSummary(testRun: any, results: TestResult[]): TestRunSummary {
    if (results.length === 0) {
      throw new Error('No results found for test run');
    }

    const overallScores = results.map(r => r.overallScore);
    const responseTimes = results.map(r => r.responseTimeMs);
    const tokenUsages = results.map(r => r.tokenUsage || 0);

    // Calculate average scores by dimension
    const evaluationScores = results.map(r => r.aiEvaluationScore);
    const averageScores = {
      overall: overallScores.reduce((a, b) => a + b, 0) / overallScores.length,
      imageAnalysisAccuracy: evaluationScores.reduce((a, b) => a + b.imageAnalysisAccuracy, 0) / evaluationScores.length,
      readingCoherence: evaluationScores.reduce((a, b) => a + b.readingCoherence, 0) / evaluationScores.length,
      oracleConsistency: evaluationScores.reduce((a, b) => a + b.oracleConsistency, 0) / evaluationScores.length,
      userExperienceQuality: evaluationScores.reduce((a, b) => a + b.userExperienceQuality, 0) / evaluationScores.length,
      relevanceToQuestion: evaluationScores.reduce((a, b) => a + b.relevanceToQuestion, 0) / evaluationScores.length,
    };

    // Find best and worst performing oracles
    const oraclePerformance = this.calculateOraclePerformance(results);
    const bestOracle = Object.entries(oraclePerformance)
      .sort(([,a], [,b]) => b.averageScore - a.averageScore)[0]?.[0] || 'unknown';
    const worstOracle = Object.entries(oraclePerformance)
      .sort(([,a], [,b]) => a.averageScore - b.averageScore)[0]?.[0] || 'unknown';

    return {
      id: testRun.id,
      name: testRun.name,
      timestamp: testRun.createdAt,
      totalTests: results.length,
      averageScores,
      bestOracle,
      worstOracle,
      performanceMetrics: {
        averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
        totalTokenUsage: tokenUsages.reduce((a, b) => a + b, 0),
        averageTokensPerTest: tokenUsages.reduce((a, b) => a + b, 0) / tokenUsages.length,
      },
    };
  }

  /**
   * Generate detailed comparisons
   */
  private generateComparisons(testCases: any[], results: TestResult[]) {
    return {
      byOracle: this.calculateOraclePerformance(results),
      byCategory: this.calculateCategoryPerformance(testCases, results),
      byDifficulty: this.calculateDifficultyPerformance(testCases, results),
    };
  }

  /**
   * Calculate performance by oracle type
   */
  private calculateOraclePerformance(results: TestResult[]) {
    const oracleGroups = this.groupBy(results, r => r.oracleType);
    const performance: Record<string, any> = {};

    for (const [oracle, oracleResults] of Object.entries(oracleGroups)) {
      const scores = oracleResults.map(r => r.overallScore);
      const evaluations = oracleResults.map(r => r.aiEvaluationScore);
      
      // Analyze strengths and weaknesses
      const dimensionScores = {
        imageAnalysis: evaluations.reduce((a, b) => a + b.imageAnalysisAccuracy, 0) / evaluations.length,
        readingCoherence: evaluations.reduce((a, b) => a + b.readingCoherence, 0) / evaluations.length,
        oracleConsistency: evaluations.reduce((a, b) => a + b.oracleConsistency, 0) / evaluations.length,
        userExperience: evaluations.reduce((a, b) => a + b.userExperienceQuality, 0) / evaluations.length,
        relevance: evaluations.reduce((a, b) => a + b.relevanceToQuestion, 0) / evaluations.length,
      };

      const sortedDimensions = Object.entries(dimensionScores)
        .sort(([,a], [,b]) => b - a);

      performance[oracle] = {
        averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        testCount: oracleResults.length,
        strengths: sortedDimensions.slice(0, 2).map(([dim]) => dim),
        weaknesses: sortedDimensions.slice(-2).map(([dim]) => dim),
      };
    }

    return performance;
  }

  /**
   * Calculate performance by test category
   */
  private calculateCategoryPerformance(testCases: any[], results: TestResult[]) {
    const categoryMap = new Map(testCases.map(tc => [tc.id, tc.category]));
    const categoryGroups = this.groupBy(results, r => categoryMap.get(r.testCaseId) || 'unknown');
    const performance: Record<string, any> = {};

    for (const [category, categoryResults] of Object.entries(categoryGroups)) {
      const oraclePerformance = this.calculateOraclePerformance(categoryResults);
      const scores = categoryResults.map(r => r.overallScore);
      
      const sortedOracles = Object.entries(oraclePerformance)
        .sort(([,a], [,b]) => b.averageScore - a.averageScore);

      performance[category] = {
        averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        testCount: categoryResults.length,
        bestOracle: sortedOracles[0]?.[0] || 'unknown',
        worstOracle: sortedOracles[sortedOracles.length - 1]?.[0] || 'unknown',
      };
    }

    return performance;
  }

  /**
   * Calculate performance by test difficulty
   */
  private calculateDifficultyPerformance(testCases: any[], results: TestResult[]) {
    const difficultyMap = new Map(testCases.map(tc => [tc.id, tc.difficulty]));
    const difficultyGroups = this.groupBy(results, r => difficultyMap.get(r.testCaseId) || 'unknown');
    const performance: Record<string, any> = {};

    for (const [difficulty, difficultyResults] of Object.entries(difficultyGroups)) {
      const scores = difficultyResults.map(r => r.overallScore);
      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      
      let performanceTrend = 'stable';
      if (difficulty === 'easy' && averageScore > 7) performanceTrend = 'strong';
      else if (difficulty === 'hard' && averageScore < 5) performanceTrend = 'challenging';
      else if (difficulty === 'medium' && averageScore > 6) performanceTrend = 'good';

      performance[difficulty] = {
        averageScore,
        testCount: difficultyResults.length,
        performanceTrend,
      };
    }

    return performance;
  }

  /**
   * Export report to JSON format
   */
  private async exportToJSON(report: TestRunReport, outputPath: string): Promise<void> {
    const jsonContent = JSON.stringify(report, null, 2);
    await writeFile(outputPath, jsonContent, 'utf-8');
  }

  /**
   * Export report to HTML format
   */
  private async exportToHTML(report: TestRunReport, outputPath: string): Promise<void> {
    const html = this.generateHTMLReport(report);
    await writeFile(outputPath, html, 'utf-8');
  }

  /**
   * Export report to CSV format
   */
  private async exportToCSV(report: TestRunReport, outputPath: string): Promise<void> {
    const csv = this.generateCSVReport(report);
    await writeFile(outputPath, csv, 'utf-8');
  }

  /**
   * Generate HTML report
   */
  private generateHTMLReport(report: TestRunReport): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Model Test Report - ${report.testRun.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #007bff; }
        .card h3 { margin-top: 0; color: #333; }
        .score { font-size: 2em; font-weight: bold; color: #007bff; }
        .oracle-comparison { margin-bottom: 30px; }
        .oracle-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .oracle-card { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 6px; }
        .results-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .results-table th, .results-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .results-table th { background-color: #f8f9fa; }
        .score-excellent { color: #28a745; }
        .score-good { color: #ffc107; }
        .score-poor { color: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>AI Model Test Report</h1>
            <h2>${report.testRun.name}</h2>
            <p>Generated on ${report.testRun.timestamp.toISOString()}</p>
        </div>

        <div class="summary">
            <div class="card">
                <h3>Overall Performance</h3>
                <div class="score">${report.testRun.averageScores.overall.toFixed(2)}/10</div>
                <p>Average across all tests</p>
            </div>
            <div class="card">
                <h3>Total Tests</h3>
                <div class="score">${report.testRun.totalTests}</div>
                <p>Test cases executed</p>
            </div>
            <div class="card">
                <h3>Best Oracle</h3>
                <div class="score">${report.testRun.bestOracle}</div>
                <p>Top performing oracle</p>
            </div>
            <div class="card">
                <h3>Avg Response Time</h3>
                <div class="score">${report.testRun.performanceMetrics.averageResponseTime.toFixed(0)}ms</div>
                <p>Average processing time</p>
            </div>
        </div>

        <div class="oracle-comparison">
            <h2>Oracle Performance Comparison</h2>
            <div class="oracle-grid">
                ${Object.entries(report.comparisons.byOracle).map(([oracle, perf]: [string, any]) => `
                    <div class="oracle-card">
                        <h4>${oracle}</h4>
                        <p><strong>Score:</strong> ${perf.averageScore.toFixed(2)}/10</p>
                        <p><strong>Tests:</strong> ${perf.testCount}</p>
                        <p><strong>Strengths:</strong> ${perf.strengths.join(', ')}</p>
                        <p><strong>Weaknesses:</strong> ${perf.weaknesses.join(', ')}</p>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="detailed-scores">
            <h2>Detailed Score Breakdown</h2>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Dimension</th>
                        <th>Average Score</th>
                        <th>Performance Level</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Image Analysis Accuracy</td>
                        <td>${report.testRun.averageScores.imageAnalysisAccuracy.toFixed(2)}/10</td>
                        <td class="${this.getScoreClass(report.testRun.averageScores.imageAnalysisAccuracy)}">${this.getScoreLabel(report.testRun.averageScores.imageAnalysisAccuracy)}</td>
                    </tr>
                    <tr>
                        <td>Reading Coherence</td>
                        <td>${report.testRun.averageScores.readingCoherence.toFixed(2)}/10</td>
                        <td class="${this.getScoreClass(report.testRun.averageScores.readingCoherence)}">${this.getScoreLabel(report.testRun.averageScores.readingCoherence)}</td>
                    </tr>
                    <tr>
                        <td>Oracle Consistency</td>
                        <td>${report.testRun.averageScores.oracleConsistency.toFixed(2)}/10</td>
                        <td class="${this.getScoreClass(report.testRun.averageScores.oracleConsistency)}">${this.getScoreLabel(report.testRun.averageScores.oracleConsistency)}</td>
                    </tr>
                    <tr>
                        <td>User Experience Quality</td>
                        <td>${report.testRun.averageScores.userExperienceQuality.toFixed(2)}/10</td>
                        <td class="${this.getScoreClass(report.testRun.averageScores.userExperienceQuality)}">${this.getScoreLabel(report.testRun.averageScores.userExperienceQuality)}</td>
                    </tr>
                    <tr>
                        <td>Relevance to Question</td>
                        <td>${report.testRun.averageScores.relevanceToQuestion.toFixed(2)}/10</td>
                        <td class="${this.getScoreClass(report.testRun.averageScores.relevanceToQuestion)}">${this.getScoreLabel(report.testRun.averageScores.relevanceToQuestion)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate CSV report
   */
  private generateCSVReport(report: TestRunReport): string {
    const headers = [
      'Test Case ID',
      'Oracle Type',
      'Overall Score',
      'Image Analysis Score',
      'Reading Coherence Score',
      'Oracle Consistency Score',
      'User Experience Score',
      'Relevance Score',
      'Response Time (ms)',
      'Token Usage',
      'Created At'
    ];

    const rows = report.results.map(result => [
      result.testCaseId,
      result.oracleType,
      result.overallScore.toString(),
      result.aiEvaluationScore.imageAnalysisAccuracy.toString(),
      result.aiEvaluationScore.readingCoherence.toString(),
      result.aiEvaluationScore.oracleConsistency.toString(),
      result.aiEvaluationScore.userExperienceQuality.toString(),
      result.aiEvaluationScore.relevanceToQuestion.toString(),
      result.responseTimeMs.toString(),
      result.tokenUsage.toString(),
      result.createdAt.toISOString()
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Helper function to group array by key
   */
  private groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  /**
   * Get CSS class for score
   */
  private getScoreClass(score: number): string {
    if (score >= 8) return 'score-excellent';
    if (score >= 6) return 'score-good';
    return 'score-poor';
  }

  /**
   * Get label for score
   */
  private getScoreLabel(score: number): string {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Average';
    return 'Poor';
  }
}
