/**
 * Super Adventure World - Entities & Game Objects
 * Includes Player Hero, Mushroom Enemy (Sporey), Turtle Enemy (Shelly),
 * Flying Enemy (Flappy), Coins, Moving Platforms, Flagpole, and Particles.
 */

// --- PARTICLE SYSTEM ---
class Particle {
  constructor(x, y, vx, vy, life, type, text = '', color = '#FFD700') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.type = type; // 'sparkle', 'brick', 'dust', 'text', 'firework'
    this.text = text;
    this.color = color;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.3;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;

    if (this.type === 'brick' || this.type === 'firework') {
      this.vy += 0.35; // gravity
      this.rotation += this.rotSpeed;
    } else if (this.type === 'dust') {
      this.vx *= 0.92;
      this.vy *= 0.92;
    } else if (this.type === 'text') {
      this.vy *= 0.95;
    }
  }

  draw(ctx, camera) {
    const rx = Math.round(this.x - camera.x);
    const ry = Math.round(this.y - camera.y);
    const alpha = Math.max(0, this.life / this.maxLife);

    ctx.save();
    ctx.globalAlpha = alpha;

    if (this.type === 'sparkle') {
      window.spriteManager.draw(ctx, 'sparkle', rx - 8, ry - 8, 16, 16);
    } else if (this.type === 'brick') {
      ctx.translate(rx, ry);
      ctx.rotate(this.rotation);
      window.spriteManager.draw(ctx, 'brick_particle', -6, -6, 12, 12);
    } else if (this.type === 'dust') {
      ctx.fillStyle = 'rgba(230, 230, 230, ' + alpha * 0.8 + ')';
      ctx.beginPath();
      ctx.arc(rx, ry, (1 - alpha) * 8 + 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'firework') {
      ctx.fillStyle = this.color;
      ctx.fillRect(rx - 3, ry - 3, 6, 6);
    } else if (this.type === 'text') {
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.fillStyle = '#000000';
      ctx.fillText(this.text, rx + 1, ry + 1);
      ctx.fillStyle = this.color;
      ctx.fillText(this.text, rx, ry);
    }

    ctx.restore();
  }
}

class ParticleManager {
  constructor() {
    this.particles = [];
  }

  add(p) {
    this.particles.push(p);
  }

  addText(x, y, text, color = '#FFFFFF') {
    this.particles.push(new Particle(x, y, 0, -1.5, 45, 'text', text, color));
  }

  addBrickShatter(x, y) {
    // 4 spinning fragments flying in quadrants
    this.particles.push(new Particle(x, y, -2.5, -6.5, 50, 'brick'));
    this.particles.push(new Particle(x + 16, y, 2.5, -6.5, 50, 'brick'));
    this.particles.push(new Particle(x, y + 16, -1.8, -4.0, 50, 'brick'));
    this.particles.push(new Particle(x + 16, y + 16, 1.8, -4.0, 50, 'brick'));
  }

  addDust(x, y) {
    for (let i = 0; i < 3; i++) {
      this.particles.push(new Particle(x + (Math.random() - 0.5) * 8, y, (Math.random() - 0.5) * 1.5, -0.4, 20, 'dust'));
    }
  }

  addSparkles(x, y) {
    for (let i = 0; i < 4; i++) {
      this.particles.push(new Particle(x + (Math.random() - 0.5) * 16, y + (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 25, 'sparkle'));
    }
  }

  addFireworks(x, y) {
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const speed = Math.random() * 4 + 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed - 2, 45, 'firework', '', color));
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx, camera) {
    this.particles.forEach(p => p.draw(ctx, camera));
  }
}

// --- POPPING COIN FROM QUESTION BLOCK ---
class BlockCoin {
  constructor(x, y) {
    this.x = x + 4;
    this.y = y - 4;
    this.startY = y;
    this.vy = -6.5;
    this.gravity = 0.45;
    this.animFrame = 0;
    this.isDone = false;
  }

  update(particleManager) {
    this.y += this.vy;
    this.vy += this.gravity;
    this.animFrame++;

    if (this.vy > 0 && this.y >= this.startY - 6) {
      this.isDone = true;
      particleManager.addSparkles(this.x + 8, this.y + 8);
    }
  }

  draw(ctx, camera) {
    const frame = Math.floor(this.animFrame / 4) % 4;
    window.spriteManager.draw(ctx, `coin_${frame}`, this.x - camera.x, this.y - camera.y, 24, 24);
  }
}

