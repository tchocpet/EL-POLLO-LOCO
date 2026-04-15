"use strict";

/**
 * Initializes the enemy module and registers its public API.
 */
function initEnemyModule() {
  registerEnemyApi();
}

/**
 * Registers the Enemy class on the global window object.
 */
function registerEnemyApi() {
  window.Enemy = createEnemyClass();
}

/**
 * Creates the Enemy class.
 *
 * @returns {typeof Enemy}
 */
function createEnemyClass() {
  return class Enemy {
    /**
     * Creates a new enemy instance.
     *
     * @param {number} x - Start x position.
     * @param {number} y - Start y position.
     * @param {string} [type="big"] - Enemy type.
     */
    constructor(x, y, type = "big") {
      this.x = x;
      this.y = y;
      this.type = type;
      applyEnemySize(this, type);
      this.dead = false;
      this.removable = false;
      this.frame = 0;
      this.animTime = 0;
      this.deadTime = 0;
      this.facing = -1;
      this.walkImages = [];
      this.deadImage = null;
      loadEnemyImages(this);
    }

    /**
     * Updates the enemy state for one frame.
     *
     * @param {number} dtMs - Delta time in milliseconds.
     * @param {number} dtSec - Delta time in seconds.
     * @param {object} world - World state.
     */
    update(dtMs, dtSec, world) {
      if (this.dead) return updateDeadEnemy(this, dtMs, dtSec);
      moveEnemy(this, dtSec, world);
      animateEnemy(this, dtMs);
    }

    /**
     * Marks the enemy as dead.
     */
    die() {
      if (this.dead) return;
      this.dead = true;
      this.vx = 0;
      this.deadTime = 0;
    }

    /**
     * Draws the enemy.
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context.
     */
    draw(ctx) {
      if (this.dead) return drawDeadEnemy(this, ctx);
      const image = this.walkImages[this.frame];
      if (isEnemyImageDrawable(image)) return drawAliveEnemy(this, ctx, image);
      drawEnemyFallback(this, ctx);
    }
  };
}

/**
 * Applies size and speed based on enemy type.
 *
 * @param {object} enemy - Enemy instance.
 * @param {string} type - Enemy type.
 */
function applyEnemySize(enemy, type) {
  if (type === "small") return applySmallEnemySize(enemy);
  applyBigEnemySize(enemy);
}

/**
 * Applies big enemy dimensions.
 *
 * @param {object} enemy - Enemy instance.
 */
function applyBigEnemySize(enemy) {
  enemy.w = 75;
  enemy.h = 75;
  enemy.vx = -70;
}

/**
 * Applies small enemy dimensions.
 *
 * @param {object} enemy - Enemy instance.
 */
function applySmallEnemySize(enemy) {
  enemy.w = 42;
  enemy.h = 42;
  enemy.vx = -85;
}

/**
 * Loads all enemy images.
 *
 * @param {object} enemy - Enemy instance.
 */
function loadEnemyImages(enemy) {
  loadEnemyWalkImages(enemy);
  loadEnemyDeadImage(enemy);
}

/**
 * Loads all walk images.
 *
 * @param {object} enemy - Enemy instance.
 */
function loadEnemyWalkImages(enemy) {
  getEnemyWalkPaths(enemy.type).forEach((src) =>
    pushEnemyImage(enemy.walkImages, src),
  );
}

/**
 * Loads the dead image.
 *
 * @param {object} enemy - Enemy instance.
 */
function loadEnemyDeadImage(enemy) {
  enemy.deadImage = new Image();
  enemy.deadImage.src = getEnemyDeadPath(enemy.type);
}

/**
 * Pushes one image into the walk image list.
 *
 * @param {HTMLImageElement[]} list - Target image list.
 * @param {string} src - Image source path.
 */
function pushEnemyImage(list, src) {
  const image = new Image();
  image.src = src;
  list.push(image);
}

/**
 * Returns walk image paths for one enemy type.
 *
 * @param {string} type - Enemy type.
 * @returns {string[]}
 */
function getEnemyWalkPaths(type) {
  if (type === "small") return getSmallEnemyWalkPaths();
  return getBigEnemyWalkPaths();
}

/**
 * Returns big enemy walk paths.
 *
 * @returns {string[]}
 */
function getBigEnemyWalkPaths() {
  return [
    "img/3_enemies_chicken/chicken_normal/1_walk/1_w.png",
    "img/3_enemies_chicken/chicken_normal/1_walk/2_w.png",
    "img/3_enemies_chicken/chicken_normal/1_walk/3_w.png",
  ];
}

/**
 * Returns small enemy walk paths.
 *
 * @returns {string[]}
 */
function getSmallEnemyWalkPaths() {
  return [
    "img/3_enemies_chicken/chicken_small/1_walk/1_w.png",
    "img/3_enemies_chicken/chicken_small/1_walk/2_w.png",
    "img/3_enemies_chicken/chicken_small/1_walk/3_w.png",
  ];
}

/**
 * Returns the dead image path for one enemy type.
 *
 * @param {string} type - Enemy type.
 * @returns {string}
 */
