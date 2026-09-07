'use client';

import { CELLS, COLS, kingCell, type Cell, type GameState, type Move, type MoveRecord } from '@tojmot/engine';

const S = 40; // half-diagonal of a cell
const M = 44; // margin for coordinates
const W = M * 2 + 15 * S;
const H = M * 2 + 18 * S;

export type BoardTheme = 'light' | 'dark';

const PALETTES = {
  light: {
    light: '#f5efdf', dark: '#3b6b4c', zone: '#eedf9c', lastLight: '#e6d48a', lastDark: '#7d8f3f', selected: '#f0c24f',
    border: '#2f5a3f', coords: '#5f7a62',
    whiteFill: '#fdf9ee', whiteStroke: '#1e5631', whiteText: '#1e5631',
    blackFill: '#22301f', blackStroke: '#d4b24a', blackText: '#f2d67a',
    hintOnDark: '#f5efdf', hintOnLight: '#1e5631',
  },
  dark: {
    light: '#d6cdb3', dark: '#2a5a3f', zone: '#c8ad60', lastLight: '#b9ad63', lastDark: '#5d7a36', selected: '#d9a93f',
    border: '#16301f', coords: '#8fa892',
    whiteFill: '#efe8d3', whiteStroke: '#1e5631', whiteText: '#1e5631',
    blackFill: '#15140f', blackStroke: '#d4b24a', blackText: '#f2d67a',
    hintOnDark: '#efe8d3', hintOnLight: '#1e5631',
  },
} as const;

interface Props {
  state: GameState;
  theme?: BoardTheme;
  flipped: boolean;
  selected: Cell | null;
  targets: Move[];
  lastMove: MoveRecord | null;
  inCheck: boolean;
  showHints: boolean;
  /** Cells highlighted with a pulsing outline (tutorial targets). */
  marks?: Cell[];
  onCellClick: (cell: Cell) => void;
}

export default function Board({ state, theme = 'light', flipped, selected, targets, lastMove, inCheck, showHints, marks, onCellClick }: Props) {
  const P = PALETTES[theme];
  const pos = (x: number, y: number) =>
    flipped ? { cx: M + (15 - x) * S, cy: M + y * S } : { cx: M + x * S, cy: M + (18 - y) * S };

  const checkedKing = inCheck ? kingCell(state, state.turn) : -1;
  const targetSet = new Map<Cell, boolean>();
  for (const t of targets) targetSet.set(t.to, state.board[t.to] !== null);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto max-h-[88vh] select-none"
      role="grid"
      aria-label="Tojmot board"
    >
      {/* coordinates */}
      {Array.from({ length: 14 }, (_, i) => i + 1).map((x) => {
        const { cx } = pos(x, 0);
        return (
          <text key={`c${x}`} x={cx} y={H - 12} textAnchor="middle" fontSize="13" fontWeight="600" fill={P.coords}>
            {COLS[x - 1]}
          </text>
        );
      })}
      {Array.from({ length: 17 }, (_, i) => i + 1).map((y) => {
        const { cy } = pos(0, y);
        return (
          <text key={`r${y}`} x={14} y={cy + 4} textAnchor="middle" fontSize="12" fontWeight="600" fill={P.coords}>
            {y}
          </text>
        );
      })}

      {/* cells */}
      {CELLS.map((cell) => {
        const { cx, cy } = pos(cell.x, cell.y);
        const isLast = lastMove !== null && (lastMove.from === cell.index || lastMove.to === cell.index);
        const isSelected = selected === cell.index;
        let fill: string = cell.zone ? P.zone : cell.shade === 'light' ? P.light : P.dark;
        if (isLast) fill = cell.shade === 'light' || cell.zone ? P.lastLight : P.lastDark;
        if (isSelected) fill = P.selected;
        return (
          <polygon
            key={cell.index}
            className="board-cell"
            points={`${cx},${cy - S} ${cx + S},${cy} ${cx},${cy + S} ${cx - S},${cy}`}
            fill={fill}
            stroke={P.border}
            strokeWidth={1}
            onClick={() => onCellClick(cell.index)}
          />
        );
      })}

      {/* tutorial marks */}
      {marks?.map((c) => {
        const cell = CELLS[c];
        const { cx, cy } = pos(cell.x, cell.y);
        const d = S - 6;
        return (
          <polygon
            key={`m${c}`}
            className="check-ring"
            points={`${cx},${cy - d} ${cx + d},${cy} ${cx},${cy + d} ${cx - d},${cy}`}
            fill="none"
            stroke="#e0a92e"
            strokeWidth={4}
            pointerEvents="none"
          />
        );
      })}

      {/* legal move hints */}
      {showHints &&
        targets.map((t) => {
          const cell = CELLS[t.to];
          const { cx, cy } = pos(cell.x, cell.y);
          const capture = targetSet.get(t.to);
          const dark = cell.shade === 'dark' && !cell.zone;
          return capture ? (
            <circle key={`t${t.to}-${t.promotion ?? ''}`} cx={cx} cy={cy} r={S * 0.7} fill="none" stroke="#e53935" strokeWidth={4} opacity={0.9} pointerEvents="none" />
          ) : (
            <circle
              key={`t${t.to}-${t.promotion ?? ''}`}
              cx={cx}
              cy={cy}
              r={S * 0.26}
              fill={dark ? P.hintOnDark : P.hintOnLight}
              stroke={dark ? P.hintOnLight : '#ffffff'}
              strokeWidth={2}
              opacity={0.95}
              pointerEvents="none"
            />
          );
        })}

      {/* pieces */}
      {CELLS.map((cell) => {
        const p = state.board[cell.index];
        if (!p) return null;
        const { cx, cy } = pos(cell.x, cell.y);
        const white = p.color === 'w';
        const r = S * 0.62;
        const label = p.type;
        const fontSize = label.length >= 4 ? 13 : label.length === 3 ? 15 : 20;
        const isKingInCheck = cell.index === checkedKing;
        return (
          <g key={`p${cell.index}`} className="piece" onClick={() => onCellClick(cell.index)}>
            {isKingInCheck && <circle cx={cx} cy={cy} r={r + 7} fill="#e74c3c" className="check-ring" />}
            <circle cx={cx} cy={cy + 2} r={r} fill="rgba(0,0,0,0.25)" />
            <circle cx={cx} cy={cy} r={r} fill={white ? P.whiteFill : P.blackFill} stroke={white ? P.whiteStroke : P.blackStroke} strokeWidth={2.5} />
            <text
              x={cx}
              y={cy + fontSize * 0.36}
              textAnchor="middle"
              fontSize={fontSize}
              fontWeight="800"
              fill={white ? P.whiteText : P.blackText}
              fontFamily="Georgia, 'Times New Roman', serif"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
