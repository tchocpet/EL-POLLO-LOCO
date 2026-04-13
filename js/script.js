"use strict";

/**
 * script.js
 * Nur UI, Story und Screen-Helfer.
 * Kein init(), damit game.js nicht überschrieben wird.
 */

(function () {
  const $ = (id) => document.getElementById(id);
  const screenIds = [
    "screen-start",
    "screen-loading",
    "screen--story",
    "screen-controls",
    "screen-rotate",
    "confirm-dialog",
    "screen-end-lose",
    "screen-end-win",
  ];

  const STORYLINES = [
    "Long ago, in a dusty desert village, chickens lived peacefully under the blazing sun.",
    "But everything changed when a strange glowing egg crashed from the sky.",
    "One chicken touched it... and transformed into something unstoppable.",
    "El Pollo Loco was born — faster, stronger, and completely out of control.",
    "Now she commands an army of wild chickens, guarding her territory with chaos and fury.",
    "You are the last brave adventurer who dares to challenge her.",
    "Fight your way through the desert, survive the madness, and defeat El Pollo Loco.",
    "Only then will peace return to the land.",
  ];

  let storyIndex = 0;
  let charIndex = 0;
  let typingTimer = null;
  let skipRequested = false;

  /**
   * Hide all game screens.
   */
  function hideAllScreens() {
    screenIds.forEach((id) => $(id)?.classList.add("d-none"));
  }

  /**
   * Show one screen by id.
   * @param {string} id - Screen id.
   */
  function showScreen(id) {
    if (window.Screen?.showById) {
      window.Screen.showById(id);
      return;
    }

    hideAllScreens();
    $(id)?.classList.remove("d-none");
  }

  /**
   * Show or hide mobile control buttons.
   */
  function toggleMobileBtns() {
    const el = $("game-area-bottom");
    if (!el) return;

    const isSmall = Math.min(window.innerWidth, window.innerHeight) <= 900;
    const isTouch =
      "ontouchstart" in window ||
      (navigator.maxTouchPoints || 0) > 0 ||
      /Android|iPhone|iPad|Mobi/i.test(navigator.userAgent);

    el.style.display = isSmall || isTouch ? "flex" : "none";
  }

  /**
   * Decide if rotate screen should be shown.
   */
  function decideInitialView() {
    const isPortrait = window.innerHeight > window.innerWidth;
    const isSmall = Math.min(window.innerWidth, window.innerHeight) <= 900;
    const isTablet = /iPad|Tablet|Android(?!.*Mobile)/i.test(
      navigator.userAgent,
    );

    if (isPortrait && (isSmall || isTablet)) {
      showScreen("screen-rotate");
      return;
    }

    showScreen("screen-start");
  }

  /**
   * Update responsive UI.
   */
  function updateResponsiveUi() {
    toggleMobileBtns();
    decideInitialView();
  }

  /**
   * Clear current typing interval.
   */
  function clearTyping() {
    if (!typingTimer) return;
    clearInterval(typingTimer);
    typingTimer = null;
  }

  /**
   * Request skip for current story line.
   */
  function skipTyping() {
    skipRequested = true;
  }

  /**
   * Type one story line.
   * @param {string} line - Text line.
   * @param {Function} onDone - Callback after line is done.
   */
  function typeLine(line, onDone) {
    const textEl = $("story-p");
    if (!textEl) return;
    prepareTyping(textEl);
    typingTimer = setInterval(() => {
      if (handleSkipRequested(line, textEl, onDone)) return;
      typeNextChar(line, textEl, onDone);
    }, 32);
  }

  /**
   * Prepare the text element for typing by clearing previous content and resetting the character index.
   * @param {HTMLElement} textEl - The text element to prepare.
   */
  function prepareTyping(textEl) {
    clearTyping();
    textEl.textContent = "";
    charIndex = 0;
  }

  /**
   * Handles the skip request during typing. If skip is requested, immediately finishes the line.
   * @param {string} line - The line to display.
   * @param {HTMLElement} textEl - The text element to update.
   * @param {Function} onDone - Callback after line is done.
   * @returns {boolean} True if skip was handled, otherwise false.
   */
  function handleSkipRequested(line, textEl, onDone) {
    if (skipRequested) {
      skipRequested = false;
      clearTyping();
      textEl.textContent = line;
      setTimeout(onDone, 700);
      return true;
    }
    return false;
  }

  /**
   * Types the next character of the line into the text element.
   * @param {string} line - The line to type.
   * @param {HTMLElement} textEl - The text element to update.
   * @param {Function} onDone - Callback after line is done.
   */
  function typeNextChar(line, textEl, onDone) {
    textEl.textContent += line.charAt(charIndex);
    charIndex++;
    if (charIndex >= line.length) {
      clearTyping();
      setTimeout(onDone, 500);
    }
  }

  /**
   * Start story typing flow.
   */
  function startStoryTelling() {
    function showNextLine() {
      if (storyIndex >= STORYLINES.length) {
        setupStoryStartButton();
        return;
      }

      const line = STORYLINES[storyIndex];
      storyIndex++;
      typeLine(line, showNextLine);
    }

    showNextLine();
  }

  /**
   * Configure skip button as start button.
   */
  function setupStoryStartButton() {
    const btn = $("skip-btn");
    if (!btn) return;

    btn.innerText = "Start";
    btn.onclick = () => {
      if (typeof window.startLoading === "function") {
        window.startLoading();
      }
    };
  }

  /**
   * Open control screen.
   */
  function goToControlScreen() {
    showScreen("screen-controls");
  }

  /**
   * Open story screen and reset story.
   */
  function goToBgstoryScreen() {
    showScreen("screen--story");
    storyIndex = 0;
    charIndex = 0;
    skipRequested = false;

    const btn = $("skip-btn");
    if (btn) {
      btn.innerText = "Skip";
      btn.onclick = skipTyping;
    }

    startStoryTelling();
  }

  /**
   * Leave story screen and return home.
   */
  function storyScreenGoBack() {
    clearTyping();
    showScreen("screen-start");
  }

  /**
   * Return to start screen.
   */
  function goBackToStartScreen() {
    showScreen("screen-start");
  }

  /**
   * Update loading button text.
   * @param {number} percent - Loading percent.
   * @param {string} text - Loading label.
   */
  function setLoadingBtnText(percent, text) {
    const btn = $("loading-btn");
    if (!btn) return;
    btn.innerText = `${text} ... ${percent}%`;
  }

  /**
   * Add hover sound to sound buttons.
   */
  function addButtonHoverEventListener() {
    document.querySelectorAll(".sound-btn").forEach(addHoverHandler);
  }

  /**
   * Add hover sound handler to a button.
   * @param {HTMLElement} btn - Button element.
   */
  function addHoverHandler(btn) {
    const path = "audio/button-hover.mp3";

    btn.addEventListener("mouseenter", () => {
      const audioUnlocked = localStorage.getItem("audioUnlocked") === "true";
      if (!audioUnlocked) return;

      const audio = new Audio(path);
      audio.currentTime = 0;
      audio.play().catch(() => {});
    });
  }

  /**
   * Setup responsive listeners.
   */
  function bindResponsiveEvents() {
    window.addEventListener("resize", updateResponsiveUi, { passive: true });
    window.addEventListener("orientationchange", updateResponsiveUi, {
      passive: true,
    });
  }

  /**
   * Run script setup after DOM is ready.
   */
  function setupUi() {
    updateResponsiveUi();
    bindResponsiveEvents();
    addButtonHoverEventListener();
  }

  document.addEventListener("DOMContentLoaded", setupUi);

  /**
   * Expose public UI/story functions to the global window object.
   * @global
   * @function toggleMobileBtns
   * @function goToControlScreen
   * @function goToBgstoryScreen
   * @function storyScreenGoBack
   * @function goBackToStartScreen
   * @function skipTyping
   * @function startStoryTelling
   * @function setLoadingBtnText
   * @function addButtonHoverEventListener
   */
  window.toggleMobileBtns = toggleMobileBtns;
  window.goToControlScreen = goToControlScreen;
  window.goToBgstoryScreen = goToBgstoryScreen;
  window.storyScreenGoBack = storyScreenGoBack;
  window.goBackToStartScreen = goBackToStartScreen;
  window.skipTyping = skipTyping;
  window.startStoryTelling = startStoryTelling;
  window.setLoadingBtnText = setLoadingBtnText;
  window.addButtonHoverEventListener = addButtonHoverEventListener;
})();
