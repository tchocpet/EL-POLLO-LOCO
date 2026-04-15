/**
 * Creates one status image map.
 *
 * @returns {object}
 */
function createStatusImages() {
  return {
    0: new Image(),
    20: new Image(),
    40: new Image(),
    60: new Image(),
    80: new Image(),
    100: new Image(),
  };
}

/**
 * Assigns image sources to a status image map.
 *
 * @param {object} images - Image map.
 * @param {object} paths - Path map.
 */
function setStatusImageSources(images, paths) {
  images[0].src = paths[0];
  images[20].src = paths[20];
  images[40].src = paths[40];
  images[60].src = paths[60];
  images[80].src = paths[80];
  images[100].src = paths[100];
}

/**
 * Returns coin HUD image paths.
 *
 * @returns {object}
 */
function getCoinImagePaths() {
  return {
    0: "img/7_statusbars/1_statusbar/1_statusbar_coin/blue/0.png",
    20: "img/7_statusbars/1_statusbar/1_statusbar_coin/blue/20.png",
    40: "img/7_statusbars/1_statusbar/1_statusbar_coin/blue/40.png",
    60: "img/7_statusbars/1_statusbar/1_statusbar_coin/blue/60.png",
    80: "img/7_statusbars/1_statusbar/1_statusbar_coin/blue/80.png",
    100: "img/7_statusbars/1_statusbar/1_statusbar_coin/blue/100.png",
  };
}

/**
 * Returns health HUD image paths.
 *
 * @returns {object}
 */
function getHealthImagePaths() {
  return {
    0: "img/7_statusbars/1_statusbar/2_statusbar_health/blue/0.png",
    20: "img/7_statusbars/1_statusbar/2_statusbar_health/blue/20.png",
    40: "img/7_statusbars/1_statusbar/2_statusbar_health/blue/40.png",
    60: "img/7_statusbars/1_statusbar/2_statusbar_health/blue/60.png",
    80: "img/7_statusbars/1_statusbar/2_statusbar_health/blue/80.png",
    100: "img/7_statusbars/1_statusbar/2_statusbar_health/blue/100.png",
  };
}

/**
 * Returns bottle HUD image paths.
 *
 * @returns {object}
 */
function getBottleImagePaths() {
  return {
    0: "img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/0.png",
    20: "img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/20.png",
    40: "img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/40.png",
    60: "img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/60.png",
    80: "img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/80.png",
    100: "img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/100.png",
  };
}

/**
 * Initializes the HUD module and registers its public API.
 */
function initHudModule() {
  const hudModule = createHudModule();
  hudModule.registerHudApi();
}

/**
 * Creates the HUD module.
 *
 * @returns {{registerHudApi: Function}}
 */
