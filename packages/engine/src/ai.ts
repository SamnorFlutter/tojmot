import { CELLS, CELL_COUNT } from './geometry';
import { applyMove, isInCheck, legalMoves, undoMove } from './moves';
import type { Color, GameState, Move, PieceType } from './types';

/** Rough material values (centipawns). Piece 1 is uncapturable, so it carries no material value. */
export const PIECE_VALUES: Readonly<Record<PieceType, number>> = {
  '1': 0,
  '7': 900,
  '8': 500,
  '4': 330,
  '3': 300,
  '9': 290,
  '6': 240,
  '5': 200,
  '2': 150,
  X: 170,
  II: 100,
  III: 110,
  IV: 110,
  V: 105,
  VI: 110,
  VIII: 130,
  IX: 115,
};

const MATE = 100_000;

export interface SearchOptions {
  /** Maximum search depth in plies (default 4). */
  depth?: number;
  /** Soft time limit in ms; iterative deepening stops when exceeded (default 800). */
  timeMs?: number;
  /** Random noise added to leaf evaluations, in centipawns (default 5) — keeps games varied. */
  randomness?: number;
  /** Deterministic RNG for tests. */
  random?: () => number;
  /** Extra capture-only plies searched at leaves (default 3). 0 = none — makes weak levels genuinely weak. */
  quiescenceDepth?: number;
}

export interface SearchResult {
  move: Move | null;
  /** Score from the side-to-move's perspective, centipawns. */
  score: number;
  depth: number;
  nodes: number;
}

/** Static evaluation from `color`'s point of view. */
export function evaluate(state: GameState, color: Color): number {
  let score = 0;
  for (let i = 0; i < CELL_COUNT; i++) {
    const p = state.board[i];
    if (!p) continue;
    let v = PIECE_VALUES[p.type];
    const cell = CELLS[i];
    if (p.type === '1') {
      // Prefer the king inside its protected zone
      if (cell.zone === p.color) v += 25;
    } else if (p.type === 'X' || (p.type !== '7' && isRomanType(p.type))) {
      // Advancement towards the promotion cells (rows 15 / 3)
      const progress = p.color === 'w' ? cell.y - 5 : 13 - cell.y;
      v += Math.max(0, progress) * 6;
    } else {
      // Mild centralisation for the rest
      const dx = Math.abs(cell.x - 7.5), dy = Math.abs(cell.y - 9);
      v += Math.max(0, 8 - dx - dy * 0.7) * 2;
    }
    score += p.color === color ? v : -v;
  }
  return score;
}

function isRomanType(t: PieceType): boolean {
  return t === 'II' || t === 'III' || t === 'IV' || t === 'V' || t === 'VI' || t === 'VIII' || t === 'IX';
}

function orderMoves(state: GameState, moves: Move[]): Move[] {
  const score = (m: Move): number => {
    let s = 0;
    const target = state.board[m.to];
    if (target) s += 10 * PIECE_VALUES[target.type] - PIECE_VALUES[state.board[m.from]!.type] / 10;
    if (m.promotion) s += 5 * PIECE_VALUES[m.promotion];
    return s;
  };
  return moves
    .map((m) => ({ m, s: score(m) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.m);
}

export function findBestMove(input: GameState, options: SearchOptions = {}): SearchResult {
  const maxDepth = options.depth ?? 4;
  const timeMs = options.timeMs ?? 800;
  const noise = options.randomness ?? 5;
  const rnd = options.random ?? Math.random;
  const qMax = options.quiescenceDepth ?? 3;
  const start = Date.now();
  const deadline = start + timeMs;

  // Search on a private mutable copy
  const state: GameState = { ...input, board: input.board.slice(), history: [], positions: [] };
  const me = state.turn;
  let nodes = 0;
  let aborted = false;

  const timeUp = (): boolean => {
    if ((nodes & 1023) === 0 && Date.now() > deadline) aborted = true;
    return aborted;
  };

  function quiesce(alpha: number, beta: number, color: Color, qDepth: number): number {
    nodes++;
    const stand = evaluate(state, color) + (noise ? (rnd() - 0.5) * 2 * noise : 0);
    if (qDepth === 0 || stand >= beta) return stand;
    if (stand > alpha) alpha = stand;
    const captures = orderMoves(state, legalMoves(state).filter((m) => state.board[m.to] !== null || m.promotion));
    for (const m of captures) {
      const undo = applyMove(state, m);
      const v = -quiesce(-beta, -alpha, color === 'w' ? 'b' : 'w', qDepth - 1);
      undoMove(state, undo);
      if (v >= beta) return v;
      if (v > alpha) alpha = v;
      if (timeUp()) break;
    }
    return alpha;
  }

  function negamax(depth: number, alpha: number, beta: number, color: Color, ply: number): number {
    if (timeUp()) return 0;
    const moves = legalMoves(state);
    if (moves.length === 0) {
      return isInCheck(state, color) ? -MATE + ply : 0;
    }
    if (depth === 0) return quiesce(alpha, beta, color, qMax);
    nodes++;
    let best = -Infinity;
    for (const m of orderMoves(state, moves)) {
      const undo = applyMove(state, m);
      const v = -negamax(depth - 1, -beta, -alpha, color === 'w' ? 'b' : 'w', ply + 1);
      undoMove(state, undo);
      if (aborted) return best === -Infinity ? 0 : best;
      if (v > best) best = v;
      if (v > alpha) alpha = v;
      if (alpha >= beta) break;
    }
    return best;
  }

  const rootMoves = orderMoves(state, legalMoves(state));
  if (rootMoves.length === 0) return { move: null, score: isInCheck(state, me) ? -MATE : 0, depth: 0, nodes };

  let bestMove: Move = rootMoves[0];
  let bestScore = -Infinity;
  let completedDepth = 0;

  for (let depth = 1; depth <= maxDepth; depth++) {
    let iterBest: Move | null = null;
    let iterScore = -Infinity;
    let alpha = -Infinity;
    // Search the previous best move first for better pruning
    const ordered = [bestMove, ...rootMoves.filter((m) => m !== bestMove)];
    for (const m of ordered) {
      const undo = applyMove(state, m);
      const v = -negamax(depth - 1, -Infinity, -alpha, me === 'w' ? 'b' : 'w', 1);
      undoMove(state, undo);
      if (aborted) break;
      if (v > iterScore) {
        iterScore = v;
        iterBest = m;
      }
      if (v > alpha) alpha = v;
    }
    if (aborted) break;
    if (iterBest) {
      bestMove = iterBest;
      bestScore = iterScore;
      completedDepth = depth;
    }
    if (Math.abs(bestScore) >= MATE - 100) break; // forced mate found
  }

  return { move: bestMove, score: bestScore, depth: completedDepth, nodes };
}
