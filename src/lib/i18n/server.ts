import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, DIR, getDictionary, translate, type Locale } from "./config";

/** Server-side i18n: resolves locale from the cookie and returns a translator. */
export function getServerI18n() {
  const locale = ((cookies().get("NEXT_LOCALE")?.value as Locale) || DEFAULT_LOCALE) as Locale;
  const dict = getDictionary(locale);
  return { locale, dir: DIR[locale], t: (key: string) => translate(dict, key) };
}
