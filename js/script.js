/**
 * Initializes the UI module and registers its public API.
 */
function initUiModule() {
  const uiModule = createUiModule();
  uiModule.registerUiApi();
}

/**
 * Creates the UI module.
 *
 * @returns {{registerUiApi: Function}}
 */
function createUiModule() {
  const screenIds = createScreenIds();
  const storyLines = createStoryLines();

  let storyIndex = 0;
  let charIndex = 0;
  let typingTimer = null;
  let skipRequested = false;

  /**
   * Returns an element by id.
   *
   * @param {string} id - Element id.
   * @returns {HTMLElement|null}
   */
  function $(id) {
    return document.getElementById(id);
  }

  /**
   * Initializes all UI behavior.
   */
  function initUi() {
    updateResponsiveUi();
    bindResponsiveEvents();
    addButtonHoverEventListener();
  }

  /**
   * Registers public UI functions.
   */
  function registerUiApi() {
    window.initUi = initUi;
    window.toggleMobileBtns = toggleMobileBtns;
    window.goToControlScreen = goToControlScreen;
    window.goToBgstoryScreen = goToBgstoryScreen;
    window.storyScreenGoBack = storyScreenGoBack;
    window.goBackToStartScreen = goBackToStartScreen;
    window.skipTyping = skipTyping;
    window.startStoryTelling = startStoryTelling;
    window.setLoadingBtnText = setLoadingBtnText;
  }

  /**
   * Hides all known screens.
   */
  function hideAllScreens() {
    screenIds.forEach(hideScreen);
  }

  /**
   * Hides one screen.
   *
   * @param {string} id - Screen id.
   */
  function hideScreen(id) {
    $(id)?.classList.add("d-none");
  }

  /**
   * Shows one screen.
   *
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
   * Updates mobile button visibility.
   */
  function toggleMobileBtns() {
    const element = $("game-area-bottom");
    if (!element) return;
    element.style.display = shouldShowMobileBtns() ? "flex" : "none";
  }

  /**
   * Returns whether mobile buttons should be shown.
   *
   * @returns {boolean}
   */
  function shouldShowMobileBtns() {
    return true;
  }

  /**
   * Returns whether the screen is small.
   *
   * @returns {boolean}
   */
  function isSmallScreen() {
    return Math.min(window.innerWidth, window.innerHeight) <= 900;
  }

  /**
   * Returns whether the current device is touch-enabled.
   *
   * @returns {boolean}
   */
  function isTouchDevice() {
    if ("ontouchstart" in window) return true;
    if ((navigator.maxTouchPoints || 0) > 0) return true;
    return /Android|iPhone|iPad|Mobi/i.test(navigator.userAgent);
  }

  /**
   * Decides which initial screen should be shown.
   */
  function decideInitialView() {
    if (shouldShowRotateScreen()) {
      showScreen("screen-rotate");
      return;
    }
    showScreen("screen-start");
  }

  /**
   * Returns whether the rotate screen should be shown.
   *
   * @returns {boolean}
   */
  function shouldShowRotateScreen() {
    return isPortraitMode() && shouldUseMobileLayout();
  }

  /**
   * Returns whether the display is in portrait mode.
   *
   * @returns {boolean}
   */
  function isPortraitMode() {
    return window.innerHeight > window.innerWidth;
  }

  /**
   * Returns whether mobile layout rules should apply.
   *
   * @returns {boolean}
   */
  function shouldUseMobileLayout() {
    return isSmallScreen() || isTabletDevice();
  }

  /**
   * Returns whether the current device looks like a tablet.
   *
   * @returns {boolean}
   */
  function isTabletDevice() {
    return /iPad|Tablet|Android(?!.*Mobile)/i.test(navigator.userAgent);
  }

  /**
   * Updates all responsive UI parts.
   */
  function updateResponsiveUi() {
    toggleMobileBtns();
    decideInitialView();
  }

  /**
   * Clears the current typing interval.
   */
  function clearTyping() {
    if (!typingTimer) return;
    clearInterval(typingTimer);
    typingTimer = null;
  }

  /**
   * Requests skipping the current typing animation.
   */
  function skipTyping() {
    skipRequested = true;
  }

  /**
   * Types one story line.
   *
   * @param {string} line - Story line text.
   * @param {Function} onDone - Callback after the line is done.
   */
  function typeLine(line, onDone) {
    const textElement = $("story-p");
    if (!textElement) return;
    prepareTyping(textElement);
    typingTimer = setInterval(
      () => runTypingStep(line, textElement, onDone),
      32,
    );
  }

  /**
   * Prepares the typing state.
   *
   * @param {HTMLElement} textElement - Story text element.
   */
  function prepareTyping(textElement) {
    clearTyping();
    textElement.textContent = "";
    charIndex = 0;
  }

  /**
   * Runs one typing step.
   *
   * @param {string} line - Story line text.
   * @param {HTMLElement} textElement - Story text element.
   * @param {Function} onDone - Callback after the line is done.
   */
  function runTypingStep(line, textElement, onDone) {
    if (handleSkipRequested(line, textElement, onDone)) return;
    typeNextChar(line, textElement, onDone);
  }

  /**
   * Handles skip behavior during typing.
   *
   * @param {string} line - Story line text.
   * @param {HTMLElement} textElement - Story text element.
   * @param {Function} onDone - Callback after the line is done.
   * @returns {boolean}
   */
  function handleSkipRequested(line, textElement, onDone) {
    if (!skipRequested) return false;
    skipRequested = false;
    clearTyping();
    textElement.textContent = line;
    setTimeout(onDone, 700);
    return true;
  }

  /**
   * Types the next character.
   *
   * @param {string} line - Story line text.
   * @param {HTMLElement} textElement - Story text element.
   * @param {Function} onDone - Callback after the line is done.
   */
  function typeNextChar(line, textElement, onDone) {
    textElement.textContent += line.charAt(charIndex);
    charIndex += 1;
    if (charIndex < line.length) return;
    clearTyping();
    setTimeout(onDone, 500);
  }

  /**
   * Starts the full story flow.
   */
  function startStoryTelling() {
    showNextLine();
  }

  /**
   * Shows the next story line.
   */
  function showNextLine() {
    if (storyIndex >= storyLines.length) {
      setupStoryStartButton();
      return;
    }
    const line = storyLines[storyIndex];
    storyIndex += 1;
    typeLine(line, showNextLine);
  }

  /**
   * Configures the story button as start button.
   */
  function setupStoryStartButton() {
    const button = $("skip-btn");
    if (!button) return;
    button.innerText = "Start";
    button.onclick = handleStoryStartClick;
  }

  /**
   * Starts the game from the story screen.
   */
  function handleStoryStartClick() {
    if (typeof window.startLoading === "function") {
      window.startLoading();
    }
  }

  /**
   * Opens the controls screen.
   */
  function goToControlScreen() {
    showScreen("screen-controls");
  }

  /**
   * Opens the story screen.
   */
  function goToBgstoryScreen() {
    showScreen("screen--story");
    resetStoryState();
    setupSkipButton();
    startStoryTelling();
  }

  /**
   * Resets story state values.
   */
  function resetStoryState() {
    storyIndex = 0;
    charIndex = 0;
    skipRequested = false;
  }

  /**
   * Configures the skip button.
   */
  function setupSkipButton() {
    const button = $("skip-btn");
    if (!button) return;
    button.innerText = "Skip";
    button.onclick = skipTyping;
  }

  /**
   * Leaves the story screen.
   */
  function storyScreenGoBack() {
    clearTyping();
    showScreen("screen-start");
  }

  /**
   * Returns to the start screen.
   */
  function goBackToStartScreen() {
    showScreen("screen-start");
  }

  /**
   * Updates the loading button text.
   *
   * @param {number} percent - Loading percentage.
   * @param {string} text - Loading label.
   */
  function setLoadingBtnText(percent, text) {
    const button = $("loading-btn");
    if (!button) return;
    button.innerText = `${text} ... ${percent}%`;
  }

  /**
   * Adds hover audio behavior to sound buttons.
   */
  function addButtonHoverEventListener() {
    document.querySelectorAll(".sound-btn").forEach(addHoverHandler);
  }

  /**
   * Adds one hover handler.
   *
   * @param {HTMLElement} button - Button element.
   */
  function addHoverHandler(button) {
    button.addEventListener("mouseenter", playHoverSoundIfUnlocked);
  }

  /**
   * Plays the hover sound if audio is unlocked.
   */
  function playHoverSoundIfUnlocked() {
    if (!isAudioUnlocked()) return;
    playHoverSound();
  }

  /**
   * Returns whether UI audio is unlocked.
   *
   * @returns {boolean}
   */
  function isAudioUnlocked() {
    return localStorage.getItem("audioUnlocked") === "true";
  }

  /**
   * Plays the hover sound.
   */
  function playHoverSound() {
    const audio = new Audio("audio/button-hover.mp3");
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  /**
   * Binds responsive event listeners.
   */
  function bindResponsiveEvents() {
    window.addEventListener("resize", updateResponsiveUi, { passive: true });
    window.addEventListener("orientationchange", updateResponsiveUi, {
      passive: true,
    });
  }

  return { registerUiApi };
}

/**
 * Returns the list of screen ids.
 *
 * @returns {string[]}
 */
function createScreenIds() {
  return [
    "screen-start",
    "screen-loading",
    "screen--story",
    "screen-controls",
    "screen-rotate",
    "confirm-dialog",
    "screen-end-lose",
    "screen-end-win",
  ];
}

/**
 * Returns the list of story lines.
 *
 * @returns {string[]}
 */
function createStoryLines() {
  return [
    "Long ago, in a dusty desert village, chickens lived peacefully under the blazing sun.",
    "But everything changed when a strange glowing egg crashed from the sky.",
    "One chicken touched it... and transformed into something unstoppable.",
    "El Pollo Loco was born — faster, stronger, and completely out of control.",
    "Now she commands an army of wild chickens, guarding her territory with chaos and fury.",
    "You are the last brave adventurer who dares to challenge her.",
    "Fight your way through the desert, survive the madness, and defeat El Pollo Loco.",
    "Only then will peace return to the land.",
  ];
}
