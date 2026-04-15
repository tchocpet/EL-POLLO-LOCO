/**
 * Initializes the Natur module and registers its public API.
 */
function initNaturModule() {
  registerNaturApi();
}

/**
 * Registers the Natur class on the global window object.
 */
function registerNaturApi() {
  window.Natur = createNaturClass();
}

/**
 * Creates the Natur class.
 *
 * @returns {typeof Natur}
 */
function createNaturClass() {
  return class Natur {
    /**
     * Creates a new player character instance.
     *
     * @param {number} x - Start x position.
     * @param {number} y - Start y position.
     */
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.w = 170;
      this.h = 230;
      this.vx = 0;
      this.vy = 0;
      this.onGround = false;
      this.facing = 1;
      this.speed = 330;
      this.gravity = 1100;
      this.jumpVelocity = 500;
      this.idleTime = 0;
      this.sleepMode = false;
      this.sleepFloat = 0;
      this.sleepWave = 0;
      this.hurtTime = 0;
      this.throwTime = 0;
      this.isIntroDropping = false;
      this.introDone = false;
      this.anim = createNaturAnimationState();
      this.images = createNaturImageState();
      loadNaturImages(this);
    }

    /**
     * Resets the player to the initial state.
     *
     * @param {number} groundY - Ground y position.
     */
    reset(groundY) {
      resetNaturPosition(this);
      resetNaturVelocity(this);
      resetNaturStateFlags(this);
      resetNaturTimers(this);
      resetNaturAnimation(this);
      void groundY;
    }

    /**
     * Updates the player for one frame.
     *
     * @param {number} dtMs - Delta time in milliseconds.
     * @param {number} dtSec - Delta time in seconds.
     * @param {object} input - Input state.
     * @param {object} world - World state.
     * @param {object} assets - Asset collection.
     */
    update(dtMs, dtSec, input, world, assets) {
      if (this.isIntroDropping)
        return updateNaturIntro(this, dtMs, dtSec, world, assets);
      updateNaturActionTimers(this, dtSec);
      updateNaturSleepMotion(this, dtSec);
      updateNaturIdleState(this, dtSec, input);
      updateNaturMovement(this, dtSec, input, world);
      updateNaturAnimation(this, dtMs, assets);
    }

    /**
     * Sets the player to hurt state.
     */
    takeHit() {
      this.hurtTime = 0.35;
      this.anim.hurtFrame = 0;
      this.anim.hurtTimer = 0;
    }

    /**
     * Sets the player to throw state.
     */
    startThrow() {
      this.throwTime = 0.3;
      this.anim.throwFrame = 0;
      this.anim.throwTimer = 0;
    }

    /**
     * Draws the player.
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context.
     * @param {object} assets - Asset collection.
     */
    draw(ctx, assets) {
      const image = getCurrentNaturImage(this, assets);
      if (!image) return drawNaturFallback(this, ctx);
      drawNaturSprite(this, ctx, image);
      drawNaturSleepText(this, ctx);
    }
  };
}

/**
 * Creates the animation state object.
 *
 * @returns {object}
 */
function createNaturAnimationState() {
  return {
    walkFrame: 0,
    walkTimer: 0,
    walkFps: 10,
    jumpFrame: 0,
    jumpTimer: 0,
    jumpFps: 8,
    hurtFrame: 0,
    hurtTimer: 0,
    hurtFps: 8,
    throwFrame: 0,
    throwTimer: 0,
    throwFps: 10,
  };
}

/**
 * Creates the image state object.
 *
 * @returns {object}
 */
function createNaturImageState() {
  return {
    walk: [],
    jump: [],
    hurt: [],
    throw: [],
    idle: null,
    sleep: null,
  };
}

/**
 * Loads all Natur images.
 *
 * @param {object} natur - Natur instance.
 */
function loadNaturImages(natur) {
  loadNaturWalkImages(natur);
  loadNaturJumpImages(natur);
  loadNaturHurtImages(natur);
  loadNaturThrowImages(natur);
  loadNaturIdleImage(natur);
  loadNaturSleepImage(natur);
}

