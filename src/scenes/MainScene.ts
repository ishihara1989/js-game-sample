import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  // UI要素
  private titleText!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Rectangle;
  private startText!: Phaser.GameObjects.Text;

  constructor() {
    super('MainScene');
  }

  preload(): void {
    // アセットのロード
    // this.load.image('player', 'assets/player.png');
    // this.load.image('enemy', 'assets/enemy.png');
  }

  create(): void {
    // 背景
    this.createBackground();

    // タイトルテキスト
    this.titleText = this.add.text(this.cameras.main.centerX, 100, 'オートバトルRPG', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
    });
    this.titleText.setOrigin(0.5);

    // サブタイトル
    const subTitleText = this.add.text(
      this.cameras.main.centerX,
      160,
      '- Phaser TypeScript Edition -',
      {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#cccccc',
      }
    );
    subTitleText.setOrigin(0.5);

    // バトル開始ボタン
    this.createStartButton();

    // バージョン情報
    const versionText = this.add.text(
      this.cameras.main.width - 10,
      this.cameras.main.height - 10,
      'ver 0.1.0',
      {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#999999',
      }
    );
    versionText.setOrigin(1, 1);

    // アニメーション
    this.addAnimations();
  }

  private createBackground(): void {
    // 背景グラデーション（簡易版）
    const bgTop = this.add.rectangle(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height / 2,
      0x001133
    );
    const bgBottom = this.add.rectangle(
      0,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height / 2,
      0x002244
    );
    bgTop.setOrigin(0, 0);
    bgBottom.setOrigin(0, 0);

    // 装飾用の粒子効果（星のような点）
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, this.cameras.main.width);
      const y = Phaser.Math.Between(0, this.cameras.main.height);
      const size = Phaser.Math.FloatBetween(1, 3);
      const alpha = Phaser.Math.FloatBetween(0.3, 0.8);

      const star = this.add.circle(x, y, size, 0xffffff, alpha);

      // 星の点滅アニメーション
      this.tweens.add({
        targets: star,
        alpha: 0.2,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private createStartButton(): void {
    // ボタン背景
    this.startButton = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 100,
      200,
      60,
      0x0088ff,
      0.8
    );
    this.startButton.setInteractive({ useHandCursor: true });

    // ボタンテキスト
    this.startText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 100,
      'BATTLE START',
      {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff',
      }
    );
    this.startText.setOrigin(0.5);

    // ボタンイベント
    this.startButton.on('pointerdown', this.startBattle, this);

    // ボタンホバーエフェクト
    this.startButton.on('pointerover', () => {
      this.startButton.fillColor = 0x00aaff;
      this.startText.setScale(1.1);
    });

    this.startButton.on('pointerout', () => {
      this.startButton.fillColor = 0x0088ff;
      this.startText.setScale(1);
    });
  }

  private addAnimations(): void {
    // タイトルのアニメーション
    this.tweens.add({
      targets: this.titleText,
      y: 110,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // ボタンのアニメーション
    this.tweens.add({
      targets: [this.startButton, this.startText],
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 装飾エフェクト（輪）
    const ring = this.add.circle(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 100,
      120,
      0x0088ff,
      0.2
    );

    this.tweens.add({
      targets: ring,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 2000,
      repeat: -1,
      ease: 'Sine.easeOut',
    });
  }

  private startBattle(): void {
    // バトルシーンに遷移
    this.scene.start('BattleScene');
  }
}
