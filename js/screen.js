"use strict";

window.Screen = (function () {
  /**
   * Hides all elements with the class 'game-screen'.
   * Adds the 'd-none' class to each game screen element to hide it.
   */
  function hideAll() {
    document
      .querySelectorAll(".game-screen")
      .forEach((s) => s.classList.add("d-none"));
  }

  /**
   * Shows a game screen by its element ID and hides all others.
   * @param {string} id - The ID of the element to show.
   */
  function showById(id) {
    const el = document.getElementById(id);
    if (!el) return;
    hideAll();
    el.classList.remove("d-none");
    window.lastShowedScreen = el;
  }

  /**
   * Toggles the overlay on the game area.
   * @param {boolean} on - Whether to show (true) or hide (false) the overlay.
   */
  function overlay(on) {
    const wrap = document.querySelector(".game-area");
    if (wrap) wrap.classList.toggle("show-overlay", !!on);
  }

  /**
   * Sets the pause icon image depending on the paused state.
   * @param {boolean} paused - If true, shows the continue icon; otherwise, shows the pause icon.
   */
  function setPauseIcon(paused) {
    const img = document.getElementById("pause-img");
    if (!img) return;
    img.src = paused
      ? "img/10_controls/continue.png"
      : "img/10_controls/pause.png";
  }

  /**
   * Sets the sound icon images depending on the sound state.
   * @param {boolean} on - If true, shows the sound-on icon; otherwise, shows the sound-off icon.
   */
  function setSoundIcons(on) {
    document.querySelectorAll(".sound-img").forEach((img) => {
      img.src = on
        ? "img/10_controls/sound-on.png"
        : "img/10_controls/sound-off.png";
    });
  }

  return { showById, hideAll, overlay, setPauseIcon, setSoundIcons };
})();
