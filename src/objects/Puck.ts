import Phaser from 'phaser';
import { GAMEPLAY, TABLE } from '../constants/gameplay';

export class Puck extends Phaser.Physics.Matter.Image {
  private speed = GAMEPLAY.puckInitialSpeed;

  constructor(scene: Phaser.Scene) {
    super(scene.matter.world, TABLE.x + TABLE.width / 2, TABLE.y + TABLE.height / 2, 'puck');

    scene.add.existing(this);

    this.setDepth(15);
    this.setDisplaySize(GAMEPLAY.puckRadius * 2, GAMEPLAY.puckRadius * 2);
    this.setCircle(GAMEPLAY.puckRadius, {
      friction: 0,
      frictionAir: 0,
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
    this.speed = GAMEPLAY.puckInitialSpeed;
    this.setPosition(TABLE.x + TABLE.width / 2, TABLE.y + TABLE.height / 2);
    const angle = Phaser.Math.DegToRad(Phaser.Math.Between(-34, 34));
    const vx = Math.cos(angle) * this.speed * direction;
    const vy = Math.sin(angle) * this.speed;
    this.setScaledVelocity(vx, vy);
  }

  bounceFromPaddle(paddle: Phaser.Physics.Matter.Image, toward: 1 | -1): void {
    const offset = Phaser.Math.Clamp(
      (this.y - paddle.y) / GAMEPLAY.paddleRadius,
      -1,
      1,
    );
    this.speed = Math.min(
      this.speed + GAMEPLAY.puckSpeedIncreasePerHit,
      GAMEPLAY.puckMaxSpeed,
    );

    const angle = Phaser.Math.Linear(-64, 64, (offset + 1) / 2);
    const vx = Math.cos(Phaser.Math.DegToRad(angle)) * this.speed * toward;
    const vy = Math.sin(Phaser.Math.DegToRad(angle)) * this.speed;

    this.setScaledVelocity(vx, vy);
    this.setPosition(
      paddle.x + toward * (GAMEPLAY.paddleRadius + GAMEPLAY.puckRadius + 2),
      this.y,
    );
  }

  maintainSpeed(): void {
    const velocity = this.getVelocity();
    const length = Math.hypot(velocity.x, velocity.y);
    if (length < 0.01) {
      this.serve();
      return;
    }

    const matterSpeed = this.speed * GAMEPLAY.matterVelocityScale;
    this.setVelocity((velocity.x / length) * matterSpeed, (velocity.y / length) * matterSpeed);
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
}
