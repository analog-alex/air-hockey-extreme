import Phaser from 'phaser';
import handleUrl from '../../assets/handle.png?url';
import puckUrl from '../../assets/puck.png?url';
import rinkUrl from '../../assets/rink.png?url';
import { COLORS } from '../constants/colors';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants/gameplay';
import { textStyle } from '../ui/text';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'LOADING GLIDE.EXE', textStyle({
        color: '#f8fbff',
        fontSize: '28px',
      }))
      .setOrigin(0.5);

    const bar = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 48, 360, 8, COLORS.cyan, 0.2);
    const fill = this.add
      .rectangle(GAME_WIDTH / 2 - 180, GAME_HEIGHT / 2 + 48, 0, 8, COLORS.cyan, 0.9)
      .setOrigin(0, 0.5);

    this.load.on('progress', (value: number) => {
      fill.width = 360 * value;
    });

    this.load.image('handle', handleUrl);
    this.load.image('puck', puckUrl);
    this.load.image('rink', rinkUrl);

    this.load.once('complete', () => {
      bar.destroy();
      fill.destroy();
    });
  }

  create(): void {
    this.scene.start('MenuScene');
  }
}
