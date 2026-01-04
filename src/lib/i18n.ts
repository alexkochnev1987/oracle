import { ru } from "./i18n/ru";
import { en } from "./i18n/en";
import { by } from "./i18n/by";
import type { Translations } from "./i18n/types";

export type Locale = "ru" | "en" | "by";

export const defaultLocale: Locale = "ru";
export const locales: Locale[] = ["ru", "en", "by"];

export const translations = {
  ru,
  en,
  by,
} as const;

export function getTranslations(locale: Locale): Translations {
  return translations[locale] ?? translations[defaultLocale];
}

export type TranslationKey = keyof Translations;
