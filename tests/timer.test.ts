import assert from 'node:assert/strict';
import test from 'node:test';
import { secondsRemaining, speechPhase, timerLabel } from '../src/timer.ts';

test('speech countdown uses the actual deadline and never goes negative', () => {
  assert.equal(secondsRemaining(60_000, 0), 60);
  assert.equal(secondsRemaining(60_000, 1), 60);
  assert.equal(secondsRemaining(60_000, 1_000), 59);
  assert.equal(secondsRemaining(60_000, 61_000), 0);
});

test('timer text and speaking arc stay aligned to a minute', () => {
  assert.equal(timerLabel(60), '1:00');
  assert.equal(timerLabel(9), '0:09');
  assert.equal(speechPhase(60), 0);
  assert.equal(speechPhase(40), 1);
  assert.equal(speechPhase(20), 2);
});
