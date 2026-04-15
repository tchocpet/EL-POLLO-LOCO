/**
 * Initializes the entities module and registers its public API.
 */
function initEntitiesModule() {
  registerEntitiesApi();
}

/**
 * Registers entity helpers on the global window object.
 */
function registerEntitiesApi() {
  window.Util = createUtilApi();
  window.BaseEntity = createBaseEntityClass();
}

/**
 * Creates the utility API object.
 *
 * @returns {{clamp: Function}}
 */
function createUtilApi() {
  return {
    clamp: clampValue,
  };
}

/**
 * Clamps a value between a minimum and a maximum.
 *
 * @param {number} value - Input value.
 * @param {number} min - Minimum allowed value.
 * @param {number} max - Maximum allowed value.
 * @returns {number}
 */
function clampValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Creates the BaseEntity class.
 *
 * @returns {typeof BaseEntity}
 */
function createBaseEntityClass() {
  return class BaseEntity {
    /**
     * Creates a base entity instance.
     *
     * @param {number} x - X position.
     * @param {number} y - Y position.
     * @param {number} w - Width.
     * @param {number} h - Height.
     */
    constructor(x, y, w, h) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.vx = 0;
      this.vy = 0;
    }
  };
}
