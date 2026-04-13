"use strict";

/**
 * Collectible coin object.
 */
class Coin {
  /**
   * Creates a new coin instance.
   * @param {number} x - Start position X
   * @param {number} y - Start position Y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.w = 26;
    this.h = 26;

    this.collected = false;
    this.frame = 0;
    this.animT = 0;
  }

  /**
   * Updates the coin animation state.
   * @param {number} dtMs - Delta time in milliseconds
   */
  update(dtMs) {
    if (this.collected) {
      return;
    }

    this.animT += dtMs;

    if (this.animT > 220) {
      this.animT = 0;
      this.frame = this.frame === 0 ? 1 : 0;
    }
  }

  /**
   * Draws the coin on the canvas (main entry point).
   * Splits logic into helpers for body, border, and shine.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    const size = this.frame === 0 ? 26 : 22;
    const offset = this.frame === 0 ? 0 : 2;
    this.drawCoinBody(ctx, size);
    this.drawCoinStroke(ctx);
    this.drawCoinShine(ctx, offset);
  }

  /**
   * Draws the main body of the coin.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} size - Diameter of the coin
   */
  drawCoinBody(ctx, size) {
    ctx.fillStyle = "#f1c40f";
    ctx.beginPath();
    ctx.arc(this.x + 13, this.y + 13, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draws the coin's border.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawCoinStroke(ctx) {
    ctx.strokeStyle = "#d4ac0d";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /**
   * Draws the shiny highlight on the coin.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} offset - X offset for shine
   */
  drawCoinShine(ctx, offset) {
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(this.x + 6 + offset, this.y + 6, 6, 3);
  }
}

/**
 * Expose Coin class to the global window object.
 * @global
 * @class Coin
 */
window.Coin = Coin;
