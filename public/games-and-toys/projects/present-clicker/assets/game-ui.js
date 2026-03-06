(function () {
  "use strict";

  /**
   * UI wiring, interactions, and main game loop.
   * Relies on:
   * - window.PRESENT_CLICKER.PRODUCERS / .UPGRADES / .state from game-state.js
   * - window.PRESENT_CLICKER.log.* from game-logging.js
   */

  var PC = window.PRESENT_CLICKER;
  if (!PC) return;

  var PRODUCERS = PC.PRODUCERS || [];
  var UPGRADES = PC.UPGRADES || [];
  var state = PC.state;
  if (!state) return;

  var producerById = PC.producerById || {};
  var upgradeById = PC.upgradeById || {};

  var logModule = PC.log || {};
  var addLog = logModule.addLog || function () {};
  var logProducerPurchase = logModule.logProducerPurchase || function () {};
  var logUpgradePurchase = logModule.logUpgradePurchase || function () {};
  var logShopUpgrade = logModule.logShopUpgrade || function () {};
  var maybeLogMorale = logModule.maybeLogMorale || function () {};
  var updateGatesStatus = logModule.updateGatesStatus || function () {};
  var updateStoryForState = logModule.updateStoryForState || function () {};

  var getProducerCost = PC.getProducerCost;
  var getProducerLevel = PC.getProducerLevel;
  var getProducerUpgradeCost = PC.getProducerUpgradeCost;
  var getRitualGateBoost = PC.getRitualGateBoost;
  var isProducerUnlocked = PC.isProducerUnlocked;
  var isUpgradeUnlocked = PC.isUpgradeUnlocked;
  var recalcPps = PC.recalcPps;
  var spendPresents = PC.spendPresents;
  var earnPresents = PC.earnPresents;

  var presentCountEl = document.getElementById("present-count");
  var ppsCountEl = document.getElementById("pps-count");
  var presentButton = document.getElementById("present-button");
  var producersListEl = document.getElementById("producers-list");
  var upgradesListEl = document.getElementById("upgrades-list");
  var shopsToggleButton = document.getElementById("shops-toggle-button");
  var settingsButton = document.getElementById("settings-button");
  var settingsModal = document.getElementById("settings-modal");
  var settingsCloseButton = settingsModal
    ? settingsModal.querySelector(".settings-close-button")
    : null;

  if (!presentButton || !presentCountEl || !ppsCountEl) {
    return;
  }

  var producerViews = new Map();
  var upgradeViews = new Map();

  function formatNumber(value) {
    if (!isFinite(value)) return "∞";

    // Show full integers (with grouping) up to 1 quadrillion.
    if (Math.abs(value) < 1e15) {
      return Math.floor(value).toLocaleString("en-US");
    }

    // For truly enormous numbers, fall back to compact notation.
    var units = ["K", "M", "B", "T", "Qa", "Qi"];
    var unitIndex = -1;
    var v = value;

    while (v >= 1000 && unitIndex < units.length - 1) {
      v /= 1000;
      unitIndex += 1;
    }

    var decimals;
    if (v < 10) decimals = 2;
    else if (v < 100) decimals = 1;
    else decimals = 0;

    return v.toFixed(decimals) + units[unitIndex];
  }

  function updateStatsUI() {
    presentCountEl.textContent = formatNumber(Math.floor(state.presents));
    ppsCountEl.textContent = formatNumber(state.presentsPerSecond);
  }

  function updateProducersUI() {
    PRODUCERS.forEach(function (producer) {
      var view = producerViews.get(producer.id);
      if (!view) return;

      var unlocked = isProducerUnlocked(producer);
      var revealAll = state.shopsVisible;

      // Visibility: in normal mode only show unlocked; in reveal mode show everything.
      if (!unlocked && !revealAll) {
        view.card.style.display = "none";
        return;
      }
      view.card.style.display = "";

      var cost = getProducerCost(producer);
      var owned = state.producersOwned[producer.id] || 0;
      var level = getProducerLevel(producer.id);
      var unitPps = producer.basePps * level * PC.getMultiplierForProducer(producer);
      var upgradeCost = getProducerUpgradeCost(producer);

      view.costEl.textContent = "Cost: " + formatNumber(cost) + " 🎁";
      view.countEl.textContent = "Owned: " + owned;
      view.ppsEl.textContent = "+" + formatNumber(unitPps) + "/sec each";

      view.levelEl.textContent = "Lvl " + level;
      view.upgradeCostEl.textContent = "Upgrade: " + formatNumber(upgradeCost) + " 🎁";

      var cannotAfford = state.presents < cost;
      if (cannotAfford || !unlocked) {
        view.card.classList.add("shop-card--disabled");
        view.card.setAttribute("aria-disabled", "true");
      } else {
        view.card.classList.remove("shop-card--disabled");
        view.card.setAttribute("aria-disabled", "false");
      }
      view.upgradeButton.disabled = state.presents < upgradeCost || !unlocked;
    });
  }

  function updateShopsVisibility() {
    var revealAll = state.shopsVisible;

    if (shopsToggleButton) {
      shopsToggleButton.textContent = revealAll
        ? "Show only unlocked"
        : "Reveal all shops & upgrades";
      shopsToggleButton.setAttribute("aria-pressed", revealAll ? "true" : "false");
    }

    // Reveal mode affects which cards are visible/enabled.
    updateProducersUI();
    updateUpgradesUI();
  }

  function updateUpgradesUI() {
    UPGRADES.forEach(function (upgrade) {
      var view = upgradeViews.get(upgrade.id);
      if (!view) return;

      var revealAll = state.shopsVisible;
      var purchased = state.purchasedUpgrades.has(upgrade.id);

      // Whether the player has progressed far enough to buy this upgrade.
      var meetsUnlock = isUpgradeUnlocked(upgrade);

      // Hide only if not purchased, not unlocked, and not in reveal-all mode.
      if (!purchased && !meetsUnlock && !revealAll) {
        view.card.style.display = "none";
        return;
      }

      view.card.style.display = "";

      view.costEl.textContent = "Cost: " + formatNumber(upgrade.cost) + " 🎁";

      if (purchased) {
        // Keep purchased upgrades visible in place with a checkmark and greyed-out style.
        view.card.disabled = true;
        view.card.classList.add("shop-card--purchased");
        if (view.purchasedEl) {
          view.purchasedEl.style.display = "";
        }
      } else {
        // Available upgrades remain clickable if affordable.
        view.card.classList.remove("shop-card--purchased");
        if (view.purchasedEl) {
          view.purchasedEl.style.display = "none";
        }

        var canAfford = state.presents >= upgrade.cost && meetsUnlock;
        view.card.disabled = !canAfford;
      }
    });

    updateGatesUI();
  }

  function buyProducer(id) {
    var producer = producerById[id];
    if (!producer) return;
    if (!isProducerUnlocked(producer)) return;

    var cost = getProducerCost(producer);
    if (state.presents < cost) return;

    spendPresents(cost);
    state.producersOwned[id] = (state.producersOwned[id] || 0) + 1;

    logProducerPurchase(producer, state.producersOwned[id]);

    recalcPps();
    updateStatsUI();
    updateProducersUI();
    updateUpgradesUI();
  }

  function upgradeProducer(id) {
    var producer = producerById[id];
    if (!producer) return;
    if (!isProducerUnlocked(producer)) return;

    var upgradeCost = getProducerUpgradeCost(producer);
    if (state.presents < upgradeCost) return;

    spendPresents(upgradeCost);
    state.producerLevels[id] = (state.producerLevels[id] || 1) + 1;
    var newLevel = state.producerLevels[id];

    addLog("You upgrade " + producer.name + " to level " + newLevel + ".");
    logShopUpgrade(producer, newLevel);

    recalcPps();
    updateStatsUI();
    updateProducersUI();
    updateUpgradesUI();
  }

  function buyUpgrade(id) {
    if (state.purchasedUpgrades.has(id)) return;

    var upgrade = upgradeById[id];
    if (!upgrade) return;
    if (!isUpgradeUnlocked(upgrade)) return;
    if (state.presents < upgrade.cost) return;

    spendPresents(upgrade.cost);
    state.purchasedUpgrades.add(id);

    PC.applyUpgradeEffect(upgrade);

    addLog(upgrade.name + " acquired.");
    logUpgradePurchase(upgrade);

    updateStatsUI();
    updateProducersUI();
    updateUpgradesUI();
  }

  function initProducersUI() {
    if (!producersListEl) return;

    PRODUCERS.forEach(function (producer) {
      var card = document.createElement("div");
      card.className = "shop-card";
      card.style.display = "none";

      if (producer.type === "ritual") {
        card.classList.add("shop-card--ritual");
      }

      var top = document.createElement("div");
      top.className = "shop-card-top";

      var left = document.createElement("div");

      var nameEl = document.createElement("div");
      nameEl.className = "shop-card-name";
      nameEl.textContent = producer.name;

      var descEl = document.createElement("div");
      descEl.className = "shop-card-desc";
      descEl.textContent = producer.description;

      left.appendChild(nameEl);
      left.appendChild(descEl);

      var countEl = document.createElement("div");
      countEl.className = "shop-card-count";
      countEl.textContent = "Owned: 0";

      top.appendChild(left);
      top.appendChild(countEl);

      var bottom = document.createElement("div");
      bottom.className = "shop-card-bottom";

      var meta = document.createElement("div");
      meta.className = "shop-card-meta";

      var costEl = document.createElement("span");
      costEl.className = "shop-card-cost";

      var ppsEl = document.createElement("span");
      ppsEl.className = "shop-card-pps";

      var levelEl = document.createElement("span");
      levelEl.className = "shop-card-level";

      meta.appendChild(costEl);
      meta.appendChild(ppsEl);
      meta.appendChild(levelEl);

      var flavorEl = document.createElement("div");
      flavorEl.className = "shop-card-flavor";
      flavorEl.textContent = producer.flavor || "";

      var upgradeRow = document.createElement("div");
      upgradeRow.className = "shop-card-upgrade-row";

      var upgradeButton = document.createElement("button");
      upgradeButton.type = "button";
      upgradeButton.className = "shop-card-upgrade-button";
      var upgradeCostEl = document.createElement("span");
      upgradeCostEl.className = "shop-card-upgrade-cost";
      upgradeButton.appendChild(upgradeCostEl);
      upgradeButton.addEventListener("click", function (event) {
        event.stopPropagation();
        upgradeProducer(producer.id);
      });

      upgradeRow.appendChild(upgradeButton);

      bottom.appendChild(meta);
      bottom.appendChild(flavorEl);
      bottom.appendChild(upgradeRow);

      card.appendChild(top);
      card.appendChild(bottom);

      card.addEventListener("click", function () {
        buyProducer(producer.id);
      });

      producersListEl.appendChild(card);

      producerViews.set(producer.id, {
        card: card,
        costEl: costEl,
        countEl: countEl,
        ppsEl: ppsEl,
        levelEl: levelEl,
        upgradeButton: upgradeButton,
        upgradeCostEl: upgradeCostEl
      });
    });
  }

  function initUpgradesUI() {
    if (!upgradesListEl) return;

    // Normal upgrades
    UPGRADES.forEach(function (upgrade) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "shop-card shop-card--upgrade";
      card.style.display = "none";

      var top = document.createElement("div");
      top.className = "shop-card-top";

      var left = document.createElement("div");
      var nameEl = document.createElement("div");
      nameEl.className = "shop-card-name";
      nameEl.textContent = upgrade.name;

      var descEl = document.createElement("div");
      descEl.className = "shop-card-desc";
      descEl.textContent = upgrade.description;

      left.appendChild(nameEl);
      left.appendChild(descEl);

      top.appendChild(left);

      var bottom = document.createElement("div");
      bottom.className = "shop-card-bottom";

      var meta = document.createElement("div");
      meta.className = "shop-card-meta";

      var costEl = document.createElement("span");
      costEl.className = "shop-card-cost";

      var purchasedEl = document.createElement("span");
      purchasedEl.className = "shop-card-purchased-mark";
      purchasedEl.textContent = "✓ purchased";
      purchasedEl.style.display = "none";

      meta.appendChild(costEl);
      meta.appendChild(purchasedEl);
      bottom.appendChild(meta);

      card.appendChild(top);
      card.appendChild(bottom);

      card.addEventListener("click", function () {
        buyUpgrade(upgrade.id);
      });

      upgradesListEl.appendChild(card);

      upgradeViews.set(upgrade.id, {
        card: card,
        costEl: costEl,
        purchasedEl: purchasedEl
      });
    });

    // Gates toggle card (appears once rituals exist)
    var gatesCard = document.createElement("button");
    gatesCard.type = "button";
    gatesCard.className = "shop-card shop-card--upgrade shop-card--gates";
    gatesCard.style.display = "none";

    var gatesTop = document.createElement("div");
    gatesTop.className = "shop-card-top";

    var gatesLeft = document.createElement("div");
    var gatesNameEl = document.createElement("div");
    gatesNameEl.className = "shop-card-name";
    gatesNameEl.textContent = "OPEN THE GATES";

    var gatesDescEl = document.createElement("div");
    gatesDescEl.className = "shop-card-desc";
    gatesDescEl.textContent = "Trade stability for power. Temporarily supercharge rituals, then watch it all slip.";

    gatesLeft.appendChild(gatesNameEl);
    gatesLeft.appendChild(gatesDescEl);

    gatesTop.appendChild(gatesLeft);

    var gatesBottom = document.createElement("div");
    gatesBottom.className = "shop-card-bottom";

    var gatesMeta = document.createElement("div");
    gatesMeta.className = "shop-card-meta";

    var gatesCostEl = document.createElement("span");
    gatesCostEl.className = "shop-card-cost";

    var gatesStatusEl = document.createElement("span");
    gatesStatusEl.className = "shop-card-pps";

    gatesMeta.appendChild(gatesCostEl);
    gatesMeta.appendChild(gatesStatusEl);

    gatesBottom.appendChild(gatesMeta);

    var gatesFlavorEl = document.createElement("div");
    gatesFlavorEl.className = "shop-card-flavor";
    gatesFlavorEl.textContent = "Costs about one minute of current automatic output each time you open it.";

    gatesBottom.appendChild(gatesFlavorEl);

    gatesCard.appendChild(gatesTop);
    gatesCard.appendChild(gatesBottom);

    gatesCard.addEventListener("click", function () {
      toggleGates();
    });

    // Put the gates card at the top of the upgrades list.
    if (upgradesListEl.firstChild) {
      upgradesListEl.insertBefore(gatesCard, upgradesListEl.firstChild);
    } else {
      upgradesListEl.appendChild(gatesCard);
    }

    state.gates.ui = {
      card: gatesCard,
      nameEl: gatesNameEl,
      descEl: gatesDescEl,
      costEl: gatesCostEl,
      statusEl: gatesStatusEl
    };
  }

  function registerClick() {
    earnPresents(state.presentsPerClick);
    updateStatsUI();
    updateProducersUI();
    updateUpgradesUI();
  }

  function openSettingsModal() {
    if (!settingsModal || !settingsButton) return;
    settingsModal.removeAttribute("hidden");
    settingsButton.setAttribute("aria-expanded", "true");
  }

  function closeSettingsModal() {
    if (!settingsModal || !settingsButton) return;
    settingsModal.setAttribute("hidden", "");
    settingsButton.setAttribute("aria-expanded", "false");
  }

  function attachEvents() {
    presentButton.addEventListener("click", function () {
      presentButton.classList.add("present-button--clicked");
      registerClick();
      window.setTimeout(function () {
        presentButton.classList.remove("present-button--clicked");
      }, 70);
    });

    if (shopsToggleButton) {
      shopsToggleButton.addEventListener("click", function () {
        state.shopsVisible = !state.shopsVisible;
        updateShopsVisibility();
      });
    }

    if (settingsButton && settingsModal) {
      settingsButton.addEventListener("click", function () {
        var isOpen = !settingsModal.hasAttribute("hidden");
        if (isOpen) {
          closeSettingsModal();
        } else {
          openSettingsModal();
        }
      });

      if (settingsCloseButton) {
        settingsCloseButton.addEventListener("click", function () {
          closeSettingsModal();
        });
      }

      settingsModal.addEventListener("click", function (event) {
        if (event.target === settingsModal) {
          closeSettingsModal();
        }
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" || event.key === "Esc") {
          if (!settingsModal.hasAttribute("hidden")) {
            closeSettingsModal();
          }
        }
      });
    }

    // Toggle dev console with the "d" key.
    document.addEventListener("keydown", function (event) {
      // Ignore if focused in an input/textarea to avoid interfering with typing.
      var tag = (event.target && event.target.tagName) ? event.target.tagName.toLowerCase() : "";
      if (tag === "input" || tag === "textarea") return;

      if (event.key === "d" || event.key === "D") {
        if (PC && typeof PC.toggleDevConsole === "function") {
          PC.toggleDevConsole();
        }
      }
    });
  }

  function getGatesToggleCost() {
    var pps = state.presentsPerSecond;
    if (!pps || pps <= 0) return 0;
    // Roughly one minute of current automatic production.
    return Math.ceil(pps * 60);
  }

  function updateGatesBodyClass() {
    if (state.gates.open) {
      document.body.classList.add("gates-open");
    } else {
      document.body.classList.remove("gates-open");
    }
  }

  function openGates() {
    var cost = getGatesToggleCost();
    if (cost > 0 && state.presents < cost) {
      addLog("You reach for the Ritual Circle, but the accounting department shakes its head.");
      return;
    }

    if (cost > 0) {
      spendPresents(cost);
    }

    state.gates.open = true;
    state.gates.openedAtMs = performance.now();
    state.gates.lastStageIndex = -1;

    addLog("You OPEN THE GATES. The Ritual Circle roars like a distant furnace.");
    updateGatesBodyClass();
    recalcPps();
    updateStoryForState();
  }

  function closeGates() {
    if (!state.gates.open) return;

    state.gates.open = false;
    addLog("You CLOSE THE GATES. The workshop exhales, if only a little.");
    addLog("The gates of hell have been closed again and business has returned. But you will be back. Everyone always comes back. HE is not worried.");
    updateGatesBodyClass();
    recalcPps();
    updateStoryForState();
  }

  function toggleGates() {
    if (state.gates.open) {
      closeGates();
    } else {
      openGates();
    }
    updateGatesUI();
    updateStatsUI();
    updateProducersUI();
  }

  function updateGatesUI() {
    if (!state.gates.ui) return;

    var hasRitualCircle = state.producersOwned["ritual_circle"] > 0;
    var ui = state.gates.ui;

    ui.card.style.display = hasRitualCircle ? "" : "none";
    if (!hasRitualCircle) return;

    var cost = getGatesToggleCost();
    if (state.gates.open) {
      ui.nameEl.textContent = "CLOSE THE GATES";
      ui.descEl.textContent = "Seal the circle. Rituals return to their baseline efficiency.";
      ui.costEl.textContent = "Cost: 1 🎁";
      var boost = getRitualGateBoost();
      ui.statusEl.textContent = "Current ritual multiplier: x" + boost.toFixed(2);
      ui.card.disabled = state.presents < 1;
    } else {
      ui.nameEl.textContent = "OPEN THE GATES";
      ui.descEl.textContent = "Summon help from elsewhere. Rituals surge, then slowly slip away.";
      ui.costEl.textContent = "Cost: " + formatNumber(cost) + " 🎁";
      ui.statusEl.textContent = "Effect: Productivity has increased, but at what cost?";
      ui.card.disabled = state.presents < cost || cost === 0;
    }
  }

  function gameLoop() {
    var lastTick = performance.now();

    window.setInterval(function () {
      var now = performance.now();
      var deltaSeconds = (now - lastTick) / 1000;
      lastTick = now;

      // Recompute PPS so time-based effects (gates) stay accurate.
      recalcPps();

      if (state.presentsPerSecond > 0) {
        var gained = state.presentsPerSecond * deltaSeconds;
        earnPresents(gained);
      }

      if (state.gates.open && state.gates.openedAtMs) {
        var elapsedSeconds = (now - state.gates.openedAtMs) / 1000;
        if (elapsedSeconds < 0) elapsedSeconds = 0;
        updateGatesStatus(elapsedSeconds);
      }

      maybeLogMorale(deltaSeconds);
      updateStoryForState();
      updateStatsUI();
      updateProducersUI();
      updateUpgradesUI();

      if (typeof PC.updateDevConsole === "function") {
        PC.updateDevConsole();
      }
    }, 100);
  }

  function init() {
    addLog("You clock in at the workshop. The night stretches ahead.");
    addLog("Santa slides a spreadsheet across the table.");
    addLog("\"Just hit the target,\" he says. \"Whatever it takes.\"");

    updateStoryForState();
    initProducersUI();
    initUpgradesUI();
    recalcPps();
    updateStatsUI();
    updateProducersUI();
    updateUpgradesUI();
    updateShopsVisibility();
    attachEvents();
    gameLoop();
  }

  PC.updateStatsUI = updateStatsUI;
  PC.updateProducersUI = updateProducersUI;
  PC.updateUpgradesUI = updateUpgradesUI;
  PC.updateShopsVisibility = updateShopsVisibility;
  PC.initProducersUI = initProducersUI;
  PC.initUpgradesUI = initUpgradesUI;
  PC.registerClick = registerClick;
  PC.attachEvents = attachEvents;
  PC.getGatesToggleCost = getGatesToggleCost;
  PC.updateGatesUI = updateGatesUI;
  PC.updateGatesBodyClass = updateGatesBodyClass;
  PC.toggleGates = toggleGates;
  PC.gameLoop = gameLoop;
  PC.initGame = init;

  window.PRESENT_CLICKER = PC;
})();