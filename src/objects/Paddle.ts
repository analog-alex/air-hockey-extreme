import Phaser from 'phaser';
import { GAMEPLAY, RINK, toMatterVelocity } from '../constants/gameplay';

type PaddleSide = 'player' | 'cpu';

export class Paddle extends Phaser.Physics.Matter.Image {
  private readonly side: PaddleSide;

  constructor(scene: Phaser.Scene, x: number, y: number, side: PaddleSide) {
    super(scene.matter.world, x, y, 'handle');
    this.side = side;

    scene.add.existing(this);

    this.setDepth(20);
    this.setDisplaySize(GAMEPLAY.paddleRadius * 2, GAMEPLAY.paddleRadius * 2);
    this.setCircle(GAMEPLAY.paddleRadius, {
      friction: 0,
      frictionAir: 0.08,
      frictionStatic: 0,
      ignoreGravity: true,
      restitution: 1,
    });
    this.setFixedRotation();
    this.setIgnoreGravity(true);
    this.setMass(12);
  }

  move(vx: number, vy: number): void {
    this.setVelocity(toMatterVelocity(vx), toMatterVelocity(vy));
  }

  stop(): void {
    this.setVelocity(0, 0);
  }

  resetToHome(): void {
    const homeX =
      this.side === 'player'
        ? RINK.x + GAMEPLAY.paddleHomeInset
        : RINK.x + RINK.width - GAMEPLAY.paddleHomeInset;

    this.stop();
    this.setPosition(homeX, RINK.y + RINK.height / 2);
  }

  constrainToHalf(): void {
    const minX =
      this.side === 'player'
        ? RINK.x + GAMEPLAY.paddleRadius
        : GAMEPLAY.cpuHalfMinX + GAMEPLAY.paddleRadius;
    const maxX =
      this.side === 'player'
        ? GAMEPLAY.playerHalfMaxX - GAMEPLAY.paddleRadius
        : RINK.x + RINK.width - GAMEPLAY.paddleRadius;
    const minY = RINK.y + GAMEPLAY.paddleRadius;
    const maxY = RINK.y + RINK.height - GAMEPLAY.paddleRadius;

    this.setPosition(Phaser.Math.Clamp(this.x, minX, maxX), Phaser.Math.Clamp(this.y, minY, maxY));
  }
}
