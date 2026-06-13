import Phaser from 'phaser';
import { GAMEPLAY, RINK } from '../constants/gameplay';
import type { Paddle } from '../objects/Paddle';
import { isTouchFirstDevice } from '../utils/device';

export class InputSystem {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys?: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private boostKey?: Phaser.Input.Keyboard.Key;
  private activeTouchId: number | null = null;
  private touchTarget = new Phaser.Math.Vector2();
  private previousTouch = new Phaser.Math.Vector2();
  private previousTouchTime = 0;
  private smoothedTouchSpeed = 0;
  private lastTouchSampleTime = 0;
  private player?: Paddle;
  readonly usesTouchControls = isTouchFirstDevice();

  private readonly handlePointerDown = (pointer: Phaser.Input.Pointer): void => {
    if (!this.usesTouchControls || !pointer.wasTouch || this.activeTouchId !== null) {
      return;
    }

    const { worldX, worldY } = pointer;
    if (
      worldX < RINK.x ||
      worldX > GAMEPLAY.playerHalfMaxX ||
      worldY < RINK.y ||
      worldY > RINK.y + RINK.height
    ) {
      return;
    }

    this.activeTouchId = pointer.id;
    this.setTouchTarget(worldX, worldY);
    this.previousTouch.set(this.touchTarget.x, this.touchTarget.y);
    this.previousTouchTime = this.scene.time.now;
    this.lastTouchSampleTime = 0;
    this.smoothedTouchSpeed = 0;
  };

  private readonly handlePointerMove = (pointer: Phaser.Input.Pointer): void => {
    if (pointer.id !== this.activeTouchId) {
      return;
    }

    this.setTouchTarget(pointer.worldX, pointer.worldY);
    const now = this.scene.time.now;
    const elapsed = Phaser.Math.Clamp(
      (now - this.previousTouchTime) / 1000,
      GAMEPLAY.touchMinSampleSeconds,
      GAMEPLAY.touchMaxSampleSeconds,
    );
    const distance = Phaser.Math.Distance.Between(
      this.previousTouch.x,
      this.previousTouch.y,
      this.touchTarget.x,
      this.touchTarget.y,
    );
    const sampleSpeed = distance / elapsed;

    this.smoothedTouchSpeed = Phaser.Math.Linear(
      this.smoothedTouchSpeed,
      sampleSpeed,
      GAMEPLAY.touchVelocitySmoothing,
    );
    this.previousTouch.set(this.touchTarget.x, this.touchTarget.y);
    this.previousTouchTime = now;
    this.lastTouchSampleTime = now;
  };

  private readonly handlePointerUp = (pointer: Phaser.Input.Pointer): void => {
    if (pointer.id === this.activeTouchId) {
      this.cancelTouch();
    }
  };

  private readonly handleWindowBlur = (): void => this.cancelTouch();

  constructor(private readonly scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    if (keyboard) {
      this.cursors = keyboard.createCursorKeys();
      this.keys = keyboard.addKeys('W,A,S,D') as Record<
        'W' | 'A' | 'S' | 'D',
        Phaser.Input.Keyboard.Key
      >;
      this.boostKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    if (this.usesTouchControls) {
      scene.input.on('pointerdown', this.handlePointerDown);
      scene.input.on('pointermove', this.handlePointerMove);
      scene.input.on('pointerup', this.handlePointerUp);
      scene.input.on('pointerupoutside', this.handlePointerUp);
      window.addEventListener('blur', this.handleWindowBlur);
    }
  }

  updatePlayer(paddle: Paddle, speed: number): void {
    this.player = paddle;

    if (this.activeTouchId !== null) {
      this.updatePlayerFromTouch(paddle, speed);
      return;
    }

    const { x, y } = this.getInputVector();
    const length = Math.hypot(x, y);

    if (length === 0) {
      paddle.stop();
      return;
    }

    paddle.move((x / length) * speed, (y / length) * speed);
  }

  hasMovementInput(): boolean {
    if (this.activeTouchId !== null && this.player) {
      return (
        Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          this.touchTarget.x,
          this.touchTarget.y,
        ) > GAMEPLAY.touchDeadZone
      );
    }

    const { x, y } = this.getInputVector();
    return x !== 0 || y !== 0;
  }

  isBoostRequested(): boolean {
    const keyboardBoost = this.boostKey?.isDown ?? false;
    const touchSampleIsFresh =
      this.lastTouchSampleTime > 0 &&
      this.scene.time.now - this.lastTouchSampleTime <= GAMEPLAY.touchVelocitySampleMaxAgeMs;
    const touchBoost =
      this.activeTouchId !== null &&
      touchSampleIsFresh &&
      this.smoothedTouchSpeed >= GAMEPLAY.touchBoostVelocityThreshold;

    return keyboardBoost || touchBoost;
  }

  cancelTouch(): void {
    this.activeTouchId = null;
    this.smoothedTouchSpeed = 0;
    this.lastTouchSampleTime = 0;
    this.player?.stop();
  }

  destroy(): void {
    this.cancelTouch();
    this.scene.input.off('pointerdown', this.handlePointerDown);
    this.scene.input.off('pointermove', this.handlePointerMove);
    this.scene.input.off('pointerup', this.handlePointerUp);
    this.scene.input.off('pointerupoutside', this.handlePointerUp);
    window.removeEventListener('blur', this.handleWindowBlur);
  }

  private getInputVector(): Phaser.Types.Math.Vector2Like {
    const left = this.cursors?.left.isDown || this.keys?.A.isDown || false;
    const right = this.cursors?.right.isDown || this.keys?.D.isDown || false;
    const up = this.cursors?.up.isDown || this.keys?.W.isDown || false;
    const down = this.cursors?.down.isDown || this.keys?.S.isDown || false;

    return {
      x: Number(right) - Number(left),
      y: Number(down) - Number(up),
    };
  }

  private updatePlayerFromTouch(paddle: Paddle, speed: number): void {
    const dx = this.touchTarget.x - paddle.x;
    const dy = this.touchTarget.y - paddle.y;
    const distance = Math.hypot(dx, dy);

    if (distance <= GAMEPLAY.touchDeadZone) {
      paddle.stop();
      return;
    }

    paddle.move((dx / distance) * speed, (dy / distance) * speed);
  }

  private setTouchTarget(x: number, y: number): void {
    this.touchTarget.set(
      Phaser.Math.Clamp(
        x,
        RINK.x + GAMEPLAY.paddleRadius,
        GAMEPLAY.playerHalfMaxX - GAMEPLAY.paddleRadius,
      ),
      Phaser.Math.Clamp(
        y,
        RINK.y + GAMEPLAY.paddleRadius,
        RINK.y + RINK.height - GAMEPLAY.paddleRadius,
      ),
    );
  }
}
