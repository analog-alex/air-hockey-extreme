import { GAMEPLAY, RINK } from '../constants/gameplay';

export type PuckMotion = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Reflect predicted Y within rink top/bottom bounds (air-hockey wall bounces). */
function reflectYInRink(rawY: number): number {
  const minY = RINK.y + GAMEPLAY.puckRadius;
  const maxY = RINK.y + RINK.height - GAMEPLAY.puckRadius;
  const travelHeight = maxY - minY;
  const wrapped = (((rawY - minY) % (travelHeight * 2)) + travelHeight * 2) % (travelHeight * 2);
  const reflected = wrapped > travelHeight ? travelHeight * 2 - wrapped : wrapped;

  return minY + reflected;
}

export function predictPuckYAtX(motion: PuckMotion, targetX: number): number {
  if (Math.abs(motion.vx) < 1) {
    return clamp(
      motion.y,
      RINK.y + GAMEPLAY.puckRadius,
      RINK.y + RINK.height - GAMEPLAY.puckRadius,
    );
  }

  const timeToTarget = (targetX - motion.x) / motion.vx;
  if (timeToTarget <= 0) {
    return motion.y;
  }

  const rawY = motion.y + motion.vy * timeToTarget;
  return reflectYInRink(rawY);
}
