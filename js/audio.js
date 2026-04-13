"use strict";

/**
 * Ensures all audio objects are created and configured.
 * @param {object} App - Main app state
 * @param {object} PATHS - Asset paths
 */
function ensureAudio(App, PATHS) {
  if (App.audio.bgMusic) return;
  createAllAudio(App, PATHS);
  setAudioProperties(App);
  applyMuteState(App);
}

/**
 * Creates all audio objects and assigns them to App.audio.
 * @param {object} App - Main app state
 * @param {object} PATHS - Asset paths
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
 * Sets properties for background music and walk audio.
 * @param {object} App - Main app state
 */
function setAudioProperties(App) {
  App.audio.walk.volume = 0.2;
  App.audio.bgMusic.loop = true;
  App.audio.bgMusic.volume = 0.25;
  setEffectVolumes(App);
}

/**
 * Sets volume for all effect audio objects.
 * @param {object} App - Main app state
 */
function setEffectVolumes(App) {
  App.audio.coin.volume = 0.35;
  App.audio.bottleCollect.volume = 0.35;
  App.audio.throw.volume = 0.35;
  App.audio.hurt.volume = 0.35;
  App.audio.bossHit.volume = 0.35;
}

/**
 * Applies mute state to all audio objects based on App.soundOn.
 * @param {object} App - Main app state
 */
function applyMuteState(App) {
  const muted = !App.soundOn;

  Object.values(App.audio).forEach((audio) => {
    if (!audio) return;
    audio.muted = muted;
  });
}

/**
 * Starts background music playback if enabled.
 * @param {object} App - Main app state
 */
function startBackgroundMusic(App) {
  if (!App.audio.bgMusic || !App.soundOn) return;
  App.audio.bgMusic.currentTime = 0;
  App.audio.bgMusic.play().catch(() => {});
}

/**
 * Stops background music playback and resets time.
 * @param {object} App - Main app state
 */
function stopBackgroundMusic(App) {
  if (!App.audio.bgMusic) return;
  App.audio.bgMusic.pause();
  App.audio.bgMusic.currentTime = 0;
}

window.ensureAudio = ensureAudio;
window.applyMuteState = applyMuteState;
window.startBackgroundMusic = startBackgroundMusic;
window.stopBackgroundMusic = stopBackgroundMusic;
