import { describe, expect, test } from 'bun:test';
import {
  fromMatterVelocity,
  MATTER_VELOCITY_SCALE,
  toMatterVelocity,
} from '../src/constants/gameplay';

describe('Matter velocity helpers', () => {
  test('toMatterVelocity scales gameplay speed to Matter timestep', () => {
    expect(toMatterVelocity(60)).toBe(1);
    expect(toMatterVelocity(0)).toBe(0);
  });

  test('fromMatterVelocity inverts Matter scale back to gameplay speed', () => {
    expect(fromMatterVelocity(1)).toBe(60);
    expect(fromMatterVelocity(0)).toBe(0);
  });

  test('round-trips gameplay velocities', () => {
    const gameplaySpeed = 1040;
    expect(fromMatterVelocity(toMatterVelocity(gameplaySpeed))).toBeCloseTo(gameplaySpeed);
  });

  test('uses the shared scale constant', () => {
    expect(toMatterVelocity(120)).toBe(120 * MATTER_VELOCITY_SCALE);
  });
});
