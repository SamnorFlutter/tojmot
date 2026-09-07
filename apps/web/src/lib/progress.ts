export interface Progress {
  points: number;
  done: string[];
}

const KEY = 'tojmot.learn.v1';

export function loadProgress(): Progress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Progress;
      if (Array.isArray(p.done) && typeof p.points === 'number') return p;
    }
  } catch {
    /* ignore */
  }
  return { points: 0, done: [] };
}

export function saveProgress(p: Progress): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}
