/**
 * Initializes the collision module and registers its public API.
 */
function initCollisionModule() {
  registerCollisionApi();
}

/**
 * Registers collision functions on the global window object.
 */
function registerCollisionApi() {
  window.handleBottleEnemyHits = handleBottleEnemyHits;
  window.handleBottleBossHits = handleBottleBossHits;
  window.checkPlayerEnemyHits = checkPlayerEnemyHits;
  window.checkPlayerBossHit = checkPlayerBossHit;
  window.checkCoinCollection = checkCoinCollection;
  window.checkBottleCollection = checkBottleCollection;
}

/**
 * Handles collisions between all thrown bottles and all enemies.
 *
 * @param {object} App - Main application state.
 */
function handleBottleEnemyHits(App) {
  App.projectiles.forEach((bottle) => handleBottleHitsEnemies(App, bottle));
}

/**
 * Handles collisions between one bottle and all enemies.
 *
 * @param {object} App - Main application state.
 * @param {object} bottle - Bottle projectile.
 */
function handleBottleHitsEnemies(App, bottle) {
  App.enemies.forEach((enemy) => handleBottleHitsEnemy(App, bottle, enemy));
}

/**
 * Handles collision between one bottle and one enemy.
 *
 * @param {object} App - Main application state.
 * @param {object} bottle - Bottle projectile.
 * @param {object} enemy - Enemy entity.
 */
function handleBottleHitsEnemy(App, bottle, enemy) {
  if (shouldSkipBottleEnemyHit(bottle, enemy)) return;
  if (!isColliding(bottle, enemy)) return;
  killEnemyByBottle(App, bottle, enemy);
}

/**
 * Returns whether the bottle-enemy hit should be skipped.
 *
 * @param {object} bottle - Bottle projectile.
 * @param {object} enemy - Enemy entity.
 * @returns {boolean}
 */
function shouldSkipBottleEnemyHit(bottle, enemy) {
  if (enemy.dead) return true;
  if (bottle.dead) return true;
  return bottle.splashing;
}

/**
 * Kills one enemy after a bottle hit.
 *
 * @param {object} App - Main application state.
 * @param {object} bottle - Bottle projectile.
 * @param {object} enemy - Enemy entity.
 */
function killEnemyByBottle(App, bottle, enemy) {
  enemy.die();
  bottle.startSplash(enemy.y + enemy.h - bottle.h / 2);
  App.killedEnemies += 1;
}

/**
 * Handles collisions between bottles and the boss.
 *
 * @param {object} App - Main application state.
 */
function handleBottleBossHits(App) {
  const boss = App.endboss;
  if (!boss || boss.dead) return;
  App.projectiles.forEach((bottle) => handleBottleBossHit(App, bottle, boss));
  if (App.bossHealth <= 0) finishBossFight(boss);
}

/**
 * Handles collision between one bottle and the boss.
 *
 * @param {object} App - Main application state.
 * @param {object} bottle - Bottle projectile.
 * @param {object} boss - Boss entity.
 */
function handleBottleBossHit(App, bottle, boss) {
  if (shouldSkipBottleBossHit(bottle, boss)) return;
  if (!isColliding(bottle, boss)) return;
  applyBossBottleHit(App, bottle, boss);
}

/**
 * Returns whether the boss hit should be skipped.
 *
 * @param {object} bottle - Bottle projectile.
 * @param {object} boss - Boss entity.
 * @returns {boolean}
 */
function shouldSkipBottleBossHit(bottle, boss) {
  if (!boss || boss.dead) return true;
  if (bottle.dead) return true;
  return bottle.splashing;
}

/**
 * Applies bottle damage to the boss.
 *
 * @param {object} App - Main application state.
 * @param {object} bottle - Bottle projectile.
 * @param {object} boss - Boss entity.
 */
function applyBossBottleHit(App, bottle, boss) {
  bottle.startSplash(boss.y + boss.h * 0.6);
  App.bossHealth = Math.max(0, App.bossHealth - 20);
  App.world.shakeTime = 0.18;
  boss.takeHit();
  safePlay(App.audio.bossHit);
}

/**
 * Ends the boss fight after its health reaches zero.
 *
 * @param {object} boss - Boss entity.
 */
function finishBossFight(boss) {
  boss.die();
  setTimeout(() => winGame(), 900);
}

