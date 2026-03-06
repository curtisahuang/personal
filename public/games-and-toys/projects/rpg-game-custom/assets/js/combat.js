import { State } from './constants.js';
import { clamp } from './utils.js';

export function installCombat(Game) {
  Object.assign(Game.prototype, {
    startCombat(enemyId) {
      this.current = State.COMBAT;
      this.choiceIndex = 0;
      this.awaitContinue = null;
      this.turn = 1;
      this.flexBuffTurn = null;
      this.itemMenuOpen = false;
      this.itemMenuIndex = 0;
      this.combatBuffs = { atk: 0, def: 0, spe: 0, luc: 0 };
      this.closeEquipMenu();
      this.stopTyping(false);
      this.lastCombatMessage = null;
      this.playMusic && this.playMusic('battle');

      const tpl = this.enemyTypes[enemyId] || this.pickRandomEnemyForTile(this.player.x, this.player.y);

      const s = tpl.stats;
      this.enemy = {
        id: tpl.id,
        name: tpl.name,
        maxHp: s.maxHp,
        hp: s.maxHp,
        atk: s.atk,
        def: s.def,
        spe: s.spe,
        luc: s.luc,
        rewards: { ...tpl.rewards },
        sprite: { ...tpl.sprite },
      };

      this.applyEnemySprite(this.enemy.sprite);
      this._lastEnemyHp = this.enemy.hp;
      this.updateEnemyHpBarLayout();
      this.updateEnemyHpBarFill();

      this.combatPages = null;
      this.combatPageEffects = null;
      this.combatPageApplied = null;
      this.combatPageIndex = 0;
      this._advanceTurnAfterPages = false;
      this._pendingEnd = null;
      this.combatMessage = [`${this.enemy.name} approaches!`, 'What will you do?'].join('\n');
      this.render();
      if (this.enemy.sprite && this.enemy.sprite.animated) {
        this.startEnemyAnim();
      } else {
        this.stopEnemyAnim();
      }
      this.syncDevConsole();
    },

    confirmChoice() {
      if (this.choiceIndex === 0) {
        this.runCombatRound('attack');
      } else if (this.choiceIndex === 1) {
        this.runCombatRound('flex');
      } else if (this.choiceIndex === 2) {
        this.openItemMenu();
      } else {
        this.runCombatRound('run');
      }
    },

    runCombatRound(action = 'attack', itemId = null) {
      if (!this.enemy) return;

      // Reset any in-progress page sequence for the turn
      this.combatPages = null;
      this.combatPageEffects = null;
      this.combatPageApplied = null;
      this.combatPageIndex = 0;
      this._advanceTurnAfterPages = false;
      this._pendingEnd = null;

      const pages = [];
      const effects = [];

      const pushPage = (text, effect) => {
        pages.push(text);
        effects.push(typeof effect === 'function' ? effect : () => {});
      };

      const eff = this.getEffectiveStats();
      const order = eff.spe >= this.enemy.spe ? ['player', 'enemy'] : ['enemy', 'player'];
      let playerBuffActive = this.flexBuffTurn === this.turn;

      const extras = (typeof this.getEquipmentExtraEffects === 'function') ? this.getEquipmentExtraEffects() : null;

      const makeAttackPage = (attacker) => {
        const isPlayer = attacker === 'player';

        const baseEff = this.getEffectiveStats();
        const effPlayer = {
          name: 'You',
          atk: playerBuffActive ? Math.ceil(baseEff.atk * this.flexMultiplier) : baseEff.atk,
          def: playerBuffActive ? Math.ceil(baseEff.def * this.flexMultiplier) : baseEff.def,
          spe: baseEff.spe,
          luc: baseEff.luc,
        };
        const effEnemy = {
          name: this.enemy?.name || 'Enemy',
          atk: this.enemy.atk,
          def: this.enemy.def,
          spe: this.enemy.spe,
          luc: this.enemy.luc,
        };

        const A = isPlayer ? effPlayer : effEnemy;
        const D = isPlayer ? effEnemy : effPlayer;

        const lines = [];

        // Hit chance
        let hitChance = Math.max(0, 100 - D.luc);
        if (!isPlayer && extras) {
          const dodgeBonus = Math.max(0, Number(extras.dodgeBonusPct) || 0);
          hitChance = clamp(hitChance - dodgeBonus, 0, 100);
        }
        const hitRoll = Math.random() * 100;
        const miss = hitRoll >= hitChance;

        if (miss) {
          if (isPlayer) {
            lines.push('You attack! You missed! You deal 0 hp damage.');
          } else {
            lines.push(`${A.name} attacks! ${A.name} missed! ${A.name} deals 0 hp damage.`);
          }
          pushPage(lines.join('\n'), () => {
            // no-ops on miss besides showing message
          });
          return { end: null };
        }

        // Critical chance
        const baseCrit = A.spe / 2;
        const critBonus = isPlayer && extras ? (Number(extras.critBonusPct) || 0) : 0;
        const critEvade = (Number(D.luc) || 0) / 2;
        const finalCritChance = clamp(baseCrit + critBonus - critEvade, 0, 100);
        const crit = (Math.random() * 100) < finalCritChance;
        const mult = crit ? 3 : 1;
        let dmg = Math.max(1, A.atk * mult - D.def);

        // Sword of Revealing Light: doubles player's damage against the Necromancer
        if (isPlayer) {
          const wIdNow = this.equipment?.weapon || null;
          if (wIdNow === 'sword_revealing_light' && (this.enemy?.id === 'necromancer')) {
            dmg = Math.max(1, Math.ceil(dmg * 2));
          }
        }

        // Player damage taken multiplier from equips
        if (!isPlayer && extras && (Number(extras.dmgTakenMult) || 1) !== 1) {
          const m = Number(extras.dmgTakenMult) || 1;
          dmg = Math.max(1, Math.ceil(dmg * m));
        }

        const critText = crit ? 'CRITICAL DAMAGE! ' : '';
        if (isPlayer) {
          lines.push(`You attack! ${critText}You deal ${dmg} hp damage.`);
        } else {
          lines.push(`${A.name} attacks! ${critText}${A.name} deals ${dmg} hp damage.`);
        }

        // Predict results and build effect closure (apply on page show)
        let predictedEnemyHp = this.enemy.hp;
        let predictedPlayerHp = this.hp;

        if (isPlayer) {
          predictedEnemyHp = Math.max(0, this.enemy.hp - dmg);
        } else {
          predictedPlayerHp = Math.max(0, this.hp - dmg);
        }

        // Player on-hit item effects (deterministically pre-roll)
        let bsHeal = 0;
        let goldenGain = 0;
        let cursedHit = false;
        if (isPlayer) {
          const wId = this.equipment?.weapon || null;
          if (wId === 'blood_sword') {
            bsHeal = Math.max(0, Math.floor(dmg * 0.5));
            // message will include the heal actually applied (we'll recompute at apply time)
            // but include the line here for immediate readability
            // we'll compute actual healed value on effect and leave message text as-is
            // (minor differences are unlikely as this page applies before enemy acts)
            if (bsHeal > 0) {
              lines.push(`Bloodsword restores ${bsHeal} HP.`);
            }
          } else if (wId === 'golden_sword') {
            if (Math.random() < 0.10) {
              goldenGain = Math.max(1, Math.floor(effPlayer.atk));
              lines.push(`Golden Sword glitters! +${goldenGain} Gold.`);
            }
          }
          if (wId === 'cursed_sword') {
            if (Math.random() < 0.10) {
              cursedHit = true;
              lines.push('The Cursed Sword backfires! You take 5 hp damage.');
              predictedPlayerHp = Math.max(0, predictedPlayerHp - 5);
            }
          }
        }

        const end =
          (isPlayer && predictedEnemyHp <= 0) ? 'win' :
          (!isPlayer && predictedPlayerHp <= 0) ? 'lose' :
          null;

        const effect = () => {
          if (isPlayer) {
            this.enemy.hp = Math.max(0, predictedEnemyHp);
            this.shakeEnemy();
          } else {
            this.hp = Math.max(0, predictedPlayerHp);
            this.shakePlayer();
          }
          // Apply on-hit extras for player AFTER main damage
          if (isPlayer) {
            if (bsHeal > 0) {
              const before = this.hp;
              this.hp = Math.min(this.stats.maxHp, Math.max(0, this.hp + bsHeal));
              // We don't update the message value mid-page; bars reflect true heal.
            }
            if (goldenGain > 0) {
              this.stats.gold += goldenGain;
            }
            if (cursedHit) {
              // already included in predictedPlayerHp; ensure shake applied once
              this.shakePlayer();
            }
          }
          // Update bars immediately to match message
          this.renderStatus();
        };

        pushPage(lines.join('\n'), effect);
        return { end };
      };

      const makeItemUsePage = () => {
        const def = this.itemDefs[itemId];
        const qty = this.inventory[itemId] || 0;
        if (!def || qty <= 0) {
          pushPage('You check your bag... but have nothing to use.');
          return;
        }

        if (def.type === 'heal') {
          const amt = Math.max(0, Number(def.amount) || 0);
          pushPage(`You use ${def.name}! Restored ${amt} HP.`, () => {
            const before = this.hp;
            this.hp = Math.min(this.stats.maxHp, Math.max(0, this.hp + amt));
            this.inventory[itemId] = Math.max(0, qty - 1);
            this.renderStatus();
          });
          return;
        }

        if (def.type === 'fullheal') {
          const amt = Math.max(0, this.stats.maxHp);
          pushPage(`You use ${def.name}! Fully restored ${amt} HP.`, () => {
            this.hp = Math.min(this.stats.maxHp, Math.max(0, this.stats.maxHp));
            this.inventory[itemId] = Math.max(0, qty - 1);
            this.renderStatus();
          });
          return;
        }

        if (def.type === 'buff') {
          const stat = String(def.stat || '').toLowerCase();
          const start = Math.max(0, Number(def.start) || 0);
          if (['atk','def','spe','luc'].includes(stat) && start > 0) {
            const statName = stat === 'atk' ? 'Attack' : stat === 'def' ? 'Defense' : stat === 'spe' ? 'Speed' : 'Luck';
            pushPage(`You use ${def.name}! ${statName} +${start}. Buff will decay by 1 each turn.`, () => {
              if (!this.combatBuffs) this.combatBuffs = { atk: 0, def: 0, spe: 0, luc: 0 };
              this.combatBuffs[stat] = (Number(this.combatBuffs[stat]) || 0) + start;
              this.inventory[itemId] = Math.max(0, qty - 1);
              this.renderStatus();
            });
            return;
          }
          pushPage(`You use ${def.name}.`, () => {
            this.inventory[itemId] = Math.max(0, qty - 1);
          });
          return;
        }

        if (def.type === 'reward') {
          const target = String(def.reward || '').toLowerCase(); // 'xp' or 'gold'
          const mult = Math.max(1, Number(def.multiplier) || 1);
          const battles = Math.max(0, Number(def.battles) || 0);
          if (target === 'xp' || target === 'gold') {
            const label = target === 'xp' ? 'EXP' : 'Gold';
            pushPage(`You use ${def.name}! ${label} gains will be multiplied by ${mult} for ${battles} battles.`, () => {
              if (!this.rewardMult) this.rewardMult = { xp: 1, gold: 1 };
              if (!this.rewardMultLeft) this.rewardMultLeft = { xp: 0, gold: 0 };
              this.rewardMult[target] = mult;
              this.rewardMultLeft[target] = battles;
              this.inventory[itemId] = Math.max(0, qty - 1);
            });
            return;
          }
          pushPage(`You use ${def.name}.`, () => {
            this.inventory[itemId] = Math.max(0, qty - 1);
          });
          return;
        }

        pushPage(`You use ${def.name}.`, () => {
          this.inventory[itemId] = Math.max(0, qty - 1);
        });
      };

      if (action === 'flex') {
        const cost = 2;
        const curSp = Math.max(0, Number(this.sp) || 0);
        if (curSp < cost) {
          pushPage(`You attempt to flex... but you don't have enough SP! (${cost} SP required)`);
          // No turn advance; just show the page and return to prompt
          this.combatPages = pages;
          this.combatPageEffects = effects;
          this.combatPageApplied = pages.map(() => false);
          this.combatPageIndex = 0;
          this.awaitContinue = 'turn';
          // Apply effect for first page (none)
          this._applyCombatPageEffect(0);
          this.combatMessage = this.combatPages[0] || '';
          this.renderCombatMessage();
          this.updateChoicesVisibility();
          return;
        }

        // Page 1: pay SP and apply buff (takes effect immediately for enemy's action)
        pushPage('You flex! Attack and Defense are boosted this turn and next turn.', () => {
          this.sp = Math.max(0, curSp - cost);
          this.flexBuffTurn = this.turn + 1;
          this.renderStatus();
        });
        playerBuffActive = true;

        // Enemy takes their action this turn
        const res = makeAttackPage('enemy');
        if (res.end) this._pendingEnd = res.end;

        this._advanceTurnAfterPages = !this._pendingEnd;
        this.combatPages = pages;
        this.combatPageEffects = effects;
        this.combatPageApplied = pages.map(() => false);
        this.combatPageIndex = 0;
        this.awaitContinue = 'turn';
        // Apply effect for first page to match message (SP deduction)
        this._applyCombatPageEffect(0);
        this.combatMessage = this.combatPages[0] || '';
        this.renderCombatMessage();
        this.updateChoicesVisibility();
        return;
      } else if (action === 'run') {
        const effRun = this.getEffectiveStats();
        const chance = clamp(effRun.spe * 5 + effRun.luc * 2, 0, 100);
        if (Math.random() * 100 < chance) {
          this.finishCombat('run');
          return;
        } else {
          pushPage('You try to run... Failed!');
          const res = makeAttackPage('enemy');
          if (res.end) this._pendingEnd = res.end;

          this._advanceTurnAfterPages = !this._pendingEnd;
          this.combatPages = pages;
          this.combatPageEffects = effects;
          this.combatPageApplied = pages.map(() => false);
          this.combatPageIndex = 0;
          this.awaitContinue = 'turn';
          this._applyCombatPageEffect(0);
          this.combatMessage = this.combatPages[0] || '';
          this.renderCombatMessage();
          this.updateChoicesVisibility();
          return;
        }
      } else if (action === 'item') {
        for (const who of order) {
          if (who === 'enemy') {
            const res = makeAttackPage('enemy');
            if (res.end) {
              this._pendingEnd = res.end;
              break;
            }
          } else {
            makeItemUsePage();
          }
        }
        this._advanceTurnAfterPages = !this._pendingEnd;
        this.combatPages = pages;
        this.combatPageEffects = effects;
        this.combatPageApplied = pages.map(() => false);
        this.combatPageIndex = 0;
        this.awaitContinue = 'turn';
        this._applyCombatPageEffect(0);
        this.combatMessage = this.combatPages[0] || '';
        this.renderCombatMessage();
        this.updateChoicesVisibility();
        return;
      }

      // Default: attack exchange in order
      for (const who of order) {
        const res = makeAttackPage(who);
        if (res.end) { this._pendingEnd = res.end; break; }
      }

      this._advanceTurnAfterPages = !this._pendingEnd;
      this.combatPages = pages;
      this.combatPageEffects = effects;
      this.combatPageApplied = pages.map(() => false);
      this.combatPageIndex = 0;
      this.awaitContinue = 'turn';
      this._applyCombatPageEffect(0);
      this.combatMessage = this.combatPages[0] || '';
      this.renderCombatMessage();
      this.updateChoicesVisibility();
    },

    _applyCombatPageEffect(index) {
      const effects = Array.isArray(this.combatPageEffects) ? this.combatPageEffects : null;
      const applied = Array.isArray(this.combatPageApplied) ? this.combatPageApplied : null;
      const idx = Math.max(0, Number(index) || 0);
      if (!effects || !applied) return;
      if (idx < 0 || idx >= effects.length) return;
      if (applied[idx]) return;
      applied[idx] = true;
      const fn = effects[idx];
      if (typeof fn === 'function') {
        fn.call(this);
      }
      // Bars/status reflect the effect immediately
      this.renderStatus();
    },

    finishCombat(outcome) {
      if (outcome === 'win') {
        const r = this.enemy?.rewards || { xp: 0, gold: 0 };
        const xpMult = Math.max(1, Number(this.rewardMult?.xp) || 1);
        const goldMult = Math.max(1, Number(this.rewardMult?.gold) || 1);
        const extras = (typeof this.getEquipmentExtraEffects === 'function') ? this.getEquipmentExtraEffects() : null;
        const xpEquip = Math.max(0, Number(extras?.xpMult) || 1);
        const goldEquip = Math.max(0, Number(extras?.goldMult) || 1);
        const xpGain = Math.floor((Number(r.xp) || 0) * xpMult * xpEquip);
        const goldGain = Math.floor((Number(r.gold) || 0) * goldMult * goldEquip);

        this.stats.xp += xpGain;
        this.stats.gold += goldGain;

        const usedXpBoost = (this.rewardMult?.xp || 1) > 1 && (this.rewardMultLeft?.xp || 0) > 0;
        const usedGoldBoost = (this.rewardMult?.gold || 1) > 1 && (this.rewardMultLeft?.gold || 0) > 0;

        if (this.rewardMultLeft) {
          if ((this.rewardMultLeft.xp || 0) > 0) {
            this.rewardMultLeft.xp -= 1;
            if (this.rewardMultLeft.xp <= 0) this.rewardMult.xp = 1;
          }
          if ((this.rewardMultLeft.gold || 0) > 0) {
            this.rewardMultLeft.gold -= 1;
            if (this.rewardMultLeft.gold <= 0) this.rewardMult.gold = 1;
          }
        }

        // If this was the final boss battle (castle -> necromancer), prepare to route to Good Ending
        this._finalWinPendingGoodEnding = !!this.isFinalBossBattle && (this.enemy?.id === 'necromancer');

        const levelUpText = this.processLevelUpsAfterReward();

        const page1 = [];
        page1.push(`Victory! You gained ${xpGain} EXP and ${goldGain} Gold.`);
        if (usedXpBoost) {
          const rem = Math.max(0, this.rewardMultLeft?.xp || 0);
          page1.push(`Aevyn's Insight empowered your EXP! (${xpMult}x, ${rem} battles remain)`);
        }
        if (usedGoldBoost) {
          const rem = Math.max(0, this.rewardMultLeft?.gold || 0);
          page1.push(`Thalor's Tithe enriched your Gold! (${goldMult}x, ${rem} battles remain)`);
        }

        const pages = [];
        pages.push(page1.join('\n'));
        if (levelUpText) {
          pages.push(levelUpText);
        }

        this.postCombatPages = pages;
        this.postCombatPageIndex = 0;
        this.combatMessage = this.postCombatPages[this.postCombatPageIndex] || '';
        this.renderStatus();
        this.renderOverworldStatus();
        this.renderCombatMessage();

        this.awaitContinue = 'post';
        this.updateChoicesVisibility();
        return;
      }
      if (outcome === 'run') {
        this.postCombatPages = null;
        this.postCombatPageIndex = 0;
        this.combatMessage = 'You ran away!';
        this.renderCombatMessage();
        this.awaitContinue = 'run';
        this.updateChoicesVisibility();
        return;
      }
      if (outcome === 'lose') {
        const defeatedBy = this.enemy?.name || 'your foe';
        this.enemy = null;
        this.postCombatPages = null;
        this.postCombatPageIndex = 0;
        this.combatMessage = `You were defeated by ${defeatedBy}. Here ends your journey. Try again?`;
        this.renderCombatMessage();
        this.awaitContinue = 'lose';
        this.updateChoicesVisibility();
        return;
      }
    },

    // Weighted enemy selection with variant chance
    pickRandomEnemyForTile(x, y) {
      const table = Array.isArray(this.encounterTable) ? this.encounterTable : [];
      const sum = table.reduce((acc, e) => acc + Math.max(0, Number(e.weight) || 0), 0) || 1;
      let r = Math.random();
      let pick = table[0]?.id || 'slime';
      let cum = 0;
      for (const e of table) {
        const w = (Math.max(0, Number(e.weight) || 0)) / sum;
        cum += w;
        if (r <= cum) { pick = e.id; break; }
      }
      const vId = this.variantMap?.[pick];
      // Double variant chance when standing on a swamp tile
      let vChance = Number(this.variantChance) || 0;
      const tileHere = (typeof this.getTile === 'function') ? this.getTile(x, y) : null;
      if (tileHere === 'swamp') {
        vChance = Math.min(1, vChance * 2);
      }
      if (vId && Math.random() < vChance) {
        pick = vId;
      }
      return this.enemyTypes[pick] || this.enemyTypes.slime;
    },
  });
}