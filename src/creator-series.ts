import type { Topic } from './topics.ts';

let creatorSeries: readonly Topic[] = [];
const categories = new Set<Topic['category']>(['AI systems', 'Human connection', 'Personal augmentation', 'Playful projects']);

// A local preview may provide this optional catalog. The public build does not.
export function installCreatorSeries(value: unknown): void {
  if (!Array.isArray(value) || !value.every((item): item is Topic =>
    typeof item === 'object' && item !== null &&
    typeof item.id === 'string' && /^[a-z0-9-]+$/.test(item.id) &&
    typeof item.slug === 'string' && /^[a-z0-9-]+$/.test(item.slug) &&
    typeof item.title === 'string' && item.title.length > 0 &&
    typeof item.wheelLabel === 'string' && item.wheelLabel.length > 0 &&
    typeof item.prompt === 'string' && item.prompt.length > 0 &&
    categories.has(item.category))) {
    creatorSeries = [];
    return;
  }
  creatorSeries = value;
}

export async function loadCreatorSeries(): Promise<void> {
  if (!new URLSearchParams(window.location.search).has('creator')) return;
  try {
    const response = await fetch('/creator-series.json', { cache: 'no-store' });
    if (response.ok) installCreatorSeries(await response.json());
  } catch {
    // No local catalog means the public wheel remains available.
  }
}

export function creatorTopic(take: string | null): Topic | null {
  return creatorSeries.find((topic) => topic.id === take) ?? null;
}
