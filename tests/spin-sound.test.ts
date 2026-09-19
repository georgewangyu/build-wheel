import assert from 'node:assert/strict';
import test from 'node:test';
import { playTimerAlarm } from '../src/spin-sound.ts';

test('the one-minute alarm schedules six distinct audible-tone pulses', () => {
  const frequencies: number[] = [];
  let starts = 0;
  let stops = 0;
  const parameter = {
    setValueAtTime(value: number) { frequencies.push(value); },
    exponentialRampToValueAtTime() {},
  };
  const context = {
    currentTime: 10,
    destination: {},
    createOscillator() {
      return {
        type: 'sine',
        frequency: parameter,
        connect() {},
        start() { starts += 1; },
        stop() { stops += 1; },
      };
    },
    createGain() {
      return { gain: parameter, connect() {} };
    },
  } as unknown as AudioContext;

  playTimerAlarm(context);
  assert.deepEqual(frequencies.filter((value) => value > 100), [880, 660, 880, 660, 880, 660]);
  assert.equal(starts, 6);
  assert.equal(stops, 6);
});
