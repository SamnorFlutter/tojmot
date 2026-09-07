'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, Target, Trophy, User } from 'lucide-react';
import { LESSONS, TOTAL_POINTS } from '@/lib/lessons';
import { loadProgress, type Progress } from '@/lib/progress';
import { useApp } from '@/lib/app-context';

export default function Profile() {
  const { t } = useApp();
  const [progress, setProgress] = useState<Progress>({ points: 0, done: [] });

  useEffect(() => setProgress(loadProgress()), []);

  const lessons = LESSONS.filter((l) => l.kind === 'lesson');
  const quests = LESSONS.filter((l) => l.kind === 'quest');
  const lessonsDone = lessons.filter((l) => progress.done.includes(l.id)).length;
  const questsDone = quests.filter((l) => progress.done.includes(l.id)).length;
  const pct = Math.round((progress.points / TOTAL_POINTS) * 100);

  const stat = (icon: React.ReactNode, label: string, value: string) => (
    <div className="flex items-center gap-3 rounded-2xl bg-[var(--panel)] p-4 shadow-sm">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
        {icon}
      </span>
      <div>
        <div className="text-lg font-black leading-tight">{value}</div>
        <div className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>{label}</div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl p-3 sm:p-5">
      <header className="mb-4 flex items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-white">
          <User size={28} />
        </span>
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-wide" style={{ color: 'var(--accent)' }}>{t.navProfile}</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>{t.profileLocal}</p>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {stat(<Trophy size={22} />, t.points, `${progress.points} / ${TOTAL_POINTS}`)}
        {stat(<GraduationCap size={22} />, t.learn, `${lessonsDone} / ${lessons.length}`)}
        {stat(<Target size={22} />, t.navQuests, `${questsDone} / ${quests.length}`)}
      </div>

      <div className="mt-4 rounded-2xl bg-[var(--panel)] p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold">
          <span style={{ color: 'var(--muted)' }}>{t.progressLabel}</span>
          <span style={{ color: 'var(--accent)' }}>{pct}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[var(--hover)]">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
        </div>
      </div>

      <p className="mt-4 text-center text-xs" style={{ color: 'var(--muted)' }}>
        {t.soon}: {t.navLeaderboard} · Online
      </p>
    </div>
  );
}
