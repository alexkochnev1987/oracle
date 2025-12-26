import { Locale, getTranslations } from "./i18n";

export type TarotReaderId =
  | "cosmic-oracle"
  | "astral-sorcerer"
  | "alien-seer"
  | "mechanical-prophet";

// Base configuration without localized texts
export interface TarotReaderConfig {
  id: TarotReaderId;
  imagePath: string;
  themeColor: string;
}

// Localized tarot reader with texts from translations
export interface TarotReader {
  id: TarotReaderId;
  name: string;
  description: string;
  systemPrompt: string;
  imagePath: string;
  themeColor: string;
}

// Configuration for all tarot readers (without texts)
export const tarotReadersConfig: TarotReaderConfig[] = [
  {
    id: "cosmic-oracle",
    themeColor: "from-purple-500 to-indigo-600",
    imagePath: "/girl-oracle.png",
  },
  {
    id: "astral-sorcerer",
    themeColor: "from-amber-700 to-orange-900",
    imagePath: "/man-oracle.png",
  },
  {
    id: "alien-seer",
    themeColor: "from-green-400 to-emerald-600",
    imagePath: "/alien.png",
  },
  {
    id: "mechanical-prophet",
    themeColor: "from-slate-700 to-slate-900",
    imagePath: "/robot.png",
  },
];

// Get a single tarot reader with localization
export function getTarotReader(
  id: TarotReaderId,
  locale: Locale = "ru"
): TarotReader {
  const config =
    tarotReadersConfig.find((r) => r.id === id) || tarotReadersConfig[0];
  const translations = getTranslations(locale);
  const readerData = translations.tarotReadersPrompts[config.id];

  return {
    ...config,
    name: readerData.name,
    description: readerData.description,
    systemPrompt: readerData.systemPrompt,
  };
}

// Get all tarot readers with localization
export function getAllTarotReaders(locale: Locale = "ru"): TarotReader[] {
  return tarotReadersConfig.map((config) => getTarotReader(config.id, locale));
}
