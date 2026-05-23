import Phaser from 'phaser';

export function textStyle(
  style: Phaser.Types.GameObjects.Text.TextStyle,
): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: 'monospace',
    resolution: Math.max(1, window.devicePixelRatio || 1),
    shadow: {
      color: '#030509',
      blur: 4,
      fill: true,
      offsetX: 2,
      offsetY: 2,
      stroke: true,
    },
    stroke: '#030509',
    strokeThickness: 4,
    ...style,
  };
}
