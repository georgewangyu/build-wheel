import { useState, type FormEvent } from 'react';
import type { Topic } from './topics.ts';
import { parseProjectShareInput, projectSharePath } from './project-share.ts';

export function ProjectPublish({ topic }: { topic: Topic }) {
  const [error, setError] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const project = parseProjectShareInput({
      topicSlug: topic.slug,
      name: String(values.name ?? ''),
      projectUrl: String(values.projectUrl ?? ''),
    });
    if (!project) {
      setError('Add a project name and a public HTTPS link.');
      return;
    }
    window.location.assign(projectSharePath(project));
  }

  return <section className="project-publish" aria-labelledby="project-publish-title">
    <div>
      <p className="project-publish-kicker">BUILT THE PROMPT?</p>
      <h2 id="project-publish-title">Give it a page.</h2>
      <p>Create a branded link that keeps this prompt attached to what you made.</p>
    </div>
    <form onSubmit={submit} noValidate>
      <label>Project name<input name="name" required minLength={2} maxLength={80} placeholder="What did you call it?" /></label>
      <label>Project URL<input name="projectUrl" required type="url" inputMode="url" placeholder="https://your-project.com" /></label>
      <button type="submit">Create project page →</button>
      <p className={error ? 'project-publish-note is-error' : 'project-publish-note'} role="status">{error || 'No account. Nothing is ranked or stored.'}</p>
    </form>
  </section>;
}
