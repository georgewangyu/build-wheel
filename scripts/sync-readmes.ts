import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { harnesses } from '../src/harnesses.ts';

type GitHubReadme = { content?: string; encoding?: string; html_url?: string; sha?: string };
type GitHubRepository = { private?: boolean; visibility?: string; full_name?: string };

const output = join(import.meta.dirname, '..', 'public', 'readmes');
const fetchedAt = new Date().toISOString();
const headers: Record<string, string> = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'build-wheel-readme-sync',
  'X-GitHub-Api-Version': '2022-11-28',
};
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function githubJson<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.github.com/${path}`, { headers });
  let result: T;
  if (response.ok) {
    result = await response.json() as T;
  } else if (response.status === 403 || response.status === 429) {
    // Local CLI fallback avoids passing a personal token through the site build.
    try {
      result = JSON.parse(execFileSync('gh', ['api', path], { encoding: 'utf8', maxBuffer: 4_000_000 })) as T;
    } catch { throw new Error(`${path}: GitHub API returned ${response.status}; supply a scoped GITHUB_TOKEN or authenticate gh`); }
  } else {
    throw new Error(`${path}: GitHub API returned ${response.status}`);
  }
  return result;
}

async function readme(repo: string) {
  const metadata = await githubJson<GitHubRepository>(`repos/${repo}`);
  if (metadata.private !== false || metadata.visibility !== 'public' || metadata.full_name?.toLowerCase() !== repo.toLowerCase()) {
    throw new Error(`${repo}: source repository is not confirmed public; refusing to publish its README`);
  }
  const result = await githubJson<GitHubReadme>(`repos/${repo}/readme`);
  if (result.encoding !== 'base64' || !result.content || !result.html_url || !result.sha) throw new Error(`${repo}: missing README data`);
  const full = Buffer.from(result.content.replace(/\s/g, ''), 'base64').toString('utf8')
    .replace(/\r\n/g, '\n')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]*>/g, '');
  // Keep pages readable and bounded. The original README remains one click away.
  const content = full.length <= 24000 ? full : `${full.slice(0, 24000).replace(/\n[^\n]*$/, '')}\n\n_Excerpt ends here; open GitHub for the full README._`;
  return { repo, sourceUrl: result.html_url, sha: result.sha, fetchedAt, content, truncated: full.length > 24000 };
}

const snapshots = [];
for (const item of harnesses) {
  snapshots.push({ slug: item.slug, value: await readme(item.repo) });
  process.stdout.write(`Fetched ${item.repo}\n`);
}
await mkdir(output, { recursive: true });
for (const item of snapshots) {
  await writeFile(join(output, `${item.slug}.json`), `${JSON.stringify(item.value)}\n`);
}
process.stdout.write(`Updated ${snapshots.length} README excerpts in public/readmes.\n`);
