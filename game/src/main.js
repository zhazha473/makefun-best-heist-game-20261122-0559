// Magpie — bootstrap and state machine. Screens: title -> map -> playing ->
// galleryEnd -> map/victory, with pause over playing. The loop steps the
// player, the wardens, the cameras and the alarm, and hands the frame to the
// renderer. With ?shot=... the game stages one frozen frame for screenshots.

import { GALLERIES, galleryBlockers, galleryTotals, WORLD_WIDTH, WORLD_HEIGHT } from './galleries.js';
import { createAlarm, raiseAlarm, updateAlarm } from './alarm.js';
import { createWardens, updateWarden, wardenCatchesPlayer } from './wardens.js';
import { createCameras, updateCamera, cameraSeesPlayer } from './cameras.js';
import { createPlayer, updatePlayer } from './player.js';
import { createToolState, useTool, TOOLS } from './tools.js';
import { createAudio } from './audio.js';
import { createInput, attachInput, endFrameInput } from './input.js';
import { buildHud, updateHud } from './hud.js';
import { drawGame } from './render.js';
import { stageShot } from './shots.js';
import { createSeededRandom } from './random.js';
import { insideAnyRect } from './detection.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') ?? 1) || 1;
const rng = createSeededRandom(seed);

const state = {
  screen: 'title',
  galleries: GALLERIES,
  gallery: GALLERIES[0],
  galleryIndex: 0,
  blockers: [],
  wardens: [],
  cameras: [],
  trinkets: [],
  player: null,
  alarm: createAlarm(),
  score: 0,
  shine: 0,
  time: 0,
  totalTime: 0,
  lootTaken: 0,
  relicTaken: false,
  galleryComplete: false,
  ownsLockpick: false,
  toolState: createToolState(),
  decoys: [],
  smoke: [],
  noises: [],
  message: '',
  messageTimer: 0,
  hintTimer: 0,
  hintTarget: null,
  hintsLeft: 1,
  channelNoiseTimer: 0,
  inShadowNow: false,
  unlocked: 0,
  galleryScores: [null, null, null],
  galleryPeaks: [null, null, null],
  totalLoot: 0,
  totalLockdowns: 0,
  endStats: null,
  victoryStats: null,
  galleryCards: [],
  audio: createAudio(),
  input: createInput(),
  alarmSoundTimer: 0,
  rng,
};

function loadGallery(index) {
  const gallery = GALLERIES[index];
  state.galleryIndex = index;
  state.gallery = gallery;
  state.blockers = galleryBlockers(gallery);
  state.wardens = createWardens(gallery.wardens);
  state.cameras = createCameras(gallery.cameras);
  state.trinkets = gallery.trinkets.map((trinket) => ({ ...trinket, taken: false }));
  state.player = createPlayer(gallery.start);
  state.alarm = createAlarm();
  state.time = 0;
  state.lootTaken = 0;
  state.relicTaken = false;
  state.galleryComplete = false;
  state.ownsLockpick = false;
  state.toolState = createToolState();
  state.decoys = [];
  state.smoke = [];
  state.noises = [];
  state.message = '';
  state.messageTimer = 0;
  state.hintTimer = 0;
  state.hintTarget = null;
  state.hintsLeft = 1;
  state.channelNoiseTimer = 0;
  state.screen = 'playing';
}
state.loadGallery = loadGallery;

function finishGallery() {
  const seconds = state.time;
  const timeBonus = Math.max(0, Math.round(300 - seconds * 2));
  const ghostBonus = state.alarm.peak < 25 ? 300 : state.alarm.peak < 60 ? 100 : 0;
  const galleryScore = 500 + state.lootTaken * 50 + timeBonus + ghostBonus;
  state.score += timeBonus + ghostBonus;
  const toolsUsed = state.toolState.used.reduce((sum, count) => sum + count, 0);
  state.endStats = {
    seconds,
    loot: state.lootTaken,
    trinkets: state.gallery.trinkets.length,
    alarmPeak: state.alarm.peak,
    toolsUsed,
    galleryScore,
  };
  state.galleryScores[state.galleryIndex] = galleryScore;
  state.galleryPeaks[state.galleryIndex] = state.alarm.peak;
  state.totalLoot += state.lootTaken;
  state.totalLockdowns += state.alarm.tripped;
  state.unlocked = Math.max(state.unlocked, Math.min(2, state.galleryIndex + 1));
  state.screen = 'galleryEnd';
  state.audio.win();
}

