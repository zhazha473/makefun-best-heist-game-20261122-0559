// The three galleries of the Gilded Aviary, hardest last: more wardens on
// faster patrols, more brass cameras sweeping wider, tighter cover. Every
// gallery has several routes — vents, the shadow behind display cases and
// cages, and the open floor under the chandeliers — a relic to steal and a
// skylight to vanish through. Totals: 9 wardens, 12 brass cameras, 21 trinkets.

export const WORLD_WIDTH = 1280;
export const WORLD_HEIGHT = 800;
export const PLAY_TOP = 86;
export const PLAY_BOTTOM = 764;
export const PLAY_LEFT = 36;
export const PLAY_RIGHT = 1244;

function borderWalls() {
  return [
    { x: 20, y: 70, w: 1240, h: 16 },
    { x: 20, y: 764, w: 1240, h: 16 },
    { x: 20, y: 70, w: 16, h: 710 },
    { x: 1244, y: 70, w: 16, h: 710 },
  ];
}

export const GALLERIES = [
  {
    name: 'Songbird Hall',
    number: 1,
    subtitle: 'The quiet wing — learn the cones, then the loot',
    parSeconds: 150,
    start: { x: 80, y: 720 },
    skylight: { x: 640, y: 132 },
    relic: { x: 1150, y: 600, name: 'Golden Egg', color: '#ffd94d', glow: '#ffedb0' },
    walls: borderWalls().concat([
      { x: 280, y: 210, w: 220, h: 18 },
      { x: 700, y: 430, w: 230, h: 18 },
      { x: 560, y: 170, w: 18, h: 170 },
      { x: 980, y: 300, w: 18, h: 190 },
    ]),
    cases: [
      { x: 170, y: 300, w: 96, h: 64 },
      { x: 470, y: 540, w: 110, h: 70 },
      { x: 820, y: 170, w: 104, h: 64 },
      { x: 1040, y: 540, w: 110, h: 70 },
    ],
    cages: [
      { x: 380, y: 640, r: 36 },
      { x: 920, y: 650, r: 36 },
      { x: 640, y: 320, r: 36 },
    ],
    vents: [
      { x: 56, y: 700, w: 130, h: 44 },
      { x: 1094, y: 106, w: 130, h: 44 },
    ],
    shadows: [
      { x: 140, y: 440, w: 210, h: 120 },
      { x: 850, y: 290, w: 180, h: 110 },
    ],
    chandeliers: [
      { x: 640, y: 480, r: 70 },
      { x: 1050, y: 300, r: 60 },
    ],
    trinkets: [
      { x: 120, y: 150 },
      { x: 470, y: 140 },
      { x: 1150, y: 250 },
      { x: 250, y: 660 },
      { x: 700, y: 710 },
      { x: 1180, y: 710 },
    ],
    wardens: [
      { waypoints: [[250, 150], [250, 420], [460, 420], [460, 150]], speed: 55 },
      { waypoints: [[780, 150], [1010, 150], [1010, 360], [780, 360]], speed: 55 },
      { waypoints: [[600, 600], [920, 600], [920, 730], [600, 730]], speed: 50 },
    ],
    cameras: [
      { x: 640, y: 88, base: Math.PI / 2, sweep: 0.9, speed: 0.45, range: 280 },
      { x: 1244, y: 420, base: Math.PI, sweep: 0.8, speed: 0.55, range: 280 },
      { x: 250, y: 88, base: Math.PI / 2, sweep: 1.0, speed: 0.4, range: 260 },
    ],
    hint: 'Wardens see only inside the yellow cone. Slip behind a case, then run for the Golden Egg.',
  },
  {
    name: 'Stained Glass Wing',
    number: 2,
    subtitle: 'Coloured light, tighter patrols, four brass eyes',
    parSeconds: 180,
    start: { x: 80, y: 720 },
    skylight: { x: 640, y: 132 },
    relic: { x: 1180, y: 650, name: 'Stained Glass Heart', color: '#ff5d8f', glow: '#ffb3cd' },
    walls: borderWalls().concat([
      { x: 200, y: 250, w: 260, h: 18 },
      { x: 700, y: 200, w: 20, h: 200 },
      { x: 900, y: 480, w: 240, h: 18 },
      { x: 420, y: 520, w: 20, h: 180 },
      { x: 1050, y: 180, w: 18, h: 160 },
    ]),
    cases: [
      { x: 150, y: 420, w: 100, h: 66 },
      { x: 560, y: 300, w: 110, h: 70 },
      { x: 980, y: 300, w: 104, h: 64 },
      { x: 520, y: 640, w: 110, h: 70 },
      { x: 1080, y: 620, w: 100, h: 66 },
    ],
    cages: [
      { x: 330, y: 600, r: 36 },
      { x: 830, y: 140, r: 36 },
      { x: 1150, y: 430, r: 36 },
    ],
    vents: [
      { x: 56, y: 120, w: 130, h: 44 },
      { x: 1094, y: 700, w: 130, h: 44 },
    ],
    shadows: [
      { x: 300, y: 340, w: 180, h: 110 },
      { x: 900, y: 560, w: 190, h: 110 },
    ],
    chandeliers: [
      { x: 640, y: 240, r: 70 },
      { x: 300, y: 660, r: 60 },
      { x: 1100, y: 520, r: 60 },
    ],
    trinkets: [
      { x: 120, y: 140 },
      { x: 620, y: 130 },
      { x: 1180, y: 140 },
      { x: 180, y: 700 },
      { x: 880, y: 720 },
      { x: 1180, y: 520 },
      { x: 420, y: 330 },
    ],
    wardens: [
      { waypoints: [[220, 140], [520, 140], [520, 380], [220, 380]], speed: 60 },
      { waypoints: [[820, 140], [1120, 140], [1120, 380], [820, 380]], speed: 60 },
      { waypoints: [[300, 560], [640, 560], [640, 730], [980, 730], [980, 560]], speed: 55 },
    ],
    cameras: [
      { x: 320, y: 88, base: Math.PI / 2, sweep: 1.0, speed: 0.5, range: 290 },
      { x: 960, y: 88, base: Math.PI / 2, sweep: 0.9, speed: 0.55, range: 290 },
      { x: 1244, y: 300, base: Math.PI, sweep: 0.8, speed: 0.5, range: 280 },
      { x: 36, y: 600, base: 0, sweep: 0.8, speed: 0.45, range: 280 },
    ],
    hint: 'Four cameras now. Watch the red sweep, cross behind it, and mind the Glass Heart case.',
  },
  {
    name: 'The Sapphire Vault',
    number: 3,
    subtitle: 'Five cameras, crossing cones, one Star Sapphire',
    parSeconds: 210,
    start: { x: 80, y: 720 },
    skylight: { x: 640, y: 132 },
    relic: { x: 640, y: 330, name: 'Star Sapphire', color: '#4db8ff', glow: '#bfe6ff' },
    walls: borderWalls().concat([
      { x: 180, y: 220, w: 240, h: 18 },
      { x: 560, y: 150, w: 18, h: 220 },
      { x: 820, y: 380, w: 240, h: 18 },
      { x: 420, y: 480, w: 18, h: 200 },
      { x: 980, y: 180, w: 18, h: 200 },
      { x: 640, y: 560, w: 220, h: 18 },
    ]),
    cases: [
      { x: 140, y: 380, w: 104, h: 66 },
      { x: 700, y: 220, w: 110, h: 70 },
      { x: 1080, y: 420, w: 104, h: 66 },
      { x: 300, y: 620, w: 110, h: 70 },
      { x: 900, y: 640, w: 110, h: 70 },
    ],
    cages: [
      { x: 500, y: 300, r: 36 },
      { x: 880, y: 220, r: 36 },
      { x: 640, y: 700, r: 36 },
      { x: 1150, y: 600, r: 36 },
    ],
    vents: [
      { x: 56, y: 120, w: 130, h: 44 },
      { x: 1094, y: 120, w: 130, h: 44 },
      { x: 600, y: 700, w: 130, h: 44 },
    ],
    shadows: [
      { x: 240, y: 300, w: 170, h: 110 },
      { x: 860, y: 480, w: 180, h: 110 },
      { x: 480, y: 640, w: 170, h: 90 },
    ],
    chandeliers: [
      { x: 640, y: 470, r: 70 },
      { x: 300, y: 300, r: 60 },
      { x: 1050, y: 540, r: 60 },
    ],
    trinkets: [
      { x: 120, y: 140 },
      { x: 420, y: 130 },
      { x: 1180, y: 140 },
      { x: 180, y: 700 },
      { x: 760, y: 720 },
      { x: 1180, y: 700 },
      { x: 640, y: 420 },
      { x: 1000, y: 300 },
    ],
    wardens: [
      { waypoints: [[200, 140], [480, 140], [480, 340], [200, 340]], speed: 65 },
      { waypoints: [[800, 140], [1120, 140], [1120, 340], [800, 340]], speed: 65 },
      { waypoints: [[300, 560], [640, 560], [980, 560], [980, 720], [640, 720], [300, 720]], speed: 60 },
    ],
    cameras: [
      { x: 320, y: 88, base: Math.PI / 2, sweep: 1.0, speed: 0.55, range: 300 },
      { x: 640, y: 88, base: Math.PI / 2, sweep: 1.1, speed: 0.6, range: 300 },
      { x: 960, y: 88, base: Math.PI / 2, sweep: 1.0, speed: 0.55, range: 300 },
      { x: 1244, y: 320, base: Math.PI, sweep: 0.8, speed: 0.5, range: 290 },
      { x: 36, y: 560, base: 0, sweep: 0.8, speed: 0.5, range: 290 },
    ],
    hint: 'The Star Sapphire sits in the middle of crossing cones. Spend shine on a jammer — then glide.',
  },
];

/** Every rect that blocks movement and sight in a gallery: walls, cases, cages. */
export function galleryBlockers(gallery) {
  const blockers = gallery.walls.concat(gallery.cases);
  for (let index = 0; index < gallery.cages.length; index += 1) {
    const cage = gallery.cages[index];
    blockers.push({ x: cage.x - cage.r, y: cage.y - cage.r, w: cage.r * 2, h: cage.r * 2 });
  }
  return blockers;
}

/** Chandelier counts, for the title the game quotes. */
export function chandelierTotal() {
  return GALLERIES.reduce((sum, gallery) => sum + gallery.chandeliers.length, 0);
}

/** Count helpers the title and the HUD quote. */
export function galleryTotals() {
  let wardens = 0;
  let cameras = 0;
  let trinkets = 0;
  for (let index = 0; index < GALLERIES.length; index += 1) {
    wardens += GALLERIES[index].wardens.length;
    cameras += GALLERIES[index].cameras.length;
    trinkets += GALLERIES[index].trinkets.length;
  }
  return { galleries: GALLERIES.length, wardens, cameras, trinkets };
}
