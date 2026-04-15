/**
 * Updates the complete game world for one frame.
 *
 * @param {object} App - Main application state.
 * @param {object} ASSETS - Asset storage object.
 * @param {number} dtMs - Delta time in milliseconds.
 * @param {number} dtSec - Delta time in seconds.
 */
function updateGameWorld(App, ASSETS, dtMs, dtSec) {
  updatePlayerAndCamera(App, ASSETS, dtMs, dtSec);
  if (App.player.isIntroDropping) return;
  updateWorldSystems(App, dtMs, dtSec);
  updateCollisionsAndCollections(App);
}

/**
 * Updates the player and camera position.
 *
 * @param {object} App - Main application state.
 * @param {object} ASSETS - Asset storage object.
 * @param {number} dtMs - Delta time in milliseconds.
 * @param {number} dtSec - Delta time in seconds.
 */
function updatePlayerAndCamera(App, ASSETS, dtMs, dtSec) {
  const input = getEffectiveInput(App);
  App.player.update(dtMs, dtSec, input, App.world, ASSETS);
  updateCamera(App.world, App.player);
}

/**
 * Returns the effective input state.
 *
 * @param {object} App - Main application state.
 * @returns {{left:boolean,right:boolean,jump:boolean,fire:boolean}}
 */
function getEffectiveInput(App) {
  if (!App.player) return App.input;
  if (!App.player.isIntroDropping) return App.input;
  return createDisabledInput();
}

/**
 * Creates an input object with all actions disabled.
 *
 * @returns {{left:boolean,right:boolean,jump:boolean,fire:boolean}}
 */
function createDisabledInput() {
  return {
    left: false,
    right: false,
    jump: false,
    fire: false,
  };
}

/**
 * Updates all world systems except collisions.
 *
 * @param {object} App - Main application state.
 * @param {number} dtMs - Delta time in milliseconds.
 * @param {number} dtSec - Delta time in seconds.
 */
function updateWorldSystems(App, dtMs, dtSec) {
  updateClouds(App, dtSec);
  updateEffects(App, dtSec);
  updateCombatObjects(App, dtMs, dtSec);
  updateCollectibleObjects(App, dtMs);
  updateWalkSound(App, dtSec);
}

/**
 * Updates screen shake and throw logic.
 *
 * @param {object} App - Main application state.
 * @param {number} dtSec - Delta time in seconds.
 */
function updateEffects(App, dtSec) {
  updateScreenShake(App, dtSec);
  updateBottleThrow(App, dtSec);
}

/**
 * Updates projectiles, enemies, and boss.
 *
 * @param {object} App - Main application state.
 * @param {number} dtMs - Delta time in milliseconds.
 * @param {number} dtSec - Delta time in seconds.
 */
function updateCombatObjects(App, dtMs, dtSec) {
  updateProjectiles(App, dtSec);
  updateEnemies(App, dtMs, dtSec);
  updateEndboss(App, dtMs, dtSec);
}

/**
 * Updates coins and collectible bottles.
 *
 * @param {object} App - Main application state.
 * @param {number} dtMs - Delta time in milliseconds.
 */
function updateCollectibleObjects(App, dtMs) {
  updateCoins(App, dtMs);
  updateGroundBottles(App, dtMs);
}

/**
 * Runs collision and collection checks.
 *
 * @param {object} App - Main application state.
 */
function updateCollisionsAndCollections(App) {
  const currentTime = nowMs();
  handleBottleEnemyHits(App);
  handleBottleBossHits(App);
  checkPlayerEnemyHits(App, currentTime);
  checkPlayerBossHit(App, currentTime);
  checkCoinCollection(App);
  checkBottleCollection(App);
}

/**
 * Updates the screen shake values.
 *
 * @param {object} App - Main application state.
 * @param {number} dtSec - Delta time in seconds.
 */
function updateScreenShake(App, dtSec) {
  if (App.world.shakeTime <= 0) {
    resetScreenShake(App);
    return;
  }

  App.world.shakeTime -= dtSec;
  App.world.shakeX = (Math.random() - 0.5) * 10;
  App.world.shakeY = (Math.random() - 0.5) * 10;
}

/**
 * Resets all screen shake values.
 *
 * @param {object} App - Main application state.
 */
function resetScreenShake(App) {
  App.world.shakeTime = 0;
  App.world.shakeX = 0;
  App.world.shakeY = 0;
}

/**
 * Updates the bottle throw logic.
 *
 * @param {object} App - Main application state.
 * @param {number} dtSec - Delta time in seconds.
 */
function updateBottleThrow(App, dtSec) {
  reduceFireCooldown(App, dtSec);
  if (!canThrowBottle(App)) return;
  performBottleThrow(App);
}

/**
 * Reduces the fire cooldown timer.
 *
 * @param {object} App - Main application state.
 * @param {number} dtSec - Delta time in seconds.
 */
function reduceFireCooldown(App, dtSec) {
  if (App.fireCooldown > 0) {
    App.fireCooldown -= dtSec;
  }
}

/**
 * Checks whether the player may throw a bottle.
 *
 * @param {object} App - Main application state.
 * @returns {boolean}
 */
function canThrowBottle(App) {
  if (!App.input.fire) return false;
  if (App.fireCooldown > 0) return false;
  return App.bottleCount > 0;
}

