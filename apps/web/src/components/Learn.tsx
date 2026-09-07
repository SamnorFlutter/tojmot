'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Lightbulb, Lock, RotateCcw, Star, Target, Trophy } from 'lucide-react';
import {
  cellByName, cellName, createGame, createPosition, gameStatus, isAttacked, isInCheck, legalMoves, makeMove,
  type Cell, type GameState, type Move, type PieceType,
} from '@tojmot/engine';
import Board from './Board';
import { LESSONS, TOTAL_POINTS, type LessonDef } from '@/lib/lessons';
import { loadProgress, saveProgress, type Progress } from '@/lib/progress';
import { useApp } from '@/lib/app-context';
import { playSound } from '@/lib/sound';

function buildState(def: LessonDef): GameState {
  return def.setup === 'initial' ? createGame() : createPosition(def.setup, def.turn);
}

function checkGoal(def: LessonDef, before: GameState, after: GameState, m: Move): boolean {
  const g = def.goal;
  switch (g.type) {
    case 'reach':
      return (!g.from || cellName(m.from) === g.from) && g.cells.includes(cellName(m.to));
    case 'capture':
      return cellName(m.to) === g.target && before.board[m.to] !== null;
    case 'promote':
      return m.promotion != null;
    case 'mateIn1':
      return gameStatus(after).kind === 'checkmate';
    case 'check':
      return isInCheck(after, after.turn);
    case 'safe':
      return cellName(m.from) === g.piece && !isAttacked(after, m.to, after.turn);
    case 'anyMove':
      return true;
    default:
      return false;
  }
}

