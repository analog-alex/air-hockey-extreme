import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants/gameplay';
import { BootScene } from '../scenes/BootScene';
import { GameOverScene } from '../scenes/GameOverScene';
import { GameScene } from '../scenes/GameScene';
import { MenuScene } from '../scenes/MenuScene';
import { PreloadScene } from '../scenes/PreloadScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#030509',
  render: {
    antialias: true,
    roundPixels: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoRound: true,
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 0 },
      positionIterations: 8,
      velocityIterations: 6,
      enableSleeping: false,
      debug: false,
    },
  },
  scene: [BootScene, PreloadScene, MenuScene, GameScene, GameOverScene],
};
