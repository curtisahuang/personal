(() => {
const STANDARD_BOMB_PENALTY = 40;

const BOMB_TYPES = {
  standard: {
    id: "standard",
    label: "Bomb",
    baseTimePenalty: STANDARD_BOMB_PENALTY,
  },
  devil: {
    id: "devil",
    label: "Devil Bomb",
    baseTimePenalty: 80,
  },
};

const DEVIL_BOMB_START_LEVEL = 5;
const DEVIL_BOMB_CHANCE = 0.25;

function createLevelConfig(level) {
  const size = level + 5;
  const density = 0.1 + (level - 1) * 0.025;
  const mineCount = Math.round(size * size * density);

  return {
    level,
    rows: size,
    cols: size,
    mineCount,
    density,
  };
}

function createEmptyTiles(config) {
  return Array.from({ length: config.rows * config.cols }, (_, index) => ({
    index,
    row: Math.floor(index / config.cols),
    col: index % config.cols,
    adjacentBombs: 0,
    bomb: null,
    flagged: false,
    revealed: false,
    detonated: false,
  }));
}

function generateBombs(tiles, config, safeIndex) {
  const excluded = getSafeStartIndexes(safeIndex, config);
  const availableIndexes = tiles
    .map((tile) => tile.index)
    .filter((index) => !excluded.has(index));
  const shuffled = shuffle(availableIndexes);
  const bombIndexes = shuffled.slice(0, config.mineCount);

  for (const index of bombIndexes) {
    tiles[index].bomb = createBomb(config);
  }

  for (const tile of tiles) {
    tile.adjacentBombs = getNeighborIndexes(tile.index, tiles, config)
      .filter((neighborIndex) => tiles[neighborIndex].bomb)
      .length;
  }
}

function createBomb(config) {
  if (config.level >= DEVIL_BOMB_START_LEVEL && Math.random() < DEVIL_BOMB_CHANCE) {
    return { ...BOMB_TYPES.devil };
  }

  return { ...BOMB_TYPES.standard };
}

function revealSafeRegion(tiles, config, startIndex) {
  const pending = [startIndex];
  const visited = new Set();
  let revealedCount = 0;

  while (pending.length > 0) {
    const index = pending.pop();
    const tile = tiles[index];

    if (!tile || visited.has(index) || tile.revealed || tile.flagged || tile.bomb) {
      continue;
    }

    visited.add(index);
    tile.revealed = true;
    revealedCount += 1;

    if (tile.adjacentBombs === 0) {
      pending.push(...getNeighborIndexes(index, tiles, config));
    }
  }

  return revealedCount;
}

function getNeighborIndexes(index, tiles, config) {
  const tile = tiles[index];
  const neighbors = [];

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (rowOffset === 0 && colOffset === 0) {
        continue;
      }

      const row = tile.row + rowOffset;
      const col = tile.col + colOffset;

      if (row >= 0 && row < config.rows && col >= 0 && col < config.cols) {
        neighbors.push(row * config.cols + col);
      }
    }
  }

  return neighbors;
}

function getSafeTileCount(config) {
  return config.rows * config.cols - config.mineCount;
}

function getSafeStartIndexes(index, config) {
  const safeIndexes = new Set([index]);
  const row = Math.floor(index / config.cols);
  const col = index % config.cols;

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      const nextRow = row + rowOffset;
      const nextCol = col + colOffset;

      if (nextRow >= 0 && nextRow < config.rows && nextCol >= 0 && nextCol < config.cols) {
        safeIndexes.add(nextRow * config.cols + nextCol);
      }
    }
  }

  if (config.rows * config.cols - safeIndexes.size < config.mineCount) {
    return new Set([index]);
  }

  return safeIndexes;
}

function shuffle(values) {
  const result = [...values];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

window.MinesweeperGrid = {
  BOMB_TYPES,
  STANDARD_BOMB_PENALTY,
  createEmptyTiles,
  createLevelConfig,
  generateBombs,
  getNeighborIndexes,
  getSafeTileCount,
  revealSafeRegion,
};
})();
