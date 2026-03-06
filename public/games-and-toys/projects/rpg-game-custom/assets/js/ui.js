import { State } from './constants.js';
import { int, clamp } from './utils.js';

export function installUI(Game) {
  Object.assign(Game.prototype, {
    // ---------- UI ----------
    buildUI() {
      this.root.innerHTML = `
        <div id="map"></div>

        <div id="title">
          <div class="title-panel">
            <div class="game-title">Reign of the Necromancer</div>
            <div class="title-hint">Press Spacebar/Click to continue</div>
          </div>
        </div>

        <div id="ow-status" class="ow-status hidden"></div>

        <div id="dialogue">
          <div class="dialogue-box">
            <div class="dialogue-text"></div>
            <div class="dialogue-hint">Space/Click to continue</div>
          </div>
        </div>

        <div id="combat" class="hidden">
          <div id="statusbar">
            <span class="label">Status</span>
            <div class="sb-group lv"><span class="sb-label">LV</span><strong id="lv-val">1</strong></div>
            <div class="hp-block">
              <div class="bar-row">
                <span>HP:</span>
                <div id="hpbar-player" class="hpbar">
                  <div class="missing"></div>
                  <div class="text"><strong id="hp-val">25/25</strong></div>
                </div>
              </div>
              <div class="bar-row">
                <span>SP:</span>
                <div id="spbar-player" class="hpbar spbar">
                  <div class="missing"></div>
                  <div class="text"><strong id="sp-val">20/20</strong></div>
                </div>
              </div>
            </div>
            <div class="sb-group col exg"><span class="sb-label">EXP</span><strong id="exp-val">0</strong></div>
            <div class="sb-group col gold"><span class="sb-label">Gold</span><strong id="gold-val">0</strong></div>
          </div>
          <div class="combat-display">
            <div class="monster" aria-label="Blue monster placeholder"></div>
            <div id="enemy-hpbar" class="enemy-hpbar hpbar hidden"><div class="missing"></div></div>
            <div class="combat-message"></div>
            <div id="item-menu" class="hidden">
              <div class="menu-panel">
                <div class="menu-title">Items</div>
                <div class="menu-list"></div>
                <div class="menu-hint">Up/Down to select, Enter to use, Esc to cancel</div>
              </div>
            </div>
          </div>
          <div class="choices">
            <div class="choice" data-idx="0">Attack</div>
            <div class="choice" data-idx="1">Flex</div>
            <div class="choice" data-idx="2">Items</div>
            <div class="choice" data-idx="3">Run</div>
          </div>
        </div>

        <div id="shop" class="hidden">
          <div class="shop-content">
            <div class="shop-banner" aria-hidden="true"></div>
            <div class="shop-message"></div>
            <div class="shop-choices">
              <div class="choice shop-choice" data-idx="0">Talk</div>
              <div class="choice shop-choice" data-idx="1">Buy</div>
              <div class="choice shop-choice" data-idx="2">Leave</div>
              <div class="choice shop-choice" data-idx="3">Leave</div>
            </div>
            <div id="shop-menu" class="hidden">
              <div class="menu-panel">
                <div class="menu-title">Shop</div>
                <div class="menu-list"></div>
                <div class="menu-hint">Up/Down to select, Enter to buy, Esc to cancel</div>
              </div>
            </div>
          </div>
        </div>

        <div id="equip-menu" class="hidden">
          <div class="menu-panel">
            <div class="menu-title">Equipment</div>
            <div class="menu-list"></div>
            <div class="menu-hint">Up/Down to select, Enter to equip, Esc to cancel</div>
          </div>
        </div>

        <div id="name-prompt" class="hidden">
          <div class="menu-panel">
            <div class="menu-title">What is your name?</div>
            <div class="dev-row">
              <input id="name-input" type="text" class="input" maxlength="18" placeholder="Enter your hero name" data-1p-ignore/>
              <button id="name-random">Random</button>
            </div>
            <div class="dev-row">
              <button id="name-confirm" class="primary">Start Adventure</button>
            </div>
            <div class="menu-hint">Tip: Press Enter to confirm</div>
          </div>
        </div>

        <div id="hints" class="hint">
          <div>Press \` to toggle Dev Console</div>
          <div>Press H to toggle Hints</div>
          <div>Press S to toggle Status</div>
          <div>Press E to change Equipment</div>
          <div>Press M to toggle Music</div>
        </div>
        <div id="dev-console" class="hidden"></div>
      `;

      this.$ = {};
      this.$.map = this.root.querySelector('#map');
      this.$.title = this.root.querySelector('#title');
      this.$.dialogue = this.root.querySelector('#dialogue');
      this.$.dialogueText = this.root.querySelector('.dialogue-text');
      this.$.combat = this.root.querySelector('#combat');
      this.$.lv = this.root.querySelector('#lv-val');
      this.$.hp = this.root.querySelector('#hp-val');
      this.$.sp = this.root.querySelector('#sp-val');
      this.$.exp = this.root.querySelector('#exp-val');
      this.$.gold = this.root.querySelector('#gold-val');
      this.$.combatMsg = this.root.querySelector('.combat-message');
      this.$.choices = Array.from(this.root.querySelectorAll('#combat .choice'));
      this.$.choicesWrap = this.root.querySelector('#combat .choices');
      this.$.devToggle = this.root.querySelector('#dev-toggle');
      this.$.devPanel = this.root.querySelector('#dev-console');
      this.$.monster = this.root.querySelector('.monster');
      this.$.enemyHpBar = this.root.querySelector('#enemy-hpbar');
      this.$.enemyHpMissing = this.root.querySelector('#enemy-hpbar .missing');
      this.$.hpBarPlayer = this.root.querySelector('#hpbar-player');
      this.$.hpBarPlayerMissing = this.root.querySelector('#hpbar-player .missing');
      this.$.spBarPlayer = this.root.querySelector('#spbar-player');
      this.$.spBarPlayerMissing = this.root.querySelector('#spbar-player .missing');
      this.$.hints = this.root.querySelector('#hints');
      
      this.$.itemMenu = this.root.querySelector('#item-menu');
      this.$.itemList = this.root.querySelector('#item-menu .menu-list');
      this.$.owStatus = this.root.querySelector('#ow-status');
      this.$.equipMenu = this.root.querySelector('#equip-menu');
      this.$.equipList = this.root.querySelector('#equip-menu .menu-list');

      // Name prompt refs
      this.$.namePrompt = this.root.querySelector('#name-prompt');
      this.$.nameInput = this.root.querySelector('#name-input');
      this.$.nameRandom = this.root.querySelector('#name-random');
      this.$.nameConfirm = this.root.querySelector('#name-confirm');

      // Shop UI refs
      this.$.shop = this.root.querySelector('#shop');
      this.$.shopMsg = this.root.querySelector('#shop .shop-message');
      this.$.shopChoicesWrap = this.root.querySelector('#shop .shop-choices');
      this.$.shopChoices = Array.from(this.root.querySelectorAll('#shop .shop-choice'));
      this.$.shopMenu = this.root.querySelector('#shop-menu');
      this.$.shopList = this.root.querySelector('#shop-menu .menu-list');
      this.$.shopBanner = this.root.querySelector('#shop .shop-banner');

      this.$.dialogue.addEventListener('click', (e) => {
        // click-to-advance is handled globally
      });

      if (this.$.title) {
        this.$.title.addEventListener('click', () => {
          if (this.current === State.TITLE && !this.isNamePromptOpen) {
            this.showNamePrompt();
          }
        });
      }

      this.$.choices.forEach(el => {
        el.addEventListener('click', () => {
          if (this.current !== State.COMBAT || this.awaitContinue || this.isTyping || this.itemMenuOpen) return;
          const idx = Number(el.dataset.idx);
          this.choiceIndex = idx;
          this.confirmChoice();
        });
      });

      // Name prompt interactions
      if (this.$.nameRandom) {
        this.$.nameRandom.addEventListener('click', () => {
          const n = this.getRandomHeroName();
          if (this.$.nameInput) {
            this.$.nameInput.value = n;
            this.$.nameInput.focus();
            this.$.nameInput.select();
          }
        });
      }
      if (this.$.nameConfirm) {
        this.$.nameConfirm.addEventListener('click', (e) => {
          e.stopPropagation();
          this.confirmPlayerName();
        });
      }
      if (this.$.nameInput) {
        this.$.nameInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            this.confirmPlayerName();
            e.preventDefault();
          }
        });
      }

      // Click anywhere in the combat panel to skip typing or continue after battle
      if (this.$.combat) {
        this.$.combat.addEventListener('click', () => {
          if (this.current !== State.COMBAT) return;
          if (this.isTyping) {
            this.skipTyping();
            return;
          }
          if (this.awaitContinue) {
            this.resolvePostCombat();
          }
        });
      }

      // Shop interaction handlers
      if (this.$.shopChoices) {
        this.$.shopChoices.forEach(el => {
          el.addEventListener('click', () => {
            if (this.current !== State.SHOP || this.shopAwaitContinue) return;
            const idx = Number(el.dataset.idx);
            this.shopChoiceIndex = idx;
            this.confirmShopChoice();
          });
        });
      }
      if (this.$.shop) {
        this.$.shop.addEventListener('click', () => {
          if (this.current !== State.SHOP) return;
          if (this.shopAwaitContinue) {
            if (typeof this.advanceShopDialogue === 'function') {
              this.advanceShopDialogue();
            } else {
              // Fallback: single-page dismiss
              this.shopAwaitContinue = false;
              this.shopMessage = '';
              this.renderShopMessage();
              this.updateShopChoicesVisibility();
            }
          }
        });
      }

      // Click to select item in the item menu
      if (this.$.itemMenu) {
        this.$.itemMenu.addEventListener('click', (e) => {
          if (!this.itemMenuOpen) return;
          const row = e.target.closest('.item-row');
          if (!row) return;
          if (row.dataset.cancel) {
            this.closeItemMenu();
            return;
          }
          const id = row.dataset.id;
          if (id) {
            this.useItemInCombat(id);
          }
        });
      }

      // Click to select item in the shop buy menu
      if (this.$.shopMenu) {
        this.$.shopMenu.addEventListener('click', (e) => {
          if (!this.shopBuyOpen) return;
          if (this.shopAwaitContinue) {
            this.shopAwaitContinue = false;
            this.shopMessage = '';
            this.renderShopMessage();
            this.updateShopChoicesVisibility();
            e.preventDefault();
            return;
          }
          const row = e.target.closest('.item-row');
          if (!row) return;
          if (row.dataset.cancel) {
            this.closeShopMenu();
            return;
          }
          const id = row.dataset.id;
          if (id) {
            const mode = String(this.shopMenuMode || 'buy');
            if (mode === 'learn') {
              this.selectTempleLore(id);
            } else {
              this.purchaseShopItem(id);
            }
          }
        });
      }

      // Click to equip gear in the equipment menu (overworld)
      if (this.$.equipMenu) {
        this.$.equipMenu.addEventListener('click', (e) => {
          if (!this.equipMenuOpen) return;
          const row = e.target.closest('.item-row');
          if (!row) return;
          if (row.dataset.cancel) {
            this.closeEquipMenu();
            return;
          }
          const id = row.dataset.id;
          if (id) {
            this.equipEquipment(id);
          }
        });
      }

      this.buildDevConsole();

      // Apply default icon theme classes
      if (this.updateIconThemeClasses) this.updateIconThemeClasses();
    },

    // ---------- NAME PROMPT ----------
    showNamePrompt() {
      this.isNamePromptOpen = true;
      this.renderNamePrompt();
      // Also refresh full render so the title screen hides while the prompt is visible
      this.render();
      if (this.$.nameInput) {
        // Prefill with previous name on restart, otherwise a random hero name on first boot
        const cur = String(this.playerName || '').trim();
        const initial = cur || this.getRandomHeroName();
        this.$.nameInput.value = initial;
        // Defer focus/select to avoid the opening key (e.g., Space) inserting a character
        setTimeout(() => {
          if (!this.$.nameInput) return;
          this.$.nameInput.focus();
          this.$.nameInput.select();
        }, 0);
      }
    },
    hideNamePrompt() {
      this.isNamePromptOpen = false;
      this.renderNamePrompt();
    },
    renderNamePrompt() {
      if (!this.$.namePrompt) return;
      const show = (this.current === State.CUTSCENE || this.current === State.TITLE) && !!this.isNamePromptOpen;
      this.$.namePrompt.classList.toggle('hidden', !show);
    },
    getRandomHeroName() {
      const arr = Array.isArray(this.randomHeroNames) ? this.randomHeroNames : [];
      if (!arr.length) return 'Hero';
      const idx = Math.floor(Math.random() * arr.length);
      return String(arr[idx] || 'Hero');
    },
    confirmPlayerName() {
      let name = String(this.$.nameInput?.value ?? '').trim();
      if (!name) name = 'Hero';
      const maxLen = Math.max(1, Number(this.nameMaxLength) || 18);
      if (name.length > maxLen) name = name.slice(0, maxLen);
      this.playerName = name;

      // Reset core stats when starting a new game from Title
      if (this._baseStats) {
        this.stats = { ...this._baseStats };
        this.level = 1;
        this.hp = this.stats.maxHp;
        this._lastHp = this.hp;
        this._lastEnemyHp = null;
        // Reset SP as well
        this.sp = this.spMax;
        this._lastSp = this.sp;
      }

      // Personalize the last intro line
      if (Array.isArray(this.cutsceneLines) && this.cutsceneLines.length) {
        const lastIdx = this.cutsceneLines.length - 1;
        const base = 'Show us what you have';
        this.cutsceneLines[lastIdx] = `${base}, ${this.playerName}!`;
      }
      this.hideNamePrompt();
      // After confirming the name from the title flow, begin the intro cutscene
      if (typeof this.startCutscene === 'function') {
        this.startCutscene();
      } else {
        this.render();
      }
    },

    buildDevConsole() {
      const panel = this.$.devPanel;
      panel.classList.add('dev-console');
      panel.innerHTML = `
        <div class="dev-title">Developer Console</div>

        <div class="section dev-grid">
          <div class="dev-row">
            <label>State</label>
            <select id="dev-state">
              <option value="${State.TITLE}">Title</option>
              <option value="${State.CUTSCENE}">Cutscene</option>
              <option value="${State.OVERWORLD}">Overworld</option>
              <option value="${State.SHOP}">Shop</option>
              <option value="${State.COMBAT}">Combat</option>
            </select>
          </div>
          

          <div class="dev-row-3">
            <div>
              <label>Forest Encounter %</label>
              <input id="dev-forest-chance" type="number" min="0" max="100" step="1" class="input"/>
            </div>
            <div>
              <label>Land Encounter %</label>
              <input id="dev-land-chance" type="number" min="0" max="100" step="1" class="input"/>
            </div>
            <div>
              <label>Base %</label>
              <input id="dev-base-chance" type="number" min="0" max="200" step="1" class="input"/>
            </div>
          </div>
          <div class="dev-row">
            <div>
              <label>Swamp Encounter %</label>
              <input id="dev-swamp-chance" type="number" min="0" max="100" step="1" class="input"/>
            </div>
          </div>
          <div class="dev-row">
            <button id="dev-apply" class="primary">Apply</button>
          </div>

          <div class="dev-row-4">
            <button id="dev-open-shop">Open Shop</button>
            <button id="dev-open-smith">Open Blacksmith</button>
            <button id="dev-open-temple">Open Temple</button>
            <button id="dev-open-inn">Open Inn</button>
          </div>
          <div class="dev-row-4">
            <button id="dev-tp-shop">Teleport Shop</button>
            <button id="dev-tp-smith">Teleport Smith</button>
            <button id="dev-tp-temple">Teleport Temple</button>
            <button id="dev-tp-goal">Teleport Goal</button>
          </div>
        </div>

        <details class="section dev-grid" open>
          <summary class="dev-title">Player Stats</summary>
          <div class="dev-row-3">
            <div>
              <label>Max HP</label>
              <input id="dev-maxhp" type="number" min="1" max="60" class="input"/>
            </div>
            <div>
              <label>ATK</label>
              <input id="dev-atk" type="number" min="0" max="30" class="input"/>
            </div>
            <div>
              <label>DEF</label>
              <input id="dev-def" type="number" min="0" max="30" class="input"/>
            </div>
          </div>
          <div class="dev-row-3">
            <div>
              <label>SPE</label>
              <input id="dev-spe" type="number" min="0" max="30" class="input"/>
            </div>
            <div>
              <label>LUC</label>
              <input id="dev-luc" type="number" min="0" max="30" class="input"/>
            </div>
            <div>
              <label>Gold</label>
              <input id="dev-gold" type="number" min="0" max="999999" class="input"/>
            </div>
          </div>
          <div class="dev-row">
            <label>EXP</label>
            <input id="dev-xp" type="number" min="0" max="999999" class="input"/>
          </div>
        </details>

        <details class="section dev-grid">
          <summary class="dev-title">Inventory</summary>
          <div id="dev-items" class="dev-scroll"></div>
          <div class="dev-row">
            <button id="dev-items-apply" class="primary">Apply Items</button>
          </div>
          <div class="dev-row-3">
            <div>
              <label>Add Item</label>
              <select id="dev-item-add-select"></select>
            </div>
            <div>
              <label>Qty</label>
              <input id="dev-item-add-count" type="number" min="1" max="999" class="input" />
            </div>
            <div style="align-self:end;">
              <button id="dev-item-add-btn">Add</button>
            </div>
          </div>
        </details>

        <details class="section dev-grid">
          <summary class="dev-title">Equipment</summary>
          <div class="dev-row">
            <label>Weapon</label>
            <select id="dev-weapon-select" class="input"></select>
          </div>
          <div class="dev-row">
            <button id="dev-weapon-equip" class="primary">Equip</button>
            <button id="dev-weapon-unequip">Unequip</button>
          </div>
          <div class="dev-row">
            <label>Armor</label>
            <select id="dev-armor-select" class="input"></select>
          </div>
          <div class="dev-row">
            <button id="dev-armor-equip" class="primary">Equip</button>
            <button id="dev-armor-unequip">Unequip</button>
          </div>
          <div class="dev-row">
            <label>Accessory</label>
            <select id="dev-accessory-select" class="input"></select>
          </div>
          <div class="dev-row">
            <button id="dev-accessory-equip" class="primary">Equip</button>
            <button id="dev-accessory-unequip">Unequip</button>
          </div>
          <div class="dev-row-3">
            <div>
              <label>Add Equipment</label>
              <select id="dev-equip-add-select" class="input"></select>
            </div>
            <div>
              <label>Qty</label>
              <input id="dev-equip-add-count" type="number" min="1" max="99" class="input"/>
            </div>
            <div style="align-self:end;">
              <button id="dev-equip-add-btn">Add</button>
            </div>
          </div>
        </details>

        <details class="section dev-grid">
          <summary class="dev-title">Actions</summary>
          <div class="dev-row">
            <div>
              <label>Enemy</label>
              <select id="dev-enemy-select" class="input"></select>
            </div>
            <div style="align-self:end;">
              <button id="dev-enemy-spawn" class="primary">Spawn Enemy</button>
            </div>
          </div>
          <div class="dev-row">
            <button id="dev-to-cutscene">Go Cutscene</button>
            <button id="dev-to-overworld">Go Overworld</button>
          </div>
          <div class="dev-row">
            <button id="dev-to-combat">Start Combat</button>
            <button id="dev-win" class="primary">Force Win</button>
          </div>
          <div class="dev-row">
            <button id="dev-run">Force Run</button>
            <button id="dev-restart" class="warn">Restart Demo</button>
          </div>
        </details>

        <div class="section">
          <small>Tip: Press the grave/backtick key (\`) to toggle this console.</small>
        </div>
      `;

      const $ = (id) => panel.querySelector(id);
      this.$dev = {
        state: this.$.devPanel.querySelector('#dev-state'),
        forestChance: this.$.devPanel.querySelector('#dev-forest-chance'),
        landChance: this.$.devPanel.querySelector('#dev-land-chance'),
        baseChance: this.$.devPanel.querySelector('#dev-base-chance'),
        swampChance: this.$.devPanel.querySelector('#dev-swamp-chance'),
        // Quick visit + teleport
        openShop: this.$.devPanel.querySelector('#dev-open-shop'),
        openSmith: this.$.devPanel.querySelector('#dev-open-smith'),
        openTemple: this.$.devPanel.querySelector('#dev-open-temple'),
        openInn: this.$.devPanel.querySelector('#dev-open-inn'),
        tpShop: this.$.devPanel.querySelector('#dev-tp-shop'),
        tpSmith: this.$.devPanel.querySelector('#dev-tp-smith'),
        tpTemple: this.$.devPanel.querySelector('#dev-tp-temple'),
        tpGoal: this.$.devPanel.querySelector('#dev-tp-goal'),
        // Stats
        maxhp: this.$.devPanel.querySelector('#dev-maxhp'),
        atk: this.$.devPanel.querySelector('#dev-atk'),
        def: this.$.devPanel.querySelector('#dev-def'),
        spe: this.$.devPanel.querySelector('#dev-spe'),
        luc: this.$.devPanel.querySelector('#dev-luc'),
        xp: this.$.devPanel.querySelector('#dev-xp'),
        gold: this.$.devPanel.querySelector('#dev-gold'),
        // Inventory controls
        items: this.$.devPanel.querySelector('#dev-items'),
        itemsApply: this.$.devPanel.querySelector('#dev-items-apply'),
        itemAddSelect: this.$.devPanel.querySelector('#dev-item-add-select'),
        itemAddCount: this.$.devPanel.querySelector('#dev-item-add-count'),
        itemAddBtn: this.$.devPanel.querySelector('#dev-item-add-btn'),
        // Equipment controls
        weaponSelect: this.$.devPanel.querySelector('#dev-weapon-select'),
        weaponEquip: this.$.devPanel.querySelector('#dev-weapon-equip'),
        weaponUnequip: this.$.devPanel.querySelector('#dev-weapon-unequip'),
        armorSelect: this.$.devPanel.querySelector('#dev-armor-select'),
        armorEquip: this.$.devPanel.querySelector('#dev-armor-equip'),
        armorUnequip: this.$.devPanel.querySelector('#dev-armor-unequip'),
        accessorySelect: this.$.devPanel.querySelector('#dev-accessory-select'),
        accessoryEquip: this.$.devPanel.querySelector('#dev-accessory-equip'),
        accessoryUnequip: this.$.devPanel.querySelector('#dev-accessory-unequip'),
        equipAddSelect: this.$.devPanel.querySelector('#dev-equip-add-select'),
        equipAddCount: this.$.devPanel.querySelector('#dev-equip-add-count'),
        equipAddBtn: this.$.devPanel.querySelector('#dev-equip-add-btn'),
        // Actions
        apply: this.$.devPanel.querySelector('#dev-apply'),
        toCut: this.$.devPanel.querySelector('#dev-to-cutscene'),
        toOver: this.$.devPanel.querySelector('#dev-to-overworld'),
        toCombat: this.$.devPanel.querySelector('#dev-to-combat'),
        win: this.$.devPanel.querySelector('#dev-win'),
        run: this.$.devPanel.querySelector('#dev-run'),
        restart: this.$.devPanel.querySelector('#dev-restart'),
      };

      // Populate initial values
      this.syncDevConsole();

      this.$dev.apply?.addEventListener('click', () => {

        // Player stats (apply requested values, then enforce global caps)
        if (this.$dev.maxhp) this.stats.maxHp = clamp(int(this.$dev.maxhp.value, this.stats.maxHp), 1, 60);
        if (this.$dev.atk) this.stats.atk = clamp(int(this.$dev.atk.value, this.stats.atk), 0, 30);
        if (this.$dev.def) this.stats.def = clamp(int(this.$dev.def.value, this.stats.def), 0, 30);
        if (this.$dev.spe) this.stats.spe = clamp(int(this.$dev.spe.value, this.stats.spe), 0, 30);
        if (this.$dev.luc) this.stats.luc = clamp(int(this.$dev.luc.value, this.stats.luc), 0, 30);
        if (this.$dev.xp) this.stats.xp = clamp(int(this.$dev.xp.value, this.stats.xp), 0, 999999);
        if (this.$dev.gold) this.stats.gold = clamp(int(this.$dev.gold.value, this.stats.gold), 0, 999999);

        // Recompute level from XP for consistency with dev changes
        this.level = this.computeLevelFromXp(this.stats.xp);

        // Enforce caps and clamp HP to max
        this.enforceCaps();

        // Encounter probabilities (percent inputs -> decimal)
        if (this.$dev.forestChance) {
          const fPct = clamp(int(this.$dev.forestChance.value, Math.round(this.encounterChanceForest * 100)), 0, 100);
          this.encounterChanceForest = fPct / 100;
        }
        if (this.$dev.landChance) {
          const lPct = clamp(int(this.$dev.landChance.value, Math.round(this.encounterChanceLand * 100)), 0, 100);
          this.encounterChanceLand = lPct / 100;
        }
        if (this.$dev.swampChance) {
          const sPct = clamp(int(this.$dev.swampChance.value, Math.round(this.encounterChanceSwamp * 100)), 0, 100);
          this.encounterChanceSwamp = sPct / 100;
        }
        if (this.$dev.baseChance) {
          const bPct = clamp(int(this.$dev.baseChance.value, Math.round(this.encounterBase * 100)), 0, 200);
          this.encounterBase = bPct / 100;
        }

        const st = this.$dev.state.value;
        if (st !== this.current) {
          if (st === State.TITLE) this.startTitle?.();
          if (st === State.CUTSCENE) this.startCutscene();
          if (st === State.OVERWORLD) this.startOverworld();
          if (st === State.SHOP) this.startShop();
          if (st === State.COMBAT) this.startCombat();
        }
        this.render();
        this.syncDevConsole();
      });

      // Quick visit (open overlays immediately)
      this.$dev.openShop?.addEventListener('click', () => this.startShop('shop'));
      this.$dev.openSmith?.addEventListener('click', () => this.startShop('blacksmith'));
      this.$dev.openTemple?.addEventListener('click', () => this.startShop('temple'));
      this.$dev.openInn?.addEventListener('click', () => this.startShop('inn'));

      // Teleport helpers
      const tpTo = (pt) => {
        if (!pt) return;
        if (this.inBounds(pt.x, pt.y)) {
          this.player.x = pt.x;
          this.player.y = pt.y;
          this.startOverworld();
        }
      };

      this.$dev.tpShop?.addEventListener('click', () => {
        const p = this.shop || this.findTileCoordsByType?.('shop');
        tpTo(p);
      });
      this.$dev.tpSmith?.addEventListener('click', () => {
        const p = this.blacksmith || this.findTileCoordsByType?.('smith');
        tpTo(p);
      });
      this.$dev.tpTemple?.addEventListener('click', () => {
        const p = this.temple || this.findTileCoordsByType?.('temple');
        tpTo(p);
      });
      this.$dev.tpGoal?.addEventListener('click', () => {
        const p = this.goal || this.findTileCoordsByType?.('goal');
        tpTo(p);
      });

      this.$dev.toCut?.addEventListener('click', () => this.startCutscene());
      this.$dev.toOver?.addEventListener('click', () => this.startOverworld());
      this.$dev.toCombat?.addEventListener('click', () => this.startCombat());
      this.$dev.win?.addEventListener('click', () => this.finishCombat('win'));
      this.$dev.run?.addEventListener('click', () => this.finishCombat('run'));
      this.$dev.restart?.addEventListener('click', () => this.restartDemo());
      // Spawn specific enemy immediately
      {
        const enemySel = this.$.devPanel.querySelector('#dev-enemy-select');
        const enemyBtn = this.$.devPanel.querySelector('#dev-enemy-spawn');
        if (enemyBtn) {
          enemyBtn.addEventListener('click', () => {
            const id = enemySel?.value;
            if (id) this.startCombat(id);
          });
        }
      }

      // Inventory management
      if (this.$dev.itemsApply) {
        this.$dev.itemsApply.addEventListener('click', () => {
          const qtyInputs = Array.from(this.$.devPanel.querySelectorAll('.dev-item-qty'));
          qtyInputs.forEach(inp => {
            const id = inp.dataset.id;
            const val = clamp(int(inp.value, this.inventory[id] || 0), 0, 999);
            this.inventory[id] = val;
          });
          // Refresh panels that depend on inventory
          this.renderDevItemsPanel();
          this.renderItemMenu();
          this.syncDevConsole();
          this.render();
        });
      }
      if (this.$dev.itemAddBtn) {
        this.$dev.itemAddBtn.addEventListener('click', () => {
          const id = this.$dev.itemAddSelect?.value;
          const cnt = clamp(int(this.$dev.itemAddCount?.value, 1), 1, 999);
          if (id && this.itemDefs[id]) {
            this.inventory[id] = (this.inventory[id] || 0) + cnt;
            this.renderDevItemsPanel();
            this.renderItemMenu();
            this.syncDevConsole();
            this.render();
          }
        });
      }

      // Dev equipment controls
      if (this.$dev.weaponEquip) {
        this.$dev.weaponEquip.addEventListener('click', () => {
          this.devEquipSelectedWeapon();
        });
      }
      if (this.$dev.weaponUnequip) {
        this.$dev.weaponUnequip.addEventListener('click', () => {
          this.devUnequipWeapon();
        });
      }
      if (this.$dev.armorEquip) {
        this.$dev.armorEquip.addEventListener('click', () => {
          this.devEquipSelectedArmor();
        });
      }
      if (this.$dev.armorUnequip) {
        this.$dev.armorUnequip.addEventListener('click', () => {
          this.devUnequipArmor();
        });
      }
      if (this.$dev.accessoryEquip) {
        this.$dev.accessoryEquip.addEventListener('click', () => {
          this.devEquipSelectedAccessory();
        });
      }
      if (this.$dev.accessoryUnequip) {
        this.$dev.accessoryUnequip.addEventListener('click', () => {
          this.devUnequipAccessory();
        });
      }

      // Add equipment to inventory (dev)
      if (this.$dev.equipAddBtn) {
        this.$dev.equipAddBtn.addEventListener('click', () => {
          const id = this.$dev.equipAddSelect?.value;
          const cnt = clamp(int(this.$dev.equipAddCount?.value, 1), 1, 99);
          if (id && this.equipmentDefs?.[id]) {
            this.equipmentInventory = this.equipmentInventory || {};
            this.equipmentInventory[id] = (this.equipmentInventory[id] || 0) + cnt;
            this.populateDevEquipmentSelects();
            this.renderOverworldStatus();
            this.syncDevConsole();
            this.render();
          }
        });
      }

      this.$.devToggle?.addEventListener('click', () => this.toggleDev());
    },

    toggleDev(force) {
      const show = typeof force === 'boolean' ? force : this.$.devPanel.classList.contains('hidden');
      this.$.devPanel.classList.toggle('hidden', !show);
    },

    // Show an overworld pop-up message using dialogue pagination (5-line box)
    showOwEventMessage(fullText) {
      const base = String(fullText || '');
      this.owEventMessageFull = base;
      if (typeof this.computePagedDialogue === 'function' && this.$?.dialogueText) {
        const pages = this.computePagedDialogue(base, 5, this.$.dialogueText);
        this.owEventPages = pages;
        this.owEventPageIndex = 0;
        this.owEventMessage = pages[0] || '';
        this._owEventBase = base;
      } else {
        this.owEventPages = [base];
        this.owEventPageIndex = 0;
        this.owEventMessage = base;
        this._owEventBase = base;
      }
      this.owEventAwaitContinue = true;
      this.render();
    },

    syncDevConsole() {
      if (!this.$dev) return;
      this.enforceCaps();

      this.$dev.state.value = this.current;
      if (this.$dev.forestChance) this.$dev.forestChance.value = Math.round(this.encounterChanceForest * 100);
      if (this.$dev.landChance) this.$dev.landChance.value = Math.round(this.encounterChanceLand * 100);
      if (this.$dev.swampChance) this.$dev.swampChance.value = Math.round(this.encounterChanceSwamp * 100);
      if (this.$dev.baseChance) this.$dev.baseChance.value = Math.round(this.encounterBase * 100);

      // Player stats
      if (this.$dev.maxhp) this.$dev.maxhp.value = this.stats.maxHp;
      if (this.$dev.atk) this.$dev.atk.value = this.stats.atk;
      if (this.$dev.def) this.$dev.def.value = this.stats.def;
      if (this.$dev.spe) this.$dev.spe.value = this.stats.spe;
      if (this.$dev.luc) this.$dev.luc.value = this.stats.luc;
      if (this.$dev.xp) this.$dev.xp.value = this.stats.xp;
      if (this.$dev.gold) this.$dev.gold.value = this.stats.gold;

      // Inventory panel + add selector
      this.renderDevItemsPanel();
      // Equipment selector(s)
      this.populateDevEquipmentSelects();
      // Populate enemy spawn list
      {
        const enemySel = this.$.devPanel.querySelector('#dev-enemy-select');
        if (enemySel) {
          const defs = this.enemyTypes || {};
          const ids = Object.keys(defs);
          const cur = enemySel.value;
          enemySel.innerHTML = ids.map(id => `<option value="${id}">${(defs[id] && defs[id].name) ? defs[id].name : id}</option>`).join('');
          if (cur && ids.includes(cur)) {
            enemySel.value = cur;
          }
        }
      }

      // Populate equipment add select
      if (this.$dev.equipAddSelect) {
        const defs = this.equipmentDefs || {};
        const ids = Object.keys(defs);
        if (ids.length) {
          this.$dev.equipAddSelect.innerHTML = ids.map(id => `<option value="${id}">${defs[id].name}</option>`).join('');
        } else {
          this.$dev.equipAddSelect.innerHTML = `<option value="">(none)</option>`;
        }
        if (this.$dev.equipAddCount && !this.$dev.equipAddCount.value) {
          this.$dev.equipAddCount.value = 1;
        }
      }
    },

    // ---------- RENDER ----------
    render() {
      const showDialogue = this.current === State.CUTSCENE || this.current === State.GOOD_ENDING || !!this.owEventAwaitContinue;
      this.$.dialogue.classList.toggle('hidden', !showDialogue);
      this.$.combat.classList.toggle('hidden', this.current !== State.COMBAT);
      if (this.$.shop) this.$.shop.classList.toggle('hidden', this.current !== State.SHOP);
      if (this.$.title) {
        const showTitle = this.current === State.TITLE && !this.isNamePromptOpen;
        this.$.title.classList.toggle('hidden', !showTitle);
      }

      // Enemy HP bar visibility/layout
      if (this.$.enemyHpBar) {
        const showEnemyHp = this.current === State.COMBAT && !!this.enemy;
        this.$.enemyHpBar.classList.toggle('hidden', !showEnemyHp);
        if (showEnemyHp) {
          this.updateEnemyHpBarLayout();
        }
      }

      if (this.current === State.CUTSCENE) {
        const text = this.cutsceneLines[this.cutIndex] || '';
        const pages = (typeof this.computePagedDialogue === 'function') ? this.computePagedDialogue(text, 5, this.$.dialogueText) : [text];
        this.cutscenePages = pages;
        const pIdx = Math.max(0, Math.min(pages.length - 1, Number(this.cutscenePageIndex) || 0));
        this.$.dialogueText.textContent = pages[pIdx] || '';
      } else if (this.current === State.GOOD_ENDING) {
        const lines = Array.isArray(this.goodEndingLines) ? this.goodEndingLines : [];
        const idx = Math.max(0, Math.min(lines.length - 1, Number(this.goodEndingIndex) || 0));
        const text = lines[idx] || '';
        const pages = (typeof this.computePagedDialogue === 'function') ? this.computePagedDialogue(text, 5, this.$.dialogueText) : [text];
        this.goodEndingPages = pages;
        const pIdx = Math.max(0, Math.min(pages.length - 1, Number(this.goodEndingPageIndex) || 0));
        this.$.dialogueText.textContent = pages[pIdx] || '';
      } else if (this.owEventAwaitContinue) {
        // Overworld pop-up events: paginate using the same logic and 5-line box
        const baseText = String(this.owEventMessageFull || this.owEventMessage || '');
        if (typeof this.computePagedDialogue === 'function') {
          const pages = this.computePagedDialogue(baseText, 5, this.$.dialogueText);
          // Cache pages for input handlers if not already set or base text changed
          const needInit = !Array.isArray(this.owEventPages) || !this.owEventPages.length ||
                           this._owEventBase !== baseText;
          if (needInit) {
            this.owEventPages = pages;
            this.owEventPageIndex = 0;
            this._owEventBase = baseText;
          }
          const pIdx = Math.max(0, Math.min(this.owEventPages.length - 1, Number(this.owEventPageIndex) || 0));
          this.$.dialogueText.textContent = this.owEventPages[pIdx] || '';
        } else {
          this.$.dialogueText.textContent = baseText;
        }
      }

      this.renderNamePrompt();
      this.renderMap();
      this.renderStatus();
      this.renderChoices();
      this.renderCombatMessage();
      this.renderOverworldStatus();

      if (this.current === State.SHOP) {
        this.renderShopMessage();
        this.renderShopChoices();
        this.applyShopBackground();
      }

      if (this.current === State.COMBAT && this.enemy?.sprite) {
        this.applyEnemySprite(this.enemy.sprite);
      }
    },

    renderMap() {
      const container = this.$.map;
      container.innerHTML = '';

      const cols = Math.min(this.viewCols || Math.ceil(window.innerWidth / this.tileSize), this.mapWidth);
      const rows = Math.min(this.viewRows || Math.ceil(window.innerHeight / this.tileSize), this.mapHeight);

      // Deadzone camera:
      // Maintain a top-left camera position (cameraX0, cameraY0) and only move it
      // when the player crosses an inner margin ("deadzone") inside the viewport.
      if (this.cameraX0 == null || this.cameraY0 == null) {
        this.cameraX0 = clamp(this.player.x - Math.floor(cols / 2), 0, Math.max(0, this.mapWidth - cols));
        this.cameraY0 = clamp(this.player.y - Math.floor(rows / 2), 0, Math.max(0, this.mapHeight - rows));
      }

      // Keep camera within bounds (e.g., after a resize)
      this.cameraX0 = clamp(this.cameraX0, 0, Math.max(0, this.mapWidth - cols));
      this.cameraY0 = clamp(this.cameraY0, 0, Math.max(0, this.mapHeight - rows));

      const baseMargin = Number(this.cameraMargin ?? 3);
      const marginX = Math.max(0, Math.min(baseMargin, Math.floor((cols - 1) / 2)));
      const marginY = Math.max(0, Math.min(baseMargin, Math.floor((rows - 1) / 2)));

      // Horizontal deadzone boundaries in world coords
      const left = this.cameraX0 + marginX;
      const right = this.cameraX0 + cols - 1 - marginX;
      if (this.player.x < left) {
        this.cameraX0 = clamp(this.player.x - marginX, 0, Math.max(0, this.mapWidth - cols));
      } else if (this.player.x > right) {
        this.cameraX0 = clamp(this.player.x - (cols - 1 - marginX), 0, Math.max(0, this.mapWidth - cols));
      }

      // Vertical deadzone boundaries in world coords
      const top = this.cameraY0 + marginY;
      const bottom = this.cameraY0 + rows - 1 - marginY;
      if (this.player.y < top) {
        this.cameraY0 = clamp(this.player.y - marginY, 0, Math.max(0, this.mapHeight - rows));
      } else if (this.player.y > bottom) {
        this.cameraY0 = clamp(this.player.y - (rows - 1 - marginY), 0, Math.max(0, this.mapHeight - rows));
      }

      // Safety: ensure the player is inside the current camera window.
      // If not, recenter around the player to avoid off-screen issues on large viewports.
      if (!(this.player.x >= this.cameraX0 && this.player.x < this.cameraX0 + cols)) {
        this.cameraX0 = clamp(this.player.x - Math.floor(cols / 2), 0, Math.max(0, this.mapWidth - cols));
      }
      if (!(this.player.y >= this.cameraY0 && this.player.y < this.cameraY0 + rows)) {
        this.cameraY0 = clamp(this.player.y - Math.floor(rows / 2), 0, Math.max(0, this.mapHeight - rows));
      }

      const x0 = this.cameraX0;
      const y0 = this.cameraY0;

      const grid = document.createElement('div');
      grid.className = 'map-grid';
      grid.style.gridTemplateColumns = `repeat(${cols}, ${this.tileSize}px)`;
      grid.style.gridTemplateRows = `repeat(${rows}, ${this.tileSize}px)`;

      for (let vy = 0; vy < rows; vy++) {
        for (let vx = 0; vx < cols; vx++) {
          const wx = x0 + vx;
          const wy = y0 + vy;
          const tile = document.createElement('div');
          const type = this.getTile(wx, wy);
          tile.className = `tile ${type}`;

          // Dynamic corner rounding:
          // - Coastline (all ground): round corners where both adjacent sides + diagonal are water.
          // - Desert polygon: round corners except where touching another desert (via overlay).
          const tN = this.getTile(wx, wy - 1);
          const tS = this.getTile(wx, wy + 1);
          const tW = this.getTile(wx - 1, wy);
          const tE = this.getTile(wx + 1, wy);
          const isWater = (t) => t === 'water';
          const isDesert = (t) => t === 'desert';
          const isGround = (t) => t !== 'water';
          const R = 6;

          // Coastline rounding (element border radius) for all non-water tiles
          let cTL = 0, cTR = 0, cBR = 0, cBL = 0;
          if (isGround(type)) {
            const waterN = isWater(tN);
            const waterS = isWater(tS);
            const waterW = isWater(tW);
            const waterE = isWater(tE);
            const tNW = this.getTile(wx - 1, wy - 1);
            const tNE = this.getTile(wx + 1, wy - 1);
            const tSW = this.getTile(wx - 1, wy + 1);
            const tSE = this.getTile(wx + 1, wy + 1);
            const waterNW = isWater(tNW);
            const waterNE = isWater(tNE);
            const waterSW = isWater(tSW);
            const waterSE = isWater(tSE);

            if (waterN && waterW && waterNW) cTL = R;
            if (waterN && waterE && waterNE) cTR = R;
            if (waterS && waterE && waterSE) cBR = R;
            if (waterS && waterW && waterSW) cBL = R;
          }

          // Desert polygon rounding (overlay-only)
          let dTL = 0, dTR = 0, dBR = 0, dBL = 0;
          if (isDesert(type)) {
            const nD = isDesert(tN);
            const sD = isDesert(tS);
            const wD = isDesert(tW);
            const eD = isDesert(tE);
            if (!nD && !wD) dTL = R;
            if (!nD && !eD) dTR = R;
            if (!sD && !eD) dBR = R;
            if (!sD && !wD) dBL = R;

            // Provide overlay radii via CSS variables (max of coastline and desert radii)
            tile.style.setProperty('--des-br-tl', `${Math.max(cTL, dTL)}px`);
            tile.style.setProperty('--des-br-tr', `${Math.max(cTR, dTR)}px`);
            tile.style.setProperty('--des-br-br', `${Math.max(cBR, dBR)}px`);
            tile.style.setProperty('--des-br-bl', `${Math.max(cBL, dBL)}px`);
          }

          // Swamp polygon rounding (overlay-only, like desert)
          let sTL = 0, sTR = 0, sBR = 0, sBL = 0;
          if (type === 'swamp') {
            const isSwamp = (t) => t === 'swamp';
            const nS = isSwamp(tN);
            const sS = isSwamp(tS);
            const wS = isSwamp(tW);
            const eS = isSwamp(tE);
            if (!nS && !wS) sTL = R;
            if (!nS && !eS) sTR = R;
            if (!sS && !eS) sBR = R;
            if (!sS && !wS) sBL = R;

            // Provide overlay radii via CSS variables (max of coastline and swamp radii)
            tile.style.setProperty('--swp-br-tl', `${Math.max(cTL, sTL)}px`);
            tile.style.setProperty('--swp-br-tr', `${Math.max(cTR, sTR)}px`);
            tile.style.setProperty('--swp-br-br', `${Math.max(cBR, sBR)}px`);
            tile.style.setProperty('--swp-br-bl', `${Math.max(cBL, sBL)}px`);
          }

          // Apply border radius to element (coastline only)
          tile.style.borderRadius = `${cTL}px ${cTR}px ${cBR}px ${cBL}px`;

          // Water rounding via CSS variables for ::before overlay.
          // Round water corners where both adjacent sides and the diagonal are non-water (ground).
          if (isWater(type)) {
            const tNW = this.getTile(wx - 1, wy - 1);
            const tNE = this.getTile(wx + 1, wy - 1);
            const tSW = this.getTile(wx - 1, wy + 1);
            const tSE = this.getTile(wx + 1, wy + 1);
            const groundN = !isWater(tN);
            const groundS = !isWater(tS);
            const groundW = !isWater(tW);
            const groundE = !isWater(tE);
            const groundNW = !isWater(tNW);
            const groundNE = !isWater(tNE);
            const groundSW = !isWater(tSW);
            const groundSE = !isWater(tSE);

            let wtl = 0, wtr = 0, wbl = 0, wbr = 0;
            if (groundN && groundW && groundNW) wtl = R;
            if (groundN && groundE && groundNE) wtr = R;
            if (groundS && groundE && groundSE) wbr = R;
            if (groundS && groundW && groundSW) wbl = R;

            tile.style.setProperty('--br-tl', `${wtl}px`);
            tile.style.setProperty('--br-tr', `${wtr}px`);
            tile.style.setProperty('--br-br', `${wbr}px`);
            tile.style.setProperty('--br-bl', `${wbl}px`);
          }

          // Shimmer overlay on special unique tiles (one per biome)
          const st = this.shimmerTiles || {};
          const isShimmer =
            (st.forest && st.forest.x === wx && st.forest.y === wy) ||
            (st.mountain && st.mountain.x === wx && st.mountain.y === wy) ||
            (st.desert && st.desert.x === wx && st.desert.y === wy);
          if (isShimmer) {
            const sh = document.createElement('div');
            sh.className = 'shimmer';
            tile.appendChild(sh);
          }

          // Add fantasy icon overlay (RA icons) for overworld tiles
          const iconClass = this.getOwIconForType ? this.getOwIconForType(type) : null;
          if (iconClass) {
            const wrap = document.createElement('div');
            wrap.className = 'ow-icon';
            const i = document.createElement('i');
            i.className = iconClass;
            wrap.appendChild(i);
            tile.appendChild(wrap);
          }

          // Special shimmer overlay for unique tiles (one per biome)
          if (this.shimmerTiles) {
            const f = this.shimmerTiles.forest;
            const m = this.shimmerTiles.mountain;
            const d = this.shimmerTiles.desert;
            const isForestShimmer = f && f.x === wx && f.y === wy && type === 'forest';
            const isMountainShimmer = m && m.x === wx && m.y === wy && type === 'mountain';
            const isDesertShimmer = d && d.x === wx && d.y === wy && type === 'desert';
            if (isForestShimmer || isMountainShimmer || isDesertShimmer) {
              tile.classList.add('is-shimmer');
              const sh = document.createElement('div');
              sh.className = 'shimmer';
              // Keep shimmer phase continuous across re-renders by offsetting animation start
              const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
              if (this._shimmerEpoch == null) this._shimmerEpoch = now;
              const loopMs = Number(this.tileShimmerMs) || 4200; // must match CSS animation duration
              const elapsed = now - this._shimmerEpoch;
              const offset = Math.floor(elapsed % loopMs);
              sh.style.animationDelay = `-${offset}ms`;
              tile.appendChild(sh);
            }
          }

          if (wx === this.player.x && wy === this.player.y) {
            const p = document.createElement('div');
            p.className = 'player';
            tile.appendChild(p);
          }
          grid.appendChild(tile);
        }
      }
      container.appendChild(grid);
    },

    renderStatus() {
      if (this.$.lv) this.$.lv.textContent = String(this.level);
      if (this.$.hp) this.$.hp.textContent = `${this.hp}/${this.stats.maxHp}`;
      if (this.$.sp) this.$.sp.textContent = `${this.sp}/${this.spMax}`;
      if (this.$.exp) this.$.exp.textContent = String(this.stats.xp);
      if (this.$.gold) this.$.gold.textContent = String(this.stats.gold);
      this.updatePlayerHpBar();
      this.updatePlayerSpBar();
      this.updateEnemyHpBarFill();
    },

    renderChoices() {
      this.$.choices.forEach((el, idx) => {
        el.classList.toggle('selected', idx === this.choiceIndex);
      });
    },

    renderOverworldStatus() {
      const el = this.$.owStatus;
      if (!el) return;
      const show = this.current === State.OVERWORLD && !!this.showOwStatus;
      el.classList.toggle('hidden', !show);
      if (!show) return;

      const base = this.stats;
      const hpLine = `${this.hp}/${base.maxHp}`;

      const eq = this.getEquipmentModifierTotals();
      const b = this.combatBuffs || { atk: 0, def: 0, spe: 0, luc: 0 };
      const fmtMod = (n) => {
        const v = Number(n) || 0;
        if (!v) return '';
        return `<span class="mod ${v > 0 ? 'pos' : 'neg'}">${v > 0 ? `+${v}` : `${v}`}</span>`;
      };

      const inv = Object.keys(this.itemDefs)
        .map(id => ({ id, def: this.itemDefs[id], qty: this.inventory[id] || 0 }))
        .filter(e => e.qty > 0);

      const invLines = inv.length
        ? inv.map(e => `<li><span class="name">${e.def.name}</span> <span class="qty">x${e.qty}</span></li>`).join('')
        : '<li class="muted">None</li>';

      // Equipment lines (effect text moved to next line)
      const equiLines = [];
      const renderEquipRow = (label, def) => {
        if (!def) {
          return `<li class="muted"><span class="name">${label}</span> <span class="qty">None</span></li>`;
        }
        const mods = def.mods || {};
        const parts = [];
        if (mods.atk) parts.push(`ATK ${mods.atk > 0 ? '+' : ''}${mods.atk}`);
        if (mods.def) parts.push(`DEF ${mods.def > 0 ? '+' : ''}${mods.def}`);
        if (mods.spe) parts.push(`SPE ${mods.spe > 0 ? '+' : ''}${mods.spe}`);
        if (mods.luc) parts.push(`LUC ${mods.luc > 0 ? '+' : ''}${mods.luc}`);
        const modsStr = parts.join(', ');
        const effect = def.desc ? String(def.desc) : modsStr;
        const effectHtml = effect ? `<div class="e-desc">${effect}</div>` : '';
        return `<li><span class="name">${label}</span> <div class="qty"><div class="e-name">${def.name}</div>${effectHtml}</div></li>`;
      };

      const wId = this.equipment?.weapon || null;
      const wDef = wId ? this.equipmentDefs?.[wId] : null;
      equiLines.push(renderEquipRow('Weapon', wDef));

      const aId = this.equipment?.armor || null;
      const aDef = aId ? this.equipmentDefs?.[aId] : null;
      equiLines.push(renderEquipRow('Armor', aDef));

      const xId = this.equipment?.accessory || null;
      const xDef = xId ? this.equipmentDefs?.[xId] : null;
      equiLines.push(renderEquipRow('Accessory', xDef));

      const modAtk = (Number(eq.atk) || 0) + (Number(b.atk) || 0);
      const modDef = (Number(eq.def) || 0) + (Number(b.def) || 0);
      const modSpe = (Number(eq.spe) || 0) + (Number(b.spe) || 0);
      const modLuc = (Number(eq.luc) || 0) + (Number(b.luc) || 0);

      // Aggregate equipment extra effects for a clear status readout (e.g., Boots of Divine Wind)
      const extras = (typeof this.getEquipmentExtraEffects === 'function') ? this.getEquipmentExtraEffects() : null;
      const effItems = [];
      if (extras) {
        if ((Number(extras.critBonusPct) || 0) > 0) effItems.push(`Crit Chance +${Number(extras.critBonusPct)}%`);
        if ((Number(extras.dodgeBonusPct) || 0) > 0) effItems.push(`Dodge Chance +${Number(extras.dodgeBonusPct)}%`);
        if ((Number(extras.goldMult) || 1) !== 1) effItems.push(`Gold Gains x${Number(extras.goldMult)}`);
        if ((Number(extras.xpMult) || 1) !== 1) effItems.push(`EXP Gains x${Number(extras.xpMult)}`);
        if ((Number(extras.dmgTakenMult) || 1) !== 1) effItems.push(`Damage Taken x${Number(extras.dmgTakenMult)}`);
        if (!!extras.canWalkMountains) effItems.push('Terrain: Mountains walkable');
      }
      const effectsHtml = effItems.length
        ? effItems.map(t => `<li>${t}</li>`).join('')
        : '<li class="muted">None</li>';

      el.innerHTML = `
        <div class="ow-panel">
          <div class="ow-title">Status</div>
          <div class="ow-grid">
            <div>LV</div><div class="val">${this.level}</div><div class="mod-col"></div>
            <div>HP</div><div class="val">${hpLine}</div><div class="mod-col"></div>
            <div>ATK</div><div class="val">${base.atk}</div><div class="mod-col">${fmtMod(modAtk)}</div>
            <div>DEF</div><div class="val">${base.def}</div><div class="mod-col">${fmtMod(modDef)}</div>
            <div>SPE</div><div class="val">${base.spe}</div><div class="mod-col">${fmtMod(modSpe)}</div>
            <div>LUC</div><div class="val">${base.luc}</div><div class="mod-col">${fmtMod(modLuc)}</div>
            <div>EXP</div><div class="val">${base.xp}</div><div class="mod-col"></div>
            <div>Gold</div><div class="val">${base.gold}</div><div class="mod-col"></div>
          </div>
          <div class="ow-subtitle">Inventory</div>
          <ul class="ow-list">
            ${invLines}
          </ul>
          <div class="ow-subtitle">Equipment</div>
          <ul class="ow-list">
            ${equiLines.join('')}
          </ul>
          <div class="ow-subtitle">Equipment Effects</div>
          <ul class="ow-list">
            ${effectsHtml}
          </ul>
        </div>
      `;
    },

    renderCombatMessage() {
      if (this.current !== State.COMBAT) {
        this.stopTyping(false);
        if (this.$.combatMsg) this.$.combatMsg.textContent = '';
        this.lastCombatMessage = null;
        // Reset any temporary wrap state when leaving combat
        this._combatWrapPages = null;
        this._combatWrapIndex = 0;
        this._combatWrapBase = null;
        return;
      }

      // Determine the base message for this moment in combat:
      // - If we're in a paged combat turn, use the current turn page text
      // - Otherwise, use the current combatMessage as-is
      let baseMsg = String(this.combatMessage || '');
      if (this.awaitContinue === 'turn' && Array.isArray(this.combatPages) && this.combatPages.length) {
        const idx = Math.max(0, Math.min(this.combatPages.length - 1, Number(this.combatPageIndex) || 0));
        baseMsg = String(this.combatPages[idx] || '');
      }

      // Paginate the message to fit exactly 5 lines within the combat message box
      let displayMsg = baseMsg;
      if (typeof this.computePagedDialogue === 'function' && this.$?.combatMsg) {
        const wrapPages = this.computePagedDialogue(baseMsg, 5, this.$.combatMsg);
        if (wrapPages && wrapPages.length > 1) {
          // Maintain wrap state across renders until the player advances
          const baseChanged = this._combatWrapBase !== baseMsg;
          if (baseChanged) {
            this._combatWrapBase = baseMsg;
            this._combatWrapIndex = 0;
          }
          this._combatWrapPages = wrapPages;
          const wi = Math.max(0, Math.min(wrapPages.length - 1, Number(this._combatWrapIndex) || 0));
          displayMsg = wrapPages[wi] || '';
        } else {
          // Clear wrap state if no pagination is needed
          this._combatWrapPages = null;
          this._combatWrapIndex = 0;
          this._combatWrapBase = null;
          displayMsg = baseMsg;
        }
      }

      if (displayMsg !== this.lastCombatMessage) {
        this.lastCombatMessage = displayMsg;
        this.startTyping(displayMsg);
        return;
      }

      if (!this.isTyping && this.$.combatMsg) {
        this.$.combatMsg.textContent = displayMsg;
      }

      this.updateChoicesVisibility();
    },

    updateChoicesVisibility() {
      const wrap = this.$.choicesWrap;
      if (!wrap) return;
      const hide = this.current === State.COMBAT && (this.isTyping || !!this.awaitContinue);
      wrap.classList.toggle('is-invisible', hide);
      wrap.classList.remove('hidden');
    },

    

    // HP/SP bar helpers
    updatePlayerHpBar() {
      const max = Math.max(1, Number(this.stats?.maxHp) || 1);
      const cur = clamp(Number(this.hp) || 0, 0, max);
      const last = Number(this._lastHp ?? cur);
      const decreasing = cur < last;
      if (this.$.hpBarPlayer) {
        this.$.hpBarPlayer.classList.toggle('anim', decreasing);
      }
      const missingPct = (1 - (cur / max)) * 100;
      if (this.$.hpBarPlayerMissing) {
        this.$.hpBarPlayerMissing.style.width = `${missingPct}%`;
      }
      this._lastHp = cur;
    },

    updatePlayerSpBar() {
      const max = Math.max(1, Number(this.spMax) || 1);
      const cur = clamp(Number(this.sp) || 0, 0, max);
      const last = Number(this._lastSp ?? cur);
      const decreasing = cur < last;
      if (this.$.spBarPlayer) {
        this.$.spBarPlayer.classList.toggle('anim', decreasing);
      }
      const missingPct = (1 - (cur / max)) * 100;
      if (this.$.spBarPlayerMissing) {
        this.$.spBarPlayerMissing.style.width = `${missingPct}%`;
      }
      this._lastSp = cur;
    },

    updateEnemyHpBarLayout() {
      const el = this.$.enemyHpBar;
      if (!el || !this.enemy) return;
      const sprite = this.enemy.sprite || {};
      const frameW = Number(sprite.frameW) || 16;
      const frameH = Number(sprite.frameH || sprite.frameW) || 16;
      const scale = Number(sprite.scale) || 16;
      const width = Math.max(1, frameW * scale);
      const height = Math.max(1, frameH * scale);
      const barH = 10;
      const margin = 8;
      el.style.width = `${width}px`;
      el.style.height = `${barH}px`;
      el.style.top = `calc(50% - ${Math.round(height / 2 + barH + margin)}px)`;
    },

    updateEnemyHpBarFill() {
      const el = this.$.enemyHpMissing;
      if (!el || !this.enemy) return;
      const max = Math.max(1, Number(this.enemy.maxHp) || 1);
      const cur = clamp(Number(this.enemy.hp) || 0, 0, max);
      const last = Number(this._lastEnemyHp ?? cur);
      const decreasing = cur < last;
      if (this.$.enemyHpBar) {
        this.$.enemyHpBar.classList.toggle('anim', decreasing);
      }
      const missingPct = (1 - (cur / max)) * 100;
      el.style.width = `${missingPct}%`;
      this._lastEnemyHp = cur;
    },

    // Shake helpers
    shakeElement(el, duration = 220) {
      if (!el) return;
      el.classList.remove('shake-x');
      void el.offsetWidth;
      el.classList.add('shake-x');
      window.setTimeout(() => el.classList.remove('shake-x'), duration);
    },
    shakeEnemy() {
      this.shakeElement(this.$.monster);
      this.shakeElement(this.$.enemyHpBar);
    },
    shakePlayer() {
      this.shakeElement(this.$.hpBarPlayer);
    },

    // Typing helpers (combat only)
    startTyping(text) {
      this.stopTyping(false);

      this.typingFull = text || '';
      this.typingIndex = 0;
      this.isTyping = true;
      this.$.combatMsg.textContent = '';
      this.updateChoicesVisibility();

      const speedMs = 22;
      this.typingTimer = setInterval(() => {
        if (this.current !== State.COMBAT) {
          this.stopTyping(false);
          return;
        }
        const next = this.typingFull[this.typingIndex++];
        if (next !== undefined) {
          this.$.combatMsg.textContent += next;
        }
        if (this.typingIndex >= this.typingFull.length) {
          this.stopTyping(true);
        }
      }, speedMs);
    },

    stopTyping(showFull = true) {
      if (this.typingTimer) {
        clearInterval(this.typingTimer);
        this.typingTimer = null;
      }
      if (showFull && this.typingFull) {
        this.$.combatMsg.textContent = this.typingFull;
      }
      this.isTyping = false;
      this.typingIndex = 0;
      this.updateChoicesVisibility();
    },

    skipTyping() {
      this.stopTyping(true);
    },

    // Enemy sprite animation helpers
    startEnemyAnim() {
      this.stopEnemyAnim();
      this.enemyFrame = 0;
      const el = this.$.monster;
      if (!el) return;
      if (!this.enemy?.sprite?.animated) {
        // Static sprite: ensure centered display
        el.style.backgroundPosition = 'center';
        el.style.backgroundSize = 'contain';
        return;
      }

      const sprite = this.enemy?.sprite || {};
      const frames = Number(sprite.frames) || 16;
      const frameW = Number(sprite.frameW) || 16;
      const loopMs = Number(sprite.loopMs) || 4000;
      const pauseMs = Number(sprite.pauseMs) || 3000;
      const stepMs = loopMs / frames;

      const tick = () => {
        if (this.current !== State.COMBAT) {
          this.stopEnemyAnim();
          return;
        }
        if (this.enemyFrame >= frames) {
          this.enemyFrame = 0;
          el.style.backgroundPosition = '0px 0px';
          this.enemyAnimTimer = setTimeout(() => {
            if (this.current !== State.COMBAT) {
              this.stopEnemyAnim();
              return;
            }
            this.enemyFrame = 1;
            el.style.backgroundPosition = `-${1 * frameW}px 0px`;
            this.enemyAnimTimer = setTimeout(tick, stepMs);
          }, pauseMs);
          return;
        }

        el.style.backgroundPosition = `-${this.enemyFrame * frameW}px 0px`;
        this.enemyFrame += 1;
        this.enemyAnimTimer = setTimeout(tick, stepMs);
      };

      this.enemyFrame = 0;
      el.style.backgroundPosition = '0px 0px';
      this.enemyAnimTimer = setTimeout(tick, stepMs);
    },

    stopEnemyAnim() {
      if (this.enemyAnimTimer) {
        clearTimeout(this.enemyAnimTimer);
        this.enemyAnimTimer = null;
      }
      // Only reset background position for animated sprites; keep static sprites centered
      if (this.$.monster && this.enemy?.sprite?.animated) {
        this.$.monster.style.backgroundPosition = '0px 0px';
      }
    },

    // Apply the current enemy sprite to the DOM element
    applyEnemySprite(sprite) {
      const el = this.$.monster;
      if (!el || !sprite) return;

      const animated = !!sprite.animated;
      const frameW = Math.max(1, Number(sprite.frameW) || 16);
      const frameH = Math.max(1, Number(sprite.frameH || sprite.frameW) || 16);

      // Size the element to the logical frame size
      el.style.width = `${frameW}px`;
      el.style.height = `${frameH}px`;

      // Image or placeholder color
      if (!sprite.image || sprite.placeholder) {
        el.style.backgroundImage = 'none';
        el.style.backgroundColor = 'var(--red)';
      } else {
        el.style.backgroundImage = `url('${sprite.image}')`;
        el.style.backgroundColor = 'transparent';
      }

      // Scale (pixel-perfect via transform; base is 16px -> scaled up)
      const scale = Number(sprite.scale) || 16;
      el.style.transform = `scale(${scale})`;

      // Filters: always include drop shadow; prepend any provided filter
      const baseShadow = 'drop-shadow(0 8px 24px rgba(0,0,0,.45))';
      el.style.filter = sprite.filter ? `${sprite.filter} ${baseShadow}` : baseShadow;

      // Background layout: spritesheets vs static images
      if (animated) {
        el.style.backgroundPosition = '0px 0px';
        el.style.backgroundSize = 'auto';
      } else {
        // Center and contain static images so they render correctly
        el.style.backgroundPosition = 'center';
        el.style.backgroundSize = 'contain';
      }

      this.updateEnemyHpBarLayout();
    },

    // Apply vendor background (shop/blacksmith/temple/inn):
    // - Semi-transparent gray overlay remains via #shop
    // - Image sits in top half (max-height: 50vh), not forced full width
    applyShopBackground() {
      const container = this.root.querySelector('#shop .shop-content');
      const banner = this.root.querySelector('#shop .shop-banner');
      if (!container) return;
      let name = 'shop';
      if (this.isTemple) name = 'temple';
      else if (this.isBlacksmith) name = 'blacksmith';
      else if (this.isInn) name = 'inn';
      else if (this.isCastle) name = 'castle';
      const url = `assets/images/background/${name}.png`;

      // Clear any container background so the map shows through the overlay
      container.style.backgroundColor = 'transparent';
      container.style.backgroundImage = 'none';

      // Show image in the top banner only
      if (banner) {
        banner.style.backgroundImage = `url('${url}')`;
        banner.style.backgroundSize = 'contain';
        banner.style.backgroundPosition = 'center';
        banner.style.backgroundRepeat = 'no-repeat';
      }

      },

    // Return RPG Awesome icon class for a given overworld tile type
      getOwIconForType(type) {
        switch (type) {
          case 'forest': return null;   // use PNG texture
          case 'mountain': return null; // use PNG texture
          case 'desert': return null;
          case 'goal': return 'ra ra-crown';
          case 'shop': return 'ra ra-wooden-sign';
          case 'smith': return 'ra ra-anvil';
          case 'temple': return 'ra ra-incense';
          case 'inn': return 'ra ra-beer';
          default: return null;
        }
      },

      // Add classes to enable fantasy icons and choose color mode
      updateIconThemeClasses() {
        const root = this.root;
        if (!root) return;
        root.classList.add('icons-fantasy', 'icons-colored');
      },

      // Find the first occurrence of a tile type on the current map (for dev teleport)
      findTileCoordsByType(type) {
        if (!this.tiles || !this.tiles.length) return null;
        for (let y = 0; y < this.mapHeight; y++) {
          const row = this.tiles[y];
          for (let x = 0; x < this.mapWidth; x++) {
            if (row && row[x] === type) return { x, y };
          }
        }
        return null;
      },

      // ---------- Dialogue pagination (cutscene/good ending) ----------
      computePagedDialogue(text, maxLines = 5, elForMeasure = null) {
        // Normalize input:
        // - Convert HTML entities that may sneak in
        // - Convert literal "\n" sequences to actual newlines
        // - Normalize CRs
        // - Collapse single newlines to spaces (legacy manual hard-breaks)
        // - Preserve paragraph breaks where there are 2+ consecutive newlines
        let str = String(text || '');
        // Silent fix for encoding artifacts that break display
        str = str.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        // Normalize newlines: convert CRLF/CR to LF; convert escaped \\n to real newlines
        str = str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        str = str.replace(/\\n/g, '\n');

        // Preserve 2+ newlines as paragraph breaks; collapse single newlines to spaces
        const PARA_SENTINEL = '<<__PARA__>>';
        str = str
          .replace(/\n{2,}/g, PARA_SENTINEL)  // mark paragraphs
          .replace(/\n/g, ' ');               // flatten single hard-breaks
        // Restore paragraph breaks safely without regex meta pitfalls
        str = str.split(PARA_SENTINEL).join('\n\n');
        // Collapse extra spaces
        str = str.replace(/[ \t]{2,}/g, ' ').trim();

        const el = elForMeasure || this.$?.dialogueText;

        // Robust width measurement: use the element's content box width
        let contentWidth = 0;
        try {
          if (el) {
            const cs = window.getComputedStyle ? window.getComputedStyle(el) : null;
            const padL = cs ? parseFloat(cs.paddingLeft || '0') || 0 : 0;
            const padR = cs ? parseFloat(cs.paddingRight || '0') || 0 : 0;
            const bordL = cs ? parseFloat(cs.borderLeftWidth || '0') || 0 : 0;
            const bordR = cs ? parseFloat(cs.borderRightWidth || '0') || 0 : 0;
            if (el.clientWidth && el.clientWidth > 0) {
              // clientWidth includes padding, excludes border
              contentWidth = Math.max(0, el.clientWidth - (padL + padR));
            } else if (el.getBoundingClientRect) {
              // rect width includes border
              const rect = el.getBoundingClientRect();
              const w = Math.max(0, rect && rect.width ? rect.width : 0);
              contentWidth = Math.max(0, w - (padL + padR + bordL + bordR));
            }
          }
        } catch (_e) {}
        if (contentWidth < 50) {
          // Fallback: viewport-constrained width minus a small safety margin
          contentWidth = Math.min(window.innerWidth || 800, 720) - 32;
        }
        const maxWidth = Math.max(50, Math.floor(contentWidth));

        const ctx = this._getMeasureContext();
        // Build font from computed style; fall back to Press Start 2P 16px
        let fontFamily = '"Press Start 2P", cursive';
        let fontSize = '16px';
        let fontWeight = '400';
        try {
          if (el && window.getComputedStyle) {
            const cs = window.getComputedStyle(el);
            if (cs) {
              fontFamily = cs.fontFamily || fontFamily;
              fontSize = cs.fontSize || fontSize;
              fontWeight = cs.fontWeight || fontWeight;
            }
          }
        } catch (_e) {}
        // Set canvas font and sanity-check measurement; fallback if invalid
        ctx.font = `${fontWeight} ${fontSize} ${fontFamily}`;
        let sanity = ctx.measureText('W').width;
        if (!(sanity > 0 && isFinite(sanity))) {
          ctx.font = `${fontSize} ${fontFamily}`;
          sanity = ctx.measureText('W').width;
        }
        if (!(sanity > 0 && isFinite(sanity))) {
          ctx.font = `16px sans-serif`;
        }

        // Heuristic: if measurement indicates too few characters fit per line (broken layout measurement),
        // fall back to a conservative character-cap wrap to avoid one-char-per-line artifacts.
        let charW = 0;
        try {
          charW = ctx.measureText('W').width || 0;
        } catch (_e) { charW = 0; }
        const approxCharsPerLine = (charW > 0) ? Math.floor(maxWidth / charW) : 0;
        if (!isFinite(approxCharsPerLine) || approxCharsPerLine < 2) {
          const cap = Math.max(24, Math.min(48, (approxCharsPerLine || 18) * 2));
          const fallbackLines = this._wrapTextByCharCap(str, cap);
          const pages = [];
          for (let i = 0; i < fallbackLines.length; i += maxLines) {
            pages.push(fallbackLines.slice(i, i + maxLines).join('\n'));
          }
          return pages.length ? pages : [''];
        }

        let lines = this._wrapTextToLines(str, maxWidth, ctx);
        if (!lines.length) return [''];
        // Guard: if the algorithm produced mostly 1–2 character lines, treat it as a measurement failure
        // and fall back to a conservative character-cap wrapper to avoid one-char-per-line artifacts.
        const totalChars = str.split('\n').join('').length;
        const shortCount = lines.filter(l => (String(l || '').length <= 2)).length;
        const suspicious = lines.length > 6 && (shortCount / lines.length) > 0.6 && totalChars >= 24;
        if (suspicious) {
          const W = ctx.measureText('W').width || 0;
          const cap = Math.max(24, Math.min(48, (W > 0 ? Math.floor(maxWidth / W) : 18) * 2));
          lines = this._wrapTextByCharCap(str, cap);
        }
        const pages = [];
        for (let i = 0; i < lines.length; i += maxLines) {
          pages.push(lines.slice(i, i + maxLines).join('\n'));
        }
        return pages;
      },

      _getMeasureContext() {
        if (!this._measureCtx) {
          const c = document.createElement('canvas');
          this._measureCtx = c.getContext('2d');
        }
        return this._measureCtx;
      },

      _wrapTextToLines(text, maxWidth, ctx) {
        const result = [];
        const paras = String(text || '').split('\n');
        for (let p = 0; p < paras.length; p++) {
          const para = paras[p];
          if (para.trim() === '') {
            // Blank line
            result.push('');
            continue;
          }
          const words = para.split(/\s+/).filter(Boolean);
          let line = '';
          for (let i = 0; i < words.length; i++) {
            const word = String(words[i]);
            const test = line ? `${line} ${word}` : word;
            const w = ctx.measureText(test).width;
            if (w <= maxWidth) {
              line = test;
              continue;
            }
            // If the single word is too wide for an empty line, avoid per-character lines by falling back
            if (!line) {
              const firstW = ctx.measureText(word[0] || 'W').width || 0;
              if (firstW > maxWidth && maxWidth > 0) {
                // Fallback: wrap the rest of this paragraph by a fixed character cap
                const rest = [word].concat(words.slice(i + 1)).join(' ');
                const extra = this._wrapTextByCharCap(rest, 36);
                for (let k = 0; k < extra.length; k++) result.push(extra[k]);
                line = '';
                break; // done with this paragraph
              }
              // Otherwise, hard-wrap the long word by characters (at least 1 char fits)
              let piece = '';
              for (let ci = 0; ci < word.length; ci++) {
                const t2 = piece + word[ci];
                if (ctx.measureText(t2).width <= maxWidth) {
                  piece = t2;
                } else {
                  if (piece) result.push(piece);
                  piece = word[ci];
                }
              }
              line = piece || '';
            } else {
              // Push current line and start new with word
              result.push(line);
              line = '';
              i--; // reprocess this word on a new line
            }
          }
          if (line) result.push(line);
        }
        return result;
      },

      // Simple fixed character-cap wrapper used as a robust fallback when measurements are unreliable
      _wrapTextByCharCap(text, cap = 36) {
        const out = [];
        const paras = String(text || '').split('\n');
        for (let p = 0; p < paras.length; p++) {
          const para = paras[p];
          if (para.trim() === '') {
            out.push('');
            continue;
          }
          let i = 0;
          while (i < para.length) {
            const end = Math.min(para.length, i + cap);
            let slice = para.slice(i, end);
            if (end < para.length) {
              const lastSpace = slice.lastIndexOf(' ');
              if (lastSpace > 0) {
                slice = slice.slice(0, lastSpace);
                i += lastSpace + 1; // skip the space
              } else {
                i += cap;
              }
            } else {
              i = end;
            }
            out.push(slice.trim());
          }
        }
        return out;
      },
  });
}