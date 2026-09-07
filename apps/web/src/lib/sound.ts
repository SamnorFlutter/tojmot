'use client';

/** Tiny WebAudio synth for game/lesson sounds — no audio files needed. */

export type SoundKind = 'move' | 'capture' | 'check' | 'win' | 'lose' | 'draw' | 'correct' | 'wrong';

let ctx: AudioContext | null = null;
let mutedCache: boolean | null = null;

export function isMuted(): boolean {
  if (mutedCache !== null) return mutedCache;
  try {
    mutedCache = window.localStorage.getItem('tojmot.muted') === '1';
  } catch {
    mutedCache = false;
  }
  return mutedCache;
}

export function setMuted(m: boolean): void {
  mutedCache = m;
  try {
    window.localStorage.setItem('tojmot.muted', m ? '1' : '0');
  } catch {
    /* ignore */
  }
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(
  a: AudioContext,
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = 'sine',
  gain = 0.12,
  endFreq?: number,
): void {
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  const t0 = a.currentTime + start;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0005, t0 + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export function playSound(kind: SoundKind): void {
  if (isMuted()) return;
  const a = audio();
  if (!a) return;
  try {
    switch (kind) {
      case 'move':
        tone(a, 620, 0, 0.07, 'triangle', 0.1, 320);
        break;
      case 'capture':
        tone(a, 300, 0, 0.1, 'square', 0.09, 140);
        break;
      case 'check':
        tone(a, 880, 0, 0.09, 'sine', 0.11);
        tone(a, 880, 0.12, 0.12, 'sine', 0.11);
        break;
      case 'win':
        tone(a, 523, 0, 0.12, 'triangle', 0.11);
        tone(a, 659, 0.11, 0.12, 'triangle', 0.11);
        tone(a, 784, 0.22, 0.2, 'triangle', 0.12);
        break;
      case 'lose':
        tone(a, 330, 0, 0.16, 'sine', 0.1, 262);
        tone(a, 262, 0.16, 0.25, 'sine', 0.1, 196);
        break;
      case 'draw':
        tone(a, 440, 0, 0.12, 'sine', 0.09);
        tone(a, 440, 0.14, 0.12, 'sine', 0.09);
        break;
      case 'correct':
        tone(a, 740, 0, 0.09, 'triangle', 0.11);
        tone(a, 1109, 0.09, 0.16, 'triangle', 0.11);
        break;
      case 'wrong':
        tone(a, 180, 0, 0.16, 'sawtooth', 0.07, 140);
        break;
    }
  } catch {
    /* audio is a nicety — never break the game over it */
  }
}
