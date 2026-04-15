/**
 * Initializes the Screen module and registers its public API.
 */
function initScreenModule() {
  registerScreenApi();
}

/**
 * Registers the Screen API on the global window object.
 */
function registerScreenApi() {
  window.Screen = {
    showById,
    hideAll,
    overlay,
    setPauseIcon,
    setSoundIcons,
  };
}

/**
 * Hides all elements with the class 'game-screen'.
 */
function hideAll() {
  document
    .querySelectorAll(".game-screen")
    .forEach((screen) => screen.classList.add("d-none"));
}

/**
 * Shows a specific screen by its ID and hides all others.
 *
 * @param {string} id - The ID of the screen to display.
 */
function showById(id) {
  const element = document.getElementById(id);
  if (!element) return;
  hideAll();
  element.classList.remove("d-none");
  window.lastShowedScreen = element;
}

/**
 * Toggles the overlay on the game area.
 *
 * @param {boolean} on - True to show the overlay, false to hide it.
 */
function overlay(on) {
  const wrapper = document.querySelector(".game-area");
  if (!wrapper) return;
  wrapper.classList.toggle("show-overlay", Boolean(on));
}

/**
 * Updates the pause icon based on the paused state.
 *
 * @param {boolean} paused - Indicates whether the game is paused.
 */
function setPauseIcon(paused) {
  const img = document.getElementById("pause-img");
  if (!img) return;
  img.src = paused
    ? "img/10_controls/continue.png"
    : "img/10_controls/pause.png";
}

/**
 * Updates all sound icons based on the sound state.
 *
 * @param {boolean} on - Indicates whether the sound is enabled.
 */
function setSoundIcons(on) {
  document.querySelectorAll(".sound-img").forEach((img) => {
    img.src = on
      ? "img/10_controls/sound-on.png"
      : "img/10_controls/sound-off.png";
  });
}