/**
 * Checks collisions between the player and regular enemies.
 *
 * @param {object} App - Main application state.
 * @param {number} currentTime - Current timestamp.
 */
function checkPlayerEnemyHits(App, currentTime) {
  App.enemies.forEach((enemy) => handlePlayerEnemyHit(App, enemy, currentTime));
}

/**
 * Handles collision between the player and one enemy.
 *
 * @param {object} App - Main application state.
 * @param {object} enemy - Enemy entity.
 * @param {number} currentTime - Current timestamp.
 */
function handlePlayerEnemyHit(App, enemy, currentTime) {
  if (enemy.dead) return;
  if (!isColliding(App.player, enemy)) return;
  if (isStompHit(App.player, enemy)) return stompEnemy(App, enemy);
  if (!canTakeDamage(currentTime)) return;
  applyEnemyContactDamage(App, enemy);
}

/**
 * Returns whether the player stomped the enemy.
 *
 * @param {object} player - Player entity.
 * @param {object} enemy - Enemy entity.
 * @returns {boolean}
 */
function isStompHit(player, enemy) {
  const playerBottom = player.y + player.h;
  const enemyTop = enemy.y;
  const isFalling = player.vy > 0;
  return isFalling && playerBottom - 25 < enemyTop + enemy.h * 0.5;
}

/**
 * Defeats an enemy by stomping it.
 *
 * @param {object} App - Main application state.
 * @param {object} enemy - Enemy entity.
 */
function stompEnemy(App, enemy) {
  enemy.die();
  App.killedEnemies += 1;
  App.player.vy = -320;
}

/**
 * Applies contact damage from a regular enemy.
 *
 * @param {object} App - Main application state.
 * @param {object} enemy - Enemy entity.
 */
function applyEnemyContactDamage(App, enemy) {
  const damage = enemy.damage || 20;
  applyDamage(damage);
  App.world.shakeTime = 0.2;
  App.player.takeHit();
  App.player.vx = enemy.x < App.player.x ? 150 : -150;
  App.player.vy = -150;
}

/**
 * Checks collision between the player and the boss.
 *
 * @param {object} App - Main application state.
 * @param {number} currentTime - Current timestamp.
 */
function checkPlayerBossHit(App, currentTime) {
  const boss = App.endboss;
  if (!boss || boss.dead) return;
  if (!isColliding(App.player, boss)) return;
  if (!canTakeDamage(currentTime)) return;
  applyBossContactDamage(App, boss);
}

/**
 * Applies contact damage from the boss.
 *
 * @param {object} App - Main application state.
 * @param {object} boss - Boss entity.
 */
function applyBossContactDamage(App, boss) {
  const damage = boss.isRushing ? 35 : 25;
  applyDamage(damage);
  App.world.shakeTime = 0.22;
  App.player.takeHit();
  App.player.vx = boss.x < App.player.x ? 180 : -180;
  App.player.vy = -180;
}

/**
 * Checks whether the player collects coins.
 *
 * @param {object} App - Main application state.
 */
function checkCoinCollection(App) {
  App.coins.forEach((coin) => collectCoinIfPossible(App, coin));
  App.coins = App.coins.filter((coin) => !coin.collected);
}

/**
 * Collects one coin if possible.
 *
 * @param {object} App - Main application state.
 * @param {object} coin - Coin entity.
 */
function collectCoinIfPossible(App, coin) {
  if (coin.collected) return;
  if (!isColliding(App.player, coin)) return;
  coin.collected = true;
  App.coinCount += 1;
  safePlay(App.audio.coin);
}

/**
 * Checks whether the player collects bottles.
 *
 * @param {object} App - Main application state.
 */
function checkBottleCollection(App) {
  App.groundBottles.forEach((bottle) => collectBottleIfPossible(App, bottle));
  App.groundBottles = App.groundBottles.filter((bottle) => !bottle.collected);
}

/**
 * Collects one bottle if possible.
 *
 * @param {object} App - Main application state.
 * @param {object} bottle - Ground bottle entity.
 */
function collectBottleIfPossible(App, bottle) {
  if (bottle.collected) return;
  if (!isColliding(App.player, bottle)) return;
  if (App.bottleCount >= App.maxBottles) return;
  bottle.collected = true;
  App.bottleCount += 1;
  safePlay(App.audio.bottleCollect);
}
