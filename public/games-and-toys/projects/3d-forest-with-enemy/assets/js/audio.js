/**
 * Ambient music + low thumping heartbeat that react to monster proximity.
 * WebAudio-only (no external assets): safe for autoplay policies when started on user gesture.
 *
 * API:
 * - startMusic(): call on user gesture (e.g., clicking Enter)
 * - setProximityFactor(f): f in [0,1], 0 = far, 1 = very close (raises tension and heartbeat rate)
 * - stopMusic(): fades out and stops
 */

let ctx = null;
let masterGain = null;

// Pad subsystem
let filter = null;
let oscPad1 = null;
let oscPad2 = null;
let lfo = null;
let lfoGain = null;

// Heartbeat subsystem (scheduled per beat)
let heartbeatIntervalMs = 1000;
let heartbeatLevel = 0.08;
let heartbeatTimer = null;

let started = false;
let proximity = 0;

// Smooth parameter helper
function smoothStep01(x) {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
}

// Create graph
function createGraph() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();

  masterGain = ctx.createGain();
  masterGain.gain.value = 0.12; // initial quiet level

  // Pad chain
  filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  filter.Q.value = 0.8;

  oscPad1 = ctx.createOscillator();
  oscPad2 = ctx.createOscillator();
  oscPad1.type = 'sawtooth';
  oscPad2.type = 'sawtooth';

  const baseFreq = 110; // ~A2
  oscPad1.frequency.value = baseFreq;
  oscPad2.frequency.value = baseFreq * 1.5;
  oscPad2.detune.value = 3;

  lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.25; // base pulse rate
  lfoGain = ctx.createGain();
  lfoGain.gain.value = 180; // modulation depth on filter cutoff

  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);

  oscPad1.connect(filter);
  oscPad2.connect(filter);
  filter.connect(masterGain);
  masterGain.connect(ctx.destination);
}

// Heartbeat: schedule short low-frequency thumps.
// Each thump is a brief sine burst with a fast attack and exponential decay.
function scheduleNextHeartbeat() {
  if (!ctx || !started) return;

  const now = ctx.currentTime;

  // Create per-beat nodes
  const hbOsc = ctx.createOscillator();
  hbOsc.type = 'sine';
  hbOsc.frequency.value = 55; // low thump (~kick fundamental)

  const hbGain = ctx.createGain();
  hbGain.gain.value = 0;

  // Route through master (so global volume applies)
  hbOsc.connect(hbGain);
  hbGain.connect(masterGain);

  // Envelope: quick attack then decay
  const attack = 0.015;
  const decay = 0.28;
  const start = now + 0.0;

  hbGain.gain.cancelScheduledValues(start);
  hbGain.gain.setValueAtTime(0.0, start);
  hbGain.gain.linearRampToValueAtTime(heartbeatLevel, start + attack);
  // Exponential-like decay using setTarget
  hbGain.gain.setTargetAtTime(0.0001, start + attack, decay * 0.35);

  hbOsc.start(start);

  // Stop and cleanup after envelope ends
  const stopAt = start + attack + decay + 0.15;
  hbOsc.stop(stopAt);
  setTimeout(() => {
    try {
      hbOsc.disconnect();
      hbGain.disconnect();
    } catch (_) {}
  }, (stopAt - now) * 1000 + 20);

  // Schedule next beat
  const interval = heartbeatIntervalMs;
  clearTimeout(heartbeatTimer);
  heartbeatTimer = setTimeout(scheduleNextHeartbeat, interval);
}

export function startMusic() {
  if (started) return;
  started = true;

  if (!ctx) createGraph();

  // Resume context if it was suspended
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const now = ctx.currentTime;

  // Gentle fade-in
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(masterGain.gain.value, now);
  masterGain.gain.linearRampToValueAtTime(0.16, now + 2.0);

  // Start pad oscillators and LFO
  oscPad1.start(now);
  oscPad2.start(now);
  lfo.start(now);

  // Kick off heartbeat loop
  clearTimeout(heartbeatTimer);
  heartbeatTimer = setTimeout(scheduleNextHeartbeat, 400);
}

export function stopMusic() {
  if (!ctx || !masterGain) return;
  const now = ctx.currentTime;

  clearTimeout(heartbeatTimer);
  heartbeatTimer = null;

  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(masterGain.gain.value, now);
  masterGain.gain.linearRampToValueAtTime(0.0, now + 1.2);

  // Stop after fade
  setTimeout(() => {
    try {
      oscPad1 && oscPad1.stop();
      oscPad2 && oscPad2.stop();
      lfo && lfo.stop();
    } catch (_) {}
    // Close context to free resources
    try { ctx.close(); } catch (_) {}
    ctx = null;
    started = false;
  }, 1300);
}

/**
 * Set proximity factor to drive musical intensity and heartbeat rate.
 * f in [0,1], 0 = far (slow/quiet thumps), 1 = very close (fast/louder thumps).
 */
export function setProximityFactor(f) {
  proximity = Math.max(0, Math.min(1, f));
  if (!ctx) return;

  const t = smoothStep01(proximity);

  // Pad dynamics
  const lfoRate = 0.25 + 1.55 * t;                // ~0.25Hz → ~1.8Hz
  lfo.frequency.setTargetAtTime(lfoRate, ctx.currentTime, 0.2);

  const cutoff = 600 + 1400 * t;                  // brighter as closer
  filter.frequency.setTargetAtTime(cutoff, ctx.currentTime, 0.15);

  const vol = 0.12 + 0.14 * t;
  masterGain.gain.setTargetAtTime(vol, ctx.currentTime, 0.25);

  const detuneCents = 0 + 35 * t;
  oscPad1.detune.setTargetAtTime(detuneCents, ctx.currentTime, 0.2);
  oscPad2.detune.setTargetAtTime(detuneCents + 3, ctx.currentTime, 0.2);

  // Heartbeat dynamics
  // Rate: ~1.1s interval when far → ~0.35s near
  heartbeatIntervalMs = Math.round(1100 - 750 * t);
  // Level: subtle when far → stronger near
  heartbeatLevel = 0.04 + 0.22 * t;

  // If beats are running, they will pick up new rate on the next scheduling tick.
}