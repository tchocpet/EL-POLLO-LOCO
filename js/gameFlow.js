/**
 * Toggles the pause state and updates music playback.
 *
 * @param {object} App - Main application state.
 */
function pauseGame(App) {
  if (!App.running) return;
  App.paused = !App.paused;
  window.Screen.setPauseIcon(App.paused);
  syncPauseAudio(App);
}

/**
 * Opens the quit dialog and pauses the game.
 *
 * @param {object} App - Main application state.
 */
function quitGame(App) {
  if (!App.running) return;
  App.paused = true;
  showQuitDialog();
  stopBackgroundMusic(App);
}

/**
 * Resumes the game after pause or quit dialog.
 *
 * @param {object} App - Main application state.
 */
function resumeGame(App) {
  hideQuitDialog();
  App.paused = false;
  window.Screen.overlay(false);
  window.Screen.setPauseIcon(false);
  startBackgroundMusic(App);
}

/**
 * Returns to the start screen and resets the game state.
 *
 * @param {object} App - Main application state.
 */
function goBackToHome(App) {
  App.running = false;
  stopGameLoop(App);
  stopBackgroundMusic(App);
  resetHomeScreenUi();
  resetGameState(App);
}

/**
 * Restarts the game by using the globally registered start function.
 *
 * @param {object} App - Main application state.
 */
function playAgain(App) {
  void App;
  window.startGame();
}

/**
 * Handles the lose state.
 *
 * @param {object} App - Main application state.
 */
function loseGame(App) {
  App.running = false;
  stopGameLoop(App);
  stopBackgroundMusic(App);
  showEndScreen(App, "screen-end-lose");
  revealEndButtons("#screen-end-lose button");
}

/**
 * Handles the win state.
 *
 * @param {object} App - Main application state.
 */
function winGame(App) {
  App.running = false;
  App.gameWon = true;
  stopGameLoop(App);
  stopBackgroundMusic(App);
  showEndScreen(App, "screen-end-win");
  revealEndButtons("#screen-end-win button");
}

/**
 * Stops the current animation loop.
 *
 * @param {object} App - Main application state.
 */
function stopGameLoop(App) {
  if (!App.rafId) return;
  cancelAnimationFrame(App.rafId);
  App.rafId = null;
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
 * @param {object} App - Main application state.
 * @param {string} screenId - End screen id.
 */
function showEndScreen(App, screenId) {
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
 * @param {object} App - Main application state.
 * @param {string} screenId - End screen id.
 */
function setEndStats(App, screenId) {
  const screen = document.getElementById(screenId);
  if (!screen) return;
  const stats = findOrCreateEndStats(screen);
  stats.innerHTML = buildEndStatsMarkup(App);
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
 * @param {object} App - Main application state.
 * @returns {string}
 */
function buildEndStatsMarkup(App) {
  return `
    <p>Coins: ${App.coinCount} / ${App.maxCoins}</p>
    <p>Kills: ${App.killedEnemies}</p>
    <p>Thrown Bottles: ${App.thrownBottles}</p>
    <p>Boss HP Left: ${App.bossHealth}</p>
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
 * @param {object} App - Main application state.
 * @param {number} currentTime - Current timestamp.
 * @returns {boolean}
 */
function canTakeDamage(App, currentTime) {
  return currentTime - App.lastHitTime > App.invulnerableMs;
}

/**
 * Safely plays an audio element if sound is enabled.
 *
 * @param {object} App - Main application state.
 * @param {HTMLAudioElement|null} audio - Audio element.
 */
function safePlay(App, audio) {
  if (!audio || !App.soundOn) return;

  try {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (_) {}
}

/**
 * Applies player damage and triggers game over if needed.
 *
 * @param {object} App - Main application state.
 * @param {number} amount - Damage amount.
 */
function applyDamage(App, amount) {
  if (!canTakeDamage(App, nowMs())) return;
  App.playerHealth -= amount;
  App.playerHealth = Math.max(0, App.playerHealth);
  App.lastHitTime = nowMs();
  safePlay(App, App.audio.hurt);
  if (App.playerHealth <= 0) loseGame(App);
}

/**
 * Syncs pause state and music playback.
 *
 * @param {object} App - Main application state.
 */
function syncPauseAudio(App) {
  if (App.paused) stopBackgroundMusic(App);
  if (!App.paused) startBackgroundMusic(App);
}

/**
 * Syncs sound state with UI and audio system.
 *
 * @param {object} App - Main application state.
 */
function enableSound(App) {
  App.soundOn = !App.soundOn;
  localStorage.setItem("soundOn", String(App.soundOn));
  applyMuteState(App);
  window.Screen.setSoundIcons(App.soundOn);

  if (App.soundOn) startBackgroundMusic(App);
  if (!App.soundOn) stopBackgroundMusic(App);
}