// --- COLLECTIBLE COIN IN LEVEL ---
class Coin {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 24;
    this.height = 24;
    this.animFrame = Math.floor(Math.random() * 16);
    this.isCollected = false;
  }

  update() {
    this.animFrame++;
  }

  draw(ctx, camera) {
    if (this.isCollected) return;
    const frame = Math.floor(this.animFrame / 6) % 4;
    window.spriteManager.draw(ctx, `coin_${frame}`, this.x - camera.x, this.y - camera.y, 24, 24);
  }
}

// --- MOVING PLATFORM ---
class MovingPlatform {
  constructor(x1, y1, x2, y2, width = 64, speed = 1.2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.x = x1;
    this.y = y1;
    this.width = width;
    this.height = 16;
    this.speed = speed;
    this.progress = 0;
    this.direction = 1;
    this.vx = 0;
    this.vy = 0;
  }

  update() {
    const dx = this.x2 - this.x1;
    const dy = this.y2 - this.y1;
    const dist = Math.hypot(dx, dy);

    if (dist > 0) {
      this.progress += (this.speed / dist) * this.direction;

      if (this.progress >= 1) {
        this.progress = 1;
        this.direction = -1;
      } else if (this.progress <= 0) {
        this.progress = 0;
        this.direction = 1;
      }

      const nextX = this.x1 + dx * this.progress;
      const nextY = this.y1 + dy * this.progress;

      this.vx = nextX - this.x;
      this.vy = nextY - this.y;

      this.x = nextX;
      this.y = nextY;
    }
  }

  draw(ctx, camera) {
    const rx = Math.round(this.x - camera.x);
    const ry = Math.round(this.y - camera.y);

    // Draw wood platform segments
    for (let ox = 0; ox < this.width; ox += 32) {
      const segWidth = Math.min(32, this.width - ox);
      window.spriteManager.draw(ctx, 'platform_wood', rx + ox, ry, segWidth, 16);
    }
  }
}

// --- CHECKPOINT ---
class Checkpoint {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 24;
    this.height = 64;
    this.isActivated = false;
    this.flagY = 44; // Bottom of pole when inactive
  }

  activate() {
    if (!this.isActivated) {
      this.isActivated = true;
      window.soundEngine.playCheckpoint();
      return true;
    }
    return false;
  }

  update() {
    if (this.isActivated && this.flagY > 8) {
      this.flagY -= 1.5; // Raise flag smoothly
    }
  }

  draw(ctx, camera) {
    const rx = Math.round(this.x - camera.x);
    const ry = Math.round(this.y - camera.y);

    // Draw pole
    window.spriteManager.draw(ctx, 'checkpoint_pole', rx, ry, 24, 64);

    // Draw flag
    window.spriteManager.draw(ctx, 'checkpoint_flag', rx + 10, ry + this.flagY, 20, 16);
  }
}

// --- FLAGPOLE & GOAL CASTLE ---
class Flagpole {
  constructor(x, y, poleHeight = 280) {
    this.x = x;
    this.y = y; // Top of base
    this.width = 32;
    this.height = poleHeight;
    this.flagY = 24; // Starts near top
    this.isReached = false;
    this.isLowering = false;
  }

  triggerReach(contactY) {
    this.isReached = true;
    this.isLowering = true;
    // Calculate points based on contact height (higher = more points)
    const ratio = Math.max(0, Math.min(1, 1 - (contactY - this.y) / this.height));
    let bonus = 400;
    if (ratio > 0.85) bonus = 5000;
    else if (ratio > 0.65) bonus = 2000;
    else if (ratio > 0.45) bonus = 1000;
    else if (ratio > 0.25) bonus = 800;
    return bonus;
  }

  update() {
    if (this.isLowering && this.flagY < this.height - 38) {
      this.flagY += 3.2; // Slide flag down
    }
  }

  draw(ctx, camera) {
    const rx = Math.round(this.x - camera.x);
    const ry = Math.round(this.y - camera.y);

    // Flagpole
    window.spriteManager.draw(ctx, 'flagpole', rx, ry, 32, this.height);

    // Flag
    window.spriteManager.draw(ctx, 'flag', rx - 26, ry + this.flagY, 32, 24);
  }
}

// --- BASE ENEMY ---
class Enemy {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.vx = -1;
    this.vy = 0;
    this.isAlive = true;
    this.isSquashed = false;
    this.squashTimer = 0;
    this.isGrounded = false;
    this.animTimer = 0;
  }

  onWallHit(side) {
    this.vx = -this.vx;
  }
}

