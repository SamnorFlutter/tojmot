'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, GraduationCap, Moon, Sun, Target, Trophy, User, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { LANGS } from '@/lib/i18n';
import { useApp } from '@/lib/app-context';
import { isMuted, setMuted } from '@/lib/sound';

export default function Shell({ children }: { children: ReactNode }) {
  const { t, lang, setLang, theme, toggleTheme } = useApp();
  const pathname = usePathname() ?? '/';
  const [muted, setMutedState] = useState(false);
  useEffect(() => setMutedState(isMuted()), []);
  const toggleMute = () => {
    setMuted(!muted);
    setMutedState(!muted);
  };

  const items = [
    { href: '/', icon: Gamepad2, label: t.play },
    { href: '/learn', icon: GraduationCap, label: t.learn },
    { href: '/quests', icon: Target, label: t.navQuests },
    { href: '/leaderboard', icon: Trophy, label: t.navLeaderboard, soon: true },
    { href: '/profile', icon: User, label: t.navProfile },
  ];

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  const langButtons = (compact: boolean) => (
    <div className={`flex ${compact ? 'gap-0.5' : 'gap-1'} rounded-full bg-[var(--hover)] p-1`}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`rounded-full font-semibold transition ${compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'} ${
            lang === l.code ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--panel)]'
          }`}
        >
          {l.code.toUpperCase()}
        </button>
      ))}
    </div>
  );

  const muteButton = (
    <button
      onClick={toggleMute}
      aria-label={t.sound}
      title={t.sound}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--hover)] hover:bg-[var(--accent-soft)]"
      style={{ color: 'var(--accent)' }}
    >
      {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
    </button>
  );

  const themeButton = (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? t.themeLight : t.themeDark}
      title={theme === 'dark' ? t.themeLight : t.themeDark}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--hover)] hover:bg-[var(--accent-soft)]"
      style={{ color: 'var(--accent)' }}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );

  return (
    <div className="lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-1 border-r border-[var(--line)] bg-[var(--panel)] p-4 lg:flex">
        <Link href="/" className="mb-4 px-2 text-2xl font-black tracking-widest" style={{ color: 'var(--accent)' }}>
          TOJMOT
        </Link>
        {items.map(({ href, icon: Icon, label, soon }) =>
          soon ? (
            <div
              key={href}
              className="flex cursor-default items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold uppercase tracking-wide opacity-40"
              title={t.soon}
            >
              <Icon size={20} />
              <span>{label}</span>
              <span className="ml-auto rounded-full bg-[var(--hover)] px-2 py-0.5 text-[10px] normal-case">{t.soon}</span>
            </div>
          ) : (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-sm font-bold uppercase tracking-wide transition ${
                isActive(href)
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                  : 'border-transparent hover:bg-[var(--hover)]'
              }`}
              style={isActive(href) ? { color: 'var(--accent)' } : { color: 'var(--muted)' }}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ),
        )}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--line)] pt-3">
          <div className="flex gap-1.5">
            {themeButton}
            {muteButton}
          </div>
          {langButtons(false)}
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-[var(--line)] bg-[var(--panel)] px-4 py-2 lg:hidden">
        <Link href="/" className="text-lg font-black tracking-widest" style={{ color: 'var(--accent)' }}>
          TOJMOT
        </Link>
        <div className="flex items-center gap-2">
          {themeButton}
          {muteButton}
          {langButtons(true)}
        </div>
      </div>

      {/* Content */}
      <main className="min-w-0 flex-1 pt-12 pb-20 lg:pt-0 lg:pb-0">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-[var(--line)] bg-[var(--panel)] lg:hidden">
        {items.map(({ href, icon: Icon, label, soon }) =>
          soon ? (
            <div key={href} className="flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] font-semibold opacity-40">
              <Icon size={22} />
              {label}
            </div>
          ) : (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] font-semibold"
              style={{ color: isActive(href) ? 'var(--accent)' : 'var(--muted)' }}
            >
              <Icon size={22} />
              {label}
            </Link>
          ),
        )}
      </nav>
    </div>
  );
}