/**
 * Loads all walk images.
 *
 * @param {object} natur - Natur instance.
 */
function loadNaturWalkImages(natur) {
  getNaturWalkPaths().forEach((src) => pushNaturImage(natur.images.walk, src));
}

/**
 * Loads all jump images.
 *
 * @param {object} natur - Natur instance.
 */
function loadNaturJumpImages(natur) {
  getNaturJumpPaths().forEach((src) => pushNaturImage(natur.images.jump, src));
}

/**
 * Loads all hurt images.
 *
 * @param {object} natur - Natur instance.
 */
function loadNaturHurtImages(natur) {
  getNaturHurtPaths().forEach((src) => pushNaturImage(natur.images.hurt, src));
}

/**
 * Loads all throw images.
 *
 * @param {object} natur - Natur instance.
 */
function loadNaturThrowImages(natur) {
  getNaturThrowPaths().forEach((src) =>
    pushNaturImage(natur.images.throw, src),
  );
}

/**
 * Loads the idle image.
 *
 * @param {object} natur - Natur instance.
 */
function loadNaturIdleImage(natur) {
  natur.images.idle = createNaturImage(
    "img/2_character_pepe/1_idle/idle/I-1.png",
  );
}

/**
 * Loads the sleep image.
 *
 * @param {object} natur - Natur instance.
 */
function loadNaturSleepImage(natur) {
  natur.images.sleep = createNaturImage(
    "img/2_character_pepe/1_idle/long_idle/I-11.png",
  );
}

/**
 * Pushes one image into a list.
 *
 * @param {HTMLImageElement[]} list - Target image list.
 * @param {string} src - Image source path.
 */
function pushNaturImage(list, src) {
  list.push(createNaturImage(src));
}

/**
 * Creates one image.
 *
 * @param {string} src - Image source path.
 * @returns {HTMLImageElement}
 */
function createNaturImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

/**
 * Returns walk image paths.
 *
 * @returns {string[]}
 */
function getNaturWalkPaths() {
  return [
    "img/2_character_pepe/2_walk/W-21.png",
    "img/2_character_pepe/2_walk/W-22.png",
    "img/2_character_pepe/2_walk/W-23.png",
    "img/2_character_pepe/2_walk/W-24.png",
    "img/2_character_pepe/2_walk/W-25.png",
    "img/2_character_pepe/2_walk/W-26.png",
  ];
}

/**
 * Returns jump image paths.
 *
 * @returns {string[]}
 */
function getNaturJumpPaths() {
  return [
    "img/2_character_pepe/3_jump/J-31.png",
    "img/2_character_pepe/3_jump/J-32.png",
    "img/2_character_pepe/3_jump/J-33.png",
    "img/2_character_pepe/3_jump/J-34.png",
    "img/2_character_pepe/3_jump/J-35.png",
    "img/2_character_pepe/3_jump/J-36.png",
    "img/2_character_pepe/3_jump/J-37.png",
    "img/2_character_pepe/3_jump/J-38.png",
    "img/2_character_pepe/3_jump/J-39.png",
  ];
}

/**
 * Returns hurt image paths.
 *
 * @returns {string[]}
 */
function getNaturHurtPaths() {
  return [
    "img/2_character_pepe/4_hurt/H-41.png",
    "img/2_character_pepe/4_hurt/H-42.png",
    "img/2_character_pepe/4_hurt/H-43.png",
  ];
}

/**
 * Returns throw image paths.
 *
 * @returns {string[]}
 */
function getNaturThrowPaths() {
  return [
    "img/2_character_pepe/2_walk/W-21.png",
    "img/2_character_pepe/2_walk/W-22.png",
    "img/2_character_pepe/2_walk/W-23.png",
  ];
}

/**
 * Resets the player position.
 *
 * @param {object} natur - Natur instance.
 */
function resetNaturPosition(natur) {
  natur.x = 60;
  natur.y = -natur.h - 40;
}

