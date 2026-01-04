import { Locale } from "./i18n";
import { loadReadingPrompt, renderPrompt } from "./oracle-prompt-loader";

interface BuildReadingPromptParams {
  birthDate?: string;
  question: string;
  userImageBase64?: string;
  imageAnalysisResult?: string;
  selectedCardsNames?: string;
  locale: Locale;
}

/**
 * Maps locale to response language name
 */
function getResponseLanguage(locale: Locale): string {
  const languageMap: Record<Locale, string> = {
    en: "English",
    ru: "Russian",
    by: "Belarusian",
  };
  return languageMap[locale];
}

/**
 * Builds reading prompt from markdown template
 */
export async function buildReadingPrompt(
  params: BuildReadingPromptParams
): Promise<string> {
  // Load template
  const template = await loadReadingPrompt();

  // Prepare variables for template
  const vars = {
    question: params.question,
    birthDate: params.birthDate,
    imageAnalysis: params.imageAnalysisResult || undefined,
    selectedCards: params.selectedCardsNames || undefined,
    responseLanguage: getResponseLanguage(params.locale),
  };

  // Render template with variables
  return renderPrompt(template, vars);
}
