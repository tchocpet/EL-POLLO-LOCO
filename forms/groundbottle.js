"use strict";

/**
 * Collectible ground bottle object.
 */
class GroundBottle {
  /**
   * Creates a new ground bottle instance.
   * @param {number} x - Start position X
   * @param {number} y - Start position Y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.w = 38;
    this.h = 52;

    this.collected = false;
    this.frame = 0;
    this.animT = 0;

    this.images = [];
    this.loadImages();
  }

  /**
   * Loads all ground bottle images.
   */
  loadImages() {
    const paths = [
      "img/6_salsa_bottle/1_salsa_bottle_on_ground.png",
      "img/6_salsa_bottle/2_salsa_bottle_on_ground.png",
    ];

    paths.forEach((src) => {
      const img = new Image();
      img.src = src;
      this.images.push(img);
    });
  }

  /**
   * Updates the ground bottle animation state.
   * @param {number} dtMs - Delta time in milliseconds
   */
  update(dtMs) {
    if (this.collected) {
      return;
    }

    this.animT += dtMs;

    if (this.animT > 260) {
      this.animT = 0;
      this.frame = this.frame === 0 ? 1 : 0;
    }
  }

  /**
   * Draws the ground bottle on the canvas (main entry point).
   * Splits logic into helpers for image and fallback drawing.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    const img = this.images[this.frame];
    if (this.isImageDrawable(img)) {
      this.drawBottleImage(ctx, img);
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
   * Draws the bottle image.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {HTMLImageElement} img - Image to draw
   */
  drawBottleImage(ctx, img) {
    ctx.drawImage(img, this.x, this.y, this.w, this.h);
  }

  /**
   * Draws a fallback rectangle if no image is available.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawFallback(ctx) {
    ctx.fillStyle = "#27ae60";
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}

/**
 * Expose GroundBottle class to the global window object.
 * @global
 * @class GroundBottle
 */
window.GroundBottle = GroundBottle;
