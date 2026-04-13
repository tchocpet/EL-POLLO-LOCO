"use strict";

/**
 * Clamps a value between a minimum and maximum.
 * @param {number} v - The value to clamp.
 * @param {number} min - The minimum allowed value.
 * @param {number} max - The maximum allowed value.
 * @returns {number} The clamped value.
 */
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/**
 * Updates the camera position based on the player position.
 * @param {object} world - The world object containing camera and level info.
 * @param {object} player - The player object with position info.
 */
function updateCamera(world, player) {
  world.camX = calculateCameraX(world, player);
  world.camX = clampCameraX(world.camX, world);
}

/**
 * Calculates the desired camera X position.
 * @param {object} world - World object
 * @param {object} player - Player object
 * @returns {number} Camera X position
 */
function calculateCameraX(world, player) {
  return player.x - world.w / 2;
}

/**
 * Clamps the camera X position within world bounds.
 * @param {number} camX - Camera X position
 * @param {object} world - World object
 * @returns {number} Clamped camera X position
 */
function clampCameraX(camX, world) {
  return Math.max(0, Math.min(camX, world.levelW - world.w));
}

/**
 * Expose camera helper functions to the global window object.
 * @global
 * @function clamp
 * @function updateCamera
 */
window.clamp = clamp;
window.updateCamera = updateCamera;
