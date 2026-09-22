import assert from 'node:assert/strict';
import test from 'node:test';
import { parseProjectShareInput, projectSharePath, readProjectShare } from '../src/project-share.ts';

test('a public project URL creates a stable self-contained share path', () => {
  const project = parseProjectShareInput({
    topicSlug: 'digital-pet',
    name: 'Pocket Pal',
    projectUrl: 'https://example.com/pocket-pal#demo',
  });
  assert.ok(project);
  assert.equal(project.projectUrl, 'https://example.com/pocket-pal');
  const path = projectSharePath(project);
  assert.match(path, /^\/projects\/share\?/);
  assert.deepEqual(readProjectShare(path.split('?')[1]), project);
});

test('project pages reject unknown prompts and unsafe URLs', () => {
  assert.equal(parseProjectShareInput({ topicSlug: 'unknown', name: 'Project', projectUrl: 'https://example.com' }), null);
  assert.equal(parseProjectShareInput({ topicSlug: 'digital-pet', name: 'Project', projectUrl: 'javascript:alert(1)' }), null);
  assert.equal(parseProjectShareInput({ topicSlug: 'digital-pet', name: 'Project', projectUrl: 'http://example.com' }), null);
  assert.equal(parseProjectShareInput({ topicSlug: 'digital-pet', name: 'Project', projectUrl: 'https://user:secret@example.com' }), null);
});
