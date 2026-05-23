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
  puckFrictionAir: 0.006,
  puckJitterSpeed: 26,
  puckMomentumBoost: 120,
  puckSpeedIncreasePerHit: 22,
  paddleMomentumInfluence: 0.72,
  paddleRadius: 36,
  puckRadius: 18,
  playerHalfMaxX: GAME_WIDTH / 2,
  cpuHalfMinX: GAME_WIDTH / 2,
  cpuReaction: 0.12,
  cpuGuardOffset: 120,
  cpuInterceptOffset: 184,
  cpuAttackRadius: 148,
  cpuAttackPuckSpeed: 210,
  cpuAttackSpeed: 455,
  cpuGuardSpeed: 285,
  cpuInterceptSpeed: 375,
  cpuAimError: 42,
  cpuRecoverySeconds: 0.34,
};
