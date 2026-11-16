/**
 * Super Adventure World - UI, Input Handler & Screen Manager
 * Coordinates keyboard controls, responsive mobile touch controls,
 * HUD display, and game screen transitions.
 */

class InputHandler {
  constructor() {
    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;
    this.jumpPressed = false;
    this.jumpJustPressed = false;
    this.runPressed = false;
    this.pauseJustPressed = false;

    this.setupKeyboardListeners();
    this.setupTouchListeners();
  }

  setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      // Initialize audio on first key
      if (window.soundEngine && !window.soundEngine.ctx) {
        window.soundEngine.init();
      }

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.left = true;
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.right = true;
          e.preventDefault();
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          if (!this.jumpPressed) {
            this.jumpJustPressed = true;
          }
          this.jumpPressed = true;
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.down = true;
          e.preventDefault();
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
        case 'KeyJ':
        case 'KeyZ':
          this.runPressed = true;
          break;
        case 'Escape':
        case 'KeyP':
          this.pauseJustPressed = true;
          e.preventDefault();
          break;
        case 'KeyM':
          if (window.soundEngine) {
            const isMuted = window.soundEngine.toggleMute();
            window.uiManager.updateMuteIcon(isMuted);
          }
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.right = false;
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          this.jumpPressed = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.down = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
        case 'KeyJ':
        case 'KeyZ':
          this.runPressed = false;
          break;
      }
    });
  }

  setupTouchListeners() {
    // Mobile touch elements
    const btnLeft = document.getElementById('touch-left');
    const btnRight = document.getElementById('touch-right');
    const btnJump = document.getElementById('touch-jump');
    const btnRun = document.getElementById('touch-run');
    const btnPause = document.getElementById('touch-pause');

    const bindTouch = (el, onStart, onEnd) => {
      if (!el) return;
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (window.soundEngine && !window.soundEngine.ctx) window.soundEngine.init();
        onStart();
      }, { passive: false });

      el.addEventListener('touchend', (e) => {
        e.preventDefault();
        onEnd();
      }, { passive: false });

      el.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        onEnd();
      }, { passive: false });
    };

    bindTouch(btnLeft, () => { this.left = true; }, () => { this.left = false; });
    bindTouch(btnRight, () => { this.right = true; }, () => { this.right = false; });
    bindTouch(btnRun, () => { this.runPressed = true; }, () => { this.runPressed = false; });
    bindTouch(btnJump, () => {
      if (!this.jumpPressed) this.jumpJustPressed = true;
      this.jumpPressed = true;
    }, () => {
      this.jumpPressed = false;
    });

    if (btnPause) {
      btnPause.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.pauseJustPressed = true;
      }, { passive: false });
    }
  }

  resetJustPressed() {
    this.jumpJustPressed = false;
    this.pauseJustPressed = false;
  }
}

class UIManager {
  constructor() {
    // DOM Elements
    this.hudElement = document.getElementById('game-hud');
    this.hudScore = document.getElementById('hud-score');
    this.hudCoins = document.getElementById('hud-coins');
    this.hudWorld = document.getElementById('hud-world');
    this.hudTime = document.getElementById('hud-time');
    this.hudLives = document.getElementById('hud-lives');
    this.btnMute = document.getElementById('btn-mute');

    // Screens
    this.titleScreen = document.getElementById('title-screen');
    this.pauseOverlay = document.getElementById('pause-overlay');
    this.levelCompleteModal = document.getElementById('level-complete-modal');
    this.gameOverModal = document.getElementById('game-over-modal');
    this.victoryModal = document.getElementById('victory-modal');
    this.howToPlayModal = document.getElementById('how-to-play-modal');
    this.levelSelectModal = document.getElementById('level-select-modal');

    // Stats persistence
    this.unlockedLevels = parseInt(localStorage.getItem('saw_unlocked_level') || '1', 10);
    this.highScore = parseInt(localStorage.getItem('saw_high_score') || '0', 10);

    this.setupEventListeners();
    this.updateHighScoreDisplay();
    this.updateMuteIcon(window.soundEngine ? window.soundEngine.isMuted : false);
  }

