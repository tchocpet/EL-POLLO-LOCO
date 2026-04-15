/**
 * Loads all required game assets.
 *
 * @param {object} App - Main application state.
 * @param {object} ASSETS - Asset storage object.
 * @param {object} PATHS - Asset path configuration.
 * @returns {Promise<void>}
 */
async function ensureAssets(App, ASSETS, PATHS) {
  await loadBackgroundAsset(ASSETS, PATHS);
  await loadPlayerIdleAsset(ASSETS, PATHS);
  await loadPlayerWalkAssets(ASSETS, PATHS);
  ensureAudio(App, PATHS);
}

/**
 * Loads the scrolling background image.
 *
 * @param {object} ASSETS - Asset storage object.
 * @param {object} PATHS - Asset path configuration.
 * @returns {Promise<void>}
 */
async function loadBackgroundAsset(ASSETS, PATHS) {
  if (ASSETS.fullBackground) return;

  try {
    ASSETS.fullBackground = await loadImage(PATHS.bg.full);
  } catch (error) {
    console.error("Failed to load background:", error);
  }
}

/**
 * Loads the player idle image.
 *
 * @param {object} ASSETS - Asset storage object.
 * @param {object} PATHS - Asset path configuration.
 * @returns {Promise<void>}
 */
async function loadPlayerIdleAsset(ASSETS, PATHS) {
  if (ASSETS.playerIdle) return;
  ASSETS.playerIdle = await loadImage(PATHS.idle);
}

/**
 * Loads all player walk animation frames.
 *
 * @param {object} ASSETS - Asset storage object.
 * @param {object} PATHS - Asset path configuration.
 * @returns {Promise<void>}
 */
async function loadPlayerWalkAssets(ASSETS, PATHS) {
  if (ASSETS.playerWalk.length > 0) return;

  for (const src of PATHS.walk) {
    const image = await loadImage(src);
    ASSETS.playerWalk.push(image);
  }
}
