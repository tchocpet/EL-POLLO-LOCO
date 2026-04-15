/**
 * Renders the full game frame.
 *
 * @param {object} App - Main application state.
 * @param {object} ASSETS - Asset storage object.
 */
function renderGameWorld(App, ASSETS) {
  if (!App.ctx) return;
  prepareCanvas(App, ASSETS);
  drawGameWorld(App, ASSETS);
  drawHudAndOverlay(App);
}

/**
 * Prepares the canvas before drawing.
 *
 * @param {object} App - Main application state.
 * @param {object} ASSETS - Asset storage object.
 */
function prepareCanvas(App, ASSETS) {
  disableImageSmoothing(App.ctx);
  App.ctx.clearRect(0, 0, App.world.w, App.world.h);
  drawBackground(App, ASSETS);
}

/**
 * Disables image smoothing on the canvas context.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
function disableImageSmoothing(ctx) {
  ctx.imageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
}

/**
 * Draws the scrolling game world.
 *
 * @param {object} App - Main application state.
 * @param {object} ASSETS - Asset storage object.
 */
function drawGameWorld(App, ASSETS) {
  App.ctx.save();
  App.ctx.translate(-App.world.camX, 0);
  drawSceneLayers(App, ASSETS);
  App.ctx.restore();
}

/**
 * Draws all world layers in the correct order.
 *
 * @param {object} App - Main application state.
 * @param {object} ASSETS - Asset storage object.
 */
function drawSceneLayers(App, ASSETS) {
  drawCloudsScene(App);
  drawGround(App);
  drawShadows(App);
  drawCoinsScene(App);
  drawGroundBottlesScene(App);
  drawPlayer(App, ASSETS);
  drawEnemies(App);
  drawEndboss(App);
  drawProjectiles(App);
}

/**
 * Draws HUD and overlays.
 *
 * @param {object} App - Main application state.
 */
function drawHudAndOverlay(App) {
  drawHUD(App.ctx, App);
  drawBossHealthBar(App.ctx, App);
  drawBossAreaText(App.ctx, App);
  drawBossPhaseText(App.ctx, App);
  drawDamageOverlay(App.ctx, App, nowMs);
  if (App.paused) drawPauseOverlay(App.ctx, App);
}

/**
 * Draws the background image or a fallback sky.
 *
 * @param {object} App - Main application state.
 * @param {object} ASSETS - Asset storage object.
 */
function drawBackground(App, ASSETS) {
  const image = ASSETS.fullBackground;
  if (!hasDrawableImage(image)) {
    drawFallbackSky(App.ctx, App);
    return;
  }
  drawScrollingBackground(App, image);
}

/**
 * Checks whether an image is drawable.
 *
 * @param {HTMLImageElement|null} image - Image element.
 * @returns {boolean}
 */
function hasDrawableImage(image) {
  return !!image && image.complete && image.naturalWidth !== 0;
}

/**
 * Draws a fallback sky background.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {object} App - Main application state.
 */
function drawFallbackSky(ctx, App) {
  ctx.fillStyle = "#87ceeb";
  ctx.fillRect(0, 0, App.world.w, App.world.h);
}

/**
 * Draws the scrolling background image.
 *
 * @param {object} App - Main application state.
 * @param {HTMLImageElement} image - Background image.
 */
function drawScrollingBackground(App, image) {
  const scale = App.world.h / image.height;
  const width = image.width * scale;
  const offset = -(App.world.camX * 0.3) % width;
  App.ctx.drawImage(image, offset, 0, width, App.world.h);
  App.ctx.drawImage(image, offset + width, 0, width, App.world.h);
}

/**
 * Draws all cloud entities.
 *
 * @param {object} App - Main application state.
 */
function drawCloudsScene(App) {
  App.clouds.forEach((cloud) => cloud.draw(App.ctx));
}

/**
 * Draws the ground layers.
 *
 * @param {object} App - Main application state.
 */
function drawGround(App) {
  const y = App.world.groundY;
  drawGroundBase(App.ctx, App, y);
  drawGroundEdge(App.ctx, App, y);
  drawGroundHighlight(App.ctx, App, y);
}

/**
 * Draws the main ground fill.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {object} App - Main application state.
 * @param {number} y - Ground y position.
 */
function drawGroundBase(ctx, App, y) {
  ctx.fillStyle = "rgba(214, 170, 95, 0.55)";
  ctx.fillRect(0, y, App.world.levelW, App.world.h - y);
}

/**
 * Draws the ground top edge.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {object} App - Main application state.
 * @param {number} y - Ground y position.
 */
function drawGroundEdge(ctx, App, y) {
  ctx.fillStyle = "rgba(120, 82, 36, 0.35)";
  ctx.fillRect(0, y, App.world.levelW, 8);
}

/**
 * Draws the ground highlight.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {object} App - Main application state.
 * @param {number} y - Ground y position.
 */
