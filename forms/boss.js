"use strict";

/**
 * Endboss (final boss enemy).
 */
class Boss {
  /**
   * Creates a new Boss instance.
   * @param {number} x - Start position X
   * @param {number} y - Start position Y
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

    this.offset = {
      top: 70,
      left: 40,
      right: 40,
      bottom: 25,
    };

    this.walkImages = [];
    this.hurtImages = [];
    this.deadImages = [];
    this.loadImages();
  }

  /**
   * Loads all boss images (walk, hurt, dead).
   */
  loadImages() {
    const walkPaths = [
      "img/4_enemie_boss_chicken/1_walk/G1.png",
      "img/4_enemie_boss_chicken/1_walk/G2.png",
      "img/4_enemie_boss_chicken/1_walk/G3.png",
      "img/4_enemie_boss_chicken/1_walk/G4.png",
    ];

    const hurtPaths = [
      "img/4_enemie_boss_chicken/4_hurt/G21.png",
      "img/4_enemie_boss_chicken/4_hurt/G22.png",
      "img/4_enemie_boss_chicken/4_hurt/G23.png",
    ];

    const deadPaths = [
      "img/4_enemie_boss_chicken/5_dead/G24.png",
      "img/4_enemie_boss_chicken/5_dead/G25.png",
      "img/4_enemie_boss_chicken/5_dead/G26.png",
    ];

    walkPaths.forEach((src) => {
      const img = new Image();
      img.src = src;
      this.walkImages.push(img);
    });

    hurtPaths.forEach((src) => {
      const img = new Image();
      img.src = src;
      this.hurtImages.push(img);
    });

    deadPaths.forEach((src) => {
      const img = new Image();
      img.src = src;
      this.deadImages.push(img);
    });
  }

  /**
   * Updates the boss state.
   * @param {number} dtMs - Delta in milliseconds
   * @param {number} dtSec - Delta in seconds
   * @param {object} world - World object
   * @param {object} player - Player object
   * @param {number} health - Boss health
   */

  /**
   * Updates the boss state each frame.
   * @param {number} dtMs - Delta in milliseconds
   * @param {number} dtSec - Delta in seconds
   * @param {object} world - World object
   * @param {object} player - Player object
   * @param {number} health - Boss health
   */
  update(dtMs, dtSec, world, player, health) {
    if (this.isDeadState(dtMs, dtSec)) return;
    this.updateAliveState(dtSec, health, player, world, dtMs);
  }

  /**
   * Checks if boss is dead and updates dead state.
   * @param {number} dtMs - Delta in milliseconds
   * @param {number} dtSec - Delta in seconds
   * @returns {boolean} True if boss is dead
   */
  isDeadState(dtMs, dtSec) {
    if (this.dead) {
      this.updateDead(dtMs, dtSec);
      return true;
    }
    return false;
  }

  /**
   * Updates boss state when alive.
   * @param {number} dtSec - Delta in seconds
   * @param {number} health - Boss health
   * @param {object} player - Player object
   * @param {object} world - World object
   * @param {number} dtMs - Delta in milliseconds
   */
  updateAliveState(dtSec, health, player, world, dtMs) {
    this.updateState(dtSec, health);
    const distanceToPlayer = this.getDistanceToPlayer(player);
    this.checkActivation(distanceToPlayer);
    if (!this.active) return;
    this.handleActiveState(distanceToPlayer, dtSec, world, player, dtMs);
  }

  /**
   * Calculates the distance to the player.
   * @param {object} player - Player object
   * @returns {number} Distance to player
   */
  getDistanceToPlayer(player) {
    return this.x - player.x;
  }

  updateState(dtSec, health) {
    this.updateHurt(dtSec);
    this.updatePhase(health);
    this.updateAttackTimers(dtSec);
  }

  checkActivation(distanceToPlayer) {
    if (Math.abs(distanceToPlayer) < 750) {
      this.active = true;
    }
  }

  handleActiveState(distanceToPlayer, dtSec, world, player, dtMs) {
    this.tryStartRush(distanceToPlayer);
    this.move(dtSec, world, player);
    this.animate(dtMs);
  }

  /**
   * Updates the hurt timer and state.
   * @param {number} dtSec - Delta in seconds
   */
  updateHurt(dtSec) {
    if (this.hurtTime > 0) {
      this.hurtTime -= dtSec;
    }

    if (this.hurtTime <= 0) {
      this.hurt = false;
      this.hurtTime = 0;
    }
  }

  /**
   * Updates the dead state and removal timer.
   * @param {number} dtMs - Delta in milliseconds
   * @param {number} dtSec - Delta in seconds
   */
  updateDead(dtMs, dtSec) {
    this.deadTime += dtMs;
    this.y += 90 * dtSec;

    if (this.deadTime > 1400) {
      this.removable = true;
    }
  }

