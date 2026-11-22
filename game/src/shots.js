// Deterministic staging for the four screenshots (?shot=...&seed=...). Each
// scene is built from the real game state — a real gallery, real wardens with
// real cones, a real alarm value — with the pieces placed so one frame shows
// the whole heist: the room, the thief, the cones, the cameras, the loot and
// the meter. The clock is frozen, so the same seed always gives the same frame.

function aimAt(fromX, fromY, toX, toY) {
  return Math.atan2(toY - fromY, toX - fromX);
}

function placeWarden(warden, x, y, focusX, focusY, stateName, suspicion) {
  warden.x = x;
  warden.y = y;
  warden.angle = aimAt(x, y, focusX, focusY);
  warden.state = stateName;
  warden.suspicion = suspicion;
  warden.lastSeen = { x: focusX, y: focusY };
  warden.wait = 0;
}

function aimCamera(camera, toX, toY) {
  camera.angle = aimAt(camera.x, camera.y, toX, toY);
}

/** Stage `name` (start|play|mid|vault|win) on the live state and return the screen to draw. */
export function stageShot(name, state) {
  state.time = 8;
  state.totalTime = 0;
  if (name === 'win') {
    state.screen = 'victory';
    state.score = 3850;
    state.victoryStats = { loot: 18, toolsUsed: 7, seconds: 486, lockdowns: 1, ghostGalleries: 2 };
    return;
  }
  if (name === 'start') {
    state.screen = 'title';
    return;
  }
  if (name === 'mid') {
    state.loadGallery(1);
    state.screen = 'playing';
    state.player.x = 600;
    state.player.y = 620;
    state.player.angle = aimAt(600, 620, 1180, 650);
    state.alarm.value = 78;
    state.alarm.peak = 78;
    state.score = 1450;
    state.shine = 6;
    state.time = 96;
    state.trinkets[0].taken = true;
    state.trinkets[1].taken = true;
    state.trinkets[3].taken = true;
    state.lootTaken = 3;
    placeWarden(state.wardens[0], 700, 520, 600, 620, 'alert', 1);
    placeWarden(state.wardens[1], 420, 400, 600, 620, 'suspicious', 0.55);
    placeWarden(state.wardens[2], 900, 700, 600, 620, 'calm', 0.1);
    aimCamera(state.cameras[1], 600, 620);
    aimCamera(state.cameras[0], 420, 330);
    state.smoke.push({ x: 560, y: 660, r: 70, ttl: 3 });
    state.message = 'Spotted! Break the line of sight — hide in the shadows.';
    state.messageTimer = 99;
    return;
  }
  if (name === 'vault') {
    state.loadGallery(2);
    state.screen = 'playing';
    state.player.x = 560;
    state.player.y = 430;
    state.player.angle = aimAt(560, 430, 640, 330);
    state.player.sneaking = true;
    state.alarm.value = 45;
    state.alarm.peak = 61;
    state.score = 2100;
    state.shine = 8;
    state.time = 132;
    state.trinkets[0].taken = true;
    state.trinkets[1].taken = true;
    state.trinkets[2].taken = true;
    state.trinkets[4].taken = true;
    state.lootTaken = 4;
    placeWarden(state.wardens[0], 330, 240, 560, 430, 'calm', 0.15);
    placeWarden(state.wardens[1], 950, 240, 560, 430, 'suspicious', 0.5);
    placeWarden(state.wardens[2], 760, 640, 560, 430, 'calm', 0.05);
    aimCamera(state.cameras[1], 640, 330);
    aimCamera(state.cameras[0], 420, 130);
    aimCamera(state.cameras[3], 560, 430);
    state.decoys.push({ x: 900, y: 300, ttl: 6, r: 10 });
    state.message = 'The Star Sapphire glitters in the middle of crossing cones.';
    state.messageTimer = 99;
    return;
  }
  // Default: the cover — gallery 1 mid-heist, everything visible at once.
  state.loadGallery(0);
  state.screen = 'playing';
  state.player.x = 400;
  state.player.y = 500;
  state.player.angle = aimAt(400, 500, 1150, 600);
  state.alarm.value = 32;
  state.alarm.peak = 32;
  state.score = 250;
  state.shine = 5;
  state.time = 47;
  state.trinkets[0].taken = true;
  state.trinkets[1].taken = true;
  state.lootTaken = 2;
  placeWarden(state.wardens[0], 250, 300, 400, 500, 'calm', 0.2);
  placeWarden(state.wardens[1], 850, 250, 640, 132, 'calm', 0.05);
  placeWarden(state.wardens[2], 700, 620, 400, 500, 'suspicious', 0.45);
  aimCamera(state.cameras[0], 640, 330);
  aimCamera(state.cameras[2], 400, 500);
  state.message = 'Golden Egg ahead — cross behind the cones, then lift it.';
  state.messageTimer = 99;
}
