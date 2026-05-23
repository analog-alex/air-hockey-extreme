import Phaser from 'phaser';
import { COLORS } from '../constants/colors';
import { GAME_HEIGHT, GAME_WIDTH, GAMEPLAY, TABLE } from '../constants/gameplay';
import { Paddle } from '../objects/Paddle';
import { Puck } from '../objects/Puck';
import { Table } from '../objects/Table';
import { CpuController } from '../systems/CpuController';
import { InputSystem } from '../systems/InputSystem';
import { ScoreSystem, ScoringSide } from '../systems/ScoreSystem';
import { textStyle } from '../ui/text';

export class GameScene extends Phaser.Scene {
  private player!: Paddle;
  private cpu!: Paddle;
  private puck!: Puck;
  private inputSystem!: InputSystem;
  private cpuController!: CpuController;
  private score = new ScoreSystem();
  private scoreText!: Phaser.GameObjects.Text;
  private pausedText!: Phaser.GameObjects.Text;
  private table!: Table;
  private isPaused = false;
  private isResetting = false;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.score = new ScoreSystem();
    this.table = new Table(this);
    this.table.draw();
    this.createTableWalls();

    this.player = new Paddle(this, TABLE.x + 96, TABLE.y + TABLE.height / 2, 'player');
    this.cpu = new Paddle(this, TABLE.x + TABLE.width - 96, TABLE.y + TABLE.height / 2, 'cpu');
    this.puck = new Puck(this);

    this.inputSystem = new InputSystem(this);
    this.cpuController = new CpuController(this.cpu, this.puck);

    this.scoreText = this.add
      .text(GAME_WIDTH / 2, 30, '0  :  0', textStyle({
        color: '#f8fbff',
        fontSize: '34px',
        fontStyle: 'bold',
      }))
      .setOrigin(0.5)
      .setDepth(60);

    this.add
      .text(58, 30, 'ESC PAUSE   R RESTART', textStyle({
        color: '#9fb8c9',
        fontSize: '16px',
      }))
      .setOrigin(0, 0.5)
      .setDepth(60);

    this.pausedText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'PAUSED', textStyle({
        color: '#f8fbff',
        fontSize: '58px',
        fontStyle: 'bold',
      }))
      .setOrigin(0.5)
      .setDepth(80)
      .setVisible(false);

    const keyboard = this.input.keyboard;
    keyboard?.on('keydown-R', () => this.scene.restart());
    keyboard?.on('keydown-ESC', () => this.togglePause());

    this.puck.serve(Phaser.Math.RND.pick([1, -1]));
  }

  update(_time: number, delta: number): void {
    if (this.isPaused || this.isResetting) {
      return;
    }

    const deltaSeconds = delta / 1000;
    this.inputSystem.updatePlayer(this.player);
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

    this.puck.maintainSpeed();
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

    this.puck.bounceFromPaddle(paddle, toward);
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
    this.puck.setVelocity(0, 0);
    this.puck.setPosition(TABLE.x + TABLE.width / 2, TABLE.y + TABLE.height / 2);

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

  private togglePause(): void {
    this.isPaused = !this.isPaused;
    this.pausedText.setVisible(this.isPaused);

    if (this.isPaused) {
      this.matter.world.pause();
      return;
    }

    this.matter.world.resume();
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
    const sideSegmentHeight = (TABLE.height - goalGap) / 2;
    const sideYInset = sideSegmentHeight / 2;
    const leftX = TABLE.x - thickness / 2;
    const rightX = TABLE.x + TABLE.width + thickness / 2;
    const topY = TABLE.y - thickness / 2;
    const bottomY = TABLE.y + TABLE.height + thickness / 2;

    this.matter.add.rectangle(
      TABLE.x + TABLE.width / 2,
      topY,
      TABLE.width + thickness * 2,
      thickness,
      wallOptions,
    );
    this.matter.add.rectangle(
      TABLE.x + TABLE.width / 2,
      bottomY,
      TABLE.width + thickness * 2,
      thickness,
      wallOptions,
    );
    this.matter.add.rectangle(leftX, TABLE.y + sideYInset, thickness, sideSegmentHeight, wallOptions);
    this.matter.add.rectangle(
      leftX,
      TABLE.y + TABLE.height - sideYInset,
      thickness,
      sideSegmentHeight,
      wallOptions,
    );
    this.matter.add.rectangle(rightX, TABLE.y + sideYInset, thickness, sideSegmentHeight, wallOptions);
    this.matter.add.rectangle(
      rightX,
      TABLE.y + TABLE.height - sideYInset,
      thickness,
      sideSegmentHeight,
      wallOptions,
    );
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
}
