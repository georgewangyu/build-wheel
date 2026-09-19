import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/inter/latin-800.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import '@fontsource/ibm-plex-mono/latin-600.css';
import { BuildWheel } from './wheel-app.tsx';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BuildWheel />
  </React.StrictMode>,
);
