import Phaser from 'phaser';
import { COLORS } from '../constants/colors';
import { GAME_WIDTH, GAMEPLAY, RINK } from '../constants/gameplay';
import { THEME } from '../constants/theme';
import { Paddle } from '../objects/Paddle';
import { Puck } from '../objects/Puck';
import { Table } from '../objects/Table';
import { CpuController } from '../systems/CpuController';
import { InputSystem } from '../systems/InputSystem';
import { ScoreSystem, type ScoringSide } from '../systems/ScoreSystem';
import { BoostHud } from '../ui/BoostHud';
import { createControlsHint } from '../ui/commandHint';
import { PauseOverlay } from '../ui/PauseOverlay';
import { createTouchActionBar } from '../ui/TouchActionBar';
import { displayTextStyle } from '../ui/text';
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
  private boostHud!: BoostHud;
  private pauseOverlay!: PauseOverlay;
  private table!: Table;
  private isPaused = false;
  private isResetting = false;
  private tiltCooldown = 0;
  private readonly usesTouchControls = isTouchFirstDevice();

  constructor() {
    super('GameScene');
  }

  create(): void {
    applyRenderScale(this);

    this.isPaused = false;
    this.isResetting = false;
    this.tiltCooldown = 0;
    this.matter.world.resume();

    this.score.reset();
    this.table = new Table(this);
    this.table.draw();
    this.table.createWalls();

    this.player = new Paddle(
      this,
      RINK.x + GAMEPLAY.paddleHomeInset,
      RINK.y + RINK.height / 2,
      'player',
    );
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
      .text(
        GAME_WIDTH / 2,
        30,
        '0  :  0',
        displayTextStyle({
          color: THEME.textPrimary,
          fontSize: '34px',
          fontStyle: '700',
        }),
      )
      .setOrigin(0.5)
      .setDepth(60);

    createControlsHint(this, this.usesTouchControls);
    this.boostHud = new BoostHud(this);

    this.pauseOverlay = new PauseOverlay(this, {
      usesTouchControls: this.usesTouchControls,
      onResume: () => this.togglePause(),
      onRestart: () => this.restartFromPause(),
    });

    if (this.usesTouchControls) {
      createTouchActionBar(this, {
        onTilt: () => this.tryTiltRink(),
        onPause: () => this.togglePause(),
      });
    }

    const keyboard = this.input.keyboard;
    keyboard?.on('keydown-ESC', () => this.togglePause());
    keyboard?.on('keydown-T', () => this.tryTiltRink());
    this.puck.serve(Phaser.Math.RND.pick([1, -1]));
  }

  update(_time: number, delta: number): void {
    const deltaSeconds = delta / 1000;
    this.tiltCooldown = Math.max(0, this.tiltCooldown - deltaSeconds);

    if (this.isPaused || this.isResetting) {
      return;
    }

    this.boostHud.update(
      deltaSeconds,
      this.inputSystem.isBoostRequested(),
      this.inputSystem.hasMovementInput(),
    );

    const playerSpeed =
      GAMEPLAY.playerSpeed * (this.boostHud.boosting ? GAMEPLAY.playerBoostSpeedMultiplier : 1);
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

    const boostedPlayerHit = paddle === this.player && this.boostHud.boosting;
    this.puck.bounceFromPaddle(paddle, toward, boostedPlayerHit);
    if (paddle === this.cpu) {
      this.cpuController.onPuckHit();
    }
    this.cameras.main.shake(70, 0.002);
    this.flashAt(this.puck.x, this.puck.y);
  }

  // Distance-based hit test keeps paddle bounce angles predictable; Matter collision
  // events would fight the custom puck momentum logic in Puck.bounceFromPaddle.
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
    this.boostHud.refill();

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
