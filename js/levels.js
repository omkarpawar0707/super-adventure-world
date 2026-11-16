/**
 * Super Adventure World - Level Design & Tilemap Engine
 * Handcrafted 3 full platformer levels with unique themes, obstacles,
 * block bumping mechanics, parallax backgrounds, and entity spawners.
 */

class Level {
  constructor(name, theme, mapRows, spawn, exitX, bgmTrack) {
    this.name = name;
    this.theme = theme; // 'grassland', 'forest', 'underground'
    this.tileSize = 32;
    this.bgmTrack = bgmTrack;

    this.height = mapRows.length;
    this.width = mapRows[0].length;
    this.pixelWidth = this.width * this.tileSize;
    this.pixelHeight = this.height * this.tileSize;

    this.spawn = spawn;
    this.exitX = exitX;

    // Active block animations (bumping question / brick blocks)
    this.bumpingBlocks = [];
    this.blockCoins = [];

    // Entities in level
    this.enemies = [];
    this.coins = [];
    this.platforms = [];
    this.checkpoint = null;
    this.flagpole = null;

    // Parse tile grid
    this.tiles = [];
    this.parseMap(mapRows);
  }

  parseMap(mapRows) {
    for (let y = 0; y < this.height; y++) {
      this.tiles[y] = [];
      const row = mapRows[y];
      for (let x = 0; x < this.width; x++) {
        const char = row[x] || ' ';
        this.tiles[y][x] = this.createTileFromChar(char, x, y);
      }
    }
  }

  createTileFromChar(char, tx, ty) {
    switch (char) {
      case 'G': return { type: 'grass', isSolid: true };
      case 'D': return { type: 'dirt', isSolid: true };
      case 'B': return { type: 'brick', isSolid: true };
      case 'S': return { type: 'stone', isSolid: true };
      case 'Q': return { type: 'question', isSolid: true, hasItem: true, itemType: 'coin' };
      case 'M': return { type: 'question', isSolid: true, hasItem: true, itemType: '1up' };
      case 'U': return { type: 'used', isSolid: true };
      case '[': return { type: 'pipe_tl', isSolid: true };
      case ']': return { type: 'pipe_tr', isSolid: true };
      case '<': return { type: 'pipe_bl', isSolid: true };
      case '>': return { type: 'pipe_br', isSolid: true };
      default: return null;
    }
  }

