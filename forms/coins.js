/**
 * Initializes the coin module and registers its public API.
 */
function initCoinModule() {
  registerCoinApi();
}

/**
 * Registers the Coin class on the global window object.
 */
function registerCoinApi() {
  window.Coin = createCoinClass();
}

/**
 * Creates the Coin class.
 *
 * @returns {typeof Coin}
 */
function createCoinClass() {
  return class Coin {
    /**
     * Creates a new coin instance.
     *
     * @param {number} x - Start x position.
     * @param {number} y - Start y position.
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
     * Updates the coin animation for one frame.
     *
     * @param {number} dtMs - Delta time in milliseconds.
     */
    update(dtMs) {
      if (this.collected) return;
      updateCoinAnimation(this, dtMs);
    }

    /**
     * Draws the coin.
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context.
     */
    draw(ctx) {
      const size = getCoinSize(this);
      const offset = getCoinShineOffset(this);
      drawCoinBody(this, ctx, size);
      drawCoinStroke(ctx);
      drawCoinShine(this, ctx, offset);
    }
  };
}

/**
 * Updates the coin animation state.
 *
 * @param {object} coin - Coin instance.
 * @param {number} dtMs - Delta time in milliseconds.
 */
function updateCoinAnimation(coin, dtMs) {
  coin.animT += dtMs;
  if (coin.animT <= 220) return;
  coin.animT = 0;
  coin.frame = coin.frame === 0 ? 1 : 0;
}

/**
 * Returns the current coin size.
 *
 * @param {object} coin - Coin instance.
 * @returns {number}
 */
function getCoinSize(coin) {
  return coin.frame === 0 ? 26 : 22;
}

/**
 * Returns the current shine offset.
 *
 * @param {object} coin - Coin instance.
 * @returns {number}
 */
function getCoinShineOffset(coin) {
  return coin.frame === 0 ? 0 : 2;
}

/**
 * Draws the main coin body.
 *
 * @param {object} coin - Coin instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {number} size - Coin diameter.
 */
function drawCoinBody(coin, ctx, size) {
  ctx.fillStyle = "#f1c40f";
  ctx.beginPath();
  ctx.arc(coin.x + 13, coin.y + 13, size / 2, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draws the coin border.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
function drawCoinStroke(ctx) {
  ctx.strokeStyle = "#d4ac0d";
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * Draws the shiny highlight on the coin.
 *
 * @param {object} coin - Coin instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {number} offset - Shine x offset.
 */
function drawCoinShine(coin, ctx, offset) {
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(coin.x + 6 + offset, coin.y + 6, 6, 3);
}
