// All drawing: the museum at night in Canvas 2D — purple floor, stained
// glass, brass cages and cases, yellow warden cones, red camera beams, the
// glittering relic, and the magpie itself. No image files anywhere; every
// pixel here is drawn by these functions.

import { WORLD_WIDTH, WORLD_HEIGHT } from './galleries.js';
import { WARDEN_CONE_RANGE, WARDEN_CONE_HALF, WARDEN_RADIUS } from './wardens.js';
import { CAMERA_HALF_ANGLE } from './cameras.js';
import { PLAYER_RADIUS } from './player.js';

const GOLD = '#c9a227';
const BRASS = '#b08d3e';
const FLOOR_A = '#1d1433';
const FLOOR_B = '#241a3e';

function roundRect(ctx, x, y, w, h, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawFloor(ctx, gallery, time) {
  ctx.fillStyle = FLOOR_A;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  ctx.fillStyle = FLOOR_B;
  const tile = 80;
  for (let y = 0; y < WORLD_HEIGHT / tile; y += 1) {
    for (let x = 0; x < WORLD_WIDTH / tile; x += 1) {
      if ((x + y) % 2 === 0) ctx.fillRect(x * tile, y * tile, tile, tile);
    }
  }
  // Stained-glass windows along the north wall.
  const panes = ['#c0392b', '#2471a3', '#d4ac0d', '#1e8449', '#8e44ad', '#ca6f1e'];
  for (let index = 0; index < 6; index += 1) {
    const x = 90 + index * 200;
    ctx.fillStyle = panes[index % panes.length];
    ctx.globalAlpha = 0.5 + 0.12 * Math.sin(time * 0.8 + index);
    ctx.fillRect(x, 74, 130, 10);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#0f0a1e';
    ctx.fillRect(x + 62, 74, 6, 10);
  }
  // Potted ferns in the corners.
  for (const [x, y] of [[70, 730], [1210, 730], [70, 120], [1210, 120]]) {
    ctx.strokeStyle = '#2e7d4f';
    ctx.lineWidth = 3;
    for (let leaf = 0; leaf < 5; leaf += 1) {
      const angle = -Math.PI / 2 + (leaf - 2) * 0.35;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.cos(angle) * 14, y + Math.sin(angle) * 14, x + Math.cos(angle) * 26, y + Math.sin(angle) * 26);
      ctx.stroke();
    }
    ctx.fillStyle = '#7d5a2e';
    ctx.fillRect(x - 9, y - 4, 18, 12);
  }
}

