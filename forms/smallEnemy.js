/**
 * Initializes the small enemy module and registers its public API.
 */
function initSmallEnemyModule() {
  registerSmallEnemyApi();
}

/**
 * Registers the SmallEnemy class on the global window object.
 */
function registerSmallEnemyApi() {
  window.SmallEnemy = createSmallEnemyClass();
}

/**
 * Creates the SmallEnemy class.
 *
 * @returns {typeof SmallEnemy}
 */
function createSmallEnemyClass() {
  return class SmallEnemy {
    /**
     * Creates a new small enemy instance.
     *
     * @param {number} x - Start x position.
     * @param {number} y - Start y position.
     */
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.w = 42;
      this.h = 42;
      this.vx = -130;
      this.dead = false;
      this.removable = false;
      this.frame = 0;
      this.animTime = 0;
      this.deadTime = 0;
      this.walkImages = [];
      this.deadImage = null;
      loadSmallEnemyImages(this);
    }

    /**
     * Updates the small enemy state for one frame.
     *
     * @param {number} dtMs - Delta time in milliseconds.
     * @param {number} dtSec - Delta time in seconds.
     * @param {object} world - World state.
     */
    update(dtMs, dtSec, world) {
      if (this.dead) return updateDeadSmallEnemy(this, dtMs, dtSec);
      moveSmallEnemy(this, dtSec, world);
      animateSmallEnemy(this, dtMs);
    }

    /**
     * Marks the small enemy as dead.
     */
    die() {
      if (this.dead) return;
      this.dead = true;
      this.vx = 0;
      this.deadTime = 0;
    }

    /**
     * Draws the small enemy.
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context.
     */
    draw(ctx) {
      if (this.dead) return drawDeadSmallEnemy(this, ctx);
      const image = this.walkImages[this.frame];
      if (isSmallEnemyImageDrawable(image)) {
        ctx.drawImage(image, this.x, this.y, this.w, this.h);
        return;
      }
      drawSmallEnemyFallback(this, ctx);
    }
  };
}

/**
 * Loads all small enemy images.
 *
 * @param {object} enemy - Small enemy instance.
 */
function loadSmallEnemyImages(enemy) {
  loadSmallEnemyWalkImages(enemy);
  loadSmallEnemyDeadImage(enemy);
}

/**
 * Loads all walk images.
 *
 * @param {object} enemy - Small enemy instance.
 */
function loadSmallEnemyWalkImages(enemy) {
  getSmallEnemyWalkPaths().forEach((src) =>
    pushSmallEnemyImage(enemy.walkImages, src),
  );
}

/**
 * Loads the dead image.
 *
 * @param {object} enemy - Small enemy instance.
 */
function loadSmallEnemyDeadImage(enemy) {
  enemy.deadImage = new Image();
  enemy.deadImage.src = "img/3_enemies_chicken/chicken_small/2_dead/dead.png";
}

/**
 * Pushes one image into the walk image list.
 *
 * @param {HTMLImageElement[]} list - Target image list.
 * @param {string} src - Image source path.
 */
function pushSmallEnemyImage(list, src) {
  const image = new Image();
  image.src = src;
  list.push(image);
}

/**
 * Returns small enemy walk image paths.
 *
 * @returns {string[]}
 */
function getSmallEnemyWalkPaths() {
  return [
    "img/3_enemies_chicken/chicken_small/1_walk/1_w.png",
    "img/3_enemies_chicken/chicken_small/1_walk/2_w.png",
    "img/3_enemies_chicken/chicken_small/1_walk/3_w.png",
  ];
}

/**
 * Updates the dead small enemy state.
 *
 * @param {object} enemy - Small enemy instance.
 * @param {number} dtMs - Delta time in milliseconds.
 * @param {number} dtSec - Delta time in seconds.
 */
function updateDeadSmallEnemy(enemy, dtMs, dtSec) {
  enemy.deadTime += dtMs;
  enemy.y += 160 * dtSec;
  if (enemy.deadTime > 650) enemy.removable = true;
}

/**
 * Moves the small enemy horizontally.
 *
 * @param {object} enemy - Small enemy instance.
 * @param {number} dtSec - Delta time in seconds.
 * @param {object} world - World state.
 */
function moveSmallEnemy(enemy, dtSec, world) {
  enemy.x += enemy.vx * dtSec;
  handleSmallEnemyLeftTurn(enemy);
  handleSmallEnemyRightTurn(enemy, world);
}

/**
 * Handles the left turn boundary.
 *
 * @param {object} enemy - Small enemy instance.
 */
function handleSmallEnemyLeftTurn(enemy) {
  if (enemy.x >= 200) return;
  enemy.vx = 130;
}

/**
 * Handles the right turn boundary.
 *
 * @param {object} enemy - Small enemy instance.
 * @param {object} world - World state.
 */
function handleSmallEnemyRightTurn(enemy, world) {
  if (enemy.x <= world.levelW - 200) return;
  enemy.vx = -130;
}

/**
 * Updates the walk animation.
 *
 * @param {object} enemy - Small enemy instance.
 * @param {number} dtMs - Delta time in milliseconds.
 */
function animateSmallEnemy(enemy, dtMs) {
  enemy.animTime += dtMs;
  if (enemy.animTime < 120) return;
  enemy.animTime = 0;
  enemy.frame = (enemy.frame + 1) % enemy.walkImages.length;
}

/**
 * Returns whether a small enemy image is drawable.
 *
 * @param {HTMLImageElement|null} image - Small enemy image.
 * @returns {boolean}
 */
function isSmallEnemyImageDrawable(image) {
  return !!image && image.complete && image.naturalWidth > 0;
}

/**
 * Draws the dead small enemy image or fallback.
 *
 * @param {object} enemy - Small enemy instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
function drawDeadSmallEnemy(enemy, ctx) {
  if (isSmallEnemyImageDrawable(enemy.deadImage)) {
    ctx.drawImage(enemy.deadImage, enemy.x, enemy.y, enemy.w, enemy.h);
    return;
  }
  drawDeadSmallEnemyFallback(enemy, ctx);
}

/**
 * Draws the alive fallback small enemy.
 *
 * @param {object} enemy - Small enemy instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
function drawSmallEnemyFallback(enemy, ctx) {
  ctx.fillStyle = "#f39c12";
  ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
}

/**
 * Draws the dead fallback small enemy.
 *
 * @param {object} enemy - Small enemy instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
function drawDeadSmallEnemyFallback(enemy, ctx) {
  ctx.fillStyle = "#999";
  ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
}
