// Sound effects utility using Web Audio API

let audioContext = null;

const getAudioContext = () => {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
  }
  return audioContext;
};

// Enemy hit sound (short impact)
export const playEnemyHitSound = (volume = 0.3) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(300, now);
  oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.1);

  gainNode.gain.setValueAtTime(volume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.15);
};

// Enemy killed sound (explosion-like)
export const playEnemyKillSound = (volume = 0.4) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Create noise for explosion effect
  const bufferSize = ctx.sampleRate * 0.3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.setValueAtTime(1000, now);
  noiseFilter.frequency.exponentialRampToValueAtTime(50, now + 0.3);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(volume * 0.5, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

  // Add bass thump
  const bass = ctx.createOscillator();
  bass.type = 'sine';
  bass.frequency.setValueAtTime(100, now);
  bass.frequency.exponentialRampToValueAtTime(30, now + 0.2);

  const bassGain = ctx.createGain();
  bassGain.gain.setValueAtTime(volume, now);
  bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  bass.connect(bassGain);
  bassGain.connect(ctx.destination);

  noise.start(now);
  bass.start(now);
  noise.stop(now + 0.3);
  bass.stop(now + 0.25);
};

// Player damage sound (painful hit)
export const playPlayerDamageSound = (volume = 0.5) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const oscillator1 = ctx.createOscillator();
  const oscillator2 = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator1.type = 'sawtooth';
  oscillator1.frequency.setValueAtTime(200, now);
  oscillator1.frequency.exponentialRampToValueAtTime(50, now + 0.3);

  oscillator2.type = 'sine';
  oscillator2.frequency.setValueAtTime(400, now);
  oscillator2.frequency.exponentialRampToValueAtTime(100, now + 0.3);

  gainNode.gain.setValueAtTime(volume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

  oscillator1.connect(gainNode);
  oscillator2.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator1.start(now);
  oscillator2.start(now);
  oscillator1.stop(now + 0.35);
  oscillator2.stop(now + 0.35);
};

// Player death sound (game over)
export const playPlayerDeathSound = (volume = 0.6) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Descending tone for death
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(400, now);
  oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.5);
  oscillator.frequency.exponentialRampToValueAtTime(40, now + 1.0);

  gainNode.gain.setValueAtTime(volume, now);
  gainNode.gain.linearRampToValueAtTime(volume * 0.7, now + 0.5);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + 1.2);
};
