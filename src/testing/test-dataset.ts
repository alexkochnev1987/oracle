import { TestDataset, TestCase } from "./types";

/**
 * Basic test dataset with comprehensive test cases for image analysis and tarot reading evaluation
 */
export const basicTestDataset: TestDataset = {
  name: "Basic AI Testing Dataset",
  description:
    "Comprehensive test cases covering various question types and tarot reading scenarios",
  version: "1.0.0",
  testCases: [
    // Portrait category - Easy
    {
      id: "portrait-easy-01",
      name: "Happy Person Portrait",
      imageUrl: "/test-images/portraits/happy-person.svg",
      question: "What does my future hold in terms of career success?",
      expectedThemes: ["joy", "positive energy", "confidence", "optimism"],
      difficulty: "easy",
      category: "portrait",
    },
    {
      id: "portrait-easy-02",
      name: "Contemplative Portrait",
      imageUrl: "/test-images/portraits/contemplative.svg",
      question: "How can I improve my relationships?",
      expectedThemes: ["thoughtfulness", "introspection", "calm", "reflection"],
      difficulty: "easy",
      category: "portrait",
    },

    // Portrait category - Medium
    {
      id: "portrait-medium-01",
      name: "Emotional Expression",
      imageUrl: "/test-images/portraits/emotional.svg",
      question: "What challenges am I facing in my personal growth?",
      expectedThemes: [
        "emotional depth",
        "vulnerability",
        "inner conflict",
        "transformation",
      ],
      difficulty: "medium",
      category: "portrait",
    },
    {
      id: "portrait-medium-02",
      name: "Professional Headshot",
      imageUrl: "/test-images/portraits/professional.svg",
      question: "Should I take a new job opportunity?",
      expectedThemes: [
        "professionalism",
        "confidence",
        "ambition",
        "leadership",
      ],
      difficulty: "medium",
      category: "portrait",
    },

    // Portrait category - Hard
    {
      id: "portrait-hard-01",
      name: "Shadowed Portrait",
      imageUrl: "/test-images/portraits/shadowed.svg",
      question: "What hidden aspects of myself should I explore?",
      expectedThemes: ["mystery", "hidden depths", "shadow work", "duality"],
      difficulty: "hard",
      category: "portrait",
    },

    // Abstract category - Easy
    {
      id: "abstract-easy-01",
      name: "Colorful Swirls",
      imageUrl: "/test-images/abstract/colorful-swirls.svg",
      question: "What creative energy surrounds me?",
      expectedThemes: ["creativity", "flow", "movement", "vibrant energy"],
      difficulty: "easy",
      category: "abstract",
    },
    {
      id: "abstract-easy-02",
      name: "Geometric Patterns",
      imageUrl: "/test-images/abstract/geometric.svg",
      question: "How can I bring more structure to my life?",
      expectedThemes: ["order", "structure", "balance", "precision"],
      difficulty: "easy",
      category: "abstract",
    },

    // Abstract category - Medium
    {
      id: "abstract-medium-01",
      name: "Chaotic Brushstrokes",
      imageUrl: "/test-images/abstract/chaotic.svg",
      question: "How do I navigate through current confusion?",
      expectedThemes: ["chaos", "turbulence", "transformation", "breakthrough"],
      difficulty: "medium",
      category: "abstract",
    },
    {
      id: "abstract-medium-02",
      name: "Flowing Water Colors",
      imageUrl: "/test-images/abstract/watercolor.svg",
      question: "What emotions am I processing right now?",
      expectedThemes: ["fluidity", "emotional flow", "healing", "release"],
      difficulty: "medium",
      category: "abstract",
    },

    // Abstract category - Hard
    {
      id: "abstract-hard-01",
      name: "Dark Void",
      imageUrl: "/test-images/abstract/dark-void.svg",
      question: "What do I need to understand about my fears?",
      expectedThemes: ["void", "unknown", "fear", "potential", "mystery"],
      difficulty: "hard",
      category: "abstract",
    },

    // Nature category - Easy
    {
      id: "nature-easy-01",
      name: "Sunny Forest Path",
      imageUrl: "/test-images/nature/forest-path.svg",
      question: "What path should I take in life?",
      expectedThemes: ["growth", "journey", "natural flow", "guidance"],
      difficulty: "easy",
      category: "nature",
    },
    {
      id: "nature-easy-02",
      name: "Calm Lake",
      imageUrl: "/test-images/nature/calm-lake.svg",
      question: "How can I find inner peace?",
      expectedThemes: ["tranquility", "reflection", "stillness", "clarity"],
      difficulty: "easy",
      category: "nature",
    },

    // Nature category - Medium
    {
      id: "nature-medium-01",
      name: "Stormy Sky",
      imageUrl: "/test-images/nature/stormy-sky.svg",
      question: "What challenges am I about to face?",
      expectedThemes: ["turbulence", "change", "power", "transformation"],
      difficulty: "medium",
      category: "nature",
    },
    {
      id: "nature-medium-02",
      name: "Mountain Peak",
      imageUrl: "/test-images/nature/mountain-peak.svg",
      question: "What goals should I focus on achieving?",
      expectedThemes: ["achievement", "perseverance", "height", "perspective"],
      difficulty: "medium",
      category: "nature",
    },

    // Nature category - Hard
    {
      id: "nature-hard-01",
      name: "Withered Tree",
      imageUrl: "/test-images/nature/withered-tree.svg",
      question: "What aspects of my life need renewal?",
      expectedThemes: [
        "decay",
        "renewal",
        "cycles",
        "resilience",
        "transformation",
      ],
      difficulty: "hard",
      category: "nature",
    },

    // Objects category - Easy
    {
      id: "objects-easy-01",
      name: "Vintage Key",
      imageUrl: "/test-images/objects/vintage-key.svg",
      question: "What opportunities are opening up for me?",
      expectedThemes: ["unlocking", "access", "secrets", "opportunity"],
      difficulty: "easy",
      category: "object",
    },
    {
      id: "objects-easy-02",
      name: "Burning Candle",
      imageUrl: "/test-images/objects/candle.svg",
      question: "What spiritual guidance do I need?",
      expectedThemes: ["illumination", "guidance", "warmth", "spirituality"],
      difficulty: "easy",
      category: "object",
    },

    // Objects category - Medium
    {
      id: "objects-medium-01",
      name: "Broken Mirror",
      imageUrl: "/test-images/objects/broken-mirror.svg",
      question: "How do I heal from past trauma?",
      expectedThemes: [
        "fragmentation",
        "reflection",
        "healing",
        "self-perception",
      ],
      difficulty: "medium",
      category: "object",
    },
    {
      id: "objects-medium-02",
      name: "Compass",
      imageUrl: "/test-images/objects/compass.svg",
      question: "What direction should my life take?",
      expectedThemes: ["direction", "navigation", "purpose", "guidance"],
      difficulty: "medium",
      category: "object",
    },

    // Objects category - Hard
    {
      id: "objects-hard-01",
      name: "Hourglass",
      imageUrl: "/test-images/objects/hourglass.svg",
      question: "How should I use my remaining time wisely?",
      expectedThemes: ["time", "mortality", "urgency", "priorities", "flow"],
      difficulty: "hard",
      category: "object",
    },
  ],
};

/**
 * Get all available test datasets
 */
export function getAvailableDatasets(): TestDataset[] {
  return [basicTestDataset];
}

/**
 * Get a specific test dataset by name
 */
export function getTestDataset(name: string): TestDataset | null {
  const datasets = getAvailableDatasets();
  return datasets.find((dataset) => dataset.name === name) || null;
}

/**
 * Filter test cases by category
 */
export function filterTestCasesByCategory(
  testCases: TestCase[],
  category: TestCase["category"]
): TestCase[] {
  return testCases.filter((testCase) => testCase.category === category);
}

/**
 * Filter test cases by difficulty
 */
export function filterTestCasesByDifficulty(
  testCases: TestCase[],
  difficulty: TestCase["difficulty"]
): TestCase[] {
  return testCases.filter((testCase) => testCase.difficulty === difficulty);
}

/**
 * Get random subset of test cases
 */
export function getRandomTestCases(
  testCases: TestCase[],
  count: number
): TestCase[] {
  const shuffled = [...testCases].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
