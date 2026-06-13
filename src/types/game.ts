import type { ScoringSide } from '../systems/ScoreSystem';

export type GameOverData = {
  winner: ScoringSide;
  playerScore: number;
  cpuScore: number;
};