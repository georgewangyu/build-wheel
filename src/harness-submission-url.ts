import type { HarnessSubmission } from './harness-submission-schema.ts';

// GitHub rejects oversized issue-composer URLs with HTTP 414.
export const MAX_HARNESS_ISSUE_URL_LENGTH = 4000;

export function harnessIssueUrl(input: HarnessSubmission): string {
  const url = new URL('https://github.com/georgewangyu/JarvisAIGeorge/issues/new');
  url.searchParams.set('title', `[Build Wheel harness] ${input.name}`);
  url.searchParams.set('body', [
    '## Harness submission',
    '',
    `**Project:** ${input.name}`,
    `**GitHub repository:** ${input.repository}`,
    input.handle ? `**Public credit:** ${input.handle}` : '',
    '',
    '### What does it do?',
    '',
    input.reason,
    '',
    '---',
    'Submitted from the Snack Overflow George harness leaderboard. Listing is subject to review.',
  ].filter((line, index, lines) => line || lines[index - 1] !== '').join('\n'));
  return url.toString();
}
