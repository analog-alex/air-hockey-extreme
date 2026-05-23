import Phaser from 'phaser';
import { GAMEPLAY, TABLE } from '../constants/gameplay';
import { Paddle } from '../objects/Paddle';
import { Puck } from '../objects/Puck';

export class CpuController {
  private targetX = TABLE.x + TABLE.width - 145;
  private targetY = TABLE.y + TABLE.height / 2;

  constructor(
    private readonly paddle: Paddle,
    private readonly puck: Puck,
  ) {}

  update(deltaSeconds: number): void {
    const puckInCpuHalf = this.puck.x > GAMEPLAY.cpuHalfMinX;
    const desiredX = puckInCpuHalf ? this.puck.x + 92 : TABLE.x + TABLE.width - 145;
    const desiredY = puckInCpuHalf ? this.puck.y : TABLE.y + TABLE.height / 2;
    const lerpAmount = 1 - Math.pow(GAMEPLAY.cpuReaction, deltaSeconds * 8);

    this.targetX = Phaser.Math.Linear(this.targetX, desiredX, lerpAmount);
    this.targetY = Phaser.Math.Linear(this.targetY, desiredY, lerpAmount);

    const dx = this.targetX - this.paddle.x;
    const dy = this.targetY - this.paddle.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 4) {
      this.paddle.stop();
      return;
    }

    const speed = puckInCpuHalf ? GAMEPLAY.cpuSpeed : GAMEPLAY.cpuSpeed * 0.65;
    this.paddle.move((dx / distance) * speed, (dy / distance) * speed);
  }
}
