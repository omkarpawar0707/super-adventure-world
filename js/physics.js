/**
 * Super Adventure World - Platformer Physics Engine & Collision Detection
 * Implements smooth momentum, variable jumping, coyote time, jump buffering,
 * and sub-pixel AABB tile / entity collision resolution.
 */

class Physics {
  static GRAVITY = 0.44;
  static TERMINAL_VELOCITY = 9.5;

  static ACCEL_WALK = 0.32;
  static ACCEL_RUN = 0.50;
  static MAX_SPEED_WALK = 3.2;
  static MAX_SPEED_RUN = 5.2;

  static FRICTION_GROUND = 0.82;
  static FRICTION_AIR = 0.94;
  static SKID_DECEL = 0.65;

  static JUMP_IMPULSE = -9.2;
  static JUMP_CUTOFF = -3.2; // Max upward velocity when jump key is released early
  static ENEMY_BOUNCE_IMPULSE = -7.4;
  static ENEMY_HIGH_BOUNCE_IMPULSE = -9.4;

  // Axis-Aligned Bounding Box (AABB) overlap check
  static checkAABB(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  // Check collision of an entity against solid level tiles
  static resolveTileCollisions(entity, level, onHeadHit) {
    const T = level.tileSize;

    // 1. HORIZONTAL RESOLUTION
    entity.x += entity.vx;
    let minTileX = Math.floor(entity.x / T);
    let maxTileX = Math.floor((entity.x + entity.width - 0.01) / T);
    let minTileY = Math.floor(entity.y / T);
    let maxTileY = Math.floor((entity.y + entity.height - 0.01) / T);

    for (let ty = minTileY; ty <= maxTileY; ty++) {
      for (let tx = minTileX; tx <= maxTileX; tx++) {
        const tile = level.getTile(tx, ty);
        if (tile && tile.isSolid) {
          if (entity.vx > 0) {
            // Moving Right -> Hit left edge of tile
            entity.x = tx * T - entity.width;
            entity.vx = 0;
            if (entity.onWallHit) entity.onWallHit('right');
          } else if (entity.vx < 0) {
            // Moving Left -> Hit right edge of tile
            entity.x = (tx + 1) * T;
            entity.vx = 0;
            if (entity.onWallHit) entity.onWallHit('left');
          }
        }
      }
    }

    // 2. VERTICAL RESOLUTION
    entity.y += entity.vy;
    minTileX = Math.floor(entity.x / T);
    maxTileX = Math.floor((entity.x + entity.width - 0.01) / T);
    minTileY = Math.floor(entity.y / T);
    maxTileY = Math.floor((entity.y + entity.height - 0.01) / T);

    entity.isGrounded = false;

    for (let ty = minTileY; ty <= maxTileY; ty++) {
      for (let tx = minTileX; tx <= maxTileX; tx++) {
        const tile = level.getTile(tx, ty);
        if (tile && tile.isSolid) {
          if (entity.vy > 0) {
            // Falling Down -> Land on top of tile
            entity.y = ty * T - entity.height;
            entity.vy = 0;
            entity.isGrounded = true;
          } else if (entity.vy < 0) {
            // Jumping Up -> Hit underside of tile
            entity.y = (ty + 1) * T;
            entity.vy = 0;
            if (onHeadHit) {
              onHeadHit(tx, ty, tile);
            }
          }
        }
      }
    }

    // Level Left / Right Boundaries
    if (entity.x < 0) {
      entity.x = 0;
      entity.vx = 0;
    }
  }

  // Check collision with one-way platforms and moving platforms
  static resolvePlatformCollisions(entity, platforms) {
    if (entity.vy < 0) return; // Do not collide when jumping up through one-way platform

    platforms.forEach(plat => {
      // Check if entity was above platform on previous frame and now overlapping top edge
      const prevBottom = entity.y + entity.height - entity.vy;
      const currBottom = entity.y + entity.height;

      if (
        entity.x + entity.width > plat.x &&
        entity.x < plat.x + plat.width &&
        prevBottom <= plat.y + 4 &&
        currBottom >= plat.y
      ) {
        entity.y = plat.y - entity.height;
        entity.vy = 0;
        entity.isGrounded = true;
        entity.currentPlatform = plat;

        // Move entity along with platform horizontal movement
        if (plat.vx) {
          entity.x += plat.vx;
        }
      }
    });
  }
}

window.Physics = Physics;
