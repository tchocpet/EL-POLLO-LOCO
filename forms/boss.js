/**
 * Initializes the boss module and registers its public API.
 */
function initBossModule() {
  registerBossApi();
}

/**
 * Registers the Boss class on the global window object.
 */
function registerBossApi() {
  window.Boss = createBossClass();
}

/**
 * Creates the Boss class.
 *
 * @returns {typeof Boss}
 */
function createBossClass() {
  return class Boss {
    /**
     * Creates a new boss instance.
     *
     * @param {number} x - Start x position.
     * @param {number} y - Start y position.
     */
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.w = 280;
      this.h = 280;
      this.vx = -90;
      this.dead = false;
      this.removable = false;
      this.hurt = false;
      this.facing = -1;
      this.frame = 0;
      this.animT = 0;
      this.deadTime = 0;
      this.hurtTime = 0;
      this.active = false;
      this.phaseTwo = false;
      this.attackCooldown = 0;
      this.rushTime = 0;
      this.isRushing = false;
      this.offset = createBossOffset();
      this.walkImages = [];
      this.hurtImages = [];
      this.deadImages = [];
      loadBossImages(this);
    }

    /**
     * Updates the boss state for one frame.
     *
     * @param {number} dtMs - Delta time in milliseconds.
     * @param {number} dtSec - Delta time in seconds.
     * @param {object} world - World state.
     * @param {object} player - Player state.
     * @param {number} health - Boss health.
     */
    update(dtMs, dtSec, world, player, health) {
      if (isBossDeadState(this, dtMs, dtSec)) return;
      updateAliveBossState(this, dtMs, dtSec, world, player, health);
    }

    /**
     * Sets the boss to hurt state.
     */
    takeHit() {
      if (this.dead) return;
      this.hurt = true;
      this.hurtTime = 0.35;
    }

    /**
     * Kills the boss.
     */
    die() {
      if (this.dead) return;
      this.dead = true;
      this.vx = 0;
      this.deadTime = 0;
      this.isRushing = false;
      this.hurt = false;
    }

    /**
     * Draws the boss.
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context.
     */
    draw(ctx) {
      const image = getCurrentBossImage(this);
      if (!isBossImageDrawable(image)) {
        drawBossFallback(this, ctx);
        return;
      }
      drawBossSprite(this, ctx, image);
    }
  };
}

/**
 * Creates the boss hitbox offset.
 *
 * @returns {{top:number,left:number,right:number,bottom:number}}
 */
function createBossOffset() {
  return {
    top: 70,
    left: 40,
    right: 40,
    bottom: 25,
  };
}

/**
 * Loads all boss images.
 *
 * @param {object} boss - Boss instance.
 */
function loadBossImages(boss) {
  loadBossWalkImages(boss);
  loadBossHurtImages(boss);
  loadBossDeadImages(boss);
}

/**
 * Loads walk images.
 *
 * @param {object} boss - Boss instance.
 */
function loadBossWalkImages(boss) {
  getBossWalkPaths().forEach((src) => pushBossImage(boss.walkImages, src));
}

/**
 * Loads hurt images.
 *
 * @param {object} boss - Boss instance.
 */
function loadBossHurtImages(boss) {
  getBossHurtPaths().forEach((src) => pushBossImage(boss.hurtImages, src));
}

/**
 * Loads dead images.
 *
 * @param {object} boss - Boss instance.
 */
function loadBossDeadImages(boss) {
  getBossDeadPaths().forEach((src) => pushBossImage(boss.deadImages, src));
}

/**
 * Pushes one image into an image list.
 *
 * @param {HTMLImageElement[]} list - Target image list.
 * @param {string} src - Image source path.
 */
function pushBossImage(list, src) {
  const image = new Image();
  image.src = src;
  list.push(image);
}

/**
 * Returns walk image paths.
 *
 * @returns {string[]}
 */
