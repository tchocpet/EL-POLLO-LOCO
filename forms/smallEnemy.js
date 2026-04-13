"use strict";

/**
 * Small chicken enemy object.
 */
class SmallEnemy {
  /**
   * Creates a new small enemy instance.
   * @param {number} x - Start position X
   * @param {number} y - Start position Y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.w = 42;
    this.h = 42;

    this.vx = -130;
    this.dead = false;
    this.removable = false;

    this.frame = 0;
    this.animTime = 0;
    this.deadTime = 0;

    this.walkImages = [];
    this.deadImage = null;
    this.loadImages();
  }

  /**
   * Loads all small enemy images (walk and dead).
   */
  loadImages() {
    const walkPaths = [
      "img/3_enemies_chicken/chicken_small/1_walk/1_w.png",
      "img/3_enemies_chicken/chicken_small/1_walk/2_w.png",
      "img/3_enemies_chicken/chicken_small/1_walk/3_w.png",
    ];

    walkPaths.forEach((src) => {
      const img = new Image();
      img.src = src;
      this.walkImages.push(img);
    });

    this.deadImage = new Image();
    this.deadImage.src = "img/3_enemies_chicken/chicken_small/2_dead/dead.png";
  }

  /**
   * Updates the small enemy state each frame.
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
    this.y += 160 * dtSec;

    if (this.deadTime > 650) {
      this.removable = true;
    }
  }

  /**
   * Marks the small enemy as dead and starts the dead timer.
   */
  die() {
    if (this.dead) return;
    this.dead = true;
    this.vx = 0;
    this.deadTime = 0;
  }

  /**
   * Moves the small enemy horizontally and handles direction and world bounds.
   * @param {number} dtSec - Delta time in seconds
   * @param {object} world - World object
   */
  move(dtSec, world) {
    this.x += this.vx * dtSec;

    if (this.x < 200) {
      this.vx = 130;
    }

    if (this.x > world.levelW - 200) {
      this.vx = -130;
    }
  }

  /**
   * Updates the small enemy walk animation.
   * @param {number} dtMs - Delta time in milliseconds
   */
  animate(dtMs) {
    this.animTime += dtMs;

    if (this.animTime < 120) {
      return;
    }

    this.animTime = 0;
    this.frame = (this.frame + 1) % this.walkImages.length;
  }

  /**
   * Draws the small enemy on the canvas (main entry point).
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
    return img && img.complete;
  }

  /**
   * Draws the alive small enemy image.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {HTMLImageElement} img - Image to draw
   */
  drawAliveImage(ctx, img) {
    ctx.drawImage(img, this.x, this.y, this.w, this.h);
  }

  /**
   * Draws a fallback rectangle if no image is available.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawFallback(ctx) {
    ctx.fillStyle = "#f39c12";
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }

  /**
   * Draws the dead small enemy image or a fallback if not loaded.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawDead(ctx) {
    if (this.deadImage && this.deadImage.complete) {
      ctx.drawImage(this.deadImage, this.x, this.y, this.w, this.h);
      return;
    }

    ctx.fillStyle = "#999";
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}

/**
 * Expose SmallEnemy class to the global window object.
 * @global
 * @class SmallEnemy
 */
window.SmallEnemy = SmallEnemy;
