import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Harness } from './harnesses.ts';

type ReadmeSnapshot = { repo: string; sourceUrl: string; sha: string; fetchedAt: string; content: string; truncated: boolean };

export function HarnessReadme({ item }: { item: Harness }) {
  const [snapshot, setSnapshot] = useState<ReadmeSnapshot | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setSnapshot(null);
    setFailed(false);
    void fetch(`/readmes/${item.slug}.json`, { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error('README snapshot unavailable');
      const result = await response.json() as ReadmeSnapshot;
      if (result.repo !== item.repo || !result.content) throw new Error('README snapshot mismatch');
      if (!controller.signal.aborted) setSnapshot(result);
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [item.repo, item.slug]);

  return <section className="project-readme" aria-labelledby="project-readme-title">
    <div className="readme-heading"><div><p className="board-kicker">FROM THE SOURCE</p><h2 id="project-readme-title">The README<span> ↘</span></h2></div>{snapshot && <p>Synced {new Date(snapshot.fetchedAt).toLocaleDateString()} · <a href={snapshot.sourceUrl} target="_blank" rel="noopener noreferrer">Full README on GitHub ↗</a></p>}</div>
    {snapshot ? <div className="readme-content"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{
      img: () => null,
      a: ({ href, children }) => {
        let destination = snapshot.sourceUrl;
        if (href) {
          try {
            const url = new URL(href, snapshot.sourceUrl);
            if (url.protocol === 'http:' || url.protocol === 'https:') destination = url.toString();
          } catch { /* keep the README source */ }
        }
        return <a href={destination} target="_blank" rel="noopener noreferrer">{children}</a>;
      },
    }}>{snapshot.content}</ReactMarkdown></div> : <p className="readme-loading">{failed ? 'README snapshot unavailable. Open the repository for the current documentation.' : 'Loading the repository README…'}</p>}
    {snapshot?.truncated && <a className="readme-more" href={snapshot.sourceUrl} target="_blank" rel="noopener noreferrer">Continue reading on GitHub ↗</a>}
  </section>;
}
