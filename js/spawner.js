"use strict";

/**
 * Spawns the endboss and initializes its properties in the game app.
 * @param {Object} App - The main game application object.
 */
function spawnEndboss(App) {
  App.endboss = new Boss(App.world.levelW - 360, App.world.groundY - 280);
  App.bossHealth = 100;
  App.maxBossHealth = 100;
  App.bossActive = false;
}

/**
 * Spawns all coins at predefined positions and updates the app's coin list.
 * @param {Object} App - The main game application object.
 */
function spawnCoins(App) {
  App.coins = [];

  const positions = [
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

  positions.forEach((pos) => {
    App.coins.push(new Coin(pos.x, pos.y));
  });

  App.maxCoins = App.coins.length;
}

/**
 * Spawns all enemies (big and small) at predefined positions and updates the app's enemy list.
 * @param {Object} App - The main game application object.
 */
function spawnEnemies(App) {
  App.enemies = [];

  const bigEnemies = [
    { x: 700, y: App.world.groundY - 75 },
    { x: 1500, y: App.world.groundY - 75 },
    { x: 2300, y: App.world.groundY - 75 },
  ];

  const smallEnemies = [
    { x: 1050, y: App.world.groundY - 42 },
    { x: 1850, y: App.world.groundY - 42 },
    { x: 2550, y: App.world.groundY - 42 },
  ];

  bigEnemies.forEach((pos) => {
    App.enemies.push(new Enemy(pos.x, pos.y, "big"));
  });

  smallEnemies.forEach((pos) => {
    App.enemies.push(new Enemy(pos.x, pos.y, "small"));
  });
}

/**
 * Spawns all ground bottles at predefined positions and updates the app's ground bottle list.
 * @param {Object} App - The main game application object.
 */
function spawnGroundBottles(App) {
  App.groundBottles = [];

  const positions = [
    { x: 320, y: App.world.groundY - 52 },
    { x: 520, y: App.world.groundY - 52 },
    { x: 760, y: App.world.groundY - 52 },
    { x: 980, y: App.world.groundY - 52 },
    { x: 1180, y: App.world.groundY - 52 },
    { x: 1380, y: App.world.groundY - 52 },
    { x: 1580, y: App.world.groundY - 52 },
    { x: 1780, y: App.world.groundY - 52 },
    { x: 1980, y: App.world.groundY - 52 },
    { x: 2180, y: App.world.groundY - 52 },
    { x: 2380, y: App.world.groundY - 52 },
    { x: 2580, y: App.world.groundY - 52 },
    { x: 2780, y: App.world.groundY - 52 },
    { x: 2950, y: App.world.groundY - 52 },
    { x: 3100, y: App.world.groundY - 52 },
  ];

  positions.forEach((pos) => {
    App.groundBottles.push(new GroundBottle(pos.x, pos.y));
  });
}

/**
 * Spawns clouds at fixed positions and updates the app's cloud list.
 * @param {Object} App - The main game application object.
 */
function spawnClouds(App) {
  App.clouds = [new Cloud(0), new Cloud(900), new Cloud(1800), new Cloud(2700)];
}

/**
 * Expose spawner functions to the global window object.
 * @global
 * @function spawnEndboss
 * @function spawnCoins
 * @function spawnEnemies
 * @function spawnGroundBottles
 * @function spawnClouds
 */
window.spawnEndboss = spawnEndboss;
window.spawnCoins = spawnCoins;
window.spawnEnemies = spawnEnemies;
window.spawnGroundBottles = spawnGroundBottles;
window.spawnClouds = spawnClouds;
