import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { topics, type Topic } from './topics.ts';
import { creatorTopic } from './creator-series.ts';
import { CREATOR_TAKE, FIRST_VIDEO_SLUG, randomIndex, resultUrl } from './wheel-logic.ts';
import { playResult, playTick, playTimerAlarm } from './spin-sound.ts';
import { SPEECH_SECONDS, secondsRemaining, speechPhase, timerLabel } from './timer.ts';
import { SiteHeader } from './site-header.tsx';

type Category = Topic['category'] | 'All ideas';

const categories: readonly Category[] = [
  'All ideas', 'AI systems', 'Human connection', 'Personal augmentation', 'Playful projects',
];

function readUrlState() {
  const params = new URLSearchParams(window.location.search);
  const requestedTake = params.get('creator');
  const creatorTake = requestedTake === CREATOR_TAKE || creatorTopic(requestedTake) ? requestedTake : null;
  const pinnedTopic = creatorTake === CREATOR_TAKE
    ? topics.find((topic) => topic.slug === FIRST_VIDEO_SLUG) ?? null
    : creatorTopic(creatorTake);
  if (params.has('mode')) {
    params.delete('mode');
    const query = params.toString();
    window.history.replaceState({}, '', query ? `/?${query}` : '/');
  }
  return {
    creatorTake,
    idea: creatorTake
      ? params.get('idea') === pinnedTopic?.slug ? pinnedTopic : null
      : topics.find((topic) => topic.slug === params.get('idea')) ?? null,
  };
}

function readSoundPreference() {
  try {
    return window.localStorage.getItem('build-wheel-sound') !== 'off';
  } catch {
    return true;
  }
}