function drawGroundHighlight(ctx, App, y) {
  ctx.fillStyle = "rgba(255, 226, 163, 0.22)";
  ctx.fillRect(0, y + 10, App.world.levelW, 4);
}

/**
 * Draws all visible coin entities.
 *
 * @param {object} App - Main application state.
 */
function drawCoinsScene(App) {
  App.coins.forEach((coin) => {
    if (!coin.collected) coin.draw(App.ctx);
  });
}

/**
 * Draws all visible collectible bottle entities.
 *
 * @param {object} App - Main application state.
 */
function drawGroundBottlesScene(App) {
  App.groundBottles.forEach((bottle) => {
    if (!bottle.collected) bottle.draw(App.ctx);
  });
}

/**
 * Draws all shadow layers.
 *
 * @param {object} App - Main application state.
 */
function drawShadows(App) {
  drawPlayerShadow(App);
  drawEnemyShadows(App);
  drawBossShadow(App);
  drawBottleShadows(App);
  drawCoinShadows(App);
}

/**
 * Draws the player shadow.
 *
 * @param {object} App - Main application state.
 */
function drawPlayerShadow(App) {
  drawEntityShadow(App, App.player, 0.32);
}

/**
 * Draws shadows for all enemies.
 *
 * @param {object} App - Main application state.
 */
function drawEnemyShadows(App) {
  App.enemies.forEach((enemy) => {
    if (!enemy.dead) drawEntityShadow(App, enemy, 0.28);
  });
}

/**
 * Draws the boss shadow.
 *
 * @param {object} App - Main application state.
 */
function drawBossShadow(App) {
  const boss = App.endboss;
  if (boss && !boss.dead) drawEntityShadow(App, boss, 0.42);
}

/**
 * Draws shadows for collectible bottles.
 *
 * @param {object} App - Main application state.
 */
function drawBottleShadows(App) {
  App.groundBottles.forEach((bottle) => {
    if (!bottle.collected) drawEntityShadow(App, bottle, 0.22);
  });
}

/**
 * Draws shadows for coins.
 *
 * @param {object} App - Main application state.
 */
function drawCoinShadows(App) {
  App.coins.forEach((coin) => {
    if (!coin.collected) drawEntityShadow(App, coin, 0.16);
  });
}

/**
 * Draws one entity shadow.
 *
 * @param {object} App - Main application state.
 * @param {{x:number,y:number,w:number,h:number}|null} entity - Entity object.
 * @param {number} scale - Shadow scale.
 */
function drawEntityShadow(App, entity, scale) {
  if (!entity) return;
  const shadow = createShadowData(App, entity, scale);
  paintShadow(App.ctx, shadow);
}

/**
 * Creates shadow data for one entity.
 *
 * @param {object} App - Main application state.
 * @param {{x:number,y:number,w:number,h:number}} entity - Entity object.
 * @param {number} scale - Shadow scale.
 * @returns {{width:number,height:number,x:number,y:number,alpha:number}}
 */
function createShadowData(App, entity, scale) {
  const distance = Math.max(0, App.world.groundY - (entity.y + entity.h));
  const lift = Math.min(1, distance / 180);
  const width = entity.w * (scale - lift * 0.08);
  const height = Math.max(6, entity.h * (0.08 - lift * 0.025));
  const x = entity.x + entity.w / 2 - width / 2;
  const y = App.world.groundY + 6 - lift * 10;
  const alpha = 0.18 - lift * 0.08;
  return { width, height, x, y, alpha };
}

/**
 * Paints one shadow ellipse.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {{width:number,height:number,x:number,y:number,alpha:number}} shadow - Shadow data.
 */
function paintShadow(ctx, shadow) {
  ctx.save();
  ctx.fillStyle = `rgba(0, 0, 0, ${shadow.alpha})`;
  ctx.beginPath();
  ctx.ellipse(
    shadow.x + shadow.width / 2,
    shadow.y,
    shadow.width / 2,
    shadow.height / 2,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();
}

/**
 * Draws the player.
 *
 * @param {object} App - Main application state.
 * @param {object} ASSETS - Asset storage object.
 */
function drawPlayer(App, ASSETS) {
  App.player.draw(App.ctx, ASSETS);
}

/**
 * Draws all enemies.
 *
 * @param {object} App - Main application state.
 */
function drawEnemies(App) {
  App.enemies.forEach((enemy) => {
    if (!enemy.dead) enemy.draw(App.ctx);
  });
}

/**
 * Draws the end boss.
 *
 * @param {object} App - Main application state.
 */
function drawEndboss(App) {
  const boss = App.endboss;
  if (!boss || boss.dead) return;
  boss.draw(App.ctx);
}

/**
 * Draws all active projectiles.
 *
 * @param {object} App - Main application state.
 */
function drawProjectiles(App) {
  App.projectiles.forEach((bottle) => bottle.draw(App.ctx));
}
