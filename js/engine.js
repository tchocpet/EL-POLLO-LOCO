/**
 * Initializes the engine module and registers its public API.
 */
function initEngineModule() {
  registerEngineApi();
}

/**
 * Registers the engine API on the global window object.
 */
function registerEngineApi() {
  window.Engine = createEngineApi();
}

/**
 * Creates the engine API object.
 *
 * @returns {{start: Function, stop: Function}}
 */
function createEngineApi() {
  let rafId = null;
  let last = 0;
  let running = false;

  /**
   * Starts the engine loop.
   *
   * @param {Function} tick - Frame callback.
   */
  function start(tick) {
    stop();
    running = true;
    last = performance.now();
    rafId = requestAnimationFrame((now) => loop(now, tick));
  }

  /**
   * Stops the engine loop.
   */
  function stop() {
    running = false;
    if (!rafId) return;
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  /**
   * Runs one engine loop step.
   *
   * @param {number} now - Current timestamp.
   * @param {Function} tick - Frame callback.
   */
  function loop(now, tick) {
    if (!running) return;
    tick(getDeltaTime(now), now);
    rafId = requestAnimationFrame((nextNow) => loop(nextNow, tick));
  }

  /**
   * Returns the clamped delta time.
   *
   * @param {number} now - Current timestamp.
   * @returns {number}
   */
  function getDeltaTime(now) {
    let dt = (now - last) / 1000;
    last = now;
    return Math.min(dt, 1 / 20);
  }

  return { start, stop };
}
