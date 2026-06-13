# Repository Guidelines

## Project Overview

GLIDE.EXE is a browser-based arcade air hockey prototype built with Bun, Phaser, TypeScript, and Vite. It targets a static build suitable for GitHub Pages.

## Commands

- Install dependencies: `bun install`
- Run locally: `bun run dev`
- Typecheck: `bun run typecheck`
- Lint (Biome): `bun run lint`
- Lint and apply safe fixes: `bun run lint:fix`
- Format: `bun run format`
- Production build: `bun run build`
- Preview build: `bun run preview`

If Bun cannot write to the system temp directory in a sandbox, use project-local temp/cache folders:

```sh
mkdir -p .bun-tmp .bun-cache
TMPDIR="$PWD/.bun-tmp" BUN_INSTALL_CACHE_DIR="$PWD/.bun-cache" bun install
```

## Structure

- `src/main.ts`: Phaser app entrypoint.
- `src/config/gameConfig.ts`: Phaser game configuration.
- `src/scenes/`: Boot, preload, menu, gameplay, and game-over scenes.
- `src/objects/`: Gameplay objects such as paddles, puck, and table.
- `src/systems/`: Input, CPU, and score systems.
- `src/constants/`: Gameplay and visual constants.
- `src/styles/`: App-level CSS.
- `assets/`: Source image assets used by the game.

## Implementation Notes

- Use Phaser Matter Physics for game movement, collisions, and rink walls.
- Keep the game modular: scene orchestration in scenes, reusable behavior in objects/systems.
- Preserve the 1280x720 canvas target with fit-and-center scaling.
- Support keyboard and touch-first controls. Keyboard uses WASD/arrows to move, `Space` to boost, `Esc` to pause, and `T` to tilt the rink.
- On touch-first coarse-pointer devices, use one-finger direct paddle tracking in the player's half. Quick drag velocity requests boost; touch buttons provide pause and tilt while keyboard input remains available as a fallback.
- Boost is a player-only stamina mechanic: it increases paddle movement speed while requested and moving, drains only while moving, recharges when boost is no longer requested, and refills after goals.
- Player puck contacts made during boost retain the natural bounce angle and apply the boosted puck momentum; normal player and CPU contacts keep their standard physics.
- Keep touch targets outside the active rink where possible, ignore additional fingers while a gesture is active, and clear touch movement on release, cancellation, pause, goal reset, focus loss, and scene shutdown.
- Player paddle stays in the left half (defending left goal); CPU paddle stays in the right half (defending right goal). Goals are located on the left and right sides of the rink.
- Keep the MVP focused: no online multiplayer, accounts, leaderboards, or tournament modes yet.
- Prefer small, readable changes over broad rewrites.

## Verification

Before handing off gameplay changes, run:

```sh
bun run typecheck
bun run lint
bun run build
```

For visual/gameplay changes, also run `bun run dev` and manually verify menu flow, keyboard controls, touch tracking and flick boost on a touch-first device, stamina drain/recharge and boosted puck hits, touch pause/resume/restart/tilt, scoring, and game-over behavior in the browser.