/**
 * Performs a bottle throw.
 *
 * @param {object} App - Main application state.
 */
function performBottleThrow(App) {
  throwBottle(App);
  App.player.startThrow();
  safePlay(App, App.audio.throw);
  App.bottleCount -= 1;
  App.thrownBottles += 1;
  App.fireCooldown = 0.35;
}

/**
 * Creates and stores a bottle projectile.
 *
 * @param {object} App - Main application state.
 */
function throwBottle(App) {
  const bottle = createBottleProjectile(App);
  App.projectiles.push(bottle);
}

/**
 * Creates a bottle projectile instance.
 *
 * @param {object} App - Main application state.
 * @returns {Bottle}
 */
function createBottleProjectile(App) {
  const player = App.player;
  const x = player.x + (player.facing === 1 ? player.w - 18 : -18);
  const y = player.y + player.h * 0.52;
  return new Bottle(x, y, player.facing);
}

/**
 * Updates the walk sound playback.
 *
 * @param {object} App - Main application state.
 * @param {number} dtSec - Delta time in seconds.
 */
function updateWalkSound(App, dtSec) {
  if (!App.player || App.paused) return;
  lowerWalkCooldown(App, dtSec);
  if (!isPlayerWalking(App)) return;
  if (App.walkSoundCooldown > 0) return;
  playWalkSound(App);
}

/**
 * Reduces the walk sound cooldown.
 *
 * @param {object} App - Main application state.
 * @param {number} dtSec - Delta time in seconds.
 */
function lowerWalkCooldown(App, dtSec) {
  if (App.walkSoundCooldown > 0) {
    App.walkSoundCooldown -= dtSec;
  }
}

/**
 * Checks whether the player is walking on the ground.
 *
 * @param {object} App - Main application state.
 * @returns {boolean}
 */
function isPlayerWalking(App) {
  return App.player.onGround && Math.abs(App.player.vx) > 1;
}

/**
 * Plays the walk sound and resets its cooldown.
 *
 * @param {object} App - Main application state.
 */
function playWalkSound(App) {
  safePlay(App, App.audio.walk);
  App.walkSoundCooldown = 0.25;
}

/**
 * Updates all active projectiles.
 *
 * @param {object} App - Main application state.
 * @param {number} dtSec - Delta time in seconds.
 */
function updateProjectiles(App, dtSec) {
  App.projectiles.forEach((bottle) => {
    bottle.update(dtSec, App.world);
  });

  App.projectiles = App.projectiles.filter((bottle) => !bottle.dead);
}

/**
 * Updates all clouds.
 *
 * @param {object} App - Main application state.
 * @param {number} dtSec - Delta time in seconds.
 */
function updateClouds(App, dtSec) {
  App.clouds.forEach((cloud) => {
    cloud.update(dtSec, App.world);
  });
}

/**
 * Updates all enemies.
 *
 * @param {object} App - Main application state.
 * @param {number} dtMs - Delta time in milliseconds.
 * @param {number} dtSec - Delta time in seconds.
 */
function updateEnemies(App, dtMs, dtSec) {
  App.enemies.forEach((enemy) => {
    enemy.update(dtMs, dtSec, App.world);
  });

  App.enemies = App.enemies.filter((enemy) => !enemy.removable);
}

/**
 * Updates the end boss.
 *
 * @param {object} App - Main application state.
 * @param {number} dtMs - Delta time in milliseconds.
 * @param {number} dtSec - Delta time in seconds.
 */
function updateEndboss(App, dtMs, dtSec) {
  const boss = App.endboss;
  if (!boss) return;

  const flags = captureBossFlags(boss);
  boss.update(dtMs, dtSec, App.world, App.player, App.bossHealth);
  syncBossUiState(App, boss, flags, dtSec);
}

/**
 * Captures the current boss state for UI comparison.
 *
 * @param {Boss} boss - Boss instance.
 * @returns {{wasActive:boolean,wasPhaseTwo:boolean}}
 */
function captureBossFlags(boss) {
  return {
    wasActive: boss.active,
    wasPhaseTwo: boss.phaseTwo,
  };
}

/**
 * Synchronizes boss-related UI state.
 *
 * @param {object} App - Main application state.
 * @param {Boss} boss - Boss instance.
 * @param {{wasActive:boolean,wasPhaseTwo:boolean}} flags - Previous boss flags.
 * @param {number} dtSec - Delta time in seconds.
 */
function syncBossUiState(App, boss, flags, dtSec) {
  App.bossActive = boss.active;

  if (!flags.wasActive && boss.active) {
    App.bossAreaShown = true;
  }

  if (!flags.wasPhaseTwo && boss.phaseTwo) {
    App.bossPhaseTextTime = 2;
  }

  if (App.bossPhaseTextTime > 0) {
    App.bossPhaseTextTime -= dtSec;
  }
}

/**
 * Updates all coins.
 *
 * @param {object} App - Main application state.
 * @param {number} dtMs - Delta time in milliseconds.
 */
function updateCoins(App, dtMs) {
  App.coins.forEach((coin) => {
    coin.update(dtMs);
  });
}

/**
 * Updates all ground bottles.
 *
 * @param {object} App - Main application state.
 * @param {number} dtMs - Delta time in milliseconds.
 */
function updateGroundBottles(App, dtMs) {
  App.groundBottles.forEach((bottle) => {
    bottle.update(dtMs);
  });
}
