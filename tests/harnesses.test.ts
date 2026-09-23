import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { githubUrl, harnesses, jarvisDesktop, rankHarnesses } from '../src/harnesses.ts';
import { starRepositories } from '../src/harness-stars.ts';

test('harness leaderboard contains only unique public GitHub repositories', () => {
  assert.ok(harnesses.length >= 25);
  assert.equal(new Set(harnesses.map((item) => item.slug)).size, harnesses.length);
  assert.equal(new Set(harnesses.map((item) => item.repo)).size, harnesses.length);
  assert.ok(harnesses.every((item) => /^[\w.-]+\/[\w.-]+$/.test(item.repo)));
  assert.ok(harnesses.every((item) => item.snapshotStars >= 0));
  assert.ok(harnesses.every((item) => githubUrl(item.repo).startsWith('https://github.com/')));
  assert.ok(harnesses.every((item) => item.icon === '/companion-signal.svg' || new URL(item.icon).protocol === 'https:'));
  assert.ok(existsSync(new URL('../public/companion-signal.svg', import.meta.url)));
  assert.ok(harnesses.every((item) => item.description.length > 50 && item.highlights.length >= 3));
  assert.ok(harnesses.some((item) => item.repo === 'openclaw/openclaw'));
  assert.ok(harnesses.some((item) => item.repo === 'NousResearch/hermes-agent'));
  const jarvis = harnesses.find((item) => item.repo === 'georgewangyu/JarvisAIGeorge');
  assert.equal(jarvis?.snapshotStars, 0);
  assert.equal(jarvis?.slug, 'jarvis-ai-george');
  assert.equal(rankHarnesses().at(-1)?.slug, 'jarvis-ai-george');
  assert.equal(jarvisDesktop.repo, 'georgewangyu/JarvisAIGeorgeDesktop');
  assert.equal(jarvisDesktop.snapshotStars, 1);
  assert.ok(starRepositories.includes(jarvisDesktop.repo));
  assert.equal(new Set(starRepositories).size, starRepositories.length);
});

test('ranking follows live counts and leaves the curated source order unchanged', () => {
  const original = harnesses.map((item) => item.slug);
  const ranked = rankHarnesses({ 'kirodotdev/KiroCrew': 999_999 });
  assert.equal(ranked[0].slug, 'kiro-crew');
  assert.deepEqual(harnesses.map((item) => item.slug), original);
});
