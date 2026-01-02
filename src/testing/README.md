# AI Model Testing Framework

A comprehensive testing framework for evaluating image analysis and tarot reading generation quality across different oracle personalities.

## Overview

This framework provides:

- **Automated Testing**: Run tests across multiple oracle types with predefined question datasets
- **Random Card Generation**: Automatically generates random tarot card spreads for each test
- **AI-Powered Evaluation**: Use GPT-4o to evaluate result quality across multiple dimensions
- **Performance Monitoring**: Track response times, token usage, and quality trends
- **Comprehensive Reporting**: Generate detailed reports in JSON, HTML, and CSV formats
- **CLI Interface**: Easy-to-use command-line tools for running tests and analysis

## Quick Start

### 1. Run Basic Tests

```bash
# Run all tests with all oracles
npm run test:ai run

# Run tests for specific oracle
npm run test:ai run --oracles cosmic-oracle

# Run tests with evaluation and export
npm run test:ai run --evaluate --export results.json

# Run tests for specific category
npm run test:ai run --category portrait --difficulty easy
```

### 2. Performance Monitoring

```bash
# View performance summary
npm run test:ai:performance

# Analyze specific oracle performance
npm run test:ai:performance --oracle alien-seer --days 30

# Compare all oracles
npm run test:ai:compare --days 7
```

### 3. View Available Datasets

```bash
# List all available test datasets
npm run test:ai datasets

# List recent test runs
npm run test:ai list
```

## Test Dataset Structure

The framework includes a comprehensive test dataset with:

- **20 test cases** across 4 categories:

  - **Portraits** (5 cases): Human expressions and poses
  - **Abstract** (5 cases): Abstract art and patterns
  - **Nature** (5 cases): Landscapes and natural scenes
  - **Objects** (5 cases): Symbolic objects and items

- **3 difficulty levels**:

  - **Easy**: Clear, straightforward images
  - **Medium**: Moderately complex scenarios
  - **Hard**: Challenging or ambiguous content

- **4 oracle types**:
  - `cosmic-oracle`: Mystical and intuitive
  - `astral-sorcerer`: Wise and scholarly
  - `alien-seer`: Otherworldly perspective
  - `mechanical-prophet`: Analytical and precise

## Evaluation Criteria

Each test result is evaluated across 5 dimensions (1-10 scale):

1. **Card Selection Relevance**: How appropriate the selected tarot cards are for the question
2. **Reading Coherence**: Logical flow and structure of the tarot reading
3. **Oracle Consistency**: Adherence to the oracle's personality/style
4. **User Experience Quality**: Overall value and satisfaction for users
5. **Relevance to Question**: How well the reading addresses the specific question

## CLI Commands

### Test Execution

```bash
# Basic test run
npm run test:ai run

# Advanced options
npm run test:ai run \
  --dataset "Basic AI Testing Dataset" \
  --oracles cosmic-oracle,alien-seer \
  --category portrait \
  --difficulty medium \
  --count 5 \
  --locale en \
  --name "Portrait Test Run" \
  --evaluate \
  --export results.html
```

### Evaluation

```bash
# Evaluate existing test run
npm run test:ai evaluate <testRunId>
```

### Export

```bash
# Export test results
npm run test:ai export <testRunId> report.json --format json
npm run test:ai export <testRunId> report.html --format html
npm run test:ai export <testRunId> report.csv --format csv
```

### Performance Analysis

```bash
# Performance summary
npm run test:ai performance --days 7

# Oracle-specific analysis
npm run test:ai performance --oracle cosmic-oracle --days 30

# Oracle comparison
npm run test:ai compare --days 14
```

### Management

```bash
# List test runs
npm run test:ai list --limit 20

# Show available datasets
npm run test:ai datasets
```

## Programmatic Usage

```typescript
import {
  TestRunner,
  AIEvaluator,
  ReportGenerator,
  basicTestDataset,
  runQuickTest,
} from "./src/testing";

// Quick test
const result = await runQuickTest(basicTestDataset.testCases.slice(0, 3), {
  oracles: ["cosmic-oracle", "alien-seer"],
  locale: "en",
  name: "Quick Test",
});

// Full test run
const runner = new TestRunner();
const testResult = await runner.runTests({
  name: "Custom Test Run",
  testCases: basicTestDataset.testCases,
  oracles: ["cosmic-oracle"],
  locale: "en",
});

// AI evaluation
const evaluator = new AIEvaluator();
await evaluator.evaluateTestRun(testResult.testRunId);

// Generate report
const reportGenerator = new ReportGenerator();
await reportGenerator.exportTestRun(
  testResult.testRunId,
  "report.html",
  "html"
);
```

## Database Schema

The framework extends the existing Prisma schema with:

- `TestRun`: Test execution sessions
- `TestCase`: Individual test scenarios
- `TestResult`: Results for each oracle/test case combination

## Performance Monitoring

The framework tracks:

- **Response Times**: How long each test takes to complete
- **Token Usage**: Estimated OpenAI API token consumption
- **Quality Scores**: AI evaluation results over time
- **Trends**: Performance improvements or degradations
- **Alerts**: Automatic detection of performance issues

## Report Formats

### JSON Report

Complete structured data including:

- Test run summary with averages and trends
- Individual test results with detailed scores
- Oracle comparisons and category analysis
- Performance metrics and recommendations

### HTML Report

Interactive dashboard with:

- Visual score comparisons
- Oracle performance charts
- Detailed test case breakdowns
- Responsive design for easy viewing

### CSV Report

Tabular data for analysis in spreadsheet applications:

- One row per test result
- All evaluation dimensions included
- Performance metrics and timestamps

## Best Practices

1. **Regular Testing**: Run tests after significant changes to prompts or models
2. **Baseline Establishment**: Create baseline performance metrics for comparison
3. **Trend Monitoring**: Use performance monitoring to catch regressions early
4. **Diverse Testing**: Test across all categories and difficulty levels
5. **Evaluation Review**: Manually review AI evaluations for accuracy

## Troubleshooting

### Common Issues

1. **Image Loading Errors**: Ensure test images exist in `public/test-images/`
2. **OpenAI API Errors**: Check `OPENAI_API_KEY` environment variable
3. **Database Errors**: Run `npm run db:push` to sync schema changes
4. **Permission Errors**: Ensure write permissions for export directories

### Performance Issues

- High response times may indicate API throttling
- High token usage suggests prompt optimization needed
- Low scores may require prompt template adjustments

## Contributing

To add new test cases:

1. Add images to appropriate `public/test-images/` subdirectory
2. Update test dataset in `src/testing/test-dataset.ts`
3. Include expected themes and appropriate difficulty level
4. Test with multiple oracles to ensure consistency

## License

This testing framework is part of the Oracle application and follows the same licensing terms.
