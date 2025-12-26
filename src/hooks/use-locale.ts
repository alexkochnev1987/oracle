"use client";

import { useState, useEffect } from "react";
import { Locale, defaultLocale } from "@/lib/i18n";

export function useLocale(): Locale {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const stored = localStorage.getItem("locale") as Locale | null;
    if (stored && ["ru", "en"].includes(stored)) {
      setLocale(stored);
    }
  }, []);

  return locale;
}

