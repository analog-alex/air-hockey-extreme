import Phaser from 'phaser';
import { COLORS } from '../constants/colors';
import { GAME_HEIGHT, GAME_WIDTH, RINK, TABLE } from '../constants/gameplay';

const WALL_THICKNESS = 80;
const WALL_OPTIONS: Phaser.Types.Physics.Matter.MatterBodyConfig = {
  isStatic: true,
  friction: 0,
  frictionStatic: 0,
  restitution: 1,
};

export class Table {
  constructor(private readonly scene: Phaser.Scene) {}

  draw(): void {
    this.scene.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.background)
      .setDepth(-10);

    this.scene.add
      .image(TABLE.x + TABLE.width / 2, TABLE.y + TABLE.height / 2, 'rink')
      .setDisplaySize(TABLE.width, TABLE.height)
      .setAlpha(1)
      .setDepth(-4);

    const graphics = this.scene.add.graphics().setDepth(-2);
    graphics.lineStyle(3, COLORS.cyan, 0.24);
    graphics.strokeRoundedRect(TABLE.x, TABLE.y, TABLE.width, TABLE.height, 20);
  }

  /** Matter bodies around the rink; goal openings are left on the left and right sides. */
  createWalls(): void {
    const goalGap = TABLE.goalWidth;
    const sideSegmentHeight = (RINK.height - goalGap) / 2;
    const sideYInset = sideSegmentHeight / 2;
    const leftX = RINK.x - WALL_THICKNESS / 2;
    const rightX = RINK.x + RINK.width + WALL_THICKNESS / 2;
    const topY = RINK.y - WALL_THICKNESS / 2;
    const bottomY = RINK.y + RINK.height + WALL_THICKNESS / 2;

    this.scene.matter.add.rectangle(
      RINK.x + RINK.width / 2,
      topY,
      RINK.width + WALL_THICKNESS * 2,
      WALL_THICKNESS,
      WALL_OPTIONS,
    );
    this.scene.matter.add.rectangle(
      RINK.x + RINK.width / 2,
      bottomY,
      RINK.width + WALL_THICKNESS * 2,
      WALL_THICKNESS,
      WALL_OPTIONS,
    );
    this.scene.matter.add.rectangle(leftX, RINK.y + sideYInset, WALL_THICKNESS, sideSegmentHeight, WALL_OPTIONS);
    this.scene.matter.add.rectangle(
      leftX,
      RINK.y + RINK.height - sideYInset,
      WALL_THICKNESS,
      sideSegmentHeight,
      WALL_OPTIONS,
    );
    this.scene.matter.add.rectangle(rightX, RINK.y + sideYInset, WALL_THICKNESS, sideSegmentHeight, WALL_OPTIONS);
    this.scene.matter.add.rectangle(
      rightX,
      RINK.y + RINK.height - sideYInset,
      WALL_THICKNESS,
      sideSegmentHeight,
      WALL_OPTIONS,
    );
  }

  pulseGoal(side: 'left' | 'right'): void {
    const x = side === 'left' ? RINK.x + RINK.goalLineInset : RINK.x + RINK.width - RINK.goalLineInset;
    const pulse = this.scene.add
      .rectangle(
        x,
        RINK.y + RINK.height / 2,
        TABLE.goalDepth,
        TABLE.goalWidth,
        side === 'left' ? COLORS.magenta : COLORS.cyan,
        0.32,
      )
      .setDepth(30);

    this.scene.tweens.add({
      targets: pulse,
      alpha: 0,
      scaleX: 2.4,
      scaleY: 1.7,
      duration: 360,
      ease: 'Sine.easeOut',
      onComplete: () => pulse.destroy(),
    });
  }
}
