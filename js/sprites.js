/**
 * Super Adventure World - Pixel Art Sprite Generator & Cache
 * Generates crisp 16-bit retro pixel art on offscreen canvases.
 * Zero external image dependencies = 100% reliable offline & file:// execution.
 */

class SpriteManager {
  constructor() {
    this.sprites = {};
    this.TILE_SIZE = 32;
    this.initSprites();
  }

  // Create an offscreen canvas of width x height
  createCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas: c, ctx: ctx };
  }

  initSprites() {
    this.generatePlayerSprites();
    this.generateEnemySprites();
    this.generateTileSprites();
    this.generateItemSprites();
    this.generateScenerySprites();
  }

  // Helper to draw a pixel grid from color array
  drawPixelGrid(ctx, x, y, pixelSize, matrix, colorMap) {
    for (let r = 0; r < matrix.length; r++) {
      const row = matrix[r];
      for (let c = 0; c < row.length; c++) {
        const char = row[c];
        if (char !== ' ' && colorMap[char]) {
          ctx.fillStyle = colorMap[char];
          ctx.fillRect(x + c * pixelSize, y + r * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }

  // --- PLAYER HERO SPRITES ("Pip") ---
  generatePlayerSprites() {
    const P = 2; // pixel scale: 16x16 grid -> 32x32 sprite
    const colors = {
      'R': '#E52521', // Cap / Shirt Red
      'D': '#9E1A17', // Dark Red outline/shadow
      'B': '#002699', // Overalls Royal Blue
      'L': '#0055FF', // Blue highlight
      'S': '#FFCCA3', // Peach Skin
      'H': '#663300', // Hair / Mustache / Shoes Brown
      'K': '#1A0D00', // Dark Brown / Boot sole
      'Y': '#FFD700', // Yellow buttons / accents
      'W': '#FFFFFF', // Eye white
      'E': '#111111'  // Eye black
    };

    // Hero: Idle
    const idleMap = [
      "     RRRRRR     ",
      "    RRRRRRRRR   ",
      "    HHHSSES     ",
      "   HSHSSSEEE    ",
      "   HSHHSSSEEE   ",
      "   HHSSSS       ",
      "     SSSSSS     ",
      "    RRBRRR      ",
      "   RRRBRRRRR    ",
      "  RRRRBBBBRRR   ",
      "  SS BBYBB SS   ",
      "  SS BBBBB SS   ",
      "     BB BB      ",
      "    BBB BBB     ",
      "    KKK KKK     ",
      "   KKKK KKKK    "
    ];

    // Hero: Run 1
    const run1Map = [
      "     RRRRRR     ",
      "    RRRRRRRRR   ",
      "    HHHSSES     ",
      "   HSHSSSEEE    ",
      "   HSHHSSSEEE   ",
      "   HHSSSS       ",
      "     SSSSSS     ",
      "    RRBRRR      ",
      "   RRRBRRRRR    ",
      "  RRRRBBBBRRR   ",
      "  SS BBYBB      ",
      "     BBBBB      ",
      "    BBB BB SS   ",
      "   KKK   BBB    ",
      "  KKKK    KKK   ",
      "          KKKK  "
    ];

    // Hero: Run 2
    const run2Map = [
      "     RRRRRR     ",
      "    RRRRRRRRR   ",
      "    HHHSSES     ",
      "   HSHSSSEEE    ",
      "   HSHHSSSEEE   ",
      "   HHSSSS       ",
      "     SSSSSS     ",
      "    RRBRRR      ",
      "   RRRBRRR      ",
      "  SSRRBBBBRSS   ",
      "   SS BBYBB SS  ",
      "     BBBBB      ",
      "     BB BB      ",
      "    BBB BBB     ",
      "   KKKK KKKK    ",
      "   KKK   KKK    "
    ];

    // Hero: Run 3
    const run3Map = [
      "     RRRRRR     ",
      "    RRRRRRRRR   ",
      "    HHHSSES     ",
      "   HSHSSSEEE    ",
      "   HSHHSSSEEE   ",
      "   HHSSSS       ",
      "     SSSSSS     ",
      "    RRBRRR      ",
      "   RRRBRRRRR    ",
      "   RRRBBBBRRR   ",
      "      BBYBB SS  ",
      "     BBBBB  SS  ",
      "   SS BB BBB    ",
      "    BBB   KKK   ",
      "   KKK    KKKK  ",
      "  KKKK          "
    ];

    // Hero: Jump
    const jumpMap = [
      "  SS RRRRRR     ",
      "  SSRRRRRRRRR   ",
      "    HHHSSES     ",
      "   HSHSSSEEE    ",
      "   HSHHSSSEEE   ",
      "   HHSSSS       ",
      "    RRSSSSSS    ",
      "   RRRRBRRR  SS ",
      "  RRRRRBRRRR SS ",
      "      BBBBRRR   ",
      "     BBBYBB     ",
      "    BBBBBBB     ",
      "   KK BBB BB    ",
      "  KKKK BBB KK   ",
      "       KKK KKKK ",
      "                "
    ];

    // Hero: Skid
    const skidMap = [
      "     RRRRRR     ",
      "    RRRRRRRRR   ",
      "    HHHSSES     ",
      "   HSHSSSEEE    ",
      "   HSHHSSSEEE   ",
      "   HHSSSS       ",
      "     SSSSSS     ",
      "    RRBRRR      ",
      "  SSRRBRRRRR    ",
      "  SSRRBBBBRRR   ",
      "     BBYBB      ",
      "    BBBBBBB     ",
      "    BB   BB     ",
      "   KKKK KKKK    ",
      "  KKKK   KKKK   ",
      "                "
    ];

    // Hero: Death / Fall
    const deathMap = [
      "     RRRRRR     ",
      "    RRRRRRRRR   ",
      "    HHHS SES    ",
      "   HSHSS  EE    ",
      "   HSHHSS EE    ",
      "   HHSSSS       ",
      "     SSSSSS     ",
      "  SS RRRRRR SS  ",
      "  SS RBBBRR SS  ",
      "    RRBBBBRR    ",
      "     BBYBB      ",
      "    BBBBBBB     ",
      "   KKK   KKK    ",
      "  KKKK   KKKK   ",
      "  KK       KK   ",
      "                "
    ];

    const generateVariant = (map, name) => {
      // Facing Right
      const { canvas: rCanv, ctx: rCtx } = this.createCanvas(32, 32);
      this.drawPixelGrid(rCtx, 0, 0, P, map, colors);
      this.sprites[`hero_${name}_right`] = rCanv;

      // Facing Left (mirrored horizontally)
      const { canvas: lCanv, ctx: lCtx } = this.createCanvas(32, 32);
      lCtx.translate(32, 0);
      lCtx.scale(-1, 1);
      lCtx.drawImage(rCanv, 0, 0);
      this.sprites[`hero_${name}_left`] = lCanv;
    };

    generateVariant(idleMap, 'idle');
    generateVariant(run1Map, 'run1');
    generateVariant(run2Map, 'run2');
    generateVariant(run3Map, 'run3');
    generateVariant(jumpMap, 'jump');
    generateVariant(skidMap, 'skid');
    generateVariant(deathMap, 'die');
  }

  // --- ENEMY SPRITES ---
  generateEnemySprites() {
    const P = 2;

    // 1. Walking Mushroom ("Sporey")
    const sporeyColors = {
      'R': '#CC2200', // Cap Red
      'D': '#881100', // Cap Shadow
      'W': '#FFFFFF', // Spots / Eye white
      'S': '#FAD5A5', // Stem Cream
      'T': '#D49A6A', // Stem Dark
      'E': '#1A1A1A', // Eye Black
      'B': '#5A3214'  // Feet Brown
    };

    const sporeyWalk1 = [
      "     RRRRRR     ",
      "   RRWWWRRRRR   ",
      "  RRWWWWRRWWWR  ",
      " RRWWWWWRWWWWWR ",
      " RRRRRRRRRRRRRR ",
      " RRRRRRRRRRRRRR ",
      "  DDDDDDDDDDDD  ",
      "    SSSSSSSS    ",
      "   SSEESSEESS   ",
      "   SSEESSEESS   ",
      "   SSSSSSSSSS   ",
      "   SSSSSSSSSS   ",
      "  BBBB    SSSS  ",
      " BBBBBB   BBBB  ",
      " BBBBBB  BBBBBB ",
      "  BBBB   BBBBBB "
    ];

    const sporeyWalk2 = [
      "     RRRRRR     ",
      "   RRWWWRRRRR   ",
      "  RRWWWWRRWWWR  ",
      " RRWWWWWRWWWWWR ",
      " RRRRRRRRRRRRRR ",
      " RRRRRRRRRRRRRR ",
      "  DDDDDDDDDDDD  ",
      "    SSSSSSSS    ",
      "   SSEESSEESS   ",
      "   SSEESSEESS   ",
      "   SSSSSSSSSS   ",
      "   SSSSSSSSSS   ",
      "   SSSS   BBBB  ",
      "   BBBB  BBBBBB ",
      "  BBBBBB BBBBBB ",
      "  BBBBBB  BBBB  "
    ];

    const sporeySquashed = [
      "                ",
      "                ",
      "                ",
      "                ",
      "                ",
      "                ",
      "                ",
      "     RRRRRR     ",
      "   RRWWWRRRRR   ",
      "  RRWWWWRRWWWR  ",
      " RRRRRRRRRRRRRR ",
      "  DDDDDDDDDDDD  ",
      "  SSEESSEESSEE  ",
      " SSSSSSSSSSSSSS ",
      "BBBBBBBBBBBBBBBB",
      "BBBBBBBBBBBBBBBB"
    ];

    const { canvas: sp1, ctx: sp1Ctx } = this.createCanvas(32, 32);
    this.drawPixelGrid(sp1Ctx, 0, 0, P, sporeyWalk1, sporeyColors);
    this.sprites['sporey_walk1'] = sp1;

    const { canvas: sp2, ctx: sp2Ctx } = this.createCanvas(32, 32);
    this.drawPixelGrid(sp2Ctx, 0, 0, P, sporeyWalk2, sporeyColors);
    this.sprites['sporey_walk2'] = sp2;

    const { canvas: spSq, ctx: spSqCtx } = this.createCanvas(32, 32);
    this.drawPixelGrid(spSqCtx, 0, 0, P, sporeySquashed, sporeyColors);
    this.sprites['sporey_squashed'] = spSq;

    // 2. Turtle ("Shelly")
    const shellyColors = {
      'G': '#22AA22', // Green Shell
      'D': '#116611', // Dark Green
      'Y': '#FFCC00', // Yellow Head/Belly
      'O': '#CC8800', // Orange Shadow
      'W': '#FFFFFF', // White Rim / Eye
      'E': '#1A1A1A', // Eye Black
      'B': '#FF9900'  // Beak/Feet
    };

    const shellyWalk1 = [
      "        YYYY    ",
      "       YYWEEY   ",
      "       YYEEEE   ",
      "      YYYYYYB   ",
      "     DDDDDD     ",
      "    DGGGGGGDD   ",
      "   DGGGGGGGGGD  ",
      "  DGGYGGGGYGGGD ",
      "  DGGYYGGYYGGGD ",
      "  DGGGGGGGGGGGD ",
      "   DDDDDDDDDDD  ",
      "   WWWWWWWWWWW  ",
      "    BBBB   BBBB ",
      "   BBBBBB   BBB ",
      "   BBBBBB   BBB ",
      "    BBBB        "
    ];

    const shellyWalk2 = [
      "        YYYY    ",
      "       YYWEEY   ",
      "       YYEEEE   ",
      "      YYYYYYB   ",
      "     DDDDDD     ",
      "    DGGGGGGDD   ",
      "   DGGGGGGGGGD  ",
      "  DGGYGGGGYGGGD ",
      "  DGGYYGGYYGGGD ",
      "  DGGGGGGGGGGGD ",
      "   DDDDDDDDDDD  ",
      "   WWWWWWWWWWW  ",
      "    BBBB  BBBB  ",
      "    BBB  BBBBBB ",
      "    BBB  BBBBBB ",
      "          BBBB  "
    ];

    const shellyShell = [
      "                ",
      "                ",
      "     DDDDDD     ",
      "   DDGGGGGGDD   ",
      "  DGGGGGGGGGGGD ",
      " DGGYGGGGGGYGGGD",
      " DGGYYGGGGYYGGGD",
      " DGGGGGGGGGGGGGD",
      " DGGGGGGGGGGGGGD",
      " DGGYGGGGGGYGGGD",
      "  DGGYYGGYYGGGD ",
      "  DGGGGGGGGGGGD ",
      "   DDDDDDDDDDD  ",
      "   WWWWWWWWWWW  ",
      "    DDDDDDDDD   ",
      "                "
    ];

    const { canvas: sh1, ctx: sh1Ctx } = this.createCanvas(32, 32);
    this.drawPixelGrid(sh1Ctx, 0, 0, P, shellyWalk1, shellyColors);
    this.sprites['shelly_walk1_right'] = sh1;

    const { canvas: sh1L, ctx: sh1LCtx } = this.createCanvas(32, 32);
    sh1LCtx.translate(32, 0);
    sh1LCtx.scale(-1, 1);
    sh1LCtx.drawImage(sh1, 0, 0);
    this.sprites['shelly_walk1_left'] = sh1L;

    const { canvas: sh2, ctx: sh2Ctx } = this.createCanvas(32, 32);
    this.drawPixelGrid(sh2Ctx, 0, 0, P, shellyWalk2, shellyColors);
    this.sprites['shelly_walk2_right'] = sh2;

    const { canvas: sh2L, ctx: sh2LCtx } = this.createCanvas(32, 32);
    sh2LCtx.translate(32, 0);
    sh2LCtx.scale(-1, 1);
    sh2LCtx.drawImage(sh2, 0, 0);
    this.sprites['shelly_walk2_left'] = sh2L;

    const { canvas: shSh, ctx: shShCtx } = this.createCanvas(32, 32);
    this.drawPixelGrid(shShCtx, 0, 0, P, shellyShell, shellyColors);
    this.sprites['shelly_shell'] = shSh;

    // 3. Flying Enemy ("Flappy")
    const flappyColors = {
      'P': '#7E22CE', // Purple Body
      'D': '#581C87', // Dark Purple
      'C': '#38BDF8', // Wing Light Cyan
      'W': '#FFFFFF', // Wing / Eye White
      'E': '#0F172A', // Eye pupil
      'Y': '#FACC15'  // Beak / Feet
    };

    const flappyWingsUp = [
      "  CCCC    CCCC  ",
      " CWWWWCC CCWWWC ",
      " CWWWWWW CWWWWWC",
      "  CWWWWW CWWWWWC",
      "   CCCCDPPDCCCC ",
      "      DPPPPD    ",
      "     DPWEWEPD   ",
      "     DPPEEPPD   ",
      "      DPYYPD    ",
      "      DPPPPD    ",
      "       DPPD     ",
      "       YYYY     ",
      "      YYYYYY    ",
      "                ",
      "                ",
      "                "
    ];

    const flappyWingsDown = [
      "                ",
      "                ",
      "      DPPD      ",
      "     DPPPPD     ",
      "    DPWEWEPD    ",
      "    DPPEEPPD    ",
      "  CCCCDYYPDCCCC ",
      " CWWWWDPPPDCWWWC",
      " CWWWWWW  CWWWWC",
      "  CWWWWW  CWWWWC",
      "   CCCCYYYYCCCC ",
      "      YYYYYY    ",
      "                ",
      "                ",
      "                ",
      "                "
    ];

    const { canvas: flUp, ctx: flUpCtx } = this.createCanvas(32, 32);
    this.drawPixelGrid(flUpCtx, 0, 0, P, flappyWingsUp, flappyColors);
    this.sprites['flappy_up'] = flUp;

    const { canvas: flDn, ctx: flDnCtx } = this.createCanvas(32, 32);
    this.drawPixelGrid(flDnCtx, 0, 0, P, flappyWingsDown, flappyColors);
    this.sprites['flappy_down'] = flDn;
  }

  // --- TILE SPRITES (32x32) ---
  generateTileSprites() {
    const S = this.TILE_SIZE;

    // 1. Grass Top Tile (Overworld)
    {
      const { canvas, ctx } = this.createCanvas(S, S);
      // Base dirt
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, 0, S, S);

      // Dirt texture / pebbles
      ctx.fillStyle = '#6E360E';
      ctx.fillRect(4, 14, 6, 4);
      ctx.fillRect(18, 16, 5, 5);
      ctx.fillRect(8, 24, 7, 4);
      ctx.fillRect(22, 25, 4, 3);

      ctx.fillStyle = '#A0522D';
      ctx.fillRect(12, 12, 4, 3);
      ctx.fillRect(2, 20, 4, 4);
      ctx.fillRect(16, 22, 5, 4);

      // Green grass top (8px)
      ctx.fillStyle = '#38B000';
      ctx.fillRect(0, 0, S, 8);

      // Grass highlight
      ctx.fillStyle = '#70E000';
      ctx.fillRect(0, 0, S, 3);

      // Hanging grass blades fringe
      ctx.fillStyle = '#38B000';
      for (let x = 0; x < S; x += 4) {
        const h = (x % 8 === 0) ? 12 : 10;
        ctx.fillRect(x, 8, 3, h - 8);
      }
      this.sprites['tile_grass'] = canvas;
    }

    // 2. Dirt Block (Solid underground/inner soil)
    {
      const { canvas, ctx } = this.createCanvas(S, S);
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, 0, S, S);

      ctx.fillStyle = '#6E360E';
      ctx.fillRect(2, 4, 8, 6);
      ctx.fillRect(18, 2, 7, 5);
      ctx.fillRect(10, 14, 6, 6);
      ctx.fillRect(22, 16, 7, 7);
      ctx.fillRect(4, 22, 8, 5);

      ctx.fillStyle = '#A0522D';
      ctx.fillRect(14, 6, 4, 4);
      ctx.fillRect(4, 14, 4, 4);
      ctx.fillRect(18, 24, 5, 4);

      // Edge shadow
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, 0, S, 2);
      ctx.fillRect(0, 0, 2, S);
      this.sprites['tile_dirt'] = canvas;
    }

    // 3. Question Block (Animated 4 frames)
    const qBlockFrames = ['#F59E0B', '#FBBF24', '#FCD34D', '#FBBF24'];
    qBlockFrames.forEach((goldColor, idx) => {
      const { canvas, ctx } = this.createCanvas(S, S);

      // Outer border
      ctx.fillStyle = '#78350F';
      ctx.fillRect(0, 0, S, S);

      // Inner face
      ctx.fillStyle = goldColor;
      ctx.fillRect(2, 2, S - 4, S - 4);

      // Highlight bevel
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(2, 2, S - 4, 3);
      ctx.fillRect(2, 2, 3, S - 4);

      // Shadow bevel
      ctx.fillStyle = '#B45309';
      ctx.fillRect(2, S - 5, S - 4, 3);
      ctx.fillRect(S - 5, 2, 3, S - 4);

      // Corner rivets
      ctx.fillStyle = '#78350F';
      ctx.fillRect(4, 4, 2, 2);
      ctx.fillRect(S - 6, 4, 2, 2);
      ctx.fillRect(4, S - 6, 2, 2);
      ctx.fillRect(S - 6, S - 6, 2, 2);

      // Animated Question Mark '?'
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#78350F';
      ctx.shadowBlur = 2;
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', S / 2, S / 2 + 1);
      ctx.shadowBlur = 0;

      this.sprites[`tile_question_${idx}`] = canvas;
    });

    // 4. Used / Empty Block (Dull bronze metallic with rivets)
    {
      const { canvas, ctx } = this.createCanvas(S, S);
      ctx.fillStyle = '#451A03';
      ctx.fillRect(0, 0, S, S);

      ctx.fillStyle = '#92400E';
      ctx.fillRect(2, 2, S - 4, S - 4);

      ctx.fillStyle = '#B45309';
      ctx.fillRect(2, 2, S - 4, 3);
      ctx.fillRect(2, 2, 3, S - 4);

      ctx.fillStyle = '#713F12';
      ctx.fillRect(2, S - 5, S - 4, 3);
      ctx.fillRect(S - 5, 2, 3, S - 4);

      // 4 heavy metal bolts
      ctx.fillStyle = '#361502';
      ctx.fillRect(4, 4, 4, 4);
      ctx.fillRect(S - 8, 4, 4, 4);
      ctx.fillRect(4, S - 8, 4, 4);
      ctx.fillRect(S - 8, S - 8, 4, 4);

      ctx.fillStyle = '#B45309';
      ctx.fillRect(5, 5, 2, 2);
      ctx.fillRect(S - 7, 5, 2, 2);
      ctx.fillRect(5, S - 7, 2, 2);
      ctx.fillRect(S - 7, S - 7, 2, 2);

      this.sprites['tile_used'] = canvas;
    }

    // 5. Brick Block (Terracotta)
    {
      const { canvas, ctx } = this.createCanvas(S, S);
      // Dark mortar
      ctx.fillStyle = '#3F1A08';
      ctx.fillRect(0, 0, S, S);

      // Row 1 (top half)
      ctx.fillStyle = '#B45309';
      ctx.fillRect(1, 1, 14, 13);
      ctx.fillRect(17, 1, 14, 13);

      // Highlights
      ctx.fillStyle = '#D97706';
      ctx.fillRect(1, 1, 14, 2);
      ctx.fillRect(17, 1, 14, 2);

      // Row 2 (bottom half, offset)
      ctx.fillStyle = '#B45309';
      ctx.fillRect(1, 16, 6, 14);
      ctx.fillRect(9, 16, 14, 14);
      ctx.fillRect(25, 16, 6, 14);

      // Highlights
      ctx.fillStyle = '#D97706';
      ctx.fillRect(1, 16, 6, 2);
      ctx.fillRect(9, 16, 14, 2);
      ctx.fillRect(25, 16, 6, 2);

      this.sprites['tile_brick'] = canvas;
    }

    // 6. Underground Stone Bricks (Level 3 theme)
    {
      const { canvas, ctx } = this.createCanvas(S, S);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, S, S);

      // Cobblestone bricks
      ctx.fillStyle = '#334155';
      ctx.fillRect(1, 1, 14, 13);
      ctx.fillRect(17, 1, 14, 13);

      ctx.fillStyle = '#475569';
      ctx.fillRect(1, 1, 14, 2);
      ctx.fillRect(17, 1, 14, 2);

      ctx.fillStyle = '#334155';
      ctx.fillRect(1, 16, 6, 14);
      ctx.fillRect(9, 16, 14, 14);
      ctx.fillRect(25, 16, 6, 14);

      ctx.fillStyle = '#475569';
      ctx.fillRect(1, 16, 6, 2);
      ctx.fillRect(9, 16, 14, 2);
      ctx.fillRect(25, 16, 6, 2);

      // Cyan crystal speckle
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(11, 20, 2, 2);
      ctx.fillRect(22, 6, 2, 2);

      this.sprites['tile_stone'] = canvas;
    }

    // 7. Green Pipe Parts
    // Pipe Top-Left (Lip)
    {
      const { canvas, ctx } = this.createCanvas(S, S);
      ctx.fillStyle = '#0F380F'; // Outer shadow
      ctx.fillRect(0, 0, S, S);

      ctx.fillStyle = '#22C55E'; // Base green
      ctx.fillRect(2, 2, S - 2, S - 4);

      ctx.fillStyle = '#86EFAC'; // White-green gloss highlight
      ctx.fillRect(4, 2, 6, S - 4);

      ctx.fillStyle = '#15803D'; // Dark green shadow
      ctx.fillRect(S - 6, 2, 4, S - 4);

      this.sprites['pipe_top_left'] = canvas;
    }

    // Pipe Top-Right (Lip)
    {
      const { canvas, ctx } = this.createCanvas(S, S);
      ctx.fillStyle = '#0F380F';
      ctx.fillRect(0, 0, S, S);

      ctx.fillStyle = '#22C55E';
      ctx.fillRect(0, 2, S - 2, S - 4);

      ctx.fillStyle = '#86EFAC';
      ctx.fillRect(2, 2, 6, S - 4);

      ctx.fillStyle = '#15803D';
      ctx.fillRect(S - 8, 2, 6, S - 4);

      this.sprites['pipe_top_right'] = canvas;
    }

    // Pipe Body-Left (Shaft)
    {
      const { canvas, ctx } = this.createCanvas(S, S);
      ctx.fillStyle = '#0F380F';
      ctx.fillRect(4, 0, S - 4, S);

      ctx.fillStyle = '#22C55E';
      ctx.fillRect(6, 0, S - 6, S);

      ctx.fillStyle = '#86EFAC';
      ctx.fillRect(8, 0, 6, S);

      ctx.fillStyle = '#15803D';
      ctx.fillRect(S - 4, 0, 4, S);

      this.sprites['pipe_body_left'] = canvas;
    }

    // Pipe Body-Right (Shaft)
    {
      const { canvas, ctx } = this.createCanvas(S, S);
      ctx.fillStyle = '#0F380F';
      ctx.fillRect(0, 0, S - 4, S);

      ctx.fillStyle = '#22C55E';
      ctx.fillRect(0, 0, S - 6, S);

      ctx.fillStyle = '#86EFAC';
      ctx.fillRect(2, 0, 6, S);

      ctx.fillStyle = '#15803D';
      ctx.fillRect(S - 10, 0, 4, S);

      this.sprites['pipe_body_right'] = canvas;
    }

    // 8. Moving Wood Platform Tile
    {
      const { canvas, ctx } = this.createCanvas(S, S / 2); // 32x16
      ctx.fillStyle = '#3F1A08';
      ctx.fillRect(0, 0, S, S / 2);

      ctx.fillStyle = '#C28243';
      ctx.fillRect(1, 1, S - 2, S / 2 - 2);

      ctx.fillStyle = '#F3D299';
      ctx.fillRect(1, 1, S - 2, 2);

      ctx.fillStyle = '#78350F';
      ctx.fillRect(4, 5, 2, 6);
      ctx.fillRect(14, 5, 2, 6);
      ctx.fillRect(24, 5, 2, 6);

      this.sprites['platform_wood'] = canvas;
    }
  }

  // --- ITEM & REWARD SPRITES ---
  generateItemSprites() {
    const P = 2;

    // 1. Spinning Gold Coin (4 frames)
    // Frame 0: Full circular coin
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      ctx.fillStyle = '#B45309';
      ctx.beginPath();
      ctx.arc(12, 12, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(12, 12, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(8, 6, 3, 12);
      this.sprites['coin_0'] = canvas;
    }

    // Frame 1: 3/4 angled coin
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      ctx.fillStyle = '#B45309';
      ctx.beginPath();
      ctx.ellipse(12, 12, 7, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.ellipse(12, 12, 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(9, 6, 2, 12);
      this.sprites['coin_1'] = canvas;
    }

    // Frame 2: Narrow edge-on coin
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      ctx.fillStyle = '#B45309';
      ctx.fillRect(10, 2, 4, 20);

      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(11, 4, 2, 16);
      this.sprites['coin_2'] = canvas;
    }

    // Frame 3: 3/4 angled other side
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      ctx.fillStyle = '#B45309';
      ctx.beginPath();
      ctx.ellipse(12, 12, 7, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.ellipse(12, 12, 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(13, 6, 2, 12);
      this.sprites['coin_3'] = canvas;
    }

    // 2. Extra Life Heart / Mushroom
    {
      const { canvas, ctx } = this.createCanvas(28, 28);
      ctx.fillStyle = '#E11D48';
      // Retro heart
      ctx.beginPath();
      ctx.moveTo(14, 24);
      ctx.bezierCurveTo(4, 16, 2, 8, 8, 4);
      ctx.bezierCurveTo(12, 1, 14, 6, 14, 6);
      ctx.bezierCurveTo(14, 6, 16, 1, 20, 4);
      ctx.bezierCurveTo(26, 8, 24, 16, 14, 24);
      ctx.fill();

      ctx.fillStyle = '#FDA4AF';
      ctx.fillRect(8, 7, 3, 3);
      this.sprites['heart_life'] = canvas;
    }

    // 3. Super Mushroom Power-up (awards 1000 pts / power)
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      const mColors = {
        'R': '#E11D48',
        'W': '#FFFFFF',
        'S': '#FDE047',
        'E': '#1E293B',
        'D': '#9F1239'
      };
      const mMap = [
        "     RRRRRR     ",
        "   RRWWWRRRRR   ",
        "  RRWWWWRRWWWR  ",
        " RRWWWWWRWWWWWR ",
        " RRRRRRRRRRRRRR ",
        " RRRRRRRRRRRRRR ",
        "  DDDDDDDDDDDD  ",
        "    SSSSSSSS    ",
        "   SSEESSEESS   ",
        "   SSEESSEESS   ",
        "   SSSSSSSSSS   ",
        "   SSSSSSSSSS   ",
        "    SSSSSSSS    ",
        "     SSSSSS     ",
        "                ",
        "                "
      ];
      this.drawPixelGrid(ctx, 0, 0, P, mMap, mColors);
      this.sprites['mushroom_power'] = canvas;
    }

    // 4. Brick Debris Fragment
    {
      const { canvas, ctx } = this.createCanvas(12, 12);
      ctx.fillStyle = '#B45309';
      ctx.fillRect(2, 2, 8, 8);
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(2, 2, 8, 2);
      this.sprites['brick_particle'] = canvas;
    }

    // 5. Sparkle Particle
    {
      const { canvas, ctx } = this.createCanvas(16, 16);
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(7, 1, 2, 14);
      ctx.fillRect(1, 7, 14, 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(6, 6, 4, 4);
      this.sprites['sparkle'] = canvas;
    }
  }

  // --- SCENERY & GOAL SPRITES ---
  generateScenerySprites() {
    // 1. Goal Flagpole
    {
      const { canvas, ctx } = this.createCanvas(32, 280);
      // Silver pole
      ctx.fillStyle = '#475569';
      ctx.fillRect(14, 18, 4, 260);
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(15, 18, 2, 260);

      // Gold top sphere
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(16, 12, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(14, 9, 4, 0, Math.PI * 2);
      ctx.fill();

      // Stone base
      ctx.fillStyle = '#334155';
      ctx.fillRect(6, 266, 20, 14);
      ctx.fillStyle = '#64748B';
      ctx.fillRect(8, 268, 16, 4);

      this.sprites['flagpole'] = canvas;
    }

    // 2. Triangular Checkered Flag
    {
      const { canvas, ctx } = this.createCanvas(36, 28);
      // Red flag triangle
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(34, 14);
      ctx.lineTo(0, 28);
      ctx.closePath();
      ctx.fill();

      // White star / emblem
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(12, 14, 5, 0, Math.PI * 2);
      ctx.fill();

      this.sprites['flag'] = canvas;
    }

    // 3. Victory Castle
    {
      const { canvas, ctx } = this.createCanvas(128, 128);
      // Castle body (slate brick)
      ctx.fillStyle = '#334155';
      ctx.fillRect(16, 40, 96, 88);

      // Battlements / crenellations
      for (let x = 16; x < 112; x += 16) {
        ctx.fillRect(x, 24, 10, 16);
      }

      // Tower tops
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(16, 20, 96, 4);

      // Windows
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(32, 54, 12, 20);
      ctx.fillRect(84, 54, 12, 20);

      // Big arched gate
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(64, 96, 18, Math.PI, 0);
      ctx.rect(46, 96, 36, 32);
      ctx.fill();

      // Red banner waving on castle roof
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(64, 4);
      ctx.lineTo(84, 12);
      ctx.lineTo(64, 20);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(63, 2, 2, 22);

      this.sprites['castle'] = canvas;
    }

    // 4. Parallax Background Clouds
    {
      const { canvas, ctx } = this.createCanvas(120, 50);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';

      // Fluffy rounded cloud puffs
      ctx.beginPath();
      ctx.arc(35, 32, 18, 0, Math.PI * 2);
      ctx.arc(60, 22, 22, 0, Math.PI * 2);
      ctx.arc(85, 30, 19, 0, Math.PI * 2);
      ctx.rect(30, 28, 60, 20);
      ctx.fill();

      this.sprites['bg_cloud'] = canvas;
    }

    // 5. Parallax Background Mountain
    {
      const { canvas, ctx } = this.createCanvas(160, 100);
      // Mountain slope
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(80, 10);
      ctx.lineTo(160, 100);
      ctx.lineTo(0, 100);
      ctx.closePath();
      ctx.fill();

      // Mountain light ridge
      ctx.fillStyle = '#64748B';
      ctx.beginPath();
      ctx.moveTo(80, 10);
      ctx.lineTo(80, 100);
      ctx.lineTo(0, 100);
      ctx.closePath();
      ctx.fill();

      // Snowcap
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.moveTo(80, 10);
      ctx.lineTo(105, 38);
      ctx.lineTo(80, 32);
      ctx.lineTo(55, 38);
      ctx.closePath();
      ctx.fill();

      this.sprites['bg_mountain'] = canvas;
    }

    // 6. Parallax Background Tree / Giant Mushroom
    {
      const { canvas, ctx } = this.createCanvas(64, 96);
      // Trunk
      ctx.fillStyle = '#78350F';
      ctx.fillRect(28, 48, 8, 48);

      // Tree foliage / rounded canopy
      ctx.fillStyle = '#15803D';
      ctx.beginPath();
      ctx.arc(32, 34, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22C55E';
      ctx.beginPath();
      ctx.arc(28, 30, 18, 0, Math.PI * 2);
      ctx.fill();

      this.sprites['bg_tree'] = canvas;
    }

    // 7. Checkpoint Pole & Flag
    {
      const { canvas, ctx } = this.createCanvas(24, 64);
      // Pole
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(10, 8, 4, 56);
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(12, 8, 6, 0, Math.PI * 2);
      ctx.fill();
      this.sprites['checkpoint_pole'] = canvas;

      // Green checkpoint flag
      const { canvas: cFlag, ctx: cCtx } = this.createCanvas(24, 20);
      cCtx.fillStyle = '#10B981';
      cCtx.beginPath();
      cCtx.moveTo(0, 0);
      cCtx.lineTo(22, 10);
      cCtx.lineTo(0, 20);
      cCtx.closePath();
      cCtx.fill();
      this.sprites['checkpoint_flag'] = cFlag;
    }
  }

  // Draw any sprite with caching
  draw(ctx, spriteKey, x, y, w, h) {
    const s = this.sprites[spriteKey];
    if (s) {
      if (w && h) {
        ctx.drawImage(s, Math.round(x), Math.round(y), w, h);
      } else {
        ctx.drawImage(s, Math.round(x), Math.round(y));
      }
    }
  }
}

// Global instance
window.spriteManager = new SpriteManager();