function finishGame() {
  const toolsUsed = state.toolState.used.reduce((sum, count) => sum + count, 0);
  state.victoryStats = {
    loot: state.totalLoot,
    toolsUsed,
    seconds: state.totalTime,
    lockdowns: state.totalLockdowns,
    ghostGalleries: state.galleryPeaks.filter((peak) => peak != null && peak < 25).length,
  };
  state.screen = 'victory';
}

function caughtByWarden() {
  state.audio.caught();
  state.score = Math.max(0, state.score - 150);
  state.player = createPlayer(state.gallery.start);
  state.alarm.value = 35;
  state.alarm.lockdown = 0;
  for (const warden of state.wardens) {
    warden.state = 'calm';
    warden.suspicion = 0;
    warden.lastSeen = null;
    warden.investigate = null;
  }
  state.message = 'Caught! Back to the gallery door — the loot you pocketed stays yours.';
  state.messageTimer = 4;
}

function useHint() {
  if (state.hintsLeft <= 0 || state.screen !== 'playing') return;
  state.hintsLeft -= 1;
  const target = state.relicTaken ? state.gallery.skylight : state.gallery.relic;
  state.hintTarget = { x: target.x, y: target.y };
  state.hintTimer = 4;
  state.message = state.relicTaken ? 'The skylight is marked — go!' : 'The relic is marked — plan your route.';
  state.messageTimer = 3;
}

function handleKey(code) {
  state.audio.ensure();
  if (code === 'KeyM') {
    state.audio.setMuted(!state.audio.muted);
    state.message = state.audio.muted ? 'Sound muted.' : 'Sound on.';
    state.messageTimer = 2;
    return;
  }
  if (state.screen === 'title') {
    if (code === 'Enter' || code === 'Space') {
      state.screen = 'map';
      state.audio.startDrone();
    }
    return;
  }
  if (state.screen === 'map') {
    if (code === 'Digit1' || code === 'Digit2' || code === 'Digit3') {
      const index = Number(code.slice(-1)) - 1;
      if (index <= state.unlocked) loadGallery(index);
    }
    return;
  }
  if (state.screen === 'galleryEnd') {
    if (code === 'Enter' || code === 'Space') {
      if (state.galleryIndex < 2) {
        state.screen = 'map';
      } else {
        finishGame();
      }
    }
    return;
  }
  if (state.screen === 'victory') {
    if (code === 'Enter' || code === 'Space') {
      state.score = 0;
      state.shine = 0;
      state.totalTime = 0;
      state.totalLoot = 0;
      state.totalLockdowns = 0;
      state.galleryScores = [null, null, null];
      state.galleryPeaks = [null, null, null];
      state.unlocked = 0;
      state.screen = 'title';
    }
    return;
  }
  if (code === 'KeyP' || code === 'Escape') {
    if (state.screen === 'playing') state.screen = 'paused';
    else if (state.screen === 'paused') state.screen = 'playing';
    return;
  }
  if (state.screen === 'paused') return;
  if (code === 'KeyR') {
    loadGallery(state.galleryIndex);
    state.message = 'Gallery restarted.';
    state.messageTimer = 2;
    return;
  }
  if (code === 'KeyH') {
    useHint();
    return;
  }
  if (code.startsWith('Digit')) {
    const index = Number(code.slice(-1)) - 1;
    if (index >= 0 && index < TOOLS.length) {
      const note = useTool(state, index, state.input.mouse.worldX, state.input.mouse.worldY);
      if (note) {
        state.message = note;
        state.messageTimer = 3;
      }
    }
  }
}

function handleClick(worldX, worldY) {
  state.audio.ensure();
  if (state.screen === 'title') {
    state.screen = 'map';
    state.audio.startDrone();
    return;
  }
  if (state.screen === 'map') {
    for (const card of state.galleryCards) {
      if (card.unlocked && worldX >= card.x && worldX <= card.x + card.w && worldY >= card.y && worldY <= card.y + card.h) {
        loadGallery(card.index);
        return;
      }
    }
    return;
  }
  if (state.screen === 'playing' && state.player) {
    state.player.clickTarget = { x: worldX, y: worldY };
  }
}

