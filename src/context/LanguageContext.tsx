'use client';

/**
 * Reactive EN | ID store. Switching re-renders every consumer with the other
 * locale: nav, role scramble, bio, philosophy, pipeline trace, system cards,
 * the open modal, capabilities, cursor labels and the toast. No reload.
 * Translations are loaded on the server and passed in as a prop.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Lang, Translations } from '@/lib/types';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  dict: Record<string, string>;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  translations,
  children,
}: {
  translations: Translations;
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>('en');

  const setLang = useCallback((next: Lang) => setLangState(next), []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<LanguageContextValue>(() => {
    const dict = translations[lang] || translations.en;
    return {
      lang,
      setLang,
      dict,
      translations,
      t: (key: string) => dict[key] || translations.en[key] || key,
    };
  }, [lang, setLang, translations]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
