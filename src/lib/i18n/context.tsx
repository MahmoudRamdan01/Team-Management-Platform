"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DIR, translate, type Dictionary, type Locale } from "./config";

interface I18nValue {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: (key: string) => string;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const t = useCallback((key: string) => translate(dict, key), [dict]);

  const setLocale = useCallback(
    (l: Locale) => {
      document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000`;
      router.refresh();
    },
    [router]
  );

  const value = useMemo<I18nValue>(() => ({ locale, dir: DIR[locale], t, setLocale }), [locale, t, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
