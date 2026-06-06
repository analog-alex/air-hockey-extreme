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
  puckInitialSpeed: 1000,
  puckMaxSpeed: 1680,
  puckFrictionAir: 0.0045,
  puckJitterSpeed: 26,
  puckFlickCooldownSeconds: 10,
  puckFlickRange: 78,
  puckFlickSpeed: 2350,
  puckFlickMaxSpeedSeconds: 0.45,
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
