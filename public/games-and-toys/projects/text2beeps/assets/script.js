(function () {
  "use strict";

  const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

  // Elements
  const el = {};
  window.addEventListener("DOMContentLoaded", () => {
    el.inputText = document.getElementById("inputText");
    el.playBtn = document.getElementById("playBtn");
    el.pauseBtn = document.getElementById("pauseBtn");
    el.stopBtn = document.getElementById("stopBtn");
    el.seek = document.getElementById("seek");
    el.posLabel = document.getElementById("posLabel");
    el.lenLabel = document.getElementById("lenLabel");
    el.bpm = document.getElementById("bpm");
    el.bpmVal = document.getElementById("bpmVal");
    el.noteLen = document.getElementById("noteLen");
    el.noteLenVal = document.getElementById("noteLenVal");
    el.volume = document.getElementById("volume");
    el.volumeVal = document.getElementById("volumeVal");
    el.wave = document.getElementById("wave");
    el.previewText = document.getElementById("previewText");
    el.scaleSelect = document.getElementById("scaleSelect");
    el.assignmentSelect = document.getElementById("assignmentSelect");
    el.rootNote = document.getElementById("rootNote");
    el.mappingTable = document.getElementById("mappingTable");
    el.customMappingContainer = document.getElementById("customMappingContainer");
    el.customMap = document.getElementById("customMap");
    el.applyCustomBtn = document.getElementById("applyCustomBtn");
    el.reshuffleBtn = document.getElementById("reshuffleBtn");
    el.lengthMode = document.getElementById("lengthMode");

    buildRootOptions();
    initUIValues();
    bindEvents();
    updatePreview();
    rebuildMapping();
    updateSeekUI();
    updateTimeline();
  });

  // Audio
  let audioCtx = null;
  let masterGain = null;

  // Playback state
  let isPlaying = false;
  let isPaused = false;
  let currentIndex = 0;
  let timerId = null;
  let startEpoch = 0;
  let lastRenderedText = "";
  let activeVoice = null;

  // Mapping state
  let currentMapping = {}; // { a: freqHz, ... }
  let currentScalePool = []; // array of MIDI for display
  let randomOrder = null;

  // Timeline (durations per character and cumulative start times)
  let durations = []; // ms per character index
  let cumStartTimes = []; // ms from index 0 to index i start

  // Utils
  function midiToFreq(m) {
    return 440 * Math.pow(2, (m - 69) / 12);
  }

  function noteToMidi(note) {
    // Supports "A3", "A#3", "Ab3"
    if (typeof note !== "string") return null;
    const m = note.trim().match(/^([A-Ga-g])([#b]?)(-?\d+)$/);
    if (!m) return null;
    let [, n, acc, octStr] = m;
    n = n.toUpperCase();
    const semis = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    let v = semis[n];
    if (acc === "#") v += 1;
    if (acc === "b") v -= 1;
    const oct = parseInt(octStr, 10);
    return (oct + 1) * 12 + v;
  }

  function midiToName(m) {
    const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const pc = ((m % 12) + 12) % 12;
    const oct = Math.floor(m / 12) - 1;
    return names[pc] + oct;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function countLetters(s) {
    const counts = {};
    for (const ch of s.toLowerCase()) {
      if (ch >= "a" && ch <= "z") counts[ch] = (counts[ch] || 0) + 1;
    }
    return counts;
  }

  function isLetterChar(ch) {
    if (!ch) return false;
    const c = ch.toLowerCase();
    return c >= "a" && c <= "z";
  }

  const PUNCT_SET = new Set([
    ".", ",", ";", ":", "!", "?", "'", "\"", "(", ")", "[", "]", "{", "}", "-", "—", "–", "_",
    "/", "\\", "|", "@", "#", "$", "%", "^", "&", "*", "+", "=", "<", ">", "`", "~"
  ]);

  function isWhitespace(ch) {
    return /\s/.test(ch);
  }

  function isPunct(ch) {
    return PUNCT_SET.has(ch);
  }

  function buildRootOptions() {
    // Build root notes from A2 (45) to C6 (84)
    const startMidi = 45; // A2
    const endMidi = 84; // C6
    const frag = document.createDocumentFragment();
    for (let m = startMidi; m <= endMidi; m++) {
      const name = midiToName(m);
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      frag.appendChild(opt);
    }
    el.rootNote.appendChild(frag);
    // Default A3
    el.rootNote.value = "A3";
  }

  function initUIValues() {
    el.bpmVal.textContent = el.bpm.value;
    el.noteLenVal.textContent = `${Math.round(parseFloat(el.noteLen.value) * 100)}%`;
    el.volumeVal.textContent = Number(el.volume.value).toFixed(2);
  }

  function bindEvents() {
    el.inputText.addEventListener("input", () => {
      updatePreview();
      if (el.assignmentSelect.value === "frequency") rebuildMapping();
      updateSeekUI();
      updateTimeline();
    });

    el.playBtn.addEventListener("click", onPlay);
    el.pauseBtn.addEventListener("click", onPause);
    el.stopBtn.addEventListener("click", onStop);

    el.seek.addEventListener("input", onSeek);

    el.bpm.addEventListener("input", () => {
      el.bpmVal.textContent = el.bpm.value;
      updateTimeline();
      if (isPlaying) {
        startEpoch = performance.now() - (cumStartTimes[currentIndex] || 0);
      }
    });
    el.noteLen.addEventListener("input", () => {
      el.noteLenVal.textContent = `${Math.round(parseFloat(el.noteLen.value) * 100)}%`;
      // Gate only; no need to rebuild timeline.
    });
    el.volume.addEventListener("input", () => {
      el.volumeVal.textContent = Number(el.volume.value).toFixed(2);
      if (masterGain) masterGain.gain.value = parseFloat(el.volume.value);
    });
    el.wave.addEventListener("change", () => {});

    el.scaleSelect.addEventListener("change", () => rebuildMapping(true));
    el.assignmentSelect.addEventListener("change", () => rebuildMapping(true));
    el.rootNote.addEventListener("change", () => rebuildMapping(true));
    el.lengthMode.addEventListener("change", () => {
      updateTimeline();
      if (isPlaying) {
        startEpoch = performance.now() - (cumStartTimes[currentIndex] || 0);
      }
    });

    el.applyCustomBtn.addEventListener("click", () => rebuildMapping(true));
    el.reshuffleBtn.addEventListener("click", () => {
      randomOrder = null;
      rebuildMapping(true);
    });
  }

  function updateSeekUI() {
    const text = el.inputText.value || "";
    el.seek.max = String(Math.max(0, text.length - 1));
    el.seek.value = String(currentIndex);
    el.posLabel.textContent = String(currentIndex);
    el.lenLabel.textContent = String(text.length);
  }

  function updatePreview() {
    const text = el.inputText.value || "";
    if (text === lastRenderedText) {
      highlightCurrentChar();
      return;
    }
    lastRenderedText = text;
    el.previewText.innerHTML = "";
    const frag = document.createDocumentFragment();
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement("span");
      span.className = "char";
      span.dataset.idx = String(i);
      const ch = text[i];
      span.textContent = ch;
      frag.appendChild(span);
    }
    el.previewText.appendChild(frag);
    highlightCurrentChar();
  }

  function highlightCurrentChar() {
    const prev = el.previewText.querySelector(".char.active");
    if (prev) prev.classList.remove("active");
    const span = el.previewText.querySelector(`.char[data-idx="${currentIndex}"]`);
    if (span) {
      span.classList.add("active");
      // Ensure in view
      const container = el.previewText;
      const spanRect = span.getBoundingClientRect();
      const contRect = container.getBoundingClientRect();
      if (spanRect.left < contRect.left || spanRect.right > contRect.right) {
        container.scrollLeft += spanRect.left - contRect.left - container.clientWidth / 2 + span.clientWidth / 2;
      }
      if (spanRect.top < contRect.top || spanRect.bottom > contRect.bottom) {
        container.scrollTop += spanRect.top - contRect.top - container.clientHeight / 2 + span.clientHeight / 2;
      }
    }
  }

  function buildNotePool(scale, rootMidi, count) {
    const pool = [];
    if (scale === "chromatic") {
      for (let i = 0; i < count; i++) pool.push(rootMidi + i);
    } else if (scale === "pentatonic") {
      const steps = [0, 2, 4, 7, 9]; // major pentatonic
      let n = 0;
      while (pool.length < count) {
        const step = steps[n % steps.length] + 12 * Math.floor(n / steps.length);
        pool.push(rootMidi + step);
        n++;
      }
    } else {
      for (let i = 0; i < count; i++) pool.push(rootMidi + i);
    }
    return pool;
  }

  function letterOrder(mode, text) {
    if (mode === "alphabetical") return ALPHABET.slice();
    if (mode === "random") {
      if (!randomOrder) randomOrder = shuffle(ALPHABET);
      return randomOrder.slice();
    }
    if (mode === "frequency") {
      const counts = countLetters(text || "");
      const letters = ALPHABET.slice();
      letters.sort((a, b) => {
        const ca = counts[a] || 0;
        const cb = counts[b] || 0;
        if (cb !== ca) return cb - ca; // desc by count
        return a < b ? -1 : 1;
      });
      return letters;
    }
    return ALPHABET.slice();
  }

  function parseCustomMapping() {
    const raw = el.customMap.value.trim();
    if (!raw) return null;
    try {
      const obj = JSON.parse(raw);
      const out = {};
      for (const k of Object.keys(obj)) {
        const key = (k || "").toLowerCase();
        if (!ALPHABET.includes(key)) continue;
        const v = obj[k];
        let freq = null;
        if (typeof v === "number") {
          freq = v;
        } else if (typeof v === "string") {
          const maybeMidi = noteToMidi(v);
          if (maybeMidi !== null) freq = midiToFreq(maybeMidi);
          else {
            const f = parseFloat(v);
            if (!Number.isNaN(f)) freq = f;
          }
        }
        if (freq && Number.isFinite(freq) && freq > 0) out[key] = freq;
      }
      return out;
    } catch (_) {
      return null;
    }
  }

  function rebuildMapping(resetRandom = false) {
    const scale = el.scaleSelect.value;
    const assign = el.assignmentSelect.value;
    const rootName = el.rootNote.value || "A3";
    const rootMidi = noteToMidi(rootName) ?? noteToMidi("A3");
    if (resetRandom) randomOrder = null;

    // UI toggles
    el.customMappingContainer.classList.toggle("hidden", assign !== "custom");
    el.reshuffleBtn.style.display = assign === "random" ? "" : "none";

    currentScalePool = buildNotePool(scale, rootMidi, 26);
    const text = el.inputText.value || "";
    const order = letterOrder(assign, text);

    let mapping = {};
    if (assign === "custom") {
      const parsed = parseCustomMapping() || {};
      mapping = { ...parsed };
      // Fill missing with alphabetical mapping on current scale
      let i = 0;
      for (const ch of ALPHABET) {
        if (!mapping[ch]) {
          const midi = currentScalePool[i] ?? currentScalePool[currentScalePool.length - 1];
          mapping[ch] = midiToFreq(midi);
        }
        i++;
      }
    } else {
      for (let i = 0; i < ALPHABET.length; i++) {
        const ch = order[i];
        const midi = currentScalePool[i] ?? currentScalePool[currentScalePool.length - 1];
        mapping[ch] = midiToFreq(midi);
      }
    }
    currentMapping = mapping;
    renderMappingTable();
  }

  function renderMappingTable() {
    const wrap = el.mappingTable;
    wrap.innerHTML = "";
    const frag = document.createDocumentFragment();
    for (let i = 0; i < ALPHABET.length; i++) {
      const ch = ALPHABET[i];
      const freq = currentMapping[ch];
      const midi = Math.round(69 + 12 * Math.log2(freq / 440));
      const name = isFinite(midi) ? midiToName(midi) : "?";
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = `${ch.toUpperCase()} → ${name}`;
      frag.appendChild(cell);
    }
    wrap.appendChild(frag);
  }

  function ensureAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = parseFloat(el.volume.value);
      masterGain.connect(audioCtx.destination);
    }
  }

  function charDurationMs() {
    const bpm = parseFloat(el.bpm.value) || 120;
    return 60000 / bpm;
  }

  function updateTimeline() {
    const text = el.inputText.value || "";
    const beat = charDurationMs();
    const mode = (el.lengthMode && el.lengthMode.value) || "mono";

    durations = new Array(text.length).fill(0);

    if (mode === "mono") {
      for (let i = 0; i < durations.length; i++) durations[i] = beat;
    } else if (mode === "word") {
      let i = 0;
      while (i < text.length) {
        const ch = text[i];
        if (isLetterChar(ch)) {
          let j = i + 1;
          while (j < text.length && isLetterChar(text[j])) j++;
          const wordLen = j - i;
          const seg = beat / (wordLen || 1);
          for (let k = i; k < j; k++) durations[k] = seg;
          i = j;
        } else if (isPunct(ch)) {
          // Punctuation occupies one full beat in word mode
          durations[i] = beat;
          i++;
        } else {
          // Whitespace and other non-letters consume no time
          durations[i] = 0;
          i++;
        }
      }
    } else {
      for (let i = 0; i < durations.length; i++) durations[i] = beat;
    }

    // Build cumulative start times
    cumStartTimes = new Array(text.length).fill(0);
    for (let i = 1; i < text.length; i++) {
      cumStartTimes[i] = cumStartTimes[i - 1] + durations[i - 1];
    }
  }

  function step() {
    const text = el.inputText.value || "";
    if (currentIndex >= text.length) {
      onStop();
      return;
    }

    const ch = text[currentIndex] || "";
    const lower = ch.toLowerCase();
    const isLetter = lower >= "a" && lower <= "z";
    const gate = Math.max(0.05, Math.min(1.0, parseFloat(el.noteLen.value) || 0.5));

    const durMs = durations[currentIndex] ?? charDurationMs();
    const beepMs = durMs * gate;

    // Stop previous active voice quickly
    killActiveVoice();

    if (isLetter) {
      const freq = currentMapping[lower];
      if (freq && durMs > 0) {
        activeVoice = playBeep(freq, beepMs, el.wave.value);
      }
    } else if (isPunct(ch)) {
      if (durMs > 0) {
        const rootName = el.rootNote.value || "A3";
        const rootMidi = noteToMidi(rootName) ?? noteToMidi("A3");
        const intervals = getPunctChordIntervals(ch);
        const freqs = intervals.map(semi => midiToFreq(rootMidi + semi));
        activeVoice = playChord(freqs, beepMs, el.wave.value);
      }
    }
    currentIndex++;
    el.seek.value = String(currentIndex);
    el.posLabel.textContent = String(currentIndex);
    highlightCurrentChar();
  }

  function scheduleNext() {
    if (!isPlaying) return;
    const now = performance.now();
    const nextTarget = startEpoch + (cumStartTimes[currentIndex] || 0);
    const delay = Math.max(0, nextTarget - now);
    timerId = setTimeout(() => {
      if (!isPlaying) return;
      step();
      scheduleNext();
    }, delay);
  }

  function onPlay() {
    ensureAudio();
    audioCtx.resume();

    if (!isPlaying) {
      // Ensure timeline is up-to-date
      updateTimeline();

      isPlaying = true;
      isPaused = false;
      startEpoch = performance.now() - (cumStartTimes[currentIndex] || 0);
      el.playBtn.disabled = true;
      el.pauseBtn.disabled = false;
      el.stopBtn.disabled = false;
      scheduleNext();
    }
  }

  function onPause() {
    if (!isPlaying) return;
    isPlaying = false;
    isPaused = true;
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    killActiveVoice();
    el.playBtn.disabled = false;
    el.pauseBtn.disabled = true;
    el.stopBtn.disabled = false;
  }

  function onStop() {
    isPlaying = false;
    isPaused = false;
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    killActiveVoice();
    currentIndex = 0;
    updateSeekUI();
    highlightCurrentChar();
    el.playBtn.disabled = false;
    el.pauseBtn.disabled = true;
    el.stopBtn.disabled = true;
  }

  function onSeek() {
    const v = parseInt(el.seek.value || "0", 10);
    currentIndex = isFinite(v) ? Math.max(0, v) : 0;
    highlightCurrentChar();
    el.posLabel.textContent = String(currentIndex);
    if (isPlaying) {
      startEpoch = performance.now() - (cumStartTimes[currentIndex] || 0);
    }
  }

  function playBeep(freq, durationMs, wave = "sine") {
    if (!audioCtx) return null;
    const t0 = audioCtx.currentTime + 0.002;
    const t1 = t0 + durationMs / 1000;

    const osc = audioCtx.createOscillator();
    try {
      osc.type = wave;
    } catch (_) {
      osc.type = "sine";
    }
    osc.frequency.setValueAtTime(freq, t0);

    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    // Quick attack, short release
    g.gain.linearRampToValueAtTime(0.8, t0 + Math.min(0.02, (durationMs / 1000) * 0.2));
    g.gain.linearRampToValueAtTime(0.0001, t1);

    osc.connect(g).connect(masterGain);

    osc.start(t0);
    osc.stop(t1 + 0.02);

    // Cleanup
    osc.addEventListener("ended", () => {
      g.disconnect();
      osc.disconnect();
    });

    return { osc, g };
  }

  function getPunctChordIntervals(ch) {
    switch (ch) {
      case ".": return [0, 4, 7];            // major triad
      case ",": return [0, 2, 7];            // sus2
      case ";": return [0, 4, 7, 10];        // dom7
      case ":": return [0, 4, 7, 9];         // 6 chord
      case "?": return [0, 3, 7];            // minor triad
      case "!": return [0, 7, 12];           // power + octave
      case "-":
      case "–":
      case "—": return [0, 5, 7];            // sus4
      case "'":
      case "\"": return [0, 7];              // fifth dyad
      case "(":
      case ")":
      case "[":
      case "]":
      case "{":
      case "}": return [0, 12];              // octave dyad
      case "@":
      case "#":
      case "$":
      case "%": return [0, 3, 6, 9];         // diminished cluster color
      case "^":
      case "&":
      case "*": return [0, 7, 14];           // fifth + 9
      case "+":
      case "=": return [0, 4, 7, 12];        // major + octave
      case "<":
      case ">": return [0, 1, 7];            // tension
      case "_":
      case "/":
      case "\\":
      case "|": return [0, 5, 10];           // quartal-ish
      case "`":
      case "~": return [0, 2, 4, 7];         // add2/add4 color
      default: return [0, 4, 7];             // fallback major triad
    }
  }

  function playChord(freqs, durationMs, wave = "sine") {
    if (!audioCtx || !Array.isArray(freqs) || freqs.length === 0) return null;
    const t0 = audioCtx.currentTime + 0.002;
    const t1 = t0 + durationMs / 1000;

    const g = audioCtx.createGain();
    const n = freqs.length;
    const peak = 0.8 / Math.sqrt(n); // keep perceived loudness stable
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + Math.min(0.02, (durationMs / 1000) * 0.2));
    g.gain.linearRampToValueAtTime(0.0001, t1);
    g.connect(masterGain);

    const oscs = [];
    for (const f of freqs) {
      const osc = audioCtx.createOscillator();
      try {
        osc.type = wave;
      } catch (_) {
        osc.type = "sine";
      }
      osc.frequency.setValueAtTime(f, t0);
      osc.connect(g);
      osc.start(t0);
      osc.stop(t1 + 0.02);
      oscs.push(osc);
    }

    const cleanup = () => {
      try { g.disconnect(); } catch (_) {}
      for (const osc of oscs) {
        try { osc.disconnect(); } catch (_) {}
      }
    };
    // Cleanup after the last osc ends
    let ended = 0;
    for (const osc of oscs) {
      osc.addEventListener("ended", () => {
        ended++;
        if (ended >= oscs.length) cleanup();
      });
    }

    return { oscs, g };
  }

  function killActiveVoice() {
    if (!activeVoice || !audioCtx) return;
    try {
      const t = audioCtx.currentTime;
      activeVoice.g.gain.cancelScheduledValues(t);
      activeVoice.g.gain.setValueAtTime(0.0001, t);
      if (activeVoice.osc) {
        activeVoice.osc.stop(t + 0.01);
      } else if (activeVoice.oscs && Array.isArray(activeVoice.oscs)) {
        for (const osc of activeVoice.oscs) {
          try { osc.stop(t + 0.01); } catch (_) {}
        }
      }
    } catch (_) {
      // ignore
    } finally {
      activeVoice = null;
    }
  }
})();