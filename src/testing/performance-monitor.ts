import { prisma } from '../lib/prisma';

export interface PerformanceMetrics {
  responseTime: number;
  tokenUsage?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  timestamp: Date;
}

export interface PerformanceTrend {
  metric: string;
  values: number[];
  timestamps: Date[];
  average: number;
  trend: 'improving' | 'declining' | 'stable';
  changePercentage: number;
}

/**
 * Performance monitoring and analysis utility
 */
export class PerformanceMonitor {
  
  /**
   * Track performance metrics for a test execution
   */
  static async trackMetrics(
    testResultId: string,
    metrics: PerformanceMetrics
  ): Promise<void> {
    // Update the test result with performance data
    await (prisma as any).testResult.update({
      where: { id: testResultId },
      data: {
        responseTimeMs: metrics.responseTime,
        tokenUsage: metrics.tokenUsage,
      },
    });
  }

  /**
   * Get performance trends for a specific oracle over time
   */
  static async getOraclePerformanceTrend(
    oracleType: string,
    days: number = 30
  ): Promise<{
    responseTime: PerformanceTrend;
    tokenUsage: PerformanceTrend;
    overallScore: PerformanceTrend;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const results = await prisma.testResult.findMany({
      where: {
        oracleType,
        createdAt: {
          gte: cutoffDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (results.length === 0) {
      throw new Error(`No results found for oracle ${oracleType} in the last ${days} days`);
    }

    const responseTimes = results.map(r => r.responseTimeMs);
    const tokenUsages = results.map(r => r.tokenUsage || 0);
    const overallScores = results.map(r => r.overallScore);
    const timestamps = results.map(r => r.createdAt);

    return {
      responseTime: this.calculateTrend('responseTime', responseTimes, timestamps),
      tokenUsage: this.calculateTrend('tokenUsage', tokenUsages, timestamps),
      overallScore: this.calculateTrend('overallScore', overallScores, timestamps),
    };
  }

  /**
   * Get performance comparison across all oracles
   */
  static async getOraclePerformanceComparison(days: number = 30): Promise<{
    [oracleType: string]: {
      averageResponseTime: number;
      averageTokenUsage: number;
      averageScore: number;
      testCount: number;
      efficiency: number; // score per token
    };
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const results = await prisma.testResult.findMany({
      where: {
        createdAt: {
          gte: cutoffDate,
        },
      },
    });

    const oracleGroups = this.groupBy(results, r => r.oracleType);
    const comparison: any = {};

    for (const [oracleType, oracleResults] of Object.entries(oracleGroups)) {
      const responseTimes = oracleResults.map(r => r.responseTimeMs);
      const tokenUsages = oracleResults.map(r => r.tokenUsage || 0);
      const scores = oracleResults.map(r => r.overallScore);

      const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const averageTokenUsage = tokenUsages.reduce((a, b) => a + b, 0) / tokenUsages.length;
      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      
      comparison[oracleType] = {
        averageResponseTime,
        averageTokenUsage,
        averageScore,
        testCount: oracleResults.length,
        efficiency: averageTokenUsage > 0 ? averageScore / averageTokenUsage * 1000 : 0, // Score per 1000 tokens
      };
    }

    return comparison;
  }

  /**
   * Get performance alerts (identify performance issues)
   */
  static async getPerformanceAlerts(): Promise<{
    slowResponses: Array<{
      testResultId: string;
      oracleType: string;
      responseTime: number;
      threshold: number;
    }>;
    highTokenUsage: Array<{
      testResultId: string;
      oracleType: string;
      tokenUsage: number;
      threshold: number;
    }>;
    lowScores: Array<{
      testResultId: string;
      oracleType: string;
      score: number;
      threshold: number;
    }>;
  }> {
    const RESPONSE_TIME_THRESHOLD = 10000; // 10 seconds
    const TOKEN_USAGE_THRESHOLD = 2000; // 2000 tokens
    const SCORE_THRESHOLD = 4.0; // Below 4.0 is concerning

    const recentResults = await prisma.testResult.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      slowResponses: recentResults
        .filter(r => r.responseTimeMs > RESPONSE_TIME_THRESHOLD)
        .map(r => ({
          testResultId: r.id,
          oracleType: r.oracleType,
          responseTime: r.responseTimeMs,
          threshold: RESPONSE_TIME_THRESHOLD,
        })),
      
      highTokenUsage: recentResults
        .filter(r => (r.tokenUsage || 0) > TOKEN_USAGE_THRESHOLD)
        .map(r => ({
          testResultId: r.id,
          oracleType: r.oracleType,
          tokenUsage: r.tokenUsage || 0,
          threshold: TOKEN_USAGE_THRESHOLD,
        })),
      
      lowScores: recentResults
        .filter(r => r.overallScore < SCORE_THRESHOLD)
        .map(r => ({
          testResultId: r.id,
          oracleType: r.oracleType,
          score: r.overallScore,
          threshold: SCORE_THRESHOLD,
        })),
    };
  }

  /**
   * Generate performance summary report
   */
  static async generatePerformanceSummary(days: number = 7): Promise<{
    totalTests: number;
    averageResponseTime: number;
    averageTokenUsage: number;
    averageScore: number;
    testsPerDay: number;
    performanceTrend: 'improving' | 'declining' | 'stable';
    topPerformingOracle: string;
    recommendations: string[];
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const results = await prisma.testResult.findMany({
      where: {
        createdAt: {
          gte: cutoffDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (results.length === 0) {
      throw new Error(`No test results found in the last ${days} days`);
    }

    const totalTests = results.length;
    const averageResponseTime = results.reduce((a, b) => a + b.responseTimeMs, 0) / totalTests;
    const averageTokenUsage = results.reduce((a, b) => a + (b.tokenUsage || 0), 0) / totalTests;
    const averageScore = results.reduce((a, b) => a + b.overallScore, 0) / totalTests;
    const testsPerDay = totalTests / days;

    // Calculate performance trend
    const midpoint = Math.floor(results.length / 2);
    const firstHalf = results.slice(0, midpoint);
    const secondHalf = results.slice(midpoint);
    
    const firstHalfAvgScore = firstHalf.reduce((a, b) => a + b.overallScore, 0) / firstHalf.length;
    const secondHalfAvgScore = secondHalf.reduce((a, b) => a + b.overallScore, 0) / secondHalf.length;
    
    let performanceTrend: 'improving' | 'declining' | 'stable' = 'stable';
    const scoreDiff = secondHalfAvgScore - firstHalfAvgScore;
    if (scoreDiff > 0.5) performanceTrend = 'improving';
    else if (scoreDiff < -0.5) performanceTrend = 'declining';

    // Find top performing oracle
    const oracleComparison = await this.getOraclePerformanceComparison(days);
    const topPerformingOracle = Object.entries(oracleComparison)
      .sort(([,a], [,b]) => b.averageScore - a.averageScore)[0]?.[0] || 'unknown';

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (averageResponseTime > 5000) {
      recommendations.push('Consider optimizing response times - current average exceeds 5 seconds');
    }
    
    if (averageTokenUsage > 1500) {
      recommendations.push('High token usage detected - review prompt efficiency');
    }
    
    if (averageScore < 6) {
      recommendations.push('Overall quality scores are below target - review AI evaluation criteria');
    }
    
    if (performanceTrend === 'declining') {
      recommendations.push('Performance trend is declining - investigate recent changes');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Performance metrics are within acceptable ranges');
    }

    return {
      totalTests,
      averageResponseTime,
      averageTokenUsage,
      averageScore,
      testsPerDay,
      performanceTrend,
      topPerformingOracle,
      recommendations,
    };
  }

  /**
   * Calculate trend analysis for a metric
   */
  private static calculateTrend(
    metric: string,
    values: number[],
    timestamps: Date[]
  ): PerformanceTrend {
    if (values.length < 2) {
      return {
        metric,
        values,
        timestamps,
        average: values[0] || 0,
        trend: 'stable',
        changePercentage: 0,
      };
    }

    const average = values.reduce((a, b) => a + b, 0) / values.length;
    
    // Simple linear regression to determine trend
    const n = values.length;
    const sumX = timestamps.reduce((sum, _, i) => sum + i, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
    const sumXX = timestamps.reduce((sum, _, i) => sum + i * i, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    const changePercentage = (slope / average) * 100;
    
    if (Math.abs(changePercentage) > 5) {
      // For response time and token usage, lower is better
      if (metric === 'responseTime' || metric === 'tokenUsage') {
        trend = slope < 0 ? 'improving' : 'declining';
      } else {
        // For scores, higher is better
        trend = slope > 0 ? 'improving' : 'declining';
      }
    }

    return {
      metric,
      values,
      timestamps,
      average,
      trend,
      changePercentage: Math.abs(changePercentage),
    };
  }

  /**
   * Helper function to group array by key
   */
  private static groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }
}
