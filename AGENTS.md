# Repository Guidelines

## Project Overview

GLIDE.EXE is a browser-based arcade air hockey prototype built with Bun, Phaser, TypeScript, and Vite. It targets a static build suitable for GitHub Pages.

## Commands

- Install dependencies: `bun install`
- Run locally: `bun run dev`
- Typecheck: `bun run typecheck`
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
- Keep player controls keyboard-first: WASD/arrows, `Esc` pause (restart available from the pause menu button).
- Player paddle stays in the left half (defending left goal); CPU paddle stays in the right half (defending right goal). Goals are located on the left and right sides of the rink.
- Keep the MVP focused: no online multiplayer, accounts, leaderboards, mobile controls, or tournament modes yet.
- Prefer small, readable changes over broad rewrites.

## Verification

Before handing off gameplay changes, run:

```sh
bun run typecheck
bun run build
```

For visual/gameplay changes, also run `bun run dev` and manually verify menu flow, controls, scoring, pause/restart, and game-over behavior in the browser.
