import { GAMEPLAY } from '../constants/gameplay';

export type ScoringSide = 'player' | 'cpu';

export class ScoreSystem {
  player = 0;
  cpu = 0;

  addPoint(side: ScoringSide): boolean {
    this[side] += 1;
    return this[side] >= GAMEPLAY.matchPointLimit;
  }

  reset(): void {
    this.player = 0;
    this.cpu = 0;
  }
}
