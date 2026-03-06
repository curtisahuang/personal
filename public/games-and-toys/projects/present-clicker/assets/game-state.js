(function () {
  "use strict";

  /**
   * Core game state and progression math.
   * - Reads producer/upgrade configuration from window.PRESENT_CLICKER_PRODUCERS/UPGRADES
   *   (populated by assets/config.producers.js and assets/config.upgrades.js).
   * - Exposes state and helpers on window.PRESENT_CLICKER for other modules to use.
   */

  var PRODUCERS = window.PRESENT_CLICKER_PRODUCERS || [];
  var UPGRADES = window.PRESENT_CLICKER_UPGRADES || [];

  var state = {
    presents: 0,
    totalPresents: 0,
    presentsPerClick: 1,
    presentsPerSecond: 0,
    producersOwned: {},
    // Per-producer upgrade levels (1 = base). Upgrades can go as high as you can afford.
    producerLevels: {},
    multipliers: {
      global: 1,
      byType: {},
      byId: {}
    },
    purchasedUpgrades: new Set(),
    flags: {
      dyslexiaUnlocked: false
    },
    gates: {
      open: false,
      openedAtMs: 0,
      lastStageIndex: -1,
      ui: null
    },
    // When true, show all producers/upgrades in the UI (even if not yet unlocked).
    // Purchase rules still respect unlock conditions and costs.
    shopsVisible: false,
    devConsole: {
      element: null,
      visible: false,
      presentsInput: null
    }
  };

  var producerById = {};
  PRODUCERS.forEach(function (p) {
    producerById[p.id] = p;
    if (!state.multipliers.byType[p.type]) {
      state.multipliers.byType[p.type] = 1;
    }
    state.producersOwned[p.id] = 0;
    state.producerLevels[p.id] = 1;
  });

  var upgradeById = {};
  UPGRADES.forEach(function (u) {
    upgradeById[u.id] = u;
  });

  function getProducerLevel(producerId) {
    return state.producerLevels[producerId] || 1;
  }

  function getProducerCost(producer) {
    var owned = state.producersOwned[producer.id] || 0;
    var cost = producer.baseCost * Math.pow(producer.costMultiplier, owned);
    return Math.ceil(cost);
  }

  // Upgrade cost scales with producer base cost and current level.
  // Current formula: baseCost * 5 * level^2
  function getProducerUpgradeCost(producer) {
    var level = getProducerLevel(producer.id);
    var cost = producer.baseCost * 5 * Math.pow(level, 2);
    return Math.ceil(cost);
  }

  function getRitualGateBoost() {
    if (!state.gates.open || !state.gates.openedAtMs) return 1;

    var now = performance.now();
    var elapsedSeconds = (now - state.gates.openedAtMs) / 1000;
    if (elapsedSeconds < 0) elapsedSeconds = 0;

    // Exponential decay from ~6.66x down towards 0, clamped at 0.5x.
    // 6.66 * exp(-k * t) = 0.5 at t = 399.6s (~6.66 minutes)
    // => k = ln(6.66 / 0.5) / 399.6
    var initialBoost = 6.66;
    var targetSeconds = 6.66 * 60;
    var k = Math.log(initialBoost / 0.5) / targetSeconds;
    var boost = initialBoost * Math.exp(-k * elapsedSeconds);
    if (boost < 0.5) boost = 0.5;
    return boost;
  }

  function getMultiplierForProducer(producer) {
    var byType = state.multipliers.byType[producer.type] || 1;
    var byId = state.multipliers.byId[producer.id] || 1;
    var result = state.multipliers.global * byType * byId;

    if (producer.type === "ritual") {
      result *= getRitualGateBoost();
    }

    return result;
  }

  function recalcPps() {
    var total = 0;

    PRODUCERS.forEach(function (producer) {
      var owned = state.producersOwned[producer.id] || 0;
      if (!owned) return;

      var level = getProducerLevel(producer.id);
      var unitPps = producer.basePps * level * getMultiplierForProducer(producer);
      total += unitPps * owned;
    });

    state.presentsPerSecond = total;
  }

  function isProducerUnlocked(producer) {
    if (typeof producer.unlockAtPresents === "number" &&
        state.totalPresents < producer.unlockAtPresents) {
      return false;
    }

    if (typeof producer.unlockAtPps === "number" &&
        state.presentsPerSecond < producer.unlockAtPps) {
      return false;
    }

    if (producer.requiresFlag && !state.flags[producer.requiresFlag]) {
      return false;
    }

    return true;
  }

  function isUpgradeUnlocked(upgrade) {
    if (state.purchasedUpgrades.has(upgrade.id)) return false;

    var unlock = upgrade.unlock || {};
    if (typeof unlock.totalPresents === "number" &&
        state.totalPresents < unlock.totalPresents) {
      return false;
    }
    if (typeof unlock.pps === "number" &&
        state.presentsPerSecond < unlock.pps) {
      return false;
    }

    return true;
  }

  function spendPresents(amount) {
    state.presents -= amount;
    if (state.presents < 0) state.presents = 0;
  }

  function earnPresents(amount) {
    state.presents += amount;
    state.totalPresents += amount;
  }

  function applyUpgradeEffect(upgrade) {
    var effect = upgrade.effect;

    if (!effect || !effect.type) return;

    if (effect.type === "ppcMultiplier") {
      state.presentsPerClick *= effect.value;
    } else if (effect.type === "ppcAdd") {
      state.presentsPerClick += effect.value;
    } else if (effect.type === "typeMultiplier") {
      var current = state.multipliers.byType[effect.targetType] || 1;
      state.multipliers.byType[effect.targetType] = current * effect.value;
    } else if (effect.type === "producerMultiplier") {
      var currentIdMulti = state.multipliers.byId[effect.targetId] || 1;
      state.multipliers.byId[effect.targetId] = currentIdMulti * effect.value;
    } else if (effect.type === "globalMultiplier") {
      state.multipliers.global *= effect.value;
    } else if (effect.type === "setFlag") {
      state.flags[effect.flag] = effect.value;
      if (effect.flag === "dyslexiaUnlocked" && effect.value === true) {
        var pc = window.PRESENT_CLICKER;
        var logger = pc && pc.log;
        var addLog = logger && logger.addLog;
        if (typeof addLog === "function") {
          addLog("You stare at the word 'Santa' for too long. Something looks wrong.");
          addLog("The workshop lights flicker. New procurement options whisper into existence.");
        }
      }
    }

    recalcPps();
  }

  // Expose core state and helpers on a single namespace.
  var PC = window.PRESENT_CLICKER || {};
  PC.PRODUCERS = PRODUCERS;
  PC.UPGRADES = UPGRADES;
  PC.state = state;
  PC.producerById = producerById;
  PC.upgradeById = upgradeById;

  PC.getProducerLevel = getProducerLevel;
  PC.getProducerCost = getProducerCost;
  PC.getProducerUpgradeCost = getProducerUpgradeCost;
  PC.getRitualGateBoost = getRitualGateBoost;
  PC.getMultiplierForProducer = getMultiplierForProducer;
  PC.recalcPps = recalcPps;
  PC.isProducerUnlocked = isProducerUnlocked;
  PC.isUpgradeUnlocked = isUpgradeUnlocked;
  PC.spendPresents = spendPresents;
  PC.earnPresents = earnPresents;
  PC.applyUpgradeEffect = applyUpgradeEffect;

  window.PRESENT_CLICKER = PC;
})();