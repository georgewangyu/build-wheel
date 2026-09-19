import test from 'node:test';
import assert from 'node:assert/strict';
import { githubUrl, harnesses, rankHarnesses } from '../src/harnesses.ts';

test('harness leaderboard contains only unique public GitHub repositories', () => {
  assert.ok(harnesses.length >= 25);
  assert.equal(new Set(harnesses.map((item) => item.slug)).size, harnesses.length);
  assert.equal(new Set(harnesses.map((item) => item.repo)).size, harnesses.length);
  assert.ok(harnesses.every((item) => /^[\w.-]+\/[\w.-]+$/.test(item.repo)));
  assert.ok(harnesses.every((item) => item.snapshotStars >= 0));
  assert.ok(harnesses.every((item) => githubUrl(item.repo).startsWith('https://github.com/')));
  assert.ok(harnesses.every((item) => new URL(item.icon).protocol === 'https:'));
  assert.ok(harnesses.every((item) => item.description.length > 50 && item.highlights.length >= 3));
  assert.ok(harnesses.some((item) => item.repo === 'openclaw/openclaw'));
  assert.ok(harnesses.some((item) => item.repo === 'NousResearch/hermes-agent'));
  assert.ok(harnesses.every((item) => !item.repo.toLowerCase().includes('jarvis')));
});

test('ranking follows live counts and leaves the curated source order unchanged', () => {
  const original = harnesses.map((item) => item.slug);
  const ranked = rankHarnesses({ 'kirodotdev/KiroCrew': 999_999 });
  assert.equal(ranked[0].slug, 'kiro-crew');
  assert.deepEqual(harnesses.map((item) => item.slug), original);
});
