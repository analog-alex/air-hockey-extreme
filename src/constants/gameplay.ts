export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const TABLE = {
  x: 90,
  y: 30,
  width: 1100,
  height: 660,
  goalWidth: 224,
  goalDepth: 34,
};

export const GAMEPLAY = {
  matchPointLimit: 7,
  matterVelocityScale: 1 / 60,
  playerSpeed: 520,
  cpuSpeed: 390,
  puckInitialSpeed: 430,
  puckMaxSpeed: 820,
  puckSpeedIncreasePerHit: 18,
  paddleRadius: 42,
  puckRadius: 18,
  playerHalfMaxX: GAME_WIDTH / 2,
  cpuHalfMinX: GAME_WIDTH / 2,
  cpuReaction: 0.12,
};
