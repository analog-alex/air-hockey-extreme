import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants/gameplay';
import { isTouchFirstDevice } from './device';

export const RENDER_SCALE = isTouchFirstDevice()
  ? 1
  : Math.min(2, Math.max(1, window.devicePixelRatio || 1));

export function applyRenderScale(scene: Phaser.Scene): void {
  const configureCamera = (): void => {
    const scrollX = -GAME_WIDTH * (RENDER_SCALE - 1) / 2;
    const scrollY = -GAME_HEIGHT * (RENDER_SCALE - 1) / 2;

    scene.cameras.main
      .setViewport(0, 0, GAME_WIDTH * RENDER_SCALE, GAME_HEIGHT * RENDER_SCALE)
      .setZoom(RENDER_SCALE)
      .setScroll(scrollX, scrollY);
  };

  configureCamera();
  scene.events.on(Phaser.Scenes.Events.PRE_RENDER, configureCamera);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.events.off(Phaser.Scenes.Events.PRE_RENDER, configureCamera);
  });
}