// 1. Walking Mushroom Enemy ("Sporey" - Goomba style)
class MushroomEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 28, 28);
    this.vx = -0.9;
    this.scoreValue = 100;
  }

  update(level, platforms) {
    if (this.isSquashed) {
      this.squashTimer++;
      if (this.squashTimer > 25) {
        this.isAlive = false;
      }
      return;
    }

    // Apply gravity
    this.vy = Math.min(Physics.TERMINAL_VELOCITY, this.vy + Physics.GRAVITY);

    // Collide with tiles
    Physics.resolveTileCollisions(this, level);
    Physics.resolvePlatformCollisions(this, platforms);

    this.animTimer++;
  }

  stomp(particleManager) {
    this.isSquashed = true;
    this.vx = 0;
    this.vy = 0;
    window.soundEngine.playStomp();
    particleManager.addText(this.x + 8, this.y, `+${this.scoreValue}`, '#FFD700');
    return this.scoreValue;
  }

  draw(ctx, camera) {
    if (!this.isAlive) return;
    const rx = Math.round(this.x - camera.x);
    const ry = Math.round(this.y - camera.y);

    if (this.isSquashed) {
      window.spriteManager.draw(ctx, 'sporey_squashed', rx, ry + 8, 30, 20);
    } else {
      const frame = Math.floor(this.animTimer / 12) % 2 === 0 ? 'sporey_walk1' : 'sporey_walk2';
      window.spriteManager.draw(ctx, frame, rx, ry, 30, 30);
    }
  }
}

// 2. Turtle Enemy ("Shelly" - Koopa style with kickable shell)
class TurtleEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 28, 30);
    this.vx = -1.1;
    this.state = 'walk'; // 'walk', 'shell', 'sliding'
    this.scoreValue = 200;
    this.shellSlideSpeed = 6.2;
  }

  update(level, platforms, otherEnemies, particleManager) {
    if (this.state === 'walk') {
      this.vy = Math.min(Physics.TERMINAL_VELOCITY, this.vy + Physics.GRAVITY);
      Physics.resolveTileCollisions(this, level);
      Physics.resolvePlatformCollisions(this, platforms);
      this.animTimer++;
    } else if (this.state === 'shell') {
      this.vx = 0;
      this.vy = Math.min(Physics.TERMINAL_VELOCITY, this.vy + Physics.GRAVITY);
      Physics.resolveTileCollisions(this, level);
      Physics.resolvePlatformCollisions(this, platforms);
    } else if (this.state === 'sliding') {
      this.vy = Math.min(Physics.TERMINAL_VELOCITY, this.vy + Physics.GRAVITY);
      Physics.resolveTileCollisions(this, level);
      Physics.resolvePlatformCollisions(this, platforms);

      // Defeat any walking enemies Shelly crashes into while sliding!
      if (otherEnemies) {
        otherEnemies.forEach(e => {
          if (e !== this && e.isAlive && !e.isSquashed && Physics.checkAABB(this, e)) {
            e.isAlive = false;
            window.soundEngine.playKick();
            particleManager.addBrickShatter(e.x, e.y);
            particleManager.addText(e.x, e.y, '+400', '#38BDF8');
          }
        });
      }
    }
  }

  onWallHit(side) {
    this.vx = -this.vx;
    if (this.state === 'sliding') {
      window.soundEngine.playBump();
    }
  }

  stomp(particleManager, playerVx) {
    if (this.state === 'walk') {
      this.state = 'shell';
      this.vx = 0;
      this.height = 24;
      this.y += 6;
      window.soundEngine.playStomp();
      particleManager.addText(this.x, this.y, `+${this.scoreValue}`, '#FFD700');
      return this.scoreValue;
    } else if (this.state === 'shell') {
      // Kick the shell!
      this.state = 'sliding';
      this.vx = playerVx >= 0 ? this.shellSlideSpeed : -this.shellSlideSpeed;
      window.soundEngine.playKick();
      particleManager.addDust(this.x + 14, this.y + 20);
      return 100;
    } else if (this.state === 'sliding') {
      // Stop sliding shell
      this.state = 'shell';
      this.vx = 0;
      window.soundEngine.playStomp();
      return 100;
    }
    return 0;
  }

  kick(direction, particleManager) {
    this.state = 'sliding';
    this.vx = direction * this.shellSlideSpeed;
    window.soundEngine.playKick();
    particleManager.addDust(this.x + 14, this.y + 20);
  }

  draw(ctx, camera) {
    if (!this.isAlive) return;
    const rx = Math.round(this.x - camera.x);
    const ry = Math.round(this.y - camera.y);

    if (this.state === 'walk') {
      const dir = this.vx >= 0 ? 'right' : 'left';
      const frameNum = Math.floor(this.animTimer / 10) % 2 === 0 ? 1 : 2;
      window.spriteManager.draw(ctx, `shelly_walk${frameNum}_${dir}`, rx, ry, 30, 32);
    } else {
      window.spriteManager.draw(ctx, 'shelly_shell', rx, ry, 30, 26);
    }
  }
}

