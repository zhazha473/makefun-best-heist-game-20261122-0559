// Seeded random numbers for the Gilded Aviary: a tiny mulberry32 generator so the
// staged screenshots and the shuffled trinket sparkle always land the same way.
export function createSeededRandom(seed) {
  let state = seed >>> 0;
  if (state === 0) state = 0x9e3779b9;
  return function nextRandom() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick an integer in [min, max] from a seeded random function. */
export function randomInt(random, min, max) {
  return min + Math.floor(random() * (max - min + 1));
}

/** Pick one entry from an array with a seeded random function. */
export function randomPick(random, entries) {
  return entries[Math.floor(random() * entries.length)];
}

/** Fisher-Yates shuffle that never touches Math.random. */
export function shuffleSeeded(random, entries) {
  const copy = entries.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    const held = copy[index];
    copy[index] = copy[other];
    copy[other] = held;
  }
  return copy;
}
