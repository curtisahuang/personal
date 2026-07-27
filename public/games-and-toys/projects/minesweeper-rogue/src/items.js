(() => {
const BASE_RUN_EFFECTS = {
  bombPenaltyDelta: 0,
  bombPenaltyMultiplier: 1,
  levelCompleteTimeBonus: 0,
  timeTickMultiplier: 1,
  shopPriceMultiplier: 1,
  goldMultiplier: 1,
  lowTimeGoldBonus: 0,
  criticalTimeGoldBonus: 0,
  chainRevealGoldBonus: 0,
  unusedFlagGoldBonus: 0,
  bombDetonationGoldBonus: 0,
  bombDetonationEndsRun: false,
  firstClickCrossReveal: false,
  rerollAfterPurchase: false,
};

const SHOP_RARITY_WEIGHTS = {
  common: 60,
  rare: 30,
  epic: 10,
  legendary: 0,
};

const SHOP_ITEM_DEFINITIONS = [
  {
    id: "blast-suit",
    name: "Blast Suit",
    description: "Prevents one bomb detonation penalty.",
    rarity: "common",
    cost: 10,
    purchase(context) {
      context.addPassiveItem({
        id: "blast-suit",
        name: "Blast Suit",
        description: "Prevents one bomb detonation penalty.",
        rarity: "common",
        charges: 1,
        maxCharges: 1,
        preventsBombPenalty: true,
      });
      context.setMessage("Bought Blast Suit. The next bomb penalty will be prevented.");
    },
  },
  {
    id: "watch-small",
    name: "Watch (sm)",
    description: "Adds 50 seconds to the run timer.",
    rarity: "common",
    cost: 15,
    purchase(context) {
      context.adjustTime(50, "Bought Watch (sm). Added 50 seconds.");
    },
  },
  {
    id: "bomb-shield",
    name: "Bomb Shield",
    description: "Decreases bomb damage by 50%.",
    rarity: "rare",
    cost: 30,
    purchase(context) {
      context.addPassiveItem({
        id: "bomb-shield",
        name: "Bomb Shield",
        description: "Decreases bomb damage by 50%.",
        rarity: "rare",
        effects: {
          bombPenaltyMultiplier: 0.5,
        },
      });
      context.setMessage("Bought Bomb Shield. Bomb penalties are reduced by 50%.");
    },
  },
  {
    id: "alarm-clock",
    name: "Alarm Clock",
    description: "Adds 120 seconds to the run timer.",
    rarity: "rare",
    cost: 25,
    purchase(context) {
      context.adjustTime(120, "Bought Alarm Clock. Added 120 seconds.");
    },
  },
  {
    id: "grandfathers-clock",
    name: "Grandfather's Clock",
    description: "Adds 250 seconds to the run timer.",
    rarity: "epic",
    cost: 40,
    purchase(context) {
      context.adjustTime(250, "Bought Grandfather's Clock. Added 250 seconds.");
    },
  },
  {
    id: "spy-master",
    name: "Spy Master",
    description: "Automatically marks 3 bombs correctly on the next level.",
    rarity: "rare",
    cost: 30,
    purchase(context) {
      context.addPassiveItem({
        id: "spy-master",
        name: "Spy Master",
        description: "Automatically marks bombs correctly after a level's bombs are placed.",
        rarity: "rare",
        pendingAutoFlags: 3,
      });
      context.setMessage("Bought Spy Master. It will mark 3 bombs after the next level starts.");
    },
  },
  {
    id: "time-dilation",
    name: "Time Dilation",
    description: "Time decreases at a rate of 0.9 seconds per second.",
    rarity: "rare",
    cost: 30,
    purchase(context) {
      context.addPassiveItem({
        id: "time-dilation",
        name: "Time Dilation",
        description: "Time decreases at a rate of 0.9 seconds per second.",
        rarity: "rare",
        effects: {
          timeTickMultiplier: 0.9,
        },
      });
      context.setMessage("Bought Time Dilation. Time now drains more slowly.");
    },
  },
  {
    id: "scouter",
    name: "Scouter",
    description: "One use. Finds the spot that will open the largest reveal on this level.",
    rarity: "common",
    cost: 5,
    purchase(context) {
      context.addActiveItem({
        id: "scouter",
        name: "Scouter",
        description: "Finds the spot that will open the largest reveal on this level.",
        rarity: "common",
        charges: 1,
        maxCharges: 1,
        use(activeContext) {
          return activeContext.highlightLargestReveal();
        },
      });
      context.setMessage("Bought Scouter. Use it during a level to find the biggest reveal.");
    },
  },
  {
    id: "bomb-marker",
    name: "Bomb Marker",
    description: "One use. Marks all bombs in a selected 3 × 3 area.",
    rarity: "common",
    cost: 10,
    purchase(context) {
      context.addActiveItem({
        id: "bomb-marker",
        name: "Bomb Marker",
        description: "Marks all bombs in a selected 3 × 3 area.",
        rarity: "common",
        charges: 1,
        maxCharges: 1,
        target: "tile",
        activationMessage: "Bomb Marker armed. Select a tile to mark bombs in its 3 × 3 area.",
        use(activeContext, tileIndex) {
          return activeContext.markBombsInArea(tileIndex);
        },
      });
      context.setMessage("Bought Bomb Marker. Use it during a level, then select a tile.");
    },
  },
  {
    id: "restocker",
    name: "Restocker",
    description: "Rerolls a random remaining shop item after each purchase.",
    rarity: "epic",
    cost: 50,
    purchase(context) {
      context.addPassiveItem({
        id: "restocker",
        name: "Restocker",
        description: "Rerolls a random remaining shop item after each purchase.",
        rarity: "epic",
        effects: {
          rerollAfterPurchase: true,
        },
      });
      context.setMessage("Bought Restocker. The shop will reroll a remaining item after each purchase.");
    },
  },
  {
    id: "discount-card",
    name: "Discount Card",
    description: "Reduces all shop item prices by 50%.",
    rarity: "epic",
    cost: 50,
    purchase(context) {
      context.addPassiveItem({
        id: "discount-card",
        name: "Discount Card",
        description: "Shop item prices are reduced by 50%.",
        rarity: "epic",
        effects: {
          shopPriceMultiplier: 0.5,
        },
      });
      context.setMessage("Bought Discount Card. Shop item prices are reduced by 50%.");
    },
  },
  {
    id: "yolo",
    name: "YOLO",
    description: "Doubles gold received, but timer runs at 1.5 speed.",
    rarity: "epic",
    cost: 30,
    purchase(context) {
      context.addPassiveItem({
        id: "yolo",
        name: "YOLO",
        description: "Doubles gold received, but timer runs at 1.5 speed.",
        rarity: "epic",
        effects: {
          goldMultiplier: 2,
          timeTickMultiplier: 1.5,
        },
      });
      context.setMessage("Bought YOLO. Gold is doubled, but time drains faster.");
    },
  },
  {
    id: "t-bomb",
    name: "T-bomb",
    description: "On each level's first click, marks bombs and opens safe tiles across that row and column.",
    rarity: "epic",
    cost: 50,
    purchase(context) {
      context.addPassiveItem({
        id: "t-bomb",
        name: "T-bomb",
        description: "First click reveals the clicked row and column, marking bombs and opening safe tiles.",
        rarity: "epic",
        effects: {
          firstClickCrossReveal: true,
        },
      });
      context.setMessage("Bought T-bomb. First clicks now blast open a row and column.");
    },
  },
  {
    id: "kiko-time-tithe",
    name: "Time Tithe",
    description: "Unlimited use. Sacrifice 10 seconds for 500 gold.",
    rarity: "epic",
    cost: 100,
    purchase(context) {
      context.addActiveItem({
        id: "kiko-time-tithe",
        name: "Time Tithe",
        description: "Unlimited use. Sacrifice 10 seconds for 500 gold.",
        rarity: "epic",
        unlimitedUses: true,
        use(activeContext) {
          return activeContext.sacrificeTimeForGold(10, 5);
        },
      });
      context.setMessage("Bought Time Tithe. Trade 10 seconds for 500 gold whenever you need it.");
    },
  },
  {
    id: "zen",
    name: "Zen",
    description: "Timer stops, no gold drops, timer is set to 1, and any detonation ends the run.",
    rarity: "epic",
    cost: 100,
    purchase(context) {
      context.addPassiveItem({
        id: "zen",
        name: "Zen",
        description: "Timer stops, no gold drops, and any bomb detonation ends the run.",
        rarity: "epic",
        effects: {
          goldMultiplier: 0,
          timeTickMultiplier: 0,
          bombDetonationEndsRun: true,
        },
      });
      context.setTime(1, "Bought Zen. The timer is frozen at 1, but any detonation ends the run.");
    },
  },
];

function createEmptyRunItems() {
  return {
    activeItems: [],
    passiveItems: [],
  };
}

function createShopInventory(count) {
  const guaranteedItem = SHOP_ITEM_DEFINITIONS.find((item) => item.id === "watch-small");
  const items = count > 0 && guaranteedItem
    ? [
      guaranteedItem,
      ...createRandomShopItems(count - 1, (item) => item.id !== guaranteedItem.id),
    ]
    : createRandomShopItems(count);

  return items.map(createShopOffer);
}

function createRandomShopOffer(index, excludedItemIds = []) {
  const item = createRandomShopItem((candidate) => !excludedItemIds.includes(candidate.id)) || createRandomShopItem();

  return createShopOffer(item, index);
}

function createRandomShopItem(filter = () => true) {
  return pickWeightedShopItem(SHOP_ITEM_DEFINITIONS.filter(filter));
}

function createRandomShopItems(count, filter = () => true) {
  const availableItems = SHOP_ITEM_DEFINITIONS.filter(filter);
  const selectedItems = [];

  while (selectedItems.length < count && availableItems.length > 0) {
    const selectedItem = pickWeightedShopItem(availableItems);

    selectedItems.push(selectedItem);
    availableItems.splice(availableItems.indexOf(selectedItem), 1);
  }

  return selectedItems;
}

function pickWeightedShopItem(items) {
  if (items.length === 0) {
    return null;
  }

  const totalWeight = items.reduce((total, item) => total + getShopRarityWeight(item), 0);

  if (totalWeight <= 0) {
    return shuffle(items)[0];
  }

  let roll = Math.random() * totalWeight;

  for (const item of items) {
    roll -= getShopRarityWeight(item);

    if (roll <= 0) {
      return item;
    }
  }

  return items[items.length - 1];
}

function getShopRarityWeight(item) {
  return SHOP_RARITY_WEIGHTS[item.rarity || "common"] ?? SHOP_RARITY_WEIGHTS.common;
}

function createShopOffer(item, index) {
  return {
    ...item,
    shopOfferId: `${item.id}-${index}`,
    sold: false,
  };
}

function purchaseShopItem(item, context) {
  item.purchase(context);
}

function getShopItemDefinitions() {
  return SHOP_ITEM_DEFINITIONS;
}

function getRunEffects(passiveItems, temporaryModifiers) {
  return [...passiveItems, ...temporaryModifiers].reduce((effects, source) => {
    const sourceEffects = source.effects || source;

    return {
      bombPenaltyDelta: effects.bombPenaltyDelta + (sourceEffects.bombPenaltyDelta ?? 0),
      bombPenaltyMultiplier: effects.bombPenaltyMultiplier * (sourceEffects.bombPenaltyMultiplier ?? 1),
      levelCompleteTimeBonus: effects.levelCompleteTimeBonus + (sourceEffects.levelCompleteTimeBonus ?? 0),
      timeTickMultiplier: effects.timeTickMultiplier * (sourceEffects.timeTickMultiplier ?? 1),
      shopPriceMultiplier: effects.shopPriceMultiplier * (sourceEffects.shopPriceMultiplier ?? 1),
      goldMultiplier: effects.goldMultiplier * (sourceEffects.goldMultiplier ?? 1),
      lowTimeGoldBonus: effects.lowTimeGoldBonus + (sourceEffects.lowTimeGoldBonus ?? 0),
      criticalTimeGoldBonus: effects.criticalTimeGoldBonus + (sourceEffects.criticalTimeGoldBonus ?? 0),
      chainRevealGoldBonus: effects.chainRevealGoldBonus + (sourceEffects.chainRevealGoldBonus ?? 0),
      unusedFlagGoldBonus: effects.unusedFlagGoldBonus + (sourceEffects.unusedFlagGoldBonus ?? 0),
      bombDetonationGoldBonus: effects.bombDetonationGoldBonus + (sourceEffects.bombDetonationGoldBonus ?? 0),
      bombDetonationEndsRun: effects.bombDetonationEndsRun || Boolean(sourceEffects.bombDetonationEndsRun),
      firstClickCrossReveal: effects.firstClickCrossReveal || Boolean(sourceEffects.firstClickCrossReveal),
      rerollAfterPurchase: effects.rerollAfterPurchase || Boolean(sourceEffects.rerollAfterPurchase),
    };
  }, BASE_RUN_EFFECTS);
}

function consumeTemporaryModifiers(temporaryModifiers, trigger) {
  for (const modifier of temporaryModifiers) {
    if (modifier.trigger === trigger) {
      modifier.remainingUses -= 1;
    }
  }

  return temporaryModifiers.filter((modifier) => modifier.remainingUses > 0);
}

function shuffle(values) {
  const result = [...values];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

window.MinesweeperItems = {
  consumeTemporaryModifiers,
  createEmptyRunItems,
  createShopInventory,
  createRandomShopOffer,
  getShopItemDefinitions,
  getRunEffects,
  purchaseShopItem,
};
})();
