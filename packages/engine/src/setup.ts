import { cellByName } from './geometry';
import type { Piece, PieceType } from './types';

/**
 * Starting position (Fig. 1 of the official instructions).
 * White sits at the bottom (rows 1–5), Black at the top (rows 13–17).
 * Each player lays out "2 5 8 9 6 4 3" and "II V VIII IX VI IV III" from their own left to right.
 */
export const WHITE_SETUP: ReadonlyArray<readonly [string, PieceType]> = [
  ['G1', '1'],
  ['E3', 'X'], ['G3', '7'], ['I3', 'X'],
  ['B4', '2'], ['D4', '5'], ['F4', '8'], ['H4', '9'], ['J4', '6'], ['L4', '4'], ['N4', '3'],
  ['A5', 'II'], ['C5', 'V'], ['E5', 'VIII'], ['G5', 'IX'], ['I5', 'VI'], ['K5', 'IV'], ['M5', 'III'],
];

export const BLACK_SETUP: ReadonlyArray<readonly [string, PieceType]> = [
  ['G17', '1'],
  ['E15', 'X'], ['G15', '7'], ['I15', 'X'],
  ['N14', '2'], ['L14', '5'], ['J14', '8'], ['H14', '9'], ['F14', '6'], ['D14', '4'], ['B14', '3'],
  ['M13', 'II'], ['K13', 'V'], ['I13', 'VIII'], ['G13', 'IX'], ['E13', 'VI'], ['C13', 'IV'], ['A13', 'III'],
];

export function initialBoard(): (Piece | null)[] {
  const board: (Piece | null)[] = new Array(89).fill(null);
  for (const [name, type] of WHITE_SETUP) board[cellByName(name)] = { type, color: 'w' };
  for (const [name, type] of BLACK_SETUP) board[cellByName(name)] = { type, color: 'b' };
  return board;
}
