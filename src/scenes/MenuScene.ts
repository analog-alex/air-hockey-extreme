import Phaser from 'phaser';
import { COLORS } from '../constants/colors';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants/gameplay';
import { Table } from '../objects/Table';
import { displayTextStyle, textStyle } from '../ui/text';
import { isTouchFirstDevice } from '../utils/device';
import { applyRenderScale } from '../utils/renderScale';

const PANEL = {
  x: GAME_WIDTH / 2,
  y: 476,
  width: 800,
  height: 338,
  bevel: 36,
};

const START_BUTTON = {
  x: GAME_WIDTH / 2,
  y: 354,
  width: 650,
  height: 82,
  bevel: 24,
};

export class MenuScene extends Phaser.Scene {
  private readonly usesTouchControls = isTouchFirstDevice();

  constructor() {
    super('MenuScene');
  }

  create(): void {
    applyRenderScale(this);

    new Table(this).draw();
    this.drawArenaTreatment();
    this.drawTitle();

    this.drawMenuPanel();

    const startButton = this.add.graphics().setDepth(3);
    this.drawStartButton(startButton, false);

    this.add
      .text(START_BUTTON.x, START_BUTTON.y, 'START GAME', displayTextStyle({
        color: '#f8fbff',
        fontSize: '40px',
        fontStyle: '700 italic',
        letterSpacing: 8,
        shadow: {
          color: '#00e5ff',
          blur: 12,
          fill: true,
          offsetX: 0,
          offsetY: 0,
          stroke: true,
        },
        stroke: '#07111c',
        strokeThickness: 5,
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

  private drawArenaTreatment(): void {
    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x020812, 0.78)
      .setDepth(-1);

    const atmosphere = this.add.graphics().setDepth(0);
    atmosphere.fillGradientStyle(COLORS.cyan, COLORS.cyan, COLORS.blue, COLORS.blue, 0.13, 0.13, 0, 0);
    atmosphere.fillRect(90, 34, 1100, 82);
    atmosphere.fillGradientStyle(COLORS.red, 0x000000, COLORS.red, 0x000000, 0.12, 0, 0.1, 0);
    atmosphere.fillRect(92, 112, 1096, 530);

    for (let y = 72; y < 650; y += 8) {
      atmosphere.lineStyle(1, COLORS.cyan, y % 24 === 0 ? 0.035 : 0.018);
      atmosphere.lineBetween(108, y, 1172, y);
    }

    atmosphere.lineStyle(2, COLORS.cyan, 0.8);
    atmosphere.lineBetween(170, 54, 520, 54);
    atmosphere.lineBetween(760, 54, 1110, 54);
    atmosphere.lineStyle(3, COLORS.cyanSoft, 0.95);
    atmosphere.lineBetween(548, 54, 732, 54);
    atmosphere.lineStyle(2, COLORS.red, 0.78);
    atmosphere.lineBetween(106, 218, 106, 300);
    atmosphere.lineBetween(1174, 218, 1174, 300);
  }

  private drawTitle(): void {
    const titleStyle = displayTextStyle({
      fontSize: '88px',
      fontStyle: '800 italic',
      letterSpacing: 2,
      strokeThickness: 0,
      shadow: { color: 'transparent', blur: 0, fill: false, offsetX: 0, offsetY: 0, stroke: false },
    });

    this.add.text(GAME_WIDTH / 2 - 4, 143, 'GLIDE.EXE', { ...titleStyle, color: '#ff3b68' })
      .setOrigin(0.5)
      .setAlpha(0.5)
      .setDepth(1);
    this.add.text(GAME_WIDTH / 2 + 4, 139, 'GLIDE.EXE', { ...titleStyle, color: '#00e5ff' })
      .setOrigin(0.5)
      .setAlpha(0.62)
      .setDepth(1);
    this.add.text(GAME_WIDTH / 2, 140, 'GLIDE.EXE', { ...titleStyle, color: '#f8fbff' })
      .setOrigin(0.5)
      .setDepth(2)
      .setShadow(0, 0, '#00e5ff', 20, true, true);

    const glitch = this.add.graphics().setDepth(3);
    const strips = [109, 126, 151, 168];
    strips.forEach((y, index) => {
      glitch.fillStyle(index % 2 === 0 ? COLORS.cyan : COLORS.red, 0.72);
      glitch.fillRect(350 + index * 24, y, 120 + index * 18, index % 2 === 0 ? 2 : 1);
      glitch.fillRect(754 - index * 12, y + 4, 150, 1);
    });

    this.add
      .text(GAME_WIDTH / 2, 224, 'A I R   H O C K E Y', textStyle({
        color: '#65efff',
        fontSize: '19px',
        fontStyle: 'bold italic',
        letterSpacing: 5,
        strokeThickness: 2,
      }))
      .setOrigin(0.5)
      .setDepth(2)
      .setShadow(0, 0, '#00e5ff', 8, true, true);

    const accent = this.add.graphics().setDepth(2);
    accent.lineStyle(1, COLORS.cyan, 0.85);
    accent.lineBetween(390, 224, 490, 224);
    accent.lineBetween(790, 224, 890, 224);
    accent.lineStyle(2, COLORS.red, 0.9);
    accent.lineBetween(504, 224, 514, 224);
    accent.lineBetween(766, 224, 776, 224);
  }

  private drawMenuPanel(): void {
    const glass = this.add.graphics().setDepth(1);
    const left = PANEL.x - PANEL.width / 2;
    const top = PANEL.y - PANEL.height / 2;

    glass.fillStyle(COLORS.cyan, 0.1);
    this.fillBeveledRect(glass, left - 12, top - 12, PANEL.width + 24, PANEL.height + 24, PANEL.bevel + 10);
    glass.fillStyle(COLORS.darkPanel, 0.96);
    this.fillBeveledRect(glass, left, top, PANEL.width, PANEL.height, PANEL.bevel);
    glass.lineStyle(2, COLORS.cyan, 0.98);
    this.strokeBeveledRect(glass, left + 7, top + 7, PANEL.width - 14, PANEL.height - 14, PANEL.bevel - 5);
    glass.lineStyle(1, COLORS.blue, 0.62);
    this.strokeBeveledRect(glass, left + 18, top + 18, PANEL.width - 36, PANEL.height - 36, PANEL.bevel - 14);

    glass.lineStyle(1, COLORS.cyan, 0.45);
    glass.lineBetween(PANEL.x - 268, 426, PANEL.x - 66, 426);
    glass.lineBetween(PANEL.x + 66, 426, PANEL.x + 268, 426);
    glass.fillStyle(COLORS.cyan, 0.9);
    glass.fillCircle(PANEL.x - 58, 426, 2);
    glass.fillCircle(PANEL.x + 58, 426, 2);

    this.add.text(PANEL.x, 426, 'CONTROLS', textStyle({
      color: '#00e5ff',
      fontSize: '16px',
      fontStyle: 'bold italic',
      letterSpacing: 4,
      strokeThickness: 2,
    })).setOrigin(0.5).setDepth(4);
  }

  private drawStartButton(button: Phaser.GameObjects.Graphics, isHover: boolean): void {
    const left = START_BUTTON.x - START_BUTTON.width / 2;
    const top = START_BUTTON.y - START_BUTTON.height / 2;
    const fill = isHover ? 0x0a2636 : 0x06131f;
    const glow = isHover ? COLORS.white : COLORS.cyan;

    button.clear();
    button.fillStyle(glow, isHover ? 0.24 : 0.14);
    this.fillBeveledRect(button, left - 12, top - 12, START_BUTTON.width + 24, START_BUTTON.height + 24, START_BUTTON.bevel + 8);
    button.fillStyle(fill, 0.98);
    this.fillBeveledRect(button, left, top, START_BUTTON.width, START_BUTTON.height, START_BUTTON.bevel);
    button.lineStyle(2, COLORS.lightCyan, 0.84);
    this.strokeBeveledRect(button, left + 8, top + 8, START_BUTTON.width - 16, START_BUTTON.height - 16, START_BUTTON.bevel - 8);
    button.lineStyle(3, COLORS.cyan, isHover ? 1 : 0.92);
    this.strokeBeveledRect(button, left - 1, top - 1, START_BUTTON.width + 2, START_BUTTON.height + 2, START_BUTTON.bevel + 2);

    button.lineStyle(2, COLORS.cyan, isHover ? 1 : 0.8);
    this.drawChevrons(button, left + 62, START_BUTTON.y, 1);
    this.drawChevrons(button, left + START_BUTTON.width - 62, START_BUTTON.y, -1);
  }

  private addControlCards(): void {
    if (this.usesTouchControls) {
      this.addControlCard(490, 486, 260, 76, 'DRAG', 'MOVE', 'touch');
      this.addControlCard(790, 486, 260, 76, 'FLICK', 'BOOST', 'boost');
      this.addControlCard(490, 572, 300, 74, 'TAP', 'PAUSE', 'pause');
      this.addControlCard(790, 572, 300, 74, 'TAP', 'TILT', 'touch');
      this.addWinConditionFooter();
      return;
    }

    this.addControlCard(490, 486, 260, 76, 'WASD', 'MOVE', 'wasd');
    this.addControlCard(790, 486, 260, 76, 'ARROWS', 'MOVE', 'arrows');
    this.addControlCard(490, 572, 300, 74, 'ESC', 'PAUSE', 'pause');
    this.addControlCard(790, 572, 300, 74, 'SPACE', 'BOOST', 'boost');
    this.addWinConditionFooter();
  }

  private addControlCard(
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
    subtitle: string,
    icon: 'wasd' | 'arrows' | 'pause' | 'reset' | 'boost' | 'touch',
  ): void {
    const card = this.add.graphics().setDepth(3);
    const left = x - width / 2;
    const top = y - height / 2;
    const bevel = width > 220 ? 24 : 18;

    card.fillStyle(COLORS.darkNavy, 0.58);
    this.fillBeveledRect(card, left, top, width, height, bevel);
    card.lineStyle(1, COLORS.cyan, 0.34);
    this.strokeBeveledRect(card, left, top, width, height, bevel);
    card.lineStyle(1, COLORS.cyanSoft, 0.16);
    this.strokeBeveledRect(card, left + 8, top + 8, width - 16, height - 16, Math.max(8, bevel - 8));

    const iconX = left + 64;
    this.addCardIcon(iconX, y, icon);
    const textX = left + 126;

    this.add
      .text(textX, y - 12, title, textStyle({
        color: '#f8fbff',
        fontSize: '23px',
        fontStyle: 'bold',
        letterSpacing: 2,
        strokeThickness: 4,
      }))
      .setOrigin(0, 0.5)
      .setDepth(4);

    this.add
      .text(textX, y + 22, subtitle, textStyle({
        color: icon === 'boost' ? '#00e5ff' : '#d8f8ff',
        fontSize: '14px',
        fontStyle: icon === 'boost' ? 'bold' : '',
        letterSpacing: 2,
        strokeThickness: 3,
      }))
      .setOrigin(0, 0.5)
      .setDepth(4);
  }

  private addWinConditionFooter(): void {
    this.add
      .rectangle(PANEL.x - 176, 650, 92, 1, COLORS.cyan, 0.62)
      .setDepth(4);
    this.add
      .rectangle(PANEL.x + 176, 650, 92, 1, COLORS.cyan, 0.62)
      .setDepth(4);
    this.add
      .text(PANEL.x, 648, 'FIRST TO  7  WINS', textStyle({
        color: '#d8f8ff',
        fontSize: '17px',
        fontStyle: 'bold italic',
        letterSpacing: 3,
        strokeThickness: 3,
      }))
      .setOrigin(0.5)
      .setDepth(4);
  }

  private drawChevrons(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    direction: 1 | -1,
  ): void {
    for (let index = -1; index <= 1; index += 1) {
      const centerX = x + index * 15 * direction;
      graphics.beginPath();
      graphics.moveTo(centerX - 7 * direction, y - 10);
      graphics.lineTo(centerX + 3 * direction, y);
      graphics.lineTo(centerX - 7 * direction, y + 10);
      graphics.strokePath();
    }
  }

  private addCardIcon(x: number, y: number, icon: 'wasd' | 'arrows' | 'pause' | 'reset' | 'boost' | 'touch'): void {
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

    if (icon === 'touch') {
      const touch = this.add.graphics().setDepth(4);
      touch.lineStyle(3, COLORS.lightCyan, 0.88);
      touch.strokeCircle(x, y - 4, 9);
      touch.beginPath();
      touch.moveTo(x, y + 5);
      touch.lineTo(x + 10, y + 18);
      touch.moveTo(x, y + 5);
      touch.lineTo(x - 6, y + 15);
      touch.strokePath();
      return;
    }

    const boost = this.add.graphics().setDepth(4);
    boost.lineStyle(3, COLORS.lightCyan, 0.88);
    boost.beginPath();
    boost.moveTo(x - 18, y - 11);
    boost.lineTo(x - 6, y);
    boost.lineTo(x - 18, y + 11);
    boost.moveTo(x - 2, y - 11);
    boost.lineTo(x + 10, y);
    boost.lineTo(x - 2, y + 11);
    boost.moveTo(x + 14, y - 11);
    boost.lineTo(x + 26, y);
    boost.lineTo(x + 14, y + 11);
    boost.strokePath();
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
