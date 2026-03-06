export function installAudio(Game) {
  Object.assign(Game.prototype, {
    initAudio() {
      if (this._audioInit) return;
      this._audioInit = true;

      const make = (src) => {
        try {
          const a = new Audio(src);
          a.loop = true;
          a.preload = 'auto';
          a.volume = 0;
          return a;
        } catch (_e) {
          return null;
        }
      };

      this._audio = {
        title: make('assets/music/title.mp3'),
        overworld: make('assets/music/overworld.mp3'),
        battle: make('assets/music/battle.mp3'),
      };
      this._audioTargetVol = 0.6;
      this._curTrack = null;
      this._pendingTrack = null;
      this._audioUnlocked = false;
      this._fadeInTimer = null;
      this._fadeOutTimer = null;
      this._musicEnabled = true;

      // Unlock on first user gesture (required by many browsers)
      const self = this;
      this._onAudioUnlock = () => {
        if (self._audioUnlocked) return;
        self._audioUnlocked = true;
        try {
          window.removeEventListener('pointerdown', self._onAudioUnlock);
          window.removeEventListener('keydown', self._onAudioUnlock);
        } catch (_e) {}
        const key = self._pendingTrack || self._curTrack || 'title';
        if (key) {
          self.playMusic(key);
        }
      };

      try {
        window.addEventListener('pointerdown', this._onAudioUnlock, { passive: true });
        window.addEventListener('keydown', this._onAudioUnlock);
      } catch (_e) {}
    },

    stopMusic() {
      if (!this._audio) return;
      if (this._fadeInTimer) { clearInterval(this._fadeInTimer); this._fadeInTimer = null; }
      if (this._fadeOutTimer) { clearInterval(this._fadeOutTimer); this._fadeOutTimer = null; }
      const curName = this._curTrack;
      if (curName && this._audio[curName]) {
        try {
          this._audio[curName].pause();
          this._audio[curName].currentTime = 0;
          this._audio[curName].volume = 0;
        } catch (_e) {}
      }
      this._curTrack = null;
      this._pendingTrack = null;
    },

    setMusicEnabled(enabled) {
      if (!this._audioInit) this.initAudio();
      const on = !!enabled;
      if (this._musicEnabled === on) return;
      this._musicEnabled = on;

      if (!on) {
        // Fade out and pause current without clearing track name
        if (this._fadeInTimer) { clearInterval(this._fadeInTimer); this._fadeInTimer = null; }
        if (this._fadeOutTimer) { clearInterval(this._fadeOutTimer); this._fadeOutTimer = null; }
        const curName = this._curTrack;
        if (curName && this._audio[curName]) {
          const cur = this._audio[curName];
          this._fadeOutTimer = setInterval(() => {
            const v = Math.max(0, cur.volume - 0.08);
            cur.volume = v;
            if (v <= 0.01) {
              try { cur.pause(); } catch (_e) {}
              clearInterval(this._fadeOutTimer);
              this._fadeOutTimer = null;
            }
          }, 30);
        }
        return;
      }

      // Turning on: resume current or pending track if available and unlocked
      const key = this._curTrack || this._pendingTrack;
      if (key && this._audioUnlocked) {
        this.playMusic(key);
      } else {
        // If still locked by autoplay policy, remember desired track
        this._pendingTrack = key || this._pendingTrack || null;
      }
    },

    toggleMusic() {
      const on = !(this._musicEnabled === false);
      this.setMusicEnabled(!on);
    },

    playMusic(name) {
      // Ensure audio system is initialized
      if (!this._audioInit) this.initAudio();
      if (!this._audio) return;

      const target = this._audio[name];
      if (!target) return;

      // Respect music toggle
      if (this._musicEnabled === false) {
        this._pendingTrack = name;
        this._curTrack = name;
        return;
      }

      // If autoplay is still locked, defer until unlock
      if (!this._audioUnlocked) {
        this._pendingTrack = name;
        this._curTrack = name;
        return;
      }

      // Clear existing fades
      if (this._fadeInTimer) { clearInterval(this._fadeInTimer); this._fadeInTimer = null; }
      if (this._fadeOutTimer) { clearInterval(this._fadeOutTimer); this._fadeOutTimer = null; }

      const endVol = Math.max(0, Math.min(1, Number(this._audioTargetVol) || 0.6));

      // Fade out current, if any
      const curName = this._curTrack;
      if (curName && curName !== name) {
        const cur = this._audio[curName];
        if (cur) {
          this._fadeOutTimer = setInterval(() => {
            const v = Math.max(0, cur.volume - 0.08);
            cur.volume = v;
            if (v <= 0.01) {
              try {
                cur.pause();
                cur.currentTime = 0;
              } catch (_e) {}
              cur.volume = 0;
              clearInterval(this._fadeOutTimer);
              this._fadeOutTimer = null;
            }
          }, 30);
        }
      }

      // Start and fade in target
      try {
        target.volume = 0;
      } catch (_e) {}
      this._curTrack = name;
      this._pendingTrack = null;

      try {
        const p = target.play();
        if (p && typeof p.then === 'function') {
          p.catch(() => {
            // If play was blocked for any reason, mark as pending to try again on next gesture
            this._pendingTrack = name;
          });
        }
      } catch (_e) {
        this._pendingTrack = name;
      }

      this._fadeInTimer = setInterval(() => {
        const v = Math.min(endVol, target.volume + endVol / 8);
        target.volume = v;
        if (v >= endVol - 0.001) {
          clearInterval(this._fadeInTimer);
          this._fadeInTimer = null;
        }
      }, 30);
    },
  });
}