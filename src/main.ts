import Phaser from 'phaser';
import './styles/index.css';
import { gameConfig } from './config/gameConfig';

async function startGame(): Promise<void> {
  await Promise.all([
    document.fonts.load('800 78px Oxanium'),
    document.fonts.load('700 42px Oxanium'),
    document.fonts.load('400 16px Rajdhani'),
    document.fonts.load('600 16px Rajdhani'),
    document.fonts.load('700 24px Rajdhani'),
  ]);

  new Phaser.Game(gameConfig);
}

void startGame();