  setupEventListeners() {
    // Title buttons
    const btnStart = document.getElementById('btn-start-game');
    const btnSelect = document.getElementById('btn-select-level');
    const btnHow = document.getElementById('btn-how-to-play');

    if (btnStart) {
      btnStart.addEventListener('click', () => {
        window.game.startLevel(1);
      });
    }

    if (btnSelect) {
      btnSelect.addEventListener('click', () => {
        this.showLevelSelect();
      });
    }

    if (btnHow) {
      btnHow.addEventListener('click', () => {
        this.howToPlayModal.classList.remove('hidden');
      });
    }

    const btnCloseHow = document.getElementById('btn-close-how');
    if (btnCloseHow) {
      btnCloseHow.addEventListener('click', () => {
        this.howToPlayModal.classList.add('hidden');
      });
    }

    const btnCloseSelect = document.getElementById('btn-close-select');
    if (btnCloseSelect) {
      btnCloseSelect.addEventListener('click', () => {
        this.levelSelectModal.classList.add('hidden');
      });
    }

    // Pause buttons
    const btnResume = document.getElementById('btn-resume');
    const btnRestart = document.getElementById('btn-restart');
    const btnQuit = document.getElementById('btn-quit');

    if (btnResume) {
      btnResume.addEventListener('click', () => window.game.togglePause());
    }
    if (btnRestart) {
      btnRestart.addEventListener('click', () => window.game.restartCurrentLevel());
    }
    if (btnQuit) {
      btnQuit.addEventListener('click', () => window.game.quitToTitle());
    }

    // Level Complete buttons
    const btnNextLevel = document.getElementById('btn-next-level');
    if (btnNextLevel) {
      btnNextLevel.addEventListener('click', () => window.game.advanceNextLevel());
    }

    // Game Over buttons
    const btnTryAgain = document.getElementById('btn-try-again');
    const btnGameOverTitle = document.getElementById('btn-game-over-title');
    if (btnTryAgain) {
      btnTryAgain.addEventListener('click', () => window.game.restartCurrentLevel(true));
    }
    if (btnGameOverTitle) {
      btnGameOverTitle.addEventListener('click', () => window.game.quitToTitle());
    }

    // Victory button
    const btnPlayAgain = document.getElementById('btn-play-again');
    if (btnPlayAgain) {
      btnPlayAgain.addEventListener('click', () => window.game.quitToTitle());
    }

    // Mute button
    if (this.btnMute) {
      this.btnMute.addEventListener('click', () => {
        if (window.soundEngine) {
          const isMuted = window.soundEngine.toggleMute();
          this.updateMuteIcon(isMuted);
        }
      });
    }

    // HUD Pause button
    const btnHudPause = document.getElementById('btn-hud-pause');
    if (btnHudPause) {
      btnHudPause.addEventListener('click', () => window.game.togglePause());
    }
  }

  showLevelSelect() {
    this.unlockedLevels = parseInt(localStorage.getItem('saw_unlocked_level') || '1', 10);
    const container = document.getElementById('level-cards-container');
    container.innerHTML = '';

    const levels = [
      { id: 1, name: '1-1: Green Grassland', desc: 'Sunny plains, basic mushrooms, pipes and brick blocks.', bg: '#38b000' },
      { id: 2, name: '1-2: Mushroom Forest', desc: 'Giant fungi, moving platforms, flying Flappies and Shelly turtles.', bg: '#6b21a8' },
      { id: 3, name: '1-3: Underground Adventure', desc: 'Dark stalactite cavern, stone pillars, deep pits and final victory!', bg: '#1e293b' }
    ];

    levels.forEach(lvl => {
      const isUnlocked = lvl.id <= this.unlockedLevels;
      const card = document.createElement('div');
      card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'}`;
      card.innerHTML = `
        <div class="level-badge" style="background: ${lvl.bg}">${lvl.id}</div>
        <div class="level-info">
          <h3>${lvl.name}</h3>
          <p>${lvl.desc}</p>
        </div>
        <div class="level-status">${isUnlocked ? 'PLAY' : '🔒 LOCKED'}</div>
      `;
      if (isUnlocked) {
        card.addEventListener('click', () => {
          this.levelSelectModal.classList.add('hidden');
          window.game.startLevel(lvl.id);
        });
      }
      container.appendChild(card);
    });

    this.levelSelectModal.classList.remove('hidden');
  }

