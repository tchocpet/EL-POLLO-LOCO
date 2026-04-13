"use strict";

/**
 * Loads an image asynchronously.
 * @param {string} src - Image source path
 * @returns {Promise<HTMLImageElement>} Promise resolving to the loaded image
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image failed: " + src));
    img.src = src;
  });
}

/**
 * Loads an image asynchronously, returns null if loading fails.
 * @param {string} src - Image source path
 * @returns {Promise<HTMLImageElement|null>} Promise resolving to the loaded image or null
 */
async function loadImageSafe(src) {
  try {
    return await loadImage(src);
  } catch (_) {
    return null;
  }
}

window.loadImageSafe = loadImageSafe;

/**
 * Creates an audio element with preload enabled.
 * @param {string} src - Audio source path
 * @returns {HTMLAudioElement} The created audio element
 */
function createAudio(src) {
  const audio = new Audio(src);
  audio.preload = "auto";
  return audio;
}

/**
 * Returns the current high-resolution timestamp in milliseconds.
 * @returns {number} Current time in ms
 */
function nowMs() {
  return performance.now();
}

window.loadImage = loadImage;
window.createAudio = createAudio;
window.nowMs = nowMs;
