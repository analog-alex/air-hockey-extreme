import { GAMEPLAY } from '../constants/gameplay';

export type CpuState = 'guard' | 'intercept' | 'counter' | 'recover';

export type CpuStateInput = {
  recoveryTimer: number;
  puckX: number;
  puckY: number;
  puckSpeed: number;
  paddleX: number;
  paddleY: number;
};

export function pickCpuState(input: CpuStateInput): CpuState {
  if (input.recoveryTimer > 0) {
    return 'recover';
  }

  const puckInCpuHalf = input.puckX > GAMEPLAY.cpuHalfMinX;
  const distanceToPuck = Math.hypot(input.puckX - input.paddleX, input.puckY - input.paddleY);

  if (
    puckInCpuHalf &&
    input.puckSpeed <= GAMEPLAY.cpuAttackPuckSpeed &&
    distanceToPuck <= GAMEPLAY.cpuAttackRadius
  ) {
    return 'counter';
  }

  if (puckInCpuHalf) {
    return 'intercept';
  }

  return 'guard';
}
