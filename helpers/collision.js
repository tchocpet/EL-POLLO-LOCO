"use strict";

/**
 * Returns the reduced hitbox for a game object.
 * @param {object} obj - Game object
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
 * @returns {{x:number,y:number,w:number,h:number}}
 */
function getEmptyHitbox() {
  return { x: 0, y: 0, w: 0, h: 0 };
}

/**
 * Returns a hitbox with offset values.
 * @param {object} obj - Game object with offset
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
 * Returns the hitbox for the player character (Natur).
 * @param {object} obj - Natur instance
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
 * Returns the hitbox for an enemy.
 * @param {object} obj - Enemy instance
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
 * @param {object} obj - Game object
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
 * Checks for AABB (axis-aligned bounding box) collision between two objects.
 * @param {object} a - First object
 * @param {object} b - Second object
 * @returns {boolean} True if the objects are colliding, otherwise false.
 */
function isColliding(a, b) {
  const aa = getHitbox(a);
  const bb = getHitbox(b);

  return (
    aa.x < bb.x + bb.w &&
    aa.x + aa.w > bb.x &&
    aa.y < bb.y + bb.h &&
    aa.y + aa.h > bb.y
  );
}

/**
 * Checks if the player performed a stomp hit on the enemy (from above).
 * @param {object} player - The player object
   @param {object} enemy - The enemy object
 * @returns {boolean} True if the player stomped the enemy, otherwise false.
 */
function isStompHit(player, enemy) {
  const p = getHitbox(player);
  const e = getHitbox(enemy);

  const playerBottom = p.y + p.h;
  const enemyTop = e.y;
  const fromAbove = playerBottom - enemyTop < 28;

  return player.vy > 0 && fromAbove;
}

/**
 * Expose collision helper functions to the global window object.
 * @global
 * @function getHitbox
 * @function isColliding
 * @function isStompHit
 */
window.getHitbox = getHitbox;
window.isColliding = isColliding;
window.isStompHit = isStompHit;
