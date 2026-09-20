export type HarnessSubmission = {
  name: string;
  repository: string;
  reason: string;
  handle: string;
  website: string;
};

export function parseHarnessSubmission(value: unknown): HarnessSubmission | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Record<string, unknown>;
  if (Object.values(input).some((entry) => typeof entry !== 'string')) return null;
  const name = String(input.name ?? '').trim();
  const repository = String(input.repository ?? '').trim();
  const reason = String(input.reason ?? '').trim();
  const handle = String(input.handle ?? '').trim();
  const website = String(input.website ?? '').trim();
  if (name.length < 2 || name.length > 100 || reason.length < 15 || reason.length > 1200 || handle.length > 120 || website.length > 0) return null;
  try {
    const url = new URL(repository);
    if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.search || url.hash) return null;
    const segments = url.pathname.replace(/\/$/, '').split('/').filter(Boolean);
    if (segments.length !== 2 || segments.some((part) => !/^[a-zA-Z0-9_.-]+$/.test(part))) return null;
    return { name, repository: `https://github.com/${segments[0].toLowerCase()}/${segments[1].toLowerCase()}`, reason, handle, website };
  } catch {
    return null;
  }
}
