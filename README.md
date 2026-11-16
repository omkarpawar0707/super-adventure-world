# 🎮 Super Adventure World - Classic 2D Platformer

A complete, polished, playable 2D platformer game inspired by classic Super Mario Bros, built purely with HTML5, CSS3, JavaScript, HTML Canvas, and the Web Audio API.

Experience authentic retro platforming: responsive controls, momentum physics, question blocks with coins, stomping enemies, kicking turtle shells, moving platforms, checkpoints, chiptune music, and classic flagpole finishes across 3 handcrafted levels!

---

## 🌟 Key Features

- **Classic Retro Platforming**:
  - Smooth acceleration, momentum, friction, and variable-height jumping (short hop or high leap based on hold duration).
  - Coyote time (jump a few frames after walking off ledges) and jump buffering (press jump right before landing).
  - Authentic block bumping: jump into `?` blocks to pop spinning coins, or bump brick blocks to bounce enemies above.
- **Enemies with Mario-Style Mechanics**:
  - **Sporey (Walking Mushroom)**: Patrols platforms; stomping squashes it flat for +100 points!
  - **Shelly (Turtle)**: Stomp once to retract into a shell; kick the shell to send it ricocheting at high speed, plowing through other enemies!
  - **Flappy (Winged Bat/Enemy)**: Soars in sine-wave flight patterns; stomp from above for an extra high bounce.
- **3 Handcrafted Levels with Progressive Difficulty**:
  - **Level 1 (Green Grassland)**: Sunny blue skies, fluffy clouds, green hills, introduction to pipes, coins, question blocks, and mushroom enemies.
  - **Level 2 (Mushroom Forest)**: Twilight canopy, moving wooden platforms across wide chasms, turtle enemies, and flying Flappies.
  - **Level 3 (Underground Adventure)**: Dark cavern with stalactites, glowing crystals, stone pillars, deep pits, and a secret 1-UP block leading to the Grand Golden Castle!
- **Pure Web Audio API Sound & Chiptune Music**:
  - 100% procedurally synthesized 8-bit sound effects (jump, coin ping, stomp squish, block bump, shell kick, death jingle, level clear fanfare).
  - 3 distinct retro chiptune background tracks with Lead Square, Bass Triangle, and Noise drum channels.
  - Zero external sound files needed — works offline with no CORS blocks!
- **Interface & Accessibility**:
  - Retro pixel-art HUD: Score, animated coin counter, world tracker, timer, lives counter, pause button, and mute toggle.
  - Saved progress: Highest score and unlocked levels persist in `localStorage`.
  - Level select menu, pause screen, level complete tally, and game over screens.
  - **Full Mobile & Touch Support**: On-screen responsive D-Pad (Left/Right) and Action buttons (Jump/Run) for smartphones and tablets.

---

## 🕹️ Controls Guide

### Keyboard Controls (Desktop)
| Action | Primary Key | Secondary Key |
| :--- | :--- | :--- |
| **Move Left** | `A` | `← Arrow Left` |
| **Move Right** | `D` | `→ Arrow Right` |
| **Jump** (Tap for hop, Hold for high jump) | `Space` | `W` or `↑ Arrow Up` |
| **Run / Sprint** (Higher max speed) | `Shift` (Left or Right) | `J` or `Z` |
| **Pause Game** | `Escape` | `P` |
| **Toggle Mute** | `M` | HUD Button `🔊` |

### Mobile Touch Controls
- **◀ / ▶**: Virtual directional thumb buttons on the bottom-left.
- **JUMP (A)**: Jump button on the bottom-right (hold for higher leaps).
- **RUN (B)**: Hold to sprint and run faster across gaps.
- **⏸**: Quick pause button on top-right HUD or control bar.

---

## 🚀 How to Run the Game Locally

### Option 1: Direct File Launch (Easiest & Fastest)
Because all graphics and audio are dynamically rendered via HTML5 Canvas and the Web Audio API, **no build step, server, or backend is required**.
1. Open the project folder in Windows File Explorer:
   `c:\Users\hp\OneDrive\Desktop\Mario Type Game`
2. Double-click on `index.html` to open it in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.
3. Click anywhere on the screen or press **Start Game** to begin playing!

---

### Option 2: Running via VS Code (Recommended for Developers)

1. **Open the project in VS Code**:
   - Launch VS Code.
   - Go to **File** > **Open Folder...**
   - Select `c:\Users\hp\OneDrive\Desktop\Mario Type Game`.

2. **Using the "Live Server" Extension**:
   - In VS Code, open the Extensions tab (`Ctrl + Shift + X`).
   - Search for **Live Server** (by Ritwick Dey) and click **Install**.
   - Right-click `index.html` in the file explorer and select **"Open with Live Server"** (or click the **"Go Live"** button in the bottom status bar).
   - The game will open in your default browser at `http://127.0.0.1:5500/index.html` with automatic reload enabled!

3. **Using Python Simple Server (Terminal)**:
   - In VS Code, open the integrated terminal (`Ctrl + ~`).
   - Run:
     ```bash
     python -m http.server 8000
     ```
   - Open your browser to `http://localhost:8000`.

---

## 📁 Project Structure

```text
super-adventure-world/
│
├── index.html          # Main HTML5 entrypoint, HUD & retro overlays
├── style.css           # Arcade styling, pixel font, responsive layout & touch controls
├── game.js             # Main game loop, camera tracking, timer & state coordinator
│
├── js/
│   ├── audio.js        # Web Audio API 8-bit sound effects & 3-track chiptune sequencer
│   ├── sprites.js      # Procedural pixel art generation & offscreen canvas caching
│   ├── physics.js      # Sub-pixel AABB collision, variable jump, coyote time & momentum
│   ├── entities.js     # Player hero, Sporey, Shelly, Flappy, platforms, coins & particles
│   ├── levels.js       # Level 1, 2, 3 tilemaps, obstacle placement & parallax backgrounds
│   └── ui.js           # Input listeners, level selector, HUD updates & modal handlers
│
├── assets/
│   ├── images/         # Game artwork and icons
│   ├── sprites/        # Sprite sheets and art documentation (spritesheet.svg)
│   └── sounds/         # Audio synthesis catalog and music documentation
│
└── README.md           # Documentation, control guide & setup instructions
```

---

## 🎯 Gameplay Tips

1. **Variable Jumping**: Tap the jump key for a short hop to avoid low obstacles; hold the key to reach high platforms and coin blocks.
2. **Turtle Shell Ricochet**: When you stomp Shelly (the turtle), it retracts into a shell. Walk into or kick it to launch it forward — it will wipe out walking enemies along the floor!
3. **Question Blocks**: Hit them from directly underneath. Some contain coins, and secret blocks contain 1-UP life boosts.
4. **Checkpoints**: Touch the green checkpoint pole at the halfway mark in each level to save your respawn point.
5. **Flagpole Contact**: The higher you grab the flagpole at the end of each level, the more bonus points you earn (up to +5,000 pts)!

Enjoy playing **Super Adventure World**! 🍄⭐
