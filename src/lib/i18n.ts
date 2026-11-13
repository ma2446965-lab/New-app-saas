import { cookies } from "next/headers";
import {
  translations,
  type Lang,
  t,
  getTranslations,
  DEFAULT_LANG,
  COOKIE_NAME,
  SUPPORTED_LANGS,
  isRTL,
} from "@/lib/i18n/translations";

export { t, translations, type Lang, DEFAULT_LANG, COOKIE_NAME, SUPPORTED_LANGS, isRTL };
