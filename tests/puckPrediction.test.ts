import { describe, expect, test } from 'bun:test';
import { GAMEPLAY, RINK } from '../src/constants/gameplay';
import { predictPuckYAtX } from '../src/logic/puckPrediction';

const centerY = RINK.y + RINK.height / 2;

describe('predictPuckYAtX', () => {
  test('returns current y when puck is not moving horizontally', () => {
    const y = predictPuckYAtX({ x: 500, y: centerY, vx: 0, vy: 200 }, 900);
    expect(y).toBe(centerY);
  });

  test('returns current y when target x is behind travel direction', () => {
    const y = predictPuckYAtX({ x: 700, y: centerY, vx: 400, vy: 0 }, 600);
    expect(y).toBe(centerY);
  });

  test('predicts linear travel without wall reflection', () => {
    const y = predictPuckYAtX({ x: 600, y: 300, vx: 200, vy: 100 }, 800);
    expect(y).toBe(400);
  });

  test('reflects off the top wall', () => {
    const minY = RINK.y + GAMEPLAY.puckRadius;
    const y = predictPuckYAtX({ x: 600, y: minY + 20, vx: 200, vy: -400 }, 700);
    expect(y).toBeGreaterThan(minY);
  });
});
