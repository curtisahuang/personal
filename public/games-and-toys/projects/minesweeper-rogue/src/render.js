(() => {
function createGameRenderer({ characters, devItems, state, formatGold, formatTime, getFlagsRemaining, getShopItemCost, callbacks }) {
  const elements = {
    body: document.body,
    app: document.querySelector(".app"),
    titleScreen: document.querySelector("#title-screen"),
    titleStartButton: document.querySelector("#title-start"),
    titleDemoButton: document.querySelector("#title-demo"),
    titleOptionsButton: document.querySelector("#title-options"),
    gameTitle: document.querySelector("#game-title"),
    board: document.querySelector("#board"),
    selectedCharacter: document.querySelector("#selected-character"),
    activeItems: document.querySelector("#active-items"),
    passiveItems: document.querySelector("#passive-items"),
    message: document.querySelector("#message"),
    nextLevelButton: document.querySelector("#next-level"),
    newRunButton: document.querySelector("#new-run"),
    titleReturnButton: document.querySelector("#title-return"),
    modeToggle: document.querySelector("#mode-toggle"),
    levelReadout: document.querySelector("#level-readout"),
    timerPanel: document.querySelector("#timer-panel"),
    timerReadout: document.querySelector("#timer-readout"),
    timeFreezeReadout: document.querySelector("#time-freeze-readout"),
    timerPenaltyFeedback: document.querySelector("#timer-penalty-feedback"),
    goldReadout: document.querySelector("#gold-readout"),
    bombReadout: document.querySelector("#bomb-readout"),
    flagReadout: document.querySelector("#flag-readout"),
    levelTitle: document.querySelector("#level-title"),
    levelDescription: document.querySelector("#level-description"),
    shopModal: document.querySelector("#shop-modal"),
    shopItems: document.querySelector("#shop-items"),
    shopLevelReadout: document.querySelector("#shop-level-readout"),
    shopTimerReadout: document.querySelector("#shop-timer-readout"),
    shopGoldReadout: document.querySelector("#shop-gold-readout"),
    shopExpandButton: document.querySelector("#shop-expand"),
    shopShuffleButton: document.querySelector("#shop-shuffle"),
    gameOverModal: document.querySelector("#game-over-modal"),
    gameOverSummary: document.querySelector("#game-over-summary"),
    gameOverNewRunButton: document.querySelector("#game-over-new-run"),
    gameOverTitleReturnButton: document.querySelector("#game-over-title-return"),
    characterModal: document.querySelector("#character-modal"),
    characterOptions: document.querySelector("#character-options"),
    optionsOpenButton: document.querySelector("#options-open"),
    optionsCloseButton: document.querySelector("#options-close"),
    optionsModal: document.querySelector("#options-modal"),
    musicToggleButton: document.querySelector("#music-toggle"),
    devmodeHeaderTrigger: document.querySelector("#devmode-header-trigger"),
    devmodeCloseButton: document.querySelector("#devmode-close"),
    devmodeModal: document.querySelector("#devmode-modal"),
    devmodeItemForm: document.querySelector("#devmode-item-form"),
    devmodeItemSelect: document.querySelector("#devmode-item-select"),
    devmodeLevelForm: document.querySelector("#devmode-level-form"),
    devmodeLevelInput: document.querySelector("#devmode-level-input"),
    devmodeGoldForm: document.querySelector("#devmode-gold-form"),
    devmodeGoldInput: document.querySelector("#devmode-gold-input"),
    devmodeTimerForm: document.querySelector("#devmode-timer-form"),
    devmodeTimerInput: document.querySelector("#devmode-timer-input"),
    devmodeBombsForm: document.querySelector("#devmode-bombs-form"),
    devmodeBombsInput: document.querySelector("#devmode-bombs-input"),
    devmodeTimerToggle: document.querySelector("#devmode-timer-toggle"),
  };

  function render() {
    renderTheme();
    renderTitle();
    renderHud();
    renderBoard();
    renderSelectedCharacter();
    renderCharacterSelection();
    renderShop();
    renderGameOver();
    renderItems();
    renderOptions();
    renderDevmode();
  }

  function renderTheme() {
    elements.body.dataset.character = state.selectedCharacter?.id || "neutral";
  }

  function renderTitle() {
    elements.titleScreen.classList.toggle("hidden", state.status !== "title");
  }

  function renderHud() {
    elements.gameTitle.textContent = state.runType === "demo" ? "Minesweeper Demo" : "Minesweeper";
    elements.levelReadout.textContent = `${state.level} / ${state.totalLevels}`;
    elements.timerReadout.textContent = formatTime(state.timeRemaining);
    elements.timerPanel.classList.toggle("frozen", state.timeFreezeRemaining > 0);
    elements.timeFreezeReadout.classList.toggle("hidden", state.timeFreezeRemaining <= 0);
    elements.timeFreezeReadout.textContent = state.timeFreezeRemaining > 0
      ? `${Math.ceil(state.timeFreezeRemaining)}s`
      : "";
    elements.goldReadout.textContent = formatGold(state.gold);
    elements.bombReadout.textContent = String(state.config.mineCount);
    elements.flagReadout.textContent = String(getFlagsRemaining());
    if (elements.levelTitle) {
      elements.levelTitle.textContent = `Level ${state.level}`;
    }

    if (elements.levelDescription) {
      elements.levelDescription.textContent = `${state.config.rows} × ${state.config.cols} grid, ${state.config.mineCount} bombs`;
    }

    if (elements.modeToggle) {
      elements.modeToggle.textContent = `Mode: ${state.mode === "reveal" ? "Reveal" : "Flag"}`;
      elements.modeToggle.setAttribute("aria-pressed", String(state.mode === "flag"));
    }
  }

  function renderShop() {
    elements.shopItems.innerHTML = "";
    elements.shopModal.classList.toggle("hidden", state.status !== "level-complete");

    if (state.status !== "level-complete") {
      return;
    }

    elements.shopLevelReadout.textContent = `${state.level} / ${state.totalLevels}`;
    elements.shopTimerReadout.textContent = formatTime(state.timeRemaining);
    elements.shopGoldReadout.textContent = formatGold(state.gold);
    renderShopActions();

    for (const item of state.shopItems) {
      elements.shopItems.append(createShopItemCard(item));
    }
  }

  function renderCharacterSelection() {
    elements.characterOptions.innerHTML = "";
    elements.characterModal.classList.toggle("hidden", !state.characterSelectionOpen);

    if (!state.characterSelectionOpen) {
      return;
    }

    for (const character of characters) {
      elements.characterOptions.append(createCharacterOption(character));
    }
  }

  function renderDevmode() {
    elements.devmodeModal.classList.toggle("hidden", !state.devmodeOpen);

    if (!state.devmodeOpen) {
      return;
    }

    if (elements.devmodeItemSelect.options.length !== devItems.length) {
      elements.devmodeItemSelect.innerHTML = "";

      for (const item of devItems) {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = `${item.name} (${item.rarity || "common"}, ${formatGold(item.cost)} gold)`;
        elements.devmodeItemSelect.append(option);
      }
    }

    setInputValue(elements.devmodeLevelInput, state.level);
    elements.devmodeLevelInput.max = String(state.totalLevels);
    setInputValue(elements.devmodeGoldInput, state.gold);
    setInputValue(elements.devmodeTimerInput, Math.round(state.timeRemaining));
    setInputValue(elements.devmodeBombsInput, state.config.mineCount);
    elements.devmodeBombsInput.max = String(Math.max(0, state.config.rows * state.config.cols - 9));
    elements.devmodeTimerToggle.textContent = state.devTimerPaused ? "Resume timer" : "Pause timer";
  }

  function setInputValue(input, value) {
    if (document.activeElement !== input) {
      input.value = String(value);
    }
  }

  function createCharacterOption(character) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "character-card";
    button.style.setProperty("--character-color", character.color);
    button.style.setProperty("--character-glow", character.glow);
    button.setAttribute("aria-label", `Start a run as ${character.name}`);
    button.addEventListener("click", () => callbacks.selectCharacter(character.id));

    const portrait = document.createElement("span");
    portrait.className = "character-portrait";

    const image = document.createElement("img");
    image.src = character.image;
    image.alt = "";
    image.draggable = false;

    const name = document.createElement("span");
    name.className = "character-name";
    name.textContent = character.name;

    const item = document.createElement("span");
    item.className = "character-special";
    item.textContent = character.special;

    portrait.append(image);
    button.append(portrait, name, item);

    return button;
  }

  function renderSelectedCharacter() {
    const character = state.selectedCharacter;

    elements.selectedCharacter.innerHTML = "";

    if (!character) {
      const empty = document.createElement("p");
      empty.className = "selected-character-empty";
      empty.textContent = "Choose a character to begin.";
      elements.selectedCharacter.append(empty);
      return;
    }

    const image = document.createElement("img");
    image.src = character.image;
    image.alt = `${character.name} character`;
    image.draggable = false;

    const name = document.createElement("strong");
    name.textContent = character.name;

    elements.selectedCharacter.append(image, name);
  }

  function renderShopActions() {
    const remainingItemCount = state.shopItems.filter((item) => !item.sold).length;

    elements.shopExpandButton.textContent = `Expand shop (${formatGold(state.shopExpandCost)} gold)`;
    elements.shopExpandButton.disabled = state.gold < state.shopExpandCost;
    elements.shopExpandButton.setAttribute(
      "aria-label",
      `Add 1 item to the shop for ${formatGold(state.shopExpandCost)} gold`,
    );
    elements.shopExpandButton.onclick = callbacks.expandShop;

    elements.shopShuffleButton.textContent = `Shuffle remaining items (${formatGold(state.shopShuffleCost)} gold)`;
    elements.shopShuffleButton.disabled = remainingItemCount === 0 || state.gold < state.shopShuffleCost;
    elements.shopShuffleButton.setAttribute(
      "aria-label",
      `Shuffle ${remainingItemCount} remaining shop item${remainingItemCount === 1 ? "" : "s"} for ${formatGold(state.shopShuffleCost)} gold`,
    );
    elements.shopShuffleButton.onclick = callbacks.shuffleShopItems;
  }

  function renderGameOver() {
    elements.gameOverModal.classList.toggle("hidden", state.status !== "lost");

    if (state.status !== "lost") {
      return;
    }

    elements.gameOverSummary.textContent = `${elements.message.textContent} You reached level ${state.level} with ${formatGold(state.gold)} gold.`;
  }

  function renderOptions() {
    elements.optionsModal.classList.toggle("hidden", !state.optionsOpen);

    if (state.optionsOpen) {
      elements.musicToggleButton.textContent = `Music: ${state.musicEnabled ? "On" : "Off"}`;
      elements.musicToggleButton.setAttribute("aria-pressed", String(state.musicEnabled));
    }
  }

  function createShopItemCard(item) {
    const card = document.createElement("article");
    card.className = `item-card shop-card ${getRarityClassName(item)}`;
    card.dataset.rarity = item.rarity || "common";

    const title = document.createElement("h3");
    title.textContent = item.name;

    const description = document.createElement("p");
    description.className = "item-description";
    description.textContent = item.description;

    const meta = document.createElement("div");
    meta.className = "item-meta";

    const cost = document.createElement("span");
    const itemCost = getShopItemCost(item);
    cost.textContent = `${formatGold(itemCost)} gold`;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "primary-action";
    button.textContent = item.sold ? "Sold" : "Buy";
    button.disabled = item.sold || state.gold < itemCost;
    button.setAttribute("aria-label", `Buy ${item.name} for ${formatGold(itemCost)} gold`);
    button.addEventListener("click", () => callbacks.buyShopItem(item.shopOfferId));

    meta.append(cost, button);
    card.append(title, description, meta);

    return card;
  }

  function renderBoard() {
    elements.board.style.setProperty("--cols", state.config.cols);
    elements.board.innerHTML = "";

    for (const tile of state.tiles) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = getTileClassName(tile);
      button.setAttribute("role", "gridcell");
      button.setAttribute("aria-label", getTileLabel(tile));
      button.disabled = state.status !== "playing" || (
        tile.revealed && !tile.bomb && !state.armedActiveItemId && !canClickRevealedTile(tile)
      );

      if (tile.revealed && tile.bomb) {
        const image = document.createElement("img");
        image.src = "assets/images/Bomboy.png";
        image.alt = "";
        image.className = "tile-bomb-image";
        image.setAttribute("aria-hidden", "true");
        button.append(image);
      } else {
        button.textContent = getTileContent(tile);
      }

      button.addEventListener("click", () => {
        if (state.armedActiveItemId) {
          callbacks.applyArmedActiveItem(tile.index);
        } else if (state.mode === "flag") {
          callbacks.toggleFlag(tile.index);
        } else {
          callbacks.revealTile(tile.index);
        }
      });

      button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        callbacks.toggleFlag(tile.index);
      });

      elements.board.append(button);
    }
  }

  function getTileClassName(tile) {
    const classNames = ["tile"];

    if (tile.revealed) {
      classNames.push("revealed");
    }

    if (tile.flagged) {
      classNames.push("flagged");
    }

    if (tile.detonated) {
      classNames.push("mine");
    }

    if (tile.index === state.scoutedTileIndex && !tile.revealed) {
      classNames.push("scouted");
    }

    if (tile.revealed && !tile.bomb && tile.adjacentBombs > 0) {
      classNames.push(`n${tile.adjacentBombs}`);
    }

    return classNames.join(" ");
  }

  function canClickRevealedTile(tile) {
    return tile.revealed &&
      !tile.bomb &&
      tile.adjacentBombs > 0;
  }

  function getTileContent(tile) {
    if (tile.flagged) {
      return "⚑";
    }

    if (tile.index === state.scoutedTileIndex && !tile.revealed) {
      return "◎";
    }

    if (!tile.revealed) {
      return "";
    }

    if (tile.bomb) {
      return "";
    }

    return tile.adjacentBombs > 0 ? String(tile.adjacentBombs) : "";
  }

  function getTileLabel(tile) {
    if (tile.index === state.scoutedTileIndex && !tile.revealed) {
      return `Row ${tile.row + 1}, column ${tile.col + 1}, Scouter recommendation`;
    }

    if (tile.flagged) {
      return `Row ${tile.row + 1}, column ${tile.col + 1}, flagged`;
    }

    if (!tile.revealed) {
      return `Row ${tile.row + 1}, column ${tile.col + 1}, hidden`;
    }

    if (tile.bomb) {
      return `Row ${tile.row + 1}, column ${tile.col + 1}, detonated ${tile.bomb.label}`;
    }

    return `Row ${tile.row + 1}, column ${tile.col + 1}, ${tile.adjacentBombs} adjacent bombs`;
  }

  function renderItems() {
    elements.activeItems.innerHTML = "";
    elements.passiveItems.innerHTML = "";

    if (state.activeItems.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-list";
      empty.textContent = "No active items.";
      elements.activeItems.append(empty);
    }

    for (const item of state.activeItems) {
      elements.activeItems.append(createActiveItemCard(item));
    }

    if (state.passiveItems.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-list";
      empty.textContent = "No passive items.";
      elements.passiveItems.append(empty);
      return;
    }

    for (const item of state.passiveItems) {
      elements.passiveItems.append(createPassiveItemCard(item));
    }
  }

  function createActiveItemCard(item) {
    const card = document.createElement("article");
    card.className = `item-card ${getRarityClassName(item)}`;
    card.dataset.rarity = item.rarity || "common";

    const title = document.createElement("h3");
    title.textContent = item.name;

    const description = document.createElement("p");
    description.className = "item-description";
    description.textContent = item.description;

    const meta = document.createElement("div");
    meta.className = "item-meta";

    const charges = document.createElement("span");
    charges.textContent = item.unlimitedUses
      ? "Unlimited uses"
      : `${item.charges} / ${item.maxCharges} charges`;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "primary-action";
    button.textContent = state.armedActiveItemId === item.id ? "Armed" : "Use";
    button.disabled = state.status !== "playing" || (!item.unlimitedUses && item.charges <= 0);
    button.setAttribute("aria-label", `Use ${item.name}`);
    button.addEventListener("click", () => callbacks.useActiveItem(item.id));

    meta.append(charges, button);
    card.append(title, description, meta);

    return card;
  }

  function createPassiveItemCard(item) {
    const card = document.createElement("article");
    card.className = `item-card ${getRarityClassName(item)}`;
    card.dataset.rarity = item.rarity || "common";

    const title = document.createElement("h3");
    title.textContent = item.name;

    const description = document.createElement("p");
    description.className = "item-description";
    description.textContent = item.description;

    card.append(title, description);

    if (item.charges || item.pendingAutoFlags) {
      const meta = document.createElement("div");
      meta.className = "item-meta";
      const amount = item.charges || item.pendingAutoFlags;
      meta.textContent = `${amount} charge${amount === 1 ? "" : "s"}`;
      card.append(meta);
    }

    return card;
  }

  function getRarityClassName(item) {
    return `rarity-${item.rarity || "common"}`;
  }

  return {
    elements,
    render,
    renderHud,
    renderBoard,
    renderShop,
    renderGameOver,
    renderItems,
  };
}

window.MinesweeperRender = {
  createGameRenderer,
};
})();
