import Phaser from 'phaser';
import { GAMEPLAY, RINK, TABLE, fromMatterVelocity, toMatterVelocity } from '../constants/gameplay';

export class Puck extends Phaser.Physics.Matter.Image {
  private maxSpeedOverrideTimer = 0;

  constructor(scene: Phaser.Scene) {
    super(scene.matter.world, RINK.x + RINK.width / 2, RINK.y + RINK.height / 2, 'puck');

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
    this.maxSpeedOverrideTimer = 0;
    this.setPosition(RINK.x + RINK.width / 2, RINK.y + RINK.height / 2);
    const angle = Phaser.Math.DegToRad(Phaser.Math.Between(-34, 34));
    const vx = Math.cos(angle) * GAMEPLAY.puckInitialSpeed * direction;
    const vy = Math.sin(angle) * GAMEPLAY.puckInitialSpeed;
    this.setScaledVelocity(vx, vy);
  }

  /** Stop the puck (0 is the same in gameplay and Matter space). */
  stop(): void {
    this.setVelocity(0, 0);
  }

  bounceFromPaddle(
    paddle: Phaser.Physics.Matter.Image,
    toward: 1 | -1,
    useBoostMomentum = false,
  ): void {
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
    let vx = Math.cos(Phaser.Math.DegToRad(angle)) * nextSpeed * toward;
    let vy =
      Math.sin(Phaser.Math.DegToRad(angle)) * nextSpeed +
      fromMatterVelocity(paddleVelocity.y) * GAMEPLAY.paddleMomentumInfluence;

    if (useBoostMomentum) {
      const length = Math.hypot(vx, vy);
      vx = (vx / length) * GAMEPLAY.boostedPuckSpeed;
      vy = (vy / length) * GAMEPLAY.boostedPuckSpeed;
      this.maxSpeedOverrideTimer = GAMEPLAY.boostedPuckMaxSpeedSeconds;
    }

    this.setScaledVelocity(vx, vy);
    this.setPosition(
      paddle.x + toward * (GAMEPLAY.paddleRadius + GAMEPLAY.puckRadius + 2),
      this.y,
    );
  }

  tiltTowardPlayer(): void {
    const angle = Phaser.Math.DegToRad(
      180 + Phaser.Math.Between(
        -GAMEPLAY.tiltAngleSpreadDegrees,
        GAMEPLAY.tiltAngleSpreadDegrees,
      ),
    );
    const speed = Phaser.Math.Between(GAMEPLAY.tiltMinSpeed, GAMEPLAY.tiltMaxSpeed);

    this.setScaledVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  updateMotion(deltaSeconds: number): void {
    this.maxSpeedOverrideTimer = Math.max(0, this.maxSpeedOverrideTimer - deltaSeconds);

    const velocity = this.getVelocity();
    const length = Math.hypot(velocity.x, velocity.y);
    const speed = this.toGameplaySpeed(length);

    if (speed > GAMEPLAY.puckMaxSpeed && this.maxSpeedOverrideTimer <= 0) {
      const maxMatterSpeed = toMatterVelocity(GAMEPLAY.puckMaxSpeed);
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
      x: fromMatterVelocity(velocity.x),
      y: fromMatterVelocity(velocity.y),
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
        RINK.y + GAMEPLAY.puckRadius,
        RINK.y + RINK.height - GAMEPLAY.puckRadius,
      );
    }

    const timeToTarget = (targetX - this.x) / velocity.x;
    if (timeToTarget <= 0) {
      return this.y;
    }

    const minY = RINK.y + GAMEPLAY.puckRadius;
    const maxY = RINK.y + RINK.height - GAMEPLAY.puckRadius;
    const travelHeight = maxY - minY;
    const rawY = this.y + velocity.y * timeToTarget;
    const wrapped = Phaser.Math.Wrap(rawY - minY, 0, travelHeight * 2);
    const reflected = wrapped > travelHeight ? travelHeight * 2 - wrapped : wrapped;

    return minY + reflected;
  }

  handleTableWalls(): 'player' | 'cpu' | null {
    const leftGoal = RINK.x + RINK.goalLineInset;
    const rightGoal = RINK.x + RINK.width - RINK.goalLineInset;
    const top = RINK.y + GAMEPLAY.puckRadius;
    const bottom = RINK.y + RINK.height - GAMEPLAY.puckRadius;
    const goalTop = RINK.y + RINK.height / 2 - TABLE.goalWidth / 2;
    const goalBottom = RINK.y + RINK.height / 2 + TABLE.goalWidth / 2;
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
    this.setVelocity(toMatterVelocity(vx), toMatterVelocity(vy));
  }

  private toGameplaySpeed(matterSpeed: number): number {
    return fromMatterVelocity(matterSpeed);
  }
}
