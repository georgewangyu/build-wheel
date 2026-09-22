import { useEffect, useState } from 'react';
import { readProjectShare } from './project-share.ts';
import { SiteHeader } from './site-header.tsx';

export function ProjectPage() {
  const project = readProjectShare(window.location.search);
  const [shareStatus, setShareStatus] = useState('');

  useEffect(() => {
    const previousTitle = document.title;
    document.title = project ? `${project.name} — Built on Build Wheel` : 'Project not found — Build Wheel';
    return () => { document.title = previousTitle; };
  }, [project?.name]);

  async function share() {
    const data = project ? {
      title: `${project.name} — Build Wheel`,
      text: `Built from the “${project.topic.title}” prompt on Build Wheel.`,
      url: window.location.href,
    } : null;
    if (!data) return;
    if (navigator.share) {
      try {
        await navigator.share(data);
        setShareStatus('Shared.');
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareStatus('Link copied.');
    } catch {
      setShareStatus('Copy the page URL from your browser.');
    }
  }

  if (!project) return <div className="app-shell project-shell">
    <SiteHeader active="wheel" />
    <main className="project-invalid">
      <p>PROJECT LINK NOT FOUND</p>
      <h1>This build page is incomplete.</h1>
      <a href="/">Spin a new prompt →</a>
    </main>
  </div>;

  const projectHost = new URL(project.projectUrl).hostname.replace(/^www\./, '');
  return <div className="app-shell project-shell">
    <SiteHeader active="wheel" />
    <main className="project-page">
      <header className="project-hero">
        <p className="project-eyebrow">BUILT FROM THE WHEEL · {project.topic.category.toUpperCase()}</p>
        <h1>{project.name}</h1>
        <p className="project-origin">A community build page sparked by <a href={`/?idea=${encodeURIComponent(project.topic.slug)}`}>{project.topic.title}</a>.</p>
        <div className="project-page-actions">
          <a className="project-visit" href={project.projectUrl} target="_blank" rel="noopener noreferrer">Visit {projectHost} ↗</a>
          <button type="button" onClick={share}>Share this build</button>
        </div>
        <p className="project-share-status" role="status" aria-live="polite">{shareStatus}</p>
        <p className="project-review-note">User-created page · External link not reviewed by Build Wheel</p>
      </header>
      <section className="project-prompt" aria-labelledby="project-prompt-title">
        <p>THE PROMPT</p>
        <h2 id="project-prompt-title">{project.topic.title}</h2>
        <blockquote>{project.topic.prompt}</blockquote>
        <a href={`/?idea=${encodeURIComponent(project.topic.slug)}`}>Try this prompt yourself →</a>
      </section>
      <footer className="project-signoff">
        <img src="/companion-signal.svg" width="42" height="42" alt="" />
        <p>Spun on Build Wheel.<br />Built for real.</p>
      </footer>
    </main>
  </div>;
}