  getTile(tx, ty) {
    if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) {
      return null;
    }
    return this.tiles[ty][tx];
  }

  setTile(tx, ty, tile) {
    if (tx >= 0 && tx < this.width && ty >= 0 && ty < this.height) {
      this.tiles[ty][tx] = tile;
    }
  }

  bumpBlock(tx, ty, onCoinSpawn, isBrick = false) {
    // Check if already bumping
    if (this.bumpingBlocks.some(b => b.tx === tx && b.ty === ty)) return;

    const tile = this.getTile(tx, ty);
    if (!tile) return;

    if (tile.type === 'question' && tile.hasItem) {
      tile.hasItem = false;
      this.setTile(tx, ty, { type: 'used', isSolid: true });
      window.soundEngine.playBump();

      // Spawn leaping coin
      this.blockCoins.push(new BlockCoin(tx * this.tileSize, ty * this.tileSize));
      if (onCoinSpawn) {
        onCoinSpawn(tx * this.tileSize, ty * this.tileSize);
      }

      // Add bumping bounce animation
      this.bumpingBlocks.push({
        tx, ty,
        spriteKey: 'tile_used',
        offsetY: 0,
        vy: -4.0,
        origY: ty * this.tileSize
      });
    } else if (tile.type === 'brick') {
      window.soundEngine.playBump();
      this.bumpingBlocks.push({
        tx, ty,
        spriteKey: this.theme === 'underground' ? 'tile_stone' : 'tile_brick',
        offsetY: 0,
        vy: -3.5,
        origY: ty * this.tileSize
      });
    }

    // Check if any enemy is standing on top of this block
    const blockTopY = ty * this.tileSize;
    const blockX = tx * this.tileSize;
    this.enemies.forEach(e => {
      if (e.isAlive && !e.isSquashed) {
        if (e.x + e.width > blockX && e.x < blockX + this.tileSize && Math.abs(e.y + e.height - blockTopY) <= 4) {
          e.vy = -6.0;
          e.stomp(window.game ? window.game.particleManager : null, 0);
        }
      }
    });
  }

  update(particleManager) {
    // Update active block bumping animations
    for (let i = this.bumpingBlocks.length - 1; i >= 0; i--) {
      const b = this.bumpingBlocks[i];
      b.offsetY += b.vy;
      b.vy += 0.8; // Return down

      if (b.offsetY >= 0) {
        b.offsetY = 0;
        this.bumpingBlocks.splice(i, 1);
      }
    }

    // Update popped block coins
    for (let i = this.blockCoins.length - 1; i >= 0; i--) {
      const bc = this.blockCoins[i];
      bc.update(particleManager);
      if (bc.isDone) {
        this.blockCoins.splice(i, 1);
      }
    }

    // Update moving platforms
    this.platforms.forEach(p => p.update());

    // Update checkpoint & flagpole
    if (this.checkpoint) this.checkpoint.update();
    if (this.flagpole) this.flagpole.update();

    // Update coins
    this.coins.forEach(c => c.update());

    // Update active enemies (only when reasonably close to camera)
    const camX = window.game ? window.game.camera.x : 0;
    this.enemies.forEach(e => {
      // Activate enemy when within 600px of view
      if (e.x > camX - 100 && e.x < camX + 900) {
        e.update(this, this.platforms, this.enemies, particleManager);
      }
    });
  }

  drawBackground(ctx, camera, viewWidth, viewHeight) {
    if (this.theme === 'grassland') {
      // 1. Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, viewHeight);
      skyGrad.addColorStop(0, '#5BB6FF');
      skyGrad.addColorStop(0.7, '#A5E1FF');
      skyGrad.addColorStop(1, '#D8F3FF');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, viewWidth, viewHeight);

      // 2. Distant Clouds (Parallax 0.15)
      const cloudOffset = (camera.x * 0.15) % 360;
      for (let x = -100 - cloudOffset; x < viewWidth + 200; x += 240) {
        window.spriteManager.draw(ctx, 'bg_cloud', x, 40);
        window.spriteManager.draw(ctx, 'bg_cloud', x + 130, 90);
      }

      // 3. Mountains (Parallax 0.3)
      const mtnOffset = (camera.x * 0.3) % 400;
      for (let x = -100 - mtnOffset; x < viewWidth + 200; x += 320) {
        window.spriteManager.draw(ctx, 'bg_mountain', x, viewHeight - 160);
      }

      // 4. Background Trees / Hills (Parallax 0.5)
      const treeOffset = (camera.x * 0.5) % 250;
      for (let x = -50 - treeOffset; x < viewWidth + 150; x += 180) {
        window.spriteManager.draw(ctx, 'bg_tree', x, viewHeight - 145);
      }
    } else if (this.theme === 'forest') {
      // Twilight Forest theme
      const forestGrad = ctx.createLinearGradient(0, 0, 0, viewHeight);
      forestGrad.addColorStop(0, '#1E1B4B');
      forestGrad.addColorStop(0.5, '#4C1D95');
      forestGrad.addColorStop(1, '#064E3B');
      ctx.fillStyle = forestGrad;
      ctx.fillRect(0, 0, viewWidth, viewHeight);

      // Star flecks
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let i = 0; i < 20; i++) {
        const sx = ((i * 53) - (camera.x * 0.05)) % viewWidth;
        const sy = (i * 19) % (viewHeight * 0.6);
        ctx.fillRect(sx >= 0 ? sx : sx + viewWidth, sy, 2, 2);
      }

      // Distant Giant Mushrooms (Parallax 0.25)
      const mushOffset = (camera.x * 0.25) % 350;
      for (let x = -100 - mushOffset; x < viewWidth + 200; x += 220) {
        // Mushroom cap
        ctx.fillStyle = '#831843';
        ctx.beginPath();
        ctx.arc(x + 50, viewHeight - 140, 50, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#F472B6';
        ctx.beginPath();
        ctx.arc(x + 50, viewHeight - 140, 36, Math.PI, 0);
        ctx.fill();
        // Stem
        ctx.fillStyle = '#FDF2F8';
        ctx.fillRect(x + 40, viewHeight - 140, 20, 80);
      }
    } else if (this.theme === 'underground') {
      // Dark Cavern theme
      ctx.fillStyle = '#0B0F19';
      ctx.fillRect(0, 0, viewWidth, viewHeight);

      // Hanging rock stalactites (Parallax 0.2)
      const stalOffset = (camera.x * 0.2) % 300;
      ctx.fillStyle = '#1E293B';
      for (let x = -50 - stalOffset; x < viewWidth + 100; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 25, 45 + ((x % 3) * 15));
        ctx.lineTo(x + 50, 0);
        ctx.closePath();
        ctx.fill();
      }

      // Glowing crystals on background walls
      ctx.fillStyle = '#38BDF8';
      for (let i = 0; i < 25; i++) {
        const cx = ((i * 67) - (camera.x * 0.4)) % viewWidth;
        const cy = 60 + (i * 23) % (viewHeight - 140);
        ctx.fillRect(cx >= 0 ? cx : cx + viewWidth, cy, 3, 6);
      }
    }
  }

  drawTiles(ctx, camera, viewWidth, viewHeight) {
    const minTileX = Math.max(0, Math.floor(camera.x / this.tileSize));
    const maxTileX = Math.min(this.width - 1, Math.ceil((camera.x + viewWidth) / this.tileSize));
    const minTileY = 0;
    const maxTileY = Math.min(this.height - 1, Math.ceil((camera.y + viewHeight) / this.tileSize));

    const animFrame = Math.floor(Date.now() / 200) % 4;

    for (let ty = minTileY; ty <= maxTileY; ty++) {
      for (let tx = minTileX; tx <= maxTileX; tx++) {
        const tile = this.tiles[ty][tx];
        if (!tile) continue;

        // Skip rendering if block is currently animated in bumpingBlocks
        const bumping = this.bumpingBlocks.find(b => b.tx === tx && b.ty === ty);
        if (bumping) continue;

        const rx = Math.round(tx * this.tileSize - camera.x);
        const ry = Math.round(ty * this.tileSize - camera.y);

        switch (tile.type) {
          case 'grass':
            window.spriteManager.draw(ctx, 'tile_grass', rx, ry);
            break;
          case 'dirt':
            window.spriteManager.draw(ctx, 'tile_dirt', rx, ry);
            break;
          case 'brick':
            window.spriteManager.draw(ctx, 'tile_brick', rx, ry);
            break;
          case 'stone':
            window.spriteManager.draw(ctx, 'tile_stone', rx, ry);
            break;
          case 'question':
            window.spriteManager.draw(ctx, `tile_question_${animFrame}`, rx, ry);
            break;
          case 'used':
            window.spriteManager.draw(ctx, 'tile_used', rx, ry);
            break;
          case 'pipe_tl':
            window.spriteManager.draw(ctx, 'pipe_top_left', rx, ry);
            break;
          case 'pipe_tr':
            window.spriteManager.draw(ctx, 'pipe_top_right', rx, ry);
            break;
          case 'pipe_bl':
            window.spriteManager.draw(ctx, 'pipe_body_left', rx, ry);
            break;
          case 'pipe_br':
            window.spriteManager.draw(ctx, 'pipe_body_right', rx, ry);
            break;
        }
      }
    }

    // Draw active bumping blocks
    this.bumpingBlocks.forEach(b => {
      const rx = Math.round(b.tx * this.tileSize - camera.x);
      const ry = Math.round(b.origY + b.offsetY - camera.y);
      window.spriteManager.draw(ctx, b.spriteKey, rx, ry);
    });

    // Draw popped block coins
    this.blockCoins.forEach(bc => bc.draw(ctx, camera));
  }

  drawEntities(ctx, camera) {
    // 1. Checkpoint
    if (this.checkpoint) this.checkpoint.draw(ctx, camera);

    // 2. Flagpole
    if (this.flagpole) this.flagpole.draw(ctx, camera);

    // 3. Castle
    if (this.exitX) {
      window.spriteManager.draw(ctx, 'castle', this.exitX - camera.x, this.pixelHeight - 160, 128, 128);
    }

    // 4. Moving platforms
    this.platforms.forEach(p => p.draw(ctx, camera));

    // 5. Coins
    this.coins.forEach(c => c.draw(ctx, camera));

    // 6. Enemies
    this.enemies.forEach(e => e.draw(ctx, camera));
  }

  // ==========================================
  // LEVEL 1: GREEN GRASSLAND (WORLD 1-1)
  // ==========================================
  static createLevel1() {
    // 100 tiles wide x 14 tiles high (448px high)
    const W = 105;
    const H = 14;
    const rows = [];
    for (let y = 0; y < H; y++) {
      rows[y] = new Array(W).fill(' ');
    }

    // Fill ground with gaps
    for (let x = 0; x < W; x++) {
      // Pits at x=34..36, x=65..67
      if ((x >= 34 && x <= 36) || (x >= 66 && x <= 68)) {
        continue;
      }
      rows[12][x] = 'G';
      rows[13][x] = 'D';
    }

    // --- Starting Area ---
    // Question blocks & coins
    rows[9][10] = 'Q'; // Coin block
    rows[9][14] = 'B';
    rows[9][15] = 'Q';
    rows[9][16] = 'B';
    rows[9][17] = 'Q';
    rows[9][18] = 'B';
    rows[6][16] = 'Q'; // High block

    // Low Pipe 1 (x=22)
    rows[11][22] = '['; rows[11][23] = ']';
    rows[10][22] = '['; rows[10][23] = ']';

    // Medium Pipe 2 (x=28)
    rows[11][28] = '<'; rows[11][29] = '>';
    rows[10][28] = '['; rows[10][29] = ']';

    // Moving Platform over first gap (x=33..37)
    // Defined in entities below

    // Brick path with Question block
    for (let x = 42; x <= 49; x++) {
      rows[9][x] = (x === 45) ? 'Q' : 'B';
    }

    // Pipe 3 (x=53)
    rows[11][53] = '<'; rows[11][54] = '>';
    rows[10][53] = '['; rows[10][54] = ']';

    // High Brick Steps
    rows[10][59] = 'B';
    rows[9][60] = 'B';
    rows[8][61] = 'B';
    rows[8][62] = 'Q';
    rows[8][63] = 'B';

    // Second Gap (x=66..68) with high jump platform
    rows[8][72] = 'B';
    rows[8][73] = 'B';
    rows[8][74] = 'B';

    // Staircase leading to Flagpole (x=82..88)
    for (let step = 0; step < 5; step++) {
      for (let s = 0; s <= step; s++) {
        rows[11 - s][82 + step] = 'B';
      }
    }

    const mapRows = rows.map(r => r.join(''));
    const level = new Level('Green Grassland', 'grassland', mapRows, { x: 60, y: 340 }, 95 * 32, 'grassland');

    // Platforms
    level.platforms.push(new MovingPlatform(33 * 32, 11 * 32, 38 * 32, 11 * 32, 56, 1.2));

    // Checkpoint at x=50
    level.checkpoint = new Checkpoint(50 * 32, 10 * 32);

    // Flagpole at x=91
    level.flagpole = new Flagpole(91 * 32, 3 * 32, 280);

    // Coins
    const coinCoords = [
      [11, 8], [12, 8], [13, 8],
      [25, 11], [26, 11],
      [43, 8], [44, 8], [46, 8], [47, 8],
      [61, 7], [62, 6], [63, 7],
      [72, 7], [73, 7], [74, 7],
      [89, 11], [90, 11]
    ];
    coinCoords.forEach(([cx, cy]) => {
      level.coins.push(new Coin(cx * 32 + 4, cy * 32 + 4));
    });

    // Enemies
    level.enemies.push(new MushroomEnemy(18 * 32, 11 * 32));
    level.enemies.push(new MushroomEnemy(25 * 32, 11 * 32));
    level.enemies.push(new MushroomEnemy(31 * 32, 11 * 32));
    level.enemies.push(new TurtleEnemy(46 * 32, 8 * 32));
    level.enemies.push(new MushroomEnemy(56 * 32, 11 * 32));
    level.enemies.push(new MushroomEnemy(73 * 32, 7 * 32));
    level.enemies.push(new TurtleEnemy(77 * 32, 11 * 32));

    return level;
  }

  // ==========================================
  // LEVEL 2: MUSHROOM FOREST (WORLD 1-2)
  // ==========================================
  static createLevel2() {
    const W = 110;
    const H = 14;
    const rows = [];
    for (let y = 0; y < H; y++) {
      rows[y] = new Array(W).fill(' ');
    }

    // Broken forest canopy terrain
    for (let x = 0; x < W; x++) {
      // Wider gaps
      if ((x >= 20 && x <= 24) || (x >= 45 && x <= 50) || (x >= 70 && x <= 75)) {
        continue;
      }
      rows[12][x] = 'G';
      rows[13][x] = 'D';
    }

    // Tree canopy branches / platforms
    for (let x = 12; x <= 18; x++) rows[9][x] = 'B';
    rows[9][15] = 'Q';

    // Mid-air platforms over gap 1 (x=20..24)
    rows[8][21] = 'B'; rows[8][23] = 'B';

    // Tiered mushroom grove
    for (let x = 28; x <= 36; x++) rows[9][x] = (x % 2 === 0) ? 'B' : 'Q';
    for (let x = 30; x <= 34; x++) rows[6][x] = 'B';

    // Pipes
    rows[11][40] = '['; rows[11][41] = ']';
    rows[10][40] = '['; rows[10][41] = ']';

    // Second Gap (x=45..50) with moving platform
    // Checkpoint at x=53
    for (let x = 55; x <= 62; x++) rows[9][x] = 'B';
    rows[9][58] = 'Q';

    // Elevated bridge across third gap (x=70..75)
    rows[7][68] = 'B';
    rows[7][72] = 'B';
    rows[7][76] = 'B';

    // Flagpole approach
    for (let x = 84; x <= 89; x++) {
      rows[10][x] = 'B';
      if (x >= 86) rows[9][x] = 'B';
      if (x >= 88) rows[8][x] = 'B';
    }

    const mapRows = rows.map(r => r.join(''));
    const level = new Level('Mushroom Forest', 'forest', mapRows, { x: 50, y: 340 }, 98 * 32, 'forest');

    // Moving platforms
    level.platforms.push(new MovingPlatform(20 * 32, 10 * 32, 24 * 32, 10 * 32, 54, 1.3));
    level.platforms.push(new MovingPlatform(45 * 32, 11 * 32, 50 * 32, 8 * 32, 60, 1.4));
    level.platforms.push(new MovingPlatform(70 * 32, 9 * 32, 75 * 32, 9 * 32, 56, 1.5));

    // Checkpoint
    level.checkpoint = new Checkpoint(53 * 32, 10 * 32);

    // Flagpole
    level.flagpole = new Flagpole(94 * 32, 3 * 32, 280);

    // Coins
    const coinCoords = [
      [14, 8], [15, 8], [16, 8],
      [22, 7],
      [31, 5], [32, 5], [33, 5],
      [42, 11], [43, 11],
      [56, 8], [57, 8], [59, 8], [60, 8],
      [71, 6], [73, 6], [75, 6],
      [90, 11], [91, 11]
    ];
    coinCoords.forEach(([cx, cy]) => {
      level.coins.push(new Coin(cx * 32 + 4, cy * 32 + 4));
    });

    // Enemies (Forest features Shelly turtles and Flying Flappies!)
    level.enemies.push(new MushroomEnemy(14 * 32, 8 * 32));
    level.enemies.push(new TurtleEnemy(32 * 32, 8 * 32));
    level.enemies.push(new FlyingEnemy(23 * 32, 6 * 32, 40, 0.05));
    level.enemies.push(new MushroomEnemy(38 * 32, 11 * 32));
    level.enemies.push(new FlyingEnemy(48 * 32, 7 * 32, 55, 0.04));
    level.enemies.push(new TurtleEnemy(58 * 32, 8 * 32));
    level.enemies.push(new FlyingEnemy(73 * 32, 6 * 32, 45, 0.06));
    level.enemies.push(new MushroomEnemy(80 * 32, 11 * 32));
    level.enemies.push(new TurtleEnemy(85 * 32, 11 * 32));

    return level;
  }

  // ==========================================
  // LEVEL 3: UNDERGROUND ADVENTURE (WORLD 1-3)
  // ==========================================
  static createLevel3() {
    const W = 115;
    const H = 14;
    const rows = [];
    for (let y = 0; y < H; y++) {
      rows[y] = new Array(W).fill(' ');
    }

    // Cavern Ceiling
    for (let x = 0; x < W; x++) {
      rows[0][x] = 'S';
      if (x % 4 === 0) rows[1][x] = 'S';
    }

    // Underground Floor with deep pits
    for (let x = 0; x < W; x++) {
      if ((x >= 22 && x <= 26) || (x >= 46 && x <= 51) || (x >= 72 && x <= 77)) {
        continue;
      }
      rows[12][x] = 'S';
      rows[13][x] = 'S';
    }

    // Stone Pillars & High Bridges
    for (let x = 8; x <= 14; x++) rows[9][x] = (x === 11) ? 'Q' : 'S';

    // Underground Pipes
    rows[11][18] = '<'; rows[11][19] = '>';
    rows[10][18] = '['; rows[10][19] = ']';

    // Narrow jumping pillars over pit 1 (x=22..26)
    rows[10][23] = 'S';
    rows[8][25] = 'S';

    // Deep Cavern Chamber
    for (let x = 30; x <= 42; x++) {
      rows[9][x] = (x % 3 === 0) ? 'Q' : 'S';
    }
    rows[6][34] = 'S';
    rows[6][35] = 'M'; // Secret 1-UP / Power Question block
    rows[6][36] = 'S';

    // Pit 2 (x=46..51) with vertical moving lift
    // Checkpoint at x=53
    for (let x = 55; x <= 64; x++) {
      rows[10][x] = 'S';
      if (x >= 58 && x <= 62) rows[7][x] = 'S';
    }

    // Tall Pipe
    rows[11][68] = '<'; rows[11][69] = '>';
    rows[10][68] = '<'; rows[10][69] = '>';
    rows[9][68] = '['; rows[9][69] = ']';

    // Pit 3 (x=72..77) with dual moving platforms
    // Grand Staircase to Surface Exit Pipe & Flagpole
    for (let step = 0; step < 6; step++) {
      for (let s = 0; s <= step; s++) {
        rows[11 - s][86 + step] = 'S';
      }
    }

    const mapRows = rows.map(r => r.join(''));
    const level = new Level('Underground Adventure', 'underground', mapRows, { x: 50, y: 340 }, 104 * 32, 'underground');

    // Platforms
    level.platforms.push(new MovingPlatform(46 * 32, 11 * 32, 51 * 32, 6 * 32, 54, 1.4));
    level.platforms.push(new MovingPlatform(72 * 32, 10 * 32, 77 * 32, 10 * 32, 56, 1.5));

    // Checkpoint
    level.checkpoint = new Checkpoint(53 * 32, 10 * 32);

    // Flagpole
    level.flagpole = new Flagpole(98 * 32, 3 * 32, 280);

    // Coins
    const coinCoords = [
      [10, 8], [11, 8], [12, 8],
      [23, 8], [25, 6],
      [32, 8], [34, 5], [35, 5], [36, 5], [38, 8],
      [59, 6], [60, 6], [61, 6],
      [73, 8], [75, 8],
      [93, 5], [94, 5]
    ];
    coinCoords.forEach(([cx, cy]) => {
      level.coins.push(new Coin(cx * 32 + 4, cy * 32 + 4));
    });

    // Enemies (Bats, fast shells, aggressive mushrooms)
    level.enemies.push(new MushroomEnemy(12 * 32, 8 * 32));
    level.enemies.push(new FlyingEnemy(24 * 32, 5 * 32, 35, 0.05));
    level.enemies.push(new TurtleEnemy(35 * 32, 8 * 32));
    level.enemies.push(new FlyingEnemy(48 * 32, 6 * 32, 50, 0.05));
    level.enemies.push(new MushroomEnemy(57 * 32, 9 * 32));
    level.enemies.push(new TurtleEnemy(61 * 32, 6 * 32));
    level.enemies.push(new FlyingEnemy(74 * 32, 7 * 32, 45, 0.06));
    level.enemies.push(new MushroomEnemy(82 * 32, 11 * 32));
    level.enemies.push(new TurtleEnemy(84 * 32, 11 * 32));

    return level;
  }
}

window.Level = Level;
