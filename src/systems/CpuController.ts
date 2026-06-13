import Phaser from 'phaser';
import { GAMEPLAY, RINK } from '../constants/gameplay';
import type { Paddle } from '../objects/Paddle';
import type { Puck } from '../objects/Puck';

type CpuState = 'guard' | 'intercept' | 'counter' | 'recover';

export class CpuController {
  private targetX = RINK.x + RINK.width - 145;
  private targetY = RINK.y + RINK.height / 2;
  private state: CpuState = 'guard';
  private recoveryTimer = 0;
  private aimError = 0;

  constructor(
    private readonly paddle: Paddle,
    private readonly puck: Puck,
  ) {}

  update(deltaSeconds: number): void {
    this.recoveryTimer = Math.max(0, this.recoveryTimer - deltaSeconds);
    this.state = this.pickState();

    const target = this.getTargetForState();
    const lerpAmount = 1 - GAMEPLAY.cpuReaction ** (deltaSeconds * 8);

    this.targetX = Phaser.Math.Linear(this.targetX, target.x, lerpAmount);
    this.targetY = Phaser.Math.Linear(this.targetY, target.y, lerpAmount);
    this.moveTowardTarget(target.speed);
  }

  onPuckHit(): void {
    this.recoveryTimer = GAMEPLAY.cpuRecoverySeconds;
    this.aimError = Phaser.Math.Between(-GAMEPLAY.cpuAimError, GAMEPLAY.cpuAimError);
  }

  resetAfterGoal(): void {
    this.targetX = RINK.x + RINK.width - GAMEPLAY.paddleHomeInset;
    this.targetY = RINK.y + RINK.height / 2;
    this.state = 'guard';
    this.recoveryTimer = 0;
    this.aimError = 0;
  }

  private pickState(): CpuState {
    if (this.recoveryTimer > 0) {
      return 'recover';
    }

    const puckInCpuHalf = this.puck.x > GAMEPLAY.cpuHalfMinX;
    const distanceToPuck = Phaser.Math.Distance.Between(
      this.paddle.x,
      this.paddle.y,
      this.puck.x,
      this.puck.y,
    );

    if (
      puckInCpuHalf &&
      this.puck.isSlowEnoughForCpuAttack() &&
      distanceToPuck <= GAMEPLAY.cpuAttackRadius
    ) {
      return 'counter';
    }

    if (puckInCpuHalf) {
      return 'intercept';
    }

    return 'guard';
  }

  private getTargetForState(): { x: number; y: number; speed: number } {
    switch (this.state) {
      case 'counter':
        return {
          x: Math.min(
            this.puck.x + GAMEPLAY.paddleRadius * 0.75,
            RINK.x + RINK.width - GAMEPLAY.paddleRadius,
          ),
          y: this.puck.y + this.aimError * 0.42,
          speed: GAMEPLAY.cpuAttackSpeed,
        };
      case 'intercept': {
        const x = RINK.x + RINK.width - GAMEPLAY.cpuInterceptOffset;
        return {
          x,
          y: this.puck.predictYAtX(x) + this.aimError,
          speed: GAMEPLAY.cpuInterceptSpeed,
        };
      }
      case 'recover':
        return {
          x: RINK.x + RINK.width - GAMEPLAY.cpuGuardOffset,
          y: RINK.y + RINK.height / 2 + this.aimError * 0.5,
          speed: GAMEPLAY.cpuGuardSpeed,
        };
      default:
        return {
          x: RINK.x + RINK.width - GAMEPLAY.cpuGuardOffset,
          y:
            Phaser.Math.Linear(RINK.y + RINK.height / 2, this.puck.y, GAMEPLAY.cpuGuardTracking) +
            this.aimError * 0.5,
          speed: GAMEPLAY.cpuGuardSpeed,
        };
    }
  }

  private moveTowardTarget(speed: number): void {
    const dx = this.targetX - this.paddle.x;
    const dy = this.targetY - this.paddle.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 4) {
      this.paddle.stop();
      return;
    }

    this.paddle.move((dx / distance) * speed, (dy / distance) * speed);
  }
}
