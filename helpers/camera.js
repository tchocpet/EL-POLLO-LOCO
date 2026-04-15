/**
 * Initializes the camera module and registers its public API.
 */
function initCameraModule() {
  registerCameraApi();
}

/**
 * Registers camera functions on the global window object.
 */
function registerCameraApi() {
  window.clamp = clampValue;
  window.updateCamera = updateCamera;
}

/**
 * Clamps a value between a minimum and maximum.
 *
 * @param {number} value - Input value.
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 * @returns {number}
 */
function clampValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Updates the camera position based on the player position.
 *
 * @param {object} world - World state.
 * @param {object} player - Player state.
 */
function updateCamera(world, player) {
  const cameraX = calculateCameraX(world, player);
  world.camX = clampCameraX(cameraX, world);
}

/**
 * Calculates the desired camera x position.
 *
 * @param {object} world - World state.
 * @param {object} player - Player state.
 * @returns {number}
 */
function calculateCameraX(world, player) {
  return player.x - world.w / 2;
}

/**
 * Clamps the camera x position inside world bounds.
 *
 * @param {number} camX - Camera x position.
 * @param {object} world - World state.
 * @returns {number}
 */
function clampCameraX(camX, world) {
  return Math.max(0, Math.min(camX, world.levelW - world.w));
}