/**
 * Resets the velocity state.
 *
 * @param {object} natur - Natur instance.
 */
function resetNaturVelocity(natur) {
  natur.vx = 0;
  natur.vy = 0;
}

/**
 * Resets state flags.
 *
 * @param {object} natur - Natur instance.
 */
function resetNaturStateFlags(natur) {
  natur.onGround = false;
  natur.isIntroDropping = true;
  natur.introDone = false;
  natur.facing = 1;
  natur.sleepMode = false;
}

/**
 * Resets timers and floating state.
 *
 * @param {object} natur - Natur instance.
 */
function resetNaturTimers(natur) {
  natur.idleTime = 0;
  natur.hurtTime = 0;
  natur.throwTime = 0;
  natur.sleepFloat = 0;
  natur.sleepWave = 0;
}

/**
 * Resets animation counters.
 *
 * @param {object} natur - Natur instance.
 */
function resetNaturAnimation(natur) {
  natur.anim.walkFrame = 0;
  natur.anim.walkTimer = 0;
  natur.anim.jumpFrame = 0;
  natur.anim.jumpTimer = 0;
  natur.anim.hurtFrame = 0;
  natur.anim.hurtTimer = 0;
  natur.anim.throwFrame = 0;
  natur.anim.throwTimer = 0;
}

/**
 * Updates the intro state.
 *
 * @param {object} natur - Natur instance.
 * @param {number} dtMs - Delta time in milliseconds.
 * @param {number} dtSec - Delta time in seconds.
 * @param {object} world - World state.
 * @param {object} assets - Asset collection.
 */
function updateNaturIntro(natur, dtMs, dtSec, world, assets) {
  const floorY = world.groundY - natur.h;
  natur.vy += natur.gravity * dtSec;
  natur.y += natur.vy * dtSec;
  if (natur.y < floorY) return updateNaturAnimation(natur, dtMs, assets);
  finishNaturIntro(natur, floorY);
  updateNaturAnimation(natur, dtMs, assets);
}

/**
 * Finishes the intro drop.
 *
 * @param {object} natur - Natur instance.
 * @param {number} floorY - Floor y position.
 */
function finishNaturIntro(natur, floorY) {
  natur.y = floorY;
  natur.vy = 0;
  natur.onGround = true;
  natur.isIntroDropping = false;
  natur.introDone = true;
  natur.idleTime = 0;
  natur.sleepMode = false;
}

/**
 * Updates hurt and throw timers.
 *
 * @param {object} natur - Natur instance.
 * @param {number} dtSec - Delta time in seconds.
 */
function updateNaturActionTimers(natur, dtSec) {
  lowerNaturHurtTime(natur, dtSec);
  lowerNaturThrowTime(natur, dtSec);
}

/**
 * Lowers hurt time.
 *
 * @param {object} natur - Natur instance.
 * @param {number} dtSec - Delta time in seconds.
 */
function lowerNaturHurtTime(natur, dtSec) {
  if (natur.hurtTime <= 0) return;
  natur.hurtTime -= dtSec;
  if (natur.hurtTime < 0) natur.hurtTime = 0;
}

/**
 * Lowers throw time.
 *
 * @param {object} natur - Natur instance.
 * @param {number} dtSec - Delta time in seconds.
 */
function lowerNaturThrowTime(natur, dtSec) {
  if (natur.throwTime <= 0) return;
  natur.throwTime -= dtSec;
  if (natur.throwTime < 0) natur.throwTime = 0;
}

/**
 * Updates sleep floating motion.
 *
 * @param {object} natur - Natur instance.
 * @param {number} dtSec - Delta time in seconds.
 */
function updateNaturSleepMotion(natur, dtSec) {
  natur.sleepFloat += dtSec * 2.2;
  natur.sleepWave += dtSec * 3.5;
}

/**
 * Updates idle and sleep state.
 *
 * @param {object} natur - Natur instance.
 * @param {number} dtSec - Delta time in seconds.
 * @param {object} input - Input state.
 */
