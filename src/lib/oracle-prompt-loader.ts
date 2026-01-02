import { readFile } from "fs/promises";
import { join } from "path";
import type { TarotReaderId } from "./tarot-readers";

export interface OraclePromptVars {
  responseLanguage: string; // "Russian" | "English" | "Belarusian"
  question?: string;
  birthDate?: string;
  imageAnalysis?: string;
  selectedCards?: string;
}

export async function loadImageAnalysisPromptTemplate(): Promise<string> {
  const filePath = join(process.cwd(), "public", "agents", "image-analysis.md");
  const template = await readFile(filePath, "utf-8");
  return template;
}

// Cache for loaded prompts to avoid reading files multiple times
const promptCache = new Map<TarotReaderId, string>();
const readingPromptCache = new Map<string, string>();

/**
 * Loads oracle prompt template from .md file (synchronous version)
 * @param tarotReaderId - ID of the oracle
 * @returns Prompt template string
 */
export async function loadOraclePrompt(
  tarotReaderId: TarotReaderId
): Promise<string> {
  // Check cache first
  if (promptCache.has(tarotReaderId)) {
    return promptCache.get(tarotReaderId)!;
  }

  try {
    // In Next.js, public files are served from public/ directory
    // For server-side reading, we need to use the file system
    const filePath = join(
      process.cwd(),
      "public",
      "agents",
      `${tarotReaderId}.md`
    );
    const template = await readFile(filePath, "utf-8");

    // Cache the template
    promptCache.set(tarotReaderId, template);

    return template;
  } catch (error) {
    console.error(`Failed to load oracle prompt for ${tarotReaderId}:`, error);
    throw new Error(`Failed to load oracle prompt file: ${tarotReaderId}.md`);
  }
}

/**
 * Renders prompt template with variables
 * Supports:
 * - Simple variable substitution: {{variableName}}
 * - Conditional blocks: {{#if variableName}}...{{/if}}
 * - Negative conditionals: {{#unless variableName}}...{{/unless}}
 * - Nested conditionals are supported
 *
 * @param template - Template string with placeholders
 * @param vars - Variables to substitute
 * @returns Rendered prompt string
 */
export function renderPrompt(template: string, vars: OraclePromptVars): string {
  let result = template;

  // Process conditional blocks recursively to handle nesting
  // Process both {{#if}} and {{#unless}} blocks
  let changed = true;
  while (changed) {
    changed = false;

    // Process {{#if}} blocks
    result = result.replace(
      /{{#if (\w+)}}([\s\S]*?){{\/if}}/g,
      (match, key, content) => {
        // Check if this content contains another conditional block
        if (content.includes("{{#if") || content.includes("{{#unless")) {
          return match; // Keep as is for now, process in next iteration
        }

        // Process this block
        changed = true;
        const value = vars[key as keyof OraclePromptVars];
        // Include content if variable exists and is truthy
        return value ? content : "";
      }
    );

    // Process {{#unless}} blocks
    result = result.replace(
      /{{#unless (\w+)}}([\s\S]*?){{\/unless}}/g,
      (match, key, content) => {
        // Check if this content contains another conditional block
        if (content.includes("{{#if") || content.includes("{{#unless")) {
          return match; // Keep as is for now, process in next iteration
        }

        // Process this block
        changed = true;
        const value = vars[key as keyof OraclePromptVars];
        // Include content if variable does NOT exist or is falsy
        return !value ? content : "";
      }
    );
  }

  // Process variable substitutions
  // Matches {{variableName}}
  Object.entries(vars).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    result = result.replaceAll(placeholder, value ?? "");
  });

  return result.trim();
}

/**
 * Loads reading prompt template from .md file (synchronous version)
 * @returns Prompt template string
 */
export async function loadReadingPrompt(): Promise<string> {
  const cacheKey = "oracle-reading";

  // Check cache first
  if (readingPromptCache.has(cacheKey)) {
    return readingPromptCache.get(cacheKey)!;
  }

  try {
    const filePath = join(
      process.cwd(),
      "public",
      "agents",
      "oracle-reading.md"
    );
    const template = await readFile(filePath, "utf-8");

    // Cache the template
    readingPromptCache.set(cacheKey, template);

    return template;
  } catch (error) {
    console.error("Failed to load reading prompt:", error);
    throw new Error("Failed to load reading prompt file: oracle-reading.md");
  }
}
