"use client";

import { useTranslation } from "./useTranslation";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { lang, changeLanguage } = useTranslation();
  return (
    <div className="flex items-center gap-1 border rounded-medium p-1">
      <Button
        variant={lang === "en" ? "default" : "outline"}
        size="sm"
        onClick={() => changeLanguage("en")}
        className="px-3 text-xs capitalize"
      >
        English
      </Button>
      <Button
        variant={lang === "ar" ? "default" : "outline"}
        size="sm"
        onClick={() => changeLanguage("ar")}
        className="px-3 text-xs capitalize"
      >
        عربية
      </Button>
    </div>
  );
}
