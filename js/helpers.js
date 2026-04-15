/**
 * Initializes the helpers module and registers its public API.
 */
function initHelpersModule() {
  registerHelpersApi();
}

/**
 * Registers helper functions on the global window object.
 */
function registerHelpersApi() {
  window.loadImage = loadImage;
  window.loadImageSafe = loadImageSafe;
  window.createAudio = createAudio;
  window.nowMs = nowMs;
}

/**
 * Loads an image asynchronously.
 *
 * @param {string} src - Image source path.
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(src) {
  return new Promise((resolve, reject) =>
    createImageLoader(src, resolve, reject),
  );
}

/**
 * Creates and configures one image loader.
 *
 * @param {string} src - Image source path.
 * @param {Function} resolve - Resolve callback.
 * @param {Function} reject - Reject callback.
 */
function createImageLoader(src, resolve, reject) {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error("Image failed: " + src));
  image.src = src;
}

/**
 * Loads an image and returns null on failure.
 *
 * @param {string} src - Image source path.
 * @returns {Promise<HTMLImageElement|null>}
 */
async function loadImageSafe(src) {
  try {
    return await loadImage(src);
  } catch (_) {
    return null;
  }
}

/**
 * Creates an audio element with preload enabled.
 *
 * @param {string} src - Audio source path.
 * @returns {HTMLAudioElement}
 */
function createAudio(src) {
  const audio = new Audio(src);
  audio.preload = "auto";
  return audio;
}

/**
 * Returns the current high-resolution timestamp.
 *
 * @returns {number}
 */
function nowMs() {
  return performance.now();
}
