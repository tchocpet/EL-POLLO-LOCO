/**
 * Initializes the collision helper module and registers its public API.
 */
function initCollisionHelperModule() {
  registerCollisionHelperApi();
}

/**
 * Registers collision helper functions on the global window object.
 */
function registerCollisionHelperApi() {
  window.getHitbox = getHitbox;
  window.isColliding = isColliding;
  window.isStompHit = isStompHit;
}

/**
 * Returns the reduced hitbox for a game object.
 *
 * @param {object} obj - Game object.
 * @returns {{x:number,y:number,w:number,h:number}}
 */
function getHitbox(obj) {
  if (!obj) return getEmptyHitbox();
  if (obj.offset) return getOffsetHitbox(obj);
  if (obj instanceof Natur) return getNaturHitbox(obj);
  if (obj instanceof Enemy) return getEnemyHitbox(obj);
  return getDefaultHitbox(obj);
}

/**
 * Returns an empty hitbox.
 *
 * @returns {{x:number,y:number,w:number,h:number}}
 */
function getEmptyHitbox() {
  return { x: 0, y: 0, w: 0, h: 0 };
}

/**
 * Returns a hitbox with offset values applied.
 *
 * @param {object} obj - Game object with offset.
 * @returns {{x:number,y:number,w:number,h:number}}
 */
function getOffsetHitbox(obj) {
  return {
    x: obj.x + (obj.offset.left || 0),
    y: obj.y + (obj.offset.top || 0),
    w: obj.w - (obj.offset.left || 0) - (obj.offset.right || 0),
    h: obj.h - (obj.offset.top || 0) - (obj.offset.bottom || 0),
  };
}

/**
 * Returns the hitbox for the player character.
 *
 * @param {object} obj - Natur instance.
 * @returns {{x:number,y:number,w:number,h:number}}
 */
function getNaturHitbox(obj) {
  return {
    x: obj.x + obj.w * 0.28,
    y: obj.y + obj.h * 0.16,
    w: obj.w * 0.44,
    h: obj.h * 0.8,
  };
}

/**
 * Returns the hitbox for a regular enemy.
 *
 * @param {object} obj - Enemy instance.
 * @returns {{x:number,y:number,w:number,h:number}}
 */
function getEnemyHitbox(obj) {
  return {
    x: obj.x + obj.w * 0.12,
    y: obj.y + obj.h * 0.1,
    w: obj.w * 0.76,
    h: obj.h * 0.8,
  };
}

/**
 * Returns the default hitbox for an object.
 *
 * @param {object} obj - Game object.
 * @returns {{x:number,y:number,w:number,h:number}}
 */
function getDefaultHitbox(obj) {
  return {
    x: obj.x,
    y: obj.y,
    w: obj.w,
    h: obj.h,
  };
}

/**
 * Checks for AABB collision between two objects.
 *
 * @param {object} a - First object.
 * @param {object} b - Second object.
 * @returns {boolean}
 */
function isColliding(a, b) {
  const hitboxA = getHitbox(a);
  const hitboxB = getHitbox(b);
  return areHitboxesOverlapping(hitboxA, hitboxB);
}

/**
 * Returns whether two hitboxes overlap.
 *
 * @param {{x:number,y:number,w:number,h:number}} a - First hitbox.
 * @param {{x:number,y:number,w:number,h:number}} b - Second hitbox.
 * @returns {boolean}
 */
function areHitboxesOverlapping(a, b) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

/**
 * Checks whether the player stomped an enemy from above.
 *
 * @param {object} player - Player object.
 * @param {object} enemy - Enemy object.
 * @returns {boolean}
 */
function isStompHit(player, enemy) {
  const playerHitbox = getHitbox(player);
  const enemyHitbox = getHitbox(enemy);
  return isFallingStomp(player, playerHitbox, enemyHitbox);
}

/**
 * Returns whether the collision counts as a falling stomp.
 *
 * @param {object} player - Player object.
 * @param {{x:number,y:number,w:number,h:number}} playerHitbox - Player hitbox.
 * @param {{x:number,y:number,w:number,h:number}} enemyHitbox - Enemy hitbox.
 * @returns {boolean}
 */
function isFallingStomp(player, playerHitbox, enemyHitbox) {
  const playerBottom = playerHitbox.y + playerHitbox.h;
  const enemyTop = enemyHitbox.y;
  const fromAbove = playerBottom - enemyTop < 28;
  return player.vy > 0 && fromAbove;
}
