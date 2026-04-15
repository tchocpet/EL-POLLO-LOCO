/**
 * Initializes the ground bottle module and registers its public API.
 */
function initGroundBottleModule() {
  registerGroundBottleApi();
}

/**
 * Registers the GroundBottle class on the global window object.
 */
function registerGroundBottleApi() {
  window.GroundBottle = createGroundBottleClass();
}

/**
 * Creates the GroundBottle class.
 *
 * @returns {typeof GroundBottle}
 */
function createGroundBottleClass() {
  return class GroundBottle {
    /**
     * Creates a new ground bottle instance.
     *
     * @param {number} x - Start x position.
     * @param {number} y - Start y position.
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
      loadGroundBottleImages(this);
      this.offset = {
        top: 10,
        right: 8,
        bottom: 6,
        left: 8,
      };
    }

    /**
     * Updates the ground bottle animation for one frame.
     *
     * @param {number} dtMs - Delta time in milliseconds.
     */
    update(dtMs) {
      if (this.collected) return;
      updateGroundBottleAnimation(this, dtMs);
    }

    /**
     * Draws the ground bottle.
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context.
     */
    draw(ctx) {
      const image = this.images[this.frame];
      if (isGroundBottleImageDrawable(image)) {
        ctx.drawImage(image, this.x, this.y, this.w, this.h);
        return;
      }
      drawGroundBottleFallback(this, ctx);
    }
  };
}

/**
 * Loads all ground bottle images.
 *
 * @param {object} bottle - Ground bottle instance.
 */
function loadGroundBottleImages(bottle) {
  getGroundBottlePaths().forEach((src) =>
    pushGroundBottleImage(bottle.images, src),
  );
}

/**
 * Pushes one ground bottle image into the image list.
 *
 * @param {HTMLImageElement[]} list - Target image list.
 * @param {string} src - Image source path.
 */
function pushGroundBottleImage(list, src) {
  const image = new Image();
  image.src = src;
  list.push(image);
}

/**
 * Returns ground bottle image paths.
 *
 * @returns {string[]}
 */
function getGroundBottlePaths() {
  return [
    "img/6_salsa_bottle/1_salsa_bottle_on_ground.png",
    "img/6_salsa_bottle/2_salsa_bottle_on_ground.png",
  ];
}

/**
 * Updates the ground bottle animation state.
 *
 * @param {object} bottle - Ground bottle instance.
 * @param {number} dtMs - Delta time in milliseconds.
 */
function updateGroundBottleAnimation(bottle, dtMs) {
  bottle.animT += dtMs;
  if (bottle.animT <= 260) return;
  bottle.animT = 0;
  bottle.frame = bottle.frame === 0 ? 1 : 0;
}

/**
 * Returns whether a ground bottle image is drawable.
 *
 * @param {HTMLImageElement|null} image - Ground bottle image.
 * @returns {boolean}
 */
function isGroundBottleImageDrawable(image) {
  return !!image && image.complete && image.naturalWidth > 0;
}

/**
 * Draws the fallback ground bottle.
 *
 * @param {object} bottle - Ground bottle instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
function drawGroundBottleFallback(bottle, ctx) {
  ctx.fillStyle = "#27ae60";
  ctx.fillRect(bottle.x, bottle.y, bottle.w, bottle.h);
}
