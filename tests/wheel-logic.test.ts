import assert from 'node:assert/strict';
import test from 'node:test';
import { CREATOR_TAKE, FIRST_VIDEO_SLUG, randomIndex, resultUrl } from '../src/wheel-logic.ts';
import { topics } from '../src/topics.ts';
import { creatorTopic, installCreatorSeries } from '../src/creator-series.ts';

test('the wheel has exactly 16 public launch ideas with unique share keys', () => {
  assert.equal(topics.length, 16);
  assert.equal(new Set(topics.map((topic) => topic.id)).size, 16);
  assert.equal(new Set(topics.map((topic) => topic.slug)).size, 16);
});

test('random selection rejects out-of-range samples without bias', () => {
  const samples = [0xffff_ffff, 3];
  assert.equal(randomIndex(3, () => samples.shift()!), 0);
  assert.equal(randomIndex(16, () => 15), 15);
  assert.throws(() => randomIndex(0, () => 0), RangeError);
});

test('direct result URLs preserve the exact topic without a draw mode', () => {
  assert.equal(resultUrl('https://buildwheel.snackoverflowgeorge.com', topics[4].slug),
    'https://buildwheel.snackoverflowgeorge.com/?idea=voice-only-social-app');
  assert.equal(resultUrl('https://buildwheel.snackoverflowgeorge.com', topics[0].slug),
    'https://buildwheel.snackoverflowgeorge.com/?idea=personal-ai-operator-agent-harness');
});

test('first-video creator result remains visibly attributable in its URL', () => {
  assert.equal(FIRST_VIDEO_SLUG, topics[0].slug);
  assert.equal(topics[0].title, 'AI Agent Harness');
  assert.equal(CREATOR_TAKE, 'first-video');
  assert.equal(resultUrl('https://buildwheel.snackoverflowgeorge.com', FIRST_VIDEO_SLUG, CREATOR_TAKE),
    'https://buildwheel.snackoverflowgeorge.com/?idea=personal-ai-operator-agent-harness&creator=first-video');
});

test('an optional creator catalog stays separate from the public random pool', () => {
  const filmingTopic = {
    id: 'example-take', slug: 'example-concept', title: 'Example Concept',
    wheelLabel: 'EXAMPLE', category: 'AI systems', prompt: 'Explain a sample concept.',
  };
  installCreatorSeries([filmingTopic]);
  assert.equal(creatorTopic('example-take')?.title, 'Example Concept');
  assert.equal(topics.some((topic) => topic.slug === filmingTopic.slug), false);
  assert.equal(resultUrl('https://buildwheel.snackoverflowgeorge.com', filmingTopic.slug, filmingTopic.id),
    'https://buildwheel.snackoverflowgeorge.com/?idea=example-concept&creator=example-take');
  installCreatorSeries([{ id: 'bad-id', title: 'Missing fields' }]);
  assert.equal(creatorTopic('example-take'), null);
});
