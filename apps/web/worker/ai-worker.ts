/**
 * AI worker entry point.
 *
 * Bundled by esbuild into `public/tojmot-ai.js` (see `npm run build:worker`), because a
 * static export served from a plain file host must ship real JavaScript — a raw .ts asset
 * is served with the wrong MIME type and the worker silently fails to start, which pushes
 * the search onto the UI thread and makes the board feel sluggish.
 */
import { findBestMove, type GameState, type SearchOptions } from '@tojmot/engine';

interface Request {
  id: number;
  state: GameState;
  options: SearchOptions;
}

const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<Request>) => void) | null;
  postMessage: (message: unknown) => void;
};

ctx.onmessage = (event: MessageEvent<Request>) => {
  const { id, state, options } = event.data;
  try {
    const result = findBestMove(state, options);
    ctx.postMessage({ id, result });
  } catch (error) {
    ctx.postMessage({ id, error: String(error) });
  }
};
