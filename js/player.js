/**
 * Initializes the player module and registers its public API.
 */
function initPlayerModule() {
  registerPlayerApi();
}

/**
 * Registers the player class on the global window object.
 */
function registerPlayerApi() {
  window.Player = createPlayerClass();
}

/**
 * Creates the Player class.
 *
 * @returns {typeof Player}
 */
function createPlayerClass() {
  return class Player extends window.BaseEntity {
    /**
     * Creates a new player instance.
     *
     * @param {number} [x=140] - Initial x position.
     * @param {number} [y=140] - Initial y position.
     */
    constructor(x = 140, y = 140) {
      super(x, y, 50, 70);
      this.speed = 300;
      this.jumpPower = 500;
      this.gravity = 1350;
      this.grounded = false;
    }

    /**
     * Updates the player state for one frame.
     *
     * @param {number} dt - Delta time in seconds.
     * @param {object} input - Input state.
     * @param {object} world - World state.
     */
    update(dt, input, world) {
      updatePlayerMovement(this, dt, input);
      applyPlayerPhysics(this, dt);
      movePlayer(this, dt);
      clampPlayerInsideWorld(this, world);
      resolvePlayerGroundCollision(this, world);
    }

    /**
     * Draws the player.
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context.
     * @param {number} [camX=0] - Camera x offset.
     */
    draw(ctx, camX = 0) {
      drawPlayerBody(this, ctx, camX);
      drawPlayerShadowMark(this, ctx, camX);
    }
  };
}

/**
 * Updates player movement input.
 *
 * @param {object} player - Player instance.
 * @param {number} dt - Delta time in seconds.
 * @param {object} input - Input state.
 */
function updatePlayerMovement(player, dt, input) {
  void dt;
  const dir = getPlayerDirection(input);
  player.vx = dir * player.speed;
  if (!shouldStartJump(player, input)) return;
  player.vy = -player.jumpPower;
  player.grounded = false;
}

/**
 * Returns the movement direction.
 *
 * @param {object} input - Input state.
 * @returns {number}
 */
function getPlayerDirection(input) {
  return (input.right ? 1 : 0) - (input.left ? 1 : 0);
}

/**
 * Returns whether the player should start jumping.
 *
 * @param {object} player - Player instance.
 * @param {object} input - Input state.
 * @returns {boolean}
 */
function shouldStartJump(player, input) {
  if (!input.jump) return false;
  return player.grounded;
}

/**
 * Applies gravity to the player.
 *
 * @param {object} player - Player instance.
 * @param {number} dt - Delta time in seconds.
 */
function applyPlayerPhysics(player, dt) {
  player.vy += player.gravity * dt;
}

/**
 * Moves the player by velocity.
 *
 * @param {object} player - Player instance.
 * @param {number} dt - Delta time in seconds.
 */
function movePlayer(player, dt) {
  player.x += player.vx * dt;
  player.y += player.vy * dt;
}

/**
 * Clamps the player inside world bounds.
 *
 * @param {object} player - Player instance.
 * @param {object} world - World state.
 */
function clampPlayerInsideWorld(player, world) {
  player.x = window.Util.clamp(player.x, 0, world.levelW - player.w);
}

/**
 * Resolves collision with the ground.
 *
 * @param {object} player - Player instance.
 * @param {object} world - World state.
 */
function resolvePlayerGroundCollision(player, world) {
  if (!hasGroundCollision(player, world)) return;
  player.y = world.groundY - player.h;
  player.vy = 0;
  player.grounded = true;
}

/**
 * Returns whether the player touches the ground.
 *
 * @param {object} player - Player instance.
 * @param {object} world - World state.
 * @returns {boolean}
 */
function hasGroundCollision(player, world) {
  return player.y + player.h >= world.groundY;
}

/**
 * Draws the player body.
 *
 * @param {object} player - Player instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {number} camX - Camera x offset.
 */
function drawPlayerBody(player, ctx, camX) {
  ctx.fillStyle = "rgba(255,255,255,0.90)";
  ctx.fillRect(player.x - camX, player.y, player.w, player.h);
}

/**
 * Draws the player detail marker.
 *
 * @param {object} player - Player instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {number} camX - Camera x offset.
 */
function drawPlayerShadowMark(player, ctx, camX) {
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(player.x - camX + 8, player.y + 10, 12, 12);
}
