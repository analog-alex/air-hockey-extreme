import Phaser from 'phaser';
import { THEME } from '../constants/theme';
import { displayTextStyle, textStyle } from './text';

export type CyanButtonOptions = {
  fontSize?: string;
  padding?: { x: number; y: number };
  depth?: number;
  useHandCursor?: boolean;
  hover?: boolean;
  displayFont?: boolean;
};

export function createCyanButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  options: CyanButtonOptions = {},
): Phaser.GameObjects.Text {
  const {
    fontSize = '25px',
    padding = { x: 28, y: 12 },
    depth,
    useHandCursor = true,
    hover = true,
    displayFont = true,
  } = options;

  const styleFn = displayFont ? displayTextStyle : textStyle;
  const button = scene.add
    .text(x, y, label, styleFn({
      color: THEME.buttonText,
      backgroundColor: THEME.buttonBg,
      fontSize,
      fontStyle: displayFont ? '700' : 'bold',
      padding,
      shadow: {
        color: 'transparent',
        blur: 0,
        fill: false,
        offsetX: 0,
        offsetY: 0,
        stroke: false,
      },
      strokeThickness: displayFont ? 0 : undefined,
    }))
    .setOrigin(0.5)
    .setInteractive({ useHandCursor });

  if (depth !== undefined) {
    button.setDepth(depth);
  }

  if (hover) {
    button.on('pointerover', () => button.setStyle({ backgroundColor: THEME.buttonHover }));
    button.on('pointerout', () => button.setStyle({ backgroundColor: THEME.buttonBg }));
  }

  return button;
}