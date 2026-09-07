import {
  ALL_DIRS, CELLS, CELL_COUNT, EDGE_DIRS, VERTEX_DIRS,
  PIECE3_KNIGHT, PIECE5_OFFSETS, PIECE6_HORIZONTAL_FIRST, PIECE6_VERTICAL_FIRST,
  backwardDirs, cellAt, cellName, forwardDirs, leapPaths, opposite, type Offset,
} from './geometry';
import { initialBoard } from './setup';
import {
  ARABIC_PROMOTIONS, DEFAULT_RULES, ROMAN_TO_ARABIC, ROMAN_TYPES,
  type Cell, type Color, type GameState, type GameStatus, type Move, type MoveRecord, type Piece, type PieceType, type RulesConfig,
} from './types';

// ---------------------------------------------------------------------------
// State construction

export function createGame(rules: Partial<RulesConfig> = {}): GameState {
  const state: GameState = {
    board: initialBoard(),
    turn: 'w',
    halfmoveClock: 0,
    history: [],
    positions: [],
    rules: { ...DEFAULT_RULES, ...rules },
  };
  state.positions.push(positionKey(state));
  return state;
}

/** Build a state from an explicit piece list — used by tests and puzzles. */
export function createPosition(
  pieces: ReadonlyArray<readonly [cell: string, type: PieceType, color: Color]>,
  turn: Color = 'w',
  rules: Partial<RulesConfig> = {},
): GameState {
  const board: (Piece | null)[] = new Array(CELL_COUNT).fill(null);
  for (const [name, type, color] of pieces) {
    const idx = CELLS.findIndex((c) => c.name === name);
    if (idx < 0) throw new Error(`Unknown cell ${name}`);
    board[idx] = { type, color };
  }
  const state: GameState = { board, turn, halfmoveClock: 0, history: [], positions: [], rules: { ...DEFAULT_RULES, ...rules } };
  state.positions.push(positionKey(state));
  return state;
}

export function positionKey(state: GameState): string {
  let s = state.turn;
  for (let i = 0; i < CELL_COUNT; i++) {
    const p = state.board[i];
    s += p ? `${p.color}${p.type},` : '.';
  }
  return s;
}

export function isRoman(type: PieceType): boolean {
  return ROMAN_TYPES.includes(type);
}

/** Roman pawns and X count as "pawn-like" for the 50-move clock. */
function isPawnLike(type: PieceType): boolean {
  return type === 'X' || isRoman(type);
}

export function kingCell(state: GameState, color: Color): Cell {
  for (let i = 0; i < CELL_COUNT; i++) {
    const p = state.board[i];
    if (p && p.type === '1' && p.color === color) return i;
  }
  return -1;
}

// ---------------------------------------------------------------------------
// Pseudo-legal move generation

interface Target { to: Cell; promotion?: PieceType }

/**
 * Where a piece could go ignoring the "own king left in check" rule.
 * With `forAttack` the enemy king counts as a target and the zone ban is ignored —
 * this is used to compute attacked cells (check detection).
 */
