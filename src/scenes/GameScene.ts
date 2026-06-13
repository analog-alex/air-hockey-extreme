import Phaser from 'phaser';
import { COLORS } from '../constants/colors';
import { GAME_HEIGHT, GAME_WIDTH, GAMEPLAY, RINK, TABLE } from '../constants/gameplay';
import { Paddle } from '../objects/Paddle';
import { Puck } from '../objects/Puck';
import { Table } from '../objects/Table';
import { CpuController } from '../systems/CpuController';
import { InputSystem } from '../systems/InputSystem';
import { ScoreSystem, ScoringSide } from '../systems/ScoreSystem';
import { displayTextStyle, textStyle } from '../ui/text';
import { isTouchFirstDevice } from '../utils/device';
import { applyRenderScale } from '../utils/renderScale';

export class GameScene extends Phaser.Scene {
  private player!: Paddle;
  private cpu!: Paddle;
  private puck!: Puck;
  private inputSystem!: InputSystem;
  private cpuController!: CpuController;
  private score = new ScoreSystem();
  private scoreText!: Phaser.GameObjects.Text;
  private boostStaminaFill!: Phaser.GameObjects.Rectangle;
  private boostStaminaStatus!: Phaser.GameObjects.Text;
  private pauseOverlay!: Phaser.GameObjects.Container;
  private table!: Table;
  private isPaused = false;
  private isResetting = false;
  private tiltCooldown = 0;
  private boostStamina = 1;
  private isBoosting = false;
  private boostExhausted = false;
  private readonly usesTouchControls = isTouchFirstDevice();

  constructor() {
    super('GameScene');
  }

  create(): void {
    applyRenderScale(this);

    this.isPaused = false;
    this.isResetting = false;
    this.tiltCooldown = 0;
    this.boostStamina = 1;
    this.isBoosting = false;
    this.boostExhausted = false;
    this.matter.world.resume();

    this.score.reset();
    this.table = new Table(this);
    this.table.draw();
    this.createTableWalls();

    this.player = new Paddle(this, RINK.x + GAMEPLAY.paddleHomeInset, RINK.y + RINK.height / 2, 'player');
    this.cpu = new Paddle(
      this,
      RINK.x + RINK.width - GAMEPLAY.paddleHomeInset,
      RINK.y + RINK.height / 2,
      'cpu',
    );
    this.puck = new Puck(this);

    this.inputSystem = new InputSystem(this);
    this.cpuController = new CpuController(this.cpu, this.puck);

    this.scoreText = this.add
      .text(GAME_WIDTH / 2, 30, '0  :  0', displayTextStyle({
        color: '#f8fbff',
        fontSize: '34px',
        fontStyle: '700',
      }))
      .setOrigin(0.5)
      .setDepth(60);

    this.createControlsHint();

    this.add
      .text(58, 58, 'BOOST', textStyle({ color: '#d8f8ff', fontSize: '14px', fontStyle: 'bold' }))
      .setOrigin(0, 0.5)
      .setDepth(60);

    this.add.rectangle(120, 58, 224, 12, COLORS.darkPanel, 0.9)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, COLORS.dimWhite, 0.7)
      .setDepth(60);

    this.boostStaminaFill = this.add.rectangle(122, 58, 220, 8, COLORS.cyan, 1)
      .setOrigin(0, 0.5)
      .setDepth(61);

    this.boostStaminaStatus = this.add
      .text(354, 58, 'READY', textStyle({ color: '#00e5ff', fontSize: '14px', fontStyle: 'bold' }))
      .setOrigin(0, 0.5)
      .setDepth(60);

    this.createPauseOverlay();
    if (this.usesTouchControls) {
      this.createTouchActionButtons();
    }