function getEnemyDeadPath(type) {
  if (type === "small") {
    return "img/3_enemies_chicken/chicken_small/2_dead/dead.png";
  }
  return "img/3_enemies_chicken/chicken_normal/2_dead/dead.png";
}

/**
 * Updates the dead enemy state.
 *
 * @param {object} enemy - Enemy instance.
 * @param {number} dtMs - Delta time in milliseconds.
 * @param {number} dtSec - Delta time in seconds.
 */
function updateDeadEnemy(enemy, dtMs, dtSec) {
  enemy.deadTime += dtMs;
  enemy.y += 140 * dtSec;
  if (enemy.deadTime > 650) enemy.removable = true;
}

/**
 * Moves the enemy horizontally.
 *
 * @param {object} enemy - Enemy instance.
 * @param {number} dtSec - Delta time in seconds.
 * @param {object} world - World state.
 */
function moveEnemy(enemy, dtSec, world) {
  enemy.x += enemy.vx * dtSec;
  enemy.facing = enemy.vx < 0 ? -1 : 1;
  handleEnemyLeftTurn(enemy);
  handleEnemyRightTurn(enemy, world);
}

/**
 * Handles the left turn boundary.
 *
 * @param {object} enemy - Enemy instance.
 */
function handleEnemyLeftTurn(enemy) {
  if (enemy.x >= 200) return;
  enemy.vx = enemy.type === "small" ? 70 : 55;
}

/**
 * Handles the right turn boundary.
 *
 * @param {object} enemy - Enemy instance.
 * @param {object} world - World state.
 */
function handleEnemyRightTurn(enemy, world) {
  if (enemy.x <= world.levelW - 200) return;
  enemy.vx = enemy.type === "small" ? -70 : -55;
}

/**
 * Updates the enemy walk animation.
 *
 * @param {object} enemy - Enemy instance.
 * @param {number} dtMs - Delta time in milliseconds.
 */
function animateEnemy(enemy, dtMs) {
  const speed = getEnemyAnimationSpeed(enemy);
  enemy.animTime += dtMs;
  if (enemy.animTime < speed) return;
  enemy.animTime = 0;
  enemy.frame = (enemy.frame + 1) % enemy.walkImages.length;
}

/**
 * Returns the animation speed for one enemy.
 *
 * @param {object} enemy - Enemy instance.
 * @returns {number}
 */
function getEnemyAnimationSpeed(enemy) {
  if (enemy.type === "small") return 120;
  return 180;
}

/**
 * Returns whether an enemy image is drawable.
 *
 * @param {HTMLImageElement|null} image - Enemy image.
 * @returns {boolean}
 */
function isEnemyImageDrawable(image) {
  return !!image && image.complete && image.naturalWidth > 0;
}

/**
 * Draws the alive enemy image.
 *
 * @param {object} enemy - Enemy instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {HTMLImageElement} image - Enemy image.
 */
function drawAliveEnemy(enemy, ctx, image) {
  ctx.save();
  if (enemy.facing > 0) return drawFlippedEnemy(enemy, ctx, image);
  ctx.drawImage(image, enemy.x, enemy.y, enemy.w, enemy.h);
  ctx.restore();
}

/**
 * Draws the flipped enemy image.
 *
 * @param {object} enemy - Enemy instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {HTMLImageElement} image - Enemy image.
 */
function drawFlippedEnemy(enemy, ctx, image) {
  ctx.translate(enemy.x + enemy.w, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(image, 0, enemy.y, enemy.w, enemy.h);
  ctx.restore();
}

/**
 * Draws the dead enemy image or fallback.
 *
 * @param {object} enemy - Enemy instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
function drawDeadEnemy(enemy, ctx) {
  if (isEnemyImageDrawable(enemy.deadImage))
    return drawDeadEnemyImage(enemy, ctx);
  drawDeadEnemyFallback(enemy, ctx);
}

/**
 * Draws the dead enemy image.
 *
 * @param {object} enemy - Enemy instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
function drawDeadEnemyImage(enemy, ctx) {
  ctx.save();
  if (enemy.facing > 0) return drawFlippedDeadEnemy(enemy, ctx);
  ctx.drawImage(enemy.deadImage, enemy.x, enemy.y, enemy.w, enemy.h);
  ctx.restore();
}

/**
 * Draws the flipped dead enemy image.
 *
 * @param {object} enemy - Enemy instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
function drawFlippedDeadEnemy(enemy, ctx) {
  ctx.translate(enemy.x + enemy.w, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(enemy.deadImage, 0, enemy.y, enemy.w, enemy.h);
  ctx.restore();
}

/**
 * Draws the fallback alive enemy.
 *
 * @param {object} enemy - Enemy instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
function drawEnemyFallback(enemy, ctx) {
  ctx.fillStyle = "#8b4513";
  ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
}

/**
 * Draws the fallback dead enemy.
 *
 * @param {object} enemy - Enemy instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
function drawDeadEnemyFallback(enemy, ctx) {
  ctx.fillStyle = "#999";
  ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
}
