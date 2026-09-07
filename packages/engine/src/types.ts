export type Color = 'w' | 'b';

/** Arabic pieces 1–9, the X piece and the Roman "pawns". */
export type PieceType =
  | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | 'X'
  | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VIII' | 'IX';

export const ROMAN_TYPES: readonly PieceType[] = ['II', 'III', 'IV', 'V', 'VI', 'VIII', 'IX'];
export const ARABIC_PROMOTIONS: readonly PieceType[] = ['2', '3', '4', '5', '6', '7', '8', '9'];

/** Roman numeral -> the Arabic piece it promotes into. */
export const ROMAN_TO_ARABIC: Readonly<Record<string, PieceType>> = {
  II: '2', III: '3', IV: '4', V: '5', VI: '6', VIII: '8', IX: '9',
};

export interface Piece {
  type: PieceType;
  color: Color;
}

/** Cell index 0..88 (see geometry.ts). */
export type Cell = number;

export interface Move {
  from: Cell;
  to: Cell;
  /** Set when a Roman / X piece promotes on this move. */
  promotion?: PieceType;
}

export interface MoveRecord extends Move {
  piece: Piece;
  captured: Piece | null;
  /** Notation like "3N4-M7" or "IXG5xF6=9". */
  san: string;
  /** True if the move gave check. */
  check: boolean;
}

/**
 * Rule variants for the points the official instructions leave ambiguous.
 * Defaults are our best reading of the instructions (see docs/RULES.md).
 */
export interface RulesConfig {
  /** Piece 3: 'knight' = 1 straight step + 1 diagonal step (8 L-shaped targets); 'king' = any adjacent cell. */
  piece3: 'knight' | 'king';
  /** Piece 6: 'both' = 2 vertical+1 horizontal AND 2 horizontal+1 vertical; 'verticalFirst' = only the former. */
  piece6: 'both' | 'verticalFirst';
  /** Whether 3, 5, 6 jump over intervening pieces (like a chess knight). */
  leapersJump: boolean;
  /** How X moves: like a Roman pawn (forward diagonals) or one step in any direction. */
  xMove: 'roman' | 'king';
  /** Romans (and X in 'roman' mode) may also step diagonally backward. */
  romanBackward: boolean;
  /** Piece 1 may capture enemy pieces. */
  kingCaptures: boolean;
  /** Draw after 50 moves (100 plies) without capture or Roman/X move. */
  fiftyMoveRule: boolean;
  /** Draw on threefold repetition. */
  threefoldRepetition: boolean;
}

export const DEFAULT_RULES: RulesConfig = {
  piece3: 'knight',
  piece6: 'both',
  leapersJump: true,
  xMove: 'roman',
  romanBackward: false,
  kingCaptures: true,
  fiftyMoveRule: true,
  threefoldRepetition: true,
};

export type GameStatus =
  | { kind: 'playing'; check: boolean }
  | { kind: 'checkmate'; winner: Color }
  | { kind: 'stalemate' }
  | { kind: 'draw'; reason: 'material' | 'fifty' | 'repetition' };

export interface GameState {
  board: (Piece | null)[];
  turn: Color;
  /** Plies since the last capture or Roman/X move. */
  halfmoveClock: number;
  history: MoveRecord[];
  /** Position keys for repetition detection (includes the current position). */
  positions: string[];
  rules: RulesConfig;
}
