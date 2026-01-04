"use client";

import { Locale } from "@/lib/i18n";
import { useLocaleContext } from "@/contexts/locale-context";

export function useLocale(): [Locale, (locale: Locale) => void] {
  const { locale, setLocale } = useLocaleContext();
  return [locale, setLocale];
}
