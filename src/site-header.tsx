import './site-header.css';

export function SiteHeader({ active }: { active: 'wheel' | 'leaderboard' }) {
  return <header className="site-header">
    <a className="site-brand" href="/" aria-label="Snack Overflow George home">
      <span className="site-brand-mark" aria-hidden="true">✳</span>
      <span>SNACK OVERFLOW<br />GEORGE</span>
    </a>
    <nav className="site-nav" aria-label="Main navigation">
      <a className={active === 'wheel' ? 'is-active' : undefined} aria-current={active === 'wheel' ? 'page' : undefined} href="/">Build Wheel</a>
      <a className={active === 'leaderboard' ? 'is-active' : undefined} aria-current={active === 'leaderboard' ? 'page' : undefined} href="/leaderboard">Harness leaderboard</a>
    </nav>
    <div className="site-creator">
      <p>BUILT BY <a href="https://www.instagram.com/snackoverflowgeorge/" target="_blank" rel="noopener noreferrer">@SNACKOVERFLOWGEORGE ↗</a></p>
      <nav aria-label="Follow the creator">
        <a href="https://github.com/georgewangyu" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://www.instagram.com/snackoverflowgeorge/" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="https://www.tiktok.com/@snackoverflowgeorge" target="_blank" rel="noopener noreferrer">TikTok</a>
        <a href="https://www.youtube.com/@snackoverflowgeorge" target="_blank" rel="noopener noreferrer">YouTube</a>
        <a href="https://x.com/georgewangyu" target="_blank" rel="noopener noreferrer">X</a>
        <a href="https://www.linkedin.com/in/georgewangyu/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </nav>
    </div>
  </header>;
}
