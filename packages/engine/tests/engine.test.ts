import { describe, expect, it } from 'vitest';
import {
  CELLS, CELL_COUNT, cellByName, cellName, createGame, createPosition, findBestMove,
  gameStatus, isInCheck, legalMoves, makeMove, undoLast,
} from '../src/index';
import type { Move } from '../src/index';

const c = (name: string) => cellByName(name);
const names = (moves: Move[]) => moves.map((m) => cellName(m.to)).sort();

describe('geometry', () => {
  it('has 89 cells, 35 light body cells and 12 spike cells', () => {
    expect(CELL_COUNT).toBe(89);
    const body = CELLS.filter((x) => x.y >= 4 && x.y <= 14);
    expect(body).toHaveLength(77);
    expect(body.filter((x) => x.shade === 'light')).toHaveLength(35);
    expect(CELLS.filter((x) => x.y < 4 || x.y > 14)).toHaveLength(12);
  });

  it('names cells with column letter + row', () => {
    expect(cellName(c('G1'))).toBe('G1');
    expect(cellName(c('N4'))).toBe('N4');
    expect(cellName(c('A13'))).toBe('A13');
    expect(c('A4')).toBe(-1); // even row uses even columns only
    expect(c('G2')).toBe(-1);
    expect(c('E2')).toBe(-1); // outside the spike
  });

  it('marks king zones and promotion cells', () => {
    for (const n of ['G1', 'F2', 'H2', 'G3']) expect(CELLS[c(n)].zone).toBe('w');
    for (const n of ['G17', 'F16', 'H16', 'G15']) expect(CELLS[c(n)].zone).toBe('b');
    expect(CELLS[c('E3')].zone).toBeNull();
    expect(CELLS[c('E15')].promotionFor).toBe('w');
    expect(CELLS[c('I3')].promotionFor).toBe('b');
  });
});

describe('initial position', () => {
  const g = createGame();

  it('has 18 pieces per side', () => {
    const w = g.board.filter((p) => p?.color === 'w');
    const b = g.board.filter((p) => p?.color === 'b');
    expect(w).toHaveLength(18);
    expect(b).toHaveLength(18);
    expect(g.board[c('G1')]).toEqual({ type: '1', color: 'w' });
    expect(g.board[c('H14')]).toEqual({ type: '9', color: 'b' });
    expect(g.board[c('A13')]).toEqual({ type: 'III', color: 'b' });
  });

  it('generates the expected opening moves for each piece', () => {
    expect(names(legalMoves(g, c('H4')))).toEqual(['H2', 'H6']); // 9
    expect(names(legalMoves(g, c('A5')))).toEqual(['B6']); // II
    expect(names(legalMoves(g, c('B4')))).toEqual(['B6']); // 2
    expect(names(legalMoves(g, c('F4')))).toEqual([]); // 8 is boxed in
    expect(names(legalMoves(g, c('L4')))).toEqual(['L10', 'L12', 'L14', 'L6', 'L8']); // 4 sees the black 5
    expect(names(legalMoves(g, c('N4')))).toEqual(['M7']); // 3 (knight-like)
    expect(names(legalMoves(g, c('J4')))).toEqual(['F2', 'F6', 'H8', 'L8', 'N6']); // 6
    expect(names(legalMoves(g, c('D4')))).toEqual(['B6', 'F2', 'F6']); // 5
    expect(names(legalMoves(g, c('G3')))).toEqual(['F2', 'H2']); // 7
    expect(names(legalMoves(g, c('E3')))).toEqual([]); // X blocked
    expect(names(legalMoves(g, c('G1')))).toEqual(['F2', 'H2']); // 1
    expect(legalMoves(g)).toHaveLength(34);
  });

  it('respects rule variants', () => {
    const g2 = createGame({ piece6: 'verticalFirst', piece3: 'king', xMove: 'king' });
    expect(names(legalMoves(g2, c('J4')))).toEqual(['H8', 'L8']);
    expect(names(legalMoves(g2, c('N4')))).toEqual(['N6']);
    expect(names(legalMoves(g2, c('E3')))).toEqual(['F2']); // X as a king-stepper: only the empty zone cell
    const g3 = createGame({ leapersJump: false });
    // 5 on D4: F6/B6 reachable via the empty D6; F2 is blocked (D2 does not exist, F4 is occupied)
    expect(names(legalMoves(g3, c('D4')))).toEqual(['B6', 'F6']);
  });
});