  /**
   * Boss takes damage.
   */
  takeHit() {
    if (this.dead) return;

    this.hurt = true;
    this.hurtTime = 0.35;
  }

  /**
   * Kills the boss and sets its state to dead.
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
   * Updates the boss phase depending on health.
   * @param {number} health - Boss health
   */
  updatePhase(health) {
    this.phaseTwo = health <= 50;
  }

  /**
   * Updates the attack and rush timers.
   * @param {number} dtSec - Delta time in seconds
   */
  updateAttackTimers(dtSec) {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dtSec;
    }

    if (this.rushTime > 0) {
      this.rushTime -= dtSec;
    }

    if (this.rushTime <= 0) {
      this.isRushing = false;
    }
  }

  /**
   * Starts a rush attack if conditions are met.
   * @param {number} distanceToPlayer - Distance to the player
   */
  tryStartRush(distanceToPlayer) {
    if (!this.phaseTwo) {
      return;
    }

    if (this.attackCooldown > 0 || this.isRushing) {
      return;
    }

    if (Math.abs(distanceToPlayer) > 280) {
      return;
    }

    this.isRushing = true;
    this.rushTime = 0.85;
    this.attackCooldown = 2.2;
  }

  /**
   * Moves the boss towards the player and clamps position within world bounds.
   * Splits logic into helpers for speed, proximity, direction, and clamping.
   * @param {number} dtSec - Delta in seconds
   * @param {object} world - World object
   * @param {object} player - Player object
   */
  move(dtSec, world, player) {
    const speed = this.getMoveSpeed();
    const leftLimit = 0;
    const rightLimit = world.levelW - this.w;
    const distanceX = player.x - this.x;
    const closeToPlayer = this.isCloseToPlayer(distanceX);
    if (!closeToPlayer) {
      this.updateDirectionAndPosition(distanceX, speed, dtSec);
    } else {
      this.vx = 0;
    }
    this.clampPosition(leftLimit, rightLimit);
  }

  /**
   * Returns the current move speed depending on boss state.
   * @returns {number} Move speed
   */
  getMoveSpeed() {
    if (this.isRushing) return 255;
    if (this.phaseTwo) return 155;
    return 100;
  }

  /**
   * Checks if boss is close to the player.
   * @param {number} distanceX - Distance to player
   * @returns {boolean} True if close
   */
  isCloseToPlayer(distanceX) {
    return Math.abs(distanceX) < 20;
  }

  /**
   * Updates direction and position of the boss.
   * @param {number} distanceX - Distance to player
   * @param {number} speed - Move speed
   * @param {number} dtSec - Delta time in seconds
   */
  updateDirectionAndPosition(distanceX, speed, dtSec) {
    this.vx = distanceX < 0 ? -speed : speed;
    this.facing = this.vx < 0 ? -1 : 1;
    this.x += this.vx * dtSec;
  }

  /**
   * Clamps boss position within world bounds.
   * @param {number} leftLimit - Left boundary
   * @param {number} rightLimit - Right boundary
   */
  clampPosition(leftLimit, rightLimit) {
    if (this.x < leftLimit) this.x = leftLimit;
    if (this.x > rightLimit) this.x = rightLimit;
  }

  /**
   * Updates boss animation.
   * @param {number} dtMs - Delta in milliseconds
   */
  animate(dtMs) {
    const limit = this.isRushing ? 90 : this.phaseTwo ? 120 : 180;

    this.animT += dtMs;

    if (this.animT < limit) {
      return;
    }

    this.animT = 0;

    const maxFrames = this.hurt
      ? this.hurtImages.length
      : this.walkImages.length;
    this.frame = (this.frame + 1) % Math.max(1, maxFrames);
  }

  /**
   * Zeichnet den Boss.
   * @param {CanvasRenderingContext2D} ctx - Canvas Kontext
   */
  draw(ctx) {
    const img = this.getCurrentImage();

    if (!img || !img.complete || img.naturalWidth === 0) {
      ctx.fillStyle = "#c0392b";
      ctx.fillRect(this.x, this.y, this.w, this.h);
      return;
    }

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
   * Gibt aktuelles Boss-Bild zurück.
   * @returns {HTMLImageElement|null}
   */
  getCurrentImage() {
    if (this.dead) {
      return (
        this.deadImages[
          Math.min(this.deadImages.length - 1, Math.floor(this.deadTime / 180))
        ] || null
      );
    }

    if (this.hurt) {
      return this.hurtImages[this.frame % this.hurtImages.length] || null;
    }

    return this.walkImages[this.frame % this.walkImages.length] || null;
  }
}

/**
 * Expose Boss class to the global window object.
 * @global
 * @class Boss
 */
window.Boss = Boss;
