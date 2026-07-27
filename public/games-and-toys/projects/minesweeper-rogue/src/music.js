(() => {
function createMusicManager(tracks, options = {}) {
  const fadeDurationMs = options.fadeDurationMs ?? 500;
  const volume = options.volume ?? 0.55;
  const audioById = new Map();
  let activeTrackId = null;
  let pendingTrackId = null;
  let unlocked = false;
  let enabled = true;
  let fadeFrameId = null;

  for (const track of tracks) {
    const audio = new Audio(track.src);

    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    audioById.set(track.id, audio);
  }

  function sync(context) {
    if (!enabled) {
      stopAll();
      return;
    }

    const track = tracks.find((candidate) => candidate.when(context));

    if (!track || track.id === pendingTrackId || track.id === activeTrackId) {
      return;
    }

    pendingTrackId = track.id;

    if (unlocked) {
      crossfadeTo(track.id);
    }
  }

  function unlock() {
    if (unlocked) {
      return;
    }

    unlocked = true;

    if (pendingTrackId) {
      crossfadeTo(pendingTrackId);
    }
  }

  function setEnabled(nextEnabled) {
    enabled = Boolean(nextEnabled);

    if (!enabled) {
      stopAll();
    }
  }

  function stopAll() {
    if (fadeFrameId) {
      cancelAnimationFrame(fadeFrameId);
      fadeFrameId = null;
    }

    for (const audio of audioById.values()) {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
    }

    activeTrackId = null;
    pendingTrackId = null;
  }

  function crossfadeTo(trackId) {
    const nextAudio = audioById.get(trackId);

    if (!nextAudio) {
      return;
    }

    pendingTrackId = trackId;

    if (fadeFrameId) {
      cancelAnimationFrame(fadeFrameId);
      fadeFrameId = null;
    }

    if (nextAudio.paused) {
      nextAudio.currentTime = 0;
    }

    const playPromise = nextAudio.play();

    if (playPromise) {
      playPromise.catch(() => {
        unlocked = false;
      });
    }

    const previousTrackId = activeTrackId;
    const previousAudio = previousTrackId ? audioById.get(previousTrackId) : null;
    const startedAt = performance.now();
    const previousVolume = previousAudio ? previousAudio.volume : 0;

    activeTrackId = trackId;

    function step(now) {
      const progress = Math.min(1, (now - startedAt) / fadeDurationMs);

      nextAudio.volume = volume * progress;

      if (previousAudio && previousAudio !== nextAudio) {
        previousAudio.volume = previousVolume * (1 - progress);
      }

      if (progress < 1) {
        fadeFrameId = requestAnimationFrame(step);
        return;
      }

      nextAudio.volume = volume;

      if (previousAudio && previousAudio !== nextAudio) {
        previousAudio.pause();
        previousAudio.currentTime = 0;
        previousAudio.volume = 0;
      }

      pendingTrackId = null;
      fadeFrameId = null;
    }

    fadeFrameId = requestAnimationFrame(step);
  }

  window.addEventListener("pointerdown", unlock, { capture: true });
  window.addEventListener("keydown", unlock, { capture: true });

  return {
    sync,
    getActiveTrackId() {
      return activeTrackId;
    },
    getPendingTrackId() {
      return pendingTrackId;
    },
    isEnabled() {
      return enabled;
    },
    setEnabled,
  };
}

window.MinesweeperMusic = {
  createMusicManager,
};
})();
