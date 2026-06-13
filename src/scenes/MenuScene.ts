import Phaser from 'phaser';
import { Table } from '../objects/Table';
import {
  addControlCards,
  createStartButtonLabel,
  drawArenaTreatment,
  drawMenuPanel,
  drawStartButton,
  drawTitle,
  START_BUTTON,
} from '../ui/menu/MenuGraphics';
import { isTouchFirstDevice } from '../utils/device';
import { applyRenderScale } from '../utils/renderScale';

export class MenuScene extends Phaser.Scene {
  private readonly usesTouchControls = isTouchFirstDevice();

  constructor() {
    super('MenuScene');
  }

  create(): void {
    applyRenderScale(this);

    new Table(this).draw();
    drawArenaTreatment(this);
    drawTitle(this);
    drawMenuPanel(this);

    const startButton = this.add.graphics().setDepth(3);
    drawStartButton(startButton, false);
    createStartButtonLabel(this);

    const start = this.add
      .zone(START_BUTTON.x, START_BUTTON.y, START_BUTTON.width, START_BUTTON.height)
      .setDepth(5)
      .setInteractive({ useHandCursor: true });

    addControlCards(this, this.usesTouchControls);

    start.on('pointerdown', () => this.scene.start('GameScene'));
    start.on('pointerover', () => drawStartButton(startButton, true));
    start.on('pointerout', () => drawStartButton(startButton, false));

    const keyboard = this.input.keyboard;
    keyboard?.once('keydown-SPACE', () => this.scene.start('GameScene'));
    keyboard?.once('keydown-ENTER', () => this.scene.start('GameScene'));
  }
}