function createHudModule() {
  const healthImages = createStatusImages();
  const coinImages = createStatusImages();
  const bottleImages = createStatusImages();

  /**
   * Registers public HUD functions.
   */
  function registerHudApi() {
    loadHudAssets();
    window.drawHUD = drawHUD;
    window.drawBossHealthBar = drawBossHealthBar;
    window.drawBossAreaText = drawBossAreaText;
    window.drawBossPhaseText = drawBossPhaseText;
    window.drawDamageOverlay = drawDamageOverlay;
    window.drawPauseOverlay = drawPauseOverlay;
  }

  /**
   * Loads all HUD image assets.
   */
  function loadHudAssets() {
    loadCoinImages();
    loadHealthImages();
    loadBottleImages();
  }

  /**
   * Draws the full HUD.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {object} App - Main application state.
   */
  function drawHUD(ctx, App) {
    drawBottleHUD(ctx, App);
    drawHealthHUD(ctx, App);
    drawCoinHUD(ctx, App);
  }

  /**
   * Draws the health bar.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {object} App - Main application state.
   */
  function drawHealthHUD(ctx, App) {
    const percent = getPercent(App.playerHealth, App.maxHealth);
    const image = getStatusBarImage(percent, healthImages);
    drawStatusImage(ctx, image, 20, 70);
  }

  /**
   * Draws the bottle bar.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {object} App - Main application state.
   */
  function drawBottleHUD(ctx, App) {
    const percent = getPercent(App.bottleCount, App.maxBottles);
    const image = getStatusBarImage(percent, bottleImages);
    drawStatusImage(ctx, image, 20, 20);
  }

  /**
   * Draws the coin bar.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {object} App - Main application state.
   */
  function drawCoinHUD(ctx, App) {
    const percent = getPercent(App.coinCount, App.maxCoins);
    const image = getStatusBarImage(percent, coinImages);
    drawStatusImage(ctx, image, 20, 120);
  }

  /**
   * Draws the boss health bar.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {object} App - Main application state.
   */
  function drawBossHealthBar(ctx, App) {
    if (!App.bossActive) return;
    const box = createBossBarBox(App.world.w);
    const percent = App.bossHealth / App.maxBossHealth;
    drawBossBarFrame(ctx, box);
    drawBossBarFill(ctx, box, percent);
  }

  /**
   * Draws the boss area label.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {object} App - Main application state.
   */
  function drawBossAreaText(ctx, App) {
    if (!shouldDrawBossAreaText(App)) return;
    ctx.save();
    drawBossAreaBox(ctx, App);
    drawBossAreaLabel(ctx, App);
    ctx.restore();
  }

  /**
   * Draws the boss phase label.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {object} App - Main application state.
   */
  function drawBossPhaseText(ctx, App) {
    if (App.bossPhaseTextTime <= 0) return;
    ctx.save();
    drawBossPhaseBox(ctx, App);
    drawBossPhaseLabel(ctx, App);
    ctx.restore();
  }

  /**
   * Draws the player damage overlay.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {object} App - Main application state.
   * @param {Function} nowMs - Timestamp function.
   */
  function drawDamageOverlay(ctx, App, nowMs) {
    const sinceHit = nowMs() - App.lastHitTime;
    if (sinceHit > 120) return;
    ctx.fillStyle = "rgba(255, 0, 0, 0.15)";
    ctx.fillRect(0, 0, App.world.w, App.world.h);
  }

  /**
   * Draws the pause overlay.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {object} App - Main application state.
   */
  function drawPauseOverlay(ctx, App) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(0, 0, App.world.w, App.world.h);
    ctx.fillStyle = "#ffffff";
    ctx.font = "22px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", App.world.w / 2, App.world.h / 2);
  }

  /**
   * Loads all coin status bar images.
   */
  function loadCoinImages() {
    setStatusImageSources(coinImages, getCoinImagePaths());
  }

  /**
   * Loads all health status bar images.
   */
  function loadHealthImages() {
    setStatusImageSources(healthImages, getHealthImagePaths());
  }

  /**
   * Loads all bottle status bar images.
   */
  function loadBottleImages() {
    setStatusImageSources(bottleImages, getBottleImagePaths());
  }

  /**
   * Draws one HUD status image.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {HTMLImageElement} image - Status image.
   * @param {number} x - Draw x position.
   * @param {number} y - Draw y position.
   */
  function drawStatusImage(ctx, image, x, y) {
    if (!image || !image.complete) return;
    ctx.drawImage(image, x, y, 220, 60);
  }

  /**
   * Returns a clamped percentage value.
   *
   * @param {number} value - Current value.
   * @param {number} maxValue - Maximum value.
   * @returns {number}
   */
  function getPercent(value, maxValue) {
    if (maxValue <= 0) return 0;
    return Math.max(0, Math.min(100, (value / maxValue) * 100));
  }

  /**
   * Returns the correct status image.
   *
   * @param {number} percent - Percentage value.
   * @param {object} images - Image map.
   * @returns {HTMLImageElement}
   */
  function getStatusBarImage(percent, images) {
    if (percent >= 100) return images[100];
    if (percent >= 80) return images[80];
    if (percent >= 60) return images[60];
    if (percent >= 40) return images[40];
    if (percent >= 20) return images[20];
    return images[0];
  }

  /**
   * Returns whether the boss area label should be drawn.
   *
   * @param {object} App - Main application state.
   * @returns {boolean}
   */
  function shouldDrawBossAreaText(App) {
    if (!App.bossActive) return false;
    if (App.gameWon) return false;
    return App.bossAreaShown;
  }

  /**
   * Draws the boss area box.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {object} App - Main application state.
   */
  function drawBossAreaBox(ctx, App) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(App.world.w / 2 - 110, 55, 220, 32);
  }

  /**
   * Draws the boss area label text.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {object} App - Main application state.
   */
  function drawBossAreaLabel(ctx, App) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.fillText("BOSS AREA", App.world.w / 2, 77);
  }

  /**
   * Draws the boss phase box.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {object} App - Main application state.
   */
  function drawBossPhaseBox(ctx, App) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(App.world.w / 2 - 150, 100, 300, 40);
  }

  /**
   * Draws the boss phase label text.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {object} App - Main application state.
   */
  function drawBossPhaseLabel(ctx, App) {
    ctx.fillStyle = "#ff7675";
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "center";
    ctx.fillText("BOSS PHASE 2!", App.world.w / 2, 128);
  }

  /**
   * Creates the boss bar box data.
   *
   * @param {number} worldWidth - World width.
   * @returns {{x:number,y:number,width:number,height:number}}
   */
  function createBossBarBox(worldWidth) {
    return {
      width: 300,
      height: 25,
      x: (worldWidth - 300) / 2,
      y: 20,
    };
  }

  /**
   * Draws the boss bar frame.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {{x:number,y:number,width:number,height:number}} box - Box data.
   */
  function drawBossBarFrame(ctx, box) {
    ctx.fillStyle = "black";
    ctx.fillRect(box.x, box.y, box.width, box.height);
    ctx.strokeStyle = "white";
    ctx.strokeRect(box.x, box.y, box.width, box.height);
  }

  /**
   * Draws the boss bar fill.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {{x:number,y:number,width:number,height:number}} box - Box data.
   * @param {number} percent - Fill percentage.
   */
  function drawBossBarFill(ctx, box, percent) {
    ctx.fillStyle = "red";
    ctx.fillRect(box.x, box.y, box.width * percent, box.height);
  }

  return { registerHudApi };
}