describe('zone and check rules', () => {
  it('forbids enemy pieces from entering the king zone but still lets them give check', () => {
    const s = createPosition([
      ['G1', '1', 'w'], ['G17', '1', 'b'], ['F6', '7', 'b'],
    ], 'b');
    const targets = names(legalMoves(s, c('F6')));
    expect(targets).toContain('F4');
    expect(targets).not.toContain('F2'); // white zone
    // Black 4 on G9 attacks G1 along the file
    const s2 = createPosition([['G1', '1', 'w'], ['G17', '1', 'b'], ['G9', '4', 'b']], 'w');
    expect(isInCheck(s2, 'w')).toBe(true);
    const escapes = legalMoves(s2);
    for (const m of escapes) {
      const after = makeMove(s2, m);
      expect(isInCheck(after, 'w')).toBe(false);
    }
    expect(names(escapes)).toEqual(['F2', 'H2']);
  });

  it('detects checkmate', () => {
    const s = createPosition([
      ['G1', '1', 'w'], ['G17', '1', 'b'], ['E3', '7', 'b'], ['I3', '9', 'b'],
    ], 'w');
    expect(gameStatus(s)).toEqual({ kind: 'checkmate', winner: 'b' });
  });

  it('detects stalemate', () => {
    const s = createPosition([
      ['G1', '1', 'w'], ['G17', '1', 'b'], ['I3', '9', 'b'], ['F4', '2', 'b'],
    ], 'w');
    expect(isInCheck(s, 'w')).toBe(false);
    expect(gameStatus(s)).toEqual({ kind: 'stalemate' });
  });

  it('draws on bare kings and on the fifty-move rule', () => {
    const s = createPosition([['G1', '1', 'w'], ['G17', '1', 'b']], 'w');
    expect(gameStatus(s)).toEqual({ kind: 'draw', reason: 'material' });
    const t = createPosition([['G1', '1', 'w'], ['G17', '1', 'b'], ['A9', '2', 'b']], 'w');
    t.halfmoveClock = 100;
    expect(gameStatus(t)).toEqual({ kind: 'draw', reason: 'fifty' });
  });
});

describe('promotion', () => {
  it('promotes Romans to their Arabic value on the enemy X cells only', () => {
    const s = createPosition([['G1', '1', 'w'], ['G17', '1', 'b'], ['F14', 'IX', 'w']], 'w');
    const moves = legalMoves(s, c('F14'));
    expect(moves).toEqual([{ from: c('F14'), to: c('E15'), promotion: '9' }]); // G15 is the black zone
    const after = makeMove(s, moves[0]);
    expect(after.board[c('E15')]).toEqual({ type: '9', color: 'w' });
    expect(after.history[0].san).toBe('IXF14-E15=9');
  });

  it('lets X choose any Arabic piece except 1', () => {
    const s = createPosition([['G1', '1', 'w'], ['G17', '1', 'b'], ['J14', 'X', 'w']], 'w');
    const promos = legalMoves(s, c('J14')).map((m) => m.promotion).sort();
    expect(promos).toEqual(['2', '3', '4', '5', '6', '7', '8', '9']);
  });
});

describe('makeMove / undoLast', () => {
  it('records notation and supports undo', () => {
    const g = createGame();
    const g1 = makeMove(g, { from: c('L4'), to: c('L14') });
    expect(g1.history[0].san).toBe('4L4xL14');
    expect(g1.board[c('L14')]).toEqual({ type: '4', color: 'w' });
    expect(g1.turn).toBe('b');
    const back = undoLast(g1);
    expect(back.board[c('L4')]).toEqual({ type: '4', color: 'w' });
    expect(back.board[c('L14')]).toEqual({ type: '5', color: 'b' });
    expect(back.turn).toBe('w');
    expect(() => makeMove(g, { from: c('F4'), to: c('F6') })).toThrow();
  });
});

describe('ai', () => {
  it('returns a legal move from the opening', () => {
    const g = createGame();
    const r = findBestMove(g, { depth: 2, timeMs: 5000, random: () => 0.5 });
    expect(r.move).not.toBeNull();
    const legal = legalMoves(g);
    expect(legal.some((m) => m.from === r.move!.from && m.to === r.move!.to)).toBe(true);
  });

  it('finds mate in one', () => {
    const s = createPosition([
      ['G1', '1', 'w'], ['G17', '1', 'b'], ['E5', '7', 'b'], ['I3', '9', 'b'],
    ], 'b');
    const r = findBestMove(s, { depth: 2, timeMs: 5000, random: () => 0.5 });
    // Both 7E5-E3# and 7E5-D4# mate; accept any mating move.
    expect(r.move!.from).toBe(c('E5'));
    expect(gameStatus(makeMove(s, r.move!))).toEqual({ kind: 'checkmate', winner: 'b' });
  });
});
