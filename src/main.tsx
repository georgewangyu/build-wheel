import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/inter/latin-800.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import '@fontsource/ibm-plex-mono/latin-600.css';
import { BuildWheel } from './wheel-app.tsx';
import { HarnessBoard } from './harness-board.tsx';
import { harnesses } from './harnesses.ts';
import './styles.css';

function CurrentPage() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/leaderboard') return <HarnessBoard />;
  if (path.startsWith('/harnesses/')) {
    const selected = harnesses.find((item) => path === `/harnesses/${item.slug}`);
    if (selected) return <HarnessBoard selected={selected} />;
  }
  return <BuildWheel />;
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CurrentPage />
  </React.StrictMode>,
);
