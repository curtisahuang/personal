import { clamp, randInt, noise2d } from './utils.js';

export function installWorld(Game) {
  Object.assign(Game.prototype, {
    // ---------- WORLD ----------
    generateWorld() {
      this.tiles = [];
      const cx = Math.floor(this.mapWidth / 2);
      const cy = Math.floor(this.mapHeight / 2);

      const baseR = this.minRadius || 20;
      const border = this.borderTiles || 6;
      const rx = Math.min(baseR, Math.floor((this.mapWidth - border) / 2));
      const ry = Math.min(baseR, Math.floor((this.mapHeight - border) / 2));

      // Init water
      for (let y = 0; y < this.mapHeight; y++) {
        const row = new Array(this.mapWidth).fill('water');
        this.tiles.push(row);
      }

      // Oval island
      for (let y = 0; y < this.mapHeight; y++) {
        for (let x = 0; x < this.mapWidth; x++) {
          const dx = (x - cx) / rx;
          const dy = (y - cy) / ry;
          const d = dx * dx + dy * dy;
          const jitter = (noise2d(x * 9.17, y * 11.31) - 0.5) * 0.22;
          if (d + jitter < 1) {
            this.tiles[y][x] = 'land';
          }
        }
      }

      // border ring of water
      for (let x = 0; x < this.mapWidth; x++) {
        this.tiles[0][x] = 'water';
        this.tiles[this.mapHeight - 1][x] = 'water';
      }
      for (let y = 0; y < this.mapHeight; y++) {
        this.tiles[y][0] = 'water';
        this.tiles[y][this.mapWidth - 1] = 'water';
      }

      // Collect land cells
      const landCells = [];
      for (let y = 1; y < this.mapHeight - 1; y++) {
        for (let x = 1; x < this.mapWidth - 1; x++) {
          if (this.tiles[y][x] === 'land') landCells.push({ x, y });
        }
      }

      const inLand = (x, y) => this.inBounds(x, y) && this.tiles[y][x] === 'land';
      const inWalkableLand = (x, y) => this.inBounds(x, y) && (this.tiles[y][x] === 'land' || this.tiles[y][x] === 'forest');

      // Mountains
      const ranges = clamp(Math.floor(landCells.length / 400), 3, 8);
      const dirs = [
        { x: 1, y: 0 }, { x: -1, y: 0 },
        { x: 0, y: 1 }, { x: 0, y: -1 },
      ];
      const leftOf = (d) => d.x === 1 ? { x: 0, y: -1 } :
                           d.x === -1 ? { x: 0, y: 1 } :
                           d.y === 1 ? { x: 1, y: 0 } : { x: -1, y: 0 };
      const rightOf = (d) => d.x === 1 ? { x: 0, y: 1 } :
                            d.x === -1 ? { x: 0, y: -1 } :
                            d.y === 1 ? { x: -1, y: 0 } : { x: 1, y: 0 };

      for (let r = 0; r < ranges; r++) {
        let start = null;
        for (let tries = 0; tries < 60 && !start; tries++) {
          const c = landCells[randInt(0, landCells.length - 1)];
          const dx = (c.x - cx) / rx;
          const dy = (c.y - cy) / ry;
          const dist = dx * dx + dy * dy;
          if (dist < 0.92 && this.tiles[c.y][c.x] === 'land') start = { ...c };
        }
        if (!start) continue;

        let dir = dirs[randInt(0, dirs.length - 1)];
        const len = randInt(5, 9);
        let { x, y } = start;

        for (let i = 0; i < len; i++) {
          if (!inLand(x, y)) break;
          this.tiles[y][x] = 'mountain';
          const roll = Math.random();
          if (roll < 0.65) {
            // continue
          } else if (roll < 0.82) {
            dir = leftOf(dir);
          } else if (roll < 0.99) {
            dir = rightOf(dir);
          } else {
            dir = dirs[randInt(0, dirs.length - 1)];
          }
          const nx = x + dir.x;
          const ny = y + dir.y;
          if (!inLand(nx, ny)) break;
          x = nx; y = ny;
        }
      }

      // Desert region (irregular edges)
      {
        const targetW = randInt(4, 6);
        const targetH = randInt(5, 7);

        // Pick a center well inside the island
        let center = null;
        for (let tries = 0; tries < 100 && !center; tries++) {
          const c = landCells[randInt(0, landCells.length - 1)];
          if (!c) break;
          const dx = (c.x - cx) / rx;
          const dy = (c.y - cy) / ry;
          const dist = dx * dx + dy * dy;
          if (dist < 0.85 && this.tiles[c.y][c.x] === 'land') center = { ...c };
        }
        if (!center && landCells.length) {
          center = { ...landCells[0] };
        }

        if (center) {
          const a = Math.max(1, (targetW - 1) / 2);
          const b = Math.max(1, (targetH - 1) / 2);
          const cells = [];

          for (let dy = -Math.ceil(b) - 1; dy <= Math.ceil(b) + 1; dy++) {
            for (let dx2 = -Math.ceil(a) - 1; dx2 <= Math.ceil(a) + 1; dx2++) {
              const nx = center.x + dx2;
              const ny = center.y + dy;
              if (!this.inBounds(nx, ny)) continue;

              const nxn = dx2 / a;
              const nyn = dy / b;
              let v = nxn * nxn + nyn * nyn;
              // Jitter the ellipse boundary a bit
              const jitter = (noise2d(nx * 5.27, ny * 6.31) - 0.5) * 0.35;
              v += jitter;

              let include = v <= 1.0;
              // Allow slight protrusions just outside the base ellipse
              if (!include && v <= 1.18 && Math.random() < 0.28) include = true;
              // Nibble away some of the edge to make it ragged
              if (include && v >= 0.9 && Math.random() < 0.35) include = false;

              if (include && this.tiles[ny][nx] === 'land') {
                cells.push({ x: nx, y: ny });
              }
            }
          }

          // Ensure contiguity: BFS from the closest cell to center
          const key = (x, y) => `${x},${y}`;
          const set = new Set(cells.map(p => key(p.x, p.y)));
          if (set.size) {
            let start = null; let best = Infinity;
            for (const p of cells) {
              const d2 = (p.x - center.x) * (p.x - center.x) + (p.y - center.y) * (p.y - center.y);
              if (d2 < best) { best = d2; start = p; }
            }
            const q = [start];
            const vis = new Set([key(start.x, start.y)]);
            const n4 = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
            while (q.length) {
              const cur = q.shift();
              for (const d of n4) {
                const nx = cur.x + d.x, ny = cur.y + d.y;
                const k = key(nx, ny);
                if (!vis.has(k) && set.has(k)) {
                  vis.add(k);
                  q.push({ x: nx, y: ny });
                }
              }
            }
            // Paint the connected component
            vis.forEach(s => {
              const [sx, sy] = s.split(',').map(Number);
              if (this.tiles[sy][sx] === 'land') this.tiles[sy][sx] = 'desert';
            });
          }
        }
      }

      // Swamp region (near center; irregular edges ~6x5)
      {
        const targetW = randInt(5, 7);
        const targetH = randInt(4, 6);

        // Start near the true center with a small random offset
        let center = { x: clamp(cx + randInt(-2, 2), 1, this.mapWidth - 2), y: clamp(cy + randInt(-2, 2), 1, this.mapHeight - 2) };
        if (this.tiles[center.y][center.x] !== 'land') {
          // Find nearest land tile around center
          let found = null;
          for (let r = 1; r <= 8 && !found; r++) {
            for (let dy = -r; dy <= r; dy++) {
              for (let dx = -r; dx <= r; dx++) {
                const nx = clamp(center.x + dx, 1, this.mapWidth - 2);
                const ny = clamp(center.y + dy, 1, this.mapHeight - 2);
                if (this.inBounds(nx, ny) && this.tiles[ny][nx] === 'land') { found = { x: nx, y: ny }; break; }
              }
              if (found) break;
            }
          }
          if (found) center = found;
        }

        if (this.tiles[center.y][center.x] === 'land') {
          const a = Math.max(1, (targetW - 1) / 2);
          const b = Math.max(1, (targetH - 1) / 2);
          const cells = [];

          for (let dy = -Math.ceil(b) - 1; dy <= Math.ceil(b) + 1; dy++) {
            for (let dx2 = -Math.ceil(a) - 1; dx2 <= Math.ceil(a) + 1; dx2++) {
              const nx = center.x + dx2;
              const ny = center.y + dy;
              if (!this.inBounds(nx, ny)) continue;

              const nxn = dx2 / a;
              const nyn = dy / b;
              let v = nxn * nxn + nyn * nyn;
              // Jitter the ellipse boundary a bit
              const jitter = (noise2d(nx * 6.77, ny * 7.91) - 0.5) * 0.33;
              v += jitter;

              let include = v <= 1.0;
              if (!include && v <= 1.18 && Math.random() < 0.24) include = true;
              if (include && v >= 0.9 && Math.random() < 0.32) include = false;

              if (include && this.tiles[ny][nx] === 'land') {
                cells.push({ x: nx, y: ny });
              }
            }
          }

          // Ensure contiguity
          const key = (x, y) => `${x},${y}`;
          const set = new Set(cells.map(p => key(p.x, p.y)));
          if (set.size) {
            let start = null; let best = Infinity;
            for (const p of cells) {
              const d2 = (p.x - center.x) * (p.x - center.x) + (p.y - center.y) * (p.y - center.y);
              if (d2 < best) { best = d2; start = p; }
            }
            const q = [start];
            const vis = new Set([key(start.x, start.y)]);
            const n4 = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
            while (q.length) {
              const cur = q.shift();
              for (const d of n4) {
                const nx = cur.x + d.x, ny = cur.y + d.y;
                const k = key(nx, ny);
                if (!vis.has(k) && set.has(k)) {
                  vis.add(k);
                  q.push({ x: nx, y: ny });
                }
              }
            }
            // Paint the connected component
            vis.forEach(s => {
              const [sx, sy] = s.split(',').map(Number);
              if (this.tiles[sy][sx] === 'land') this.tiles[sy][sx] = 'swamp';
            });
          }
        }
      }

      // Forests
      const candidates = [];
      for (let y = 1; y < this.mapHeight - 1; y++) {
        for (let x = 1; x < this.mapWidth - 1; x++) {
          if (this.tiles[y][x] === 'land') candidates.push({ x, y });
        }
      }
      const seedCount = clamp(Math.floor(candidates.length * 0.035), 4, 60);
      const n8 = [
        { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
        { x: 1, y: 1 }, { x: -1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: -1 },
      ];
      for (let s = 0; s < seedCount; s++) {
        let seed = candidates[randInt(0, candidates.length - 1)];
        if (this.tiles[seed.y][seed.x] !== 'land') continue;
        let { x, y } = seed;
        const cluster = randInt(3, 12);
        for (let i = 0; i < cluster; i++) {
          if (this.tiles[y][x] === 'land') this.tiles[y][x] = 'forest';
          const d = n8[randInt(0, n8.length - 1)];
          const nx = x + d.x;
          const ny = y + d.y;
          if (inWalkableLand(nx, ny) && this.tiles[ny][nx] !== 'mountain') {
            x = nx; y = ny;
          }
        }
      }
      for (const c of candidates) {
        if (this.tiles[c.y][c.x] === 'land' && Math.random() < 0.02) {
          this.tiles[c.y][c.x] = 'forest';
        }
      }

      // Compute main connected region of base-walkable tiles (land/forest/desert/swamp)
      {
        const key = (x, y) => `${x},${y}`;
        const isBase = (x, y) => {
          const t = this.tiles[y][x];
          return t === 'land' || t === 'forest' || t === 'desert' || t === 'swamp';
        };
        const visited = new Set();
        let bestSet = new Set();
        let bestSize = 0;
        const n4 = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
        for (let y = 1; y < this.mapHeight - 1; y++) {
          for (let x = 1; x < this.mapWidth - 1; x++) {
            if (!isBase(x, y)) continue;
            const k0 = key(x, y);
            if (visited.has(k0)) continue;
            const comp = new Set();
            const q = [{ x, y }];
            visited.add(k0);
            comp.add(k0);
            while (q.length) {
              const cur = q.shift();
              for (const d of n4) {
                const nx = cur.x + d.x, ny = cur.y + d.y;
                if (!this.inBounds(nx, ny)) continue;
                if (!isBase(nx, ny)) continue;
                const kk = key(nx, ny);
                if (visited.has(kk)) continue;
                visited.add(kk);
                comp.add(kk);
                q.push({ x: nx, y: ny });
              }
            }
            if (comp.size > bestSize) {
              bestSize = comp.size;
              bestSet = comp;
            }
          }
        }
        this.mainWalkable = bestSet;
      }

      // Goal in north (restricted to main connected region)
      const inMain = (p) => this.mainWalkable?.has(`${p.x},${p.y}`);
      const candidatesMain = candidates.filter(inMain);
      const northBand1 = candidatesMain.filter(c => c.y <= cy - Math.floor(ry * 0.6));
      const northBand2 = candidatesMain.filter(c => c.y <= cy - Math.floor(ry * 0.4));
      const northBand3 = candidatesMain.filter(c => c.y <= cy - Math.floor(ry * 0.2));
      const pools = [northBand1, northBand2, northBand3, candidatesMain];
      let goalPlaced = false;
      for (const pool of pools) {
        const sorted = pool.slice().sort((a, b) => Math.abs(a.x - cx) - Math.abs(b.x - cx));
        for (let tries = 0; tries < 80 && !goalPlaced; tries++) {
          const idx = Math.min(tries, sorted.length - 1);
          const c = sorted[idx] || pool[randInt(0, pool.length - 1)];
          if (!c) break;
          if (this.isSuitableSpecialSpot(c.x, c.y) && inMain(c)) {
            this.tiles[c.y][c.x] = 'goal';
            this.goal = { x: c.x, y: c.y };
            goalPlaced = true;
          }
        }
        if (goalPlaced) break;
      }
      if (!goalPlaced) {
        outer: for (let y = 1; y < this.mapHeight - 1; y++) {
          for (let x = 1; x < this.mapWidth - 1; x++) {
            const p = { x, y };
            if (this.isSuitableSpecialSpot(x, y) && inMain(p)) {
              this.tiles[y][x] = 'goal';
              this.goal = { x, y };
              goalPlaced = true;
              break outer;
            }
          }
        }
      }

      // Vendors - randomized placement across the island
      {
        const manhattan = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
        const used = [];
        if (this.goal) used.push({ x: this.goal.x, y: this.goal.y });

        // Candidate spots: anywhere suitable (land/desert base, with walkable neighbor)
        const cand = [];
        for (let y = 1; y < this.mapHeight - 1; y++) {
          for (let x = 1; x < this.mapWidth - 1; x++) {
            const k = `${x},${y}`;
            if (this.isSuitableSpecialSpot(x, y) && (!this.mainWalkable || this.mainWalkable.has(k))) {
              cand.push({ x, y });
            }
          }
        }

        const farEnough = (pt, min) => used.every(p => manhattan(p, pt) >= min);

        const placeN = (count, type, minDist) => {
          let placed = 0;
          let tries = 0;
          while (placed < count && tries < 1200) {
            tries++;
            if (cand.length === 0) break;
            const c = cand[randInt(0, cand.length - 1)];
            const t = this.tiles[c.y][c.x];
            if ((t === 'land' || t === 'desert') && farEnough(c, minDist)) {
              this.tiles[c.y][c.x] = type;
              used.push({ x: c.x, y: c.y });
              placed++;
            }
          }
        };

        const shopsToPlace = randInt(1, 2);
        const innsToPlace = randInt(2, 4);
        placeN(shopsToPlace, 'shop', 8);
        placeN(1, 'smith', 8);
        placeN(1, 'temple', 8);
        placeN(innsToPlace, 'inn', 10);
      }

      // Pick one special shimmer tile for each biome: forest, mountain, desert
      {
        const pickRandomOfType = (type) => {
          const points = [];
          for (let y = 1; y < this.mapHeight - 1; y++) {
            for (let x = 1; x < this.mapWidth - 1; x++) {
              if (this.tiles[y][x] === type) points.push({ x, y });
            }
          }
          if (!points.length) return null;
          return points[randInt(0, points.length - 1)];
        };

        this.shimmerTiles = {};
        const sForest = pickRandomOfType('forest');
        const sMountain = pickRandomOfType('mountain');
        const sDesert = pickRandomOfType('desert');
        if (sForest) this.shimmerTiles.forest = sForest;
        if (sMountain) this.shimmerTiles.mountain = sMountain;
        if (sDesert) this.shimmerTiles.desert = sDesert;
      }
    },

    placePlayerOnLand() {
      const cx = Math.floor(this.mapWidth / 2);

      let minY = this.mapHeight - 1;
      let maxY = 0;
      for (let y = 0; y < this.mapHeight; y++) {
        for (let x = 0; x < this.mapWidth; x++) {
          const t = this.tiles[y][x];
          if (t !== 'water' && t !== 'mountain') {
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      const bandBottom = Math.max(1, maxY);
      const bandTop = Math.max(1, bandBottom - 6);
      const cols = [];
      for (let dx = 0; dx <= Math.max(6, Math.floor(this.mapWidth / 6)); dx++) {
        if (cx - dx >= 1) cols.push(cx - dx);
        if (dx !== 0 && cx + dx <= this.mapWidth - 2) cols.push(cx + dx);
        if (cols.length > Math.min(16, this.mapWidth)) break;
      }

      for (const x of cols) {
        for (let y = bandBottom; y >= bandTop; y--) {
          if (this.inBounds(x, y) && this.isWalkable(x, y) && (!this.mainWalkable || this.mainWalkable.has(`${x},${y}`))) {
            this.player.x = x;
            this.player.y = y;
            return;
          }
        }
      }

      let fx = cx, fy = Math.floor((bandTop + bandBottom) / 2);
      if (this.inBounds(fx, fy) && this.isWalkable(fx, fy) && (!this.mainWalkable || this.mainWalkable.has(`${fx},${fy}`))) {
        this.player.x = fx;
        this.player.y = fy;
        return;
      }
      let r = 1;
      while (r < Math.max(this.mapWidth, this.mapHeight)) {
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            const x = fx + dx;
            const y = fy + dy;
            if (this.inBounds(x, y) && this.isWalkable(x, y) && (!this.mainWalkable || this.mainWalkable.has(`${x},${y}`))) {
              this.player.x = x;
              this.player.y = y;
              return;
            }
          }
        }
        r++;
      }
      this.player.x = 1;
      this.player.y = this.mapHeight - 2;
    },

    inBounds(x, y) {
      return x >= 0 && y >= 0 && x < this.mapWidth && y < this.mapHeight;
    },

    getTile(x, y) {
      if (!this.inBounds(x, y)) return 'water';
      const row = this.tiles && this.tiles[y];
      if (!row || typeof row[x] === 'undefined') return 'water';
      return row[x];
    },

    isWalkable(x, y) {
      const t = this.getTile(x, y);
      if (t === 'mountain') {
        const extras = (typeof this.getEquipmentExtraEffects === 'function') ? this.getEquipmentExtraEffects() : null;
        if (extras && extras.canWalkMountains) return true;
      }
      return t === 'land' || t === 'forest' || t === 'desert' || t === 'swamp' || t === 'goal' || t === 'shop' || t === 'smith' || t === 'temple' || t === 'inn';
    },

    tileEncounterChance(x, y) {
      const t = this.getTile(x, y);
      let chance = 0;
      if (t === 'forest') chance = this.encounterChanceForest;
      else if (t === 'land' || t === 'desert') chance = this.encounterChanceLand;
      else if (t === 'swamp') chance = this.encounterChanceSwamp;
      return clamp(chance * this.encounterBase, 0, 1);
    },

    isSuitableSpecialSpot(x, y) {
      if (!this.inBounds(x, y)) return false;
      const here = this.tiles[y][x];
      if (here !== 'land' && here !== 'desert') return false;
      const n4 = [
        { x: 1, y: 0 }, { x: -1, y: 0 },
        { x: 0, y: 1 }, { x: 0, y: -1 },
      ];
      for (const d of n4) {
        const nx = x + d.x;
        const ny = y + d.y;
        if (!this.inBounds(nx, ny)) continue;
        const t = this.tiles[ny][nx];
        if (t === 'land' || t === 'forest' || t === 'desert') return true;
      }
      return false;
    },

    resizeToViewport() {
      const cols = Math.ceil(window.innerWidth / this.tileSize);
      const rows = Math.ceil(window.innerHeight / this.tileSize);
      const changed = (cols !== this.viewCols) || (rows !== this.viewRows);
      if (!changed) return;

      this.viewCols = cols;
      this.viewRows = rows;

      this.player.x = clamp(this.player.x, 0, this.mapWidth - 1);
      this.player.y = clamp(this.player.y, 0, this.mapHeight - 1);

      // Recenter camera relative to the player for the new viewport size
      this.cameraX0 = null;
      this.cameraY0 = null;

      this.render();
      this.syncDevConsole();
    },
  });
}