function updateNaturIdleState(natur, dtSec, input) {
  if (isNaturMoving(natur, input)) return resetNaturIdleState(natur);
  natur.idleTime += dtSec;
  if (natur.idleTime > 1.5) natur.sleepMode = true;
}

/**
 * Returns whether the player is currently moving.
 *
 * @param {object} natur - Natur instance.
 * @param {object} input - Input state.
 * @returns {boolean}
 */
function isNaturMoving(natur, input) {
  if (input.left || input.right) return true;
  if (input.jump || input.fire) return true;
  if (!natur.onGround) return true;
  if (natur.throwTime > 0) return true;
  return natur.hurtTime > 0;
}

/**
 * Resets idle state values.
 *
 * @param {object} natur - Natur instance.
 */
function resetNaturIdleState(natur) {
  natur.idleTime = 0;
  natur.sleepMode = false;
}

/**
 * Updates movement, jump, and world bounds.
 *
 * @param {object} natur - Natur instance.
 * @param {number} dtSec - Delta time in seconds.
 * @param {object} input - Input state.
 * @param {object} world - World state.
 */
function updateNaturMovement(natur, dtSec, input, world) {
  const direction = getNaturDirection(input);
  const floorY = world.groundY - natur.h;
  natur.vx = direction * natur.speed;
  updateNaturFacing(natur, direction);
  natur.x += natur.vx * dtSec;
  handleNaturJump(natur, input, floorY);
  applyNaturGravity(natur, dtSec, floorY);
  clampNaturInsideWorld(natur, world, floorY);
}

/**
 * Returns movement direction.
 *
 * @param {object} input - Input state.
 * @returns {number}
 */
function getNaturDirection(input) {
  return (input.right ? 1 : 0) - (input.left ? 1 : 0);
}

/**
 * Updates facing direction.
 *
 * @param {object} natur - Natur instance.
 * @param {number} direction - Movement direction.
 */
function updateNaturFacing(natur, direction) {
  if (direction !== 0) natur.facing = direction;
}

/**
 * Handles jump logic.
 *
 * @param {object} natur - Natur instance.
 * @param {object} input - Input state.
 * @param {number} floorY - Floor y position.
 */
function handleNaturJump(natur, input, floorY) {
  const grounded = natur.y >= floorY - 0.5;
  if (!grounded) return setNaturAirborne(natur);
  prepareNaturGroundState(natur, floorY);
  if (!input.jump) return;
  natur.vy = -natur.jumpVelocity;
  natur.onGround = false;
}

/**
 * Sets the player to airborne state.
 *
 * @param {object} natur - Natur instance.
 */
function setNaturAirborne(natur) {
  natur.onGround = false;
}

/**
 * Prepares the grounded state.
 *
 * @param {object} natur - Natur instance.
 * @param {number} floorY - Floor y position.
 */
function prepareNaturGroundState(natur, floorY) {
  natur.y = floorY;
  natur.vy = 0;
  natur.onGround = true;
}

/**
 * Applies gravity.
 *
 * @param {object} natur - Natur instance.
 * @param {number} dtSec - Delta time in seconds.
 * @param {number} floorY - Floor y position.
 */
function applyNaturGravity(natur, dtSec, floorY) {
  natur.vy += natur.gravity * dtSec;
  natur.y += natur.vy * dtSec;
  if (natur.y < floorY) return;
  prepareNaturGroundState(natur, floorY);
}

/**
 * Clamps the player inside world bounds.
 *
 * @param {object} natur - Natur instance.
 * @param {object} world - World state.
 * @param {number} floorY - Floor y position.
 */
function clampNaturInsideWorld(natur, world, floorY) {
  natur.x = Math.max(0, Math.min(world.levelW - natur.w, natur.x));
  natur.y = Math.min(natur.y, floorY);
}

/**
 * Updates all player animations.
 *
 * @param {object} natur - Natur instance.
 * @param {number} dtMs - Delta time in milliseconds.
 * @param {object} assets - Asset collection.
 */
