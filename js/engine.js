"use strict";

window.Engine = (function () {
  let rafId = null;
  let last = 0;
  let running = false;

  /**
   * Starts the game engine loop.
   * @param {function} tick - Callback function called each frame with (dt, now)
   */
  function start(tick) {
    stop();
    running = true;
    last = performance.now();

    const loop = (now) => {
      if (!running) return;
      let dt = (now - last) / 1000;
      last = now;
      dt = Math.min(dt, 1 / 20);
      tick(dt, now);
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
  }

  /**
   * Stops the game engine loop.
   */
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  return { start, stop };
})();
