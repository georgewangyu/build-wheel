import { parseHarnessSubmission } from '../src/harness-submission-schema.js';

const json = (body: object, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'Origin not allowed.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'Send JSON.' }, 415);
  if (Number(request.headers.get('content-length') ?? 0) > 8000) return json({ error: 'Submission is too long.' }, 413);
  const reader = request.body?.getReader();
  if (!reader) return json({ error: 'Invalid JSON.' }, 400);
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 8000) { await reader.cancel(); return json({ error: 'Submission is too long.' }, 413); }
      chunks.push(value);
    }
  } catch { return json({ error: 'Could not read submission.' }, 400); }
  let raw: string;
  try {
    const body = new Uint8Array(bytes);
    let position = 0;
    for (const chunk of chunks) { body.set(chunk, position); position += chunk.byteLength; }
    raw = new TextDecoder('utf-8', { fatal: true }).decode(body);
  } catch { return json({ error: 'Invalid text encoding.' }, 400); }
  let payload: unknown;
  try { payload = JSON.parse(raw); } catch { return json({ error: 'Invalid JSON.' }, 400); }
  const input = parseHarnessSubmission(payload);
  if (!input) return json({ error: 'Check the project name, GitHub URL, and description.' }, 400);

  const token = process.env.GITHUB_TOKEN;
  // Set only after a published Vercel WAF per-IP rate limit protects this path.
  if (!token || process.env.SUBMISSION_RATE_LIMIT_READY !== '1') return json({ error: 'Submissions are temporarily unavailable.' }, 503);

  const title = `[build-wheel:submit-harness] ${input.name}`;
  const body = [
    '## Harness leaderboard submission',
    '',
    '**Source:** build-wheel',
    '**Type:** Submit a harness',
    '**Visibility:** Private review issue',
    `**Project:** ${input.name}`,
    `**GitHub repository:** ${input.repository}`,
    `**Submitter:** ${input.handle || '_Not provided_'}`,
    '',
    '## Why it belongs on the board',
    '',
    input.reason,
    '',
    '## Review',
    '',
    '- [ ] Confirm the repository is public and relevant to agent harnesses',
    '- [ ] Check source README and current GitHub stars',
    '- [ ] Decide whether to add it to the curated leaderboard',
  ].join('\n');

  try {
    const headers = { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' };
    const recent = await fetch('https://api.github.com/repos/georgewangyu/audience-private-intake/issues?state=open&labels=source-repo%3Abuild-wheel%2Ctype%3Asubmit-harness&per_page=100', { headers });
    if (!recent.ok) {
      console.error('Harness duplicate check failed', recent.status);
      return json({ error: 'Could not check the review queue right now. Please try again later.' }, 502);
    }
    const openIssues = await recent.json() as Array<{ body?: string }>;
    if (!Array.isArray(openIssues) || openIssues.length === 100) return json({ error: 'The review queue is temporarily unavailable.' }, 503);
    if (openIssues.some((issue) => issue.body?.toLowerCase().includes(`**github repository:** ${input.repository}\n`))) {
      return json({ error: 'This repository is already in the review queue.' }, 409);
    }
    const response = await fetch('https://api.github.com/repos/georgewangyu/audience-private-intake/issues', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, labels: ['source-repo:build-wheel', 'status:needs-triage', 'visibility:private', 'type:submit-harness'] }),
    });
    if (!response.ok) {
      console.error('Harness issue creation failed', response.status);
      return json({ error: 'Could not send your project right now. Please try again later.' }, 502);
    }
    return json({ ok: true }, 201);
  } catch {
    return json({ error: 'Could not send your project right now. Please try again later.' }, 502);
  }
}

export default { fetch: POST };