export function pseudoTargets(state: GameState, from: Cell, forAttack = false): Target[] {
  const piece = state.board[from];
  if (!piece) return [];
  const { x, y } = CELLS[from];
  const color = piece.color;
  const rules = state.rules;
  const out: Cell[] = [];

  const canLand = (to: Cell): boolean => {
    const target = state.board[to];
    if (target) {
      if (target.color === color) return false;
      if (target.type === '1' && !forAttack) return false; // piece 1 is never captured
    }
    if (!forAttack) {
      const zone = CELLS[to].zone;
      if (zone && zone !== color) return false; // may not enter the enemy king's zone
    }
    return true;
  };

  const step = (dirs: readonly Offset[]) => {
    for (const [dx, dy] of dirs) {
      const to = cellAt(x + dx, y + dy);
      if (to >= 0 && canLand(to)) out.push(to);
    }
  };

  const slide = (dirs: readonly Offset[]) => {
    for (const [dx, dy] of dirs) {
      let cx = x + dx, cy = y + dy;
      for (;;) {
        const to = cellAt(cx, cy);
        if (to < 0) break;
        const target = state.board[to];
        if (canLand(to)) out.push(to);
        if (target) break;
        cx += dx; cy += dy;
      }
    }
  };

  const leap = (offsets: readonly Offset[]) => {
    for (const off of offsets) {
      const to = cellAt(x + off[0], y + off[1]);
      if (to < 0 || !canLand(to)) continue;
      if (!rules.leapersJump) {
        const clear = leapPaths(off).some((path) =>
          path.every(([px, py]) => {
            const c = cellAt(x + px, y + py);
            return c >= 0 && !state.board[c];
          }),
        );
        if (!clear) continue;
      }
      out.push(to);
    }
  };

  switch (piece.type) {
    case '1':
      if (rules.kingCaptures) step(ALL_DIRS);
      else {
        for (const [dx, dy] of ALL_DIRS) {
          const to = cellAt(x + dx, y + dy);
          if (to >= 0 && !state.board[to] && canLand(to)) out.push(to);
        }
      }
      break;
    case '9': step(ALL_DIRS); break;
    case '7': slide(ALL_DIRS); break;
    case '8': slide(EDGE_DIRS); break;
    case '4': slide(VERTEX_DIRS); break;
    case '2': step(VERTEX_DIRS); break;
    case '5': leap(PIECE5_OFFSETS); break;
    case '6':
      leap(PIECE6_VERTICAL_FIRST);
      if (rules.piece6 === 'both') leap(PIECE6_HORIZONTAL_FIRST);
      break;
    case '3':
      if (rules.piece3 === 'knight') leap(PIECE3_KNIGHT);
      else step(ALL_DIRS);
      break;
    case 'X':
      if (rules.xMove === 'king') step(ALL_DIRS);
      else {
        step(forwardDirs(color));
        if (rules.romanBackward) step(backwardDirs(color));
      }
      break;
    default: // Roman numerals
      step(forwardDirs(color));
      if (rules.romanBackward) step(backwardDirs(color));
  }

  if (forAttack) return out.map((to) => ({ to }));

  // Promotions on the opponent's X start cells
  const targets: Target[] = [];
  for (const to of out) {
    if (CELLS[to].promotionFor === color && (piece.type === 'X' || isRoman(piece.type))) {
      if (piece.type === 'X') for (const promotion of ARABIC_PROMOTIONS) targets.push({ to, promotion });
      else targets.push({ to, promotion: ROMAN_TO_ARABIC[piece.type] });
    } else {
      targets.push({ to });
    }
  }
  return targets;
}

export function isAttacked(state: GameState, cell: Cell, by: Color): boolean {
  for (let from = 0; from < CELL_COUNT; from++) {
    const p = state.board[from];
    if (!p || p.color !== by) continue;
    const targets = pseudoTargets(state, from, true);
    for (const t of targets) if (t.to === cell) return true;
  }
  return false;
}

export function isInCheck(state: GameState, color: Color): boolean {
  const k = kingCell(state, color);
  return k >= 0 && isAttacked(state, k, opposite(color));
}

// ---------------------------------------------------------------------------
// Mutable apply / undo (used by search)

export interface Undo {
  move: Move;
  moved: Piece;
  captured: Piece | null;
  halfmoveClock: number;
}

export function applyMove(state: GameState, move: Move): Undo {
  const moved = state.board[move.from];
  if (!moved) throw new Error(`No piece on ${cellName(move.from)}`);
  const captured = state.board[move.to];
  const undo: Undo = { move, moved, captured, halfmoveClock: state.halfmoveClock };
  state.board[move.to] = move.promotion ? { type: move.promotion, color: moved.color } : moved;
  state.board[move.from] = null;
  state.halfmoveClock = captured || isPawnLike(moved.type) ? 0 : state.halfmoveClock + 1;
  state.turn = opposite(state.turn);
  return undo;
}

