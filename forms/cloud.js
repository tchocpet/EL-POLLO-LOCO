"use strict";

/**
 * Moving cloud object for the background.
 */
class Cloud {
  /**
   * Creates a new cloud instance.
   * @param {number} x - Start position X
   */
  constructor(x = 0) {
    this.x = x;
    this.y = 40;
    this.w = 500;
    this.h = 250;
    this.speed = 18;

    this.img = new Image();
    this.img.src = "img/5_background/layers/4_clouds/1.png";
  }

  /**
   * Updates the cloud position and handles looping.
   * @param {number} dtSec - Delta time in seconds
   * @param {object} world - World object
   */
  update(dtSec, world) {
    this.moveCloud(dtSec);
    this.handleCloudLoop(world);
  }

  /**
   * Moves the cloud horizontally based on speed and delta time.
   * @param {number} dtSec - Delta time in seconds
   */
  moveCloud(dtSec) {
    this.x -= this.speed * dtSec;
  }

  /**
   * Loops the cloud to the right if it leaves the screen.
   * @param {object} world - World object
   */
  handleCloudLoop(world) {
    if (this.x + this.w < 0) {
      this.x = world.levelW + Math.random() * 600;
    }
  }

  /**
   * Draws the cloud on the canvas.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    if (this.img.complete && this.img.naturalWidth > 0) {
      ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
      return;
    }

    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fillRect(this.x, this.y, this.w, this.h * 0.4);
  }
}

/**
 * Expose Cloud class to the global window object.
 * @global
 * @class Cloud
 */
window.Cloud = Cloud;
