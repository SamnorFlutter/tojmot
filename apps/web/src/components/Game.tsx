'use client';

import { useEffect, useRef, useState } from 'react';
import { RotateCcw, RefreshCw, FlipVertical2, Eye, EyeOff, BookOpen, Cpu, Users } from 'lucide-react';
import type { Color } from '@tojmot/engine';
import Board from './Board';
import { useGame } from '@/lib/useGame';
import { useApp } from '@/lib/app-context';
import { playSound } from '@/lib/sound';

export default function Game() {
  const g = useGame();
  const { t, theme } = useApp();
  const [flipped, setFlipped] = useState(false);
  const [hints, setHints] = useState(true);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const prevLen = useRef(0);

  useEffect(() => setFlipped(g.mode === 'ai' && g.humanColor === 'b'), [g.mode, g.humanColor]);

  useEffect(() => {
    const len = g.state.history.length;
    if (len > prevLen.current) {
      const last = g.state.history[len - 1];
      const s = g.status;
      if (s.kind === 'checkmate') playSound(g.mode === 'hotseat' || s.winner === g.humanColor ? 'win' : 'lose');
      else if (s.kind !== 'playing') playSound('draw');
      else if (s.check) playSound('check');
      else playSound(last.captured ? 'capture' : 'move');
      if (s.kind !== 'playing') setResultOpen(true);
    }
    if (len === 0) setResultOpen(false);
    prevLen.current = len;
  }, [g.state, g.status, g.mode, g.humanColor]);

  const statusText = (() => {
    const s = g.status;
    if (s.kind === 'checkmate') return `${t.checkmate} ${s.winner === 'w' ? t.winsWhite : t.winsBlack}`;
    if (s.kind === 'stalemate') return t.stalemate;
    if (s.kind === 'draw') return s.reason === 'material' ? t.drawMaterial : s.reason === 'fifty' ? t.drawFifty : t.drawRepetition;
    if (g.thinking) return t.thinking;
    const turn = g.state.turn === 'w' ? t.whiteToMove : t.blackToMove;
    return s.check ? `${turn} — ${t.check}` : turn;
  })();

  const over = g.status.kind !== 'playing';
  const inCheck = g.status.kind === 'playing' && g.status.check;

  const pairs: { n: number; w?: string; b?: string }[] = [];
  g.state.history.forEach((m, i) => {
    if (i % 2 === 0) pairs.push({ n: i / 2 + 1, w: m.san });
    else pairs[pairs.length - 1].b = m.san;
  });

  const restart = (mode: 'ai' | 'hotseat', color: Color) => {
    g.changeMode(mode);
    g.changeHumanColor(color);
    g.newGame();
  };

  return (
    <div className="mx-auto max-w-6xl p-3 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-2xl bg-[var(--panel)] p-2 sm:p-4 shadow-sm">
          <Board
            state={g.state}
            theme={theme}
            flipped={flipped}
            selected={g.selected}
            targets={g.targets}
            lastMove={g.lastMove}
            inCheck={inCheck}
            showHints={hints}
            onCellClick={g.clickCell}
          />
        </section>

        <aside className="space-y-4">
          <div
            className={`rounded-2xl p-4 shadow-sm text-center text-lg font-semibold ${over ? 'bg-[var(--accent)] text-white' : inCheck ? 'bg-[var(--danger-bg)] text-[var(--danger-text)]' : 'bg-[var(--panel)]'}`}
            aria-live="polite"
          >
            {statusText}
          </div>

          <div className="rounded-2xl bg-[var(--panel)] p-4 shadow-sm space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => restart('ai', g.humanColor)}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium border ${g.mode === 'ai' ? 'bg-[var(--accent)] text-white border-transparent' : 'bg-[var(--panel)] border-[var(--line)] hover:bg-[var(--hover)]'}`}
              >
                <Cpu size={16} /> {t.modeAi}
              </button>
              <button
                onClick={() => restart('hotseat', 'w')}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium border ${g.mode === 'hotseat' ? 'bg-[var(--accent)] text-white border-transparent' : 'bg-[var(--panel)] border-[var(--line)] hover:bg-[var(--hover)]'}`}
              >
                <Users size={16} /> {t.modeHotseat}
              </button>
            </div>

            {g.mode === 'ai' && (
              <>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span style={{ color: 'var(--muted)' }}>{t.playAs}</span>
                  <div className="flex gap-1">
                    {(['w', 'b'] as Color[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => restart('ai', c)}
                        className={`rounded-lg px-3 py-1 border text-sm ${g.humanColor === c ? 'bg-[var(--accent-dark)] text-white border-transparent' : 'border-[var(--line)] hover:bg-[var(--hover)]'}`}
                      >
                        {c === 'w' ? t.white : t.black}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span style={{ color: 'var(--muted)' }}>{t.level}</span>
                  <select
                    value={g.level}
                    onChange={(e) => g.setLevel(Number(e.target.value))}
                    className="rounded-lg border border-[var(--line)] px-2 py-1 bg-[var(--panel)] text-[var(--ink)]"
                  >
                    {t.levels.map((name, i) => (
                      <option key={i} value={i}>{name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button onClick={g.newGame} className="flex items-center justify-center gap-2 rounded-xl bg-[var(--accent-dark)] text-white px-3 py-2 text-sm font-medium hover:bg-[var(--accent)]">
                <RefreshCw size={16} /> {t.newGame}
              </button>
              <button
                onClick={g.undo}
                disabled={g.state.history.length === 0 || g.thinking}
                className="flex items-center justify-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-medium hover:bg-[var(--hover)] disabled:opacity-40"
              >
                <RotateCcw size={16} /> {t.undo}
              </button>
              <button onClick={() => setFlipped((f) => !f)} className="flex items-center justify-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-medium hover:bg-[var(--hover)]">
                <FlipVertical2 size={16} /> {t.flip}
              </button>
              <button onClick={() => setHints((h) => !h)} className="flex items-center justify-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-medium hover:bg-[var(--hover)]">
                {hints ? <Eye size={16} /> : <EyeOff size={16} />} {t.hints}
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--panel)] p-4 shadow-sm">
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--muted)' }}>{t.moves}</h2>
            <ol className="max-h-48 overflow-y-auto text-sm font-mono grid grid-cols-[2.5rem_1fr_1fr] gap-x-2 gap-y-1">
              {pairs.map((p) => (
                <li key={p.n} className="contents">
                  <span className="text-[var(--muted)]">{p.n}.</span>
                  <span>{p.w}</span>
                  <span>{p.b ?? ''}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl bg-[var(--panel)] p-4 shadow-sm">
            <button onClick={() => setRulesOpen((o) => !o)} className="flex w-full items-center gap-2 text-sm font-semibold" style={{ color: 'var(--accent)' }}>
              <BookOpen size={16} /> {t.rules}
            </button>
            {rulesOpen && (
              <div className="mt-3 space-y-2 text-sm leading-snug">
                <p>{t.rulesIntro}</p>
                <ul className="space-y-1">
                  {Object.entries(t.pieces).map(([k, v]) => (
                    <li key={k} className="flex gap-2">
                      <span className="shrink-0 w-10 font-bold font-serif" style={{ color: 'var(--accent)' }}>{k === 'R' ? 'II–IX' : k}</span>
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>

      {g.pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={g.cancelPromotion}>
          <div className="rounded-2xl bg-[var(--panel)] p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-center font-semibold">{t.promotion}</h3>
            <div className="grid grid-cols-4 gap-2">
              {g.pending.options.map((o) => (
                <button
                  key={o}
                  onClick={() => g.choosePromotion(o)}
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

      {over && resultOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setResultOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-[var(--panel)] p-6 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-4xl">{g.status.kind === 'checkmate' ? '🏆' : '🤝'}</div>
            <h3 className="mt-2 text-lg font-black">{statusText}</h3>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => { setResultOpen(false); g.newGame(); }}
                className="rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-bold text-white hover:bg-[var(--accent-dark)]"
              >
                {t.newGame}
              </button>
              <button
                onClick={() => setResultOpen(false)}
                className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-medium hover:bg-[var(--hover)]"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-6 text-center text-xs" style={{ color: 'var(--muted)' }}>{t.footer}</footer>
    </div>
  );
}