function viewTransform() {
  const scale = Math.min(window.innerWidth / WORLD_WIDTH, window.innerHeight / WORLD_HEIGHT);
  const offsetX = (window.innerWidth - WORLD_WIDTH * scale) / 2;
  const offsetY = (window.innerHeight - WORLD_HEIGHT * scale) / 2;
  return { scale, offsetX, offsetY };
}

function toWorld(clientX, clientY) {
  const view = viewTransform();
  return { x: (clientX - view.offsetX) / view.scale, y: (clientY - view.offsetY) / view.scale };
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function renderFrame() {
  const view = viewTransform();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#0b0716';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(view.scale, 0, 0, view.scale, view.offsetX, view.offsetY);
  drawGame(ctx, state);
}

function update(delta) {
  state.time += delta;
  state.totalTime += delta;
  state.messageTimer = Math.max(0, state.messageTimer - delta);
  state.hintTimer = Math.max(0, state.hintTimer - delta);
  for (let index = 0; index < state.toolState.cooldowns.length; index += 1) {
    state.toolState.cooldowns[index] = Math.max(0, state.toolState.cooldowns[index] - delta);
  }
  for (let index = state.decoys.length - 1; index >= 0; index -= 1) {
    state.decoys[index].ttl -= delta;
    if (state.decoys[index].ttl <= 0) state.decoys.splice(index, 1);
  }
  for (let index = state.smoke.length - 1; index >= 0; index -= 1) {
    state.smoke[index].ttl -= delta;
    if (state.smoke[index].ttl <= 0) state.smoke.splice(index, 1);
  }
  for (let index = state.noises.length - 1; index >= 0; index -= 1) {
    state.noises[index].ttl -= delta;
    if (state.noises[index].ttl <= 0) state.noises.splice(index, 1);
  }

  state.inShadowNow = insideAnyRect(state.player.x, state.player.y, state.gallery.shadows);
  updatePlayer(state, state.input, delta);

  let anyoneSees = false;
  for (const warden of state.wardens) {
    updateWarden(warden, state, delta);
    if (warden.seesPlayer) anyoneSees = true;
  }
  const inSmoke = state.smoke.some((cloud) => Math.hypot(state.player.x - cloud.x, state.player.y - cloud.y) <= cloud.r);
  for (const camera of state.cameras) {
    const wasSeeing = camera.seesPlayer;
    updateCamera(camera, state.time, delta);
    if (cameraSeesPlayer(camera, state.player, state.blockers, inSmoke)) {
      anyoneSees = true;
      raiseAlarm(state.alarm, 22 * delta);
      if (!wasSeeing) state.audio.cameraClick();
    }
  }
  if (anyoneSees) {
    raiseAlarm(state.alarm, 4 * delta);
    state.alarmSoundTimer -= delta;
    if (state.alarmSoundTimer <= 0) {
      state.alarmSoundTimer = 0.6;
      state.audio.alarmTick(state.alarm.value);
    }
  }
  updateAlarm(state.alarm, delta, anyoneSees);

  const catcher = wardenCatchesPlayer(state);
  if (catcher) caughtByWarden();
  if (state.galleryComplete) finishGallery();
}

let lastTime = 0;
function loop(timestamp) {
  const delta = Math.min(0.05, (timestamp - lastTime) / 1000 || 0);
  lastTime = timestamp;
  if (state.screen === 'playing') update(delta);
  else {
    state.time += delta;
    state.messageTimer = Math.max(0, state.messageTimer - delta);
  }
  renderFrame();
  updateHud(state);
  endFrameInput(state.input);
  requestAnimationFrame(loop);
}

function boot() {
  buildHud();
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  attachInput(state.input, canvas, toWorld, { onKey: handleKey, onClick: handleClick });
  loadGallery(0);
  state.screen = 'title';
  state.time = 0;
  if (shotName) {
    stageShot(shotName, state);
    renderFrame();
    updateHud(state);
    return;
  }
  requestAnimationFrame((timestamp) => {
    lastTime = timestamp;
    requestAnimationFrame(loop);
  });
}

boot();

// Test hook: the play-test drives the real game through this handle.
window.__magpie = {
  state,
  loadGallery,
  handleKey,
  handleClick,
  totals: galleryTotals(),
};
