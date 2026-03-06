import { State } from './constants.js';

export function installStateflow(Game) {
  Object.assign(Game.prototype, {
    // ---------- STATE FLOW ----------
    startTitle() {
      this.current = State.TITLE;
      this.stopEnemyAnim();
      this.isNamePromptOpen = false;
      this.playMusic && this.playMusic('title');
      this.render();
      this.syncDevConsole();
    },

    startCutscene() {
      this.current = State.CUTSCENE;
      this.cutIndex = 0;
      // Reset paging state for cutscene
      this.cutscenePages = null;
      this.cutscenePageIndex = 0;
      this.stopEnemyAnim();
      this.render();
      this.syncDevConsole();
    },

    advanceCutscene() {
      // If name prompt is active, do not advance cutscene
      if (this.isNamePromptOpen) return;

      // If current line is paged, advance within pages first
      const text = (Array.isArray(this.cutsceneLines) ? this.cutsceneLines[this.cutIndex] : '') || '';
      let pages = Array.isArray(this.cutscenePages) ? this.cutscenePages : null;
      // Ensure pages exist based on current layout
      if ((!pages || !pages.length) && typeof this.computePagedDialogue === 'function') {
        pages = this.computePagedDialogue(text);
        this.cutscenePages = pages;
      }
      if (pages && pages.length > 1 && (Number(this.cutscenePageIndex) || 0) < pages.length - 1) {
        this.cutscenePageIndex = (Number(this.cutscenePageIndex) || 0) + 1;
        this.render();
        return;
      }

      // Otherwise, go to next line
      this.cutscenePages = null;
      this.cutscenePageIndex = 0;
      this.cutIndex++;
      if (this.cutIndex >= (this.cutsceneLines?.length || 0)) {
        this.startOverworld();
      } else {
        this.render();
      }
    },

    startOverworld() {
      this.current = State.OVERWORLD;
      this.combatMessage = '';
      this.stopEnemyAnim();
      this.closeItemMenu();
      this.closeShopMenu();
      this.closeEquipMenu();
      // Ensure the camera recenters on the player when entering overworld
      this.cameraX0 = null;
      this.cameraY0 = null;
      this.playMusic && this.playMusic('overworld');
      this.render();
      this.syncDevConsole();
    },

    // Post-combat paging and outcome routing (including final boss -> Good Ending)
    resolvePostCombat() {
      const outcome = this.awaitContinue;

      if (outcome === 'turn') {
        // If the currently displayed turn page has been further paginated to fit the 5-line box,
        // advance within that wrapped text first before moving to the next logical combat page.
        if (Array.isArray(this._combatWrapPages) && this._combatWrapPages.length > 1) {
          const wi = Math.max(0, Number(this._combatWrapIndex) || 0);
          if (wi < this._combatWrapPages.length - 1) {
            this._combatWrapIndex = wi + 1;
            // Re-render with the next wrapped segment of the same logical message
            this.renderCombatMessage();
            this.updateChoicesVisibility();
            return;
          }
          // Finished wrapping for this logical page; clear wrap state and continue below
          this._combatWrapPages = null;
          this._combatWrapIndex = 0;
          this._combatWrapBase = null;
        }

        const pages = Array.isArray(this.combatPages) ? this.combatPages : null;
        const idx = Number(this.combatPageIndex) || 0;

        // Advance within the current turn pages
        if (pages && idx < pages.length - 1) {
          this.combatPageIndex = idx + 1;
          // Apply side-effects for this page so HP/SP bars and shakes match the message
          if (typeof this._applyCombatPageEffect === 'function') {
            this._applyCombatPageEffect(this.combatPageIndex);
          }
          this.combatMessage = pages[this.combatPageIndex] || '';
          this.renderCombatMessage();
          this.updateChoicesVisibility();
          return;
        }

        // Finished paging this turn
        this.combatPages = null;
        this.combatPageEffects = null;
        this.combatPageApplied = null;
        this.combatPageIndex = 0;

        // If battle ended during the last page's effect, route to outcome now
        if (this._pendingEnd) {
          const end = this._pendingEnd;
          this._pendingEnd = null;
          this.finishCombat(end);
          return;
        }

        // Otherwise, advance to next turn and prompt
        this.awaitContinue = null;
        if (this._advanceTurnAfterPages) {
          this._advanceTurnAfterPages = false;
          this.turn += 1;
          if (typeof this.decayCombatBuffs === 'function') this.decayCombatBuffs();
          if (this.flexBuffTurn !== null && this.flexBuffTurn < this.turn) {
            this.flexBuffTurn = null;
          }
        }

        this.combatMessage = 'What will you do?';
        this.renderStatus();
        this.renderCombatMessage();
        this.updateChoicesVisibility();
        return;
      } else if (outcome === 'post') {
        if (Array.isArray(this.postCombatPages)) {
          this.postCombatPageIndex += 1;
          if (this.postCombatPageIndex < this.postCombatPages.length) {
            this.combatMessage = this.postCombatPages[this.postCombatPageIndex] || '';
            this.renderCombatMessage();
            return;
          }
        }
        this.postCombatPages = null;
        this.postCombatPageIndex = 0;
        this.awaitContinue = 'win';
        this.updateChoicesVisibility();
      } else {
        this.awaitContinue = null;
      }

      if (outcome === 'win' || this.awaitContinue === 'win') {
        const pendingGood = !!this._finalWinPendingGoodEnding;
        this._finalWinPendingGoodEnding = false;
        this.isFinalBossBattle = false;
        this.enemy = null;
        if (pendingGood) {
          this.startGoodEnding();
        } else {
          this.startOverworld();
        }
        return;
      }
      if (outcome === 'run') {
        this.enemy = null;
        this.startOverworld();
        return;
      }
      if (outcome === 'lose') {
        this.enemy = null;
        this.restartDemo();
        return;
      }
    },

    // ---------- GOOD ENDING ----------
    startGoodEnding() {
      this.current = State.GOOD_ENDING;
      this.goodEndingIndex = 0;
      this.goodEndingLines = [
        'GOOD ENDING\\n\\nYou have defeated the Necromancer and brought peace to the land.',
        'Director: curtisahuang',
        'Spritework: curtisahuang, Midjourney, henrysoftware',
        'Programming: Cosine',
        'Thank you for playing!'
      ];
      // Reset paging for good ending
      this.goodEndingPages = null;
      this.goodEndingPageIndex = 0;

      this.stopEnemyAnim();
      this.stopMusic && this.stopMusic();
      this.render();
      this.syncDevConsole();
    },

    advanceGoodEnding() {
      // Page within a single good ending entry if needed
      const lines = Array.isArray(this.goodEndingLines) ? this.goodEndingLines : [];
      const idx = Math.max(0, Math.min(lines.length - 1, Number(this.goodEndingIndex) || 0));
      const text = lines[idx] || '';
      let pages = Array.isArray(this.goodEndingPages) ? this.goodEndingPages : null;
      if ((!pages || !pages.length) && typeof this.computePagedDialogue === 'function') {
        pages = this.computePagedDialogue(text);
        this.goodEndingPages = pages;
      }
      if (pages && pages.length > 1 && (Number(this.goodEndingPageIndex) || 0) < pages.length - 1) {
        this.goodEndingPageIndex = (Number(this.goodEndingPageIndex) || 0) + 1;
        this.render();
        return;
      }

      // Otherwise advance to next line
      this.goodEndingPages = null;
      this.goodEndingPageIndex = 0;

      this.goodEndingIndex = (Number(this.goodEndingIndex) || 0) + 1;
      if (!Array.isArray(this.goodEndingLines) || this.goodEndingIndex >= this.goodEndingLines.length) {
        this.restartDemo();
      } else {
        this.render();
      }
    },

    restartDemo() {
      // Reset core stats to their starting values
      if (this._baseStats) {
        this.stats = { ...this._baseStats };
      } else {
        // Fallback: clear XP/Gold if no snapshot exists
        this.stats.xp = 0;
        this.stats.gold = 0;
      }
      this.level = 1;
      this.hp = this.stats.maxHp;
      this._lastHp = this.hp;
      this._lastEnemyHp = null;

      // Reset SP to full
      this.sp = this.spMax;
      this._lastSp = this.sp;

      this.combatBuffs = { atk: 0, def: 0, spe: 0, luc: 0 };
      this.rewardMult = { xp: 1, gold: 1 };
      this.rewardMultLeft = { xp: 0, gold: 0 };

      if (Array.isArray(this.divineItemIds)) {
        this.templeInventory = {};
        for (const id of this.divineItemIds) {
          this.templeInventory[id] = 1;
        }
      }

      this.equipmentInventory = { iron_sword: 1 };
      this.equipment = { weapon: 'iron_sword', armor: null, accessory: null };
      this.closeEquipMenu();

      this.generateWorld();
      this.placePlayerOnLand();
      // Reset camera so it recenters after restarting
      this.cameraX0 = null;
      this.cameraY0 = null;
      // Return to title screen on restart
      this.startTitle();
    },

    endDemo() {
      // Legacy hook: route to Castle prompt instead of showing a demo-complete dialog
      this.startShop('castle');
    },
  });
}