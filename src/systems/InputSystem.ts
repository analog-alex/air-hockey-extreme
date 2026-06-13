import Phaser from 'phaser';
import { Paddle } from '../objects/Paddle';

export class InputSystem {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private boostKey: Phaser.Input.Keyboard.Key;

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
    this.boostKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  updatePlayer(paddle: Paddle, speed: number): void {
    const { x, y } = this.getInputVector();
    const length = Math.hypot(x, y);

    if (length === 0) {
      paddle.stop();
      return;
    }

    paddle.move(
      (x / length) * speed,
      (y / length) * speed,
    );
  }

  hasMovementInput(): boolean {
    const { x, y } = this.getInputVector();
    return x !== 0 || y !== 0;
  }

  isBoostDown(): boolean {
    return this.boostKey.isDown;
  }

  private getInputVector(): Phaser.Types.Math.Vector2Like {
    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const up = this.cursors.up.isDown || this.keys.W.isDown;
    const down = this.cursors.down.isDown || this.keys.S.isDown;

    return {
      x: Number(right) - Number(left),
      y: Number(down) - Number(up),
    };
  }
}
