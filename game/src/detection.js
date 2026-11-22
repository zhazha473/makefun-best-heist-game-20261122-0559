// Line of sight and vision-cone maths for wardens and brass cameras. Every
// wall, display case and cage blocks sight, so reading the room means reading
// the cover between the magpie and the watcher.

/** True when the segment (x1,y1)-(x2,y2) touches the axis-aligned rect. */
export function segmentHitsRect(x1, y1, x2, y2, rect) {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  if (maxX < rect.x || minX > rect.x + rect.w || maxY < rect.y || minY > rect.y + rect.h) return false;
  if (pointInRect(x1, y1, rect) || pointInRect(x2, y2, rect)) return true;
  const left = rect.x;
  const right = rect.x + rect.w;
  const top = rect.y;
  const bottom = rect.y + rect.h;
  return (
    segmentsCross(x1, y1, x2, y2, left, top, right, top) ||
    segmentsCross(x1, y1, x2, y2, right, top, right, bottom) ||
    segmentsCross(x1, y1, x2, y2, right, bottom, left, bottom) ||
    segmentsCross(x1, y1, x2, y2, left, bottom, left, top)
  );
}

function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function segmentsCross(ax, ay, bx, by, cx, cy, dx, dy) {
  const first = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  const second = (bx - ax) * (dy - ay) - (by - ay) * (dx - ax);
  const third = (dx - cx) * (ay - cy) - (dy - cy) * (ax - cx);
  const fourth = (dx - cx) * (by - cy) - (dy - cy) * (bx - cx);
  return first * second < 0 && third * fourth < 0;
}

/**
 * True when nothing in `blockers` (rects) stands between the watcher and the
 * target. Cages are passed in as their bounding rects.
 */
export function hasLineOfSight(fromX, fromY, toX, toY, blockers) {
  for (let index = 0; index < blockers.length; index += 1) {
    if (segmentHitsRect(fromX, fromY, toX, toY, blockers[index])) return false;
  }
  return true;
}

/** Smallest absolute turn between two angles, in radians. */
export function angleDifference(a, b) {
  let diff = a - b;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return Math.abs(diff);
}

/**
 * True when the target sits inside a watcher's cone: within range, inside the
 * half-angle around the facing, and with a clear line of sight.
 */
export function insideVisionCone(watcherX, watcherY, facing, range, halfAngle, targetX, targetY, blockers) {
  const dx = targetX - watcherX;
  const dy = targetY - watcherY;
  const distance = Math.hypot(dx, dy);
  if (distance > range) return false;
  if (distance < 26) return hasLineOfSight(watcherX, watcherY, targetX, targetY, blockers);
  if (angleDifference(Math.atan2(dy, dx), facing) > halfAngle) return false;
  return hasLineOfSight(watcherX, watcherY, targetX, targetY, blockers);
}

/** True when the point sits inside any rect of the list (shadow, vent, cover). */
export function insideAnyRect(x, y, rects) {
  for (let index = 0; index < rects.length; index += 1) {
    if (pointInRect(x, y, rects[index])) return true;
  }
  return false;
}

/** True when the point sits inside any circle of the list (smoke, decoy lure). */
export function insideAnyCircle(x, y, circles) {
  for (let index = 0; index < circles.length; index += 1) {
    const circle = circles[index];
    if (Math.hypot(x - circle.x, y - circle.y) <= circle.r) return true;
  }
  return false;
}
