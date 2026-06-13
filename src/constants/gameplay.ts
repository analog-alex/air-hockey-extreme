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
  playerBoostSpeedMultiplier: 1.6,
  playerBoostDrainSeconds: 2,
  playerBoostRechargeSeconds: 5,
  touchDeadZone: 10,
  touchBoostVelocityThreshold: 760,
  touchVelocitySmoothing: 0.35,
  touchVelocitySampleMaxAgeMs: 140,
  touchMinSampleSeconds: 1 / 120,
  touchMaxSampleSeconds: 0.12,
  cpuSpeed: 390,
  puckInitialSpeed: 1000,
  puckMaxSpeed: 1680,
  puckFrictionAir: 0.0045,
  puckJitterSpeed: 26,
  boostedPuckSpeed: 2350,
  boostedPuckMaxSpeedSeconds: 0.45,
  tiltEligibleMaxSpeed: 180,
  tiltMinSpeed: 480,
  tiltMaxSpeed: 680,
  tiltAngleSpreadDegrees: 35,
  tiltCooldownSeconds: 1,
  puckMomentumBoost: 1040,
  puckSpeedIncreasePerHit: 72,
  paddleMomentumInfluence: 0.95,
  paddleHomeInset: 96,
  paddleRadius: 36,
  puckRadius: 18,
  playerHalfMaxX: GAME_WIDTH / 2,
  cpuHalfMinX: GAME_WIDTH / 2,
  cpuReaction: 0.4,
  cpuGuardOffset: 118,
  cpuInterceptOffset: 178,
  cpuAttackRadius: 82,
  cpuAttackPuckSpeed: 115,
  cpuAttackSpeed: 295,
  cpuGuardSpeed: 195,
  cpuInterceptSpeed: 245,
  cpuAimError: 118,
  cpuRecoverySeconds: 0.78,
  cpuGuardTracking: 0.14,
};

/**
 * Velocity conversion helpers for Matter Physics.
 * Gameplay constants (speeds etc.) are expressed in pixels/second.
 * Matter bodies expect velocities scaled to the internal timestep (~1/60).
 * All velocity I/O for paddles/puck should go through these (or the
 * objects' move / setScaledVelocity / getGameplay* APIs).
 */
export const MATTER_VELOCITY_SCALE = GAMEPLAY.matterVelocityScale;

export function toMatterVelocity(v: number): number {
  return v * MATTER_VELOCITY_SCALE;
}

export function fromMatterVelocity(v: number): number {
  return v / MATTER_VELOCITY_SCALE;
}
