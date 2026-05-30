import Phaser from 'phaser';
import { GAME_WIDTH } from '../constants/gameplay';
import { Table } from '../objects/Table';
import { textStyle } from '../ui/text';

const PANEL = {
  x: GAME_WIDTH / 2,
  y: 434,
  width: 640,
  height: 330,
  radius: 28,
};

const START_BUTTON = {
  x: GAME_WIDTH / 2,
  y: 326,
  width: 410,
  height: 68,
  radius: 15,
};

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
      .setOrigin(0.5)
      .setShadow(0, 0, '#00e5ff', 8, true, true);

    this.drawSubtitleAccent();

    this.drawMenuPanel();

    const startButton = this.add.graphics().setDepth(3);
    this.drawStartButton(startButton, false);

    this.add
      .text(START_BUTTON.x, START_BUTTON.y, 'START GAME', textStyle({
        color: '#06131f',
        fontSize: '28px',
        fontStyle: 'bold',
        shadow: {
          color: '#f8fbff',
          blur: 3,
          fill: true,
          offsetX: 0,
          offsetY: 0,
          stroke: true,
        },
        stroke: '#f8fbff',
        strokeThickness: 2,
      }))
      .setOrigin(0.5)
      .setDepth(4);

    const start = this.add
      .zone(START_BUTTON.x, START_BUTTON.y, START_BUTTON.width, START_BUTTON.height)
      .setDepth(5)
      .setInteractive({ useHandCursor: true });

    this.addControlCards();

    start.on('pointerdown', () => this.scene.start('GameScene'));
    start.on('pointerover', () => this.drawStartButton(startButton, true));
    start.on('pointerout', () => this.drawStartButton(startButton, false));

    const keyboard = this.input.keyboard;
    keyboard?.once('keydown-SPACE', () => this.scene.start('GameScene'));
    keyboard?.once('keydown-ENTER', () => this.scene.start('GameScene'));
  }

  private drawSubtitleAccent(): void {
    const accent = this.add.graphics().setDepth(2);
    accent.lineStyle(2, 0xff3b68, 0.7);
    accent.beginPath();
    accent.moveTo(GAME_WIDTH / 2 - 88, 244);
    accent.lineTo(GAME_WIDTH / 2 - 34, 244);
    accent.lineTo(GAME_WIDTH / 2 - 28, 250);
    accent.lineTo(GAME_WIDTH / 2 + 28, 250);
    accent.lineTo(GAME_WIDTH / 2 + 34, 244);
    accent.lineTo(GAME_WIDTH / 2 + 88, 244);
    accent.strokePath();
  }

  private drawMenuPanel(): void {
    const glass = this.add.graphics().setDepth(1);
    const left = PANEL.x - PANEL.width / 2;
    const top = PANEL.y - PANEL.height / 2;

    glass.fillStyle(0x00e5ff, 0.12);
    glass.fillRoundedRect(left - 12, top - 12, PANEL.width + 24, PANEL.height + 24, PANEL.radius + 10);
    glass.fillStyle(0x03101a, 0.78);
    glass.fillRoundedRect(left, top, PANEL.width, PANEL.height, PANEL.radius);
    glass.fillStyle(0xf8fbff, 0.06);
    glass.fillRoundedRect(left + 18, top + 16, PANEL.width - 36, 60, PANEL.radius - 12);
    glass.lineStyle(2, 0xf8fbff, 0.28);
    glass.strokeRoundedRect(left, top, PANEL.width, PANEL.height, PANEL.radius);
    glass.lineStyle(3, 0x00e5ff, 0.82);
    glass.strokeRoundedRect(left + 10, top + 10, PANEL.width - 20, PANEL.height - 20, PANEL.radius - 10);
    glass.lineStyle(1, 0x00e5ff, 0.24);
    glass.strokeRoundedRect(left + 24, top + 24, PANEL.width - 48, PANEL.height - 48, PANEL.radius - 18);

    this.add
      .rectangle(PANEL.x, top + 1, PANEL.width - 136, 2, 0xf8fbff, 0.6)
      .setDepth(2);
    this.add
      .rectangle(PANEL.x, top + 14, PANEL.width - 246, 3, 0x00e5ff, 0.72)
      .setDepth(2);
  }

  private drawStartButton(button: Phaser.GameObjects.Graphics, isHover: boolean): void {
    const left = START_BUTTON.x - START_BUTTON.width / 2;
    const top = START_BUTTON.y - START_BUTTON.height / 2;
    const fill = isHover ? 0xf8fbff : 0x00e5ff;
    const glow = isHover ? 0xf8fbff : 0x00e5ff;

    button.clear();
    button.fillStyle(glow, isHover ? 0.3 : 0.22);
    button.fillRoundedRect(left - 10, top - 10, START_BUTTON.width + 20, START_BUTTON.height + 20, START_BUTTON.radius + 8);
    button.fillStyle(fill, isHover ? 0.96 : 0.9);
    button.fillRoundedRect(left, top, START_BUTTON.width, START_BUTTON.height, START_BUTTON.radius);
    button.lineStyle(2, 0xf8fbff, 0.82);
    button.strokeRoundedRect(left + 5, top + 5, START_BUTTON.width - 10, START_BUTTON.height - 10, START_BUTTON.radius - 5);
    button.lineStyle(3, 0x00e5ff, isHover ? 0.45 : 0.95);
    button.strokeRoundedRect(left - 1, top - 1, START_BUTTON.width + 2, START_BUTTON.height + 2, START_BUTTON.radius + 2);

    for (let x = left + 18; x < left + START_BUTTON.width - 18; x += 12) {
      button.lineStyle(1, 0x06131f, 0.08);
      button.beginPath();
      button.moveTo(x, top + 12);
      button.lineTo(x + 8, top + START_BUTTON.height - 12);
      button.strokePath();
    }
  }

  private addControlCards(): void {
    this.addControlCard(536, 422, 220, 92, 'WASD', 'MOVE', 'wasd');
    this.addControlCard(794, 422, 220, 92, 'ARROWS', 'MOVE', 'arrows');
    this.addControlCard(494, 534, 126, 86, 'ESC', 'PAUSE', 'pause');
    this.addControlCard(638, 534, 126, 86, 'R', 'RESTART', 'reset');
    this.addControlCard(812, 534, 190, 86, 'SPACE', 'FLICK', 'flick');
    this.addWinConditionFooter();
  }

  private addControlCard(
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
    subtitle: string,
    icon: 'wasd' | 'arrows' | 'pause' | 'reset' | 'flick',
  ): void {
    const card = this.add.graphics().setDepth(3);
    const left = x - width / 2;
    const top = y - height / 2;

    card.fillStyle(0x06131f, 0.74);
    card.fillRoundedRect(left, top, width, height, 10);
    card.lineStyle(1, 0x00e5ff, 0.55);
    card.strokeRoundedRect(left, top, width, height, 10);
    card.lineStyle(1, 0x3af4ff, 0.16);
    card.strokeRoundedRect(left + 8, top + 8, width - 16, height - 16, 7);

    const iconX = left + (width > 160 ? 58 : 36);
    this.addCardIcon(iconX, y, icon);

    this.add
      .text(left + (width > 160 ? 104 : 70), y - 12, title, textStyle({
        color: '#f8fbff',
        fontSize: '22px',
        fontStyle: 'bold',
        strokeThickness: 4,
      }))
      .setOrigin(0, 0.5)
      .setDepth(4);

    this.add
      .text(left + (width > 160 ? 104 : 70), y + 20, subtitle, textStyle({
        color: icon === 'flick' ? '#00e5ff' : '#d8f8ff',
        fontSize: icon === 'flick' ? '18px' : '14px',
        fontStyle: icon === 'flick' ? 'bold' : '',
        strokeThickness: 3,
      }))
      .setOrigin(0, 0.5)
      .setDepth(4);
  }

  private addWinConditionFooter(): void {
    this.add
      .text(PANEL.x, 602, 'FIRST TO 7 WINS', textStyle({
        color: '#d8f8ff',
        fontSize: '18px',
        fontStyle: 'bold',
        strokeThickness: 3,
      }))
      .setOrigin(0.5)
      .setDepth(4);
  }

  private addCardIcon(x: number, y: number, icon: 'wasd' | 'arrows' | 'pause' | 'reset' | 'flick'): void {
    if (icon === 'wasd') {
      this.addKeycap(x, y - 17, 'W');
      this.addKeycap(x - 19, y + 2, 'A');
      this.addKeycap(x, y + 2, 'S');
      this.addKeycap(x + 19, y + 2, 'D');
      return;
    }

    if (icon === 'arrows') {
      this.addKeycap(x, y - 17, '^');
      this.addKeycap(x - 19, y + 2, '<');
      this.addKeycap(x, y + 2, 'v');
      this.addKeycap(x + 19, y + 2, '>');
      return;
    }

    if (icon === 'pause') {
      const pause = this.add.graphics().setDepth(4);
      pause.fillStyle(0x03101a, 0.72);
      pause.fillRoundedRect(x - 13, y - 13, 26, 26, 5);
      pause.lineStyle(2, 0x9fefff, 0.9);
      pause.strokeRoundedRect(x - 13, y - 13, 26, 26, 5);
      pause.fillStyle(0xd8f8ff, 0.92);
      pause.fillRoundedRect(x - 6, y - 8, 4, 16, 1);
      pause.fillRoundedRect(x + 2, y - 8, 4, 16, 1);
      return;
    }

    if (icon === 'reset') {
      const reset = this.add.graphics().setDepth(4);
      reset.lineStyle(3, 0x9fefff, 0.86);
      reset.strokeCircle(x, y, 13);
      reset.beginPath();
      reset.moveTo(x, y - 20);
      reset.lineTo(x, y - 8);
      reset.moveTo(x, y + 8);
      reset.lineTo(x, y + 20);
      reset.moveTo(x - 20, y);
      reset.lineTo(x - 8, y);
      reset.moveTo(x + 8, y);
      reset.lineTo(x + 20, y);
      reset.strokePath();
      reset.fillStyle(0x00e5ff, 0.9);
      reset.fillCircle(x, y, 3);
      return;
    }

    const flick = this.add.graphics().setDepth(4);
    flick.lineStyle(3, 0x9fefff, 0.88);
    flick.strokeCircle(x - 6, y, 12);
    flick.beginPath();
    flick.moveTo(x + 4, y);
    flick.lineTo(x + 26, y);
    flick.moveTo(x + 18, y - 8);
    flick.lineTo(x + 28, y);
    flick.lineTo(x + 18, y + 8);
    flick.strokePath();
    flick.fillStyle(0x00e5ff, 0.9);
    flick.fillCircle(x - 6, y, 3);
  }

  private addKeycap(x: number, y: number, label: string): void {
    const key = this.add.graphics().setDepth(4);
    key.fillStyle(0x03101a, 0.8);
    key.fillRoundedRect(x - 10, y - 10, 20, 20, 4);
    key.lineStyle(1, 0xd8f8ff, 0.78);
    key.strokeRoundedRect(x - 10, y - 10, 20, 20, 4);

    if (label.length > 0) {
      this.add
        .text(x, y, label, textStyle({
          color: '#f8fbff',
          fontSize: '12px',
        fontStyle: 'bold',
          strokeThickness: 2,
        }))
        .setOrigin(0.5)
        .setDepth(5);
    }
  }
}
