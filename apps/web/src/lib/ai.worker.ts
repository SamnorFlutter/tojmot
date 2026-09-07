import { findBestMove, type GameState, type SearchOptions } from '@tojmot/engine';

interface Request {
  id: number;
  state: GameState;
  options: SearchOptions;
}

self.onmessage = (event: MessageEvent<Request>) => {
  const { id, state, options } = event.data;
  const result = findBestMove(state, options);
  (self as unknown as Worker).postMessage({ id, result });
};
