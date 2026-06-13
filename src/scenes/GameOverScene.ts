import Phaser from 'phaser';
import { GAME_WIDTH } from '../constants/gameplay';
import { THEME } from '../constants/theme';
import { Table } from '../objects/Table';
import type { GameOverData } from '../types/game';
import { createCyanButton } from '../ui/cyanButton';
import { displayTextStyle } from '../ui/text';
import { applyRenderScale } from '../utils/renderScale';

export class GameOverScene extends Phaser.Scene {
  private dataFromGame: GameOverData = {
    winner: 'player',
    playerScore: 0,
    cpuScore: 0,
  };

  constructor() {
    super('GameOverScene');
  }

  init(data: GameOverData): void {
    this.dataFromGame = data;
  }

  create(): void {
    applyRenderScale(this);

    new Table(this).draw();

    const playerWon = this.dataFromGame.winner === 'player';
    const accentColor = playerWon ? THEME.cyan : THEME.magenta;

    this.add
      .text(GAME_WIDTH / 2, 180, playerWon ? 'PLAYER WINS' : 'CPU WINS', displayTextStyle({
        color: accentColor,
        fontSize: '58px',
        fontStyle: '700',
      }))
      .setOrigin(0.5)
      .setShadow(0, 0, accentColor, 18, true, true);

    this.add
      .text(
        GAME_WIDTH / 2,
        270,
        `${this.dataFromGame.playerScore}  -  ${this.dataFromGame.cpuScore}`,
        displayTextStyle({
          color: THEME.textPrimary,
          fontSize: '56px',
          fontStyle: '700',
        }),
      )
      .setOrigin(0.5);

    const restart = createCyanButton(this, GAME_WIDTH / 2, 392, 'RESTART');
    const menu = createCyanButton(this, GAME_WIDTH / 2, 474, 'MENU');

    restart.on('pointerdown', () => this.scene.start('GameScene'));
    menu.on('pointerdown', () => this.scene.start('MenuScene'));

    const keyboard = this.input.keyboard;
    keyboard?.once('keydown-R', () => this.scene.start('GameScene'));
    keyboard?.once('keydown-ENTER', () => this.scene.start('GameScene'));
    keyboard?.once('keydown-ESC', () => this.scene.start('MenuScene'));
  }
}