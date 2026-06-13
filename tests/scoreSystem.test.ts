import { describe, expect, test } from 'bun:test';
import { GAMEPLAY } from '../src/constants/gameplay';
import { ScoreSystem } from '../src/systems/ScoreSystem';

describe('ScoreSystem', () => {
  test('starts at zero for both sides', () => {
    const score = new ScoreSystem();
    expect(score.player).toBe(0);
    expect(score.cpu).toBe(0);
  });

  test('addPoint increments the scoring side', () => {
    const score = new ScoreSystem();
    expect(score.addPoint('player')).toBe(false);
    expect(score.player).toBe(1);
    expect(score.cpu).toBe(0);
  });

  test('returns true when a side reaches the match limit', () => {
    const score = new ScoreSystem();
    const limit = GAMEPLAY.matchPointLimit;

    for (let point = 1; point < limit; point += 1) {
      expect(score.addPoint('cpu')).toBe(false);
    }

    expect(score.addPoint('cpu')).toBe(true);
    expect(score.cpu).toBe(limit);
  });

  test('reset clears both scores', () => {
    const score = new ScoreSystem();
    score.addPoint('player');
    score.addPoint('cpu');
    score.reset();

    expect(score.player).toBe(0);
    expect(score.cpu).toBe(0);
  });
});
