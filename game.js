/**
 * Super Adventure World - Main Game Loop & State Coordinator
 * Coordinates camera, levels, player, entities, timer, audio, and UI.
 */

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    // Viewport native dimensions
    this.width = 800;
    this.height = 448;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Subsystems
    this.input = new InputHandler();
    this.ui = new UIManager();
    this.particleManager = new ParticleManager();

    // Game state
    this.state = 'TITLE'; // 'TITLE', 'PLAYING', 'PAUSED', 'LEVEL_CLEAR', 'GAME_OVER', 'VICTORY'
    this.currentLevelIndex = 1;
    this.currentLevel = null;
    this.player = null;

    // Camera
    this.camera = { x: 0, y: 0 };

    // Level timer
    this.levelTime = 300;
    this.timerInterval = null;

    // Level transition timers
    this.transitionTimer = 0;
    this.levelContactFlagBonus = 0;

    // Active Checkpoint position
    this.activeCheckpoint = null;

    // Start title screen BGM
    window.uiManager = this.ui;
    window.game = this;

    this.initTitle();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  initTitle() {
    this.state = 'TITLE';
    this.ui.showTitle();
    // Play title music when user interacts
    window.soundEngine.playBGM('title');
  }

  startLevel(levelNumber, keepScore = false) {
    this.currentLevelIndex = levelNumber;
    this.state = 'PLAYING';
    this.activeCheckpoint = null;
    this.levelTime = 300;
    this.transitionTimer = 0;

    // Instantiate appropriate level
    if (levelNumber === 1) {
      this.currentLevel = Level.createLevel1();
    } else if (levelNumber === 2) {
      this.currentLevel = Level.createLevel2();
    } else if (levelNumber === 3) {
      this.currentLevel = Level.createLevel3();
    } else {
      this.currentLevel = Level.createLevel1();
    }

    // Preserve score & coins across levels if continuing
    const prevScore = (keepScore && this.player) ? this.player.score : 0;
    const prevCoins = (keepScore && this.player) ? this.player.coins : 0;
    const prevLives = (keepScore && this.player) ? this.player.lives : 3;

    // Create Hero Player
    this.player = new Player(this.currentLevel.spawn.x, this.currentLevel.spawn.y);
    this.player.score = prevScore;
    this.player.coins = prevCoins;
    this.player.lives = prevLives;

    // Reset particles
    this.particleManager.particles = [];

    // Camera reset
    this.camera.x = 0;
    this.camera.y = 0;

    // Start BGM & HUD
    this.ui.showInGameHUD();
    window.soundEngine.playBGM(this.currentLevel.bgmTrack);

    // Start level timer
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.state === 'PLAYING' && !this.player.isDead) {
        this.levelTime--;
        if (this.levelTime <= 0) {
          this.levelTime = 0;
          this.player.die();
        }
      }
    }, 1000);
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.ui.showPause(true);
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.ui.showPause(false);
    }
  }

  restartCurrentLevel(fullReset = false) {
    this.ui.showPause(false);
    this.startLevel(this.currentLevelIndex, !fullReset);
  }

  quitToTitle() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.state = 'TITLE';
    this.ui.showTitle();
    window.soundEngine.playBGM('title');
  }

  advanceNextLevel() {
    if (this.currentLevelIndex < 3) {
      const nextLvl = this.currentLevelIndex + 1;
      this.ui.unlockLevel(nextLvl);
      this.startLevel(nextLvl, true);
    } else {
      // Reached Victory!
      this.state = 'VICTORY';
      window.soundEngine.stopBGM();
      this.ui.showVictory(this.player.score, this.player.coins);
      this.ui.updateHighScore(this.player.score);
    }
  }

  handlePlayerDeath() {
    if (this.player.lives > 0) {
      // Respawn at checkpoint or level start after death jump finishes
      if (this.player.deathTimer > 75) {
        const respawnX = this.activeCheckpoint ? this.activeCheckpoint.x : this.currentLevel.spawn.x;
        const respawnY = this.activeCheckpoint ? this.activeCheckpoint.y : this.currentLevel.spawn.y;
        this.player.respawn(respawnX, respawnY);
        this.camera.x = Math.max(0, respawnX - 150);
        window.soundEngine.playBGM(this.currentLevel.bgmTrack);
      }
    } else {
      // Game Over
      if (this.player.deathTimer > 75 && this.state !== 'GAME_OVER') {
        this.state = 'GAME_OVER';
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.ui.showGameOver(this.player.score, this.currentLevel.name);
        this.ui.updateHighScore(this.player.score);
      }
    }
  }

  updateCamera() {
    if (!this.player || !this.currentLevel) return;

    // Follow player with forward lookahead
    const targetX = this.player.x - this.width * 0.38;
    this.camera.x += (targetX - this.camera.x) * 0.12;

    // Clamp camera within level bounds
    const maxCamX = Math.max(0, this.currentLevel.pixelWidth - this.width);
    this.camera.x = Math.max(0, Math.min(maxCamX, this.camera.x));
    this.camera.y = 0; // Fixed horizontal platformer camera
  }

  update() {
    // Check Pause toggle
    if (this.input.pauseJustPressed) {
      this.togglePause();
    }

    if (this.state === 'PLAYING') {
      // Update Level & World
      this.currentLevel.update(this.particleManager);

      // Save checkpoint if activated
      if (this.currentLevel.checkpoint && this.currentLevel.checkpoint.isActivated) {
        this.activeCheckpoint = {
          x: this.currentLevel.checkpoint.x,
          y: this.currentLevel.checkpoint.y
        };
      }

      // Update Player
      this.player.update(
        this.input,
        this.currentLevel,
        this.currentLevel.platforms,
        this.currentLevel.enemies,
        this.currentLevel.coins,
        this.currentLevel.flagpole,
        this.currentLevel.checkpoint,
        this.particleManager
      );

      // Handle Death
      if (this.player.isDead) {
        this.handlePlayerDeath();
      }

      // Handle Flagpole completion
      if (this.currentLevel.flagpole && this.currentLevel.flagpole.isReached) {
        this.transitionTimer++;
        if (this.transitionTimer > 150 && this.state !== 'LEVEL_CLEAR') {
          this.state = 'LEVEL_CLEAR';
          if (this.timerInterval) clearInterval(this.timerInterval);

          const timeBonus = this.levelTime * 50;
          this.player.score += timeBonus;
          this.ui.updateHighScore(this.player.score);

          const isFinal = this.currentLevelIndex === 3;
          if (!isFinal) {
            this.ui.unlockLevel(this.currentLevelIndex + 1);
          }

          this.ui.showLevelComplete(
            this.currentLevel.name,
            this.levelTime,
            1000,
            this.player.score,
            isFinal
          );
        }
      }

      // Update Camera & Particles
      this.updateCamera();
      this.particleManager.update();

      // Update In-Game HUD
      this.ui.updateHUD(
        this.player.score,
        this.player.coins,
        `1-${this.currentLevelIndex}`,
        this.levelTime,
        this.player.lives
      );
    } else if (this.state === 'LEVEL_CLEAR' || this.state === 'VICTORY') {
      this.particleManager.update();
    }

    this.input.resetJustPressed();
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.state === 'PLAYING' || this.state === 'PAUSED' || this.state === 'LEVEL_CLEAR') {
      // 1. Draw Parallax Background
      this.currentLevel.drawBackground(this.ctx, this.camera, this.width, this.height);

      // 2. Draw Solid & Interactive Tiles
      this.currentLevel.drawTiles(this.ctx, this.camera, this.width, this.height);

      // 3. Draw Entities (Enemies, Platforms, Coins, Goal)
      this.currentLevel.drawEntities(this.ctx, this.camera);

      // 4. Draw Player
      if (this.player) {
        this.player.draw(this.ctx, this.camera);
      }

      // 5. Draw Particles & Popups
      this.particleManager.draw(this.ctx, this.camera);
    } else if (this.state === 'TITLE') {
      // Draw animated title background demo
      const bgGrad = this.ctx.createLinearGradient(0, 0, 0, this.height);
      bgGrad.addColorStop(0, '#38BDF8');
      bgGrad.addColorStop(1, '#BAE6FD');
      this.ctx.fillStyle = bgGrad;
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Ground
      this.ctx.fillStyle = '#38B000';
      this.ctx.fillRect(0, this.height - 48, this.width, 16);
      this.ctx.fillStyle = '#8B4513';
      this.ctx.fillRect(0, this.height - 32, this.width, 32);

      // Animated demo characters
      const t = Date.now() / 150;
      const pipX = (Date.now() / 20) % (this.width + 100) - 50;
      const walkFrame = (Math.floor(t) % 3) + 1;
      window.spriteManager.draw(this.ctx, `hero_run${walkFrame}_right`, pipX, this.height - 78, 32, 32);

      // Patrolling enemy
      const sporeyX = ((Date.now() / 25) + 200) % (this.width + 100) - 50;
      const eFrame = Math.floor(t) % 2 === 0 ? 'sporey_walk1' : 'sporey_walk2';
      window.spriteManager.draw(this.ctx, eFrame, sporeyX, this.height - 74, 30, 30);

      // Clouds
      window.spriteManager.draw(this.ctx, 'bg_cloud', 80, 50);
      window.spriteManager.draw(this.ctx, 'bg_cloud', 420, 80);
      window.spriteManager.draw(this.ctx, 'bg_cloud', 650, 40);

      // Question block demo
      const qf = Math.floor(Date.now() / 200) % 4;
      window.spriteManager.draw(this.ctx, `tile_question_${qf}`, 380, 220);
      window.spriteManager.draw(this.ctx, 'tile_brick', 348, 220);
      window.spriteManager.draw(this.ctx, 'tile_brick', 412, 220);
    }
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(this.loop);
  }
}

// Instantiate game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
