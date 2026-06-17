import en from "./dictionaries/en.json";
import ar from "./dictionaries/ar.json";

export const LOCALES = ["ar", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ar";

export const DIR: Record<Locale, "rtl" | "ltr"> = { ar: "rtl", en: "ltr" };

export type Dictionary = typeof en;

const DICTS: Record<Locale, Dictionary> = { en, ar: ar as Dictionary };

export function getDictionary(locale: Locale): Dictionary {
  return DICTS[locale] ?? DICTS[DEFAULT_LOCALE];
}

/** Dot-path translation with graceful fallback to the key itself. */
export function translate(dict: Dictionary, key: string): string {
  const parts = key.split(".");
  let node: unknown = dict;
  for (const p of parts) {
    if (node && typeof node === "object" && p in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[p];
    } else {
      return key;
    }
  }
  return typeof node === "string" ? node : key;
}
