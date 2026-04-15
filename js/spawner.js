/**
 * Initializes the spawner module and registers its public API.
 */
function initSpawnerModule() {
  registerSpawnerApi();
}

/**
 * Registers spawner functions on the global window object.
 */
function registerSpawnerApi() {
  window.spawnEndboss = spawnEndboss;
  window.spawnCoins = spawnCoins;
  window.spawnEnemies = spawnEnemies;
  window.spawnGroundBottles = spawnGroundBottles;
  window.spawnClouds = spawnClouds;
}

/**
 * Spawns the end boss and resets boss values.
 *
 * @param {object} App - Main application state.
 */
function spawnEndboss(App) {
  App.endboss = createEndboss(App);
  App.bossHealth = 100;
  App.maxBossHealth = 100;
  App.bossActive = false;
}

/**
 * Creates the end boss instance.
 *
 * @param {object} App - Main application state.
 * @returns {Boss}
 */
function createEndboss(App) {
  const x = App.world.levelW - 360;
  const y = App.world.groundY - 280;
  return new Boss(x, y);
}

/**
 * Spawns all coins and updates max coin count.
 *
 * @param {object} App - Main application state.
 */
function spawnCoins(App) {
  App.coins = [];
  getCoinPositions(App).forEach((position) => spawnCoinAt(App, position));
  App.maxCoins = App.coins.length;
}

/**
 * Spawns one coin at a given position.
 *
 * @param {object} App - Main application state.
 * @param {{x:number,y:number}} position - Coin position.
 */
function spawnCoinAt(App, position) {
  App.coins.push(new Coin(position.x, position.y));
}

/**
 * Returns all coin positions.
 *
 * @param {object} App - Main application state.
 * @returns {Array<{x:number,y:number}>}
 */
function getCoinPositions(App) {
  return [
    { x: 260, y: App.world.groundY - 120 },
    { x: 320, y: App.world.groundY - 165 },
    { x: 380, y: App.world.groundY - 120 },
    { x: 760, y: App.world.groundY - 100 },
    { x: 820, y: App.world.groundY - 140 },
    { x: 880, y: App.world.groundY - 180 },
    { x: 940, y: App.world.groundY - 140 },
    { x: 1000, y: App.world.groundY - 100 },
    { x: 1420, y: App.world.groundY - 120 },
    { x: 1500, y: App.world.groundY - 120 },
    { x: 1960, y: App.world.groundY - 110 },
    { x: 2020, y: App.world.groundY - 150 },
    { x: 2080, y: App.world.groundY - 110 },
    { x: 2550, y: App.world.groundY - 130 },
    { x: 2630, y: App.world.groundY - 170 },
    { x: 2710, y: App.world.groundY - 130 },
  ];
}

/**
 * Spawns all enemies.
 *
 * @param {object} App - Main application state.
 */
function spawnEnemies(App) {
  App.enemies = [];
  spawnBigEnemies(App);
  spawnSmallEnemies(App);
}

/**
 * Spawns all big enemies.
 *
 * @param {object} App - Main application state.
 */
function spawnBigEnemies(App) {
  getBigEnemyPositions(App).forEach((position) =>
    spawnBigEnemyAt(App, position),
  );
}

/**
 * Spawns one big enemy.
 *
 * @param {object} App - Main application state.
 * @param {{x:number,y:number}} position - Enemy position.
 */
function spawnBigEnemyAt(App, position) {
  App.enemies.push(new Enemy(position.x, position.y, "big"));
}

/**
 * Returns all big enemy positions.
 *
 * @param {object} App - Main application state.
 * @returns {Array<{x:number,y:number}>}
 */
function getBigEnemyPositions(App) {
  return [
    { x: 700, y: App.world.groundY - 75 },
    { x: 1500, y: App.world.groundY - 75 },
    { x: 2300, y: App.world.groundY - 75 },
  ];
}

/**
 * Spawns all small enemies.
 *
 * @param {object} App - Main application state.
 */
function spawnSmallEnemies(App) {
  getSmallEnemyPositions(App).forEach((position) =>
    spawnSmallEnemyAt(App, position),
  );
}

/**
 * Spawns one small enemy.
 *
 * @param {object} App - Main application state.
 * @param {{x:number,y:number}} position - Enemy position.
 */
function spawnSmallEnemyAt(App, position) {
  App.enemies.push(new Enemy(position.x, position.y, "small"));
}

/**
 * Returns all small enemy positions.
 *
 * @param {object} App - Main application state.
 * @returns {Array<{x:number,y:number}>}
 */
function getSmallEnemyPositions(App) {
  return [
    { x: 1050, y: App.world.groundY - 42 },
    { x: 1850, y: App.world.groundY - 42 },
    { x: 2550, y: App.world.groundY - 42 },
  ];
}

/**
 * Spawns all ground bottles.
 *
 * @param {object} App - Main application state.
 */
function spawnGroundBottles(App) {
  App.groundBottles = [];
  getGroundBottlePositions(App).forEach((position) =>
    spawnGroundBottleAt(App, position),
  );
}

/**
 * Spawns one ground bottle.
 *
 * @param {object} App - Main application state.
 * @param {{x:number,y:number}} position - Bottle position.
 */
function spawnGroundBottleAt(App, position) {
  App.groundBottles.push(new GroundBottle(position.x, position.y));
}

/**
 * Returns all ground bottle positions.
 *
 * @param {object} App - Main application state.
 * @returns {Array<{x:number,y:number}>}
 */
function getGroundBottlePositions(App) {
  return [
    { x: 320, y: App.world.groundY - 46 },
    { x: 520, y: App.world.groundY - 46 },
    { x: 760, y: App.world.groundY - 46 },
    { x: 980, y: App.world.groundY - 46 },
    { x: 1180, y: App.world.groundY - 46 },
    { x: 1380, y: App.world.groundY - 46 },
    { x: 1580, y: App.world.groundY - 46 },
    { x: 1780, y: App.world.groundY - 46 },
    { x: 1980, y: App.world.groundY - 46 },
    { x: 2180, y: App.world.groundY - 46 },
    { x: 2380, y: App.world.groundY - 46 },
    { x: 2580, y: App.world.groundY - 46 },
    { x: 2780, y: App.world.groundY - 46 },
    { x: 2950, y: App.world.groundY - 46 },
    { x: 3100, y: App.world.groundY - 46 },
  ];
}

/**
 * Spawns all clouds.
 *
 * @param {object} App - Main application state.
 */
function spawnClouds(App) {
  App.clouds = createCloudList();
}

/**
 * Creates the cloud list.
 *
 * @returns {Cloud[]}
 */
function createCloudList() {
  return [new Cloud(0), new Cloud(900), new Cloud(1800), new Cloud(2700)];
}
