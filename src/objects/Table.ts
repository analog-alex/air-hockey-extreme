import Phaser from 'phaser';
import { COLORS } from '../constants/colors';
import { GAME_HEIGHT, GAME_WIDTH, TABLE } from '../constants/gameplay';

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

  pulseGoal(side: 'left' | 'right'): void {
    const x = side === 'left' ? TABLE.x : TABLE.x + TABLE.width;
    const pulse = this.scene.add
      .rectangle(
        x,
        TABLE.y + TABLE.height / 2,
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