    const keyboard = this.input.keyboard;
    keyboard?.on('keydown-ESC', () => this.togglePause());
    keyboard?.on('keydown-T', () => this.tryTiltRink());
    this.puck.serve(Phaser.Math.RND.pick([1, -1]));
  }

  private createControlsHint(): void {
    const commands = this.usesTouchControls
      ? [
          { key: 'DRAG', action: 'MOVE', width: 124 },
          { key: 'FLICK', action: 'BOOST', width: 138 },
        ]
      : [
          { key: 'ESC', action: 'PAUSE', width: 116 },
          { key: 'T', action: 'TILT', width: 88 },
          { key: 'SPACE', action: 'BOOST', width: 148 },
        ];

    let x = 58;
    commands.forEach(({ key, action, width }) => {
      this.createCommandHint(x, 30, key, action);
      x += width;
    });
  }

  private createCommandHint(x: number, y: number, key: string, action: string): void {
    const keyWidth = Math.max(30, key.length * 10 + 16);
    const keycap = this.add.graphics().setDepth(60);

    keycap.fillStyle(COLORS.darkPanel, 0.94);
    keycap.fillRoundedRect(x, y - 12, keyWidth, 24, 5);
    keycap.lineStyle(1, COLORS.cyan, 0.82);
    keycap.strokeRoundedRect(x, y - 12, keyWidth, 24, 5);
    keycap.lineStyle(1, COLORS.lightCyan, 0.24);
    keycap.lineBetween(x + 6, y + 8, x + keyWidth - 6, y + 8);

    this.add
      .text(x + keyWidth / 2, y, key, textStyle({
        color: '#f8fbff',
        fontSize: '14px',
        fontStyle: 'bold',
        letterSpacing: 1,
        strokeThickness: 2,
      }))
      .setOrigin(0.5)
      .setDepth(61);

    this.add
      .text(x + keyWidth + 9, y, action, textStyle({
        color: '#9fb8c9',
        fontSize: '14px',
        fontStyle: 'bold',
        letterSpacing: 1,
        strokeThickness: 2,
      }))
      .setOrigin(0, 0.5)
      .setDepth(60);
  }

  update(_time: number, delta: number): void {
    const deltaSeconds = delta / 1000;
    this.tiltCooldown = Math.max(0, this.tiltCooldown - deltaSeconds);

    if (this.isPaused || this.isResetting) {
      return;
    }

    this.updateBoost(deltaSeconds);
    const playerSpeed = GAMEPLAY.playerSpeed * (
      this.isBoosting ? GAMEPLAY.playerBoostSpeedMultiplier : 1
    );
    this.inputSystem.updatePlayer(this.player, playerSpeed);
    this.cpuController.update(deltaSeconds);
    this.player.constrainToHalf();
    this.cpu.constrainToHalf();
    this.tryHitPaddle(this.player, 1);
    this.tryHitPaddle(this.cpu, -1);

    const scorer = this.puck.handleTableWalls();
    if (scorer) {
      this.handleGoal(scorer);
      return;
    }

    this.puck.updateMotion(deltaSeconds);
    this.paintTrail();
  }

  private hitPaddle(paddle: Paddle, toward: 1 | -1): void {
    if (this.isResetting) {
      return;
    }

    const velocity = this.puck.getVelocity();
    if ((toward === -1 && velocity.x <= 0) || (toward === 1 && velocity.x >= 0)) {
      return;
    }

    const boostedPlayerHit = paddle === this.player && this.isBoosting;
    this.puck.bounceFromPaddle(paddle, toward, boostedPlayerHit);
    if (paddle === this.cpu) {
      this.cpuController.onPuckHit();
    }
    this.cameras.main.shake(70, 0.002);
    this.flashAt(this.puck.x, this.puck.y);
  }

  private tryHitPaddle(paddle: Paddle, toward: 1 | -1): void {
    const distance = Phaser.Math.Distance.Between(this.puck.x, this.puck.y, paddle.x, paddle.y);
    if (distance > GAMEPLAY.paddleRadius + GAMEPLAY.puckRadius) {
      return;
    }

    this.hitPaddle(paddle, toward);
  }

  private handleGoal(side: ScoringSide): void {
    this.isResetting = true;
    this.puck.stop();
    this.puck.setPosition(RINK.x + RINK.width / 2, RINK.y + RINK.height / 2);
    this.player.resetToHome();
    this.cpu.resetToHome();
    this.cpuController.resetAfterGoal();
    this.inputSystem.cancelTouch();
    this.refillBoostStamina();

    const matchOver = this.score.addPoint(side);
    this.updateScoreText();
    this.table.pulseGoal(side === 'player' ? 'right' : 'left');
    this.cameras.main.shake(180, 0.005);

    if (matchOver) {
      this.time.delayedCall(650, () => {
        this.scene.start('GameOverScene', {
          winner: side,
          playerScore: this.score.player,
          cpuScore: this.score.cpu,
        });
      });
      return;
    }

    this.time.delayedCall(720, () => {
      this.isResetting = false;
      this.puck.serve(side === 'player' ? -1 : 1);
    });
  }

  private updateScoreText(): void {
    this.scoreText.setText(`${this.score.player}  :  ${this.score.cpu}`);
  }

  private createPauseOverlay(): void {
    this.pauseOverlay = this.add.container(0, 0).setDepth(79).setVisible(false);

    const overlayBg = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.background, 0.55)
      .setInteractive();

    const pausedText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 72, 'PAUSED', displayTextStyle({
        color: '#f8fbff',
        fontSize: '58px',
        fontStyle: '700',
      }))
      .setOrigin(0.5);

    const restartY = this.usesTouchControls ? GAME_HEIGHT / 2 + 72 : GAME_HEIGHT / 2 + 24;
    const restartButton = this.makePauseButton(GAME_WIDTH / 2, restartY, 'RESTART');
    restartButton.on('pointerdown', () => this.restartFromPause());

    let resumeButton: Phaser.GameObjects.Text | undefined;
    if (this.usesTouchControls) {
      resumeButton = this.makePauseButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 4, 'RESUME');
      resumeButton.on('pointerdown', () => this.togglePause());
    }

    const resumeHintY = this.usesTouchControls ? GAME_HEIGHT / 2 + 140 : GAME_HEIGHT / 2 + 108;
    const resumeHint = this.add
      .text(
        GAME_WIDTH / 2,
        resumeHintY,
        this.usesTouchControls ? 'Tap RESUME to continue' : 'ESC to resume',
        textStyle({
          color: '#9fb8c9',
          fontSize: '18px',
        }),
      )
      .setOrigin(0.5);

    this.pauseOverlay.add([
      overlayBg,
      pausedText,
      ...(resumeButton ? [resumeButton] : []),
      restartButton,
      resumeHint,
    ]);
  }

  private makePauseButton(x: number, y: number, label: string): Phaser.GameObjects.Text {
    const button = this.add
      .text(x, y, label, displayTextStyle({
        color: '#030509',
        backgroundColor: '#00e5ff',
        fontSize: '25px',
        fontStyle: '700',
        padding: { x: 28, y: 12 },
        shadow: {
          color: 'transparent',
          blur: 0,
          fill: false,
          offsetX: 0,
          offsetY: 0,
          stroke: false,
        },
        strokeThickness: 0,
      }))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on('pointerover', () => button.setStyle({ backgroundColor: '#f8fbff' }));
    button.on('pointerout', () => button.setStyle({ backgroundColor: '#00e5ff' }));

    return button;
  }

  private restartFromPause(): void {
    this.isPaused = false;
    this.isResetting = false;
    this.pauseOverlay.setVisible(false);
    this.matter.world.resume();
    this.scene.restart();
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;
    this.pauseOverlay.setVisible(this.isPaused);

    if (this.isPaused) {
      this.inputSystem.cancelTouch();
      this.matter.world.pause();
      return;
    }

    this.matter.world.resume();
  }

  private tryTiltRink(): void {
    if (this.isPaused || this.isResetting || this.tiltCooldown > 0) {
      return;
    }

    const puckInCpuHalf = this.puck.x > GAMEPLAY.cpuHalfMinX;
    const puckIsSlow = this.puck.getGameplaySpeed() <= GAMEPLAY.tiltEligibleMaxSpeed;

    if (!puckInCpuHalf || !puckIsSlow) {
      return;
    }

    this.puck.tiltTowardPlayer();
    this.tiltCooldown = GAMEPLAY.tiltCooldownSeconds;
    this.cameras.main.shake(90, 0.003);
  }

  private updateBoost(deltaSeconds: number): void {
    const boostDown = this.inputSystem.isBoostRequested();
    const isMoving = this.inputSystem.hasMovementInput();

    if (!boostDown) {
      this.boostExhausted = false;
      this.boostStamina = Math.min(
        1,
        this.boostStamina + deltaSeconds / GAMEPLAY.playerBoostRechargeSeconds,
      );
    }

    this.isBoosting = boostDown && isMoving && this.boostStamina > 0 && !this.boostExhausted;

    if (this.isBoosting) {
      this.boostStamina = Math.max(
        0,
        this.boostStamina - deltaSeconds / GAMEPLAY.playerBoostDrainSeconds,
      );
      if (this.boostStamina === 0) {
        this.boostExhausted = true;
      }
    }

    this.updateBoostHud();
  }

  private refillBoostStamina(): void {
    this.boostStamina = 1;
    this.isBoosting = false;
    this.boostExhausted = false;
    if (this.boostStaminaFill) {
      this.updateBoostHud();
    }
  }

  private updateBoostHud(): void {
    this.boostStaminaFill.width = 220 * this.boostStamina;
    const lowStaminaRatio = Phaser.Math.Clamp(this.boostStamina / 0.3, 0, 1);
    const red = Math.round(Phaser.Math.Linear(255, 0, lowStaminaRatio));
    const green = Math.round(Phaser.Math.Linear(59, 229, lowStaminaRatio));
    const blue = Math.round(Phaser.Math.Linear(104, 255, lowStaminaRatio));
    const color = Phaser.Display.Color.GetColor(red, green, blue);
    this.boostStaminaFill.setFillStyle(color, 1);

    if (this.boostExhausted) {
      this.boostStaminaStatus.setText('EXHAUSTED').setColor('#ff3b68');
    } else if (this.isBoosting) {
      this.boostStaminaStatus.setText('BOOSTING').setColor('#00e5ff');
    } else if (this.boostStamina >= 1) {
      this.boostStaminaStatus.setText('READY').setColor('#00e5ff');
    } else {
      this.boostStaminaStatus.setText(`${Math.ceil(this.boostStamina * 100)}%`).setColor('#9fb8c9');
    }
  }

  private createTableWalls(): void {
    const thickness = 80;
    const wallOptions: Phaser.Types.Physics.Matter.MatterBodyConfig = {
      isStatic: true,
      friction: 0,
      frictionStatic: 0,
      restitution: 1,
    };
    const goalGap = TABLE.goalWidth;
    const sideSegmentHeight = (RINK.height - goalGap) / 2;
    const sideYInset = sideSegmentHeight / 2;
    const leftX = RINK.x - thickness / 2;
    const rightX = RINK.x + RINK.width + thickness / 2;
    const topY = RINK.y - thickness / 2;
    const bottomY = RINK.y + RINK.height + thickness / 2;

    this.matter.add.rectangle(
      RINK.x + RINK.width / 2,
      topY,
      RINK.width + thickness * 2,
      thickness,
      wallOptions,
    );
    this.matter.add.rectangle(
      RINK.x + RINK.width / 2,
      bottomY,
      RINK.width + thickness * 2,
      thickness,
      wallOptions,
    );
    this.matter.add.rectangle(leftX, RINK.y + sideYInset, thickness, sideSegmentHeight, wallOptions);
    this.matter.add.rectangle(
      leftX,
      RINK.y + RINK.height - sideYInset,
      thickness,
      sideSegmentHeight,
      wallOptions,
    );
    this.matter.add.rectangle(rightX, RINK.y + sideYInset, thickness, sideSegmentHeight, wallOptions);
    this.matter.add.rectangle(
      rightX,
      RINK.y + RINK.height - sideYInset,
      thickness,
      sideSegmentHeight,
      wallOptions,
    );
  }

  private createTouchActionButtons(): void {
    const tilt = this.makeTouchActionButton(1002, 30, 'TILT');
    const pause = this.makeTouchActionButton(1120, 30, 'PAUSE');

    tilt.on(
      'pointerdown',
      (
        _pointer: Phaser.Input.Pointer,
        _x: number,
        _y: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        this.tryTiltRink();
      },
    );
    pause.on(
      'pointerdown',
      (
        _pointer: Phaser.Input.Pointer,
        _x: number,
        _y: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        this.togglePause();
      },
    );
  }

  private makeTouchActionButton(x: number, y: number, label: string): Phaser.GameObjects.Text {
    return this.add
      .text(x, y, label, textStyle({
        color: '#030509',
        backgroundColor: '#00e5ff',
        fontSize: '18px',
        fontStyle: 'bold',
        padding: { x: 20, y: 10 },
      }))
      .setOrigin(0.5)
      .setDepth(70)
      .setInteractive();
  }

  private paintTrail(): void {
    const trail = this.add
      .circle(this.puck.x, this.puck.y, GAMEPLAY.puckRadius * 0.78, COLORS.red, 0.34)
      .setDepth(8);

    this.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 0.3,
      duration: 190,
      onComplete: () => trail.destroy(),
    });
  }

  private flashAt(x: number, y: number): void {
    const flash = this.add.circle(x, y, 34, COLORS.white, 0.42).setDepth(35);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.9,
      duration: 140,
      ease: 'Sine.easeOut',
      onComplete: () => flash.destroy(),
    });
  }

  shutdown(): void {
    // Remove persistent keyboard handlers to prevent accumulation across restarts
    // (other scenes use .once() which self-cleans; InputSystem manages its own cursors/keys).
    const keyboard = this.input.keyboard;
    keyboard?.off('keydown-ESC');
    keyboard?.off('keydown-T');
    this.inputSystem?.destroy();

    // Ensure Matter world is resumed so a fresh scene (or other scenes) is never left paused.
    this.matter?.world?.resume();
  }
}
