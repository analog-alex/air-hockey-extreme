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

export const RINK = {
  x: 108,
  y: 78,
  width: 1064,
  height: 566,
  goalLineInset: 8,
};

export const GAMEPLAY = {
  matchPointLimit: 7,
  matterVelocityScale: 1 / 60,
  playerSpeed: 520,
  cpuSpeed: 390,
  puckInitialSpeed: 620,
  puckMaxSpeed: 980,
  puckFrictionAir: 0.0045,
  puckJitterSpeed: 26,
  puckFlickCooldownSeconds: 10,
  puckFlickRange: 78,
  puckFlickSpeed: 1300,
  puckFlickMaxSpeedSeconds: 0.45,
  tiltEligibleMaxSpeed: 180,
  tiltMinSpeed: 480,
  tiltMaxSpeed: 680,
  tiltAngleSpreadDegrees: 35,
  tiltCooldownSeconds: 1,
  puckMomentumBoost: 640,
  puckSpeedIncreasePerHit: 32,
  paddleMomentumInfluence: 0.72,
  paddleRadius: 36,
  puckRadius: 18,
  playerHalfMaxX: GAME_WIDTH / 2,
  cpuHalfMinX: GAME_WIDTH / 2,
  cpuReaction: 0.22,
  cpuGuardOffset: 96,
  cpuInterceptOffset: 150,
  cpuAttackRadius: 118,
  cpuAttackPuckSpeed: 170,
  cpuAttackSpeed: 390,
  cpuGuardSpeed: 245,
  cpuInterceptSpeed: 315,
  cpuAimError: 78,
  cpuRecoverySeconds: 0.52,
};
