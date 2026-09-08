import type { Cell, Color, PieceType } from './types';

/**
 * Board geometry.
 *
 * The board is drawn as a diamond of rhombic cells. We use "half coordinates":
 *   x = 1..14 (columns A..N), y = 1..17 (rows).
 * A cell exists only where x ≡ y (mod 2).
 *   - body: rows 4..14, 7 cells each (even rows on B D F H J L N, odd rows on A C E G I K M)
 *   - king "spikes": G1 | F2 H2 | E3 G3 I3 and mirrored E15 G15 I15 | F16 H16 | G17
 * Total 89 cells.
 *
 * Neighbourhood in this frame:
 *   - edge step ("45°" in the instructions):        (x±1, y±1)  -> opposite colour cell
 *   - vertex step ("vertical/horizontal", own colour): (x, y±2), (x±2, y)
 */

export const COLS = 'ABCDEFGHIJKLMN';
export const WIDTH = 14;
export const HEIGHT = 17;

export interface CellInfo {
  index: Cell;
  x: number;
  y: number;
  name: string;
  /** 'light' for odd rows / spikes, 'dark' for even body rows. */
  shade: 'light' | 'dark';
  /** Which king's protected zone this cell belongs to, if any. */
  zone: Color | null;
  /** Arabic piece a White pawn-like piece becomes here (row 14 — Black's Arabic row). */
  promoW: PieceType | null;
  /** Arabic piece a Black pawn-like piece becomes here (row 4 — White's Arabic row). */
  promoB: PieceType | null;
  /** Legacy variant: the X start cells, where that colour used to promote. */
  xPromotionFor: Color | null;
}

const SPIKES: ReadonlyArray<readonly [number, number]> = [
  [7, 1], [6, 2], [8, 2], [5, 3], [7, 3], [9, 3],
  [5, 15], [7, 15], [9, 15], [6, 16], [8, 16], [7, 17],
];

/**
 * The king's sanctuary: the king's own cell plus the three cells of its spike
 * ("3 cells plus the 1"). No piece may enter it — not even the owner's own pieces;
 * only that side's 1 may stand there.
 */
const WHITE_ZONE: ReadonlyArray<readonly [number, number]> = [[7, 1], [6, 2], [8, 2], [7, 3]];
const BLACK_ZONE: ReadonlyArray<readonly [number, number]> = [[7, 17], [6, 16], [8, 16], [7, 15]];

/**
 * The Arabic numerals' home rows. A Roman piece that reaches the opponent's Arabic row
 * turns into the numeral belonging to that very cell (X may choose any numeral 2–9).
 * Keys are the x coordinate; White's row is y = 4, Black's row is y = 14.
 */
const WHITE_ARABIC_ROW: Readonly<Record<number, PieceType>> = {
  2: '2', 4: '5', 6: '8', 8: '9', 10: '6', 12: '4', 14: '3',
};
const BLACK_ARABIC_ROW: Readonly<Record<number, PieceType>> = {
  14: '2', 12: '5', 10: '8', 8: '9', 6: '6', 4: '4', 2: '3',
};

/** Start cells of the opponent's X pieces (legacy promotion variant). */
const WHITE_X_PROMOTION: ReadonlyArray<readonly [number, number]> = [[5, 15], [9, 15]];
const BLACK_X_PROMOTION: ReadonlyArray<readonly [number, number]> = [[5, 3], [9, 3]];

function has(list: ReadonlyArray<readonly [number, number]>, x: number, y: number): boolean {
  return list.some(([a, b]) => a === x && b === y);
}

export const CELLS: readonly CellInfo[] = (() => {
  const out: CellInfo[] = [];
  for (let y = 1; y <= HEIGHT; y++) {
    for (let x = 1; x <= WIDTH; x++) {
      if ((x + y) % 2 !== 0) continue;
      const body = y >= 4 && y <= 14;
      const spike = has(SPIKES, x, y);
      if (!body && !spike) continue;
      const zone: Color | null = has(WHITE_ZONE, x, y) ? 'w' : has(BLACK_ZONE, x, y) ? 'b' : null;
      out.push({
        index: out.length,
        x,
        y,
        name: `${COLS[x - 1]}${y}`,
        shade: spike || y % 2 === 1 ? 'light' : 'dark',
        zone,
        promoW: y === 14 ? BLACK_ARABIC_ROW[x] ?? null : null,
        promoB: y === 4 ? WHITE_ARABIC_ROW[x] ?? null : null,
        xPromotionFor: has(WHITE_X_PROMOTION, x, y) ? 'w' : has(BLACK_X_PROMOTION, x, y) ? 'b' : null,
      });
    }
  }
  return out;
})();