function getBossWalkPaths() {
  return [
    "img/4_enemie_boss_chicken/1_walk/G1.png",
    "img/4_enemie_boss_chicken/1_walk/G2.png",
    "img/4_enemie_boss_chicken/1_walk/G3.png",
    "img/4_enemie_boss_chicken/1_walk/G4.png",
  ];
}

/**
 * Returns hurt image paths.
 *
 * @returns {string[]}
 */
function getBossHurtPaths() {
  return [
    "img/4_enemie_boss_chicken/4_hurt/G21.png",
    "img/4_enemie_boss_chicken/4_hurt/G22.png",
    "img/4_enemie_boss_chicken/4_hurt/G23.png",
  ];
}

/**
 * Returns dead image paths.
 *
 * @returns {string[]}
 */
function getBossDeadPaths() {
  return [
    "img/4_enemie_boss_chicken/5_dead/G24.png",
    "img/4_enemie_boss_chicken/5_dead/G25.png",
    "img/4_enemie_boss_chicken/5_dead/G26.png",
  ];
}

/**
 * Returns whether the boss is dead and updates dead state.
 *
 * @param {object} boss - Boss instance.
 * @param {number} dtMs - Delta time in milliseconds.
 * @param {number} dtSec - Delta time in seconds.
 * @returns {boolean}
 */
function isBossDeadState(boss, dtMs, dtSec) {
  if (!boss.dead) return false;
  updateDeadBossState(boss, dtMs, dtSec);
  return true;
}

/**
 * Updates the alive boss state.
 *
 * @param {object} boss - Boss instance.
 * @param {number} dtMs - Delta time in milliseconds.
 * @param {number} dtSec - Delta time in seconds.
 * @param {object} world - World state.
 * @param {object} player - Player state.
 * @param {number} health - Boss health.
 */
function updateAliveBossState(boss, dtMs, dtSec, world, player, health) {
  updateBossStateFlags(boss, dtSec, health);
  const distance = getBossDistanceToPlayer(boss, player);
  activateBossIfNeeded(boss, distance);
  if (!boss.active) return;
  updateActiveBossState(boss, dtMs, dtSec, world, player, distance);
}

/**
 * Updates boss state flags.
 *
 * @param {object} boss - Boss instance.
 * @param {number} dtSec - Delta time in seconds.
 * @param {number} health - Boss health.
 */
function updateBossStateFlags(boss, dtSec, health) {
  updateBossHurtState(boss, dtSec);
  updateBossPhase(boss, health);
  updateBossTimers(boss, dtSec);
}

/**
 * Returns the distance to the player.
 *
 * @param {object} boss - Boss instance.
 * @param {object} player - Player state.
 * @returns {number}
 */
function getBossDistanceToPlayer(boss, player) {
  return boss.x - player.x;
}

/**
 * Activates the boss if the player is close enough.
 *
 * @param {object} boss - Boss instance.
 * @param {number} distance - Distance to player.
 */
function activateBossIfNeeded(boss, distance) {
  if (Math.abs(distance) < 750) boss.active = true;
}

/**
 * Updates the active boss state.
 *
 * @param {object} boss - Boss instance.
 * @param {number} dtMs - Delta time in milliseconds.
 * @param {number} dtSec - Delta time in seconds.
 * @param {object} world - World state.
 * @param {object} player - Player state.
 * @param {number} distance - Distance to player.
 */
function updateActiveBossState(boss, dtMs, dtSec, world, player, distance) {
  tryStartBossRush(boss, distance);
  moveBoss(boss, dtSec, world, player);
  animateBoss(boss, dtMs);
}

/**
 * Updates the hurt state.
 *
 * @param {object} boss - Boss instance.
 * @param {number} dtSec - Delta time in seconds.
 */
function updateBossHurtState(boss, dtSec) {
  if (boss.hurtTime > 0) boss.hurtTime -= dtSec;
  if (boss.hurtTime > 0) return;
  boss.hurt = false;
  boss.hurtTime = 0;
}

