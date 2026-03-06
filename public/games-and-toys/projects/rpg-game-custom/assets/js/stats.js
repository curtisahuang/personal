export function installStats(Game) {
  Object.assign(Game.prototype, {
    // ---------- Leveling helpers ----------
    xpForLevel(level) {
      if (level <= 1) return 0;
      return 5 * (level - 1) * level;
    },

    computeLevelFromXp(totalXp) {
      let L = 1;
      while (L < this.levelCap && totalXp >= this.xpForLevel(L + 1)) {
        L += 1;
      }
      return L;
    },

    rollGrowthPoints(ratePct) {
      const rate = Math.max(0, Number(ratePct) || 0);
      if (rate >= 100) {
        const extraChance = Math.min(100, rate - 100);
        return 1 + ((Math.random() * 100) < extraChance ? 1 : 0);
      }
      return (Math.random() * 100) < rate ? 1 : 0;
    },

    processLevelUpsAfterReward() {
      const lines = [];
      while (this.level < this.levelCap && this.stats.xp >= this.xpForLevel(this.level + 1)) {
        const prevMaxHp = this.stats.maxHp;

        const gains = {
          maxHp: this.rollGrowthPoints(this.growthRates.maxHp),
          atk: this.rollGrowthPoints(this.growthRates.atk),
          def: this.rollGrowthPoints(this.growthRates.def),
          spe: this.rollGrowthPoints(this.growthRates.spe),
          luc: this.rollGrowthPoints(this.growthRates.luc),
        };

        const caps = { maxHp: 60, atk: 30, def: 30, spe: 30, luc: 30 };
        const applied = {};
        for (const k of Object.keys(gains)) {
          const before = this.stats[k];
          const allow = Math.max(0, (caps[k] - before));
          const inc = Math.min(allow, gains[k]);
          if (inc > 0) {
            this.stats[k] = before + inc;
          }
          applied[k] = inc;
        }

        if (applied.maxHp > 0) {
          const delta = this.stats.maxHp - prevMaxHp;
          this.hp = Math.min(this.stats.maxHp, Math.max(0, this.hp + delta));
        }

        this.enforceCaps();

        this.level += 1;
        const incs = [];
        if (applied.maxHp > 0) incs.push(`Max HP +${applied.maxHp}`);
        if (applied.atk > 0) incs.push(`Attack +${applied.atk}`);
        if (applied.def > 0) incs.push(`Defense +${applied.def}`);
        if (applied.spe > 0) incs.push(`Speed +${applied.spe}`);
        if (applied.luc > 0) incs.push(`Luck +${applied.luc}`);
        const incLine = incs.length ? incs.join(', ') : 'No stat increases';
        lines.push(`Level up! LV ${this.level} - ${incLine}.`);
      }
      return lines.join('\n');
    },

    enforceCaps() {
      this.stats.maxHp = Math.min(60, Math.max(1, Math.floor(this.stats.maxHp)));
      this.stats.atk = Math.min(30, Math.max(0, Math.floor(this.stats.atk)));
      this.stats.def = Math.min(30, Math.max(0, Math.floor(this.stats.def)));
      this.stats.spe = Math.min(30, Math.max(0, Math.floor(this.stats.spe)));
      this.stats.luc = Math.min(30, Math.max(0, Math.floor(this.stats.luc)));
      this.hp = Math.min(this.stats.maxHp, Math.max(0, Math.floor(this.hp)));
    },
  });
}