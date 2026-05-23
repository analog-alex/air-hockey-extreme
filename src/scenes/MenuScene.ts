import Phaser from 'phaser';
import { GAME_WIDTH } from '../constants/gameplay';
import { Table } from '../objects/Table';
import { textStyle } from '../ui/text';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    new Table(this).draw();

    this.add
      .text(GAME_WIDTH / 2, 146, 'GLIDE.EXE', textStyle({
        color: '#f8fbff',
        fontSize: '78px',
        fontStyle: 'bold',
      }))
      .setOrigin(0.5)
      .setShadow(0, 0, '#00e5ff', 22, true, true);

    this.add
      .text(GAME_WIDTH / 2, 214, 'Air Hockey Extreme', textStyle({
        color: '#9fefff',
        fontSize: '28px',
      }))
      .setOrigin(0.5);

    const start = this.add
      .text(GAME_WIDTH / 2, 354, 'START GAME', textStyle({
        color: '#030509',
        backgroundColor: '#00e5ff',
        fontSize: '28px',
        padding: { x: 28, y: 14 },
      }))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const controlsText = [
      'WASD / ARROWS  MOVE',
      'ESC            PAUSE',
      'R              RESTART',
      'FIRST TO 7 WINS',
    ].join('\n');

    this.add
      .text(GAME_WIDTH / 2, 458, controlsText, textStyle({
        align: 'center',
        color: '#d8f8ff',
        fontSize: '19px',
        lineSpacing: 10,
      }))
      .setOrigin(0.5);

    start.on('pointerdown', () => this.scene.start('GameScene'));
    start.on('pointerover', () => start.setStyle({ backgroundColor: '#f8fbff' }));
    start.on('pointerout', () => start.setStyle({ backgroundColor: '#00e5ff' }));

    const keyboard = this.input.keyboard;
    keyboard?.once('keydown-SPACE', () => this.scene.start('GameScene'));
    keyboard?.once('keydown-ENTER', () => this.scene.start('GameScene'));
  }
}
