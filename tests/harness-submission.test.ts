import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseHarnessSubmission } from '../src/harness-submission-schema.ts';
import { harnessIssueUrl, MAX_HARNESS_ISSUE_URL_LENGTH } from '../src/harness-submission-url.ts';

const valid = { name: 'My Harness', repository: 'https://github.com/example/my-harness', reason: 'It coordinates several coding agents.', handle: '@example', website: '' };

test('harness submissions require a plain public GitHub repository URL', () => {
  assert.equal(parseHarnessSubmission(valid)?.repository, valid.repository);
  assert.equal(parseHarnessSubmission({ ...valid, repository: 'https://github.com/EXAMPLE/MY-HARNESS/' })?.repository, valid.repository);
  assert.equal(parseHarnessSubmission({ ...valid, repository: 'https://github.com/example/my-harness/issues' }), null);
  assert.equal(parseHarnessSubmission({ ...valid, repository: 'https://evil.example/repo' }), null);
  assert.equal(parseHarnessSubmission({ ...valid, website: 'spam' }), null);
});

test('valid submissions open a prefilled public Jarvis AI George issue', () => {
  const input = parseHarnessSubmission(valid);
  assert.ok(input);
  const url = new URL(harnessIssueUrl(input));
  assert.equal(url.origin, 'https://github.com');
  assert.equal(url.pathname, '/georgewangyu/JarvisAIGeorge/issues/new');
  assert.equal(url.searchParams.get('title'), '[Build Wheel harness] My Harness');
  assert.match(url.searchParams.get('body') ?? '', /\*\*GitHub repository:\*\* https:\/\/github.com\/example\/my-harness/);
  assert.match(url.searchParams.get('body') ?? '', /\*\*Public credit:\*\* @example/);
  assert.match(url.searchParams.get('body') ?? '', /It coordinates several coding agents\./);
  assert.equal(url.searchParams.has('labels'), false);
});

test('optional public credit is omitted when blank', () => {
  const input = parseHarnessSubmission({ ...valid, handle: '' });
  assert.ok(input);
  assert.doesNotMatch(new URL(harnessIssueUrl(input)).searchParams.get('body') ?? '', /Public credit/);
});

test('oversized encoded descriptions are rejected before opening GitHub', () => {
  assert.equal(parseHarnessSubmission({ ...valid, reason: '€'.repeat(1200) }), null);
  const compact = parseHarnessSubmission({ ...valid, reason: '€'.repeat(300) });
  assert.ok(compact);
  assert.ok(harnessIssueUrl(compact).length <= MAX_HARNESS_ISSUE_URL_LENGTH);
});
