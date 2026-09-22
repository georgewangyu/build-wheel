import { topics, type Topic } from './topics.ts';

export const MAX_PROJECT_NAME_LENGTH = 80;
export const MAX_PROJECT_URL_LENGTH = 2_000;

export type ProjectShare = {
  topic: Topic;
  name: string;
  projectUrl: string;
};

type ProjectShareInput = {
  topicSlug: string;
  name: string;
  projectUrl: string;
};

export function parseProjectShareInput(value: ProjectShareInput): ProjectShare | null {
  const topic = topics.find((candidate) => candidate.slug === value.topicSlug);
  const name = value.name.trim();
  const rawUrl = value.projectUrl.trim();
  if (!topic || name.length < 2 || name.length > MAX_PROJECT_NAME_LENGTH || rawUrl.length > MAX_PROJECT_URL_LENGTH) return null;

  try {
    const url = new URL(rawUrl);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    url.hash = '';
    return { topic, name, projectUrl: url.toString() };
  } catch {
    return null;
  }
}

export function projectSharePath(project: ProjectShare): string {
  const params = new URLSearchParams({
    idea: project.topic.slug,
    name: project.name,
    url: project.projectUrl,
  });
  return `/projects/share?${params.toString()}`;
}

export function readProjectShare(search: string): ProjectShare | null {
  const params = new URLSearchParams(search);
  return parseProjectShareInput({
    topicSlug: params.get('idea') ?? '',
    name: params.get('name') ?? '',
    projectUrl: params.get('url') ?? '',
  });
}