/**
 * Updates the dead state.
 *
 * @param {object} boss - Boss instance.
 * @param {number} dtMs - Delta time in milliseconds.
 * @param {number} dtSec - Delta time in seconds.
 */
function updateDeadBossState(boss, dtMs, dtSec) {
  boss.deadTime += dtMs;
  boss.y += 90 * dtSec;
  if (boss.deadTime > 1400) boss.removable = true;
}

/**
 * Updates the boss phase.
 *
 * @param {object} boss - Boss instance.
 * @param {number} health - Boss health.
 */
function updateBossPhase(boss, health) {
  boss.phaseTwo = health <= 50;
}

/**
 * Updates boss timers.
 *
 * @param {object} boss - Boss instance.
 * @param {number} dtSec - Delta time in seconds.
 */
function updateBossTimers(boss, dtSec) {
  lowerBossAttackCooldown(boss, dtSec);
  lowerBossRushTime(boss, dtSec);
  if (boss.rushTime > 0) return;
  boss.isRushing = false;
}

/**
 * Lowers the attack cooldown.
 *
 * @param {object} boss - Boss instance.
 * @param {number} dtSec - Delta time in seconds.
 */
function lowerBossAttackCooldown(boss, dtSec) {
  if (boss.attackCooldown > 0) boss.attackCooldown -= dtSec;
}

/**
 * Lowers the rush timer.
 *
 * @param {object} boss - Boss instance.
 * @param {number} dtSec - Delta time in seconds.
 */
function lowerBossRushTime(boss, dtSec) {
  if (boss.rushTime > 0) boss.rushTime -= dtSec;
}

/**
 * Tries to start a rush attack.
 *
 * @param {object} boss - Boss instance.
 * @param {number} distance - Distance to player.
 */
function tryStartBossRush(boss, distance) {
  if (!boss.phaseTwo) return;
  if (boss.attackCooldown > 0 || boss.isRushing) return;
  if (Math.abs(distance) > 280) return;
  boss.isRushing = true;
  boss.rushTime = 0.85;
  boss.attackCooldown = 2.2;
}

/**
 * Moves the boss.
 *
 * @param {object} boss - Boss instance.
 * @param {number} dtSec - Delta time in seconds.
 * @param {object} world - World state.
 * @param {object} player - Player state.
 */
function moveBoss(boss, dtSec, world, player) {
  const speed = getBossMoveSpeed(boss);
  const distance = player.x - boss.x;
  if (isBossCloseToPlayer(distance)) return stopBossMovement(boss);
  updateBossDirection(boss, distance, speed, dtSec);
  clampBossPosition(boss, world);
}

/**
 * Returns the current move speed.
 *
 * @param {object} boss - Boss instance.
 * @returns {number}
 */
function getBossMoveSpeed(boss) {
  if (boss.isRushing) return 255;
  if (boss.phaseTwo) return 155;
  return 100;
}

/**
 * Returns whether the boss is close to the player.
 *
 * @param {number} distance - Distance to player.
 * @returns {boolean}
 */
function isBossCloseToPlayer(distance) {
  return Math.abs(distance) < 20;
}

/**
 * Stops boss movement.
 *
 * @param {object} boss - Boss instance.
 */
function stopBossMovement(boss) {
  boss.vx = 0;
}

/**
 * Updates boss direction and position.
 *
 * @param {object} boss - Boss instance.
 * @param {number} distance - Distance to player.
 * @param {number} speed - Move speed.
 * @param {number} dtSec - Delta time in seconds.
 */
function updateBossDirection(boss, distance, speed, dtSec) {
  boss.vx = distance < 0 ? -speed : speed;
  boss.facing = boss.vx < 0 ? -1 : 1;
  boss.x += boss.vx * dtSec;
}

/**
 * Clamps the boss inside world bounds.
 *
 * @param {object} boss - Boss instance.
 * @param {object} world - World state.
 */