function updateNaturAnimation(natur, dtMs, assets) {
  updateNaturWalkAnimation(natur, dtMs, assets);
  updateNaturJumpAnimation(natur, dtMs);
  updateNaturHurtAnimation(natur, dtMs);
  updateNaturThrowAnimation(natur, dtMs);
}

/**
 * Updates walk animation.
 *
 * @param {object} natur - Natur instance.
 * @param {number} dtMs - Delta time in milliseconds.
 * @param {object} assets - Asset collection.
 */
function updateNaturWalkAnimation(natur, dtMs, assets) {
  if (!isNaturWalking(natur)) return resetNaturWalkAnimation(natur);
  if (!hasNaturWalkFrames(natur, assets)) return resetNaturWalkAnimation(natur);
  natur.anim.walkTimer += dtMs;
  if (natur.anim.walkTimer < 1000 / natur.anim.walkFps) return;
  natur.anim.walkTimer = 0;
  advanceNaturWalkFrame(natur, assets);
}

/**
 * Returns whether the player is walking.
 *
 * @param {object} natur - Natur instance.
 * @returns {boolean}
 */
function isNaturWalking(natur) {
  if (Math.abs(natur.vx) <= 1) return false;
  if (!natur.onGround) return false;
  return natur.throwTime <= 0;
}

/**
 * Returns whether walk frames exist.
 *
 * @param {object} natur - Natur instance.
 * @param {object} assets - Asset collection.
 * @returns {boolean}
 */
function hasNaturWalkFrames(natur, assets) {
  if (natur.images.walk.length > 0) return true;
  return assets.playerWalk.length > 0;
}

/**
 * Resets walk animation.
 *
 * @param {object} natur - Natur instance.
 */
function resetNaturWalkAnimation(natur) {
  natur.anim.walkFrame = 0;
  natur.anim.walkTimer = 0;
}

/**
 * Advances the walk frame.
 *
 * @param {object} natur - Natur instance.
 * @param {object} assets - Asset collection.
 */
function advanceNaturWalkFrame(natur, assets) {
  const count = natur.images.walk.length || assets.playerWalk.length;
  natur.anim.walkFrame = (natur.anim.walkFrame + 1) % count;
}

/**
 * Updates jump animation.
 *
 * @param {object} natur - Natur instance.
 * @param {number} dtMs - Delta time in milliseconds.
 */
function updateNaturJumpAnimation(natur, dtMs) {
  if (!isNaturJumping(natur)) return resetNaturJumpAnimation(natur);
  natur.anim.jumpTimer += dtMs;
  if (natur.anim.jumpTimer < 1000 / natur.anim.jumpFps) return;
  natur.anim.jumpTimer = 0;
  natur.anim.jumpFrame = (natur.anim.jumpFrame + 1) % natur.images.jump.length;
}

/**
 * Returns whether the player is jumping.
 *
 * @param {object} natur - Natur instance.
 * @returns {boolean}
 */
function isNaturJumping(natur) {
  if (natur.onGround) return false;
  if (natur.throwTime > 0) return false;
  return natur.images.jump.length > 0;
}

/**
 * Resets jump animation.
 *
 * @param {object} natur - Natur instance.
 */
function resetNaturJumpAnimation(natur) {
  natur.anim.jumpFrame = 0;
  natur.anim.jumpTimer = 0;
}

/**
 * Updates hurt animation.
 *
 * @param {object} natur - Natur instance.
 * @param {number} dtMs - Delta time in milliseconds.
 */
function updateNaturHurtAnimation(natur, dtMs) {
  if (!isNaturHurt(natur)) return resetNaturHurtAnimation(natur);
  natur.anim.hurtTimer += dtMs;
  if (natur.anim.hurtTimer < 1000 / natur.anim.hurtFps) return;
  natur.anim.hurtTimer = 0;
  natur.anim.hurtFrame = (natur.anim.hurtFrame + 1) % natur.images.hurt.length;
}