export const CELL_COUNT = CELLS.length; // 89

/** INDEX[y][x] -> cell index or -1 */
const INDEX: number[][] = (() => {
  const grid: number[][] = [];
  for (let y = 0; y <= HEIGHT + 1; y++) grid.push(new Array(WIDTH + 2).fill(-1));
  for (const c of CELLS) grid[c.y][c.x] = c.index;
  return grid;
})();

export function cellAt(x: number, y: number): Cell {
  if (y < 1 || y > HEIGHT || x < 1 || x > WIDTH) return -1;
  return INDEX[y][x];
}

export function cellByName(name: string): Cell {
  const m = /^([A-N])(\d{1,2})$/i.exec(name.trim());
  if (!m) return -1;
  return cellAt(COLS.indexOf(m[1].toUpperCase()) + 1, Number(m[2]));
}

export function cellName(cell: Cell): string {
  return CELLS[cell].name;
}

export type Offset = readonly [dx: number, dy: number];

export const EDGE_DIRS: readonly Offset[] = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
export const VERTEX_DIRS: readonly Offset[] = [[0, 2], [0, -2], [2, 0], [-2, 0]];
export const ALL_DIRS: readonly Offset[] = [...EDGE_DIRS, ...VERTEX_DIRS];

/** Piece 5: one vertical + one horizontal vertex step ("Г"). */
export const PIECE5_OFFSETS: readonly Offset[] = [[2, 2], [2, -2], [-2, 2], [-2, -2]];
/** Piece 6: two vertical + one horizontal vertex steps. */
export const PIECE6_VERTICAL_FIRST: readonly Offset[] = [[2, 4], [-2, 4], [2, -4], [-2, -4]];
export const PIECE6_HORIZONTAL_FIRST: readonly Offset[] = [[4, 2], [-4, 2], [4, -2], [-4, -2]];
/** Piece 3 as "1 straight + 1 diagonal": the 8 L-shaped targets. */
export const PIECE3_KNIGHT: readonly Offset[] = [[1, 3], [-1, 3], [1, -3], [-1, -3], [3, 1], [-3, 1], [3, -1], [-3, -1]];

/**
 * For non-jumping leapers: the alternative paths (lists of intermediate offsets) for each leap.
 * A leap is allowed if at least one path is completely empty.
 */
export function leapPaths(offset: Offset): Offset[][] {
  const [dx, dy] = offset;
  const ax = Math.abs(dx), ay = Math.abs(dy);
  const sx = Math.sign(dx), sy = Math.sign(dy);
  if (ax === 2 && ay === 2) {
    // vertical then horizontal / horizontal then vertical
    return [[[0, dy]], [[dx, 0]]];
  }
  if ((ax === 2 && ay === 4) || (ax === 4 && ay === 2)) {
    if (ay === 4) return [[[0, 2 * sy], [0, 4 * sy]], [[dx, 0], [dx, 2 * sy]]];
    return [[[2 * sx, 0], [4 * sx, 0]], [[0, dy], [2 * sx, dy]]];
  }
  if ((ax === 1 && ay === 3) || (ax === 3 && ay === 1)) {
    if (ay === 3) return [[[0, 2 * sy]], [[dx, sy]]];
    return [[[2 * sx, 0]], [[sx, dy]]];
  }
  return [[]];
}

export function forwardDirs(color: Color): readonly Offset[] {
  return color === 'w' ? [[1, 1], [-1, 1]] : [[1, -1], [-1, -1]];
}

export function backwardDirs(color: Color): readonly Offset[] {
  return color === 'w' ? [[1, -1], [-1, -1]] : [[1, 1], [-1, 1]];
}

export function opposite(color: Color): Color {
  return color === 'w' ? 'b' : 'w';
}
