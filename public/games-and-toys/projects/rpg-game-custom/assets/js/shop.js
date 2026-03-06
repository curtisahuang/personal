

export function installShop(Game) {
  Object.assign(Game.prototype, {
    // Insert player name into NPC lines
    formatNpcLine(text) {
      try {
        const name = (this.playerName && String(this.playerName).trim()) ? String(this.playerName).trim() : 'Hero';
        let s = String(text || '');
        if (s.includes('{name}') || s.includes('{playerName}')) {
          s = s.replaceAll('{name}', name).replaceAll('{playerName}', name);
          return s;
        }
        const m = s.match(/^([A-Za-z]+):\s*(.*)$/);
        if (m) {
          const speaker = m[1];
          const rest = m[2] || '';
          return `${speaker}: ${name}, ${rest}`;
        }
        return s;
      } catch {
        // Best-effort formatting; fallback to original line
        return String(text || '');
      }
    },

    // Compute how many lines fit in the shop message box based on computed height and line-height
    // Clamp to 5 for consistency across all dialogues.
    computeShopMaxLines() {
      try {
        const el = this.$?.shopMsg;
        if (!el) return 5;
        const cs = window.getComputedStyle ? window.getComputedStyle(el) : null;
        let lh = 0;
        if (cs) {
          const lhStr = cs.lineHeight || '';
          lh = parseFloat(lhStr);
          if (!lh || isNaN(lh)) {
            const fs = parseFloat(cs.fontSize || '16') || 16;
            lh = fs * 1.5; // assume 1.5x if 'normal'
          }
        }
        if (!lh || isNaN(lh)) lh = 24; // fallback for 16px * 1.5
        const h = Math.max(0, el.clientHeight || 0); // includes padding, excludes border
        const lines = Math.max(1, Math.floor(h / lh));
        return Math.max(1, Math.min(5, lines));
      } catch {
        return 5;
      }
    },
 
    // Split NPC text into pages; treat explicit newlines as page boundaries, then wrap each segment
    paginateNpcTalk(text, maxLinesPerPage = null) {
      try {
        const src = this.formatNpcLine(String(text || ''));
        const L = Math.max(1, Number(maxLinesPerPage || (this.computeShopMaxLines ? this.computeShopMaxLines() : 5)));
        if (typeof this.computePagedDialogue !== 'function') {
          return [src];
        }
        const el = this.$?.shopMsg || null;
        // Normalize CRLF/CR and split into logical segments by newline(s)
        const norm = src.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const parts = norm.split(/\n+/).map(s => s.trim()).filter(Boolean);
        if (!parts.length) return [''];
        const pages = [];
        for (const part of parts) {
          const segPages = this.computePagedDialogue(part, L, el);
          if (Array.isArray(segPages) && segPages.length) {
            for (const p of segPages) pages.push(p);
          } else {
            pages.push(part);
          }
        }
        return pages;
      } catch {
        return [String(text || '')];
      }
    },

    // Adventure rumor stage based on quest progress
    getRumorStage() {
      // Default: desert -> then mountains after Boots -> then forest after Cloak
      const hasBoots = !!this.foundDivineWindBoots || (this.equipmentInventory && this.equipmentInventory['boots_divine_wind'] > 0);
      const hasCloak = !!this.foundHeavenlyCloak || (this.equipmentInventory && this.equipmentInventory['cloak_heavenly_thunder'] > 0);
      if (hasCloak) return 'forest';
      if (hasBoots) return 'mountain';
      return 'desert';
    },

    // One potential hint line per NPC, content varies by stage
    getRumorLineForVendor(vendorType) {
      const stage = this.getRumorStage();
      const v = String(vendorType || 'shop');
      if (v === 'temple') {
        if (stage === 'desert') {
          return 'Priestess: The desert keeps a borrowed light. Step where the sand shimmers, and the wind will learn your feet.';
        } else if (stage === 'mountain') {
          return 'Priestess: The mountain breathes slow. Where stone shimmers, claim what thunder remembers.';
        } else {
          // forest
          return 'Priestess: Between the trees a door of light blinks. Follow the shimmer and carry what was woken on the heights.';
        }
      }
      if (v === 'blacksmith') {
        if (stage === 'desert') {
          return 'Blacksmith: Customers keep talking about a divine treasure in the desert. Something about shimmering sand.';
        } else if (stage === 'mountain') {
          return 'Blacksmith: Lately the rumor points to the mountains. Folks say the rock can look shiny.';
        } else {
          return 'Blacksmith: Now people whisper about a secret forest. There\'s an old legend a hero was found there.';
        }
      }
      if (v === 'inn') {
        if (stage === 'desert') {
          return 'Innkeeper: Guests keep sharing stories about treasure out in the desert. They mention sand that seems to shimmer.';
        } else if (stage === 'mountain') {
          return 'Innkeeper: Travelers say the talk has moved to the mountains. Shiny rock, old legend, that sort of thing.';
        } else {
          return 'Innkeeper: Lately it\'s a secret forest in the tales. Some say the trees shimmer.';
        }
      }
      // default: shop
      if (stage === 'desert') {
        return 'Shopkeeper: I\'ve heard customers mention a treasure in the desert. Sand that catches the light.';
      } else if (stage === 'mountain') {
        return 'Shopkeeper: Word is it might be up in the mountains now. People talk about rock that looks shiny.';
      } else {
        return 'Shopkeeper: Some customers mention a secret forest. There\'s a legend a hero was found there.';
      }
    },

    // Advance or close the current shop dialogue pages (if any)
    advanceShopDialogue() {
      if (!this.shopAwaitContinue) return;

      // Ensure pages exist using full message if missing
      let pages = Array.isArray(this.shopPages) ? this.shopPages : null;
      if ((!pages || !pages.length) && typeof this.computePagedDialogue === 'function') {
        const base = String(this.shopMessageFull || this.shopMessage || '');
        const L = Math.max(1, Number(this.computeShopMaxLines ? this.computeShopMaxLines() : 4));
        pages = this.computePagedDialogue(base, L, this.$?.shopMsg);
        this.shopPages = pages;
        this.shopPageIndex = Math.max(0, Math.min((Number(this.shopPageIndex) || 0), pages.length - 1));
      }

      if (pages && pages.length > 1 && (Number(this.shopPageIndex) || 0) < pages.length - 1) {
        this.shopPageIndex = (Number(this.shopPageIndex) || 0) + 1;
        this.shopMessage = pages[this.shopPageIndex];
        this.renderShopMessage();
        this.updateShopChoicesVisibility();
        return;
      }
      // End of pages
      this.shopAwaitContinue = false;
      this.shopPages = null;
      this.shopPageIndex = 0;
      this.shopMessage = '';
      this.renderShopMessage();
      this.updateShopChoicesVisibility();
    },

    // ---------- SHOP / BLACKSMITH / TEMPLE / INN / CASTLE OVERLAY ----------
    startShop(vendor = 'shop') {
      this.current = 'SHOP';
      this.isBlacksmith = vendor === 'blacksmith';
      this.isTemple = vendor === 'temple';
      this.isInn = vendor === 'inn';
      this.isCastle = vendor === 'castle';
      this.shopChoiceIndex = 0;
      this.shopMessage = '';
      this.shopMessageFull = '';
      this.shopAwaitContinue = false;
      this.shopPages = null;
      this.shopPageIndex = 0;
      this.shopMenuMode = null;
      this.closeEquipMenu();

      // Castle prompt
      if (this.isCastle) {
        const full = this.formatNpcLine('Princess: Are you sure you are ready to challenge the evil necromancer?');
        this.shopMessageFull = full;
        this.shopMessage = full;
      }

      this.render();
      this.syncDevConsole();
    },

    confirmShopChoice() {
      // Castle flow overrides normal behavior
      if (this.isCastle) {
        if (this.shopChoiceIndex === 0) {
          // Yes -> begin final battle
          this.isFinalBossBattle = true;
          this.startCombat('necromancer');
        } else {
          // No/Leave -> back to overworld
          this.startOverworld();
        }
        return;
      }

      // Talk
      if (this.shopChoiceIndex === 0) {
        let pool = null;
        let fallback = '';
        if (this.isTemple) {
          pool = Array.isArray(this.templeRiddles) && this.templeRiddles.length ? this.templeRiddles : null;
          fallback = 'Priestess: The bells are quiet; return at dusk.';
        } else if (this.isBlacksmith) {
          pool = Array.isArray(this.blacksmithTalks) && this.blacksmithTalks.length ? this.blacksmithTalks : null;
          fallback = 'Blacksmith: What are you staring at? Buy something or get out of my forge.';
        } else if (this.isInn) {
          pool = Array.isArray(this.innTalks) && this.innTalks.length ? this.innTalks : null;
          fallback = "Innkeeper: Welcome, love! It's been hard lately with monsters about, but we keep smiling and the stew warm.";
        } else {
          pool = Array.isArray(this.shopTalks) && this.shopTalks.length ? this.shopTalks : null;
          fallback = 'Shopkeeper: Ah, traveler! Keep your wits about you.';
        }

        // Build candidate lines, optionally including a single rumor hint
        const vendorType = this.isTemple ? 'temple' : (this.isBlacksmith ? 'blacksmith' : (this.isInn ? 'inn' : 'shop'));
        const rumor = this.getRumorLineForVendor(vendorType);
        const candidates = pool ? pool.slice() : [];

        // Temple: guarantee hint on first Talk, then randomize thereafter
        if (this.isTemple && !this.templeHintSeen && rumor) {
          this.templeHintSeen = true;
          const full = this.formatNpcLine(rumor);
          // Use dynamic max lines based on element height for correct pagination
          const pages = this.paginateNpcTalk(full, null);
          this.shopMessageFull = full;
          this.shopPages = (pages && pages.length) ? pages : [full];
          this._shopPagesBase = full;
          this.shopPageIndex = 0;
          this.shopMessage = this.shopPages[0];
          this.shopAwaitContinue = true;
          this.renderShopMessage();
          this.updateShopChoicesVisibility();
          return;
        }

        // After first Temple hint (or for other vendors): add rumor as one possible dialogue
        if (rumor) candidates.push(rumor);

        const picked = candidates.length
          ? String(candidates[Math.floor(Math.random() * candidates.length)] || '')
          : String(fallback);

        const full = this.formatNpcLine(picked);
        const pages = this.paginateNpcTalk(full, null);
        this.shopMessageFull = full;
        this.shopPages = (pages && pages.length) ? pages : [full];
        this._shopPagesBase = full;
        this.shopPageIndex = 0;
        this.shopMessage = this.shopPages[0];
        this.shopAwaitContinue = true;
        this.renderShopMessage();
        this.updateShopChoicesVisibility();
        return;
      }

      // Temple-specific: Learn (index 1), Donate (index 2), Leave (index 3)
      if (this.isTemple) {
        if (this.shopChoiceIndex === 1) {
          this.openTempleLearnMenu();
          return;
        }
        if (this.shopChoiceIndex === 2) {
          this.donateAtTemple();
          return;
        }
        // idx 3 -> Leave
        this.startOverworld();
        return;
      }

      // Other vendors: idx 1 is Buy/Rest, idx 2 is Leave
      if (this.shopChoiceIndex === 1) {
        if (this.isInn) {
          this.restAtInn();
        } else {
          this.openShopMenu();
        }
        return;
      }

      // idx 2 -> Leave
      this.startOverworld();
    },

    renderShopChoices() {
      const els = this.$.shopChoices || [];
      const set = (idx, text, hidden) => {
        const el = els[idx];
        if (!el) return;
        el.textContent = text;
        el.classList.toggle('hidden', !!hidden);
      };

      // Castle: Yes/No only
      if (this.isCastle) {
        set(0, 'Yes', false);
        set(1, 'No', false);
        set(2, 'Leave', true);
        set(3, 'Leave', true);
        if (this.shopChoiceIndex > 1) this.shopChoiceIndex = 0;
        els.forEach((el, idx) => el.classList.toggle('selected', idx === this.shopChoiceIndex));
        this.updateShopChoicesVisibility();
        return;
      }

      if (this.isTemple) {
        // Temple: Talk, Learn, Donate, Leave
        // Learn label always 'Learn'
        set(0, 'Talk', false);
        // Learn option
        set(1, 'Learn', false);

        // Donate label with remaining count
        const ids = Array.isArray(this.divineItemIds) ? this.divineItemIds : [];
        let remain = 0;
        for (const id of ids) {
          if ((this.templeInventory?.[id] || 0) > 0) remain += 1;
        }
        const donateLabel = remain > 0 ? `Donate 25G - x${remain}` : `Donate 25G - SOLD OUT`;
        set(2, donateLabel, false);
        set(3, 'Leave', false);

        if (this.shopChoiceIndex > 3) this.shopChoiceIndex = 0;
        // Highlight only among visible ones
        els.forEach((el, idx) => {
          const hidden = el.classList.contains('hidden');
          el.classList.toggle('selected', !hidden && idx === this.shopChoiceIndex);
        });
        this.updateShopChoicesVisibility();
        return;
      }

      // Non-temple vendors (shop/blacksmith/inn): Talk, Buy/Equipment/Rest, Leave
      if (this.isBlacksmith) {
        set(0, 'Talk', false);
        set(1, 'Equipment', false);
        set(2, 'Leave', false);
        set(3, 'Leave', true);
      } else if (this.isInn) {
        set(0, 'Talk', false);
        set(1, 'Rest 10G', false);
        set(2, 'Leave', false);
        set(3, 'Leave', true);
      } else {
        set(0, 'Talk', false);
        set(1, 'Buy Items', false);
        set(2, 'Leave', false);
        set(3, 'Leave', true);
      }
      els.forEach((el, idx) => {
        const hidden = el.classList.contains('hidden');
        el.classList.toggle('selected', !hidden && idx === this.shopChoiceIndex);
      });
      this.updateShopChoicesVisibility();
    },

    renderShopMessage() {
      if (!this.$.shopMsg) return;
      // If awaiting continue, render current page of paginated message
      if (this.shopAwaitContinue) {
        const base = String(this.shopMessageFull || this.shopMessage || '');
        const L = Math.max(1, Number(this.computeShopMaxLines ? this.computeShopMaxLines() : 5));
        let pages = Array.isArray(this.shopPages) && this.shopPages.length ? this.shopPages : null;
        // Only recompute if pages are missing or the base text changed
        if (!pages || this._shopPagesBase !== base) {
          if (this._shopPagesBase !== base) {
            this.shopPageIndex = 0;
          }
          if (typeof this.paginateNpcTalk === 'function') {
            pages = this.paginateNpcTalk(base, L);
          } else if (typeof this.computePagedDialogue === 'function') {
            pages = this.computePagedDialogue(base, L, this.$.shopMsg);
          } else {
            pages = [base];
          }
          this.shopPages = pages;
          this._shopPagesBase = base;
        }
        const idx = Math.max(0, Math.min(this.shopPages.length - 1, Number(this.shopPageIndex) || 0));
        this.$.shopMsg.textContent = this.shopPages[idx] || '';
        return;
      }
      // Otherwise render raw message
      const msg = String(this.shopMessage || '');
      this.$.shopMsg.textContent = msg;
    },

    updateShopChoicesVisibility() {
      const wrap = this.$.shopChoicesWrap;
      if (!wrap) return;
      const hide = !!this.shopAwaitContinue || !!this.shopBuyOpen;
      wrap.classList.toggle('is-invisible', hide);
      wrap.classList.remove('hidden');
    },

    openShopMenu() {
      if (!this.$.shopMenu || !this.$.shopList) return;
      this.shopMenuMode = 'buy';
      this.shopBuyOpen = true;
      this.shopBuyIndex = 0;
      this.renderShopMenu();
      this.$.shopMenu.classList.remove('hidden');
      this.updateShopChoicesVisibility();
    },

    openTempleLearnMenu() {
      if (!this.$.shopMenu || !this.$.shopList) return;
      this.shopMenuMode = 'learn';
      this.shopBuyOpen = true;
      this.shopBuyIndex = 0;
      this.renderShopMenu();
      this.$.shopMenu.classList.remove('hidden');
      this.updateShopChoicesVisibility();
    },

    closeShopMenu() {
      this.shopBuyOpen = false;
      if (this.$.shopMenu) this.$.shopMenu.classList.add('hidden');
      this.updateShopChoicesVisibility();
    },

    renderShopMenu() {
      if (!this.$.shopList) return;
      const titleEl = this.$.shopMenu.querySelector('.menu-title');
      const hintEl = this.$.shopMenu.querySelector('.menu-hint');
      const mode = String(this.shopMenuMode || (this.isBlacksmith ? 'buy' : 'buy'));
      if (titleEl) {
        if (mode === 'learn') {
          titleEl.textContent = 'Lore';
        } else {
          titleEl.textContent = this.isBlacksmith ? 'Blacksmith' : 'Shop';
        }
      }
      if (hintEl) {
        if (mode === 'learn') {
          hintEl.textContent = 'Up/Down to select, Enter to ask, Esc to cancel';
        } else {
          hintEl.textContent = 'Up/Down to select, Enter to buy, Esc to cancel';
        }
      }
      if (this.$.shopMenu) this.$.shopMenu.classList.toggle('is-large', !!this.isBlacksmith && mode !== 'learn');

      const rows = [];

      if (mode === 'learn') {
        const lore = this.godLore || {};
        const ids = Object.keys(lore);
        if (!ids.length) {
          rows.push(`<div class="item-row" data-cancel="1"><span>Nothing to teach</span></div>`);
          this.shopBuyIndex = 0;
        } else {
          for (const id of ids) {
            const entry = lore[id] || {};
            const name = entry.name || id;
            rows.push(
              `<div class="item-row" data-id="${id}">
                <div class="item-main">
                  <div class="item-name">${name}</div>
                  <div class="item-desc">Ask about ${name}</div>
                </div>
              </div>`
            );
          }
          rows.push(`<div class="item-row" data-cancel="1"><span>Cancel</span></div>`);
          if (this.shopBuyIndex >= rows.length) this.shopBuyIndex = 0;
        }
        this.$.shopList.innerHTML = rows.join('');
        const rowEls = Array.from(this.$.shopList.querySelectorAll('.item-row'));
        rowEls.forEach((r, idx) => r.classList.toggle('selected', idx === this.shopBuyIndex));
        return;
      }

      // mode === 'buy'
      const inv = this.isBlacksmith ? (this.smithInventory || {}) : (this.shopInventory || {});
      const defs = this.isBlacksmith ? (this.equipmentDefs || {}) : (this.itemDefs || {});
      const entries = Object.keys(inv)
        .map(id => ({ id, entry: inv[id], def: defs[id] }))
        .filter(e => e.entry && e.entry.stock > 0 && e.def);

      if (entries.length === 0) {
        rows.push(`<div class="item-row" data-cancel="1"><span>Sold out</span></div>`);
        this.shopBuyIndex = 0;
      } else {
        for (const it of entries) {
          const def = it.def;
          const en = it.entry;
          rows.push(
            `<div class="item-row" data-id="${it.id}">
              <div class="item-main">
                <div class="item-name">${def.name}</div>
                <div class="item-desc">${(def.desc || '')} - ${en.price}G</div>
              </div>
              <div class="qty">x${en.stock}</div>
            </div>`
          );
        }
        rows.push(`<div class="item-row" data-cancel="1"><span>Cancel</span></div>`);
        if (this.shopBuyIndex >= rows.length) this.shopBuyIndex = 0;
      }
      this.$.shopList.innerHTML = rows.join('');
      const rowEls = Array.from(this.$.shopList.querySelectorAll('.item-row'));
      rowEls.forEach((r, idx) => r.classList.toggle('selected', idx === this.shopBuyIndex));
    },

    selectTempleLore(id) {
      const lore = this.godLore?.[id];
      if (!lore) {
        this.closeShopMenu();
        const full = this.formatNpcLine('Priestess: The temple keeps its secrets today.');
        this.shopMessageFull = full;
        this.shopAwaitContinue = true;
        this.renderShopMessage();
        this.updateShopChoicesVisibility();
        return;
      }
      const full = this.formatNpcLine(String(lore.text || ''));
      const pages = this.paginateNpcTalk(full, null);
      this.closeShopMenu();
      this.shopMessageFull = full;
      this.shopPages = pages && pages.length ? pages : [full];
      this._shopPagesBase = full;
      this.shopPageIndex = 0;
      this.shopMessage = this.shopPages[0];
      this.shopAwaitContinue = true;
      this.renderShopMessage();
      this.updateShopChoicesVisibility();
    },

    purchaseShopItem(itemId) {
      const inv = this.isBlacksmith ? (this.smithInventory || {}) : (this.shopInventory || {});
      const defs = this.isBlacksmith ? (this.equipmentDefs || {}) : (this.itemDefs || {});
      const entry = inv?.[itemId];
      const def = defs?.[itemId];
      if (!entry || !def) return;
      const price = Number(entry.price) || 0;
      if (entry.stock <= 0) {
        const full = `Sorry, we're sold out of ${def.name}.`;
        this.shopMessageFull = full;
        this.shopPages = null;
        this.shopPageIndex = 0;
        this.shopAwaitContinue = true;
        this.renderShopMessage();
        this.updateShopChoicesVisibility();
        return;
      }
      if (this.stats.gold < price) {
        const full = `You don't have enough gold. ${def.name} costs ${price}G.`;
        this.shopMessageFull = full;
        this.shopPages = null;
        this.shopPageIndex = 0;
        this.shopAwaitContinue = true;
        this.renderShopMessage();
        this.updateShopChoicesVisibility();
        return;
      }
      // Process purchase
      entry.stock = Math.max(0, entry.stock - 1);
      this.stats.gold = Math.max(0, this.stats.gold - price);

      if (this.isBlacksmith) {
        this.equipmentInventory[itemId] = (this.equipmentInventory[itemId] || 0) + 1;
      } else {
        this.inventory[itemId] = (this.inventory[itemId] || 0) + 1;
      }

      const full = `You bought a ${def.name}!`;
      this.shopMessageFull = full;
      this.shopPages = null;
      this.shopPageIndex = 0;
      this.shopAwaitContinue = true;
      this.renderShopMessage();
      this.renderStatus();
      this.renderOverworldStatus();
      this.renderDevItemsPanel();
      this.renderItemMenu();
      this.renderShopMenu();
      this.renderShopChoices();
      this.syncDevConsole();
      this.updateShopChoicesVisibility();
    },

    donateAtTemple() {
      const ids = Array.isArray(this.divineItemIds) ? this.divineItemIds : [];
      const available = ids.filter(id => (this.templeInventory?.[id] || 0) > 0);
      if (available.length === 0) {
        const full = this.formatNpcLine('Priestess: Our blessings are spent. We have nothing more to grant.');
        this.shopMessageFull = full;
        this.shopPages = null;
        this.shopPageIndex = 0;
        this.shopAwaitContinue = true;
        this.renderShopMessage();
        this.updateShopChoicesVisibility();
        return;
      }
      const cost = 25;
      if ((this.stats?.gold || 0) < cost) {
        const full = this.formatNpcLine(`Priestess: Your offering is light. A donation of ${cost}G is required.`);
        this.shopMessageFull = full;
        this.shopPages = null;
        this.shopPageIndex = 0;
        this.shopAwaitContinue = true;
        this.renderShopMessage();
        this.updateShopChoicesVisibility();
        return;
      }
      const pick = available[Math.floor(Math.random() * available.length)];
      const def = this.itemDefs?.[pick];
      if (!def) {
        const full = 'The rites falter. Return later.';
        this.shopMessageFull = full;
        this.shopPages = null;
        this.shopPageIndex = 0;
        this.shopAwaitContinue = true;
        this.renderShopMessage();
        this.updateShopChoicesVisibility();
        return;
      }
      this.templeInventory[pick] = Math.max(0, (this.templeInventory[pick] || 0) - 1);
      this.stats.gold = Math.max(0, (this.stats.gold || 0) - cost);
      this.inventory[pick] = (this.inventory[pick] || 0) + 1;

      const full = this.formatNpcLine(`You donate ${cost}G.\nPriestess: A relic returns to the world.\nReceived ${def.name}!`);
      const pages = this.paginateNpcTalk(full, null);
      this.shopMessageFull = full;
      this.shopPages = pages && pages.length ? pages : [full];
      this._shopPagesBase = full;
      this.shopPageIndex = 0;
      this.shopMessage = this.shopPages[0];
      this.shopAwaitContinue = true;
      this.renderShopMessage();
      this.renderStatus();
      this.renderOverworldStatus();
      this.renderDevItemsPanel();
      this.renderItemMenu();
      this.renderShopMenu();
      this.renderShopChoices();
      this.syncDevConsole();
      this.updateShopChoicesVisibility();
    },

    restAtInn() {
      const cost = 10;
      const maxHp = Math.max(1, Number(this.stats?.maxHp) || 1);
      const curHp = Math.max(0, Number(this.hp) || 0);
      const maxSp = Math.max(1, Number(this.spMax) || 1);
      const curSp = Math.max(0, Number(this.sp) || 0);
      if (curHp >= maxHp && curSp >= maxSp) {
        const full = this.formatNpcLine("Innkeeper: You're already at full strength. Save your coin for the road, love.");
        this.shopMessageFull = full;
        this.shopPages = null;
        this.shopPageIndex = 0;
        this.shopAwaitContinue = true;
        this.renderShopMessage();
        this.updateShopChoicesVisibility();
        return;
      }
      if ((this.stats?.gold || 0) < cost) {
        const full = this.formatNpcLine("Innkeeper: Sorry, rooms are 10G. Times are tough with monsters everywhere.");
        this.shopMessageFull = full;
        this.shopPages = null;
        this.shopPageIndex = 0;
        this.shopAwaitContinue = true;
        this.renderShopMessage();
        this.updateShopChoicesVisibility();
        return;
      }
      this.stats.gold = Math.max(0, (this.stats.gold || 0) - cost);
      const beforeHp = curHp;
      const beforeSp = curSp;
      this.hp = maxHp;
      this.sp = maxSp;
      const healedHp = Math.max(0, maxHp - beforeHp);
      const healedSp = Math.max(0, maxSp - beforeSp);
      const full = `You pay ${cost}G and rest at the inn.\nHP and SP fully restored (+${healedHp} HP, +${healedSp} SP).`;
      this.shopMessageFull = full;
      this.shopPages = null;
      this.shopPageIndex = 0;
      this.shopAwaitContinue = true;
      this.renderShopMessage();
      this.renderStatus();
      this.renderOverworldStatus();
      this.syncDevConsole();
      this.updateShopChoicesVisibility();
    },
  });
}