/**
 * Initializes the audio module and registers its public API.
 */
function initAudioModule() {
  registerAudioApi();
}

/**
 * Registers audio functions on the global window object.
 */
function registerAudioApi() {
  window.ensureAudio = ensureAudio;
  window.applyMuteState = applyMuteState;
  window.startBackgroundMusic = startBackgroundMusic;
  window.stopBackgroundMusic = stopBackgroundMusic;
}

/**
 * Ensures all audio objects are created and configured.
 *
 * @param {object} App - Main application state.
 * @param {object} PATHS - Asset path configuration.
 */
function ensureAudio(App, PATHS) {
  if (App.audio.bgMusic) return;
  createAllAudio(App, PATHS);
  configureAudio(App);
  applyMuteState(App);
}

/**
 * Creates all audio objects.
 *
 * @param {object} App - Main application state.
 * @param {object} PATHS - Asset path configuration.
 */
function createAllAudio(App, PATHS) {
  App.audio.walk = createAudio(PATHS.audio.walk);
  App.audio.bgMusic = createAudio(PATHS.audio.bgMusic);
  App.audio.coin = createAudio(PATHS.audio.coin);
  App.audio.bottleCollect = createAudio(PATHS.audio.bottleCollect);
  App.audio.throw = createAudio(PATHS.audio.throw);
  App.audio.hurt = createAudio(PATHS.audio.hurt);
  App.audio.bossHit = createAudio(PATHS.audio.bossHit);
}

/**
 * Configures all audio properties.
 *
 * @param {object} App - Main application state.
 */
function configureAudio(App) {
  configureWalkAudio(App);
  configureBackgroundMusic(App);
  configureEffectVolumes(App);
}

/**
 * Configures the walk sound.
 *
 * @param {object} App - Main application state.
 */
function configureWalkAudio(App) {
  App.audio.walk.volume = 0.2;
}

/**
 * Configures the background music.
 *
 * @param {object} App - Main application state.
 */
function configureBackgroundMusic(App) {
  App.audio.bgMusic.loop = true;
  App.audio.bgMusic.volume = 0.25;
}

/**
 * Configures the effect sound volumes.
 *
 * @param {object} App - Main application state.
 */
function configureEffectVolumes(App) {
  App.audio.coin.volume = 0.35;
  App.audio.bottleCollect.volume = 0.35;
  App.audio.throw.volume = 0.35;
  App.audio.hurt.volume = 0.35;
  App.audio.bossHit.volume = 0.35;
}

/**
 * Applies the mute state to all audio objects.
 *
 * @param {object} App - Main application state.
 */
function applyMuteState(App) {
  const muted = !App.soundOn;
  Object.values(App.audio).forEach((audio) => applyMuteValue(audio, muted));
}

/**
 * Applies one mute value to one audio object.
 *
 * @param {HTMLAudioElement|null} audio - Audio element.
 * @param {boolean} muted - Mute state.
 */
function applyMuteValue(audio, muted) {
  if (!audio) return;
  audio.muted = muted;
}

/**
 * Starts background music playback.
 *
 * @param {object} App - Main application state.
 */
function startBackgroundMusic(App) {
  if (!canPlayBackgroundMusic(App)) return;
  resetBackgroundMusic(App);
  App.audio.bgMusic.play().catch(() => {});
}

/**
 * Returns whether background music may play.
 *
 * @param {object} App - Main application state.
 * @returns {boolean}
 */
function canPlayBackgroundMusic(App) {
  if (!App.audio.bgMusic) return false;
  return App.soundOn;
}

/**
 * Resets the background music time.
 *
 * @param {object} App - Main application state.
 */
function resetBackgroundMusic(App) {
  App.audio.bgMusic.currentTime = 0;
}

/**
 * Stops background music playback.
 *
 * @param {object} App - Main application state.
 */
function stopBackgroundMusic(App) {
  if (!App.audio.bgMusic) return;
  App.audio.bgMusic.pause();
  App.audio.bgMusic.currentTime = 0;
}
