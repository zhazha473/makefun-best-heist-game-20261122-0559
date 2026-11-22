// Wardens: the museum's night watch. Each walks a fixed patrol of waypoints,
// pauses at each stop, and watches a yellow cone ahead. Their mood runs
// CALM -> SUSPICIOUS ("?") -> ALERT ("!", chase the last place the magpie was
// seen) -> SEARCH -> CALM. Running feet and the clatter of a relic being
// prised loose pull them over to listen.

import { angleDifference, hasLineOfSight, insideAnyCircle, insideVisionCone } from './detection.js';

export const WARDEN_CONE_RANGE = 230;
export const WARDEN_CONE_HALF = 0.55;
export const WARDEN_RADIUS = 14;

export function createWardens(definitions) {
  return definitions.map((definition, index) => {
    const first = definition.waypoints[0];
    return {
      id: index,
      x: first[0],
      y: first[1],
      angle: Math.PI / 2,
      waypoints: definition.waypoints,
      waypointIndex: 1,
      wait: 0,
      speed: definition.speed,
      state: 'calm',
      suspicion: 0,
      lastSeen: null,
      searchTimer: 0,
      investigate: null,
      heardAt: null,
      seesPlayer: false,
    };
  });
}

function turnToward(warden, targetAngle, delta) {
  let diff = targetAngle - warden.angle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  const step = Math.max(-2.6 * delta, Math.min(2.6 * delta, diff));
  warden.angle += step;
}

function moveToward(warden, targetX, targetY, speed, delta) {
  const dx = targetX - warden.x;
  const dy = targetY - warden.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 1) return true;
  const step = Math.min(distance, speed * delta);
  warden.x += (dx / distance) * step;
  warden.y += (dy / distance) * step;
  turnToward(warden, Math.atan2(dy, dx), delta);
  return distance - step < 2;
}

/** How fast this warden's suspicion climbs while it can see the magpie. */
export function suspicionRate(warden, player, distance, inShadow, inLight, blockers) {
  if (!insideVisionCone(warden.x, warden.y, warden.angle, WARDEN_CONE_RANGE, WARDEN_CONE_HALF, player.x, player.y, blockers)) return 0;
  const closeness = 1 - distance / WARDEN_CONE_RANGE;
  let rate = 0.35 + closeness * 0.9;
  if (player.sneaking) rate *= 0.5;
  if (player.running) rate *= 2;
  if (player.gliding > 0) rate *= 1.4;
  if (inShadow) rate *= 0.5;
  if (inLight) rate *= 1.5;
  return rate;
}

/** One warden's step: watch, patrol, chase, search, or walk to a noise. */
export function updateWarden(warden, state, delta) {
  const { player, gallery, blockers, alarm } = state;
  const distance = Math.hypot(player.x - warden.x, player.y - warden.y);
  const inShadow = state.inShadowNow;
  const inLight = insideAnyCircle(player.x, player.y, gallery.chandeliers);
  const hiddenBySmoke = state.smoke.some((cloud) => Math.hypot(player.x - cloud.x, player.y - cloud.y) <= cloud.r);
  const seen = !hiddenBySmoke && suspicionRate(warden, player, distance, inShadow, inLight, blockers) > 0;
  warden.seesPlayer = seen;

  if (seen) {
    warden.suspicion = Math.min(1, warden.suspicion + suspicionRate(warden, player, distance, inShadow, inLight, blockers) * delta);
    warden.lastSeen = { x: player.x, y: player.y };
    if (distance < 70) warden.suspicion = 1;
  } else {
    warden.suspicion = Math.max(0, warden.suspicion - 0.25 * delta);
  }

  if (warden.suspicion >= 1 && warden.state !== 'alert') {
    warden.state = 'alert';
    warden.searchTimer = 0;
  }

  // A noise the warden can hear pulls a calm warden over to listen.
  if (state.noises.length > 0 && warden.state === 'calm') {
    for (let index = 0; index < state.noises.length; index += 1) {
      const noise = state.noises[index];
      if (Math.hypot(noise.x - warden.x, noise.y - warden.y) <= noise.radius) {
        warden.state = 'suspicious';
        warden.investigate = { x: noise.x, y: noise.y };
        warden.suspicion = Math.max(warden.suspicion, 0.45);
        break;
      }
    }
  }

  // A shiny decoy is irresistible: walk to it and stare for a while.
  if (state.decoys.length > 0 && (warden.state === 'calm' || warden.state === 'suspicious')) {
    for (let index = 0; index < state.decoys.length; index += 1) {
      const decoy = state.decoys[index];
      if (Math.hypot(decoy.x - warden.x, decoy.y - warden.y) <= 340) {
        warden.investigate = { x: decoy.x, y: decoy.y };
        warden.state = 'suspicious';
        warden.suspicion = Math.max(warden.suspicion, 0.4);
        break;
      }
    }
  }

  const speedBoost = alarm.lockdown > 0 ? 1.5 : 1;
  if (warden.state === 'alert') {
    const target = alarm.lockdown > 0 ? { x: player.x, y: player.y } : warden.lastSeen;
    if (target && moveToward(warden, target.x, target.y, warden.speed * 1.9 * speedBoost, delta)) {
      warden.state = 'search';
      warden.searchTimer = 4;
    }
    if (!seen && warden.suspicion < 0.4) {
      warden.state = 'search';
      warden.searchTimer = 4;
    }
  } else if (warden.state === 'suspicious') {
    if (warden.investigate) {
      turnToward(warden, Math.atan2(warden.investigate.y - warden.y, warden.investigate.x - warden.x), delta);
      if (moveToward(warden, warden.investigate.x, warden.investigate.y, warden.speed * 0.9, delta)) {
        warden.investigate = null;
        warden.wait = 1.6;
      }
    } else if (warden.lastSeen) {
      turnToward(warden, Math.atan2(warden.lastSeen.y - warden.y, warden.lastSeen.x - warden.x), delta);
    }
    if (warden.suspicion <= 0.05) {
      warden.state = 'calm';
      warden.lastSeen = null;
    }
  } else if (warden.state === 'search') {
    warden.searchTimer -= delta;
    if (warden.searchTimer <= 0) {
      warden.state = 'calm';
      warden.suspicion = 0;
      warden.lastSeen = null;
    } else {
      // Sweep the head while searching the last seen spot.
      warden.angle += Math.sin(state.time * 2 + warden.id) * 1.4 * delta;
    }
  } else {
    // CALM: walk the patrol, pausing at each waypoint.
    if (warden.wait > 0) {
      warden.wait -= delta;
    } else {
      const target = warden.waypoints[warden.waypointIndex];
      if (moveToward(warden, target[0], target[1], warden.speed * speedBoost, delta)) {
        warden.waypointIndex = (warden.waypointIndex + 1) % warden.waypoints.length;
        warden.wait = 1.2;
      }
    }
  }

  // Keep wardens inside the hall and out of the furniture.
  warden.x = Math.max(30, Math.min(1250, warden.x));
  warden.y = Math.max(80, Math.min(770, warden.y));
}

/** True when any warden is close enough to catch the magpie right now. */
export function wardenCatchesPlayer(state) {
  for (let index = 0; index < state.wardens.length; index += 1) {
    const warden = state.wardens[index];
    if (warden.state === 'alert' && Math.hypot(warden.x - state.player.x, warden.y - state.player.y) < WARDEN_RADIUS + 12) {
      return warden;
    }
  }
  return null;
}
