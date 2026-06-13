import Phaser from 'phaser';
import handleUrl from '../../assets/handle.svg?url';
import puckUrl from '../../assets/puck.svg?url';
import rinkUrl from '../../assets/rink.png?url';
import { COLORS } from '../constants/colors';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants/gameplay';
import { THEME } from '../constants/theme';
import { textStyle } from '../ui/text';
import { applyRenderScale } from '../utils/renderScale';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    applyRenderScale(this);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'LOADING GLIDE.EXE', textStyle({
        color: THEME.textPrimary,
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

    this.load.svg('handle', handleUrl, { width: 256, height: 256 });
    this.load.svg('puck', puckUrl, { width: 128, height: 128 });
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
