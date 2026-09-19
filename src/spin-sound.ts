// Synthesized cues keep the draw self-contained and avoid a remote audio asset.
function tone(context: AudioContext, frequency: number, duration: number, delay = 0) {
  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.075, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.01);
}

export function playTick(context: AudioContext, step: number) {
  const length = Math.max(1, Math.floor(context.sampleRate * 0.018));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    samples[index] = (Math.random() * 2 - 1) * (1 - index / length);
  }
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const start = context.currentTime;
  source.buffer = buffer;
  filter.type = 'bandpass';
  filter.frequency.value = 2150 + (step % 4) * 160;
  filter.Q.value = 1.4;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.24, start + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.018);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start(start);
  source.stop(start + 0.02);
}

export function playResult(context: AudioContext) {
  [523.25, 659.25, 783.99].forEach((frequency, index) => {
    tone(context, frequency, 0.42, index * 0.07);
  });
}

export function playTimerAlarm(context: AudioContext) {
  // Three paired beeps distinguish the end of the minute from the draw chime.
  [880, 660, 880, 660, 880, 660].forEach((frequency, index) => {
    const start = context.currentTime + index * 0.23;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.13, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.19);
  });
}
