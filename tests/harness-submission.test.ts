import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { POST } from '../api/submit-harness.ts';
import { parseHarnessSubmission } from '../src/harness-submission-schema.ts';

const valid = { name: 'My Harness', repository: 'https://github.com/example/my-harness', reason: 'It coordinates several coding agents.', handle: '@example', website: '' };
const priorToken = process.env.GITHUB_TOKEN;
const priorRateLimit = process.env.SUBMISSION_RATE_LIMIT_READY;
const priorFetch = globalThis.fetch;
before(() => { process.env.GITHUB_TOKEN = 'test-only-token'; process.env.SUBMISSION_RATE_LIMIT_READY = '1'; });
after(() => {
  if (priorToken === undefined) delete process.env.GITHUB_TOKEN;
  else process.env.GITHUB_TOKEN = priorToken;
  if (priorRateLimit === undefined) delete process.env.SUBMISSION_RATE_LIMIT_READY;
  else process.env.SUBMISSION_RATE_LIMIT_READY = priorRateLimit;
  globalThis.fetch = priorFetch;
});

test('harness submissions require a plain public GitHub repository URL', () => {
  assert.equal(parseHarnessSubmission(valid)?.repository, valid.repository);
  assert.equal(parseHarnessSubmission({ ...valid, repository: 'https://github.com/EXAMPLE/MY-HARNESS/' })?.repository, valid.repository);
  assert.equal(parseHarnessSubmission({ ...valid, repository: 'https://github.com/example/my-harness/issues' }), null);
  assert.equal(parseHarnessSubmission({ ...valid, repository: 'https://evil.example/repo' }), null);
  assert.equal(parseHarnessSubmission({ ...valid, website: 'spam' }), null);
});

test('valid submissions create only a private review issue with source labels', async () => {
  let sent: { url: string; headers: Headers; body: Record<string, unknown> } | undefined;
  globalThis.fetch = async (input, init) => {
    if (init?.method !== 'POST') return Response.json([]);
    sent = { url: String(input), headers: new Headers(init?.headers), body: JSON.parse(String(init?.body)) as Record<string, unknown> };
    return Response.json({ number: 1 }, { status: 201 });
  };
  const request = new Request('https://buildwheel.example/api/submit-harness', { method: 'POST', headers: { Origin: 'https://buildwheel.example', 'Content-Type': 'application/json' }, body: JSON.stringify(valid) });
  const response = await POST(request);
  assert.equal(response.status, 201);
  assert.equal(sent?.url, 'https://api.github.com/repos/georgewangyu/audience-private-intake/issues');
  assert.equal(sent?.headers.get('Authorization'), 'Bearer test-only-token');
  assert.ok((sent?.body.labels as string[]).includes('source-repo:build-wheel'));
  assert.match(String(sent?.body.body), /My Harness/);
  assert.equal(JSON.stringify(await response.json()).includes('test-only-token'), false);
});

test('an already-open review issue prevents duplicate writes', async () => {
  let writes = 0;
  globalThis.fetch = async (_input, init) => {
    if (init?.method === 'POST') { writes++; return Response.json({ number: 2 }, { status: 201 }); }
    return Response.json([{ body: `**GitHub repository:** ${valid.repository}\n` }]);
  };
  const request = new Request('https://buildwheel.example/api/submit-harness', { method: 'POST', headers: { Origin: 'https://buildwheel.example', 'Content-Type': 'application/json' }, body: JSON.stringify({ ...valid, repository: 'https://github.com/EXAMPLE/MY-HARNESS' }) });
  assert.equal((await POST(request)).status, 409);
  assert.equal(writes, 0);
});

test('no WAF readiness means no private issue write', async () => {
  let writes = 0;
  globalThis.fetch = async () => { writes++; return Response.json([]); };
  delete process.env.SUBMISSION_RATE_LIMIT_READY;
  const request = new Request('https://buildwheel.example/api/submit-harness', { method: 'POST', headers: { Origin: 'https://buildwheel.example', 'Content-Type': 'application/json' }, body: JSON.stringify(valid) });
  assert.equal((await POST(request)).status, 503);
  assert.equal(writes, 0);
  process.env.SUBMISSION_RATE_LIMIT_READY = '1';
});

test('cross-origin and malformed submissions are rejected before GitHub', async () => {
  const crossOrigin = new Request('https://buildwheel.example/api/submit-harness', { method: 'POST', headers: { Origin: 'https://elsewhere.example', 'Content-Type': 'application/json' }, body: JSON.stringify(valid) });
  assert.equal((await POST(crossOrigin)).status, 403);
  const malformed = new Request('https://buildwheel.example/api/submit-harness', { method: 'POST', headers: { Origin: 'https://buildwheel.example', 'Content-Type': 'application/json' }, body: JSON.stringify({ ...valid, reason: 'no' }) });
  assert.equal((await POST(malformed)).status, 400);
});

test('a chunked body without Content-Length is rejected after 8KB', async () => {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) { controller.enqueue(new TextEncoder().encode('x'.repeat(8001))); controller.close(); },
  });
  const request = new Request('https://buildwheel.example/api/submit-harness', { method: 'POST', headers: { Origin: 'https://buildwheel.example', 'Content-Type': 'application/json' }, body: stream, duplex: 'half' } as RequestInit & { duplex: 'half' });
  assert.equal((await POST(request)).status, 413);
});