// 3. Flying Enemy ("Flappy" - Winged bat / creature)
class FlyingEnemy extends Enemy {
  constructor(x, y, range = 48, speed = 0.04) {
    super(x, y, 28, 28);
    this.baseY = y;
    this.range = range;
    this.flySpeed = speed;
    this.flyTime = Math.random() * 10;
    this.scoreValue = 250;
    this.vx = -0.8;
  }

  update(level) {
    if (!this.isAlive) return;

    this.flyTime += this.flySpeed;
    this.y = this.baseY + Math.sin(this.flyTime) * this.range;
    this.x += this.vx;

    // Reverse horizontal patrol boundaries
    if (this.x < 0) {
      this.x = 0;
      this.vx = Math.abs(this.vx);
    }
    this.animTimer++;
  }

  stomp(particleManager) {
    this.isAlive = false;
    window.soundEngine.playStomp();
    particleManager.addSparkles(this.x + 14, this.y + 14);
    particleManager.addText(this.x + 8, this.y, `+${this.scoreValue}`, '#FFD700');
    return this.scoreValue;
  }

  draw(ctx, camera) {
    if (!this.isAlive) return;
    const rx = Math.round(this.x - camera.x);
    const ry = Math.round(this.y - camera.y);

    const frame = Math.floor(this.animTimer / 8) % 2 === 0 ? 'flappy_up' : 'flappy_down';
    window.spriteManager.draw(ctx, frame, rx, ry, 30, 30);
  }
}

// --- PLAYER HERO ("Pip") ---
class Player {
  constructor(x, y) {
    this.spawnX = x;
    this.spawnY = y;
    this.x = x;
    this.y = y;
    this.width = 24;
    this.height = 30;

    this.vx = 0;
    this.vy = 0;
    this.direction = 1; // 1 = right, -1 = left
    this.isGrounded = false;
    this.currentPlatform = null;

    // Movement & Feel
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.isSkidding = false;
    this.invincibleTimer = 0;

    // Stats
    this.lives = 3;
    this.score = 0;
    this.coins = 0;

    // Animation & State
    this.state = 'idle'; // 'idle', 'walk', 'run', 'jump', 'fall', 'skid', 'dead', 'flag_slide', 'victory'
    this.animTimer = 0;
    this.isDead = false;
    this.deathTimer = 0;
  }

  respawn(checkpointX, checkpointY) {
    this.x = checkpointX !== undefined ? checkpointX : this.spawnX;
    this.y = checkpointY !== undefined ? checkpointY : this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.isGrounded = false;
    this.isDead = false;
    this.deathTimer = 0;
    this.state = 'idle';
    this.invincibleTimer = 60; // 1 second invulnerability on respawn
  }

  jump(isHighJump = false) {
    this.vy = isHighJump ? Physics.ENEMY_HIGH_BOUNCE_IMPULSE : Physics.JUMP_IMPULSE;
    this.isGrounded = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    window.soundEngine.playJump();
  }

  bounce(isHigh = false) {
    this.vy = isHigh ? Physics.ENEMY_HIGH_BOUNCE_IMPULSE : Physics.ENEMY_BOUNCE_IMPULSE;
    this.isGrounded = false;
    this.coyoteTimer = 0;
  }

  takeDamage() {
    if (this.invincibleTimer > 0 || this.isDead) return false;

    this.lives--;
    window.soundEngine.playHurt();

    if (this.lives <= 0) {
      this.die();
      return true;
    } else {
      // Temporary hit knockback & invulnerability
      this.invincibleTimer = 90; // 1.5 seconds flash
      this.vy = -5.0;
      return false;
    }
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.state = 'dead';
    this.vx = 0;
    this.vy = -8.5; // Upward death leap
    this.deathTimer = 0;
    window.soundEngine.playDeath();
  }