export function BuildWheel() {
  const [initial] = useState(readUrlState);
  const [creatorTake, setCreatorTake] = useState<string | null>(initial.creatorTake);
  const [selected, setSelected] = useState<Topic | null>(initial.idea);
  const [category, setCategory] = useState<Category>('All ideas');
  const [soundOn, setSoundOn] = useState(readSoundPreference);
  const [drawing, setDrawing] = useState(false);
  const [rollingTopic, setRollingTopic] = useState<Topic | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [timerDeadline, setTimerDeadline] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(SPEECH_SECONDS);
  const timerEndPlayedRef = useRef(false);
  const intervalRef = useRef<number | undefined>(undefined);
  const timeoutRef = useRef<number | undefined>(undefined);
  const audioRef = useRef<AudioContext | null>(null);
  const soundOnRef = useRef(soundOn);
  const pool = creatorTake
    ? [creatorTake === CREATOR_TAKE ? topics[0] : creatorTopic(creatorTake)!]
    : category === 'All ideas' ? topics : topics.filter((topic) => topic.category === category);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      window.clearInterval(intervalRef.current);
      window.clearTimeout(timeoutRef.current);
      const state = readUrlState();
      setCreatorTake(state.creatorTake);
      setSelected(state.idea);
      setCategory('All ideas');
      setDrawing(false);
      setRollingTopic(null);
      setTimerDeadline(null);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => () => {
    window.clearInterval(intervalRef.current);
    window.clearTimeout(timeoutRef.current);
    void audioRef.current?.close();
  }, []);

  useEffect(() => {
    if (timerDeadline === null) return;
    const tick = () => {
      const next = secondsRemaining(timerDeadline, Date.now());
      setRemainingSeconds(next);
      if (next === 0 && !timerEndPlayedRef.current) {
        timerEndPlayedRef.current = true;
        if (soundOnRef.current && audioRef.current?.state === 'running') {
          playTimerAlarm(audioRef.current);
        }
      }
    };
    tick();
    const interval = window.setInterval(tick, 100);
    return () => window.clearInterval(interval);
  }, [timerDeadline]);

  useEffect(() => {
    if (timerDeadline === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTimerDeadline(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [timerDeadline]);

  function startTimer() {
    if (!selected || drawing) return;
    if (soundOnRef.current && window.AudioContext) {
      audioRef.current ??= new AudioContext();
      void audioRef.current.resume().catch(() => {});
    }
    timerEndPlayedRef.current = false;
    setRemainingSeconds(SPEECH_SECONDS);
    setTimerDeadline(Date.now() + SPEECH_SECONDS * 1000);
  }

  function toggleSound() {
    soundOnRef.current = !soundOnRef.current;
    setSoundOn(soundOnRef.current);
    try {
      window.localStorage.setItem('build-wheel-sound', soundOnRef.current ? 'on' : 'off');
    } catch {
      // The current page still honors the choice when browser storage is unavailable.
    }
  }

  function changeCategory(nextCategory: Category) {
    setCreatorTake(null);
    setCategory(nextCategory);
    setSelected(null);
    setRollingTopic(null);
    setTimerDeadline(null);
    window.history.replaceState({}, '', '/');
  }

  function spin() {
    if (drawing) return;
    const choice = creatorTake ? pool[0] : pool[randomIndex(pool.length)];
    const rollingPool = creatorTake ? topics : pool;
    const duration = reducedMotion ? 130 : 1850;
    let cursor = 0;

    if (soundOnRef.current && window.AudioContext) {
      audioRef.current ??= new AudioContext();
      void audioRef.current.resume().catch(() => {});
      playTick(audioRef.current, 0);
    }

    setSelected(null);
    setTimerDeadline(null);
    setDrawing(true);
    setRollingTopic(rollingPool[0]);
    window.history.replaceState({}, '', creatorTake ? `/?creator=${creatorTake}` : '/');

    if (!reducedMotion) {
      intervalRef.current = window.setInterval(() => {
        cursor = (cursor + 1) % rollingPool.length;
        setRollingTopic(rollingPool[cursor]);
        if (soundOnRef.current && audioRef.current?.state === 'running') {
          playTick(audioRef.current, cursor);
        }
      }, 95);
    }

    timeoutRef.current = window.setTimeout(() => {
      window.clearInterval(intervalRef.current);
      setDrawing(false);
      setRollingTopic(null);
      setSelected(choice);
      if (soundOnRef.current && audioRef.current?.state === 'running') {
        playResult(audioRef.current);
      }
      window.history.replaceState({}, '', resultUrl(window.location.origin, choice.slug, creatorTake));
    }, duration);
  }

  const status = drawing ? 'DRAWING…' : selected
    ? creatorTake ? '' : 'YOUR BUILD'
    : 'READY TO DRAW';
  const title = drawing ? rollingTopic?.title ?? 'Drawing…' : selected?.title ?? 'Waiting Room';

  return (
    <>
    <div className="app-shell" inert={timerDeadline !== null}>
      <SiteHeader active="wheel" />

      <main className="main-area">
        <div className="setup">
          <p className="mode-description">One minute to explain the topic. Seven days to build something real.</p>
          {!creatorTake && <div className="category-field">
            <label htmlFor="category">TOPIC NICHE</label>
            <select id="category" value={category} onChange={(event) => changeCategory(event.target.value as Category)} disabled={drawing}>
              {categories.map((option) => <option key={option} value={option}>{option === 'All ideas' ? 'All topics' : option === 'AI systems' ? 'Tech / AI' : option}</option>)}
            </select>
          </div>}
        </div>

        <section className={`draw-area${drawing ? ' is-drawing' : ''}`} aria-labelledby="draw-title">
          {status && <p className="draw-status">{status}</p>}
          <h1 id="draw-title" aria-live={drawing ? 'off' : 'polite'}>{title}</h1>
          {selected && <p className="idea-prompt">{selected.prompt}</p>}
        </section>

        <div className="action-area">
          <div className="actions">
            <button type="button" className={selected ? 'secondary-action' : 'primary-action'} onClick={spin} disabled={drawing}>{drawing ? 'Drawing…' : selected ? 'Spin again' : 'Spin'}</button>
            <button type="button" className={selected ? 'primary-action timer-action' : 'secondary-action timer-action'} onClick={startTimer} disabled={!selected || drawing}>Start 1 min timer</button>
          </div>
          <p className="fairness-note">{creatorTake ? 'ONE MINUTE TO EXPLAIN · SEVEN DAYS TO BUILD' : `${selected ? 'NEXT SPIN' : 'RANDOM DRAW'} · EQUAL CHANCE AMONG ${pool.length} TOPICS`}</p>
          <button type="button" className="sound-toggle" aria-pressed={soundOn} onClick={toggleSound}>{soundOn ? 'Sound on' : 'Sound off'}</button>
        </div>
      </main>

      <footer className="footer-line">
        <span>FAANG Engineer Explains It in 1 Minute</span>
        <span>Then Builds It in 7 Days</span>
      </footer>
    </div>
    {timerDeadline !== null && (
      <div className="timer-overlay" role="dialog" aria-modal="true" aria-label="Speech timer">
        <p className="timer-topic">{selected?.title}</p>
        <div className="speech-arc" aria-label="Speaking arc">
          {['The idea', 'Why it matters', "What I'd build"].map((label, index) => (
            <span key={label} className={remainingSeconds > 0 && speechPhase(remainingSeconds) === index ? 'is-current' : ''}>{label}</span>
          ))}
        </div>
        <div className="timer-ring" style={{ '--remaining': `${remainingSeconds / SPEECH_SECONDS * 100}%` } as CSSProperties}>
          <span role="timer" aria-live="off">{timerLabel(remainingSeconds)}</span>
        </div>
        <p className="timer-instruction" aria-live="assertive">{remainingSeconds === 0 ? "Time's up." : 'Speak.'}</p>
        <button type="button" className="timer-close" onClick={() => setTimerDeadline(null)} autoFocus>Close</button>
      </div>
    )}
    </>
  );
}
