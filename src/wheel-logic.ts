const UINT32_RANGE = 0x1_0000_0000;

export function randomIndex(count: number, nextUint32: () => number = browserRandom32): number {
  if (!Number.isSafeInteger(count) || count < 1 || count > UINT32_RANGE) {
    throw new RangeError('count must be an integer between 1 and 2^32');
  }
  const limit = UINT32_RANGE - (UINT32_RANGE % count);
  for (;;) {
    const value = nextUint32();
    if (!Number.isSafeInteger(value) || value < 0 || value >= UINT32_RANGE) {
      throw new RangeError('random source must return a uint32');
    }
    if (value < limit) return value % count;
  }
}

function browserRandom32(): number {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return value[0];
}

export const FIRST_VIDEO_SLUG = 'personal-ai-operator-agent-harness';
export const CREATOR_TAKE = 'first-video';

export function resultUrl(origin: string, slug: string, creatorTake: string | null = null): string {
  const url = new URL('/', origin);
  url.searchParams.set('idea', slug);
  if (creatorTake) url.searchParams.set('creator', creatorTake);
  return url.toString();
}