/**
 * Returns whether the player is hurt.
 *
 * @param {object} natur - Natur instance.
 * @returns {boolean}
 */
function isNaturHurt(natur) {
  if (natur.hurtTime <= 0) return false;
  return natur.images.hurt.length > 0;
}

/**
 * Resets hurt animation.
 *
 * @param {object} natur - Natur instance.
 */
function resetNaturHurtAnimation(natur) {
  natur.anim.hurtFrame = 0;
  natur.anim.hurtTimer = 0;
}

/**
 * Updates throw animation.
 *
 * @param {object} natur - Natur instance.
 * @param {number} dtMs - Delta time in milliseconds.
 */
function updateNaturThrowAnimation(natur, dtMs) {
  if (!isNaturThrowing(natur)) return resetNaturThrowAnimation(natur);
  natur.anim.throwTimer += dtMs;
  if (natur.anim.throwTimer < 1000 / natur.anim.throwFps) return;
  natur.anim.throwTimer = 0;
  natur.anim.throwFrame =
    (natur.anim.throwFrame + 1) % natur.images.throw.length;
}

/**
 * Returns whether the player is throwing.
 *
 * @param {object} natur - Natur instance.
 * @returns {boolean}
 */
function isNaturThrowing(natur) {
  if (natur.throwTime <= 0) return false;
  return natur.images.throw.length > 0;
}

/**
 * Resets throw animation.
 *
 * @param {object} natur - Natur instance.
 */
function resetNaturThrowAnimation(natur) {
  natur.anim.throwFrame = 0;
  natur.anim.throwTimer = 0;
}

/**
 * Returns the current image for the player.
 *
 * @param {object} natur - Natur instance.
 * @param {object} assets - Asset collection.
 * @returns {HTMLImageElement|null}
 */
function getCurrentNaturImage(natur, assets) {
  if (hasNaturThrowImage(natur))
    return natur.images.throw[natur.anim.throwFrame];
  if (hasNaturHurtImage(natur)) return natur.images.hurt[natur.anim.hurtFrame];
  if (isNaturThrowing(natur))
    return natur.images.throw[natur.anim.throwFrame] || null;
  if (isNaturJumping(natur))
    return natur.images.jump[natur.anim.jumpFrame] || null;
  if (isNaturWalking(natur)) return getNaturWalkImage(natur, assets);
  if (hasNaturSleepImage(natur)) return natur.images.sleep;
  if (hasNaturIdleImage(natur)) return natur.images.idle;
  if (assets.playerIdle) return assets.playerIdle;
  return null;
}

/**
 * Returns whether a throw image is available.
 *
 * @param {object} natur - Natur instance.
 * @returns {boolean}
 */
function hasNaturThrowImage(natur) {
  const image = natur.images.throw[natur.anim.throwFrame];
  if (natur.throwTime <= 0) return false;
  if (natur.images.throw.length === 0) return false;
  return isNaturImageDrawable(image);
}

/**
 * Returns whether a hurt image is available.
 *
 * @param {object} natur - Natur instance.
 * @returns {boolean}
 */
function hasNaturHurtImage(natur) {
  const image = natur.images.hurt[natur.anim.hurtFrame];
  if (natur.hurtTime <= 0) return false;
  if (natur.images.hurt.length === 0) return false;
  return !!image;
}

/**
 * Returns the current walk image.
 *
 * @param {object} natur - Natur instance.
 * @param {object} assets - Asset collection.
 * @returns {HTMLImageElement|null}
 */
function getNaturWalkImage(natur, assets) {
  if (natur.images.walk.length > 0) {
    return natur.images.walk[natur.anim.walkFrame] || null;
  }
  if (assets.playerWalk.length > 0) {
    return assets.playerWalk[natur.anim.walkFrame] || null;
  }
  return null;
}

/**
 * Returns whether a sleep image is available.
 *
 * @param {object} natur - Natur instance.
 * @returns {boolean}
 */
