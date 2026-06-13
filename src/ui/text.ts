import Phaser from 'phaser';
import { THEME } from '../constants/theme';

export const DISPLAY_FONT = '"Oxanium", sans-serif';
export const UI_FONT = '"Rajdhani", sans-serif';
const TEXT_RESOLUTION = Math.min(3, Math.max(2, window.devicePixelRatio || 1));

export function textStyle(
  style: Phaser.Types.GameObjects.Text.TextStyle,
): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: UI_FONT,
    resolution: TEXT_RESOLUTION,
    shadow: {
      color: THEME.background,
      blur: 2,
      fill: true,
      offsetX: 1,
      offsetY: 1,
      stroke: true,
    },
    stroke: THEME.background,
    strokeThickness: 3,
    ...style,
  };
}

export function displayTextStyle(
  style: Phaser.Types.GameObjects.Text.TextStyle,
): Phaser.Types.GameObjects.Text.TextStyle {
  return textStyle({
    fontFamily: DISPLAY_FONT,
    ...style,
  });
}
