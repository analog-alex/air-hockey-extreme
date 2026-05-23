import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants/gameplay';
import { Table } from '../objects/Table';
import { textStyle } from '../ui/text';

type GameOverData = {
  winner: 'player' | 'cpu';
  playerScore: number;
  cpuScore: number;
};

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
    new Table(this).draw();

    const playerWon = this.dataFromGame.winner === 'player';
    this.add
      .text(GAME_WIDTH / 2, 180, playerWon ? 'PLAYER WINS' : 'CPU WINS', textStyle({
        color: playerWon ? '#00e5ff' : '#ff2bd6',
        fontSize: '58px',
        fontStyle: 'bold',
      }))
      .setOrigin(0.5)
      .setShadow(0, 0, playerWon ? '#00e5ff' : '#ff2bd6', 18, true, true);

    this.add
      .text(
        GAME_WIDTH / 2,
        270,
        `${this.dataFromGame.playerScore}  -  ${this.dataFromGame.cpuScore}`,
        textStyle({
          color: '#f8fbff',
          fontSize: '56px',
        }),
      )
      .setOrigin(0.5);

    const restart = this.makeButton(GAME_WIDTH / 2, 392, 'RESTART');
    const menu = this.makeButton(GAME_WIDTH / 2, 474, 'MENU');

    restart.on('pointerdown', () => this.scene.start('GameScene'));
    menu.on('pointerdown', () => this.scene.start('MenuScene'));

    const keyboard = this.input.keyboard;
    keyboard?.once('keydown-R', () => this.scene.start('GameScene'));
    keyboard?.once('keydown-ENTER', () => this.scene.start('GameScene'));
    keyboard?.once('keydown-ESC', () => this.scene.start('MenuScene'));
  }

  private makeButton(x: number, y: number, label: string): Phaser.GameObjects.Text {
    const button = this.add
      .text(x, y, label, textStyle({
        color: '#030509',
        backgroundColor: '#00e5ff',
        fontSize: '25px',
        padding: { x: 28, y: 12 },
      }))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on('pointerover', () => button.setStyle({ backgroundColor: '#f8fbff' }));
    button.on('pointerout', () => button.setStyle({ backgroundColor: '#00e5ff' }));

    return button;
  }
}
