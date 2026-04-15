let App;
let ASSETS;
let PATHS;

/**
 * Initializes the game module state and registers the public API.
 */
function initGameModule() {
  App = createAppState();
  ASSETS = createAssetState();
  PATHS = createPathState();
  registerGlobalApi();
}

/**
 * Creates the main application state object.
 *
 * @returns {object}
 */
function createAppState() {
  return {
    running: false,
    paused: false,
    eventsBound: false,
    rafId: null,
    lastTime: 0,
    soundOn: localStorage.getItem("soundOn") === "true",
    canvas: null,
    ctx: null,
    world: createWorldState(),
    input: createInputState(),
    player: null,
    audio: createAudioState(),
    gameWon: false,
    walkSoundCooldown: 0,
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
    clouds: [],
    endboss: null,
    bossHealth: 100,
    maxBossHealth: 100,
    bossActive: false,
    bossAreaShown: false,
    bossPhaseTextTime: 0,
  };
}

/**
 * Creates the world state object.
 *
 * @returns {object}
 */
function createWorldState() {
  return {
    w: 720,
    h: 480,
    levelW: 3200,
    groundY: 432,
    camX: 0,
    shakeX: 0,
    shakeY: 0,
    shakeTime: 0,
  };
}

/**
 * Creates the input state object.
 *
 * @returns {{left:boolean,right:boolean,jump:boolean,fire:boolean}}
 */
function createInputState() {
  return {
    left: false,
    right: false,
    jump: false,
    fire: false,
  };
}

/**
 * Creates the audio state object.
 *
 * @returns {object}
 */
function createAudioState() {
  return {
    bgMusic: null,
    coin: null,
    bottleCollect: null,
    throw: null,
    hurt: null,
    bossHit: null,
    walk: null,
  };
}

/**
 * Creates the asset state object.
 *
 * @returns {object}
 */
function createAssetState() {
  return {
    playerWalk: [],
    playerIdle: null,
    fullBackground: null,
  };
}

/**
 * Creates the path configuration object.
 *
 * @returns {object}
 */
