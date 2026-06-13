import type Phaser from 'phaser';
import { createCyanButton } from './cyanButton';

export type TouchActionBarCallbacks = {
  onTilt: () => void;
  onPause: () => void;
};

export function createTouchActionBar(
  scene: Phaser.Scene,
  callbacks: TouchActionBarCallbacks,
): void {
  const tilt = createCyanButton(scene, 1002, 30, 'TILT', {
    fontSize: '18px',
    padding: { x: 20, y: 10 },
    depth: 70,
    displayFont: false,
    useHandCursor: false,
    hover: false,
  });
  const pause = createCyanButton(scene, 1120, 30, 'PAUSE', {
    fontSize: '18px',
    padding: { x: 20, y: 10 },
    depth: 70,
    displayFont: false,
    useHandCursor: false,
    hover: false,
  });

  const stopPropagation = (
    _pointer: Phaser.Input.Pointer,
    _x: number,
    _y: number,
    event: Phaser.Types.Input.EventData,
  ) => {
    event.stopPropagation();
  };

  tilt.on('pointerdown', stopPropagation);
  tilt.on('pointerdown', callbacks.onTilt);
  pause.on('pointerdown', stopPropagation);
  pause.on('pointerdown', callbacks.onPause);
}