  addCoin(particleManager, blockX, blockY) {
    this.coins++;
    this.score += 200;
    window.soundEngine.playCoin();

    if (particleManager && blockX !== undefined && blockY !== undefined) {
      particleManager.addText(blockX + 8, blockY - 12, '+200', '#FBBF24');
    }

    // Extra life every 50 coins!
    if (this.coins % 50 === 0) {
      this.lives++;
      window.soundEngine.playPowerup();
      if (particleManager) {
        particleManager.addText(this.x, this.y - 20, '1-UP!', '#34D399');
      }
    }
  }

  update(input, level, platforms, enemies, coins, flagpole, checkpoint, particleManager) {
    // 1. DEATH SEQUENCE UPDATE
    if (this.isDead) {
      this.deathTimer++;
      this.y += this.vy;
      this.vy += Physics.GRAVITY;
      return;
    }

    // 2. FLAGPOLE SLIDE & VICTORY SEQUENCE
    if (this.state === 'flag_slide') {
      if (this.y < flagpole.y + flagpole.height - this.height - 12) {
        this.y += 3.2; // Slide down pole
      } else {
        // Reached bottom of pole: step off and walk to castle
        this.state = 'victory';
        this.vx = 2.0;
        this.direction = 1;
      }
      return;
    }

    if (this.state === 'victory') {
      this.vy = Math.min(Physics.TERMINAL_VELOCITY, this.vy + Physics.GRAVITY);
      this.x += this.vx;
      Physics.resolveTileCollisions(this, level);
      this.animTimer++;
      return;
    }

    // 3. INVULNERABILITY COUNTDOWN
    if (this.invincibleTimer > 0) {
      this.invincibleTimer--;
    }

    // 4. COYOTE TIME & JUMP BUFFERING
    if (this.isGrounded) {
      this.coyoteTimer = 7;
    } else if (this.coyoteTimer > 0) {
      this.coyoteTimer--;
    }

    if (input.jumpJustPressed) {
      this.jumpBufferTimer = 7;
    } else if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer--;
    }

    // Check jump execution
    if (this.jumpBufferTimer > 0 && (this.isGrounded || this.coyoteTimer > 0)) {
      this.jump();
      particleManager.addDust(this.x + 12, this.y + this.height);
    }

    // Variable jump height cutoff when releasing jump early
    if (!input.jumpPressed && this.vy < Physics.JUMP_CUTOFF) {
      this.vy = Physics.JUMP_CUTOFF;
    }

    // 5. HORIZONTAL ACCELERATION & MOVEMENT
    const isRunning = input.runPressed;
    const maxSpeed = isRunning ? Physics.MAX_SPEED_RUN : Physics.MAX_SPEED_WALK;
    const accel = this.isGrounded
      ? (isRunning ? Physics.ACCEL_RUN : Physics.ACCEL_WALK)
      : Physics.ACCEL_WALK * 0.75;

    this.isSkidding = false;

    if (input.left) {
      this.direction = -1;
      if (this.vx > 1.2 && this.isGrounded) {
        // Skidding to left while moving right
        this.vx *= Physics.SKID_DECEL;
        this.isSkidding = true;
        particleManager.addDust(this.x + 16, this.y + this.height);
      } else {
        this.vx = Math.max(-maxSpeed, this.vx - accel);
      }
    } else if (input.right) {
      this.direction = 1;
      if (this.vx < -1.2 && this.isGrounded) {
        // Skidding to right while moving left
        this.vx *= Physics.SKID_DECEL;
        this.isSkidding = true;
        particleManager.addDust(this.x + 8, this.y + this.height);
      } else {
        this.vx = Math.min(maxSpeed, this.vx + accel);
      }
    } else {
      // Natural deceleration / friction
      const friction = this.isGrounded ? Physics.FRICTION_GROUND : Physics.FRICTION_AIR;
      this.vx *= friction;
      if (Math.abs(this.vx) < 0.1) this.vx = 0;
    }

    // 6. VERTICAL ACCELERATION (GRAVITY)
    this.vy = Math.min(Physics.TERMINAL_VELOCITY, this.vy + Physics.GRAVITY);

    // 7. LEVEL & PLATFORM COLLISIONS
    Physics.resolveTileCollisions(this, level, (tx, ty, tile) => {
      // Underside block hit handler
      if (tile.type === 'question') {
        level.bumpBlock(tx, ty, (bx, by) => {
          this.addCoin(particleManager, bx, by);
        });
      } else if (tile.type === 'brick') {
        level.bumpBlock(tx, ty, null, true); // brick bump or shatter
      }
    });