export function undoMove(state: GameState, undo: Undo): void {
  state.board[undo.move.from] = undo.moved;
  state.board[undo.move.to] = undo.captured;
  state.halfmoveClock = undo.halfmoveClock;
  state.turn = opposite(state.turn);
}

// ---------------------------------------------------------------------------
// Legal moves and game status

export function legalMoves(state: GameState, from?: Cell): Move[] {
  const color = state.turn;
  const out: Move[] = [];
  const cells = from === undefined ? range(CELL_COUNT) : [from];
  for (const c of cells) {
    const p = state.board[c];
    if (!p || p.color !== color) continue;
    for (const t of pseudoTargets(state, c)) {
      const move: Move = t.promotion ? { from: c, to: t.to, promotion: t.promotion } : { from: c, to: t.to };
      const undo = applyMove(state, move);
      const ok = !isInCheck(state, color);
      undoMove(state, undo);
      if (ok) out.push(move);
    }
  }
  return out;
}

function range(n: number): number[] {
  const a = new Array(n);
  for (let i = 0; i < n; i++) a[i] = i;
  return a;
}

export function insufficientMaterial(state: GameState): boolean {
  for (const p of state.board) if (p && p.type !== '1') return false;
  return true;
}

export function gameStatus(state: GameState): GameStatus {
  const check = isInCheck(state, state.turn);
  if (legalMoves(state).length === 0) {
    return check ? { kind: 'checkmate', winner: opposite(state.turn) } : { kind: 'stalemate' };
  }
  if (insufficientMaterial(state)) return { kind: 'draw', reason: 'material' };
  if (state.rules.fiftyMoveRule && state.halfmoveClock >= 100) return { kind: 'draw', reason: 'fifty' };
  if (state.rules.threefoldRepetition) {
    const key = positionKey(state);
    let n = 0;
    for (const k of state.positions) if (k === key) n++;
    if (n >= 3) return { kind: 'draw', reason: 'repetition' };
  }
  return { kind: 'playing', check };
}

export function isGameOver(state: GameState): boolean {
  return gameStatus(state).kind !== 'playing';
}

/** Immutable move application for the UI: validates legality and records history. */
export function makeMove(state: GameState, move: Move): GameState {
  const legal = legalMoves(state, move.from).find(
    (m) => m.to === move.to && (m.promotion ?? null) === (move.promotion ?? null),
  );
  if (!legal) throw new Error(`Illegal move ${cellName(move.from)}-${cellName(move.to)}`);

  const next: GameState = {
    ...state,
    board: state.board.slice(),
    history: state.history.slice(),
    positions: state.positions.slice(),
  };
  const piece = next.board[move.from]!;
  const captured = next.board[move.to];
  applyMove(next, legal);
  next.positions.push(positionKey(next));

  const status = gameStatus(next);
  const check = status.kind === 'checkmate' || (status.kind === 'playing' && status.check);
  const san =
    `${piece.type}${cellName(move.from)}${captured ? 'x' : '-'}${cellName(move.to)}` +
    (legal.promotion ? `=${legal.promotion}` : '') +
    (status.kind === 'checkmate' ? '#' : check ? '+' : '');
  const record: MoveRecord = { ...legal, piece, captured, san, check };
  next.history.push(record);
  return next;
}

/** Undo the last move (UI helper). Returns the same state if there is nothing to undo. */
export function undoLast(state: GameState): GameState {
  if (state.history.length === 0) return state;
  const last = state.history[state.history.length - 1];
  const next: GameState = {
    ...state,
    board: state.board.slice(),
    history: state.history.slice(0, -1),
    positions: state.positions.slice(0, -1),
  };
  next.board[last.from] = last.piece;
  next.board[last.to] = last.captured;
  next.turn = opposite(state.turn);
  // Recompute the halfmove clock by replaying the history is expensive; approximate conservatively.
  next.halfmoveClock = Math.max(0, state.halfmoveClock - 1);
  return next;
}
