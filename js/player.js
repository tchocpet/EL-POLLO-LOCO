"use strict";


/**
 * Represents the player character.
 */
class Player extends window.BaseEntity {
  /**
   * Creates a new Player instance.
   * @param {number} [x=140] - Initial X position
   * @param {number} [y=140] - Initial Y position
   */
  constructor(x = 140, y = 140) {
    super(x, y, 50, 70);
    this.speed = 300;
    this.jumpPower = 500;
    this.gravity = 1350;
    this.grounded = false;
  }


  /**
   * Updates the player state for the current frame.
   * @param {number} dt - Delta time in seconds
   * @param {object} input - Input state
   * @param {object} world - World object
   */
  update(dt, input, world) {
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    this.vx = dir * this.speed;

    if (input.jump && this.grounded) {
      this.vy = -this.jumpPower;
      this.grounded = false;
    }

    this.vy += this.gravity * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.x = window.Util.clamp(this.x, 0, world.levelW - this.w);

    if (this.y + this.h >= world.groundY) {
      this.y = world.groundY - this.h;
      this.vy = 0;
      this.grounded = true;
    }
  }

  /**
   * Draws the player on the canvas.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} [camX=0] - Camera X offset
   */
  draw(ctx, camX = 0) {
    ctx.fillStyle = "rgba(255,255,255,0.90)";
    ctx.fillRect(this.x - camX, this.y, this.w, this.h);

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(this.x - camX + 8, this.y + 10, 12, 12);
  }
}

window.Player = Player;
