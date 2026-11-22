// The magpie: a jewel-thieving bird, quick on the wing and quiet in the
// shadows. Walk, sneak (slow, half as easy to spot), run (fast, loud), or
// glide on a spent feather. Loot is gathered by touch; the relic needs three
// seconds of careful prising unless a lockpick was bought.

import { insideAnyRect } from './detection.js';

export const PLAYER_RADIUS = 12;
export const WALK_SPEED = 150;
export const SNEAK_SPEED = 85;
export const RUN_SPEED = 245;
export const GLIDE_SPEED = 310;

export function createPlayer(start) {
  return {
    x: start.x,
    y: start.y,
    angle: -Math.PI / 2,
    moving: false,
    sneaking: false,
    running: false,
    gliding: 0,
    glideCooldown: 0,
    stepTimer: 0,
    noiseTimer: 0,
    channel: 0,
    channelTarget: null,
    caught: false,
    clickTarget: null,
  };
}

function circleHitsRect(x, y, radius, rect) {
  const nearestX = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const nearestY = Math.max(rect.y, Math.min(y, rect.y + rect.h));
  return (x - nearestX) * (x - nearestX) + (y - nearestY) * (y - nearestY) < radius * radius;
}

function collides(x, y, blockers) {
  for (let index = 0; index < blockers.length; index += 1) {
    if (circleHitsRect(x, y, PLAYER_RADIUS, blockers[index])) return true;
  }
  return false;
}

/** Slide along walls: try the full step, then each axis on its own. */
export function movePlayerWithCollision(player, dx, dy, blockers) {
  const nextX = player.x + dx;
  const nextY = player.y + dy;
  if (!collides(nextX, nextY, blockers)) {
    player.x = nextX;
    player.y = nextY;
    return;
  }
  if (!collides(nextX, player.y, blockers)) player.x = nextX;
  else if (!collides(player.x, nextY, blockers)) player.y = nextY;
}

/** One step of the magpie: read the keys or the click target, move, gather. */
export function updatePlayer(state, input, delta) {
  const player = state.player;
  const gallery = state.gallery;
  player.gliding = Math.max(0, player.gliding - delta);
  player.glideCooldown = Math.max(0, player.glideCooldown - delta);

  let moveX = 0;
  let moveY = 0;
  if (input.left) moveX -= 1;
  if (input.right) moveX += 1;
  if (input.up) moveY -= 1;
  if (input.down) moveY += 1;

  if (moveX === 0 && moveY === 0 && player.clickTarget) {
    const dx = player.clickTarget.x - player.x;
    const dy = player.clickTarget.y - player.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 8) {
      player.clickTarget = null;
    } else {
      moveX = dx / distance;
      moveY = dy / distance;
    }
  }

  const length = Math.hypot(moveX, moveY);
  player.moving = length > 0;
  player.sneaking = input.sneak && player.gliding <= 0;
  player.running = input.run && !player.sneaking && player.gliding <= 0;

  let speed = WALK_SPEED;
  if (player.gliding > 0) speed = GLIDE_SPEED;
  else if (player.sneaking) speed = SNEAK_SPEED;
  else if (player.running) speed = RUN_SPEED;
  if (insideAnyRect(player.x, player.y, gallery.vents)) speed *= 0.55;

  if (player.moving) {
    const nx = moveX / length;
    const ny = moveY / length;
    movePlayerWithCollision(player, nx * speed * delta, ny * speed * delta, state.blockers);
    player.angle = Math.atan2(ny, nx);
    player.stepTimer -= delta;
    if (player.stepTimer <= 0) {
      player.stepTimer = player.running ? 0.22 : player.sneaking ? 0.5 : 0.34;
      state.audio.step(player.running, player.sneaking);
    }
    if (player.running) {
      player.noiseTimer -= delta;
      if (player.noiseTimer <= 0) {
        player.noiseTimer = 0.4;
        state.noises.push({ x: player.x, y: player.y, radius: 150, ttl: 0.5 });
      }
    }
  }

  player.x = Math.max(36, Math.min(1244, player.x));
  player.y = Math.max(86, Math.min(764, player.y));

  gatherTrinkets(state);
  updateRelicChannel(state, delta);
  checkSkylight(state);
}

function gatherTrinkets(state) {
  const player = state.player;
  for (let index = 0; index < state.trinkets.length; index += 1) {
    const trinket = state.trinkets[index];
    if (trinket.taken) continue;
    if (Math.hypot(trinket.x - player.x, trinket.y - player.y) < 26) {
      trinket.taken = true;
      state.shine += 1;
      state.score += 50;
      state.lootTaken += 1;
      state.audio.chime();
    }
  }
}

function updateRelicChannel(state, delta) {
  const player = state.player;
  const relic = state.gallery.relic;
  if (state.relicTaken) {
    player.channel = 0;
    player.channelTarget = null;
    return;
  }
  const distance = Math.hypot(relic.x - player.x, relic.y - player.y);
  if (distance < 44) {
    if (state.ownsLockpick) {
      takeRelic(state);
      return;
    }
    player.channel += delta;
    player.channelTarget = { x: relic.x, y: relic.y };
    state.channelNoiseTimer -= delta;
    if (state.channelNoiseTimer <= 0) {
      state.channelNoiseTimer = 1;
      state.noises.push({ x: player.x, y: player.y, radius: 120, ttl: 0.5 });
    }
    if (player.channel >= 3) takeRelic(state);
  } else {
    player.channel = 0;
    player.channelTarget = null;
  }
}

function takeRelic(state) {
  state.relicTaken = true;
  state.score += 500;
  state.player.channel = 0;
  state.player.channelTarget = null;
  state.audio.relic();
  state.message = `The ${state.gallery.relic.name} is yours — reach the skylight!`;
  state.messageTimer = 4;
}

function checkSkylight(state) {
  if (!state.relicTaken) return;
  const skylight = state.gallery.skylight;
  if (Math.hypot(skylight.x - state.player.x, skylight.y - state.player.y) < 36) {
    state.galleryComplete = true;
  }
}
