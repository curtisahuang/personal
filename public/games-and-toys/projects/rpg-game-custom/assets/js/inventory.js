import { clamp } from './utils.js';

export function installInventory(Game) {
  Object.assign(Game.prototype, {
    // ---------- ITEM MENU ----------
    openItemMenu() {
      if (!this.$.itemMenu || !this.$.itemList) return;
      this.itemMenuOpen = true;
      this.itemMenuIndex = 0;
      this.renderItemMenu();
      this.$.itemMenu.classList.remove('hidden');
    },

    closeItemMenu() {
      this.itemMenuOpen = false;
      if (this.$.itemMenu) this.$.itemMenu.classList.add('hidden');
    },

    renderItemMenu() {
      if (!this.$.itemList) return;
      const items = Object.keys(this.itemDefs)
        .map(id => ({ id, def: this.itemDefs[id], qty: this.inventory[id] || 0 }))
        .filter(e => e.qty > 0);

      const rows = [];
      if (items.length === 0) {
        rows.push(`<div class="item-row" data-cancel="1"><span>No items</span></div>`);
        this.itemMenuIndex = 0;
      } else {
        for (const it of items) {
          rows.push(
            `<div class="item-row" data-id="${it.id}">
              <div class="item-main">
                <div class="item-name">${it.def.name}</div>
                <div class="item-desc">${it.def.desc || ''}</div>
              </div>
              <div class="qty">x${it.qty}</div>
            </div>`
          );
        }
        rows.push(`<div class="item-row" data-cancel="1"><span>Cancel</span></div>`);
        if (this.itemMenuIndex >= rows.length) this.itemMenuIndex = 0;
      }
      this.$.itemList.innerHTML = rows.join('');
      const rowEls = Array.from(this.$.itemList.querySelectorAll('.item-row'));
      rowEls.forEach((r, idx) => r.classList.toggle('selected', idx === this.itemMenuIndex));
    },

    useItemInCombat(itemId) {
      this.closeItemMenu();
      this.runCombatRound('item', itemId);
    },

    // ---------- EQUIPMENT MENU (OVERWORLD) ----------
    openEquipMenu() {
      if (!this.$.equipMenu || !this.$.equipList) return;
      this.equipMenuOpen = true;
      const items = Object.keys(this.equipmentInventory || {})
        .map(id => ({ id, def: this.equipmentDefs?.[id], qty: this.equipmentInventory[id] || 0 }))
        .filter(e => e.qty > 0 && e.def && (e.def.slot === 'weapon' || e.def.slot === 'armor' || e.def.slot === 'accessory'));
      const curWeapon = this.equipment?.weapon || null;
      const curArmor = this.equipment?.armor || null;
      const curAcc = this.equipment?.accessory || null;
      let idx = items.findIndex(it => it.id === curWeapon);
      if (idx < 0) idx = items.findIndex(it => it.id === curArmor);
      if (idx < 0) idx = items.findIndex(it => it.id === curAcc);
      this.equipMenuIndex = idx >= 0 ? idx : 0;
      this.renderEquipMenu();
      this.$.equipMenu.classList.remove('hidden');
    },

    closeEquipMenu() {
      this.equipMenuOpen = false;
      if (this.$.equipMenu) this.$.equipMenu.classList.add('hidden');
    },

    renderEquipMenu() {
      if (!this.$.equipList) return;
      const eqInv = this.equipmentInventory || {};
      const defs = this.equipmentDefs || {};
      const items = Object.keys(eqInv)
        .map(id => ({ id, def: defs?.[id], qty: eqInv[id] || 0 }))
        .filter(e => e.qty > 0 && e.def && (e.def.slot === 'weapon' || e.def.slot === 'armor' || e.def.slot === 'accessory'));

      const rows = [];

      // Provide explicit Unequip options for each occupied slot to ensure players can change slots easily
      const cur = this.equipment || {};
      const nameOf = (id) => (defs?.[id]?.name || id || 'None');

      if (cur.weapon) {
        rows.push(
          `<div class="item-row" data-id="none:weapon">
            <div class="item-main">
              <div class="item-name">Unequip Weapon</div>
              <div class="item-desc">Current: ${nameOf(cur.weapon)}</div>
            </div>
            <div class="qty"></div>
          </div>`
        );
      }
      if (cur.armor) {
        rows.push(
          `<div class="item-row" data-id="none:armor">
            <div class="item-main">
              <div class="item-name">Unequip Armor</div>
              <div class="item-desc">Current: ${nameOf(cur.armor)}</div>
            </div>
            <div class="qty"></div>
          </div>`
        );
      }
      if (cur.accessory) {
        rows.push(
          `<div class="item-row" data-id="none:accessory">
            <div class="item-main">
              <div class="item-name">Unequip Accessory</div>
              <div class="item-desc">Current: ${nameOf(cur.accessory)}</div>
            </div>
            <div class="qty"></div>
          </div>`
        );
      }

      if (items.length === 0 && rows.length === 0) {
        rows.push(`<div class="item-row" data-cancel="1"><span>No equipment</span></div>`);
        this.equipMenuIndex = 0;
      } else {
        for (const it of items) {
          const def = it.def;
          const m = def?.mods || {};
          const parts = [];
          if (m.atk) parts.push(`ATK ${m.atk > 0 ? '+' : ''}${m.atk}`);
          if (m.def) parts.push(`DEF ${m.def > 0 ? '+' : ''}${m.def}`);
          if (m.spe) parts.push(`SPE ${m.spe > 0 ? '+' : ''}${m.spe}`);
          if (m.luc) parts.push(`LUC ${m.luc > 0 ? '+' : ''}${m.luc}`);
          const modsStr = parts.join(', ');
          const equipped =
            this.equipment?.weapon === it.id ||
            this.equipment?.armor === it.id ||
            this.equipment?.accessory === it.id;
          rows.push(
            `<div class="item-row" data-id="${it.id}">
              <div class="item-main">
                <div class="item-name">${def?.name || it.id}</div>
                <div class="item-desc">${modsStr || (def?.desc || '')}</div>
              </div>
              <div class="qty">${equipped ? 'Equipped' : ''}</div>
            </div>`
          );
        }
        rows.push(`<div class="item-row" data-cancel="1"><span>Cancel</span></div>`);
        if (this.equipMenuIndex >= rows.length) this.equipMenuIndex = 0;
      }

      this.$.equipList.innerHTML = rows.join('');
      const rowEls = Array.from(this.$.equipList.querySelectorAll('.item-row'));
      rowEls.forEach((r, idx) => r.classList.toggle('selected', idx === this.equipMenuIndex));
    },

    equipEquipment(id) {
      // Handle explicit unequip commands encoded as "none:slot"
      if (typeof id === 'string' && id.startsWith('none:')) {
        const slot = id.split(':')[1];
        if (slot === 'weapon' || slot === 'armor' || slot === 'accessory') {
          this.equipment = this.equipment || {};
          this.equipment[slot] = null;
          this.closeEquipMenu();
          this.renderOverworldStatus();
          this.syncDevConsole();
          this.render();
          return;
        }
      }

      const def = this.equipmentDefs?.[id];
      const owned = (this.equipmentInventory?.[id] || 0) > 0;
      if (!def || !def.slot || !owned) {
        this.closeEquipMenu();
        return;
      }
      this.equipment = this.equipment || {};
      const slot = def.slot;
      if (this.equipment[slot] === id) {
        this.equipment[slot] = null;
      } else {
        this.equipment[slot] = id;
      }
      this.closeEquipMenu();
      this.renderOverworldStatus();
      this.syncDevConsole();
      this.render();
    },

    // ---------- EQUIPMENT HELPERS ----------
    getEquipmentModifierTotals() {
      const mods = { atk: 0, def: 0, spe: 0, luc: 0 };
      const defs = this.equipmentDefs || {};
      const eq = this.equipment || {};
      const add = (m) => {
        if (!m) return;
        mods.atk += Number(m.atk) || 0;
        mods.def += Number(m.def) || 0;
        mods.spe += Number(m.spe) || 0;
        mods.luc += Number(m.luc) || 0;
      };
      if (eq.weapon && defs[eq.weapon]) add(defs[eq.weapon].mods);
      if (eq.armor && defs[eq.armor]) add(defs[eq.armor].mods);
      if (eq.accessory && defs[eq.accessory]) add(defs[eq.accessory].mods);
      return mods;
    },

    // Aggregate extra non-stat effects from equipped gear (player-only)
    getEquipmentExtraEffects() {
      const defs = this.equipmentDefs || {};
      const eq = this.equipment || {};
      const acc = { critBonusPct: 0, dodgeBonusPct: 0, goldMult: 1, xpMult: 1, dmgTakenMult: 1, canWalkMountains: false };
      const add = (id) => {
        const d = defs?.[id];
        if (!d) return;
        acc.critBonusPct += Number(d.critBonusPct) || 0;
        acc.dodgeBonusPct += Number(d.dodgeBonusPct) || 0;
        acc.goldMult *= (Number(d.goldMult) || 1);
        acc.xpMult *= (Number(d.xpMult) || 1);
        acc.dmgTakenMult *= (Number(d.dmgTakenMult) || 1);
        acc.canWalkMountains = acc.canWalkMountains || !!d.canWalkMountains;
      };
      if (eq.weapon) add(eq.weapon);
      if (eq.armor) add(eq.armor);
      if (eq.accessory) add(eq.accessory);
      return acc;
    },

    // Decay temporary combat buffs by 1 each round (min 0)
    decayCombatBuffs() {
      const b = this.combatBuffs || (this.combatBuffs = { atk: 0, def: 0, spe: 0, luc: 0 });
      b.atk = Math.max(0, (Number(b.atk) || 0) - 1);
      b.def = Math.max(0, (Number(b.def) || 0) - 1);
      b.spe = Math.max(0, (Number(b.spe) || 0) - 1);
      b.luc = Math.max(0, (Number(b.luc) || 0) - 1);
    },

    getEffectiveStats() {
      const s = this.stats || { maxHp: 1, atk: 0, def: 0, spe: 0, luc: 0 };
      const m = this.getEquipmentModifierTotals();
      const baseAtk = clamp(Number(s.atk) || 0, 0, 30);
      const baseDef = clamp(Number(s.def) || 0, 0, 30);
      const baseSpe = clamp(Number(s.spe) || 0, 0, 30);
      const baseLuc = clamp(Number(s.luc) || 0, 0, 30);
      const eqAtk = clamp(baseAtk + (Number(m.atk) || 0), 0, 30);
      const eqDef = clamp(baseDef + (Number(m.def) || 0), 0, 30);
      const eqSpe = clamp(baseSpe + (Number(m.spe) || 0), 0, 30);
      const eqLuc = clamp(baseLuc + (Number(m.luc) || 0), 0, 30);

      const b = this.combatBuffs || { atk: 0, def: 0, spe: 0, luc: 0 };

      return {
        maxHp: s.maxHp,
        atk: Math.max(0, eqAtk + (Number(b.atk) || 0)),
        def: Math.max(0, eqDef + (Number(b.def) || 0)),
        spe: Math.max(0, eqSpe + (Number(b.spe) || 0)),
        luc: Math.max(0, eqLuc + (Number(b.luc) || 0)),
      };
    },

    // ----- Dev console helpers -----
    renderDevItemsPanel() {
      if (!this.$dev) return;
      const container = this.$dev.items;
      if (!container) return;
      const defs = this.itemDefs || {};
      const rows = [];
      for (const id of Object.keys(defs)) {
        const def = defs[id];
        const qty = this.inventory[id] || 0;
        rows.push(
          `<div class="dev-row">
            <label>${def.name}</label>
            <input class="input dev-item-qty" data-id="${id}" type="number" min="0" max="999" value="${qty}"/>
          </div>`
        );
      }
      container.innerHTML = rows.join('') || '<small>No items defined.</small>';
      if (this.$dev.itemAddSelect) {
        this.$dev.itemAddSelect.innerHTML = Object.keys(defs)
          .map(id => `<option value="${id}">${defs[id].name}</option>`).join('');
      }
      if (this.$dev.itemAddCount && !this.$dev.itemAddCount.value) {
        this.$dev.itemAddCount.value = 1;
      }
    },

    populateDevEquipmentSelects() {
      if (!this.$dev) return;
      const defs = this.equipmentDefs || {};

      // Weapons
      if (this.$dev.weaponSelect) {
        const wSel = this.$dev.weaponSelect;
        const weapons = Object.keys(defs)
          .map(id => ({ id, def: defs[id] }))
          .filter(e => e.def && e.def.slot === 'weapon');
        if (weapons.length === 0) {
          wSel.innerHTML = `<option value="">(none)</option>`;
          wSel.value = '';
        } else {
          wSel.innerHTML = weapons.map(e => `<option value="${e.id}">${e.def.name}</option>`).join('');
          const curW = this.equipment?.weapon || '';
          if (curW && weapons.some(e => e.id === curW)) {
            wSel.value = curW;
          } else {
            wSel.value = weapons[0].id;
          }
        }
      }

      // Armor
      if (this.$dev.armorSelect) {
        const aSel = this.$dev.armorSelect;
        const armors = Object.keys(defs)
          .map(id => ({ id, def: defs[id] }))
          .filter(e => e.def && e.def.slot === 'armor');
        if (armors.length === 0) {
          aSel.innerHTML = `<option value="">(none)</option>`;
          aSel.value = '';
        } else {
          aSel.innerHTML = armors.map(e => `<option value="${e.id}">${e.def.name}</option>`).join('');
          const curA = this.equipment?.armor || '';
          if (curA && armors.some(e => e.id === curA)) {
            aSel.value = curA;
          } else {
            aSel.value = armors[0].id;
          }
        }
      }

      // Accessory
      if (this.$dev.accessorySelect) {
        const xSel = this.$dev.accessorySelect;
        const accs = Object.keys(defs)
          .map(id => ({ id, def: defs[id] }))
          .filter(e => e.def && e.def.slot === 'accessory');
        if (accs.length === 0) {
          xSel.innerHTML = `<option value="">(none)</option>`;
          xSel.value = '';
        } else {
          xSel.innerHTML = accs.map(e => `<option value="${e.id}">${e.def.name}</option>`).join('');
          const curX = this.equipment?.accessory || '';
          if (curX && accs.some(e => e.id === curX)) {
            xSel.value = curX;
          } else {
            xSel.value = accs[0].id;
          }
        }
      }
    },

    devEquipSelectedWeapon() {
      const id = this.$dev?.weaponSelect?.value;
      const defs = this.equipmentDefs || {};
      if (!id) return;
      const def = defs[id];
      if (!def || def.slot !== 'weapon') return;
      this.equipment = this.equipment || {};
      this.equipment.weapon = id;
      this.renderOverworldStatus();
      this.syncDevConsole();
      this.render();
    },

    devEquipSelectedArmor() {
      const id = this.$dev?.armorSelect?.value;
      const defs = this.equipmentDefs || {};
      if (!id) return;
      const def = defs[id];
      if (!def || def.slot !== 'armor') return;
      this.equipment = this.equipment || {};
      this.equipment.armor = id;
      this.renderOverworldStatus();
      this.syncDevConsole();
      this.render();
    },

    devEquipSelectedAccessory() {
      const id = this.$dev?.accessorySelect?.value;
      const defs = this.equipmentDefs || {};
      if (!id) return;
      const def = defs[id];
      if (!def || def.slot !== 'accessory') return;
      this.equipment = this.equipment || {};
      this.equipment.accessory = id;
      this.renderOverworldStatus();
      this.syncDevConsole();
      this.render();
    },

    devUnequipWeapon() {
      this.equipment = this.equipment || {};
      this.equipment.weapon = null;
      this.renderOverworldStatus();
      this.syncDevConsole();
      this.render();
    },

    devUnequipArmor() {
      this.equipment = this.equipment || {};
      this.equipment.armor = null;
      this.renderOverworldStatus();
      this.syncDevConsole();
      this.render();
    },

    devUnequipAccessory() {
      this.equipment = this.equipment || {};
      this.equipment.accessory = null;
      this.renderOverworldStatus();
      this.syncDevConsole();
      this.render();
    },
  });
}