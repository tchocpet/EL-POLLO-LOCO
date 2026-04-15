/**
 * Binds all keyboard input events.
 *
 * @param {object} App - Main application state.
 */
function bindKeyboard(App) {
  window.addEventListener("keydown", (event) => onKeyDown(App, event), {
    capture: true,
  });
  window.addEventListener("keyup", (event) => onKeyUp(App, event), {
    capture: true,
  });
  window.addEventListener("blur", () => resetInput(App));
}

/**
 * Handles keydown events.
 *
 * @param {object} App - Main application state.
 * @param {KeyboardEvent} event - Keyboard event.
 */
function onKeyDown(App, event) {
  preventGameScrollKeys(event);
  setKeyState(App, event.code, true);
}

/**
 * Handles keyup events.
 *
 * @param {object} App - Main application state.
 * @param {KeyboardEvent} event - Keyboard event.
 */
function onKeyUp(App, event) {
  setKeyState(App, event.code, false);
}

/**
 * Prevents browser scrolling for gameplay keys.
 *
 * @param {KeyboardEvent} event - Keyboard event.
 */
function preventGameScrollKeys(event) {
  const blockedKeys = [
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Space",
  ];

  if (blockedKeys.includes(event.code)) {
    event.preventDefault();
  }
}

/**
 * Updates one keyboard input flag.
 *
 * @param {object} App - Main application state.
 * @param {string} code - Keyboard code.
 * @param {boolean} isDown - Current pressed state.
 */
function setKeyState(App, code, isDown) {
  if (isLeftKey(code)) App.input.left = isDown;
  if (isRightKey(code)) App.input.right = isDown;
  if (isJumpKey(code)) App.input.jump = isDown;
  if (isThrowKey(code)) App.input.fire = isDown;
}

/**
 * Checks whether the key is a left movement key.
 *
 * @param {string} code - Keyboard code.
 * @returns {boolean}
 */
function isLeftKey(code) {
  return code === "ArrowLeft" || code === "KeyA";
}

/**
 * Checks whether the key is a right movement key.
 *
 * @param {string} code - Keyboard code.
 * @returns {boolean}
 */
function isRightKey(code) {
  return code === "ArrowRight" || code === "KeyD";
}

/**
 * Checks whether the key is a jump key.
 *
 * @param {string} code - Keyboard code.
 * @returns {boolean}
 */
function isJumpKey(code) {
  return code === "Space" || code === "KeyW" || code === "ArrowUp";
}

/**
 * Checks whether the key is a throw key.
 *
 * @param {string} code - Keyboard code.
 * @returns {boolean}
 */
function isThrowKey(code) {
  return code === "KeyJ";
}

/**
 * Resets all input flags.
 *
 * @param {object} App - Main application state.
 */
function resetInput(App) {
  App.input.left = false;
  App.input.right = false;
  App.input.jump = false;
  App.input.fire = false;
}

/**
 * Binds all mobile control buttons.
 *
 * @param {object} App - Main application state.
 */
function bindMobile(App) {
  const buttons = document.querySelectorAll(".mobile-control-btn");
  buttons.forEach((button) => bindMobileButton(App, button));
}

/**
 * Binds one mobile button with press and release events.
 *
 * @param {object} App - Main application state.
 * @param {HTMLElement} button - Button element.
 */
function bindMobileButton(App, button) {
  const press = createPressHandler(App, button.id);
  const release = createReleaseHandler(App, button.id);
  bindPointerEvents(button, press, release);
  bindTouchEvents(button, press, release);
  bindMouseEvents(button, press, release);
}

/**
 * Creates a press handler for a mobile button.
 *
 * @param {object} App - Main application state.
 * @param {string} id - Button id.
 * @returns {(event: Event) => void}
 */
function createPressHandler(App, id) {
  return (event) => handleMobileInputEvent(App, event, id, true);
}

/**
 * Creates a release handler for a mobile button.
 *
 * @param {object} App - Main application state.
 * @param {string} id - Button id.
 * @returns {(event: Event) => void}
 */
function createReleaseHandler(App, id) {
  return (event) => handleMobileInputEvent(App, event, id, false);
}

/**
 * Handles one mobile input event.
 *
 * @param {object} App - Main application state.
 * @param {Event} event - Input event.
 * @param {string} id - Button id.
 * @param {boolean} isDown - Current pressed state.
 */
function handleMobileInputEvent(App, event, id, isDown) {
  if (event.cancelable) event.preventDefault();
  event.stopPropagation();
  setMobileInput(App, id, isDown);
}

/**
 * Binds pointer events for one button.
 *
 * @param {HTMLElement} button - Button element.
 * @param {(event: Event) => void} press - Press handler.
 * @param {(event: Event) => void} release - Release handler.
 */
function bindPointerEvents(button, press, release) {
  button.addEventListener("pointerdown", press, { passive: false });
  button.addEventListener("pointerup", release, { passive: false });
  button.addEventListener("pointercancel", release, { passive: false });
  button.addEventListener("pointerleave", release, { passive: false });
}

/**
 * Binds touch events for one button.
 *
 * @param {HTMLElement} button - Button element.
 * @param {(event: Event) => void} press - Press handler.
 * @param {(event: Event) => void} release - Release handler.
 */
function bindTouchEvents(button, press, release) {
  button.addEventListener("touchstart", press, { passive: false });
  button.addEventListener("touchend", release, { passive: false });
  button.addEventListener("touchcancel", release, { passive: false });
}

/**
 * Binds mouse events for one button.
 *
 * @param {HTMLElement} button - Button element.
 * @param {(event: Event) => void} press - Press handler.
 * @param {(event: Event) => void} release - Release handler.
 */
function bindMouseEvents(button, press, release) {
  button.addEventListener("mousedown", press);
  button.addEventListener("mouseup", release);
  button.addEventListener("mouseleave", release);
}

/**
 * Updates the mobile input state based on button id.
 *
 * @param {object} App - Main application state.
 * @param {string} id - Button id.
 * @param {boolean} isDown - Current pressed state.
 */
function setMobileInput(App, id, isDown) {
  if (id === "mobile-left") App.input.left = isDown;
  if (id === "mobile-right") App.input.right = isDown;
  if (id === "mobile-jump") App.input.jump = isDown;
  if (id === "mobile-throw") App.input.fire = isDown;
}
