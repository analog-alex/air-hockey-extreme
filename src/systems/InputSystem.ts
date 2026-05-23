import Phaser from 'phaser';
import { GAMEPLAY } from '../constants/gameplay';
import { Paddle } from '../objects/Paddle';

export class InputSystem {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

  constructor(private readonly scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      throw new Error('Keyboard input is unavailable.');
    }

    this.cursors = keyboard.createCursorKeys();
    this.keys = keyboard.addKeys('W,A,S,D') as Record<
      'W' | 'A' | 'S' | 'D',
      Phaser.Input.Keyboard.Key
    >;
  }

  updatePlayer(paddle: Paddle): void {
    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const up = this.cursors.up.isDown || this.keys.W.isDown;
    const down = this.cursors.down.isDown || this.keys.S.isDown;
    const x = Number(right) - Number(left);
    const y = Number(down) - Number(up);
    const length = Math.hypot(x, y);

    if (length === 0) {
      paddle.stop();
      return;
    }

    paddle.move(
      (x / length) * GAMEPLAY.playerSpeed,
      (y / length) * GAMEPLAY.playerSpeed,
    );
  }
}
