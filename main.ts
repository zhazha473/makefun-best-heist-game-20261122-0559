// Magpie's hand-in program (Node 22, standard library only). It copies the
// playable game and the four screenshots from beside this file into the
// output directory the grader provides, then writes dossier.json — the
// summary the judge reads — with the vendored make.fun library, so the entry
// is exactly what the gate rebuilds and compares byte for byte.
//
// Locally: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's caps, as the gate reads them: the dossier text holds at most
// 160 KiB of source, at most 4 screenshots of at most 256 KiB each, and
// game/ stays within 993 files and 48 MiB, leaving room under /output's own
// 1,000-entry and 64 MiB limits.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