function drawShadowsAndVents(ctx, gallery) {
  for (const shadow of gallery.shadows) {
    ctx.fillStyle = 'rgba(4, 2, 12, 0.55)';
    roundRect(ctx, shadow.x, shadow.y, shadow.w, shadow.h, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120, 100, 200, 0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  for (const vent of gallery.vents) {
    ctx.fillStyle = '#0a0616';
    ctx.fillRect(vent.x, vent.y, vent.w, vent.h);
    ctx.strokeStyle = '#4a3f6b';
    ctx.lineWidth = 2;
    ctx.strokeRect(vent.x, vent.y, vent.w, vent.h);
    ctx.strokeStyle = '#2c2350';
    for (let x = vent.x + 12; x < vent.x + vent.w - 6; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, vent.y + 6);
      ctx.lineTo(x, vent.y + vent.h - 6);
      ctx.stroke();
    }
    ctx.fillStyle = '#8f86b8';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VENT', vent.x + vent.w / 2, vent.y + vent.h / 2 + 4);
  }
}

function drawChandeliers(ctx, gallery, time) {
  for (const chandelier of gallery.chandeliers) {
    // Warm pool of light on the floor — beautiful, and dangerous: standing
    // in it makes the magpie half again as easy to spot.
    const pool = ctx.createRadialGradient(chandelier.x, chandelier.y, 6, chandelier.x, chandelier.y, chandelier.r + 26);
    pool.addColorStop(0, 'rgba(255, 220, 130, 0.20)');
    pool.addColorStop(1, 'rgba(255, 220, 130, 0)');
    ctx.fillStyle = pool;
    ctx.beginPath();
    ctx.arc(chandelier.x, chandelier.y, chandelier.r + 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 220, 130, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(chandelier.x, chandelier.y, chandelier.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    // The brass fixture itself: a ring of candles.
    ctx.strokeStyle = BRASS;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(chandelier.x, chandelier.y, 20, 0, Math.PI * 2);
    ctx.stroke();
    for (let candle = 0; candle < 6; candle += 1) {
      const angle = (candle / 6) * Math.PI * 2 + time * 0.1;
      const cx = chandelier.x + Math.cos(angle) * 20;
      const cy = chandelier.y + Math.sin(angle) * 20;
      ctx.fillStyle = `rgba(255, 236, 160, ${0.7 + 0.3 * Math.sin(time * 3 + candle)})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawWallsCasesCages(ctx, gallery) {
  for (const wall of gallery.walls) {
    ctx.fillStyle = '#2c2340';
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = GOLD;
    ctx.fillRect(wall.x, wall.y, wall.w, 3);
  }
  for (const display of gallery.cases) {
    ctx.fillStyle = 'rgba(140, 200, 255, 0.16)';
    ctx.fillRect(display.x, display.y, display.w, display.h);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    ctx.strokeRect(display.x, display.y, display.w, display.h);
    ctx.fillStyle = 'rgba(255, 230, 150, 0.85)';
    ctx.beginPath();
    ctx.arc(display.x + display.w / 2, display.y + display.h / 2, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const cage of gallery.cages) {
    ctx.strokeStyle = BRASS;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cage.x, cage.y, cage.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cage.x, cage.y, cage.r - 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(176, 141, 62, 0.7)';
    ctx.lineWidth = 2;
    for (let bar = 0; bar < 8; bar += 1) {
      const angle = (bar / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cage.x + Math.cos(angle) * (cage.r - 8), cage.y + Math.sin(angle) * (cage.r - 8));
      ctx.lineTo(cage.x + Math.cos(angle) * cage.r, cage.y + Math.sin(angle) * cage.r);
      ctx.stroke();
    }
    ctx.fillStyle = '#0f0a1e';
    ctx.beginPath();
    ctx.arc(cage.x, cage.y, 9, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSkylight(ctx, gallery, relicTaken, time) {
  const { x, y } = gallery.skylight;
  const open = relicTaken;
  const pulse = 0.55 + 0.25 * Math.sin(time * 2.4);
  const gradient = ctx.createRadialGradient(x, y, 4, x, y, 90);
  gradient.addColorStop(0, open ? `rgba(255, 244, 200, ${0.75 + pulse * 0.2})` : 'rgba(200, 210, 255, 0.25)');
  gradient.addColorStop(1, 'rgba(255, 244, 200, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = open ? '#ffe98a' : '#7d84a8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, 26, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 26, y);
  ctx.lineTo(x + 26, y);
  ctx.moveTo(x, y - 26);
  ctx.lineTo(x, y + 26);
  ctx.stroke();
  ctx.fillStyle = open ? '#ffe98a' : '#9aa1c2';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(open ? 'SKYLIGHT — ESCAPE!' : 'SKYLIGHT', x, y + 46);
}

function drawLoot(ctx, state, time) {
  for (const trinket of state.trinkets) {
    if (trinket.taken) continue;
    const twinkle = 0.7 + 0.3 * Math.sin(time * 3 + trinket.x);
    ctx.save();
    ctx.translate(trinket.x, trinket.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = `rgba(255, 215, 80, ${twinkle})`;
    ctx.fillRect(-5, -5, 10, 10);
    ctx.restore();
    ctx.fillStyle = `rgba(255, 240, 170, ${twinkle * 0.8})`;
    ctx.beginPath();
    ctx.arc(trinket.x, trinket.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!state.relicTaken) {
    const relic = state.gallery.relic;
    const bob = Math.sin(time * 2) * 4;
    const glow = ctx.createRadialGradient(relic.x, relic.y + bob, 4, relic.x, relic.y + bob, 70);
    glow.addColorStop(0, relic.glow);
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(relic.x, relic.y + bob, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(relic.x, relic.y + bob);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = relic.color;
    ctx.fillRect(-14, -14, 28, 28);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillRect(-14, -14, 12, 12);
    ctx.restore();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(relic.name.toUpperCase(), relic.x, relic.y + bob + 44);
  }
}

function drawDecoysAndSmoke(ctx, state, time) {
  for (const decoy of state.decoys) {
    const sparkle = 0.6 + 0.4 * Math.sin(time * 8);
    ctx.strokeStyle = `rgba(255, 220, 90, ${sparkle})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(decoy.x, decoy.y, 14 + 4 * Math.sin(time * 6), 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ffe27a';
    ctx.beginPath();
    ctx.arc(decoy.x, decoy.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const cloud of state.smoke) {
    ctx.fillStyle = 'rgba(200, 200, 215, 0.35)';
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(220, 220, 235, 0.3)';
    ctx.beginPath();
    ctx.arc(cloud.x - 30, cloud.y + 12, cloud.r * 0.55, 0, Math.PI * 2);
    ctx.arc(cloud.x + 32, cloud.y - 10, cloud.r * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawVisionCone(ctx, x, y, angle, range, halfAngle, color, alpha) {
  const gradient = ctx.createRadialGradient(x, y, 8, x, y, range);
  gradient.addColorStop(0, color.replace('A', String(alpha)));
  gradient.addColorStop(1, color.replace('A', '0'));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  ctx.fill();
}

function drawWardens(ctx, state, time) {
  for (const warden of state.wardens) {
    const coneColor = warden.state === 'alert' ? 'rgba(255, 80, 60, A)' : 'rgba(255, 214, 64, A)';
    drawVisionCone(ctx, warden.x, warden.y, warden.angle, WARDEN_CONE_RANGE, WARDEN_CONE_HALF, coneColor, warden.state === 'alert' ? 0.4 : 0.28);
  }
  for (const warden of state.wardens) {
    ctx.save();
    ctx.translate(warden.x, warden.y);
    // Lantern glow.
    const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 46);
    glow.addColorStop(0, 'rgba(255, 220, 130, 0.35)');
    glow.addColorStop(1, 'rgba(255, 220, 130, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.rotate(warden.angle);
    ctx.fillStyle = warden.state === 'alert' ? '#7a1f1a' : '#1f2a5e';
    ctx.beginPath();
    ctx.arc(0, 0, WARDEN_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ffd94d';
    ctx.beginPath();
    ctx.arc(8, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    if (warden.state === 'alert') {
      ctx.fillStyle = '#ff5a4a';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText('!', warden.x, warden.y - 24);
    } else if (warden.state === 'suspicious' || warden.state === 'search') {
      ctx.fillStyle = '#ffd94d';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText('?', warden.x, warden.y - 24);
    }
    ctx.fillStyle = '#cdd3f5';
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText(warden.state.toUpperCase(), warden.x, warden.y + 28);
  }
}

function drawCameras(ctx, state, time) {
  for (const camera of state.cameras) {
    if (camera.jammed <= 0) {
      drawVisionCone(ctx, camera.x, camera.y, camera.angle, camera.range, CAMERA_HALF_ANGLE, 'rgba(255, 60, 50, A)', 0.35);
    }
  }
  for (const camera of state.cameras) {
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.fillStyle = '#3a2f16';
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = BRASS;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.rotate(camera.jammed > 0 ? camera.base : camera.angle);
    ctx.fillStyle = camera.jammed > 0 ? '#555' : '#c0392b';
    ctx.beginPath();
    ctx.arc(9, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (camera.jammed > 0) {
      ctx.fillStyle = '#9aa1c2';
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('JAMMED', camera.x, camera.y + 26);
    } else if (camera.seesPlayer) {
      ctx.fillStyle = '#ff5040';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SPOTTED', camera.x, camera.y + 26);
    }
  }
}

function drawPlayer(ctx, state, time) {
  const player = state.player;
  ctx.save();
  ctx.translate(player.x, player.y);
  if (player.gliding > 0) {
    ctx.strokeStyle = 'rgba(160, 220, 255, 0.6)';
    ctx.lineWidth = 2;
    for (let line = 0; line < 3; line += 1) {
      ctx.beginPath();
      ctx.moveTo(-14 - line * 6, -8 + line * 8);
      ctx.lineTo(-30 - line * 6, -8 + line * 8);
      ctx.stroke();
    }
  }
  ctx.rotate(player.angle);
  const crouch = player.sneaking ? 0.85 : 1;
  ctx.scale(crouch, crouch);
  // Tail feathers.
  ctx.fillStyle = '#0d0a18';
  ctx.beginPath();
  ctx.moveTo(-8, -4);
  ctx.lineTo(-30, -8);
  ctx.lineTo(-30, 8);
  ctx.lineTo(-8, 4);
  ctx.closePath();
  ctx.fill();
  // Body: black back, white belly, iridescent wing.
  ctx.fillStyle = '#14101f';
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f4f0e6';
  ctx.beginPath();
  ctx.ellipse(3, 4, 9, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2e7f9e';
  ctx.beginPath();
  ctx.ellipse(-2, -7, 9, 4, -0.4, 0, Math.PI * 2);
  ctx.fill();
  // Head, beak, eye.
  ctx.fillStyle = '#14101f';
  ctx.beginPath();
  ctx.arc(12, 0, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff9f1c';
  ctx.beginPath();
  ctx.moveTo(18, -3);
  ctx.lineTo(27, 0);
  ctx.lineTo(18, 3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(13, -3, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Relic-prising progress ring.
  if (player.channel > 0 && player.channelTarget) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#ffd94d';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 24, -Math.PI / 2, -Math.PI / 2 + (player.channel / 3) * Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ffe98a';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PRISING…', player.x, player.y - 32);
  }
}

function drawHintArrow(ctx, state, time) {
  if (state.hintTimer <= 0 || !state.hintTarget) return;
  const target = state.hintTarget;
  const player = state.player;
  const angle = Math.atan2(target.y - player.y, target.x - player.x);
  const pulse = 0.6 + 0.4 * Math.sin(time * 6);
  ctx.save();
  ctx.translate(player.x + Math.cos(angle) * 44, player.y + Math.sin(angle) * 44);
  ctx.rotate(angle);
  ctx.fillStyle = `rgba(255, 233, 138, ${pulse})`;
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(-8, -9);
  ctx.lineTo(-8, 9);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = `rgba(255, 233, 138, ${pulse * 0.7})`;
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(target.x, target.y);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawAlarmVignette(ctx, state, time) {
  const alarm = state.alarm;
  if (alarm.value < 20 && alarm.lockdown <= 0) return;
  const flashing = alarm.lockdown > 0 ? 0.25 + 0.2 * Math.sin(time * 10) : 0;
  const strength = Math.max((alarm.value / 100) * 0.3, flashing);
  const gradient = ctx.createRadialGradient(640, 400, 260, 640, 400, 720);
  gradient.addColorStop(0, 'rgba(255, 30, 20, 0)');
  gradient.addColorStop(1, `rgba(255, 30, 20, ${strength})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  if (alarm.lockdown > 0) {
    ctx.fillStyle = '#ff2a1a';
    ctx.font = 'bold 34px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`LOCKDOWN — ${Math.ceil(alarm.lockdown)}s`, 640, 150);
  }
}

function overlayPanel(ctx, title, lines, footer) {
  ctx.fillStyle = 'rgba(10, 6, 24, 0.82)';
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.strokeRect(300, 130, 680, 540);
  ctx.fillStyle = '#ffe98a';
  ctx.textAlign = 'center';
  let titleSize = 64;
  ctx.font = `bold ${titleSize}px Georgia, serif`;
  while (ctx.measureText(title).width > 620 && titleSize > 30) {
    titleSize -= 4;
    ctx.font = `bold ${titleSize}px Georgia, serif`;
  }
  ctx.fillText(title, 640, 240);
  ctx.fillStyle = '#e8e2ff';
  ctx.font = '20px Georgia, serif';
  lines.forEach((line, index) => ctx.fillText(line, 640, 310 + index * 36));
  if (footer) {
    ctx.fillStyle = '#ffd94d';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText(footer, 640, 310 + lines.length * 36 + 40);
  }
}

function drawTitle(ctx, state) {
  overlayPanel(
    ctx,
    'MAGPIE',
    [
      'A jewel-thieving magpie. One museum. Three galleries.',
      'Steal the Golden Egg, the Stained Glass Heart and the Star Sapphire,',
      'then slip out through the skylight — unseen if you can.',
      '',
      'WASD / arrows — move      Shift — sneak      Space — run',
      'Click — walk there      1–5 — tools (cost shine)      H — hint',
      'R — restart gallery      M — mute      P — pause',
      '',
      'Yellow cones are wardens. Red beams are cameras.',
      'Chandelier light makes you easier to spot — shadows hide you.',
      'Both feed the ALARM meter. At 100% the museum locks down.',
    ],
    'Press ENTER to begin the heist',
  );
}

function drawMap(ctx, state) {
  ctx.fillStyle = 'rgba(10, 6, 24, 0.85)';
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  ctx.fillStyle = '#ffe98a';
  ctx.font = 'bold 44px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('CHOOSE A GALLERY', 640, 140);
  state.galleryCards = [];
  for (let index = 0; index < 3; index += 1) {
    const gallery = state.galleries[index];
    const x = 190 + index * 310;
    const y = 220;
    const unlocked = index <= state.unlocked;
    state.galleryCards.push({ x, y, w: 270, h: 300, index, unlocked });
    ctx.fillStyle = unlocked ? '#241a3e' : '#14101f';
    roundRect(ctx, x, y, 270, 300, 12);
    ctx.fill();
    ctx.strokeStyle = unlocked ? GOLD : '#3a3355';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = unlocked ? '#ffe98a' : '#6b6486';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText(`GALLERY ${gallery.number}`, x + 135, y + 40);
    ctx.font = 'bold 21px Georgia, serif';
    ctx.fillText(gallery.name, x + 135, y + 78);
    ctx.fillStyle = '#cfc8ee';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText(`${gallery.wardens.length} wardens · ${gallery.cameras.length} cameras`, x + 135, y + 116);
    ctx.fillText(`${gallery.trinkets.length} trinkets · 1 relic`, x + 135, y + 140);
    ctx.fillText(gallery.subtitle, x + 135, y + 176, 240);
    ctx.fillStyle = unlocked ? '#ffd94d' : '#6b6486';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText(unlocked ? `Press ${index + 1} or click` : 'LOCKED — finish the last gallery', x + 135, y + 250);
    if (state.galleryScores[index] != null) {
      ctx.fillStyle = '#9be89b';
      ctx.fillText(`Best: ${state.galleryScores[index]} pts`, x + 135, y + 280);
    }
  }
  ctx.fillStyle = '#e8e2ff';
  ctx.font = '18px system-ui, sans-serif';
  ctx.fillText(`Total score ${state.score} · Shine ${state.shine} ✦`, 640, 600);
}

function drawGalleryEnd(ctx, state) {
  const end = state.endStats;
  const rating = end.alarmPeak < 25 ? 'GHOST — never raised the alarm' : end.alarmPeak < 60 ? 'SHADOW — barely a whisper' : 'SEEN — the museum knows your name';
  overlayPanel(
    ctx,
    `${state.gallery.name} — CLEARED`,
    [
      `Time ${Math.floor(end.seconds / 60)}:${String(Math.floor(end.seconds % 60)).padStart(2, '0')}  ·  Loot ${end.loot}/${end.trinkets} trinkets`,
      `Alarm peaked at ${Math.floor(end.alarmPeak)}%  ·  Tools used ${end.toolsUsed}`,
      `Gallery score ${end.galleryScore}  ·  Total score ${state.score}`,
      '',
      rating,
    ],
    'Press ENTER for the next gallery',
  );
}

function drawVictory(ctx, state) {
  const stats = state.victoryStats;
  overlayPanel(
    ctx,
    'THE STAR SAPPHIRE IS YOURS',
    [
      'Three galleries. Three relics. One very annoyed museum.',
      `Total score ${state.score}  ·  Trinkets ${stats.loot}/21  ·  Tools used ${stats.toolsUsed}`,
      `Time ${Math.floor(stats.seconds / 60)}:${String(Math.floor(stats.seconds % 60)).padStart(2, '0')}  ·  Lockdowns survived ${stats.lockdowns}`,
      `Ghost galleries: ${stats.ghostGalleries} of 3`,
      '',
      'The magpie flies home to a nest of gold.',
    ],
    'Press ENTER to play again',
  );
}

function drawPause(ctx) {
  ctx.fillStyle = 'rgba(10, 6, 24, 0.7)';
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  ctx.fillStyle = '#ffe98a';
  ctx.font = 'bold 48px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', 640, 400);
  ctx.fillStyle = '#e8e2ff';
  ctx.font = '20px system-ui, sans-serif';
  ctx.fillText('Press P to carry on the heist', 640, 450);
}

function drawTutorial(ctx, state) {
  if (state.gallery.number !== 1 || state.time > 14) return;
  ctx.fillStyle = 'rgba(10, 6, 24, 0.75)';
  roundRect(ctx, 340, 660, 600, 90, 10);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#ffe98a';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.gallery.hint, 640, 695);
  ctx.fillStyle = '#cfc8ee';
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText('WASD move · Shift sneak · Space run · Click to walk · 1–5 tools', 640, 722);
}

/** Draw the whole frame for the current screen, in world coordinates. */
export function drawGame(ctx, state) {
  ctx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  if (state.screen === 'title') {
    drawFloor(ctx, state.galleries[0], state.time);
    drawTitle(ctx, state);
    return;
  }
  if (state.screen === 'map') {
    drawMap(ctx, state);
    return;
  }
  if (state.screen === 'victory') {
    drawVictory(ctx, state);
    return;
  }
  drawFloor(ctx, state.gallery, state.time);
  drawShadowsAndVents(ctx, state.gallery);
  drawChandeliers(ctx, state.gallery, state.time);
  drawWallsCasesCages(ctx, state.gallery);
  drawSkylight(ctx, state.gallery, state.relicTaken, state.time);
  drawLoot(ctx, state, state.time);
  drawDecoysAndSmoke(ctx, state, state.time);
  drawWardens(ctx, state, state.time);
  drawCameras(ctx, state, state.time);
  drawPlayer(ctx, state, state.time);
  drawHintArrow(ctx, state, state.time);
  drawAlarmVignette(ctx, state, state.time);
  if (state.screen === 'galleryEnd') drawGalleryEnd(ctx, state);
  else if (state.screen === 'paused') drawPause(ctx);
  else drawTutorial(ctx, state);
}
