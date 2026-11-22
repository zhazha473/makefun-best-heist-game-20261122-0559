// The five tools, bought with shine — the small glittering trinkets the
// magpie pockets on the way. Every tool costs shine, so every use is a
// choice: spend now, or save for the vault.

import { nearestCamera } from './cameras.js';
export const TOOLS = [
  { key: '1', name: 'Shiny Decoy', cost: 3, blurb: 'Tossed glitter — wardens walk to it' },
  { key: '2', name: 'Smoke Feather', cost: 4, blurb: 'A 3s cloud no eye can see through' },
  { key: '3', name: 'Lockpick', cost: 2, blurb: 'Own it once — relics lift instantly' },
  { key: '4', name: 'Silent Glide', cost: 3, blurb: '2s of fast, soundless flight' },
  { key: '5', name: 'Camera Jammer', cost: 5, blurb: 'Nearest camera dark for 5s' },
];

export function createToolState() {
  return { cooldowns: [0, 0, 0, 0, 0], used: [0, 0, 0, 0, 0] };
}

/** Spend a tool by index (0-4). Returns a short note for the HUD, or null. */
export function useTool(state, index, targetX, targetY) {
  const tool = TOOLS[index];
  if (!tool) return null;
  if (state.toolState.cooldowns[index] > 0) return 'That tool is still cooling down.';
  if (index === 2 && state.ownsLockpick) return 'Lockpick already owned.';
  if (state.shine < tool.cost) return `Need ${tool.cost} shine for ${tool.name}.`;
  state.shine -= tool.cost;
  state.toolState.cooldowns[index] = 1;
  state.toolState.used[index] += 1;

  if (index === 0) {
    const x = targetX ?? state.player.x + Math.cos(state.player.angle) * 130;
    const y = targetY ?? state.player.y + Math.sin(state.player.angle) * 130;
    state.decoys.push({ x: Math.max(50, Math.min(1230, x)), y: Math.max(100, Math.min(750, y)), ttl: 6, r: 10 });
    state.audio.decoy();
    return 'Decoy tossed — the wardens turn to the glitter.';
  }
  if (index === 1) {
    state.smoke.push({ x: state.player.x, y: state.player.y, r: 95, ttl: 3 });
    state.audio.smoke();
    return 'Smoke feather bursts — unseen for 3 seconds.';
  }
  if (index === 2) {
    state.ownsLockpick = true;
    state.audio.buy();
    return 'Lockpick bought — relics lift instantly now.';
  }
  if (index === 3) {
    state.player.gliding = 2;
    state.audio.glide();
    return 'Silent glide — two seconds of soundless flight.';
  }
  const camera = nearestCamera(state.cameras, state.player.x, state.player.y, 420);
  if (!camera) {
    state.shine += tool.cost;
    state.toolState.used[index] -= 1;
    return 'No live camera in range to jam.';
  }
  camera.jammed = 5;
  state.audio.jammer();
  return 'Camera jammed — dark for 5 seconds.';
}
