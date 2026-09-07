'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { DICT, detectLang, saveLang, type Lang } from './i18n';
import { applyTheme, detectTheme, type Theme } from './theme';

interface AppCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: (typeof DICT)['uz'];
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('uz');
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setLangState(detectLang());
    const th = detectTheme();
    setTheme(th);
    document.documentElement.dataset.theme = th;
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    saveLang(l);
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  };

  return <Ctx.Provider value={{ lang, setLang, theme, toggleTheme, t: DICT[lang] }}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useApp must be used inside AppProvider');
  return c;
}
