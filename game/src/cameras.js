// Brass oculus cameras: wall-mounted domes that sweep a red beam across the
// room. Being caught in the beam raises the alarm far faster than a warden's
// glance, but a camera never chases — jam it, smoke it, or cross behind it.

import { angleDifference, hasLineOfSight } from './detection.js';

export const CAMERA_HALF_ANGLE = 0.22;

export function createCameras(definitions) {
  return definitions.map((definition, index) => ({
    id: index,
    x: definition.x,
    y: definition.y,
    base: definition.base,
    sweep: definition.sweep,
    speed: definition.speed,
    range: definition.range,
    angle: definition.base,
    phase: index * 1.7,
    jammed: 0,
    seesPlayer: false,
    clickTimer: 0,
  }));
}

/** Sweep the beam; a jammed camera hangs dark and still. */
export function updateCamera(camera, time, delta) {
  if (camera.jammed > 0) {
    camera.jammed = Math.max(0, camera.jammed - delta);
    return;
  }
  camera.angle = camera.base + Math.sin(time * camera.speed + camera.phase) * camera.sweep;
  camera.clickTimer -= delta;
}

/**
 * True when the camera's red beam falls on the magpie. Returns a click event
 * when the beam's edge passes over the player, for the soft camera sound.
 */
export function cameraSeesPlayer(camera, player, blockers, inSmoke) {
  if (camera.jammed > 0 || inSmoke) {
    camera.seesPlayer = false;
    return false;
  }
  const dx = player.x - camera.x;
  const dy = player.y - camera.y;
  const distance = Math.hypot(dx, dy);
  if (distance > camera.range) {
    camera.seesPlayer = false;
    return false;
  }
  if (distance > 30 && angleDifference(Math.atan2(dy, dx), camera.angle) > CAMERA_HALF_ANGLE) {
    camera.seesPlayer = false;
    return false;
  }
  const seen = hasLineOfSight(camera.x, camera.y, player.x, player.y, blockers);
  camera.seesPlayer = seen;
  return seen;
}

/** The nearest live camera within `maxDistance` of a point, or null. */
export function nearestCamera(cameras, x, y, maxDistance) {
  let best = null;
  let bestDistance = maxDistance;
  for (let index = 0; index < cameras.length; index += 1) {
    const camera = cameras[index];
    if (camera.jammed > 0) continue;
    const distance = Math.hypot(camera.x - x, camera.y - y);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = camera;
    }
  }
  return best;
}
