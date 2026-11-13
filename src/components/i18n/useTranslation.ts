"use client";

import { useEffect, useState, useCallback } from "react";
import { translations, type Lang, t, DEFAULT_LANG, COOKIE_NAME, SUPPORTED_LANGS } from "@/lib/i18n/translations";

export function useTranslation() {
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    const stored = (() => {
      if (typeof document === "undefined") return null;
      const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`));
      return m ? m[1] : null;
    })();
    if (stored && SUPPORTED_LANGS.includes(stored as Lang)) setLang(stored as Lang);
  }, []);

  const changeLanguage = useCallback((next: Lang) => {
    setLang(next);
    if (typeof document !== "undefined") {
      document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = next;
      document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    }
  }, []);

  const T = useCallback(
    (key: string, params?: Record<string, string>) => t(key as any, lang, params),
    [lang]
  );

  return { lang, t: T, changeLanguage, isRTL: lang === "ar" };
}
