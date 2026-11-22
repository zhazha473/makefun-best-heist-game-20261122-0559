# MAGPIE — steal the Star Sapphire from the Gilded Aviary

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/zhazha473/makefun-best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/zhazha473/makefun-best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

A 2D top-down heist game, built for [best-heist-game-20261122-0559 on make.fun](https://make.fun/bounty/best-heist-game-20261122-0559). You are a magpie — a bird that cannot resist shiny
things — loose in the Gilded Aviary, a gold-and-stained-glass museum, at
night. Three galleries, three relics (Golden Egg, Stained Glass Heart, Star
Sapphire), nine wardens with yellow vision cones, twelve brass cameras with
red sweeping beams, one global alarm meter, five tools bought with shine,
and one skylight to vanish through.

## Play

Serve `game/` with any static server, or run `node serve.ts` and open
http://localhost:8080. Desktop Chrome, keyboard + mouse, no network.

- **WASD / arrows** — move · **Shift** — sneak (slow, half as easy to spot) · **Space** — run (fast, loud)
- **Click** — walk to a point · **1–5** — tools (Shiny Decoy, Smoke Feather, Lockpick, Silent Glide, Camera Jammer)
- **H** — hint (once per gallery) · **R** — restart gallery · **M** — mute · **P / Esc** — pause

Chandelier light pools make you half again as easy to spot; shadows hide
you. Vents are slow but safe; display cases and brass cages block sight.

Touch a trinket to pocket it (+1 shine). Stand by a relic for 3 seconds to
prise it loose — instantly, if you own the Lockpick. Then reach the glowing
skylight to escape the gallery. If a warden catches you, you are sent back
to the gallery door (your pocketed loot stays). At 100% alarm the museum
locks down: wardens rush you, then the meter falls back to 60%.

Ghost rating: finish a gallery with the alarm peaking under 25%.

## Screenshots

Deterministic staging: `?shot=start|play|mid|vault|win&seed=1`. The four
shots in `shots.json` are the entry's screenshots.

## Files

- `game/src/main.js` — bootstrap + state machine
- `game/src/galleries.js` — the three galleries
- `game/src/wardens.js` — patrols, vision cones, CALM/SUSPICIOUS/ALERT/SEARCH
- `game/src/cameras.js` — sweeping brass cameras
- `game/src/alarm.js` — the global alarm meter and lockdown
- `game/src/detection.js` — line of sight and cone maths
- `game/src/player.js` — the magpie
- `game/src/tools.js` — the five tools
- `game/src/render.js` — all procedural Canvas 2D art
- `game/src/audio.js` — synthesised WebAudio sounds
- `game/src/input.js` — keyboard + mouse
- `game/src/hud.js` — the DOM HUD
- `game/src/shots.js` — deterministic screenshot staging
- `main.ts` — the make.fun hand-in program
