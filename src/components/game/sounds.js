let audioCtx = null;
let muted = false;
try { muted = localStorage.getItem('matemagia_muted') === 'true'; } catch (e) { /* noop */ }

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(freq, dur, type = 'sine', vol = 0.25) {
  if (muted) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch (e) { /* Audio API not available */ }
}

export function playCorrectSound() {
  tone(523.25, 0.1);
  setTimeout(() => tone(659.25, 0.1), 70);
  setTimeout(() => tone(783.99, 0.15), 140);
}

export function playWrongSound() {
  tone(330, 0.2, 'triangle', 0.18);
  setTimeout(() => tone(262, 0.3, 'triangle', 0.12), 100);
}

export function playBadgeSound() {
  tone(523.25, 0.07);
  setTimeout(() => tone(659.25, 0.07), 50);
  setTimeout(() => tone(783.99, 0.07), 100);
  setTimeout(() => tone(1046.5, 0.2), 150);
}

export function playVictorySound() {
  [523.25, 587.33, 659.25, 783.99, 659.25, 783.99, 1046.5].forEach((f, i) => {
    setTimeout(() => tone(f, 0.15), i * 90);
  });
}

export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem('matemagia_muted', String(muted)); } catch (e) { /* noop */ }
  return muted;
}

export function isMuted() {
  return muted;
}
