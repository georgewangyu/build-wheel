import { useEffect, useState } from 'react';
import { fetchStarCounts, readCachedStars } from './harness-stars.ts';
import { githubUrl, harnesses, rankHarnesses, SNAPSHOT_DATE, type Harness, type StarCounts } from './harnesses.ts';
import { SiteHeader } from './site-header.tsx';
import { HarnessSubmissionForm } from './harness-submission.tsx';
import { HarnessReadme } from './harness-readme.tsx';
import './harness-board.css';

const number = new Intl.NumberFormat('en-US');

function StarIcon() {
  return <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="currentColor"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2Z" /></svg>;
}

function HarnessMark({ item, detail = false }: { item: Harness; detail?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <span className={`${detail ? 'harness-mark is-detail' : 'harness-mark'}${item.slug === 'jarvis-ai-george' ? ' is-jarvis' : ''}`} style={{ '--row-accent': item.accent } as React.CSSProperties} aria-hidden="true">
    {failed ? <span className="mark-fallback">✳</span> : <img src={item.icon} alt="" loading={detail ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />}
  </span>;
}

function LiveStatus({ fetchedAt, liveCount }: { fetchedAt: number | null; liveCount: number }) {
  const label = fetchedAt
    ? liveCount === harnesses.length ? `GitHub stars · updated ${new Date(fetchedAt).toLocaleString()}` : `GitHub stars · partial live data; remaining counts from ${SNAPSHOT_DATE}`
    : `GitHub stars · snapshot from ${SNAPSHOT_DATE}`;
  return <p className="board-status"><span className={fetchedAt ? 'status-dot is-live' : 'status-dot'} />{label}</p>;
}

function RankRow({ item, rank, stars, index }: { item: Harness; rank: number; stars: number; index: number }) {
  return <a className="rank-row" href={`/harnesses/${item.slug}`} style={{ '--row-index': index, '--row-accent': item.accent } as React.CSSProperties}>
    <span className="rank-number">{String(rank).padStart(2, '0')}</span>
    <HarnessMark item={item} />
    <span className="rank-main"><strong>{item.name}</strong><small>{item.maker} <span aria-hidden="true">·</span> {item.kind}</small></span>
    <span className="rank-stars"><StarIcon />{number.format(stars)}</span>
    <span className="rank-arrow" aria-hidden="true">↗</span>
  </a>;
}

function GeorgeSpotlight({ item, stars, rank }: { item: Harness; stars: number; rank: number }) {
  return <aside className="george-spotlight">
    <span className="spotlight-symbol" aria-hidden="true"><img src="/companion-signal.svg" alt="" /></span>
    <div className="spotlight-copy">
      <p className="board-kicker">THE BUILDER'S HARNESS</p>
      <h2><a href={`/harnesses/${item.slug}`}>{item.name} <span aria-hidden="true">↗</span></a></h2>
    </div>
    <p className="spotlight-description">Chasing OpenClaw, one public step at a time.</p>
    <div className="spotlight-actions"><span className="spotlight-state"><StarIcon /> {number.format(stars)} STARS · #{rank}</span><a className="spotlight-link" href={githubUrl(item.repo)} target="_blank" rel="noopener noreferrer">Star on GitHub ↗</a></div>
  </aside>;
}

export function HarnessBoard({ selected }: { selected?: Harness }) {
  const initial = readCachedStars();
  const [counts, setCounts] = useState<StarCounts>(initial?.counts ?? {});
  const [fetchedAt, setFetchedAt] = useState<number | null>(initial?.fetchedAt ?? null);

  useEffect(() => {
    if (selected || window.location.hash !== '#submit-harness') return;
    const timer = window.setTimeout(() => document.getElementById('submit-harness')?.scrollIntoView(), 80);
    return () => window.clearTimeout(timer);
  }, [selected]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchStarCounts(controller.signal).then((result) => {
      if (!result || controller.signal.aborted) return;
      setCounts(result.counts);
      setFetchedAt(result.fetchedAt);
    });
    return () => controller.abort();
  }, []);

  const ranked = rankHarnesses(counts);
  const george = harnesses.find((item) => item.slug === 'jarvis-ai-george')!;
  const georgeRank = ranked.findIndex((item) => item.slug === george.slug) + 1;
  const selectedRank = selected ? ranked.findIndex((item) => item.slug === selected.slug) + 1 : 0;
  const pageSize = 10;
  const pageCount = Math.ceil(ranked.length / pageSize);
  const requestedPage = Number(new URLSearchParams(window.location.search).get('page'));
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, pageCount) : 1;
  const visible = ranked.slice((page - 1) * pageSize, page * pageSize);

  return <div className="board-shell">
    <SiteHeader active="leaderboard" />
    {selected ? <main className="harness-detail">
      <a className="back-link" href="/leaderboard">← BACK TO THE LEADERBOARD</a>
      <div className="detail-hero" style={{ '--detail-accent': selected.accent } as React.CSSProperties}>
        <div className="detail-orbit"><HarnessMark item={selected} detail /></div>
        <div className="detail-copy">
          <p className="board-kicker">#{String(selectedRank).padStart(2, '0')} ON THE BOARD <span className="detail-divider">/</span> {selected.kind.toUpperCase()}</p>
          <h1>{selected.name}</h1>
          <p>{selected.description}</p>
          <div className="detail-highlights"><p className="board-kicker">AT A GLANCE</p><ul>{selected.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul></div>
          <div className="detail-meta"><span>BY {selected.maker.toUpperCase()}</span><span><StarIcon /> {number.format(counts[selected.repo] ?? selected.snapshotStars)} GITHUB STARS</span></div>
          <div className="detail-actions"><a className="detail-star" href={githubUrl(selected.repo)} target="_blank" rel="noopener noreferrer"><StarIcon /> Star on GitHub ↗</a><a className="detail-readme" href={`${githubUrl(selected.repo)}#readme`} target="_blank" rel="noopener noreferrer">Explore the full README ↗</a></div>
        </div>
      </div>
      <HarnessReadme item={selected} />
    </main> : <main className="board-main">
      <section className="board-intro">
        <div className="intro-copy"><p className="board-kicker"><span className="kicker-line" /> THE HARNESS RACE / VOL. 01</p><h1>The agent<br /><em>arena<span>.</span></em></h1><p className="intro-deck">The tools giving AI the hands to actually build. Ranked by the most public signal we have: GitHub stars.</p></div>
        <div className="intro-art" aria-hidden="true"><span className="art-ring art-ring-one" /><span className="art-ring art-ring-two" /><span className="art-ring art-ring-three" /><span className="art-center">✳</span><span className="art-label art-label-top">BUILD / BREAK / REPEAT</span><span className="art-label art-label-bottom">THE FIELD IS MOVING</span></div>
      </section>
      <GeorgeSpotlight item={george} stars={counts[george.repo] ?? george.snapshotStars} rank={georgeRank} />
      <section className="leaderboard" aria-labelledby="leaderboard-title"><div className="board-section-head"><div><p className="board-kicker">01 / THE FIELD</p><h2 id="leaderboard-title">The leaderboard<span className="title-star">✳</span></h2></div><LiveStatus fetchedAt={fetchedAt} liveCount={Object.keys(counts).length} /></div><div className="rank-list">{visible.map((item, index) => <RankRow key={item.slug} item={item} index={(page - 1) * pageSize + index} rank={(page - 1) * pageSize + index + 1} stars={counts[item.repo] ?? item.snapshotStars} />)}</div><nav className="board-pagination" aria-label="Leaderboard pages"><span>SHOWING {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, ranked.length)} OF {ranked.length}</span><div>{page > 1 ? <a href={page === 2 ? '/leaderboard' : `/leaderboard?page=${page - 1}`}>← Previous</a> : <span className="is-disabled">← Previous</span>}{Array.from({ length: pageCount }, (_, index) => <a key={index} href={index === 0 ? '/leaderboard' : `/leaderboard?page=${index + 1}`} aria-current={page === index + 1 ? 'page' : undefined}>{index + 1}</a>)}{page < pageCount ? <a href={`/leaderboard?page=${page + 1}`}>Next →</a> : <span className="is-disabled">Next →</span>}</div></nav><p className="board-method">Stars show public interest, not capability or quality. This is a curated field of coding agents and adjacent orchestration tools—not a claim that they all do the same job. <a href="https://docs.github.com/en/rest/repos/repos#get-a-repository" target="_blank" rel="noopener noreferrer">How counts are sourced ↗</a></p></section>
      <HarnessSubmissionForm />
    </main>}
    <footer className="board-footer"><span>MADE BY <a href="https://www.instagram.com/snackoverflowgeorge/" target="_blank" rel="noopener noreferrer">@SNACKOVERFLOWGEORGE</a></span><span>THE WHEEL KEEPS TURNING <span aria-hidden="true">✳</span></span></footer>
  </div>;
}
