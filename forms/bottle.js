"use strict";

/**
 * Thrown bottle projectile.
 */
class Bottle {
  /**
   * Creates a new bottle.
   * @param {number} x - Start position X.
   * @param {number} y - Start position Y.
   * @param {number} direction - Throw direction.
   */
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;

    this.w = 55;
    this.h = 65;

    this.vx = direction * 420;
    this.vy = -180;
    this.gravity = 700;

    this.dead = false;
    this.splashing = false;
    this.splashTime = 0;
    this.frame = 0;
    this.animT = 0;
    this.direction = direction;

    this.rotationImages = [];
    this.splashImages = [];
    this.loadImages();
  }

  /**
   * Loads all bottle images.
   */
  loadImages() {
    const rotationPaths = [
      "img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png",
      "img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png",
      "img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png",
      "img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png",
    ];

    const splashPaths = [
      "img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png",
      "img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png",
      "img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png",
      "img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png",
      "img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png",
      "img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png",
    ];

    rotationPaths.forEach((src) => {
      const img = new Image();
      img.src = src;
      this.rotationImages.push(img);
    });

    splashPaths.forEach((src) => {
      const img = new Image();
      img.src = src;
      this.splashImages.push(img);
    });
  }

  /**
   * Updates the bottle state each frame.
   * @param {number} dtSec - Delta time in seconds.
   * @param {object} world - World object.
   */
  update(dtSec, world) {
    if (this.dead) return;

    if (this.splashing) {
      this.updateSplash(dtSec);
      return;
    }

    this.updatePhysics(dtSec);
    this.updateRotationAnimation(dtSec);

    if (this.checkGroundCollision(world)) {
      return;
    }

    this.checkWorldBounds(world);
  }

  /**
   * Updates bottle physics.
   * @param {number} dtSec - Delta time in seconds.
   */
  updatePhysics(dtSec) {
    this.vy += this.gravity * dtSec;
    this.x += this.vx * dtSec;
    this.y += this.vy * dtSec;
  }

  /**
   * Updates the bottle rotation animation.
   * @param {number} dtSec - Delta time in seconds.
   */
  updateRotationAnimation(dtSec) {
    this.animT += dtSec;

    if (this.animT >= 0.08) {
      this.animT = 0;
      this.frame = (this.frame + 1) % this.rotationImages.length;
    }
  }

  /**
   * Checks if the bottle hits the ground.
   * @param {object} world - World object.
   * @returns {boolean} True if splash started.
   */
  checkGroundCollision(world) {
    if (this.y + this.h >= world.groundY) {
      this.startSplash(world.groundY - this.h + 10);
      return true;
    }

    return false;
  }

  /**
   * Starts the splash animation.
   * @param {number} splashY - Splash Y position.
   */
  startSplash(splashY) {
    this.splashing = true;
    this.splashTime = 0;
    this.vx = 0;
    this.vy = 0;
    this.y = splashY;
    this.frame = 0;
    this.animT = 0;
  }

  /**
   * Updates the splash animation.
   * @param {number} dtSec - Delta time in seconds.
   */
  updateSplash(dtSec) {
    this.splashTime += dtSec;
    this.animT += dtSec;

    if (this.animT >= 0.06) {
      this.animT = 0;
      this.frame += 1;
    }

    if (this.frame >= this.splashImages.length || this.splashTime > 0.4) {
      this.dead = true;
    }
  }

  /**
   * Checks whether the bottle leaves the world bounds.
   * @param {object} world - World object.
   */
  checkWorldBounds(world) {
    if (
      this.x < -100 ||
      this.x > world.levelW + 100 ||
      this.y > world.h + 220
    ) {
      this.dead = true;
    }
  }

  /**
   * Draws the bottle (rotation or splash animation).
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   */
  draw(ctx) {
    if (this.dead) return;

    if (this.splashing) {
      this.drawSplash(ctx);
      return;
    }

    this.drawRotation(ctx);
  }

  /**
   * Draws the rotating bottle.
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   */
  drawRotation(ctx) {
    const img = this.rotationImages[this.frame];

    if (!img || !img.complete || img.naturalWidth === 0) {
      return;
    }

    ctx.save();

    if (this.direction < 0) {
      ctx.translate(this.x + this.w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, this.y, this.w, this.h);
    } else {
      ctx.drawImage(img, this.x, this.y, this.w, this.h);
    }

    ctx.restore();
  }

  /**
   * Draws the splash animation.
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   */
  drawSplash(ctx) {
    const splashIndex = Math.min(this.frame, this.splashImages.length - 1);
    const img = this.splashImages[splashIndex];

    if (!img || !img.complete || img.naturalWidth === 0) {
      return;
    }

    ctx.drawImage(img, this.x - 10, this.y - 10, this.w + 25, this.h + 20);
  }
}

/**
 * Expose Bottle class to the global window object.
 * @global
 * @class Bottle
 */
window.Bottle = Bottle;