  unlockLevel(levelNum) {
    if (levelNum > this.unlockedLevels) {
      this.unlockedLevels = levelNum;
      localStorage.setItem('saw_unlocked_level', this.unlockedLevels);
    }
  }

  updateHighScore(score) {
    if (score > this.highScore) {
      this.highScore = score;
      localStorage.setItem('saw_high_score', this.highScore);
      this.updateHighScoreDisplay();
    }
  }

  updateHighScoreDisplay() {
    const el = document.getElementById('high-score-display');
    if (el) {
      el.textContent = this.padScore(this.highScore);
    }
  }

  updateMuteIcon(isMuted) {
    if (this.btnMute) {
      this.btnMute.textContent = isMuted ? '🔇' : '🔊';
    }
  }

  updateHUD(score, coins, worldText, time, lives) {
    if (this.hudScore) this.hudScore.textContent = this.padScore(score);
    if (this.hudCoins) this.hudCoins.textContent = 'x' + String(coins).padStart(2, '0');
    if (this.hudWorld) this.hudWorld.textContent = worldText;
    if (this.hudTime) this.hudTime.textContent = String(Math.max(0, time)).padStart(3, '0');
    if (this.hudLives) this.hudLives.textContent = 'x' + String(lives);
  }

  padScore(s) {
    return String(s).padStart(6, '0');
  }

  showTitle() {
    this.titleScreen.classList.remove('hidden');
    this.hudElement.classList.add('hidden');
    this.pauseOverlay.classList.add('hidden');
    this.levelCompleteModal.classList.add('hidden');
    this.gameOverModal.classList.add('hidden');
    this.victoryModal.classList.add('hidden');
    this.updateHighScoreDisplay();
  }

  showInGameHUD() {
    this.titleScreen.classList.add('hidden');
    this.hudElement.classList.remove('hidden');
    this.pauseOverlay.classList.add('hidden');
    this.levelCompleteModal.classList.add('hidden');
    this.gameOverModal.classList.add('hidden');
    this.victoryModal.classList.add('hidden');
  }

  showPause(show) {
    if (show) {
      this.pauseOverlay.classList.remove('hidden');
    } else {
      this.pauseOverlay.classList.add('hidden');
    }
  }

  showLevelComplete(levelName, timeRemaining, flagBonus, totalScore, isFinalLevel) {
    const titleEl = document.getElementById('lc-title');
    const timeEl = document.getElementById('lc-time-bonus');
    const flagEl = document.getElementById('lc-flag-bonus');
    const totalEl = document.getElementById('lc-total-score');
    const nextBtn = document.getElementById('btn-next-level');

    const timeBonus = timeRemaining * 50;

    if (titleEl) titleEl.textContent = `${levelName} Complete!`;
    if (timeEl) timeEl.textContent = `Time Bonus (${timeRemaining}s x 50): +${timeBonus}`;
    if (flagEl) flagEl.textContent = `Flagpole Bonus: +${flagBonus}`;
    if (totalEl) totalEl.textContent = `Total Score: ${this.padScore(totalScore + timeBonus)}`;

    if (isFinalLevel && nextBtn) {
      nextBtn.textContent = '🏆 VIEW VICTORY!';
    } else if (nextBtn) {
      nextBtn.textContent = 'NEXT LEVEL ▶';
    }

    this.levelCompleteModal.classList.remove('hidden');
  }

  showGameOver(finalScore, levelName) {
    const scoreEl = document.getElementById('go-final-score');
    const lvlEl = document.getElementById('go-level-reached');

    if (scoreEl) scoreEl.textContent = `Final Score: ${this.padScore(finalScore)}`;
    if (lvlEl) lvlEl.textContent = `Fell in: ${levelName}`;

    this.gameOverModal.classList.remove('hidden');
  }

  showVictory(finalScore, coinsCollected) {
    const scoreEl = document.getElementById('vic-final-score');
    const coinsEl = document.getElementById('vic-coins');

    if (scoreEl) scoreEl.textContent = `Final Score: ${this.padScore(finalScore)}`;
    if (coinsEl) coinsEl.textContent = `Coins Collected: ${coinsCollected}`;

    this.victoryModal.classList.remove('hidden');
  }
}

window.InputHandler = InputHandler;
window.UIManager = UIManager;
