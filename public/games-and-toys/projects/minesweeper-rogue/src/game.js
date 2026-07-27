(() => {
const {
  consumeTemporaryModifiers,
  createEmptyRunItems,
  createRandomShopOffer,
  createShopInventory,
  getShopItemDefinitions,
  getRunEffects,
  purchaseShopItem,
} = window.MinesweeperItems;
const {
  createEmptyTiles,
  createLevelConfig,
  generateBombs,
  getNeighborIndexes,
  getSafeTileCount,
  revealSafeRegion,
} = window.MinesweeperGrid;
const { createGameRenderer } = window.MinesweeperRender;
const { createMusicManager } = window.MinesweeperMusic;

const RUN_MODES = {
  full: {
    totalLevels: 10,
    startingTime: 200,
    startingGold: 0,
    isDemo: false,
  },
  demo: {
    totalLevels: 3,
    startingTime: 180,
    startingGold: 15,
    isDemo: true,
  },
};
const DEFAULT_RUN_MODE = "full";
const DEMO_STARTING_ITEM_IDS = ["scouter", "bomb-marker", "blast-suit"];
const BASE_SHOP_SHUFFLE_COST = 5;
const BASE_SHOP_EXPAND_COST = 10;
const SHOP_EXPAND_COST_STEP = 10;
const GOLD_DISPLAY_MULTIPLIER = 100;
const BOMB_FEEDBACK_DURATION = 700;
const LOW_TIME_FLASH_THRESHOLD = 10;
const LOW_TIME_FLASH_DURATION = 450;
const TIMER_TICK_MS = 100;
const TIME_FREEZE_DURATION = 10;
const KIKO_BOMB_GOLD_REWARD = 10;
const SORA_LOW_TIME_THRESHOLD = 100;
const SORA_CRITICAL_TIME_THRESHOLD = 50;
const SORA_LOW_TIME_GOLD_BONUS = 1;
const SORA_CRITICAL_TIME_GOLD_BONUS = 1;
const DEFAULT_DIALOGUE_ID = "neutral";
const DIALOGUE_DIRECTORY = "src/dialogue";

const MUSIC_TRACKS = [
  {
    id: "title",
    src: "assets/music/song-0.mp3",
    when: ({ state }) => state.status === "title" || state.status === "character-select" || state.characterSelectionOpen,
  },
  {
    id: "levels-1-5",
    src: "assets/music/song-1.mp3",
    when: ({ state }) => state.level >= 1 && state.level <= 5,
  },
  {
    id: "levels-6-10",
    src: "assets/music/song-2.mp3",
    when: ({ state }) => state.level >= 6 && state.level <= RUN_MODES.full.totalLevels,
  },
];

const CHARACTERS = [
  {
    id: "red",
    name: "Akari",
    image: "assets/images/Red.png",
    special: "Rewards you for efficiency! Click numbers once flags are placed to earn extra gold.",
    color: "#ff6b6b",
    glow: "rgba(255, 107, 107, 0.45)",
  },
  {
    id: "blue",
    name: "Sora",
    image: "assets/images/Blue.png",
    special: "Freeze time for a short duration and earn extra gold when low on time!",
    color: "#5cc8ff",
    glow: "rgba(92, 200, 255, 0.45)",
  },
  {
    id: "green",
    name: "Midori",
    image: "assets/images/Green.png",
    special: "Earns gold for unused flags. Map things in your head for extra bonuses!",
    color: "#7ee86f",
    glow: "rgba(126, 232, 111, 0.45)",
  },
  {
    id: "yellow",
    name: "Kiko",
    image: "assets/images/Yellow.png",
    special: "Explosions give you gold! No pain no gain!",
    color: "#ffd166",
    glow: "rgba(255, 209, 102, 0.45)",
  },
];

const initialLevelConfig = createLevelConfig(1);

const state = {
  status: "title",
  runType: DEFAULT_RUN_MODE,
  totalLevels: RUN_MODES[DEFAULT_RUN_MODE].totalLevels,
  level: 1,
  timeRemaining: RUN_MODES[DEFAULT_RUN_MODE].startingTime,
  gold: 0,
  mode: "reveal",
  config: initialLevelConfig,
  tiles: createEmptyTiles(initialLevelConfig),
  firstRevealComplete: false,
  scoutedTileIndex: null,
  revealedSafeTiles: 0,
  flagCount: 0,
  activeItems: [],
  passiveItems: [],
  selectedCharacter: null,
  characterSelectionOpen: false,
  shopItems: [],
  shopOfferCount: 0,
  shopShuffleCost: BASE_SHOP_SHUFFLE_COST,
  shopExpandCost: BASE_SHOP_EXPAND_COST,
  temporaryModifiers: [],
  armedActiveItemId: null,
  timeFreezeRemaining: 0,
  timerId: null,
  lastTimerTick: null,
  bombFeedbackTimerId: null,
  lowTimeFlashTimerId: null,
  levelStarted: false,
  modifierCount: 0,
  optionsOpen: false,
  devmodeOpen: false,
  devTimerPaused: false,
  musicEnabled: true,
  dialogue: {},
  dialogueCache: {},
  dialogueId: DEFAULT_DIALOGUE_ID,
  messageKey: null,
  messageValues: {},
};

const musicManager = createMusicManager(MUSIC_TRACKS, {
  fadeDurationMs: 450,
  volume: 0.55,
});

const renderer = createGameRenderer({
  characters: CHARACTERS,
  devItems: getShopItemDefinitions(),
  state,
  formatGold,
  formatTime,
  getFlagsRemaining,
  getShopItemCost,
  callbacks: {
    applyArmedActiveItem,
    buyShopItem,
    openDevmode,
    revealTile,
    selectCharacter,
    shuffleShopItems,
    expandShop,
    toggleFlag,
    useActiveItem,
  },
});
const {
  app: appElement,
  message: messageElement,
  titleStartButton,
  titleDemoButton,
  titleOptionsButton,
  nextLevelButton,
  newRunButton,
  titleReturnButton,
  modeToggle,
  timerReadout,
  timerPenaltyFeedback,
  gameOverNewRunButton,
  gameOverTitleReturnButton,
  optionsOpenButton,
  optionsCloseButton,
  musicToggleButton,
  devmodeHeaderTrigger,
  devmodeCloseButton,
  devmodeItemForm,
  devmodeItemSelect,
  devmodeLevelForm,
  devmodeLevelInput,
  devmodeGoldForm,
  devmodeGoldInput,
  devmodeTimerForm,
  devmodeTimerInput,
  devmodeBombsForm,
  devmodeBombsInput,
  devmodeTimerToggle,
} = renderer.elements;

function resetRunState(selectedCharacter) {
  const items = createEmptyRunItems();
  const characterItems = createCharacterItems(selectedCharacter);
  const runMode = getRunMode();

  state.status = "playing";
  state.level = 1;
  state.totalLevels = runMode.totalLevels;
  state.timeRemaining = runMode.startingTime;
  state.gold = runMode.startingGold;
  state.mode = "reveal";
  state.activeItems = [...items.activeItems, ...characterItems.activeItems];
  state.passiveItems = [...items.passiveItems, ...characterItems.passiveItems];
  state.selectedCharacter = selectedCharacter;
  state.characterSelectionOpen = false;
  state.shopItems = [];
  state.shopOfferCount = 0;
  state.shopShuffleCost = BASE_SHOP_SHUFFLE_COST;
  state.shopExpandCost = BASE_SHOP_EXPAND_COST;
  state.temporaryModifiers = [];
  state.armedActiveItemId = null;
  state.timeFreezeRemaining = 0;
  state.levelStarted = false;
  state.modifierCount = 0;
  state.devTimerPaused = false;

  if (selectedCharacter && runMode.isDemo) {
    addDemoStartingItems();
  }

  startLevel(1);
}

function createCharacterItems(character) {
  const items = createEmptyRunItems();

  if (!character) {
    return items;
  }

  if (character.id === "yellow") {
    items.passiveItems.push({
      id: "kiko-economic-boom",
      name: "Economic Boom",
      description: `Gain ${formatGold(KIKO_BOMB_GOLD_REWARD)} gold whenever Kiko detonates a bomb.`,
      rarity: "legendary",
      effects: {
        bombDetonationGoldBonus: KIKO_BOMB_GOLD_REWARD,
      },
    });
  }

  if (character.id === "red") {
    items.passiveItems.push({
      id: "akari-chain-bonus",
      name: "Chain Bonus",
      description: `Squares opened by Chain Open grant +${formatGold(1)} bonus gold.`,
      rarity: "legendary",
      effects: {
        chainRevealGoldBonus: 1,
      },
    });
  }

  if (character.id === "green") {
    items.passiveItems.push({
      id: "midori-conservation",
      name: "Conservation",
      description: `At level end, gain ${formatGold(1)} gold for each unused flag.`,
      rarity: "legendary",
      effects: {
        unusedFlagGoldBonus: 1,
      },
    });
  }

  if (character.id === "blue") {
    items.passiveItems.push({
      id: "sora-last-light",
      name: "Last Light",
      description: `Gain ${formatGold(SORA_LOW_TIME_GOLD_BONUS)} extra gold from reveals below ${SORA_LOW_TIME_THRESHOLD} seconds, plus ${formatGold(SORA_CRITICAL_TIME_GOLD_BONUS)} more below ${SORA_CRITICAL_TIME_THRESHOLD} seconds.`,
      rarity: "legendary",
      effects: {
        lowTimeGoldBonus: SORA_LOW_TIME_GOLD_BONUS,
        criticalTimeGoldBonus: SORA_CRITICAL_TIME_GOLD_BONUS,
      },
    });
    items.activeItems.push({
      id: "sora-time-freeze",
      name: "Time Freeze",
      description: `Once per level. Freeze timer drain and bomb penalties for ${TIME_FREEZE_DURATION} seconds.`,
      rarity: "legendary",
      charges: 1,
      maxCharges: 1,
      rechargeEachLevel: true,
      use(activeContext) {
        return activeContext.freezeTime(TIME_FREEZE_DURATION);
      },
    });
  }

  return items;
}

function openCharacterSelection(runType = state.runType) {
  window.clearInterval(state.timerId);
  state.timerId = null;
  state.lastTimerTick = null;

  setRunType(runType);
  resetRunState(null);
  loadDialogue(DEFAULT_DIALOGUE_ID);
  state.status = "character-select";
  state.characterSelectionOpen = true;
  if (getRunMode().isDemo) {
    setDialogueMessage("demo_choose_character", {
      totalLevels: state.totalLevels,
    }, `Choose a character to try the ${state.totalLevels}-level demo.`);
  } else {
    setDialogueMessage("choose_character", {}, "Choose a character to start your run.");
  }
  render();
}

function selectCharacter(characterId) {
  const selectedCharacter = CHARACTERS.find((character) => character.id === characterId);

  if (!selectedCharacter) {
    return;
  }

  startRun(selectedCharacter);
}

function startRun(selectedCharacter) {
  resetRunState(selectedCharacter);
  loadDialogue(selectedCharacter.id);
  startTimer();
  if (getRunMode().isDemo) {
    setDialogueMessage("demo_character_ready", {
      character: selectedCharacter.name,
      totalLevels: state.totalLevels,
    }, `${selectedCharacter.name} is ready for the ${state.totalLevels}-level demo. You start with a Scouter, Bomb Marker, Blast Suit, and ${formatGold(RUN_MODES.demo.startingGold)} gold.`);
  } else {
    setDialogueMessage("character_ready", {
      character: selectedCharacter.name,
    }, `${selectedCharacter.name} is ready. Let's go!`);
  }
  render();
}

function startLevel(level) {
  state.status = "playing";
  state.level = level;
  state.config = createLevelConfig(level);
  state.tiles = createEmptyTiles(state.config);
  state.firstRevealComplete = false;
  state.scoutedTileIndex = null;
  state.levelStarted = false;
  state.shopItems = [];
  state.shopOfferCount = 0;
  state.shopShuffleCost = BASE_SHOP_SHUFFLE_COST;
  state.shopExpandCost = BASE_SHOP_EXPAND_COST;
  state.armedActiveItemId = null;
  state.timeFreezeRemaining = 0;
  state.revealedSafeTiles = 0;
  state.flagCount = 0;
  rechargeLevelItems();
  nextLevelButton.classList.add("hidden");
}

function startTimer() {
  window.clearInterval(state.timerId);
  state.lastTimerTick = performance.now();
  state.timerId = window.setInterval(() => {
    const now = performance.now();
    const elapsedSeconds = Math.max(0, (now - state.lastTimerTick) / 1000);

    state.lastTimerTick = now;

    if (state.optionsOpen || state.devTimerPaused || state.status !== "playing" || !state.levelStarted) {
      return;
    }

    if (state.timeFreezeRemaining > 0) {
      state.timeFreezeRemaining = Math.max(0, state.timeFreezeRemaining - elapsedSeconds);
      renderHud();
      return;
    }

    const tickAmount = getRunEffects(state.passiveItems, state.temporaryModifiers).timeTickMultiplier;

    if (tickAmount > 0) {
      adjustTime(-tickAmount * elapsedSeconds);
    }
  }, TIMER_TICK_MS);
}

function adjustTime(delta, message) {
  state.timeRemaining = Math.max(0, state.timeRemaining + delta);
  const shouldFlashLowTime =
    delta < 0 && state.timeRemaining > 0 && state.timeRemaining <= LOW_TIME_FLASH_THRESHOLD;
  let shouldRenderFullGame = Boolean(message);

  if (message) {
    setMessage(message);
  }

  if (state.timeRemaining <= 0 && state.status !== "lost") {
    state.status = "lost";
    setDialogueMessage("run_timer_zero", {}, "The run timer hit zero. Start a new run to try again.");
    shouldRenderFullGame = true;
  }

  if (shouldRenderFullGame) {
    render();
  } else {
    renderHud();
  }

  if (shouldFlashLowTime) {
    flashLowTime();
  }
}

function setTime(seconds, message) {
  state.timeRemaining = Math.max(0, seconds);

  if (message) {
    setMessage(message);
  }

  if (state.timeRemaining <= 0 && state.status !== "lost") {
    state.status = "lost";
    setDialogueMessage("run_timer_zero", {}, "The run timer hit zero. Start a new run to try again.");
  }

  render();
}

function revealTile(index) {
  if (state.status !== "playing") {
    return;
  }

  const tile = state.tiles[index];

  if (!tile) {
    return;
  }

  if (tile.revealed) {
    revealMatchingFlagArea(tile);
    return;
  }

  if (tile.flagged) {
    return;
  }

  startLevelClock();
  awardGold(1);

  if (!state.firstRevealComplete) {
    generateBombs(state.tiles, state.config, index);
    state.firstRevealComplete = true;
    applyAutoFlags();
    applyFirstClickCrossReveal(tile);
  }

  if (tile.bomb) {
    detonateBomb(tile);
    return;
  }

  if (!tile.revealed) {
    const revealedCount = revealSafeRegion(state.tiles, state.config, tile.index);

    state.revealedSafeTiles += revealedCount;

    if (revealedCount > 1) {
      setDialogueMessage("flood_reveal", {
        revealedCount,
        revealedPlural: revealedCount === 1 ? "" : "s",
      }, `Opened ${revealedCount} safe tile${revealedCount === 1 ? "" : "s"}.`);
    }
  }

  checkLevelComplete();
  render();
}

function applyFirstClickCrossReveal(centerTile) {
  if (!getRunEffects(state.passiveItems, state.temporaryModifiers).firstClickCrossReveal) {
    return;
  }

  const crossIndexes = new Set(
    state.tiles
      .filter((tile) => tile.row === centerTile.row || tile.col === centerTile.col)
      .map((tile) => tile.index),
  );
  let markedBombCount = 0;
  let openedSafeCount = 0;

  for (const index of crossIndexes) {
    const tile = state.tiles[index];

    if (!tile || tile.revealed) {
      continue;
    }

    if (tile.bomb) {
      if (!tile.flagged) {
        tile.flagged = true;
        state.flagCount += 1;
        markedBombCount += 1;
      }

      continue;
    }

    const revealedCount = revealSafeRegion(state.tiles, state.config, tile.index);

    state.revealedSafeTiles += revealedCount;
    openedSafeCount += revealedCount;
  }

  setDialogueMessage("first_click_cross_reveal", {
    row: centerTile.row + 1,
    column: centerTile.col + 1,
    openedSafeCount,
    openedSafePlural: openedSafeCount === 1 ? "" : "s",
    markedBombCount,
    markedBombPlural: markedBombCount === 1 ? "" : "s",
  }, `T-bomb blasted row ${centerTile.row + 1} and column ${centerTile.col + 1}, opening ${openedSafeCount} safe tile${openedSafeCount === 1 ? "" : "s"} and marking ${markedBombCount} bomb${markedBombCount === 1 ? "" : "s"}.`);
}

function detonateBomb(tile) {
  tile.revealed = true;
  tile.detonated = true;
  const effects = getRunEffects(state.passiveItems, state.temporaryModifiers);
  const goldReward = effects.bombDetonationGoldBonus;
  const rewardMessage = goldReward > 0
    ? ` Economic Boom paid ${formatGold(goldReward)} gold.`
    : "";

  if (goldReward > 0) {
    state.gold += goldReward;
  }

  if (effects.bombDetonationEndsRun) {
    showBombFeedback(0);
    state.status = "lost";
    setDialogueMessage("found_bomb_zen", {
      bombLabel: tile.bomb.label,
      rewardMessage,
    }, `${tile.bomb.label} detonated.${rewardMessage} Zen ended the run.`);
    render();
    return;
  }

  const penalty = calculateBombPenalty(tile, effects);

  if (state.timeFreezeRemaining > 0) {
    showBombFeedback(0);
    setDialogueMessage("found_bomb_time_freeze", {
      bombLabel: tile.bomb.label,
      rewardMessage,
    }, `${tile.bomb.label} detonated.${rewardMessage} Time Freeze blocked the penalty.`);
    render();
    return;
  }

  if (consumeBombPenaltyPrevention()) {
    showBombFeedback(0);
    setDialogueMessage("found_bomb_blast_suit", {
      bombLabel: tile.bomb.label,
      rewardMessage,
    }, `${tile.bomb.label} detonated.${rewardMessage} Blast Suit prevented the time penalty.`);
    render();
    return;
  }

  state.temporaryModifiers = consumeTemporaryModifiers(state.temporaryModifiers, "bomb");
  showBombFeedback(penalty);
  adjustTime(-penalty, getDialogueMessage("found_bomb", {
    bombLabel: tile.bomb.label,
    rewardMessage,
    penalty,
  }, `${tile.bomb.label} detonated.${rewardMessage} Lost ${penalty} seconds.`));
}

function calculateBombPenalty(tile, effects) {
  const modifiedPenalty = (tile.bomb.baseTimePenalty + effects.bombPenaltyDelta) * effects.bombPenaltyMultiplier;

  return Math.max(0, Math.round(modifiedPenalty));
}

function showBombFeedback(timePenalty) {
  appElement.classList.remove("screen-shake");
  timerPenaltyFeedback.classList.remove("show");

  void appElement.offsetWidth;

  appElement.classList.add("screen-shake");

  if (timePenalty > 0) {
    timerPenaltyFeedback.textContent = `-${formatTime(timePenalty)}`;
    timerPenaltyFeedback.classList.add("show");
  }

  window.clearTimeout(state.bombFeedbackTimerId);
  state.bombFeedbackTimerId = window.setTimeout(() => {
    appElement.classList.remove("screen-shake");
    timerPenaltyFeedback.classList.remove("show");
  }, BOMB_FEEDBACK_DURATION);
}

function toggleFlag(index) {
  if (state.status !== "playing") {
    return;
  }

  const tile = state.tiles[index];

  if (!tile || tile.revealed) {
    return;
  }

  startLevelClock();

  tile.flagged = !tile.flagged;
  state.flagCount += tile.flagged ? 1 : -1;
  render();
}

function startLevelClock() {
  if (!state.levelStarted) {
    state.levelStarted = true;
  }
}

function awardGold(amount) {
  const effects = getRunEffects(state.passiveItems, state.temporaryModifiers);
  const goldAmount = Math.round(amount * effects.goldMultiplier);
  let timePressureBonus = 0;

  if (goldAmount > 0 && state.timeRemaining < SORA_LOW_TIME_THRESHOLD) {
    timePressureBonus += effects.lowTimeGoldBonus;
  }

  if (goldAmount > 0 && state.timeRemaining < SORA_CRITICAL_TIME_THRESHOLD) {
    timePressureBonus += effects.criticalTimeGoldBonus;
  }

  state.gold += goldAmount + timePressureBonus;
}

function consumeBombPenaltyPrevention() {
  const item = state.passiveItems.find((candidate) => candidate.preventsBombPenalty && candidate.charges > 0);

  if (!item) {
    return false;
  }

  item.charges -= 1;

  if (item.charges <= 0) {
    state.passiveItems = state.passiveItems.filter((candidate) => candidate !== item);
  }

  return true;
}

function checkLevelComplete() {
  if (state.revealedSafeTiles < getSafeTileCount(state.config)) {
    return;
  }

  const bonus = getRunEffects(state.passiveItems, state.temporaryModifiers).levelCompleteTimeBonus;

  if (bonus > 0) {
    state.timeRemaining += bonus;
  }

  const levelRewardMessage = applyLevelEndRewards();
  state.timeFreezeRemaining = 0;

  if (state.level >= state.totalLevels) {
    state.status = "won";
    setDialogueMessage("run_complete", {
      totalLevels: state.totalLevels,
      timeRemaining: formatTime(state.timeRemaining),
      levelRewardMessage,
    }, `Run complete. You cleared all ${state.totalLevels} levels with ${formatTime(state.timeRemaining)} left.${levelRewardMessage}`);
    return;
  }

  state.status = "level-complete";
  openShop();
  setDialogueMessage("level_complete", {
    level: state.level,
    levelRewardMessage,
  }, `Level ${state.level} clear.${levelRewardMessage} Spend gold in the shop or start the next level.`);
  nextLevelButton.classList.remove("hidden");
}

function applyLevelEndRewards() {
  const effects = getRunEffects(state.passiveItems, state.temporaryModifiers);

  if (effects.unusedFlagGoldBonus <= 0) {
    return "";
  }

  const unusedFlagCount = getFlagsRemaining();

  if (unusedFlagCount <= 0) {
    return getDialogueMessage("midori_no_flags", {}, " Midori had no unused flags to cash in.");
  }

  const goldReward = unusedFlagCount * effects.unusedFlagGoldBonus;

  state.gold += goldReward;

  return getDialogueMessage("midori_saved_flags", {
    unusedFlagCount,
    flagPlural: unusedFlagCount === 1 ? "" : "s",
    goldReward: formatGold(goldReward),
  }, ` Midori saved ${unusedFlagCount} flag${unusedFlagCount === 1 ? "" : "s"} for ${formatGold(goldReward)} gold.`);
}

function openShop() {
  state.shopItems = createShopInventory(3);
  state.shopOfferCount = state.shopItems.length;
  state.shopShuffleCost = BASE_SHOP_SHUFFLE_COST;
  state.shopExpandCost = BASE_SHOP_EXPAND_COST;
}

function getFlagsRemaining() {
  return Math.max(0, state.config.mineCount - state.flagCount);
}

function useActiveItem(itemId) {
  if (state.status !== "playing") {
    return;
  }

  const item = state.activeItems.find((candidate) => candidate.id === itemId);

  if (!item || item.charges <= 0) {
    return;
  }

  if (item.target === "tile") {
    if (!state.firstRevealComplete) {
      setDialogueMessage("active_item_needs_level_start", {
        itemName: item.name,
      }, `${item.name} needs the level to start first. Reveal one tile, then use it.`);
      render();
      return;
    }

    state.armedActiveItemId = item.id;
    setDialogueMessage("active_item_armed", {
      activationMessage: item.activationMessage,
    }, item.activationMessage);
    render();
    return;
  }

  const result = item.use({
    adjustTime,
    addTemporaryModifier(modifier) {
      state.temporaryModifiers.push(modifier);
    },
    createModifierId(prefix) {
      state.modifierCount += 1;
      return `${prefix}-${state.modifierCount}`;
    },
    highlightLargestReveal,
    freezeTime,
    sacrificeTimeForGold,
    setMessage,
  });

  if (result === false) {
    render();
    return;
  }

  if (!item.unlimitedUses) {
    item.charges -= 1;
  }
  render();
}

function applyArmedActiveItem(tileIndex) {
  const item = state.activeItems.find((candidate) => candidate.id === state.armedActiveItemId);

  state.armedActiveItemId = null;

  if (!item || item.charges <= 0) {
    render();
    return;
  }

  const result = item.use({
    markBombsInArea,
    setMessage,
  }, tileIndex);

  if (result !== false) {
    item.charges -= 1;
  }

  render();
}

function revealMatchingFlagArea(centerTile) {
  const effects = getRunEffects(state.passiveItems, state.temporaryModifiers);

  if (centerTile.bomb || centerTile.adjacentBombs <= 0) {
    return;
  }

  const areaIndexes = [centerTile.index, ...getNeighborIndexes(centerTile.index, state.tiles, state.config)];
  const markedFlagCount = areaIndexes.filter((index) => {
    const tile = state.tiles[index];

    return tile?.flagged || tile?.detonated;
  }).length;

  if (markedFlagCount !== centerTile.adjacentBombs) {
    setDialogueMessage("chain_open_flags_needed", {
      adjacentBombs: centerTile.adjacentBombs,
      markedFlagCount,
    }, `${centerTile.adjacentBombs} nearby flags needed. ${markedFlagCount} marked.`);
    render();
    return;
  }

  let openedCount = 0;

  for (const index of areaIndexes) {
    const tile = state.tiles[index];

    if (!tile || tile.revealed || tile.flagged) {
      continue;
    }

    if (tile.bomb) {
      detonateBomb(tile);
      openedCount += 1;

      if (state.status === "lost") {
        return;
      }

      continue;
    }

    const revealedCount = revealSafeRegion(state.tiles, state.config, tile.index);

    state.revealedSafeTiles += revealedCount;
    awardGold(1 + effects.chainRevealGoldBonus);
    openedCount += revealedCount;
  }

  setDialogueMessage("chain_open_success", {
    openedCount,
    openedPlural: openedCount === 1 ? "" : "s",
    row: centerTile.row + 1,
    column: centerTile.col + 1,
  }, `Chain Open opened ${openedCount} tile${openedCount === 1 ? "" : "s"} around row ${centerTile.row + 1}, column ${centerTile.col + 1}.`);
  checkLevelComplete();
  render();
}

function freezeTime(seconds) {
  if (!state.levelStarted) {
    setDialogueMessage("time_freeze_needs_level_start", {}, "Time Freeze needs the level to start first. Reveal one tile, then use it.");
    return false;
  }

  if (state.timeFreezeRemaining > 0) {
    setDialogueMessage("time_freeze_already_active", {}, "Time Freeze is already active.");
    return false;
  }

  state.timeFreezeRemaining = seconds;
  setDialogueMessage("time_freeze_active", {
    seconds,
  }, `Time Freeze active for ${seconds} seconds. Timer drain and bomb penalties are frozen.`);
  return true;
}

function sacrificeTimeForGold(timeCost, goldReward) {
  state.timeRemaining = Math.max(0, state.timeRemaining - timeCost);
  state.gold += goldReward;

  if (state.timeRemaining <= 0) {
    state.status = "lost";
    setDialogueMessage("time_tithe_lost", {
      timeCost,
      goldReward: formatGold(goldReward),
    }, `Kiko sacrificed ${timeCost} seconds for ${formatGold(goldReward)} gold, but the run timer hit zero.`);
    return true;
  }

  setDialogueMessage("time_tithe_success", {
    timeCost,
    goldReward: formatGold(goldReward),
  }, `Kiko sacrificed ${timeCost} seconds for ${formatGold(goldReward)} gold.`);
  return true;
}

function rechargeLevelItems() {
  for (const item of state.activeItems) {
    if (item.rechargeEachLevel) {
      item.charges = item.maxCharges;
    }
  }
}

function setMessage(message) {
  state.messageKey = null;
  state.messageValues = {};
  messageElement.textContent = message;
}

function setDialogueMessage(key, values = {}, fallback = key) {
  state.messageKey = key;
  state.messageValues = { ...values };
  messageElement.textContent = getDialogueMessage(key, values, fallback);
}

function getDialogueMessage(key, values = {}, fallback = key) {
  const template = state.dialogue[key] || fallback;

  return template.replace(/\{\{(\w+)\}\}/g, (match, token) => (
    values[token] === undefined ? match : String(values[token])
  ));
}

function getDialogueUrl(dialogueId) {
  return `${DIALOGUE_DIRECTORY}/${dialogueId}.json`;
}

function applyDialogue(dialogueId, dialogue) {
  state.dialogueId = dialogueId;
  state.dialogue = dialogue;

  if (state.messageKey) {
    messageElement.textContent = getDialogueMessage(state.messageKey, state.messageValues, messageElement.textContent);
  }
}

function loadDialogue(dialogueId = state.selectedCharacter?.id || DEFAULT_DIALOGUE_ID) {
  const cachedDialogue = state.dialogueCache[dialogueId];

  if (cachedDialogue) {
    applyDialogue(dialogueId, cachedDialogue);
    return;
  }

  fetch(getDialogueUrl(dialogueId))
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Dialogue request failed: ${response.status}`);
      }

      return response.json();
    })
    .then((dialogue) => {
      state.dialogueCache[dialogueId] = dialogue;
      applyDialogue(dialogueId, dialogue);
    })
    .catch(() => {
      if (dialogueId === DEFAULT_DIALOGUE_ID) {
        state.dialogue = {};
        return;
      }

      loadDialogue(DEFAULT_DIALOGUE_ID);
    });
}

function formatTime(seconds) {
  return Number.isInteger(seconds) ? `${seconds}s` : `${seconds.toFixed(1)}s`;
}

function formatGold(amount) {
  return String(amount * GOLD_DISPLAY_MULTIPLIER);
}

function flashLowTime() {
  timerReadout.classList.remove("low-time-flash");

  void timerReadout.offsetWidth;

  timerReadout.classList.add("low-time-flash");

  window.clearTimeout(state.lowTimeFlashTimerId);
  state.lowTimeFlashTimerId = window.setTimeout(() => {
    timerReadout.classList.remove("low-time-flash");
  }, LOW_TIME_FLASH_DURATION);
}

function render() {
  renderer.render();
  musicManager.sync({ state });
}

function renderHud() {
  renderer.renderHud();
}

function openOptions() {
  state.optionsOpen = true;
  render();
}

function closeOptions() {
  state.optionsOpen = false;
  render();
}

function toggleMusic() {
  state.musicEnabled = !state.musicEnabled;
  musicManager.setEnabled(state.musicEnabled);
  render();
}

function returnToTitlePage() {
  window.clearInterval(state.timerId);
  state.timerId = null;
  state.lastTimerTick = null;

  setRunType(DEFAULT_RUN_MODE);
  resetRunState(null);
  loadDialogue(DEFAULT_DIALOGUE_ID);
  state.status = "title";
  state.characterSelectionOpen = false;
  state.optionsOpen = false;
  state.devmodeOpen = false;
  setDialogueMessage("press_start", {}, "Press Start to begin.");
  render();
}

function openDevmode() {
  state.devmodeOpen = true;
  render();
}

function closeDevmode() {
  state.devmodeOpen = false;
  render();
}

function grantDevItem(itemId) {
  const item = getShopItemDefinitions().find((candidate) => candidate.id === itemId);

  if (!item) {
    return;
  }

  purchaseShopItem(item, {
    addActiveItem,
    addPassiveItem,
    adjustTime,
    setTime,
    setMessage,
  });
  setDialogueMessage("dev_grant_item", {
    itemName: item.name,
  }, `Devmode granted ${item.name}.`);
  render();
}

function setDevLevel(level) {
  const nextLevel = clampInteger(level, 1, state.totalLevels);

  state.characterSelectionOpen = false;
  startTimer();
  startLevel(nextLevel);
  setDialogueMessage("dev_set_level", {
    level: nextLevel,
  }, `Devmode moved to level ${nextLevel}.`);
  render();
}

function setRunType(runType) {
  state.runType = RUN_MODES[runType] ? runType : DEFAULT_RUN_MODE;
  state.totalLevels = getRunMode().totalLevels;
}

function getRunMode() {
  return RUN_MODES[state.runType] || RUN_MODES[DEFAULT_RUN_MODE];
}

function addDemoStartingItems() {
  const shopItems = getShopItemDefinitions();
  const context = {
    addActiveItem,
    addPassiveItem,
    adjustTime(delta) {
      state.timeRemaining = Math.max(0, state.timeRemaining + delta);
    },
    setTime(seconds) {
      state.timeRemaining = Math.max(0, seconds);
    },
    setMessage() {},
  };

  for (const itemId of DEMO_STARTING_ITEM_IDS) {
    const item = shopItems.find((candidate) => candidate.id === itemId);

    if (item) {
      purchaseShopItem(item, context);
    }
  }
}

function setDevGold(gold) {
  state.gold = clampInteger(gold, 0, Number.MAX_SAFE_INTEGER);
  setDialogueMessage("dev_set_gold", {
    gold: formatGold(state.gold),
  }, `Devmode set gold to ${formatGold(state.gold)}.`);
  render();
}

function setDevTimer(seconds) {
  state.timeRemaining = clampInteger(seconds, 0, Number.MAX_SAFE_INTEGER);

  if (state.timeRemaining > 0 && state.status === "lost") {
    state.status = "playing";
  }

  setDialogueMessage("dev_set_timer", {
    timeRemaining: formatTime(state.timeRemaining),
  }, `Devmode set timer to ${formatTime(state.timeRemaining)}.`);
  render();
}

function toggleDevTimerCountdown() {
  state.devTimerPaused = !state.devTimerPaused;
  setDialogueMessage("dev_timer_toggle", {
    state: state.devTimerPaused ? "paused" : "resumed",
  }, `Devmode ${state.devTimerPaused ? "paused" : "resumed"} the timer countdown.`);
  render();
}

function setDevBombCount(bombCount) {
  const maxBombs = Math.max(0, state.config.rows * state.config.cols - 9);
  const nextBombCount = clampInteger(bombCount, 0, maxBombs);

  state.status = "playing";
  state.characterSelectionOpen = false;
  state.config = {
    ...state.config,
    mineCount: nextBombCount,
    density: nextBombCount / (state.config.rows * state.config.cols),
  };
  state.tiles = createEmptyTiles(state.config);
  state.firstRevealComplete = false;
  state.scoutedTileIndex = null;
  state.levelStarted = false;
  state.armedActiveItemId = null;
  state.revealedSafeTiles = 0;
  state.flagCount = 0;
  setDialogueMessage("dev_set_bombs", {
    bombCount: nextBombCount,
    bombPlural: nextBombCount === 1 ? "" : "s",
  }, `Devmode set this level to ${nextBombCount} bomb${nextBombCount === 1 ? "" : "s"} and reset the board.`);
  render();
}

function clampInteger(value, min, max) {
  const number = Number.parseInt(value, 10);

  if (Number.isNaN(number)) {
    return min;
  }

  return Math.min(max, Math.max(min, number));
}

function buyShopItem(shopOfferId) {
  if (state.status !== "level-complete") {
    return;
  }

  const item = state.shopItems.find((candidate) => candidate.shopOfferId === shopOfferId && !candidate.sold);
  const itemCost = item ? getShopItemCost(item) : 0;

  if (!item || state.gold < itemCost) {
    return;
  }

  state.gold -= itemCost;
  item.sold = true;
  purchaseShopItem(item, {
    addActiveItem,
    addPassiveItem,
    adjustTime,
    setTime,
    setMessage,
  });
  rerollShopItemAfterPurchase();
  render();
}

function shuffleShopItems() {
  if (state.status !== "level-complete" || state.gold < state.shopShuffleCost) {
    return;
  }

  const remainingItemCount = state.shopItems.filter((item) => !item.sold).length;

  if (remainingItemCount === 0) {
    return;
  }

  const shuffleCost = state.shopShuffleCost;
  const unavailableItemIds = state.shopItems
    .filter((item) => item.sold)
    .map((item) => item.id);

  state.gold -= shuffleCost;
  state.shopItems = state.shopItems.map((item) => {
    if (item.sold) {
      return item;
    }

    const shuffledItem = createRandomShopOffer(state.shopOfferCount, unavailableItemIds);

    unavailableItemIds.push(shuffledItem.id);
    state.shopOfferCount += 1;
    return shuffledItem;
  });
  state.shopShuffleCost += BASE_SHOP_SHUFFLE_COST;
  setDialogueMessage("shop_shuffle", {
    remainingItemCount,
    itemPlural: remainingItemCount === 1 ? "" : "s",
    shuffleCost: formatGold(shuffleCost),
  }, `Shuffled ${remainingItemCount} shop item${remainingItemCount === 1 ? "" : "s"} for ${formatGold(shuffleCost)} gold.`);
  render();
}

function expandShop() {
  if (state.status !== "level-complete" || state.gold < state.shopExpandCost) {
    return;
  }

  const expandCost = state.shopExpandCost;
  const unavailableItemIds = state.shopItems.map((item) => item.id);
  const expandedItem = createRandomShopOffer(state.shopOfferCount, unavailableItemIds);

  state.gold -= expandCost;
  state.shopItems.push(expandedItem);
  state.shopOfferCount += 1;
  state.shopExpandCost += SHOP_EXPAND_COST_STEP;
  setDialogueMessage("shop_expand", {
    expandCost: formatGold(expandCost),
  }, `Expanded the shop with 1 item for ${formatGold(expandCost)} gold.`);
  render();
}

function getShopItemCost(item) {
  const effects = getRunEffects(state.passiveItems, state.temporaryModifiers);

  return Math.max(0, Math.ceil(item.cost * effects.shopPriceMultiplier));
}

function rerollShopItemAfterPurchase() {
  if (!getRunEffects(state.passiveItems, state.temporaryModifiers).rerollAfterPurchase) {
    return;
  }

  const remainingItems = state.shopItems.filter((item) => !item.sold);

  if (remainingItems.length === 0) {
    return;
  }

  const itemToReplace = remainingItems[Math.floor(Math.random() * remainingItems.length)];
  const unavailableItemIds = state.shopItems.map((item) => item.id);
  const replacementItem = createRandomShopOffer(state.shopOfferCount, unavailableItemIds);

  state.shopOfferCount += 1;
  state.shopItems = state.shopItems.map((item) => (
    item === itemToReplace ? replacementItem : item
  ));
  setDialogueMessage("restocker_reroll", {
    previousMessage: messageElement.textContent,
    oldItemName: itemToReplace.name,
    newItemName: replacementItem.name,
  }, `${messageElement.textContent} Restocker rerolled ${itemToReplace.name} into ${replacementItem.name}.`);
}

function addActiveItem(item) {
  const existingItem = state.activeItems.find((candidate) => candidate.id === item.id);

  if (existingItem && item.charges) {
    existingItem.charges += item.charges;
    existingItem.maxCharges += item.maxCharges || item.charges;
    return;
  }

  state.activeItems.push({ ...item });
}

function addPassiveItem(item) {
  const existingItem = state.passiveItems.find((candidate) => candidate.id === item.id);

  if (existingItem && item.charges) {
    existingItem.charges += item.charges;
    return;
  }

  if (existingItem && item.pendingAutoFlags) {
    existingItem.pendingAutoFlags += item.pendingAutoFlags;
    return;
  }

  if (existingItem && item.effects) {
    existingItem.effects = {
      ...existingItem.effects,
      ...item.effects,
      bombDetonationEndsRun: Boolean(existingItem.effects?.bombDetonationEndsRun || item.effects.bombDetonationEndsRun),
      goldMultiplier: (existingItem.effects?.goldMultiplier ?? 1) * (item.effects.goldMultiplier ?? 1),
      timeTickMultiplier: (existingItem.effects?.timeTickMultiplier ?? 1) * (item.effects.timeTickMultiplier ?? 1),
    };
    return;
  }

  state.passiveItems.push({ ...item });
}

function applyAutoFlags() {
  const spyMaster = state.passiveItems.find((item) => item.pendingAutoFlags > 0);

  if (!spyMaster) {
    return;
  }

  const bombTiles = state.tiles.filter((tile) => tile.bomb && !tile.flagged && !tile.revealed);
  const flagsToPlace = Math.min(spyMaster.pendingAutoFlags, bombTiles.length);

  for (let index = 0; index < flagsToPlace; index += 1) {
    bombTiles[index].flagged = true;
    state.flagCount += 1;
  }

  spyMaster.pendingAutoFlags -= flagsToPlace;

  if (spyMaster.pendingAutoFlags <= 0) {
    state.passiveItems = state.passiveItems.filter((item) => item !== spyMaster);
  }
}

function markBombsInArea(centerIndex) {
  if (!state.firstRevealComplete) {
    setDialogueMessage("bomb_marker_needs_level_start", {}, "Bomb Marker needs the level to start first. Reveal one tile, then use it.");
    return false;
  }

  const centerTile = state.tiles[centerIndex];

  if (!centerTile) {
    setDialogueMessage("bomb_marker_needs_tile", {}, "Bomb Marker needs a tile inside the current level.");
    return false;
  }

  const areaIndexes = [centerIndex, ...getNeighborIndexes(centerIndex, state.tiles, state.config)];
  let markedCount = 0;

  for (const index of areaIndexes) {
    const tile = state.tiles[index];

    if (tile.bomb && !tile.flagged && !tile.revealed) {
      tile.flagged = true;
      state.flagCount += 1;
      markedCount += 1;
    }
  }

  setDialogueMessage("bomb_marker_success", {
    row: centerTile.row + 1,
    column: centerTile.col + 1,
    markedCount,
    markedPlural: markedCount === 1 ? "" : "s",
  }, `Bomb Marker scanned row ${centerTile.row + 1}, column ${centerTile.col + 1} and marked ${markedCount} bomb${markedCount === 1 ? "" : "s"}.`);
  return true;
}

function highlightLargestReveal() {
  if (!state.firstRevealComplete) {
    setDialogueMessage("scouter_needs_level_start", {}, "Scouter needs the level to start first. Reveal one tile, then use it.");
    return false;
  }

  const bestTile = findLargestRevealTile();

  if (!bestTile) {
    setDialogueMessage("scouter_no_tile", {}, "Scouter couldn't find a safe hidden tile on this level.");
    return false;
  }

  state.scoutedTileIndex = bestTile.index;
  setDialogueMessage("scouter_success", {
    row: bestTile.row + 1,
    column: bestTile.col + 1,
  }, `Scouter found the best reveal: row ${bestTile.row + 1}, column ${bestTile.col + 1}.`);
  return true;
}

function findLargestRevealTile() {
  let bestTile = null;
  let bestRevealCount = 0;

  for (const tile of state.tiles) {
    if (tile.revealed || tile.flagged || tile.bomb) {
      continue;
    }

    const revealCount = countRevealSize(tile.index);

    if (revealCount > bestRevealCount) {
      bestRevealCount = revealCount;
      bestTile = tile;
    }
  }

  return bestTile;
}

function countRevealSize(startIndex) {
  const startTile = state.tiles[startIndex];

  if (!startTile || startTile.bomb) {
    return 0;
  }

  if (startTile.adjacentBombs > 0) {
    return 1;
  }

  const pending = [startIndex];
  const visited = new Set();

  while (pending.length > 0) {
    const index = pending.pop();
    const tile = state.tiles[index];

    if (!tile || visited.has(index) || tile.revealed || tile.flagged || tile.bomb) {
      continue;
    }

    visited.add(index);

    if (tile.adjacentBombs === 0) {
      pending.push(...getNeighborIndexes(index, state.tiles, state.config));
    }
  }

  return visited.size;
}

newRunButton.addEventListener("click", () => {
  closeOptions();
  openCharacterSelection();
});
titleReturnButton.addEventListener("click", returnToTitlePage);
gameOverNewRunButton.addEventListener("click", () => openCharacterSelection());
gameOverTitleReturnButton.addEventListener("click", returnToTitlePage);
titleStartButton.addEventListener("click", () => openCharacterSelection(DEFAULT_RUN_MODE));
titleDemoButton.addEventListener("click", () => openCharacterSelection("demo"));
titleOptionsButton.addEventListener("click", openOptions);
optionsOpenButton.addEventListener("click", openOptions);
optionsCloseButton.addEventListener("click", closeOptions);
musicToggleButton.addEventListener("click", toggleMusic);
devmodeHeaderTrigger.addEventListener("click", openDevmode);
devmodeCloseButton.addEventListener("click", closeDevmode);

devmodeItemForm.addEventListener("submit", (event) => {
  event.preventDefault();
  grantDevItem(devmodeItemSelect.value);
});

devmodeLevelForm.addEventListener("submit", (event) => {
  event.preventDefault();
  setDevLevel(devmodeLevelInput.value);
});

devmodeGoldForm.addEventListener("submit", (event) => {
  event.preventDefault();
  setDevGold(devmodeGoldInput.value);
});

devmodeTimerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  setDevTimer(devmodeTimerInput.value);
});

devmodeBombsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  setDevBombCount(devmodeBombsInput.value);
});

devmodeTimerToggle.addEventListener("click", toggleDevTimerCountdown);

nextLevelButton.addEventListener("click", () => {
  if (state.status !== "level-complete") {
    return;
  }

  startLevel(state.level + 1);
  if (getRunMode().isDemo) {
    setDialogueMessage("demo_start_level", {}, "Demo continues. Try the next board and spend gold between rounds.");
  } else {
    setDialogueMessage("start_level", {}, "Let's continue clearing those mines!");
  }
  render();
});

if (modeToggle) {
  modeToggle.addEventListener("click", () => {
    state.mode = state.mode === "reveal" ? "flag" : "reveal";
    render();
  });
}

loadDialogue();
setDialogueMessage("press_start", {}, "Press Start to begin.");
if (new URLSearchParams(window.location.search).get("demo") === "1") {
  openCharacterSelection("demo");
} else {
  render();
}
})();
