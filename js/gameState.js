/**
 * Resets the full game state for a new game session.
 *
 * @param {object} App - The main application state.
 */
function resetGameState(App) {
  resetPlayerState(App);
  resetWorldState(App);
  resetCombatState(App);
  resetCoinState(App);
  resetBottleState(App);
  resetBossState(App);
  resetInputState(App);
}

/**
 * Resets the player state including health and position.
 *
 * @param {object} App - The main application state.
 */
function resetPlayerState(App) {
  ensurePlayerForReset(App);
  App.player.reset(App.world.groundY);
  App.playerHealth = App.maxHealth;
  App.lastHitTime = 0;
}

/**
 * Ensures that a player instance exists before resetting.
 *
 * @param {object} App - The main application state.
 */
function ensurePlayerForReset(App) {
  if (App.player) return;
  App.player = new Natur(60, App.world.groundY - 210);
}

/**
 * Resets world-related properties such as camera and effects.
 *
 * @param {object} App - The main application state.
 */
function resetWorldState(App) {
  App.world.camX = 0;
  App.world.shakeX = 0;
  App.world.shakeY = 0;
  App.world.shakeTime = 0;
  App.projectiles = [];
  App.clouds = [];
  App.fireCooldown = 0;
}

/**
 * Resets combat-related statistics and enemy data.
 *
 * @param {object} App - The main application state.
 */
function resetCombatState(App) {
  App.enemies = [];
  App.killedEnemies = 0;
  App.thrownBottles = 0;
  App.walkSoundCooldown = 0;
}

/**
 * Resets all coin-related values.
 *
 * @param {object} App - The main application state.
 */
function resetCoinState(App) {
  App.coins = [];
  App.coinCount = 0;
  App.maxCoins = 0;
}

/**
 * Resets all bottle-related values.
 *
 * @param {object} App - The main application state.
 */
function resetBottleState(App) {
  App.bottleCount = 10;
  App.maxBottles = 10;
  App.groundBottles = [];
}

/**
 * Resets all boss-related properties.
 *
 * @param {object} App - The main application state.
 */
function resetBossState(App) {
  App.endboss = null;
  App.bossHealth = 100;
  App.maxBossHealth = 100;
  App.bossActive = false;
  App.bossAreaShown = false;
  App.bossPhaseTextTime = 0;
  App.gameWon = false;
}

/**
 * Resets all player input flags.
 *
 * @param {object} App - The main application state.
 */
function resetInputState(App) {
  App.input.left = false;
  App.input.right = false;
  App.input.jump = false;
  App.input.fire = false;
}
