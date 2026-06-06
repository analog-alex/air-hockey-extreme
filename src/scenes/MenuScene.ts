import Phaser from 'phaser';
import { COLORS } from '../constants/colors';
import { GAME_WIDTH } from '../constants/gameplay';
import { Table } from '../objects/Table';
import { textStyle } from '../ui/text';

const PANEL = {
  x: GAME_WIDTH / 2,
  y: 466,
  width: 680,
  height: 340,
  bevel: 32,
};

const START_BUTTON = {
  x: GAME_WIDTH / 2,
  y: 352,
  width: 520,
  height: 76,
  bevel: 20,
};

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    new Table(this).draw();

    this.add
      .text(GAME_WIDTH / 2, 136, 'GLIDE.EXE', textStyle({
        color: '#f8fbff',
        fontSize: '78px',
        fontStyle: 'bold italic',
      }))
      .setOrigin(0.5)
      .setShadow(0, 0, '#00e5ff', 28, true, true);

    this.add
      .text(GAME_WIDTH / 2, 224, 'AIR HOCKEY EXTREME', textStyle({
        color: '#9fefff',
        fontSize: '22px',
        fontStyle: 'bold italic',
      }))
      .setOrigin(0.5)
      .setShadow(0, 0, '#00e5ff', 12, true, true);

    this.drawSubtitleAccent();

    this.drawMenuPanel();

    const startButton = this.add.graphics().setDepth(3);
    this.drawStartButton(startButton, false);

    this.add
      .text(START_BUTTON.x, START_BUTTON.y, 'START GAME', textStyle({
        color: '#06131f',
        fontSize: '42px',
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
    accent.lineStyle(3, COLORS.cyan, 0.72);
    accent.beginPath();
    accent.moveTo(GAME_WIDTH / 2 - 270, 225);
    accent.lineTo(GAME_WIDTH / 2 - 240, 225);
    accent.moveTo(GAME_WIDTH / 2 + 240, 225);
    accent.lineTo(GAME_WIDTH / 2 + 270, 225);
    accent.strokePath();

    accent.lineStyle(2, COLORS.red, 0.72);
    accent.beginPath();
    accent.moveTo(GAME_WIDTH / 2 - 84, 260);
    accent.lineTo(GAME_WIDTH / 2 - 24, 260);
    accent.lineTo(GAME_WIDTH / 2, 270);
    accent.lineTo(GAME_WIDTH / 2 + 24, 260);
    accent.lineTo(GAME_WIDTH / 2 + 84, 260);
    accent.strokePath();
    accent.fillStyle(COLORS.red, 0.9);
    accent.fillCircle(GAME_WIDTH / 2, 260, 5);
  }

  private drawMenuPanel(): void {
    const glass = this.add.graphics().setDepth(1);
    const left = PANEL.x - PANEL.width / 2;
    const top = PANEL.y - PANEL.height / 2;

    glass.fillStyle(COLORS.cyan, 0.16);
    this.fillBeveledRect(glass, left - 14, top - 14, PANEL.width + 28, PANEL.height + 28, PANEL.bevel + 8);
    glass.fillStyle(COLORS.darkPanel, 0.9);
    this.fillBeveledRect(glass, left, top, PANEL.width, PANEL.height, PANEL.bevel);
    glass.fillStyle(COLORS.white, 0.055);
    this.fillBeveledRect(glass, left + 28, top + 28, PANEL.width - 56, 74, PANEL.bevel - 18);
    glass.lineStyle(3, COLORS.cyan, 0.95);
    this.strokeBeveledRect(glass, left + 8, top + 8, PANEL.width - 16, PANEL.height - 16, PANEL.bevel - 6);
    glass.lineStyle(1, COLORS.lightCyan, 0.32);
    this.strokeBeveledRect(glass, left + 26, top + 26, PANEL.width - 52, PANEL.height - 52, PANEL.bevel - 20);

    this.add
      .rectangle(PANEL.x, top + 12, PANEL.width - 160, 2, COLORS.white, 0.6)
      .setDepth(2);
    this.add
      .rectangle(PANEL.x, top + 24, PANEL.width - 260, 3, COLORS.cyan, 0.78)
      .setDepth(2);
    this.add
      .rectangle(PANEL.x, 476, 2, 72, COLORS.cyan, 0.32)
      .setDepth(2);
  }

  private drawStartButton(button: Phaser.GameObjects.Graphics, isHover: boolean): void {
    const left = START_BUTTON.x - START_BUTTON.width / 2;
    const top = START_BUTTON.y - START_BUTTON.height / 2;
    const fill = isHover ? COLORS.white : COLORS.cyan;
    const glow = isHover ? COLORS.white : COLORS.cyan;

    button.clear();
    button.fillStyle(glow, isHover ? 0.3 : 0.22);
    this.fillBeveledRect(button, left - 12, top - 12, START_BUTTON.width + 24, START_BUTTON.height + 24, START_BUTTON.bevel + 8);
    button.fillStyle(fill, isHover ? 0.96 : 0.9);
    this.fillBeveledRect(button, left, top, START_BUTTON.width, START_BUTTON.height, START_BUTTON.bevel);
    button.lineStyle(2, COLORS.white, 0.82);
    this.strokeBeveledRect(button, left + 8, top + 8, START_BUTTON.width - 16, START_BUTTON.height - 16, START_BUTTON.bevel - 8);
    button.lineStyle(3, COLORS.cyan, isHover ? 0.45 : 0.95);
    this.strokeBeveledRect(button, left - 1, top - 1, START_BUTTON.width + 2, START_BUTTON.height + 2, START_BUTTON.bevel + 2);

    for (let x = left + 18; x < left + START_BUTTON.width - 18; x += 12) {
      button.lineStyle(1, COLORS.darkNavy, 0.08);
      button.beginPath();
      button.moveTo(x, top + 12);
      button.lineTo(x + 8, top + START_BUTTON.height - 12);
      button.strokePath();
    }
  }

  private addControlCards(): void {
    this.addControlCard(500, 476, 250, 82, 'WASD', 'MOVE', 'wasd');
    this.addControlCard(780, 476, 250, 82, 'ARROWS', 'MOVE', 'arrows');
    this.addControlCard(470, 566, 160, 78, 'ESC', 'PAUSE', 'pause');
    this.addControlCard(840, 566, 220, 78, 'SPACE', 'FLICK', 'flick');
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
    const bevel = width > 220 ? 24 : 18;

    card.fillStyle(COLORS.darkNavy, 0.74);
    this.fillBeveledRect(card, left, top, width, height, bevel);
    card.lineStyle(1, COLORS.cyan, 0.55);
    this.strokeBeveledRect(card, left, top, width, height, bevel);
    card.lineStyle(1, COLORS.cyanSoft, 0.16);
    this.strokeBeveledRect(card, left + 8, top + 8, width - 16, height - 16, Math.max(8, bevel - 8));

    const iconX = left + (width > 220 ? 62 : 44);
    this.addCardIcon(iconX, y, icon);
    const textX = left + (width > 220 ? 122 : 84);

    this.add
      .text(textX, y - 12, title, textStyle({
        color: '#f8fbff',
        fontSize: width > 220 ? '24px' : '21px',
        fontStyle: 'bold',
        strokeThickness: 4,
      }))
      .setOrigin(0, 0.5)
      .setDepth(4);

    this.add
      .text(textX, y + 22, subtitle, textStyle({
        color: icon === 'flick' ? '#00e5ff' : '#d8f8ff',
        fontSize: icon === 'flick' ? '17px' : '15px',
        fontStyle: icon === 'flick' ? 'bold' : '',
        strokeThickness: 3,
      }))
      .setOrigin(0, 0.5)
      .setDepth(4);
  }

  private addWinConditionFooter(): void {
    this.add
      .rectangle(PANEL.x - 126, 626, 78, 2, COLORS.cyan, 0.72)
      .setDepth(4);
    this.add
      .rectangle(PANEL.x + 126, 626, 78, 2, COLORS.cyan, 0.72)
      .setDepth(4);
    this.add
      .text(PANEL.x, 624, 'FIRST TO 7 WINS', textStyle({
        color: '#d8f8ff',
        fontSize: '17px',
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
      pause.fillStyle(COLORS.darkPanel, 0.72);
      pause.fillRoundedRect(x - 13, y - 13, 26, 26, 5);
      pause.lineStyle(2, COLORS.lightCyan, 0.9);
      pause.strokeRoundedRect(x - 13, y - 13, 26, 26, 5);
      pause.fillStyle(COLORS.paleCyan, 0.92);
      pause.fillRoundedRect(x - 6, y - 8, 4, 16, 1);
      pause.fillRoundedRect(x + 2, y - 8, 4, 16, 1);
      return;
    }

    if (icon === 'reset') {
      const reset = this.add.graphics().setDepth(4);
      reset.lineStyle(3, COLORS.lightCyan, 0.86);
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
      reset.fillStyle(COLORS.cyan, 0.9);
      reset.fillCircle(x, y, 3);
      return;
    }

    const flick = this.add.graphics().setDepth(4);
    flick.lineStyle(3, COLORS.lightCyan, 0.88);
    flick.strokeCircle(x - 6, y, 12);
    flick.beginPath();
    flick.moveTo(x + 4, y);
    flick.lineTo(x + 26, y);
    flick.moveTo(x + 18, y - 8);
    flick.lineTo(x + 28, y);
    flick.lineTo(x + 18, y + 8);
    flick.strokePath();
    flick.fillStyle(COLORS.cyan, 0.9);
    flick.fillCircle(x - 6, y, 3);
  }

  private addKeycap(x: number, y: number, label: string): void {
    const key = this.add.graphics().setDepth(4);
    key.fillStyle(COLORS.darkPanel, 0.8);
    key.fillRoundedRect(x - 10, y - 10, 20, 20, 4);
    key.lineStyle(1, COLORS.paleCyan, 0.78);
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

  private fillBeveledRect(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    bevel: number,
  ): void {
    graphics.fillPoints(this.getBeveledRectPoints(x, y, width, height, bevel), true);
  }

  private strokeBeveledRect(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    bevel: number,
  ): void {
    graphics.strokePoints(this.getBeveledRectPoints(x, y, width, height, bevel), true, true);
  }

  private getBeveledRectPoints(
    x: number,
    y: number,
    width: number,
    height: number,
    bevel: number,
  ): Phaser.Geom.Point[] {
    const cut = Math.min(bevel, width / 2 - 1, height / 2 - 1);

    return [
      new Phaser.Geom.Point(x + cut, y),
      new Phaser.Geom.Point(x + width - cut, y),
      new Phaser.Geom.Point(x + width, y + cut),
      new Phaser.Geom.Point(x + width, y + height - cut),
      new Phaser.Geom.Point(x + width - cut, y + height),
      new Phaser.Geom.Point(x + cut, y + height),
      new Phaser.Geom.Point(x, y + height - cut),
      new Phaser.Geom.Point(x, y + cut),
    ];
  }
}
