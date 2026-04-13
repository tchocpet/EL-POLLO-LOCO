"use strict";

/**
 * Chicken enemy object.
 */
class Enemy {
  /**
   * Creates a new enemy instance.
   * @param {number} x - Start position X
   * @param {number} y - Start position Y
   * @param {string} type - Enemy type ("big" or "small")
   */
  constructor(x, y, type = "big") {
    this.x = x;
    this.y = y;
    this.type = type;

    if (type === "small") {
      this.w = 42;
      this.h = 42;
      this.vx = -85;
    } else {
      this.w = 75;
      this.h = 75;
      this.vx = -70;
    }

    this.dead = false;
    this.removable = false;

    this.frame = 0;
    this.animTime = 0;
    this.deadTime = 0;
    this.facing = -1;

    this.walkImages = [];
    this.deadImage = null;
    this.loadImages();
  }

  /**
   * Loads all enemy images (walk and dead).
   */
  loadImages() {
    let walkPaths = [];
    let deadPath = "";

    if (this.type === "small") {
      walkPaths = [
        "img/3_enemies_chicken/chicken_small/1_walk/1_w.png",
        "img/3_enemies_chicken/chicken_small/1_walk/2_w.png",
        "img/3_enemies_chicken/chicken_small/1_walk/3_w.png",
      ];
      deadPath = "img/3_enemies_chicken/chicken_small/2_dead/dead.png";
    } else {
      walkPaths = [
        "img/3_enemies_chicken/chicken_normal/1_walk/1_w.png",
        "img/3_enemies_chicken/chicken_normal/1_walk/2_w.png",
        "img/3_enemies_chicken/chicken_normal/1_walk/3_w.png",
      ];
      deadPath = "img/3_enemies_chicken/chicken_normal/2_dead/dead.png";
    }

    walkPaths.forEach((src) => {
      const img = new Image();
      img.src = src;
      this.walkImages.push(img);
    });

    this.deadImage = new Image();
    this.deadImage.src = deadPath;
  }

  /**
   * Updates the enemy state each frame.
   * @param {number} dtMs - Delta time in milliseconds
   * @param {number} dtSec - Delta time in seconds
   * @param {object} world - World object
   */
  update(dtMs, dtSec, world) {
    if (this.dead) {
      this.updateDead(dtMs, dtSec);
      return;
    }

    this.move(dtSec, world);
    this.animate(dtMs);
  }

  /**
   * Updates the dead state and removal timer.
   * @param {number} dtMs - Delta time in milliseconds
   * @param {number} dtSec - Delta time in seconds
   */
  updateDead(dtMs, dtSec) {
    this.deadTime += dtMs;
    this.y += 140 * dtSec;

    if (this.deadTime > 650) {
      this.removable = true;
    }
  }

  /**
   * Marks the enemy as dead and starts the dead timer.
   */
  die() {
    if (this.dead) return;
    this.dead = true;
    this.vx = 0;
    this.deadTime = 0;
  }

  /**
   * Moves the enemy horizontally and handles direction and world bounds.
   * @param {number} dtSec - Delta time in seconds
   * @param {object} world - World object
   */
  move(dtSec, world) {
    this.x += this.vx * dtSec;
    this.facing = this.vx < 0 ? -1 : 1;

    if (this.x < 200) {
      this.vx = this.type === "small" ? 70 : 55;
    }

    if (this.x > world.levelW - 200) {
      this.vx = this.type === "small" ? -70 : -55;
    }
  }

  /**
   * Updates the enemy walk animation.
   * @param {number} dtMs - Delta time in milliseconds
   */
  animate(dtMs) {
    this.animTime += dtMs;

    const speed = this.type === "small" ? 120 : 180;

    if (this.animTime < speed) {
      return;
    }

    this.animTime = 0;
    this.frame = (this.frame + 1) % this.walkImages.length;
  }

  /**
   * Draws the enemy on the canvas (main entry point).
   * Splits logic into helpers for dead, alive, and fallback drawing.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    if (this.dead) {
      this.drawDead(ctx);
      return;
    }
    const img = this.walkImages[this.frame];
    if (this.isImageDrawable(img)) {
      this.drawAliveImage(ctx, img);
      return;
    }
    this.drawFallback(ctx);
  }

  /**
   * Checks if an image is drawable.
   * @param {HTMLImageElement} img - Image to check
   * @returns {boolean} True if drawable
   */
  isImageDrawable(img) {
    return img && img.complete && img.naturalWidth > 0;
  }

  /**
   * Draws the alive enemy image, handling direction.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {HTMLImageElement} img - Image to draw
   */
  drawAliveImage(ctx, img) {
    ctx.save();
    if (this.facing > 0) {
      ctx.translate(this.x + this.w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, this.y, this.w, this.h);
    } else {
      ctx.drawImage(img, this.x, this.y, this.w, this.h);
    }
    ctx.restore();
  }

  /**
   * Draws a fallback rectangle if no image is available.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawFallback(ctx) {
    ctx.fillStyle = "#8b4513";
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }

  /**
   * Draws the dead enemy image or a fallback if not loaded.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawDead(ctx) {
    if (
      this.deadImage &&
      this.deadImage.complete &&
      this.deadImage.naturalWidth > 0
    ) {
      ctx.save();

      if (this.facing > 0) {
        ctx.translate(this.x + this.w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(this.deadImage, 0, this.y, this.w, this.h);
      } else {
        ctx.drawImage(this.deadImage, this.x, this.y, this.w, this.h);
      }

      ctx.restore();
      return;
    }

    ctx.fillStyle = "#999";
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}

/**
 * Expose Enemy class to the global window object.
 * @global
 * @class Enemy
 */
window.Enemy = Enemy;
