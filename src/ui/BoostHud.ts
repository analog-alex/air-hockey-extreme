import Phaser from 'phaser';
import { COLORS } from '../constants/colors';
import { GAMEPLAY } from '../constants/gameplay';
import { THEME } from '../constants/theme';
import { textStyle } from './text';

const BAR_WIDTH = 220;

export class BoostHud {
  private readonly staminaFill: Phaser.GameObjects.Rectangle;
  private readonly staminaStatus: Phaser.GameObjects.Text;
  private stamina = 1;
  private isBoosting = false;
  private exhausted = false;

  constructor(scene: Phaser.Scene) {
    scene.add
      .text(
        58,
        58,
        'BOOST',
        textStyle({ color: THEME.textPale, fontSize: '14px', fontStyle: 'bold' }),
      )
      .setOrigin(0, 0.5)
      .setDepth(60);

    scene.add
      .rectangle(120, 58, 224, 12, COLORS.darkPanel, 0.9)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, COLORS.dimWhite, 0.7)
      .setDepth(60);

    this.staminaFill = scene.add
      .rectangle(122, 58, BAR_WIDTH, 8, COLORS.cyan, 1)
      .setOrigin(0, 0.5)
      .setDepth(61);

    this.staminaStatus = scene.add
      .text(354, 58, 'READY', textStyle({ color: THEME.cyan, fontSize: '14px', fontStyle: 'bold' }))
      .setOrigin(0, 0.5)
      .setDepth(60);
  }

  get boosting(): boolean {
    return this.isBoosting;
  }

  update(deltaSeconds: number, boostDown: boolean, isMoving: boolean): void {
    if (!boostDown) {
      this.exhausted = false;
      this.stamina = Math.min(1, this.stamina + deltaSeconds / GAMEPLAY.playerBoostRechargeSeconds);
    }

    this.isBoosting = boostDown && isMoving && this.stamina > 0 && !this.exhausted;

    if (this.isBoosting) {
      this.stamina = Math.max(0, this.stamina - deltaSeconds / GAMEPLAY.playerBoostDrainSeconds);
      if (this.stamina === 0) {
        this.exhausted = true;
      }
    }

    this.refreshDisplay();
  }

  refill(): void {
    this.stamina = 1;
    this.isBoosting = false;
    this.exhausted = false;
    this.refreshDisplay();
  }

  private refreshDisplay(): void {
    this.staminaFill.width = BAR_WIDTH * this.stamina;
    const lowStaminaRatio = Phaser.Math.Clamp(this.stamina / 0.3, 0, 1);
    const red = Math.round(Phaser.Math.Linear(255, 0, lowStaminaRatio));
    const green = Math.round(Phaser.Math.Linear(59, 229, lowStaminaRatio));
    const blue = Math.round(Phaser.Math.Linear(104, 255, lowStaminaRatio));
    const color = Phaser.Display.Color.GetColor(red, green, blue);
    this.staminaFill.setFillStyle(color, 1);

    if (this.exhausted) {
      this.staminaStatus.setText('EXHAUSTED').setColor(THEME.red);
    } else if (this.isBoosting) {
      this.staminaStatus.setText('BOOSTING').setColor(THEME.cyan);
    } else if (this.stamina >= 1) {
      this.staminaStatus.setText('READY').setColor(THEME.cyan);
    } else {
      this.staminaStatus.setText(`${Math.ceil(this.stamina * 100)}%`).setColor(THEME.textMuted);
    }
  }
}
