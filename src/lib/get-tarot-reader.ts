import { loadOraclePrompt, renderPrompt } from "./oracle-prompt-loader";
import { Locale, getTranslations } from "./i18n";
import { TarotReaderId, tarotReadersConfig } from "./tarot-readers";

function getResponseLanguage(locale: Locale): string {
  const t = getTranslations(locale);
  return t.promptLanguage.responseLanguage;
}
// Get a single tarot reader with localization
export async function getTarotReader(
  id: TarotReaderId,
  locale: Locale = "ru"
): Promise<string> {
  const config =
    tarotReadersConfig.find((r) => r.id === id) || tarotReadersConfig[0];
  const responseLanguage = getResponseLanguage(locale);

  // Load prompt from .md file, fallback to i18n.ts if file not found
  let systemPrompt: string;
  try {
    const template = await loadOraclePrompt(config.id);
    systemPrompt = renderPrompt(template, { responseLanguage });
  } catch (error) {
    // Fallback to i18n.ts if file loading fails
    console.warn(
      `Failed to load oracle prompt from file for ${config.id}, using fallback:`,
      error
    );
    systemPrompt = "Failed to load oracle prompt from file";
  }

  return systemPrompt;
}
