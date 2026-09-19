export const SPEECH_SECONDS = 60;

export function secondsRemaining(deadlineMs: number, nowMs: number): number {
  return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));
}

export function timerLabel(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function speechPhase(seconds: number): 0 | 1 | 2 {
  const elapsed = SPEECH_SECONDS - seconds;
  return elapsed < 20 ? 0 : elapsed < 40 ? 1 : 2;
}
