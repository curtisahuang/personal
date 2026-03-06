import { State } from './constants.js';
import { keyToDir } from './utils.js';

export function installInput(Game) {
  Object.assign(Game.prototype, {
    // ---------- INPUT ----------
    bindInputs() {
      const isConfirmKey = (e) => {
        return e.key === 'Enter' || e.key === ' ' || e.key === 'Space' || e.key === 'Spacebar' || e.code === 'Space';
      };
      const isEnterKey = (e) => e.key === 'Enter';
      const isSpaceKey = (e) => e.key === ' ' || e.key === 'Space' || e.key === 'Spacebar' || e.code === 'Space';

      window.addEventListener('keydown', (e) => {
        const target = e.target;
        const tag = (target && target.tagName ? target.tagName.toLowerCase() : '');
        const isEditable = tag === 'input' || tag === 'textarea' || tag === 'select' || (target && target.isContentEditable);

        // While name prompt is open, block global shortcuts and cutscene advance.
        if (this.isNamePromptOpen) {
          if (isEditable) return; // allow typing into the input field
          e.preventDefault();
          return;
        }

        // If typing in any input (e.g., Dev Console fields), let the browser handle keystrokes.
        if (isEditable) {
          return;
        }

        // Toggle dev console with Backquote key
        if (e.code === 'Backquote') {
          this.toggleDev();
          e.preventDefault();
          return;
        }

        // Toggle music with M key
        if (e.code === 'KeyM' || e.key === 'm' || e.key === 'M') {
          if (typeof this.toggleMusic === 'function') {
            this.toggleMusic();
          } else if (typeof this.setMusicEnabled === 'function') {
            this.setMusicEnabled(!(this._musicEnabled === false));
          }
          e.preventDefault();
          return;
        }

        // Toggle hint container with H key (global)
        if (e.code === 'KeyH' || e.key === 'h' || e.key === 'H') {
          if (this.$?.hints) {
            this.$.hints.classList.toggle('hidden');
          }
          // Do not return here so Overworld can also handle H for status when applicable
        }

        // Title screen: Space/Enter to open name prompt
        if (this.current === State.TITLE) {
          if (isConfirmKey(e)) {
            if (!this.isNamePromptOpen) this.showNamePrompt();
            e.preventDefault();
          }
          return;
        }

        if (this.current === State.CUTSCENE) {
          if (isConfirmKey(e)) {
            this.advanceCutscene();
            e.preventDefault();
          }
          return;
        }

        if (this.current === State.GOOD_ENDING) {
          if (isConfirmKey(e)) {
            this.advanceGoodEnding();
            e.preventDefault();
          }
          return;
        }

        if (this.current === State.OVERWORLD) {
          // If an overworld message is active (e.g., special event), allow confirm to advance/dismiss
          if (this.owEventAwaitContinue) {
            if (isConfirmKey(e)) {
              const pages = Array.isArray(this.owEventPages) ? this.owEventPages : null;
              const idx = Number(this.owEventPageIndex) || 0;
              if (pages && idx < pages.length - 1) {
                this.owEventPageIndex = idx + 1;
                this.owEventMessage = String(pages[this.owEventPageIndex] || '');
                this.render();
              } else {
                this.owEventAwaitContinue = false;
                this.owEventMessage = '';
                this.owEventPages = null;
                this.owEventPageIndex = 0;
                this.render();
              }
            }
            e.preventDefault();
            return;
          }

          // Equipment menu handling in overworld
          if (this.equipMenuOpen) {
            // Navigate equipment list
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
              const rows = Array.from(this.$.equipList?.querySelectorAll('.item-row') || []);
              if (rows.length) {
                const dir = e.key === 'ArrowDown' ? 1 : -1;
                this.equipMenuIndex = (this.equipMenuIndex + dir + rows.length) % rows.length;
                rows.forEach((r, idx) => r.classList.toggle('selected', idx === this.equipMenuIndex));
              }
              e.preventDefault();
              return;
            }
            // Equip selected or cancel
            if (isConfirmKey(e)) {
              const rows = Array.from(this.$.equipList?.querySelectorAll('.item-row') || []);
              const row = rows[this.equipMenuIndex];
              if (row) {
                if (row.dataset.cancel) {
                  this.closeEquipMenu();
                } else if (row.dataset.id) {
                  this.equipEquipment(row.dataset.id);
                }
              }
              e.preventDefault();
              return;
            }
            // Escape or E to close menu
            if (e.key === 'Escape' || e.code === 'KeyE' || e.key === 'e' || e.key === 'E') {
              this.closeEquipMenu();
              e.preventDefault();
              return;
            }
            // While equipment menu open, ignore other keys
            e.preventDefault();
            return;
          }
          // Toggle equipment menu
          if (e.code === 'KeyE' || e.key === 'e' || e.key === 'E') {
            this.openEquipMenu();
            e.preventDefault();
            return;
          }
          // Toggle overworld status panel (moved to S key)
          if (e.code === 'KeyS' || e.key === 's' || e.key === 'S') {
            this.showOwStatus = !this.showOwStatus;
            this.renderOverworldStatus();
            e.preventDefault();
            return;
          }

          // Allow interacting with shimmering forest tile without moving (Enter/Space)
          if (isConfirmKey(e)) {
            const st = this.shimmerTiles || {};
            const f = st.forest;
            if (f && f.x === this.player.x && f.y === this.player.y) {
              const wearingCloak = this.equipment?.armor === 'cloak_heavenly_thunder';
              if (wearingCloak && !this.foundRevealingSword) {
                this.foundRevealingSword = true;
                if (this.shimmerTiles) delete this.shimmerTiles.forest;
                this.equipmentInventory = this.equipmentInventory || {};
                this.equipmentInventory['sword_revealing_light'] = (this.equipmentInventory['sword_revealing_light'] || 0) + 1;

                this.showOwEventMessage(
                  'You see something ghostly in between the trees. Your cloak suddenly begins to waver and a sword materialises in front of you.\n\n' +
                  "It weighs like a feather and cuts like nothing you've ever seen."
                );

                this.syncDevConsole();
                e.preventDefault();
                return;
              }
              if (!wearingCloak) {
                this.showOwEventMessage("Something shimmers from the between the trees, almost ghostlike. It's probably nothing though...");
                e.preventDefault();
                return;
              }
            }
          }

          const dir = keyToDir(e.key);
          if (dir) {
            const nx = this.player.x + dir.x;
            const ny = this.player.y + dir.y;
            if (this.inBounds(nx, ny) && this.isWalkable(nx, ny)) {
              const tileAfter = this.getTile(nx, ny);
              this.player.x = nx;
              this.player.y = ny;

              // Check special overworld event: shimmering desert tile -> grant Boots of Divine Wind
              {
                const st = this.shimmerTiles || {};
                const d = st.desert;
                if (d && d.x === nx && d.y === ny && !this.foundDivineWindBoots) {
                  this.foundDivineWindBoots = true;
                  // Remove shimmer marker for desert tile so it doesn't keep shimmering
                  if (this.shimmerTiles) {
                    delete this.shimmerTiles.desert;
                  }
                  // Grant the accessory
                  this.equipmentInventory = this.equipmentInventory || {};
                  this.equipmentInventory['boots_divine_wind'] = (this.equipmentInventory['boots_divine_wind'] || 0) + 1;

                  // Show message overlay (reusing dialogue box UI) with paginated dialogue
                  this.showOwEventMessage("Your foot catches something in the sand. It shines with a divine light. When you put them on, you feel like the gods have lightened your load.");
                  // Refresh dev console for visibility (render() already called)
                  this.syncDevConsole();
                  e.preventDefault();
                  return;
                }
              }

              // Check special overworld event: shimmering mountain tile -> grant Cloak of Heavenly Thunder
              {
                const st = this.shimmerTiles || {};
                const m = st.mountain;
                if (m && m.x === nx && m.y === ny && !this.foundHeavenlyCloak) {
                  // Can only reach this if you can walk on mountains (Boots of Divine Wind equipped)
                  this.foundHeavenlyCloak = true;
                  // Remove shimmer marker for mountain tile
                  if (this.shimmerTiles) {
                    delete this.shimmerTiles.mountain;
                  }
                  // Grant the armor
                  this.equipmentInventory = this.equipmentInventory || {};
                  this.equipmentInventory['cloak_heavenly_thunder'] = (this.equipmentInventory['cloak_heavenly_thunder'] || 0) + 1;

                  // Show message overlay with paginated dialogue
                  this.showOwEventMessage("The cold wind blows. As you seek shelter in a cave, you see something against a rock. It has a strength you have never seen before.");
                  // Refresh dev console for visibility (render() already called)
                  this.syncDevConsole();
                  e.preventDefault();
                  return;
                }
              }

              // Check special overworld event: shimmering forest tile -> grant Sword of Revealing Light (requires Cloak equipped)
              {
                const st = this.shimmerTiles || {};
                const f = st.forest;
                if (f && f.x === nx && f.y === ny) {
                  const wearingCloak = this.equipment?.armor === 'cloak_heavenly_thunder';
                  if (wearingCloak && !this.foundRevealingSword) {
                    this.foundRevealingSword = true;
                    // Remove shimmer marker for forest tile
                    if (this.shimmerTiles) {
                      delete this.shimmerTiles.forest;
                    }
                    // Grant the sword
                    this.equipmentInventory = this.equipmentInventory || {};
                    this.equipmentInventory['sword_revealing_light'] = (this.equipmentInventory['sword_revealing_light'] || 0) + 1;

                    // Show paginated message (combine paragraphs; pagination will split into pages to fit box)
                    this.showOwEventMessage(
                      'You see something ghostly in between the trees. Your cloak suddenly begins to waver and a sword materialises in front of you.\n\n' +
                      "It weighs like a feather and cuts like nothing you've ever seen."
                    );

                    // Refresh dev console for visibility (render() already called)
                    this.syncDevConsole();
                    e.preventDefault();
                    return;
                  }
                  // Cloak not equipped: show small hint
                  if (!wearingCloak) {
                    this.showOwEventMessage("Something shimmers from the between the trees, almost ghostlike. It's probably nothing though...");
                    e.preventDefault();
                    return;
                  }
                }
              }

              if (tileAfter === 'goal') {
                // Enter the Castle scene instead of ending the demo
                this.startShop('castle');
              } else if (tileAfter === 'shop') {
                this.startShop('shop');
              } else if (tileAfter === 'smith') {
                this.startShop('blacksmith');
              } else if (tileAfter === 'temple') {
                this.startShop('temple');
              } else if (tileAfter === 'inn') {
                this.startShop('inn');
              } else {
                const chance = this.tileEncounterChance(nx, ny);
                if (Math.random() < chance) {
                  this.startCombat();
                } else {
                  this.render();
                  this.syncDevConsole();
                }
              }
            }
            e.preventDefault();
          }
          return;
        }

        if (this.current === State.SHOP) {
          // If buy/learn menu is open, handle its navigation first
          if (this.shopBuyOpen) {
            if (this.shopAwaitContinue) {
              if (isConfirmKey(e) || e.key === 'Escape') {
                if (typeof this.advanceShopDialogue === 'function') {
                  this.advanceShopDialogue();
                } else {
                  this.shopAwaitContinue = false;
                  this.shopMessage = '';
                  this.renderShopMessage();
                  this.updateShopChoicesVisibility();
                }
                e.preventDefault();
                return;
              }
              e.preventDefault();
              return;
            }
            // Navigate items
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
              const rows = Array.from(this.$.shopList?.querySelectorAll('.item-row') || []);
              if (rows.length) {
                const dir = e.key === 'ArrowDown' ? 1 : -1;
                this.shopBuyIndex = (this.shopBuyIndex + dir + rows.length) % rows.length;
                rows.forEach((r, idx) => r.classList.toggle('selected', idx === this.shopBuyIndex));
              }
              e.preventDefault();
              return;
            }
            // Select action or cancel
            if (isConfirmKey(e)) {
              const rows = Array.from(this.$.shopList?.querySelectorAll('.item-row') || []);
              const row = rows[this.shopBuyIndex];
              if (row) {
                if (row.dataset.cancel) {
                  this.closeShopMenu();
                } else if (row.dataset.id) {
                  const mode = String(this.shopMenuMode || 'buy');
                  if (mode === 'learn') {
                    this.selectTempleLore(row.dataset.id);
                  } else {
                    this.purchaseShopItem(row.dataset.id);
                  }
                }
              }
              e.preventDefault();
              return;
            }
            // Escape to close buy/learn menu
            if (e.key === 'Escape') {
              this.closeShopMenu();
              e.preventDefault();
              return;
            }
            e.preventDefault();
            return;
          }
          // If showing a message (after Talk), allow Space/Enter to advance/dismiss
          if (isConfirmKey(e) && this.shopAwaitContinue) {
            if (typeof this.advanceShopDialogue === 'function') {
              this.advanceShopDialogue();
            } else {
              this.shopAwaitContinue = false;
              this.shopMessage = '';
              this.renderShopMessage();
              this.updateShopChoicesVisibility();
            }
            e.preventDefault();
            return;
          }
          // Navigate options
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            const dir = e.key === 'ArrowRight' ? 1 : -1;
            const els = this.$.shopChoices || [];
            const visible = els.filter(el => !el.classList.contains('hidden'));
            const total = this.isCastle ? 2 : (visible.length || 2);
            this.shopChoiceIndex = (this.shopChoiceIndex + dir + total) % total;
            this.renderShopChoices();
            e.preventDefault();
            return;
          }
          // Confirm current selection
          if (isSpaceKey(e) || isEnterKey(e)) {
            this.confirmShopChoice();
            e.preventDefault();
            return;
          }
          return;
        }

        if (this.current === State.COMBAT) {
          // If the item menu is open, handle its navigation first
          if (this.itemMenuOpen) {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
              const rows = Array.from(this.$.itemList?.querySelectorAll('.item-row') || []);
              if (rows.length) {
                const dir = e.key === 'ArrowDown' ? 1 : -1;
                this.itemMenuIndex = (this.itemMenuIndex + dir + rows.length) % rows.length;
                rows.forEach((r, idx) => r.classList.toggle('selected', idx === this.itemMenuIndex));
              }
              e.preventDefault();
              return;
            }
            if (isConfirmKey(e)) {
              const rows = Array.from(this.$.itemList?.querySelectorAll('.item-row') || []);
              const row = rows[this.itemMenuIndex];
              if (row) {
                if (row.dataset.cancel) {
                  this.closeItemMenu();
                } else if (row.dataset.id) {
                  this.useItemInCombat(row.dataset.id);
                }
              }
              e.preventDefault();
              return;
            }
            if (e.key === 'Escape') {
              this.closeItemMenu();
              e.preventDefault();
              return;
            }
            e.preventDefault();
            return;
          }

          if (this.isTyping) {
            if (isConfirmKey(e)) {
              this.skipTyping();
              e.preventDefault();
            }
            return;
          }

          if (this.awaitContinue) {
            if (isConfirmKey(e)) {
              this.resolvePostCombat();
              e.preventDefault();
            }
            return;
          }

          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            const dir = e.key === 'ArrowRight' ? 1 : -1;
            const total = this.$.choices.length;
                       this.choiceIndex = (this.choiceIndex + dir + total) % total;
            this.renderChoices();
            e.preventDefault();
            return;
          }
          if (isSpaceKey(e) || isEnterKey(e)) {
            this.confirmChoice();
            e.preventDefault();
            return;
          }
          return;
        }
      });

      // Global click to advance cutscene anywhere on screen
      window.addEventListener('click', () => {
        if (this.current === State.TITLE) {
          if (!this.isNamePromptOpen) this.showNamePrompt();
          return;
        }
        if (this.current === State.CUTSCENE) {
          if (this.isNamePromptOpen) return; // do not advance while name prompt is active
          this.advanceCutscene();
        } else if (this.current === State.GOOD_ENDING) {
          this.advanceGoodEnding();
        } else if (this.current === State.OVERWORLD && this.owEventAwaitContinue) {
          const pages = Array.isArray(this.owEventPages) ? this.owEventPages : null;
          const idx = Number(this.owEventPageIndex) || 0;
          if (pages && idx < pages.length - 1) {
            this.owEventPageIndex = idx + 1;
            this.owEventMessage = String(pages[this.owEventPageIndex] || '');
            this.render();
          } else {
            this.owEventAwaitContinue = false;
            this.owEventMessage = '';
            this.owEventPages = null;
            this.owEventPageIndex = 0;
            this.render();
          }
        }
      });
    },
  });
}