export default function Learn({ view }: { view: 'lessons' | 'quests' }) {
  const { t, lang, theme } = useApp();
  const router = useRouter();
  const [progress, setProgress] = useState<Progress>({ points: 0, done: [] });
  const [idx, setIdx] = useState(0);
  const [board, setBoard] = useState<GameState>(() => buildState(LESSONS[0]));
  const [selected, setSelected] = useState<Cell | null>(null);
  const [pending, setPending] = useState<{ from: Cell; to: Cell; options: PieceType[] } | null>(null);
  const [phase, setPhase] = useState<'playing' | 'correct'>('playing');
  const [wrongFlash, setWrongFlash] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [earned, setEarned] = useState(0);
  const [resetArmed, setResetArmed] = useState(false);
  const [ready, setReady] = useState(false);

  const items = LESSONS.map((l, i) => ({ l, i })).filter((x) =>
    view === 'quests' ? x.l.kind === 'quest' : x.l.kind === 'lesson',
  );

  useEffect(() => {
    const p = loadProgress();
    setProgress(p);
    const firstAll = LESSONS.findIndex((l) => !p.done.includes(l.id));
    const unlockedMax = firstAll === -1 ? LESSONS.length - 1 : firstAll;
    const mine = LESSONS.map((l, i) => ({ l, i })).filter((x) =>
      view === 'quests' ? x.l.kind === 'quest' : x.l.kind === 'lesson',
    );
    const firstMine = mine.find((x) => !p.done.includes(x.l.id) && x.i <= unlockedMax) ?? mine.find((x) => x.i <= unlockedMax);
    setIdx(firstMine ? firstMine.i : mine[0].i);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const def = LESSONS[idx];

  const resetLesson = useCallback((i: number) => {
    setBoard(buildState(LESSONS[i]));
    setSelected(null);
    setPending(null);
    setPhase('playing');
    setWrongCount(0);
    setHintUsed(false);
    setEarned(0);
    setWrongFlash(false);
  }, []);

  useEffect(() => resetLesson(idx), [idx, resetLesson]);

  const firstIncomplete = LESSONS.findIndex((l) => !progress.done.includes(l.id));
  const maxUnlocked = firstIncomplete === -1 ? LESSONS.length - 1 : firstIncomplete;
  const questsLocked = view === 'quests' && items.every((x) => x.i > maxUnlocked);
  const lessonsDoneCount = LESSONS.filter((l) => l.kind === 'lesson' && progress.done.includes(l.id)).length;
  const lessonsTotal = LESSONS.filter((l) => l.kind === 'lesson').length;
  const doneInView = items.filter((x) => progress.done.includes(x.l.id)).length;

  const targets: Move[] = selected === null || phase !== 'playing' ? [] : legalMoves(board, selected);

  const succeed = useCallback(() => {
    const already = progress.done.includes(def.id);
    const pts = already ? 0 : Math.max(def.points - 5 * wrongCount - (hintUsed ? 5 : 0), 5);
    setEarned(pts);
    setPhase('correct');
    playSound('correct');
    if (!already) {
      const next: Progress = { points: progress.points + pts, done: [...progress.done, def.id] };
      setProgress(next);
      saveProgress(next);
    }
  }, [def, progress, wrongCount, hintUsed]);

  const fail = useCallback(() => {
    playSound('wrong');
    setWrongCount((n) => n + 1);
    setSelected(null);
    setWrongFlash(true);
    window.setTimeout(() => setWrongFlash(false), 1600);
  }, []);

  const attempt = useCallback(
    (m: Move) => {
      const after = makeMove(board, m);
      if (checkGoal(def, board, after, m)) {
        setBoard(after);
        setSelected(null);
        setPending(null);
        succeed();
      } else {
        setPending(null);
        fail();
      }
    },
    [board, def, succeed, fail],
  );

  const clickCell = useCallback(
    (cell: Cell) => {
      if (phase !== 'playing' || questsLocked) return;
      if (def.goal.type === 'read') return;
      if (def.goal.type === 'clickCell') {
        if (cellName(cell) === def.goal.cell) succeed();
        else fail();
        return;
      }
      const piece = board.board[cell];
      if (selected !== null) {
        const moves = legalMoves(board, selected).filter((m) => m.to === cell);
        if (moves.length === 1) return attempt(moves[0]);
        if (moves.length > 1) {
          setPending({ from: selected, to: cell, options: moves.map((m) => m.promotion!) });
          return;
        }
      }
      if (piece && piece.color === board.turn) setSelected(cell === selected ? null : cell);
      else setSelected(null);
    },
    [phase, questsLocked, def, board, selected, attempt, succeed, fail],
  );

  const useHint = useCallback(() => {
    if (hintUsed || phase !== 'playing') return;
    setHintUsed(true);
    if (def.hintFrom) {
      const c = cellByName(def.hintFrom);
      if (c >= 0 && board.board[c] && def.goal.type !== 'clickCell') setSelected(c);
    }
  }, [hintUsed, phase, def, board]);

  const goNext = useCallback(() => {
    const next = items.find((x) => x.i > idx);
    if (next) setIdx(next.i);
    else if (view === 'lessons') router.push('/quests');
  }, [items, idx, view, router]);

  const marks: Cell[] = [
    ...(def.marks ?? []).map((n) => cellByName(n)),
    ...(hintUsed && def.hintFrom ? [cellByName(def.hintFrom)] : []),
  ].filter((c) => c >= 0);

  const resetAll = () => {
    if (!resetArmed) {
      setResetArmed(true);
      window.setTimeout(() => setResetArmed(false), 3000);
      return;
    }
    const empty: Progress = { points: 0, done: [] };
    setProgress(empty);
    saveProgress(empty);
    setResetArmed(false);
    const first = items[0];
    setIdx(first.i);
    if (view === 'quests') router.push('/learn');
  };

  const lastInView = items.length > 0 && items[items.length - 1].i === idx;

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-6xl p-3 sm:p-5">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-black tracking-wide" style={{ color: 'var(--accent)' }}>
          {view === 'quests' ? <Target size={24} /> : <GraduationCap size={24} />}
          {view === 'quests' ? t.navQuests : t.learn}
        </h1>
        <span
          className="flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-1.5 text-sm font-bold text-white shadow-sm"
          title={`${t.points}: ${progress.points} / ${TOTAL_POINTS}`}
        >
          <Trophy size={15} /> {progress.points}
        </span>
      </header>

      {questsLocked ? (
        <div className="rounded-2xl bg-[var(--panel)] p-8 text-center shadow-sm">
          <Lock size={40} className="mx-auto mb-3" style={{ color: 'var(--muted)' }} />
          <p className="text-lg font-bold">{t.finishLessons}</p>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
            {t.lessonsLabel}: {lessonsDoneCount}/{lessonsTotal}
          </p>
          <button
            onClick={() => router.push('/learn')}
            className="mt-4 rounded-xl bg-[var(--accent)] px-5 py-2 text-sm font-bold text-white hover:bg-[var(--accent-dark)]"
          >
            {t.learn} →
          </button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="rounded-2xl bg-[var(--panel)] p-2 sm:p-4 shadow-sm">
            <Board
              state={board}
              theme={theme}
              flipped={false}
              selected={selected}
              targets={targets}
              lastMove={board.history.length ? board.history[board.history.length - 1] : null}
              inCheck={phase === 'playing' && board.history.length === 0 && isInCheck(board, board.turn)}
              showHints
              marks={marks}
              onCellClick={clickCell}
            />
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-[var(--panel)] p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                <span>
                  {view === 'quests' ? t.navQuests : t.lessonsLabel} · {doneInView}/{items.length}
                </span>
                <button
                  onClick={resetAll}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs ${resetArmed ? 'bg-[var(--danger-bg)] text-[var(--danger-text)]' : 'hover:bg-[var(--hover)]'}`}
                >
                  <RotateCcw size={12} /> {resetArmed ? '?' : t.resetProgress}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {items.map(({ l, i }, k) => {
                  const done = progress.done.includes(l.id);
                  const locked = i > maxUnlocked;
                  const current = i === idx;
                  return (
                    <button
                      key={l.id}
                      disabled={locked}
                      onClick={() => setIdx(i)}
                      title={l.title[lang]}
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition
                        ${current ? 'ring-2 ring-[var(--accent)] ring-offset-1' : ''}
                        ${done ? 'bg-[var(--accent)] text-white' : locked ? 'bg-[var(--hover)] opacity-40' : 'bg-[var(--accent-soft)] text-[var(--accent)]'}`}
                    >
                      {l.kind === 'quest' ? <Star size={13} fill={done ? 'currentColor' : 'none'} /> : done ? '✓' : k + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-[var(--panel)] p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide"
                  style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                >
                  {def.kind === 'quest' ? t.questsLabel : `${t.lessonsLabel} ${items.findIndex((x) => x.i === idx) + 1}`}
                </span>
                <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
                  +{def.points} {t.points}
                </span>
              </div>
              <h2 className="text-lg font-bold">{def.title[lang]}</h2>
              <p className="text-sm leading-relaxed">{def.text[lang]}</p>

              {phase === 'correct' ? (
                <div className="rounded-xl bg-[var(--accent)] p-3 text-center font-bold text-white">
                  {t.correct} {earned > 0 ? `+${earned}` : ''}
                </div>
              ) : wrongFlash ? (
                <div className="rounded-xl bg-[var(--danger-bg)] p-3 text-center font-semibold text-[var(--danger-text)]">
                  {t.tryAgain}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-2">
                {def.goal.type === 'read' && phase === 'playing' ? (
                  <button
                    onClick={succeed}
                    className="col-span-2 rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-bold text-white hover:bg-[var(--accent-dark)]"
                  >
                    {t.gotIt}
                  </button>
                ) : phase === 'playing' ? (
                  <>
                    <button
                      onClick={useHint}
                      disabled={hintUsed}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-medium hover:bg-[var(--hover)] disabled:opacity-40"
                    >
                      <Lightbulb size={15} /> {t.hint}
                    </button>
                    <button
                      onClick={() => resetLesson(idx)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-medium hover:bg-[var(--hover)]"
                    >
                      <RotateCcw size={15} /> {t.retry}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={goNext}
                    className="col-span-2 rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-bold text-white hover:bg-[var(--accent-dark)]"
                  >
                    {lastInView ? (view === 'lessons' ? `${t.toQuests} →` : t.gotIt) : t.next}
                  </button>
                )}
              </div>

              {progress.done.length === LESSONS.length && (
                <div className="rounded-xl border-2 border-[var(--accent)] p-3 text-center text-sm font-bold" style={{ color: 'var(--accent)' }}>
                  🏆 {t.allDone} — {progress.points} {t.points}!
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setPending(null)}>
          <div className="rounded-2xl bg-[var(--panel)] p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-center font-semibold">{t.promotion}</h3>
            <div className="grid grid-cols-4 gap-2">
              {pending.options.map((o) => (
                <button
                  key={o}
                  onClick={() => attempt({ from: pending.from, to: pending.to, promotion: o })}
                  className="h-14 w-14 rounded-full border-2 border-[var(--accent)] bg-[var(--panel)] text-2xl font-black font-serif hover:bg-[var(--accent-soft)]"
                  style={{ color: 'var(--accent)' }}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
