import { RINK, TABLE } from '../constants/gameplay';
import type { ScoringSide } from '../systems/ScoreSystem';

export function detectGoal(puckX: number, puckY: number): ScoringSide | null {
  const leftGoal = RINK.x + RINK.goalLineInset;
  const rightGoal = RINK.x + RINK.width - RINK.goalLineInset;
  const goalTop = RINK.y + RINK.height / 2 - TABLE.goalWidth / 2;
  const goalBottom = RINK.y + RINK.height / 2 + TABLE.goalWidth / 2;
  const isInGoalMouth = puckY >= goalTop && puckY <= goalBottom;

  if (puckX <= leftGoal && isInGoalMouth) {
    return 'cpu';
  }

  if (puckX >= rightGoal && isInGoalMouth) {
    return 'player';
  }

  return null;
}
