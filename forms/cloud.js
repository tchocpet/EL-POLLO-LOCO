/**
 * Initializes the cloud module and registers its public API.
 */
function initCloudModule() {
  registerCloudApi();
}

/**
 * Registers the Cloud class on the global window object.
 */
function registerCloudApi() {
  window.Cloud = createCloudClass();
}

/**
 * Creates the Cloud class.
 *
 * @returns {typeof Cloud}
 */
function createCloudClass() {
  return class Cloud {
    /**
     * Creates a new cloud instance.
     *
     * @param {number} [x=0] - Start x position.
     */
    constructor(x = 0) {
      this.x = x;
      this.y = 40;
      this.w = 500;
      this.h = 250;
      this.speed = 18;
      this.img = createCloudImage();
    }

    /**
     * Updates the cloud position for one frame.
     *
     * @param {number} dtSec - Delta time in seconds.
     * @param {object} world - World state.
     */
    update(dtSec, world) {
      moveCloud(this, dtSec);
      loopCloudIfNeeded(this, world);
    }

    /**
     * Draws the cloud.
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context.
     */
    draw(ctx) {
      if (isCloudImageDrawable(this.img)) {
        ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
        return;
      }
      drawCloudFallback(this, ctx);
    }
  };
}

/**
 * Creates the cloud image.
 *
 * @returns {HTMLImageElement}
 */
function createCloudImage() {
  const image = new Image();
  image.src = "img/5_background/layers/4_clouds/1.png";
  return image;
}

/**
 * Moves the cloud horizontally.
 *
 * @param {object} cloud - Cloud instance.
 * @param {number} dtSec - Delta time in seconds.
 */
function moveCloud(cloud, dtSec) {
  cloud.x -= cloud.speed * dtSec;
}

/**
 * Loops the cloud back to the right side if needed.
 *
 * @param {object} cloud - Cloud instance.
 * @param {object} world - World state.
 */
function loopCloudIfNeeded(cloud, world) {
  if (cloud.x + cloud.w >= 0) return;
  cloud.x = world.levelW + Math.random() * 600;
}

/**
 * Returns whether the cloud image is drawable.
 *
 * @param {HTMLImageElement|null} image - Cloud image.
 * @returns {boolean}
 */
function isCloudImageDrawable(image) {
  return !!image && image.complete && image.naturalWidth > 0;
}

/**
 * Draws a fallback cloud shape.
 *
 * @param {object} cloud - Cloud instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
function drawCloudFallback(cloud, ctx) {
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillRect(cloud.x, cloud.y, cloud.w, cloud.h * 0.4);
}
