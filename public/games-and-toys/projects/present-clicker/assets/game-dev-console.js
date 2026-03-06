(function () {
  "use strict";

  /**
   * Developer console (toggled with "d").
   * Allows tweaking state for testing, without persisting changes.
   */

  var PC = window.PRESENT_CLICKER;
  if (!PC) return;

  var state = PC.state;
  if (!state) return;

  var PRODUCERS = PC.PRODUCERS || [];
  var UPGRADES = PC.UPGRADES || [];

  var recalcPps = PC.recalcPps || function () {};
  var updateStatsUI = PC.updateStatsUI || function () {};
  var updateProducersUI = PC.updateProducersUI || function () {};
  var updateUpgradesUI = PC.updateUpgradesUI || function () {};
  var applyUpgradeEffect = PC.applyUpgradeEffect || function () {};

  function buildDevConsole() {
    if (state.devConsole.element) return;

    var container = document.createElement("div");
    container.className = "dev-console";

    var header = document.createElement("div");
    header.className = "dev-console-header";

    var title = document.createElement("div");
    title.className = "dev-console-title";
    title.textContent = "Dev Console";

    var hint = document.createElement("div");
    hint.className = "dev-console-hint";
    hint.textContent = "Press \"d\" to toggle";

    header.appendChild(title);
    header.appendChild(hint);

    var body = document.createElement("div");
    body.className = "dev-console-body";

    // Global section
    var globalSection = document.createElement("div");
    globalSection.className = "dev-console-section";

    var globalTitle = document.createElement("div");
    globalTitle.className = "dev-console-section-title";
    globalTitle.textContent = "Global";

    var presentsRow = document.createElement("div");
    presentsRow.className = "dev-console-row";
    var presentsLabel = document.createElement("label");
    presentsLabel.textContent = "Presents";
    var presentsInput = document.createElement("input");
    presentsInput.type = "number";
    presentsInput.min = "0";
    presentsInput.className = "dev-console-input";

    var presentsApply = document.createElement("button");
    presentsApply.type = "button";
    presentsApply.className = "dev-console-button";
    presentsApply.textContent = "Set";

    presentsApply.addEventListener("click", function () {
      var value = parseFloat(presentsInput.value);
      if (!isFinite(value) || value < 0) return;
      state.presents = value;
      if (state.totalPresents < value) {
        state.totalPresents = value;
      }
      updateStatsUI();
      updateProducersUI();
      updateUpgradesUI();
    });

    presentsRow.appendChild(presentsLabel);
    presentsRow.appendChild(presentsInput);
    presentsRow.appendChild(presentsApply);

    globalSection.appendChild(globalTitle);
    globalSection.appendChild(presentsRow);

    var globalHint = document.createElement("div");
    globalHint.className = "dev-console-hint";
    globalHint.textContent = "For testing; does not persist.";
    globalSection.appendChild(globalHint);

    body.appendChild(globalSection);

    // Producers section
    var producersSection = document.createElement("div");
    producersSection.className = "dev-console-section";

    var producersTitle = document.createElement("div");
    producersTitle.className = "dev-console-section-title";
    producersTitle.textContent = "Producers";

    producersSection.appendChild(producersTitle);

    PRODUCERS.forEach(function (producer) {
      var row = document.createElement("div");
      row.className = "dev-console-row";

      var label = document.createElement("label");
      label.textContent = producer.name;

      var ownedInput = document.createElement("input");
      ownedInput.type = "number";
      ownedInput.min = "0";
      ownedInput.className = "dev-console-input";

      var levelInput = document.createElement("input");
      levelInput.type = "number";
      levelInput.min = "1";
      levelInput.className = "dev-console-input";

      var applyButton = document.createElement("button");
      applyButton.type = "button";
      applyButton.className = "dev-console-button";
      applyButton.textContent = "Apply";

      applyButton.addEventListener("click", function () {
        var ownedVal = parseInt(ownedInput.value, 10);
        var levelVal = parseInt(levelInput.value, 10);

        if (isFinite(ownedVal) && ownedVal >= 0) {
          state.producersOwned[producer.id] = ownedVal;
        }
        if (isFinite(levelVal) && levelVal >= 1) {
          state.producerLevels[producer.id] = levelVal;
        }

        recalcPps();
        updateStatsUI();
        updateProducersUI();
        updateUpgradesUI();
      });

      row.appendChild(label);
      row.appendChild(ownedInput);
      row.appendChild(levelInput);
      row.appendChild(applyButton);

      producersSection.appendChild(row);
    });

    body.appendChild(producersSection);

    // Upgrades section
    var upgradesSection = document.createElement("div");
    upgradesSection.className = "dev-console-section";

    var upgradesTitle = document.createElement("div");
    upgradesTitle.className = "dev-console-section-title";
    upgradesTitle.textContent = "Grant Upgrades";

    upgradesSection.appendChild(upgradesTitle);

    UPGRADES.forEach(function (upgrade) {
      var row = document.createElement("div");
      row.className = "dev-console-row";

      var label = document.createElement("label");
      label.textContent = upgrade.name;

      var grantButton = document.createElement("button");
      grantButton.type = "button";
      grantButton.className = "dev-console-button";
      grantButton.textContent = "Grant";

      grantButton.addEventListener("click", function () {
        if (state.purchasedUpgrades.has(upgrade.id)) return;
        state.purchasedUpgrades.add(upgrade.id);
        applyUpgradeEffect(upgrade);
        updateStatsUI();
        updateProducersUI();
        updateUpgradesUI();
      });

      row.appendChild(label);
      row.appendChild(grantButton);

      upgradesSection.appendChild(row);
    });

    body.appendChild(upgradesSection);

    container.appendChild(header);
    container.appendChild(body);

    document.body.appendChild(container);
    state.devConsole.element = container;
    state.devConsole.presentsInput = presentsInput;
  }

  function updateDevConsole() {
    if (!state.devConsole.element || !state.devConsole.visible) return;

    // Keep presents input roughly in sync for convenience.
    if (state.devConsole.presentsInput) {
      state.devConsole.presentsInput.value = Math.floor(state.presents);
    }
  }

  function toggleDevConsole() {
    buildDevConsole();

    state.devConsole.visible = !state.devConsole.visible;
    if (state.devConsole.element) {
      if (state.devConsole.visible) {
        state.devConsole.element.classList.add("dev-console--visible");
      } else {
        state.devConsole.element.classList.remove("dev-console--visible");
      }
    }
  }

  PC.buildDevConsole = buildDevConsole;
  PC.updateDevConsole = updateDevConsole;
  PC.toggleDevConsole = toggleDevConsole;

  window.PRESENT_CLICKER = PC;
})();