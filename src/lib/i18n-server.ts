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

export async function getUserLang(): Promise<Lang> {
  try {
    const cookieStore = await cookies();
    const lang = cookieStore.get(COOKIE_NAME)?.value as Lang | undefined;
    if (lang && SUPPORTED_LANGS.includes(lang)) return lang;
  } catch {}
  return DEFAULT_LANG;
}

export async function getServerTranslations() {
  const lang = await getUserLang();
  return { lang, t: getTranslations(lang) };
}

export { isRTL };
