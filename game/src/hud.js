// The DOM HUD: the strip across the top of the screen that never leaves the
// player's sight — gallery, score, shine, timer, the alarm meter, the five
// tools with their shine costs, and a one-line message. Canvas draws the
// world; this file owns the numbers above it.

import { alarmLabel } from './alarm.js';
import { TOOLS } from './tools.js';

export function buildHud() {
  const bar = document.getElementById('hud');
  bar.innerHTML = `
    <div class="hud-group hud-gallery"><span id="hud-gallery">Songbird Hall</span><span id="hud-screen">GALLERY 1 / 3</span></div>
    <div class="hud-group"><span class="hud-label">SCORE</span><span id="hud-score">0</span></div>
    <div class="hud-group"><span class="hud-label">SHINE</span><span id="hud-shine">0 &#10022;</span></div>
    <div class="hud-group"><span class="hud-label">TIME</span><span id="hud-time">0:00</span></div>
    <div class="hud-group hud-alarm"><span class="hud-label">ALARM</span>
      <div class="alarm-track"><div id="hud-alarm-fill"></div></div>
      <span id="hud-alarm-value">0%</span><span id="hud-alarm-label">CALM</span>
    </div>
    <div class="hud-group hud-tools" id="hud-tools"></div>
    <div class="hud-group"><span class="hud-label">HINT</span><span id="hud-hint">1</span></div>
  `;
  const tools = document.getElementById('hud-tools');
  const shortNames = ['Decoy', 'Smoke', 'Lockpick', 'Glide', 'Jammer'];
  TOOLS.forEach((tool, index) => {
    const chip = document.createElement('div');
    chip.className = 'tool-chip';
    chip.id = `tool-${index}`;
    chip.innerHTML = `<span class="tool-key">${tool.key}</span><span class="tool-name">${shortNames[index]}</span><span class="tool-cost">${tool.cost}&#10022;</span>`;
    chip.title = `${tool.name} — ${tool.blurb}`;
    tools.appendChild(chip);
  });
  const message = document.createElement('div');
  message.id = 'hud-message';
  document.getElementById('game-wrap').appendChild(message);
}

/** Refresh every HUD number from the live state; cheap enough each frame. */
export function updateHud(state) {
  const gallery = state.gallery;
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };
  setText('hud-gallery', gallery.name);
  setText('hud-screen', `GALLERY ${gallery.number} / 3`);
  setText('hud-score', String(state.score));
  setText('hud-shine', `${state.shine} ✦`);
  const seconds = Math.floor(state.time);
  setText('hud-time', `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`);
  const fill = document.getElementById('hud-alarm-fill');
  if (fill) {
    fill.style.width = `${state.alarm.value}%`;
    fill.className = state.alarm.lockdown > 0 ? 'lockdown' : state.alarm.value >= 75 ? 'hot' : state.alarm.value >= 45 ? 'warm' : '';
  }
  setText('hud-alarm-value', `${Math.floor(state.alarm.value)}%`);
  setText('hud-alarm-label', alarmLabel(state.alarm));
  setText('hud-hint', String(state.hintsLeft));
  TOOLS.forEach((tool, index) => {
    const chip = document.getElementById(`tool-${index}`);
    if (!chip) return;
    const affordable = state.shine >= tool.cost && state.toolState.cooldowns[index] <= 0;
    chip.classList.toggle('affordable', affordable);
    chip.classList.toggle('owned', index === 2 && state.ownsLockpick);
    chip.classList.toggle('cooling', state.toolState.cooldowns[index] > 0);
  });
  const message = document.getElementById('hud-message');
  if (message) {
    message.textContent = state.messageTimer > 0 ? state.message : '';
    message.classList.toggle('show', state.messageTimer > 0);
  }
  const bar = document.getElementById('hud');
  if (bar) bar.style.display = state.screen === 'playing' || state.screen === 'paused' ? 'flex' : 'none';
}
