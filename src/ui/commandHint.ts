import Phaser from 'phaser';
import { COLORS } from '../constants/colors';
import { THEME } from '../constants/theme';
import { textStyle } from './text';

type CommandHint = {
  key: string;
  action: string;
  width: number;
};

const TOUCH_COMMANDS: CommandHint[] = [
  { key: 'DRAG', action: 'MOVE', width: 124 },
  { key: 'FLICK', action: 'BOOST', width: 138 },
];

const KEYBOARD_COMMANDS: CommandHint[] = [
  { key: 'ESC', action: 'PAUSE', width: 116 },
  { key: 'T', action: 'TILT', width: 88 },
  { key: 'SPACE', action: 'BOOST', width: 148 },
];

function createCommandHint(scene: Phaser.Scene, x: number, y: number, key: string, action: string): void {
  const keyWidth = Math.max(30, key.length * 10 + 16);
  const keycap = scene.add.graphics().setDepth(60);

  keycap.fillStyle(COLORS.darkPanel, 0.94);
  keycap.fillRoundedRect(x, y - 12, keyWidth, 24, 5);
  keycap.lineStyle(1, COLORS.cyan, 0.82);
  keycap.strokeRoundedRect(x, y - 12, keyWidth, 24, 5);
  keycap.lineStyle(1, COLORS.lightCyan, 0.24);
  keycap.lineBetween(x + 6, y + 8, x + keyWidth - 6, y + 8);

  scene.add
    .text(x + keyWidth / 2, y, key, textStyle({
      color: THEME.textPrimary,
      fontSize: '14px',
      fontStyle: 'bold',
      letterSpacing: 1,
      strokeThickness: 2,
    }))
    .setOrigin(0.5)
    .setDepth(61);

  scene.add
    .text(x + keyWidth + 9, y, action, textStyle({
      color: THEME.textMuted,
      fontSize: '14px',
      fontStyle: 'bold',
      letterSpacing: 1,
      strokeThickness: 2,
    }))
    .setOrigin(0, 0.5)
    .setDepth(60);
}

export function createControlsHint(scene: Phaser.Scene, usesTouchControls: boolean): void {
  const commands = usesTouchControls ? TOUCH_COMMANDS : KEYBOARD_COMMANDS;
  let x = 58;

  commands.forEach(({ key, action, width }) => {
    createCommandHint(scene, x, 30, key, action);
    x += width;
  });
}