function createPathState() {
  return {
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
}

/**
 * Registers the public API on the global window object.
 */
function registerGlobalApi() {
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
  window.loseGame = loseGame;
  window.winGame = winGame;
  window.canTakeDamage = canTakeDamage;
  window.safePlay = playAudioSafely;
  window.applyDamage = applyDamage;
}

/**
 * Returns an element by id.
 *
 * @param {string} id - Element id.
 * @returns {HTMLElement|null}
 */
function $(id) {
  return document.getElementById(id);
}

/**
 * Initializes the game UI and input setup.
 */
function init() {
  if (!ensureCanvasReady()) return;
  ensurePlayerExists();
  bindGameEventsOnce();
  showStartScreen();
}

/**
 * Starts the loading screen before the game begins.
 */
function startLoading() {
  if (App.running) return;
  window.Screen.showById("screen-loading");
  updateLoadingLabel();
  setTimeout(startGame, 1000);
}

/**
 * Starts a fresh game session.
 *
 * @returns {Promise<void>}
 */
async function startGame() {
  if (!ensureCanvasReady()) return;
  activateGame();
  prepareGameScreen();
  await ensureAssets(App, ASSETS, PATHS);
  resetGameState(App);
  spawnGameObjects();
  startBackgroundMusic(App);
  focusCanvas();
  startLoop();
}

/**
 * Ensures that the canvas is ready for rendering.
 *
 * @returns {boolean}
 */
function ensureCanvasReady() {
  App.canvas = $("canvas");
  if (!(App.canvas instanceof HTMLCanvasElement)) return false;
  App.ctx = App.canvas.getContext("2d");
  if (!App.ctx) return false;
  setupCanvas();
  return true;
}

/**
 * Applies base canvas settings.
 */
function setupCanvas() {
  App.ctx.imageSmoothingEnabled = false;
  App.canvas.width = App.world.w;
  App.canvas.height = App.world.h;
  App.canvas.tabIndex = 0;
  App.canvas.style.outline = "none";
}

/**
 * Ensures that a player instance exists.
 */
function ensurePlayerExists() {
  if (App.player) return;
  App.player = new Natur(60, App.world.groundY - 230);
}

/**
 * Binds keyboard and mobile events only once.
 */
function bindGameEventsOnce() {
  if (App.eventsBound) return;
  bindKeyboard(App);
  bindMobile(App);
  App.eventsBound = true;
}

/**
 * Shows the start screen.
 */
function showStartScreen() {
  window.Screen.hideAll();
  window.Screen.showById("screen-start");
  window.Screen.overlay(false);
  window.Screen.setPauseIcon(false);
  window.Screen.setSoundIcons(App.soundOn);
}

/**
 * Updates the loading button label.
 */
function updateLoadingLabel() {
  const button = $("loading-btn");
  if (button) button.textContent = "Loading...";
}

/**
 * Activates runtime flags for a new game.
 */
function activateGame() {
  App.running = true;
  App.paused = false;
  App.gameWon = false;
}

/**
 * Prepares the screen for gameplay.
 */
function prepareGameScreen() {
  window.Screen.hideAll();
  window.Screen.overlay(false);
  window.Screen.setPauseIcon(false);
}

/**
 * Spawns all game entities.
 */
function spawnGameObjects() {
  spawnClouds(App);
  spawnEnemies(App);
  spawnCoins(App);
  spawnGroundBottles(App);
  spawnEndboss(App);
}

/**
 * Focuses the canvas so keyboard input works immediately.
 */
function focusCanvas() {
  App.canvas.focus();
}

/**
 * Starts the animation loop.
 */
function startLoop() {
  stopLoop();
  App.lastTime = performance.now();
  App.rafId = requestAnimationFrame(loop);
}

/**
 * Stops the animation loop.
 */
function stopLoop() {
  if (!App.rafId) return;
  cancelAnimationFrame(App.rafId);
  App.rafId = null;
}

/**
 * Main animation loop.
 *
 * @param {number} now - Current animation frame timestamp.
 */
function loop(now) {
  if (!App.running) return;
  const dtMs = getDeltaMs(now);
  const dtSec = dtMs / 1000;
  if (!App.paused) update(dtMs, dtSec);
  render();
  App.rafId = requestAnimationFrame(loop);
}

/**
 * Returns a clamped frame delta.
 *
 * @param {number} now - Current animation frame timestamp.
 * @returns {number}
 */
function getDeltaMs(now) {
  const raw = now - App.lastTime;
  App.lastTime = now;
  return Math.min(40, Math.max(8, raw || 16));
}

/**
 * Updates the game for one frame.
 *
 * @param {number} dtMs - Delta time in milliseconds.
 * @param {number} dtSec - Delta time in seconds.
 */
function update(dtMs, dtSec) {
  updateGameWorld(App, ASSETS, dtMs, dtSec);
}

/**
 * Renders the current frame.
 */
function render() {
  renderGameWorld(App, ASSETS);
}

/**
 * Toggles the pause state and updates music playback.
 */
function pauseGame() {
  if (!App.running) return;
  App.paused = !App.paused;
  window.Screen.setPauseIcon(App.paused);
  syncPauseAudio();
}

/**
 * Opens the quit dialog and pauses the game.
 */
function quitGame() {
  if (!App.running) return;
  App.paused = true;
  showQuitDialog();
  stopBackgroundMusic(App);
}

/**
 * Resumes the game after pause or quit dialog.
 */
function resumeGame() {
  hideQuitDialog();
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
  stopLoop();
  stopBackgroundMusic(App);
  resetHomeScreenUi();
  resetGameState(App);
}

/**
 * Restarts the game.
 */
function playAgain() {
  startGame();
}

/**
 * Handles the lose state.
 */
function loseGame() {
  App.running = false;
  stopLoop();
  stopBackgroundMusic(App);
  showEndScreen("screen-end-lose");
  revealEndButtons("#screen-end-lose button");
}

/**
 * Handles the win state.
 */
function winGame() {
  App.running = false;
  App.gameWon = true;
  stopLoop();
  stopBackgroundMusic(App);
  showEndScreen("screen-end-win");
  revealEndButtons("#screen-end-win button");
}

/**
 * Shows the quit dialog.
 */
function showQuitDialog() {
  window.Screen.setPauseIcon(true);
  window.Screen.showById("confirm-dialog");
  window.Screen.overlay(true);
}

/**
 * Hides the quit dialog.
 */
function hideQuitDialog() {
  const dialog = document.getElementById("confirm-dialog");
  if (dialog) dialog.classList.add("d-none");
}

/**
 * Resets the home screen UI.
 */
function resetHomeScreenUi() {
  window.Screen.overlay(false);
  window.Screen.setPauseIcon(false);
  window.Screen.showById("screen-start");
}

/**
 * Shows an end screen and updates its statistics.
 *
 * @param {string} screenId - End screen id.
 */
function showEndScreen(screenId) {
  setEndStats(App, screenId);
  window.Screen.showById(screenId);
  window.Screen.overlay(true);
}

/**
 * Reveals all buttons inside an end screen.
 *
 * @param {string} selector - CSS selector for the buttons.
 */
function revealEndButtons(selector) {
  document.querySelectorAll(selector).forEach((button) => {
    button.classList.remove("d-none");
  });
}

/**
 * Updates the end screen statistics.
 *
 * @param {object} state - Main application state.
 * @param {string} screenId - End screen id.
 */
function setEndStats(state, screenId) {
  const screen = document.getElementById(screenId);
  if (!screen) return;
  const stats = findOrCreateEndStats(screen);
  stats.innerHTML = buildEndStatsMarkup(state);
}

/**
 * Finds or creates the end stats element.
 *
 * @param {HTMLElement} screen - End screen element.
 * @returns {HTMLElement}
 */
function findOrCreateEndStats(screen) {
  let stats = screen.querySelector(".end-stats");
  if (stats) return stats;
  stats = document.createElement("div");
  stats.className = "end-stats";
  screen.appendChild(stats);
  return stats;
}

/**
 * Builds the end stats HTML markup.
 *
 * @param {object} state - Main application state.
 * @returns {string}
 */
function buildEndStatsMarkup(state) {
  return `
    <p>Coins: ${state.coinCount} / ${state.maxCoins}</p>
    <p>Kills: ${state.killedEnemies}</p>
    <p>Thrown Bottles: ${state.thrownBottles}</p>
    <p>Boss HP Left: ${state.bossHealth}</p>
  `;
}

/**
 * Toggles fullscreen mode for the game container.
 */
function toggleFullScreen() {
  const element = document.getElementById("fullscreen") || document.body;
  if (document.fullscreenElement) {
    document.exitFullscreen?.();
    return;
  }
  element.requestFullscreen?.();
}

/**
 * Returns whether the player can take damage.
 *
 * @param {number} currentTime - Current timestamp.
 * @returns {boolean}
 */
function canTakeDamage(currentTime) {
  return currentTime - App.lastHitTime > App.invulnerableMs;
}

/**
 * Safely plays an audio element if sound is enabled.
 *
 * @param {HTMLAudioElement|null} audio - Audio element to play.
 */
function playAudioSafely(audio) {
  if (!audio || !App.soundOn) return;

  try {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (_) {}
}

/**
 * Applies player damage and triggers game over if needed.
 *
 * @param {number} amount - Damage amount.
 */
function applyDamage(amount) {
  if (!canTakeDamage(nowMs())) return;
  App.playerHealth -= amount;
  App.playerHealth = Math.max(0, App.playerHealth);
  App.lastHitTime = nowMs();
  playAudioSafely(App.audio.hurt);
  if (App.playerHealth <= 0) loseGame();
}

/**
 * Syncs pause state and music playback.
 */
function syncPauseAudio() {
  if (App.paused) stopBackgroundMusic(App);
  if (!App.paused) startBackgroundMusic(App);
}

/**
 * Syncs sound state with UI and audio system.
 */
function enableSound() {
  App.soundOn = !App.soundOn;
  localStorage.setItem("soundOn", String(App.soundOn));
  applyMuteState(App);
  window.Screen.setSoundIcons(App.soundOn);
  if (App.soundOn) startBackgroundMusic(App);
  if (!App.soundOn) stopBackgroundMusic(App);
}