function clampBossPosition(boss, world) {
  const minX = 0;
  const maxX = world.levelW - boss.w;
  if (boss.x < minX) boss.x = minX;
  if (boss.x > maxX) boss.x = maxX;
}

/**
 * Updates the boss animation.
 *
 * @param {object} boss - Boss instance.
 * @param {number} dtMs - Delta time in milliseconds.
 */
function animateBoss(boss, dtMs) {
  const limit = getBossAnimationLimit(boss);
  boss.animT += dtMs;
  if (boss.animT < limit) return;
  boss.animT = 0;
  advanceBossFrame(boss);
}

/**
 * Returns the animation limit.
 *
 * @param {object} boss - Boss instance.
 * @returns {number}
 */
function getBossAnimationLimit(boss) {
  if (boss.isRushing) return 90;
  if (boss.phaseTwo) return 120;
  return 180;
}

/**
 * Advances the current boss frame.
 *
 * @param {object} boss - Boss instance.
 */
function advanceBossFrame(boss) {
  const maxFrames = getBossFrameCount(boss);
  boss.frame = (boss.frame + 1) % Math.max(1, maxFrames);
}

/**
 * Returns the current frame count.
 *
 * @param {object} boss - Boss instance.
 * @returns {number}
 */
function getBossFrameCount(boss) {
  if (boss.hurt) return boss.hurtImages.length;
  return boss.walkImages.length;
}

/**
 * Returns the current boss image.
 *
 * @param {object} boss - Boss instance.
 * @returns {HTMLImageElement|null}
 */
function getCurrentBossImage(boss) {
  if (boss.dead) return getDeadBossImage(boss);
  if (boss.hurt) return getHurtBossImage(boss);
  return getWalkBossImage(boss);
}

/**
 * Returns the current dead image.
 *
 * @param {object} boss - Boss instance.
 * @returns {HTMLImageElement|null}
 */
function getDeadBossImage(boss) {
  const index = Math.min(
    boss.deadImages.length - 1,
    Math.floor(boss.deadTime / 180),
  );
  return boss.deadImages[index] || null;
}

/**
 * Returns the current hurt image.
 *
 * @param {object} boss - Boss instance.
 * @returns {HTMLImageElement|null}
 */
function getHurtBossImage(boss) {
  return boss.hurtImages[boss.frame % boss.hurtImages.length] || null;
}

/**
 * Returns the current walk image.
 *
 * @param {object} boss - Boss instance.
 * @returns {HTMLImageElement|null}
 */
function getWalkBossImage(boss) {
  return boss.walkImages[boss.frame % boss.walkImages.length] || null;
}

/**
 * Returns whether a boss image is drawable.
 *
 * @param {HTMLImageElement|null} image - Boss image.
 * @returns {boolean}
 */
function isBossImageDrawable(image) {
  return !!image && image.complete && image.naturalWidth > 0;
}

/**
 * Draws the boss sprite.
 *
 * @param {object} boss - Boss instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {HTMLImageElement} image - Boss image.
 */
function drawBossSprite(boss, ctx, image) {
  ctx.save();
  if (boss.facing > 0) return drawFlippedBossSprite(boss, ctx, image);
  ctx.drawImage(image, boss.x, boss.y, boss.w, boss.h);
  ctx.restore();
}

/**
 * Draws the flipped boss sprite.
 *
 * @param {object} boss - Boss instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {HTMLImageElement} image - Boss image.
 */
function drawFlippedBossSprite(boss, ctx, image) {
  ctx.translate(boss.x + boss.w, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(image, 0, boss.y, boss.w, boss.h);
  ctx.restore();
}

/**
 * Draws a fallback boss rectangle.
 *
 * @param {object} boss - Boss instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
function drawBossFallback(boss, ctx) {
  ctx.fillStyle = "#c0392b";
  ctx.fillRect(boss.x, boss.y, boss.w, boss.h);
}
