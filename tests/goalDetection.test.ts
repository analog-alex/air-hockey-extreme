import { describe, expect, test } from 'bun:test';
import { RINK, TABLE } from '../src/constants/gameplay';
import { detectGoal } from '../src/logic/goalDetection';

const goalCenterY = RINK.y + RINK.height / 2;
const leftGoalX = RINK.x + RINK.goalLineInset;
const rightGoalX = RINK.x + RINK.width - RINK.goalLineInset;

describe('detectGoal', () => {
  test('returns null when puck is outside both goals', () => {
    expect(detectGoal(640, goalCenterY)).toBeNull();
  });

  test('scores for cpu when puck crosses the left goal mouth', () => {
    expect(detectGoal(leftGoalX - 1, goalCenterY)).toBe('cpu');
  });

  test('scores for player when puck crosses the right goal mouth', () => {
    expect(detectGoal(rightGoalX + 1, goalCenterY)).toBe('player');
  });

  test('returns null when puck is past the goal line but outside the mouth', () => {
    const aboveMouth = goalCenterY - TABLE.goalWidth / 2 - 5;
    expect(detectGoal(leftGoalX - 1, aboveMouth)).toBeNull();
  });
});