function hasNaturSleepImage(natur) {
  if (!natur.sleepMode) return false;
  return isNaturImageDrawable(natur.images.sleep);
}

/**
 * Returns whether an idle image is available.
 *
 * @param {object} natur - Natur instance.
 * @returns {boolean}
 */
function hasNaturIdleImage(natur) {
  return isNaturImageDrawable(natur.images.idle);
}

/**
 * Returns whether an image is drawable.
 *
 * @param {HTMLImageElement|null} image - Natur image.
 * @returns {boolean}
 */
function isNaturImageDrawable(image) {
  return !!image && image.complete && image.naturalWidth > 0;
}

/**
 * Draws the player sprite.
 *
 * @param {object} natur - Natur instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {HTMLImageElement} image - Natur image.
 */
function drawNaturSprite(natur, ctx, image) {
  if (!isNaturImageDrawable(image)) return drawNaturFallback(natur, ctx);
  ctx.save();
  if (natur.facing < 0) return drawFlippedNatur(natur, ctx, image);
  ctx.drawImage(image, natur.x, natur.y, natur.w, natur.h);
  ctx.restore();
}

/**
 * Draws the flipped sprite.
 *
 * @param {object} natur - Natur instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {HTMLImageElement} image - Natur image.
 */
function drawFlippedNatur(natur, ctx, image) {
  ctx.translate(natur.x + natur.w, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(image, 0, natur.y, natur.w, natur.h);
  ctx.restore();
}

/**
 * Draws fallback rectangle.
 *
 * @param {object} natur - Natur instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
function drawNaturFallback(natur, ctx) {
  ctx.fillStyle = "red";
  ctx.fillRect(natur.x, natur.y, natur.w, natur.h);
}

/**
 * Draws sleep text.
 *
 * @param {object} natur - Natur instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
function drawNaturSleepText(natur, ctx) {
  if (!natur.sleepMode) return;
  ctx.save();
  ctx.textAlign = "center";
  ctx.strokeStyle = "rgba(0,0,0,0.28)";
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.lineWidth = 3;
  drawNaturSleepLetters(natur, ctx);
  ctx.restore();
}

/**
 * Draws all sleep letters.
 *
 * @param {object} natur - Natur instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
function drawNaturSleepLetters(natur, ctx) {
  drawNaturSleepLetterOne(natur, ctx);
  drawNaturSleepLetterTwo(natur, ctx);
  drawNaturSleepLetterThree(natur, ctx);
}

/**
 * Draws the first sleep letter.
 *
 * @param {object} natur - Natur instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
function drawNaturSleepLetterOne(natur, ctx) {
  const x = natur.x + natur.w * 0.78 + Math.sin(natur.sleepWave) * 4;
  const y = natur.y + natur.h * 0.35 + Math.sin(natur.sleepFloat) * 6;
  ctx.font = "bold 22px Arial";
  ctx.strokeText("Z", x, y);
  ctx.fillText("Z", x, y);
}

/**
 * Draws the second sleep letter.
 *
 * @param {object} natur - Natur instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
function drawNaturSleepLetterTwo(natur, ctx) {
  const x = natur.x + natur.w * 0.92 + Math.sin(natur.sleepWave + 0.8) * 5;
  const y = natur.y + natur.h * 0.25 + Math.sin(natur.sleepFloat + 0.6) * 7;
  ctx.font = "bold 18px Arial";
  ctx.strokeText("z", x, y);
  ctx.fillText("z", x, y);
}

/**
 * Draws the third sleep letter.
 *
 * @param {object} natur - Natur instance.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
function drawNaturSleepLetterThree(natur, ctx) {
  const x = natur.x + natur.w * 1.05 + Math.sin(natur.sleepWave + 1.4) * 6;
  const y = natur.y + natur.h * 0.15 + Math.sin(natur.sleepFloat + 1.1) * 8;
  ctx.font = "bold 26px Arial";
  ctx.strokeText("Z", x, y);
  ctx.fillText("Z", x, y);
}
