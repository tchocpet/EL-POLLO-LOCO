/**
 * Initializes the bottle module and registers its public API.
 */
function initBottleModule() {
  registerBottleApi();
}

/**
 * Registers the Bottle class on the global window object.
 */
function registerBottleApi() {
  window.Bottle = createBottleClass();
}

/**
 * Creates the Bottle class.
 *
 * @returns {typeof Bottle}
 */
function createBottleClass() {
  return class Bottle {
    /**
     * Creates a new bottle projectile.
     *
     * @param {number} x - Start x position.
     * @param {number} y - Start y position.
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
      loadBottleImages(this);
    }

    /**
     * Updates the bottle state for one frame.
     *
     * @param {number} dtSec - Delta time in seconds.
     * @param {object} world - World state.
     */
    update(dtSec, world) {
      if (this.dead) return;
      if (this.splashing) return updateBottleSplash(this, dtSec);
      updateBottlePhysics(this, dtSec);
      updateBottleRotation(this, dtSec);
      if (checkBottleGroundCollision(this, world)) return;
      checkBottleWorldBounds(this, world);
    }

    /**
     * Starts the splash animation.
     *
     * @param {number} splashY - Splash y position.
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
     * Draws the bottle.
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context.
     */
    draw(ctx) {
      if (this.dead) return;
      if (this.splashing) return drawBottleSplash(this, ctx);
      drawBottleRotation(this, ctx);
    }
  };
}

/**
 * Loads all bottle images.
 *
 * @param {object} bottle - Bottle instance.
 */
function loadBottleImages(bottle) {
  loadBottleRotationImages(bottle);
  loadBottleSplashImages(bottle);
}

/**
 * Loads rotation images.
 *
 * @param {object} bottle - Bottle instance.
 */
function loadBottleRotationImages(bottle) {
  getBottleRotationPaths().forEach((src) =>
    pushBottleImage(bottle.rotationImages, src),
  );
}

/**
 * Loads splash images.
 *
 * @param {object} bottle - Bottle instance.
 */
function loadBottleSplashImages(bottle) {
  getBottleSplashPaths().forEach((src) =>
    pushBottleImage(bottle.splashImages, src),
  );
}

/**
 * Pushes one image into an image list.
 *
 * @param {HTMLImageElement[]} list - Target image list.
 * @param {string} src - Image source path.
 */
function pushBottleImage(list, src) {
  const image = new Image();
  image.src = src;
  list.push(image);
}

/**
 * Returns rotation image paths.
 *
 * @returns {string[]}
 */
function getBottleRotationPaths() {
  return [
    "img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png",
    "img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png",
    "img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png",
    "img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png",
  ];
}

/**
 * Returns splash image paths.
 *
 * @returns {string[]}
 */
function getBottleSplashPaths() {
  return [
    "img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png",
    "img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png",
    "img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png",
    "img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png",
    "img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png",
    "img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png",
  ];
}

/**
 * Updates bottle physics.
 *
 * @param {object} bottle - Bottle instance.
 * @param {number} dtSec - Delta time in seconds.
 */
function updateBottlePhysics(bottle, dtSec) {
  bottle.vy += bottle.gravity * dtSec;
  bottle.x += bottle.vx * dtSec;
  bottle.y += bottle.vy * dtSec;
}

/**
 * Updates bottle rotation animation.
 *
 * @param {object} bottle - Bottle instance.
 * @param {number} dtSec - Delta time in seconds.
 */
function updateBottleRotation(bottle, dtSec) {
  bottle.animT += dtSec;
  if (bottle.animT < 0.08) return;
  bottle.animT = 0;
  bottle.frame = (bottle.frame + 1) % bottle.rotationImages.length;
}

/**
 * Checks whether the bottle hits the ground.
 *
 * @param {object} bottle - Bottle instance.
 * @param {object} world - World state.
 * @returns {boolean}
 */
function checkBottleGroundCollision(bottle, world) {
  if (bottle.y + bottle.h < world.groundY) return false;
  bottle.startSplash(world.groundY - bottle.h + 10);
  return true;
}

/**
 * Updates bottle splash animation.
 *
 * @param {object} bottle - Bottle instance.
 * @param {number} dtSec - Delta time in seconds.
 */
function updateBottleSplash(bottle, dtSec) {
  bottle.splashTime += dtSec;
  bottle.animT += dtSec;
  if (bottle.animT >= 0.06) advanceBottleSplashFrame(bottle);
  if (isBottleSplashFinished(bottle)) bottle.dead = true;
}

/**
 * Advances the splash frame.
 *
 * @param {object} bottle - Bottle instance.
 */
function advanceBottleSplashFrame(bottle) {
  bottle.animT = 0;
  bottle.frame += 1;
}

/**
 * Returns whether splash animation is finished.
 *
 * @param {object} bottle - Bottle instance.
 * @returns {boolean}
 */
function isBottleSplashFinished(bottle) {
  if (bottle.frame >= bottle.splashImages.length) return true;
  return bottle.splashTime > 0.4;
}

/**
 * Checks world bounds for the bottle.
 *
 * @param {object} bottle - Bottle instance.
 * @param {object} world - World state.
 */
function checkBottleWorldBounds(bottle, world) {
  if (bottle.x < -100) return markBottleDead(bottle);
  if (bottle.x > world.levelW + 100) return markBottleDead(bottle);
  if (bottle.y > world.h + 220) return markBottleDead(bottle);
}

/**
 * Marks the bottle as dead.
 *
 * @param {object} bottle - Bottle instance.
 */
function markBottleDead(bottle) {
  bottle.dead = true;
}

/**
 * Draws the rotating bottle.
 *
 * @param {object} bottle - Bottle instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
function drawBottleRotation(bottle, ctx) {
  const image = bottle.rotationImages[bottle.frame];
  if (!isBottleImageDrawable(image)) return;
  if (bottle.direction < 0) return drawFlippedBottle(bottle, ctx, image);
  ctx.drawImage(image, bottle.x, bottle.y, bottle.w, bottle.h);
}

/**
 * Draws the flipped bottle image.
 *
 * @param {object} bottle - Bottle instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {HTMLImageElement} image - Bottle image.
 */
function drawFlippedBottle(bottle, ctx, image) {
  ctx.save();
  ctx.translate(bottle.x + bottle.w, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(image, 0, bottle.y, bottle.w, bottle.h);
  ctx.restore();
}

/**
 * Draws the splash animation.
 *
 * @param {object} bottle - Bottle instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
function drawBottleSplash(bottle, ctx) {
  const index = Math.min(bottle.frame, bottle.splashImages.length - 1);
  const image = bottle.splashImages[index];
  if (!isBottleImageDrawable(image)) return;
  ctx.drawImage(
    image,
    bottle.x - 10,
    bottle.y - 10,
    bottle.w + 25,
    bottle.h + 20,
  );
}

/**
 * Returns whether a bottle image is drawable.
 *
 * @param {HTMLImageElement|null} image - Bottle image.
 * @returns {boolean}
 */
function isBottleImageDrawable(image) {
  return !!image && image.complete && image.naturalWidth > 0;
}
