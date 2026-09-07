export * from './types';
export {
  CELLS, CELL_COUNT, COLS, WIDTH, HEIGHT,
  cellAt, cellByName, cellName, opposite,
  type CellInfo,
} from './geometry';
export { WHITE_SETUP, BLACK_SETUP, initialBoard } from './setup';
export {
  createGame, createPosition, positionKey, isRoman,
  kingCell, pseudoTargets, isAttacked, isInCheck,
  applyMove, undoMove, legalMoves, insufficientMaterial, gameStatus, isGameOver,
  makeMove, undoLast,
  type Undo,
} from './moves';
export { findBestMove, evaluate, PIECE_VALUES, type SearchOptions, type SearchResult } from './ai';
