'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createGame, findBestMove, gameStatus, legalMoves, makeMove, undoLast,
  type Cell, type Color, type GameState, type GameStatus, type Move, type PieceType, type SearchResult,
} from '@tojmot/engine';

export type Mode = 'ai' | 'hotseat';

export const LEVELS: { depth: number; timeMs: number; randomness: number; quiescenceDepth: number }[] = [
  { depth: 1, timeMs: 200, randomness: 200, quiescenceDepth: 0 }, // almost random, misses tactics
  { depth: 1, timeMs: 400, randomness: 40, quiescenceDepth: 1 },
  { depth: 3, timeMs: 1200, randomness: 8, quiescenceDepth: 3 },
  { depth: 4, timeMs: 3000, randomness: 2, quiescenceDepth: 4 },
];

export interface PendingPromotion {
  from: Cell;
  to: Cell;
  options: PieceType[];
}

export function useGame() {
  const [state, setState] = useState<GameState>(() => createGame());
  const [mode, setMode] = useState<Mode>('ai');
  const [humanColor, setHumanColor] = useState<Color>('w');
  const [level, setLevel] = useState(0);
  const [selected, setSelected] = useState<Cell | null>(null);
  const [pending, setPending] = useState<PendingPromotion | null>(null);
  const [thinking, setThinking] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const requestId = useRef(0);

  const status: GameStatus = useMemo(() => gameStatus(state), [state]);
  const aiColor: Color | null = mode === 'ai' ? (humanColor === 'w' ? 'b' : 'w') : null;
  const aiTurn = aiColor !== null && state.turn === aiColor && status.kind === 'playing';

  const targets: Move[] = useMemo(
    () => (selected === null ? [] : legalMoves(state, selected)),
    [state, selected],
  );

  // Lazily create the search worker; fall back to the main thread if workers are unavailable.
  const getWorker = useCallback((): Worker | null => {
    if (workerRef.current) return workerRef.current;
    if (typeof window === 'undefined' || typeof Worker === 'undefined') return null;
    try {
      workerRef.current = new Worker(new URL('./ai.worker.ts', import.meta.url));
      return workerRef.current;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => () => workerRef.current?.terminate(), []);

  // Let the computer move when it is its turn.
  useEffect(() => {
    if (!aiTurn) return;
    const id = ++requestId.current;
    const options = LEVELS[level];
    setThinking(true);
    const apply = (result: SearchResult) => {
      if (id !== requestId.current) return; // stale
      setThinking(false);
      if (result.move) setState((s) => (s === state ? makeMove(s, result.move!) : s));
    };
    const worker = getWorker();
    if (worker) {
      const onMessage = (e: MessageEvent<{ id: number; result: SearchResult }>) => {
        if (e.data.id !== id) return;
        worker.removeEventListener('message', onMessage);
        apply(e.data.result);
      };
      worker.addEventListener('message', onMessage);
      worker.postMessage({ id, state, options });
      return () => worker.removeEventListener('message', onMessage);
    }
    const timer = window.setTimeout(() => apply(findBestMove(state, options)), 30);
    return () => window.clearTimeout(timer);
  }, [aiTurn, state, level, getWorker]);

  const play = useCallback((move: Move) => {
    setState((s) => makeMove(s, move));
    setSelected(null);
    setPending(null);
  }, []);

  const clickCell = useCallback(
    (cell: Cell) => {
      if (status.kind !== 'playing' || aiTurn || pending) return;
      const piece = state.board[cell];
      if (selected !== null) {
        const moves = targets.filter((m) => m.to === cell);
        if (moves.length === 1) return play(moves[0]);
        if (moves.length > 1) {
          setPending({ from: selected, to: cell, options: moves.map((m) => m.promotion!) });
          return;
        }
      }
      if (piece && piece.color === state.turn) setSelected(cell === selected ? null : cell);
      else setSelected(null);
    },
    [status.kind, aiTurn, pending, state, selected, targets, play],
  );

  const choosePromotion = useCallback(
    (type: PieceType) => {
      if (!pending) return;
      play({ from: pending.from, to: pending.to, promotion: type });
    },
    [pending, play],
  );

  const newGame = useCallback(() => {
    requestId.current++;
    setThinking(false);
    setState(createGame());
    setSelected(null);
    setPending(null);
  }, []);

  const undo = useCallback(() => {
    requestId.current++;
    setThinking(false);
    setSelected(null);
    setPending(null);
    setState((s) => {
      let next = undoLast(s);
      // Against the computer, take back the computer's reply as well.
      if (mode === 'ai' && next.turn !== humanColor && next.history.length > 0) next = undoLast(next);
      return next;
    });
  }, [mode, humanColor]);

  const changeMode = useCallback((m: Mode) => { setMode(m); }, []);
  const changeHumanColor = useCallback((c: Color) => { setHumanColor(c); }, []);

  const lastMove = state.history.length ? state.history[state.history.length - 1] : null;

  return {
    state, status, mode, humanColor, level, selected, targets, pending, thinking, aiTurn, lastMove,
    clickCell, choosePromotion, newGame, undo, setLevel, changeMode, changeHumanColor, cancelPromotion: () => setPending(null),
  };
}
