/**
 * Main game logic for El Pollo Loco.
 * Handles initialization, game loop, rendering, input, and state management.
 * @file game.js
 */
(function () {
  /**
   * Shortcut for getElementById.
   * @param {string} id - Element ID
   * @returns {HTMLElement|null}
   */
  const $ = (id) => document.getElementById(id);

  /**
   * Stores loaded assets (images, sounds).
   */
  const ASSETS = {
    sky: null,
    playerWalk: [],
    playerIdle: null,
    fullBackground: null,
  };

  /**
   * Paths to images and audio files used in the game.
   */
  const PATHS = {
    bg: {
      full: "img/5_background/complete_background.png",
    },
    idle: "img/2_character_pepe/1_idle/idle/I-1.png",
    walk: [
      "img/2_character_pepe/2_walk/W-21.png",
      "img/2_character_pepe/2_walk/W-22.png",
      "img/2_character_pepe/2_walk/W-23.png",
      "img/2_character_pepe/2_walk/W-24.png",
      "img/2_character_pepe/2_walk/W-25.png",
      "img/2_character_pepe/2_walk/W-26.png",
    ],
    audio: {
      bgMusic: "audio/bg_music.wav",
      coin: "audio/coin.mp3",
      bottleCollect: "audio/bottle_collect.wav",
      throw: "audio/bottle_throw.mp3",
      hurt: "audio/hurt.mp3",
      bossHit: "audio/chicken_hurt.mp3",
      walk: "audio/running.wav",
    },
  };

  /**
   * Main application state object.
   */
  const App = {
    running: false,
    paused: false,
    eventsBound: false,
    rafId: null,
    lastTime: 0,
    walkSoundCooldown: 0,

    soundOn: localStorage.getItem("soundOn") === "true",

    canvas: null,
    ctx: null,

    world: {
      w: 720,
      h: 480,
      levelW: 3200,
      groundY: 432,
      camX: 0,
      shakeX: 0,
      shakeY: 0,
      shakeTime: 0,
    },

    input: {
      left: false,
      right: false,
      jump: false,
      fire: false,
    },

    player: null,

    projectiles: [],
    fireCooldown: 0,

    enemies: [],
    playerHealth: 100,
    maxHealth: 100,
    lastHitTime: 0,
    invulnerableMs: 1000,

    coins: [],
    coinCount: 0,
    maxCoins: 0,
    killedEnemies: 0,
    thrownBottles: 0,

    bottleCount: 10,
    maxBottles: 10,
    groundBottles: [],

    endboss: null,
    bossHealth: 100,
    maxBossHealth: 100,
    bossActive: false,
    bossAreaShown: false,
    bossPhaseTextTime: 0,
    gameWon: false,

    audio: {
      bgMusic: null,
      coin: null,
      bottleCollect: null,
      throw: null,
      hurt: null,
      bossHit: null,
      walk: null,
    },
  };

  /**
   * Checks and initializes the canvas element.
   * @returns {boolean} True if canvas is ready, false otherwise.
   */
  function ensureCanvasReady() {
    App.canvas = $("canvas");
    if (!(App.canvas instanceof HTMLCanvasElement)) return false;

    App.ctx = App.canvas.getContext("2d");
    if (!App.ctx) return false;
    App.ctx.imageSmoothingEnabled = false;

    App.canvas.width = App.world.w;
    App.canvas.height = App.world.h;
    App.canvas.tabIndex = 0;
    App.canvas.style.outline = "none";

    return true;
  }

  /**
   * Initializes the game and sets up the player and event bindings.
   */
  function init() {
    if (!ensureCanvasReady()) {
      return;
    }

    if (!App.player) {
      App.player = new Natur(60, App.world.groundY - 230);
    }

    if (!App.eventsBound) {
      bindKeyboard();
      bindMobile();
      App.eventsBound = true;
    }

    window.Screen.hideAll();
    window.Screen.showById("screen-start");
    window.Screen.overlay(false);
    window.Screen.setPauseIcon(false);
    window.Screen.setSoundIcons(App.soundOn);
  }

  /**
   * Starts the loading screen and triggers game start after a delay.
   */
  function startLoading() {
    if (App.running) return;

    window.Screen.showById("screen-loading");

    const btn = $("loading-btn");
    if (btn) btn.textContent = "Loading.....";

    setTimeout(startGame, 1000);
  }

  /**
   * Starts the game, loads assets, resets state, and begins the main loop.
   */
  async function startGame() {
    if (!ensureCanvasReady()) return;

    App.running = true;
    App.paused = false;

    window.Screen.hideAll();
    window.Screen.overlay(false);
    window.Screen.setPauseIcon(false);

    await ensureAssets();
    resetGameState();
    spawnClouds(App);
    spawnEnemies(App);
    spawnCoins(App);
    spawnGroundBottles(App);
    spawnEndboss(App);
    startBackgroundMusic(App);

    App.canvas.focus();

    if (App.rafId) cancelAnimationFrame(App.rafId);
    App.lastTime = performance.now();
    App.rafId = requestAnimationFrame(loop);
  }

  /**
   * Loads all required assets (images, audio) for the game.
   */
  async function ensureAssets() {
    if (!ASSETS.fullBackground) {
      try {
        ASSETS.fullBackground = await loadImage(PATHS.bg.full);
      } catch (error) {
        console.error("Failed to load background:", error);
      }
    }

    if (!ASSETS.playerIdle) {
      ASSETS.playerIdle = await loadImage(PATHS.idle);
    }

    if (ASSETS.playerWalk.length === 0) {
      for (const src of PATHS.walk) {
        ASSETS.playerWalk.push(await loadImage(src));
      }
    }

    ensureAudio(App, PATHS);
  }

  /**
   * Safely plays a sound if audio is enabled.
   * @param {HTMLAudioElement|null} audio - Audio element to play
   */
  window.safePlay = function (audio) {
    if (!audio || !App.soundOn) return;

    try {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch (_) {}
  };

  /**
   * Resets the game state to initial values for a new game.
   */
  function resetGameState() {
    if (!App.player) {
      App.player = new Natur(60, App.world.groundY - 210);
    }
    App.player.reset(App.world.groundY);

    App.world.camX = 0;
    App.projectiles = [];
    App.fireCooldown = 0;

    App.enemies = [];
    App.playerHealth = App.maxHealth;
    App.lastHitTime = 0;

    App.coins = [];
    App.coinCount = 0;
    App.maxCoins = 0;
    App.killedEnemies = 0;
    App.thrownBottles = 0;

    App.clouds = [];

    App.bottleCount = 10;
    App.maxBottles = 10;
    App.groundBottles = [];

    App.endboss = null;
    App.bossHealth = 100;
    App.maxBossHealth = 100;
    App.bossActive = false;
    App.bossAreaShown = false;
    App.bossPhaseTextTime = 0;
    App.gameWon = false;
  }

  /**
   * Main game loop. Updates and renders the game each frame.
   * @param {number} now - Timestamp
   */
  function loop(now) {
    if (!App.running) return;

    let dtMs = now - App.lastTime;
    App.lastTime = now;
    dtMs = Math.min(40, Math.max(8, dtMs || 16));

    const dtSec = dtMs / 1000;

    if (!App.paused) {
      update(dtMs, dtSec);
    }

    render();
    App.rafId = requestAnimationFrame(loop);
  }

  function enableSound() {
    App.soundOn = !App.soundOn;
    localStorage.setItem("soundOn", String(App.soundOn));

    applyMuteState(App);
    window.Screen.setSoundIcons(App.soundOn);

    if (App.soundOn) {
      startBackgroundMusic(App);
    } else {
      stopBackgroundMusic(App);
    }
  }

  /**
   * Updates game state for each frame.
   * @param {number} dtMs - Delta time in ms
   * @param {number} dtSec - Delta time in seconds
   */
  function update(dtMs, dtSec) {
    updatePlayerAndCamera(dtMs, dtSec);
    if (App.player.isIntroDropping) return;
    updateWorld(dtMs, dtSec);
    updateCollisionsAndCollections();
  }

  /**
   * Updates the player and camera position.
   * @param {number} dtMs - Delta time in ms
   * @param {number} dtSec - Delta time in seconds
   */
  function updatePlayerAndCamera(dtMs, dtSec) {
    const introInput =
      App.player && App.player.isIntroDropping
        ? { left: false, right: false, jump: false, fire: false }
        : App.input;
    App.player.update(dtMs, dtSec, introInput, App.world, ASSETS);
    updateCamera(App.world, App.player);
  }

  /**
   * Updates all world entities and effects for the current frame.
   * @param {number} dtMs - Delta time in ms
   * @param {number} dtSec - Delta time in seconds
   */
  function updateWorld(dtMs, dtSec) {
    updateClouds(dtSec);
    updateScreenShake(dtSec);
    updateBottleThrow(dtSec);
    updateProjectiles(dtSec);
    updateEnemies(dtMs, dtSec);
    updateEndboss(dtMs, dtSec);
    updateCoins(dtMs);
    updateGroundBottles(dtMs);
    updateWalkSound(dtSec);
  }

  /**
   * Updates all collision and collection checks for the current frame.
   */
  function updateCollisionsAndCollections() {
    handleBottleEnemyHits(App);
    handleBottleBossHits(App);
    checkPlayerEnemyHits(App, nowMs());
    checkPlayerBossHit(App, nowMs());
    checkCoinCollection(App);
    checkBottleCollection(App);
  }

  /**
   * Updates the screen shake effect.
   * @param {number} dtSec - Delta time in seconds
   */
  function updateScreenShake(dtSec) {
    if (App.world.shakeTime > 0) {
      App.world.shakeTime -= dtSec;
      App.world.shakeX = (Math.random() - 0.5) * 10;
      App.world.shakeY = (Math.random() - 0.5) * 10;
      return;
    }

    App.world.shakeTime = 0;
    App.world.shakeX = 0;
    App.world.shakeY = 0;
  }

  /**
   * Updates bottle throwing logic and cooldown.
   * @param {number} dtSec - Delta time in seconds
   */
  function updateBottleThrow(dtSec) {
    if (App.fireCooldown > 0) {
      App.fireCooldown -= dtSec;
    }

    if (!App.input.fire || App.fireCooldown > 0 || App.bottleCount <= 0) {
      return;
    }

    throwBottle();
    App.player.startThrow();
    safePlay(App.audio.throw);
    App.bottleCount -= 1;
    App.thrownBottles += 1;
    App.fireCooldown = 0.35;
  }

  /**
   * Handles walk sound playback and cooldown.
   * @param {number} dtSec - Delta time in seconds
   */
  function updateWalkSound(dtSec) {
    if (!App.player || App.paused) return;

    if (App.walkSoundCooldown > 0) {
      App.walkSoundCooldown -= dtSec;
    }

    const isWalking = App.player.onGround && Math.abs(App.player.vx) > 1;

    if (!isWalking) return;
    if (App.walkSoundCooldown > 0) return;

    safePlay(App.audio.walk);
    App.walkSoundCooldown = 0.25;
  }

  /**
   * Applies damage to the player and checks for game over.
   * @param {number} amount - Damage amount.
   */
  function applyDamage(amount) {
    if (!window.canTakeDamage(nowMs())) return;

    App.playerHealth -= amount;
    App.playerHealth = Math.max(0, App.playerHealth);
    App.lastHitTime = nowMs();

    safePlay(App.audio.hurt);
    if (App.playerHealth <= 0) {
      App.playerHealth = 0;
      window.loseGame();
    }
  }
  window.applyDamage = applyDamage;

  /**
   * Creates and throws a new bottle projectile.
   */
  function throwBottle() {
    const p = App.player;

    App.projectiles.push(
      new Bottle(
        p.x + (p.facing === 1 ? p.w - 18 : -18),
        p.y + p.h * 0.52,
        p.facing,
      ),
    );
  }

  /**
   * Updates all active projectiles.
   * @param {number} dtSec - Delta time in seconds
   */
  function updateProjectiles(dtSec) {
    App.projectiles.forEach((bottle) => {
      bottle.update(dtSec, App.world);
    });

    App.projectiles = App.projectiles.filter((bottle) => !bottle.dead);
  }

  /**
   * Updates all clouds.
   * @param {number} dtSec - Delta time in seconds
   */
  function updateClouds(dtSec) {
    App.clouds.forEach((cloud) => {
      cloud.update(dtSec, App.world);
    });
  }

  /**
   * Draws all active projectiles.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  function drawProjectiles(ctx) {
    App.projectiles.forEach((bottle) => {
      bottle.draw(ctx);
    });
  }

  /**
   * Updates all enemies.
   * @param {number} dtMs - Delta time in ms
   * @param {number} dtSec - Delta time in seconds
   */
  function updateEnemies(dtMs, dtSec) {
    App.enemies.forEach((enemy) => {
      enemy.update(dtMs, dtSec, App.world);
    });

    App.enemies = App.enemies.filter((enemy) => !enemy.removable);
  }

  /**
   * Updates the endboss state and phase.
   * @param {number} dtMs - Delta time in ms
   * @param {number} dtSec - Delta time in seconds
   */
  function updateEndboss(dtMs, dtSec) {
    const boss = App.endboss;
    if (!boss) return;

    const wasActive = boss.active;
    const wasPhaseTwo = boss.phaseTwo;

    boss.update(dtMs, dtSec, App.world, App.player, App.bossHealth);
    App.bossActive = boss.active;

    if (!wasActive && boss.active) {
      App.bossAreaShown = true;
    }

    if (!wasPhaseTwo && boss.phaseTwo) {
      App.bossPhaseTextTime = 2;
    }

    if (App.bossPhaseTextTime > 0) {
      App.bossPhaseTextTime -= dtSec;
    }
  }

  /**
   * Updates all coins.
   * @param {number} dtMs - Delta time in ms
   */
  function updateCoins(dtMs) {
    App.coins.forEach((coin) => {
      coin.update(dtMs);
    });
  }

  /**
   * Updates all ground bottles.
   * @param {number} dtMs - Delta time in ms
   */
  function updateGroundBottles(dtMs) {
    App.groundBottles.forEach((bottle) => {
      bottle.update(dtMs);
    });
  }

  /**
   * Renders the entire game scene.
   */
  function render() {
    if (!App.ctx) return;

    const ctx = App.ctx;

    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;

    ctx.clearRect(0, 0, App.world.w, App.world.h);

    drawBackground(ctx);

    ctx.save();
    ctx.translate(-App.world.camX, 0);

    drawClouds(ctx);
    drawGround(ctx);
    drawShadows(ctx);
    drawCoins(ctx);
    drawGroundBottles(ctx);
    drawPlayer(ctx);
    drawEnemies(ctx);
    drawEndboss(ctx);
    drawProjectiles(ctx);

    ctx.restore();

    drawHUD(ctx, App);
    drawBossAreaText(ctx, App);
    drawBossPhaseText(ctx, App);
    drawDamageOverlay(ctx, App, nowMs);

    if (App.paused) {
      drawPauseOverlay(ctx, App);
    }
  }

  /**
   * Draws the background layers.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  function drawBackground(ctx) {
    const img = ASSETS.fullBackground;
    if (!img || !img.complete) {
      ctx.fillStyle = "#87ceeb";
      ctx.fillRect(0, 0, App.world.w, App.world.h);
      return;
    }

    // Skalierung auf die Höhe des Canvas
    const scale = App.world.h / img.height;
    const width = img.width * scale;

    // Parallax-Effekt (optional)
    const offset = -(App.world.camX * 0.3) % width;

    ctx.drawImage(img, offset, 0, width, App.world.h);
    ctx.drawImage(img, offset + width, 0, width, App.world.h);
  }
  /**
   * Draws all clouds.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  function drawClouds(ctx) {
    App.clouds.forEach((cloud) => {
      cloud.draw(ctx);
    });
  }

  /**
   * Draws a parallax background layer.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {HTMLImageElement|null} img - Image to draw
   * @param {number} speedFactor - Parallax speed factor
   */
  function drawParallaxLayer(
    ctx,
    img,
    speedFactor,
    heightFactor = 1,
    alignBottom = false,
  ) {
    if (!img || !img.complete || img.naturalWidth === 0) {
      return;
    }

    const targetH = App.world.h * heightFactor;
    const scale = targetH / img.naturalHeight;
    const targetW = img.naturalWidth * scale;

    const drawY = alignBottom ? App.world.h - targetH : 0;
    const offset = Math.floor(-(App.world.camX * speedFactor) % targetW);

    ctx.drawImage(img, offset, drawY, targetW + 1, targetH);
    ctx.drawImage(img, offset + targetW, drawY, targetW + 1, targetH);
    ctx.drawImage(img, offset - targetW, drawY, targetW + 1, targetH);
  }
  /**
   * Draws the ground layer.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  function drawGround(ctx) {
    const groundY = App.world.groundY;

    ctx.fillStyle = "rgba(214, 170, 95, 0.55)";
    ctx.fillRect(0, groundY, App.world.levelW, App.world.h - groundY);

    ctx.fillStyle = "rgba(120, 82, 36, 0.35)";
    ctx.fillRect(0, groundY, App.world.levelW, 8);

    ctx.fillStyle = "rgba(255, 226, 163, 0.22)";
    ctx.fillRect(0, groundY + 10, App.world.levelW, 4);
  }

  /**
   * Draws all coins that are not collected.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  function drawCoins(ctx) {
    App.coins.forEach((coin) => {
      if (!coin.collected) {
        coin.draw(ctx);
      }
    });
  }

  /**
   * Draws shadows under all entities and objects.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  function drawShadows(ctx) {
    drawEntityShadow(ctx, App.player, 0.32);

    App.enemies.forEach((enemy) => {
      if (!enemy.dead) {
        drawEntityShadow(ctx, enemy, 0.28);
      }
    });

    if (App.endboss && !App.endboss.dead) {
      drawEntityShadow(ctx, App.endboss, 0.42);
    }

    App.groundBottles.forEach((bottle) => {
      if (!bottle.collected) {
        drawEntityShadow(ctx, bottle, 0.22);
      }
    });

    App.coins.forEach((coin) => {
      if (!coin.collected) {
        drawEntityShadow(ctx, coin, 0.16);
      }
    });
  }

  /**
   * Draws a shadow for a single object.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {object} obj - Object to draw shadow for
   * @param {number} scale - Shadow width scale
   */
  function drawEntityShadow(ctx, obj, scale) {
    if (!obj) return;

    const groundDistance = Math.max(0, App.world.groundY - (obj.y + obj.h));
    const liftFactor = Math.min(1, groundDistance / 180);

    const shadowW = obj.w * (scale - liftFactor * 0.08);
    const shadowH = Math.max(6, obj.h * (0.08 - liftFactor * 0.025));
    const shadowX = obj.x + obj.w / 2 - shadowW / 2;
    const shadowY = App.world.groundY + 6 - liftFactor * 10;

    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${0.18 - liftFactor * 0.08})`;
    ctx.beginPath();
    ctx.ellipse(
      shadowX + shadowW / 2,
      shadowY,
      shadowW / 2,
      shadowH / 2,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draws all ground bottles that are not collected.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  function drawGroundBottles(ctx) {
    App.groundBottles.forEach((bottle) => {
      if (!bottle.collected) {
        bottle.draw(ctx);
      }
    });
  }

  /**
   * Draws the player character.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  function drawPlayer(ctx) {
    App.player.draw(ctx, ASSETS);
  }

  /**
   * Draws all enemies that are not dead.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  function drawEnemies(ctx) {
    App.enemies.forEach((enemy) => {
      if (!enemy.dead) {
        enemy.draw(ctx);
      }
    });
  }

  /**
   * Draws the endboss if alive.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  function drawEndboss(ctx) {
    const boss = App.endboss;
    if (!boss || boss.dead) return;

    boss.draw(ctx);
  }

  /**
   * Sets the end screen statistics.
   * @param {string} screenId - Screen element ID
   */
  function setEndStats(screenId) {
    const screen = $(screenId);
    if (!screen) return;

    let stats = screen.querySelector(".end-stats");

    if (!stats) {
      stats = document.createElement("div");
      stats.className = "end-stats";
      screen.appendChild(stats);
    }

    stats.innerHTML = `
    <p>Coins: ${App.coinCount} / ${App.maxCoins}</p>
    <p>Kills: ${App.killedEnemies}</p>
    <p>Thrown Bottles: ${App.thrownBottles}</p>
    <p>Boss HP Left: ${App.bossHealth}</p>
  `;
  }

  /**
   * Binds keyboard event listeners for game controls.
   */
  function bindKeyboard() {
    window.addEventListener("keydown", onKeyDown, { capture: true });
    window.addEventListener("keyup", onKeyUp, { capture: true });
    window.addEventListener("blur", resetInput);
  }

  /**
   * Handles keydown events for game controls.
   * @param {KeyboardEvent} e - Keyboard event
   */
  function onKeyDown(e) {
    const c = e.code;

    if (
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(c)
    ) {
      e.preventDefault();
    }

    if (c === "ArrowLeft" || c === "KeyA") App.input.left = true;
    if (c === "ArrowRight" || c === "KeyD") App.input.right = true;
    if (c === "Space" || c === "KeyW" || c === "ArrowUp") App.input.jump = true;
    if (c === "KeyJ") App.input.fire = true;
  }

  /**
   * Handles keyup events for game controls.
   * @param {KeyboardEvent} e - Keyboard event
   */
  function onKeyUp(e) {
    const c = e.code;

    if (c === "ArrowLeft" || c === "KeyA") App.input.left = false;
    if (c === "ArrowRight" || c === "KeyD") App.input.right = false;
    if (c === "Space" || c === "KeyW" || c === "ArrowUp")
      App.input.jump = false;
    if (c === "KeyJ") App.input.fire = false;
  }

  /**
   * Resets all input states to false.
   */
  function resetInput() {
    App.input.left = false;
    App.input.right = false;
    App.input.jump = false;
    App.input.fire = false;
  }

  /**
   * Binds mobile button event listeners for touch controls.
   */
  function bindMobile() {
    const buttons = document.querySelectorAll(".mobile-control-btn");

    buttons.forEach((btn) => {
      const press = (e) => {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        setMobileInput(btn.id, true);
      };

      const release = (e) => {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        setMobileInput(btn.id, false);
      };

      btn.addEventListener("pointerdown", press, { passive: false });
      btn.addEventListener("pointerup", release, { passive: false });
      btn.addEventListener("pointercancel", release, { passive: false });
      btn.addEventListener("pointerleave", release, { passive: false });

      btn.addEventListener("touchstart", press, { passive: false });
      btn.addEventListener("touchend", release, { passive: false });
      btn.addEventListener("touchcancel", release, { passive: false });

      btn.addEventListener("mousedown", press);
      btn.addEventListener("mouseup", release);
      btn.addEventListener("mouseleave", release);
    });
  }

  /**
   * Sets mobile input state based on button ID.
   * @param {string} id - Button ID
   * @param {boolean} down - Pressed state
   */
  function setMobileInput(id, down) {
    if (id === "mobile-left") App.input.left = down;
    if (id === "mobile-right") App.input.right = down;
    if (id === "mobile-jump") App.input.jump = down;
    if (id === "mobile-throw") App.input.fire = down;
  }

  /**
   * Toggles pause state for the game.
   */
  function pauseGame() {
    if (!App.running) return;

    App.paused = !App.paused;
    window.Screen.setPauseIcon(App.paused);

    if (App.paused) {
      stopBackgroundMusic(App);
    } else {
      startBackgroundMusic(App);
    }
  }

  /**
   * Shows the quit confirmation dialog and pauses the game.
   */
  function quitGame() {
    if (!App.running) return;

    App.paused = true;
    window.Screen.setPauseIcon(true);
    window.Screen.showById("confirm-dialog");
    window.Screen.overlay(true);
    stopBackgroundMusic(App);
  }

  /**
   * Resumes the game from pause or confirmation dialog.
   */
  function resumeGame() {
    $("confirm-dialog")?.classList.add("d-none");
    App.paused = false;
    window.Screen.overlay(false);
    window.Screen.setPauseIcon(false);
    startBackgroundMusic(App);
  }

  /**
   * Returns to the start screen and resets the game state.
   */
  function goBackToHome() {
    App.running = false;

    if (App.rafId) {
      cancelAnimationFrame(App.rafId);
    }

    stopBackgroundMusic(App);
    window.Screen.overlay(false);
    window.Screen.setPauseIcon(false);
    window.Screen.showById("screen-start");
    resetGameState();
  }

  /**
   * Restarts the game.
   */
  function playAgain() {
    startGame();
  }

  /**
   * Handles game over state and displays the lose screen.
   */
  window.loseGame = function () {
    App.running = false;

    if (App.rafId) {
      cancelAnimationFrame(App.rafId);
    }

    stopBackgroundMusic(App);
    setEndStats("screen-end-lose");
    window.Screen.showById("screen-end-lose");
    window.Screen.overlay(true);

    document
      .querySelectorAll("#screen-end-lose button")
      .forEach((btn) => btn.classList.remove("d-none"));
  };

  /**
   * Handles game won state and displays the win screen.
   */
  window.winGame = function () {
    App.running = false;
    App.gameWon = true;

    if (App.rafId) {
      cancelAnimationFrame(App.rafId);
    }

    stopBackgroundMusic(App);
    setEndStats("screen-end-win");
    window.Screen.showById("screen-end-win");
    window.Screen.overlay(true);

    document
      .querySelectorAll("#screen-end-win button")
      .forEach((btn) => btn.classList.remove("d-none"));
  };

  /**
   * Toggles fullscreen mode for the game.
   */
  function toggleFullScreen() {
    const elem = $("fullscreen") || document.body;

    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      elem.requestFullscreen?.();
    }
  }

  /**
   * Checks if the player can take damage (invulnerability cooldown).
   * @param {number} currentTime - Current time in ms
   * @returns {boolean} True if player can take damage
   */
  window.canTakeDamage = function (currentTime) {
    return currentTime - App.lastHitTime > App.invulnerableMs;
  };

  window.init = init;
  window.startLoading = startLoading;
  window.startGame = startGame;
  window.pauseGame = pauseGame;
  window.quitGame = quitGame;
  window.resumeGame = resumeGame;
  window.goBackToHome = goBackToHome;
  window.playAgain = playAgain;
  window.enableSound = enableSound;
  window.toggleFullScreen = toggleFullScreen;
})();
