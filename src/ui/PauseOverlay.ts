import type Phaser from 'phaser';
import { COLORS } from '../constants/colors';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants/gameplay';
import { THEME } from '../constants/theme';
import { createCyanButton } from './cyanButton';
import { displayTextStyle, textStyle } from './text';

export type PauseOverlayCallbacks = {
  usesTouchControls: boolean;
  onResume: () => void;
  onRestart: () => void;
};

export class PauseOverlay {
  readonly container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, callbacks: PauseOverlayCallbacks) {
    const { usesTouchControls, onResume, onRestart } = callbacks;
    this.container = scene.add.container(0, 0).setDepth(79).setVisible(false);

    const overlayBg = scene.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.background, 0.55)
      .setInteractive();

    const pausedText = scene.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2 - 72,
        'PAUSED',
        displayTextStyle({
          color: THEME.textPrimary,
          fontSize: '58px',
          fontStyle: '700',
        }),
      )
      .setOrigin(0.5);

    const restartY = usesTouchControls ? GAME_HEIGHT / 2 + 72 : GAME_HEIGHT / 2 + 24;
    const restartButton = createCyanButton(scene, GAME_WIDTH / 2, restartY, 'RESTART');
    restartButton.on('pointerdown', onRestart);

    let resumeButton: Phaser.GameObjects.Text | undefined;
    if (usesTouchControls) {
      resumeButton = createCyanButton(scene, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 4, 'RESUME');
      resumeButton.on('pointerdown', onResume);
    }

    const resumeHintY = usesTouchControls ? GAME_HEIGHT / 2 + 140 : GAME_HEIGHT / 2 + 108;
    const resumeHint = scene.add
      .text(
        GAME_WIDTH / 2,
        resumeHintY,
        usesTouchControls ? 'Tap RESUME to continue' : 'ESC to resume',
        textStyle({
          color: THEME.textMuted,
          fontSize: '18px',
        }),
      )
      .setOrigin(0.5);

    this.container.add([
      overlayBg,
      pausedText,
      ...(resumeButton ? [resumeButton] : []),
      restartButton,
      resumeHint,
    ]);
  }

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }
}
