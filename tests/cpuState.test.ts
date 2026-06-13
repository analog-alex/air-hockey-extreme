import { describe, expect, test } from 'bun:test';
import { GAMEPLAY } from '../src/constants/gameplay';
import { type CpuStateInput, pickCpuState } from '../src/logic/cpuState';

const baseInput: CpuStateInput = {
  recoveryTimer: 0,
  puckX: GAMEPLAY.cpuHalfMinX + 100,
  puckY: 400,
  puckSpeed: 80,
  paddleX: 1000,
  paddleY: 400,
};

describe('pickCpuState', () => {
  test('returns recover while recovery timer is active', () => {
    expect(pickCpuState({ ...baseInput, recoveryTimer: 0.5 })).toBe('recover');
  });

  test('returns guard when puck is in the player half', () => {
    expect(pickCpuState({ ...baseInput, puckX: GAMEPLAY.cpuHalfMinX - 50 })).toBe('guard');
  });

  test('returns intercept when puck is in cpu half but not attackable', () => {
    expect(
      pickCpuState({
        ...baseInput,
        puckSpeed: GAMEPLAY.cpuAttackPuckSpeed + 50,
        puckX: baseInput.paddleX + 10,
      }),
    ).toBe('intercept');
  });

  test('returns counter for a slow puck within attack radius', () => {
    expect(
      pickCpuState({
        ...baseInput,
        puckSpeed: GAMEPLAY.cpuAttackPuckSpeed,
        puckX: baseInput.paddleX + GAMEPLAY.cpuAttackRadius - 5,
        puckY: baseInput.paddleY,
      }),
    ).toBe('counter');
  });
});