    Physics.resolvePlatformCollisions(this, platforms);

    // Pit death check
    if (this.y > level.pixelHeight + 40) {
      this.die();
      return;
    }

    // 8. COIN COLLECTIBLES
    if (coins) {
      coins.forEach(c => {
        if (!c.isCollected && Physics.checkAABB(this, c)) {
          c.isCollected = true;
          this.addCoin(particleManager, c.x, c.y);
          particleManager.addSparkles(c.x + 12, c.y + 12);
        }
      });
    }

    // 9. CHECKPOINT INTERACTION
    if (checkpoint && !checkpoint.isActivated && Physics.checkAABB(this, checkpoint)) {
      if (checkpoint.activate()) {
        particleManager.addText(checkpoint.x, checkpoint.y - 16, 'CHECKPOINT!', '#10B981');
      }
    }

    // 10. FLAGPOLE REACH
    if (flagpole && !flagpole.isReached && Physics.checkAABB(this, flagpole)) {
      const bonus = flagpole.triggerReach(this.y);
      this.score += bonus;
      window.soundEngine.playFlagpole();
      window.soundEngine.playLevelClear();
      particleManager.addFireworks(flagpole.x + 16, flagpole.y + 60);
      particleManager.addText(flagpole.x + 20, this.y, `+${bonus}!`, '#F59E0B');
      this.state = 'flag_slide';
      this.x = flagpole.x - 8;
      this.vx = 0;
      this.vy = 0;
      return;
    }

    // 11. ENEMY INTERACTIONS & STOMPING
    if (enemies) {
      enemies.forEach(e => {
        if (!e.isAlive || e.isSquashed) return;

        if (Physics.checkAABB(this, e)) {
          // Check if stomping from above
          const stomping = this.vy > 0 && (this.y + this.height - this.vy <= e.y + 14);

          if (stomping) {
            const highBounce = input.jumpPressed;
            const pts = e.stomp(particleManager, this.vx);
            this.score += pts;
            this.bounce(highBounce);
          } else {
            // Shelly stationary shell kick
            if (e instanceof TurtleEnemy && e.state === 'shell') {
              const kickDir = this.x < e.x ? 1 : -1;
              e.kick(kickDir, particleManager);
              this.score += 100;
            } else {
              // Damage player
              this.takeDamage();
            }
          }
        }
      });
    }

    // 12. UPDATE ANIMATION STATE
    this.animTimer++;
    if (!this.isGrounded) {
      this.state = this.vy < 0 ? 'jump' : 'fall';
    } else if (this.isSkidding) {
      this.state = 'skid';
    } else if (Math.abs(this.vx) > 0.3) {
      this.state = Math.abs(this.vx) > Physics.MAX_SPEED_WALK * 0.9 ? 'run' : 'walk';
    } else {
      this.state = 'idle';
    }
  }

  draw(ctx, camera) {
    if (this.isDead) {
      window.spriteManager.draw(ctx, 'hero_die_right', this.x - camera.x, this.y - camera.y, 32, 32);
      return;
    }

    // Flashing when invincible
    if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 4) % 2 === 0) {
      return;
    }

    const rx = Math.round(this.x - camera.x);
    const ry = Math.round(this.y - camera.y);
    const dir = this.direction >= 0 ? 'right' : 'left';

    let spriteKey = `hero_idle_${dir}`;

    if (this.state === 'jump' || this.state === 'fall' || this.state === 'flag_slide') {
      spriteKey = `hero_jump_${dir}`;
    } else if (this.state === 'skid') {
      spriteKey = `hero_skid_${dir}`;
    } else if (this.state === 'walk' || this.state === 'victory') {
      const frame = (Math.floor(this.animTimer / 8) % 3) + 1;
      spriteKey = `hero_run${frame}_${dir}`;
    } else if (this.state === 'run') {
      const frame = (Math.floor(this.animTimer / 5) % 3) + 1;
      spriteKey = `hero_run${frame}_${dir}`;
    }

    window.spriteManager.draw(ctx, spriteKey, rx - 4, ry - 2, 32, 32);
  }
}

window.Player = Player;
window.MushroomEnemy = MushroomEnemy;
window.TurtleEnemy = TurtleEnemy;
window.FlyingEnemy = FlyingEnemy;
window.Coin = Coin;
window.BlockCoin = BlockCoin;
window.MovingPlatform = MovingPlatform;
window.Checkpoint = Checkpoint;
window.Flagpole = Flagpole;
window.ParticleManager = ParticleManager;
