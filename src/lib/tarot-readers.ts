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

export interface TarotReader {
  id: TarotReaderId;
  name: string;
  description: string;
  imagePath: string;
  themeColor: string;
}
// Get all tarot readers with localization
export function getAllTarotReaders(locale: Locale = "ru"): TarotReader[] {
  const t = getTranslations(locale);
  return tarotReadersConfig.map((config) => {
    return {
      ...config,
      name: t.tarotReadersPrompts[config.id as TarotReaderId].name,
      description:
        t.tarotReadersPrompts[config.id as TarotReaderId].description,
    };
  });
}
