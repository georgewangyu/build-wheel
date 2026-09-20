import { harnesses, type StarCounts } from './harnesses.ts';

const CACHE_KEY = 'build-wheel:harness-stars:v3';
const CACHE_MAX_AGE_MS = 20 * 60 * 1000;

type CachedStars = { fetchedAt: number; counts: StarCounts };

export function readCachedStars(now = Date.now()): CachedStars | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedStars = JSON.parse(raw);
    if (!Number.isFinite(cached.fetchedAt) || now - cached.fetchedAt > CACHE_MAX_AGE_MS) return null;
    if (typeof cached.counts !== 'object' || cached.counts === null) return null;
    return cached;
  } catch {
    return null;
  }
}

export async function fetchStarCounts(signal?: AbortSignal): Promise<CachedStars | null> {
  const cached = readCachedStars();
  if (cached) return cached;

  const results = await Promise.allSettled(harnesses.map(async ({ repo }) => {
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal,
    });
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const data: unknown = await response.json();
    if (typeof data !== 'object' || data === null || !('stargazers_count' in data)) throw new Error('Invalid GitHub response');
    const count = (data as { stargazers_count: unknown }).stargazers_count;
    if (!Number.isSafeInteger(count) || (count as number) < 0) throw new Error('Invalid star count');
    return [repo, count as number] as const;
  }));

  const counts = Object.fromEntries(results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []));
  if (Object.keys(counts).length === 0) return null;
  const next = { fetchedAt: Date.now(), counts };
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)); } catch { /* Storage may be unavailable. */ }
  return next;
}
