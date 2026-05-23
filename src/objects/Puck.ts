import Phaser from 'phaser';
import { GAMEPLAY, TABLE } from '../constants/gameplay';

export class Puck extends Phaser.Physics.Matter.Image {
  constructor(scene: Phaser.Scene) {
    super(scene.matter.world, TABLE.x + TABLE.width / 2, TABLE.y + TABLE.height / 2, 'puck');

    scene.add.existing(this);

    this.setDepth(15);
    this.setDisplaySize(GAMEPLAY.puckRadius * 2, GAMEPLAY.puckRadius * 2);
    this.setCircle(GAMEPLAY.puckRadius, {
      friction: 0,
      frictionAir: GAMEPLAY.puckFrictionAir,
      frictionStatic: 0,
      ignoreGravity: true,
      restitution: 1,
    });
    this.setFixedRotation();
    this.setIgnoreGravity(true);
    this.setMass(1);
    this.setBounce(1);
  }

  serve(direction: 1 | -1 = Phaser.Math.RND.pick([1, -1])): void {
    this.setPosition(TABLE.x + TABLE.width / 2, TABLE.y + TABLE.height / 2);
    const angle = Phaser.Math.DegToRad(Phaser.Math.Between(-34, 34));
    const vx = Math.cos(angle) * GAMEPLAY.puckInitialSpeed * direction;
    const vy = Math.sin(angle) * GAMEPLAY.puckInitialSpeed;
    this.setScaledVelocity(vx, vy);
  }

  bounceFromPaddle(paddle: Phaser.Physics.Matter.Image, toward: 1 | -1): void {
    const velocity = this.getVelocity();
    const paddleVelocity = paddle.getVelocity();
    const currentSpeed = this.toGameplaySpeed(Math.hypot(velocity.x, velocity.y));
    const paddleSpeed = this.toGameplaySpeed(Math.hypot(paddleVelocity.x, paddleVelocity.y));
    const offset = Phaser.Math.Clamp(
      (this.y - paddle.y) / GAMEPLAY.paddleRadius,
      -1,
      1,
    );
    const nextSpeed = Math.min(
      Math.max(currentSpeed, GAMEPLAY.puckMomentumBoost) +
        GAMEPLAY.puckSpeedIncreasePerHit +
        paddleSpeed * GAMEPLAY.paddleMomentumInfluence,
      GAMEPLAY.puckMaxSpeed,
    );

    const angle = Phaser.Math.Linear(-64, 64, (offset + 1) / 2);
    const vx = Math.cos(Phaser.Math.DegToRad(angle)) * nextSpeed * toward;
    const vy =
      Math.sin(Phaser.Math.DegToRad(angle)) * nextSpeed +
      paddleVelocity.y * GAMEPLAY.paddleMomentumInfluence / GAMEPLAY.matterVelocityScale;

    this.setScaledVelocity(vx, vy);
    this.setPosition(
      paddle.x + toward * (GAMEPLAY.paddleRadius + GAMEPLAY.puckRadius + 2),
      this.y,
    );
  }

  updateMotion(): void {
    const velocity = this.getVelocity();
    const length = Math.hypot(velocity.x, velocity.y);
    const speed = this.toGameplaySpeed(length);

    if (speed > GAMEPLAY.puckMaxSpeed) {
      const maxMatterSpeed = GAMEPLAY.puckMaxSpeed * GAMEPLAY.matterVelocityScale;
      this.setVelocity((velocity.x / length) * maxMatterSpeed, (velocity.y / length) * maxMatterSpeed);
      return;
    }

    if (speed < GAMEPLAY.puckJitterSpeed) {
      const jitterAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const jitterSpeed = Phaser.Math.FloatBetween(
        GAMEPLAY.puckJitterSpeed * 0.25,
        GAMEPLAY.puckJitterSpeed,
      );
      this.setScaledVelocity(Math.cos(jitterAngle) * jitterSpeed, Math.sin(jitterAngle) * jitterSpeed);
    }
  }

  getGameplayVelocity(): Phaser.Types.Math.Vector2Like {
    const velocity = this.getVelocity();
    return {
      x: velocity.x / GAMEPLAY.matterVelocityScale,
      y: velocity.y / GAMEPLAY.matterVelocityScale,
    };
  }

  getGameplaySpeed(): number {
    const velocity = this.getVelocity();
    return this.toGameplaySpeed(Math.hypot(velocity.x, velocity.y));
  }

  isMovingTowardCpu(): boolean {
    return this.getVelocity().x > 0;
  }

  isSlowEnoughForCpuAttack(): boolean {
    return this.getGameplaySpeed() <= GAMEPLAY.cpuAttackPuckSpeed;
  }

  predictYAtX(targetX: number): number {
    const velocity = this.getGameplayVelocity();
    if (Math.abs(velocity.x) < 1) {
      return Phaser.Math.Clamp(
        this.y,
        TABLE.y + GAMEPLAY.puckRadius,
        TABLE.y + TABLE.height - GAMEPLAY.puckRadius,
      );
    }

    const timeToTarget = (targetX - this.x) / velocity.x;
    if (timeToTarget <= 0) {
      return this.y;
    }

    const minY = TABLE.y + GAMEPLAY.puckRadius;
    const maxY = TABLE.y + TABLE.height - GAMEPLAY.puckRadius;
    const travelHeight = maxY - minY;
    const rawY = this.y + velocity.y * timeToTarget;
    const wrapped = Phaser.Math.Wrap(rawY - minY, 0, travelHeight * 2);
    const reflected = wrapped > travelHeight ? travelHeight * 2 - wrapped : wrapped;

    return minY + reflected;
  }

  handleTableWalls(): 'player' | 'cpu' | null {
    const leftGoal = TABLE.x - GAMEPLAY.puckRadius;
    const rightGoal = TABLE.x + TABLE.width + GAMEPLAY.puckRadius;
    const top = TABLE.y + GAMEPLAY.puckRadius;
    const bottom = TABLE.y + TABLE.height - GAMEPLAY.puckRadius;
    const goalTop = TABLE.y + TABLE.height / 2 - TABLE.goalWidth / 2;
    const goalBottom = TABLE.y + TABLE.height / 2 + TABLE.goalWidth / 2;
    const isInGoalMouth = this.y >= goalTop && this.y <= goalBottom;

    if (this.x <= leftGoal) {
      if (isInGoalMouth) {
        return 'cpu';
      }
    } else if (this.x >= rightGoal) {
      if (isInGoalMouth) {
        return 'player';
      }
    }

    const velocity = this.getVelocity();
    if (this.y <= top) {
      this.setY(top);
      this.setVelocity(velocity.x, Math.abs(velocity.y));
    } else if (this.y >= bottom) {
      this.setY(bottom);
      this.setVelocity(velocity.x, -Math.abs(velocity.y));
    }

    return null;
  }

  private setScaledVelocity(vx: number, vy: number): void {
    this.setVelocity(vx * GAMEPLAY.matterVelocityScale, vy * GAMEPLAY.matterVelocityScale);
  }

  private toGameplaySpeed(matterSpeed: number): number {
    return matterSpeed / GAMEPLAY.matterVelocityScale;
  }
}
