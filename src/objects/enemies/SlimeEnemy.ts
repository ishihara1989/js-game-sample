import Phaser from 'phaser';
import { EnemyUnit } from '../EnemyUnit';
import { BattleScene } from '../../scenes/BattleScene';
import { Unit } from '../Unit';

export class SlimeEnemy extends EnemyUnit {
  // スライムの特殊ステータス
  private readonly defaultSpeed: number; // 元のスピード値を保存
  private isDashing: boolean = false;
  private dashCooldown: number = 0;
  private readonly dashCooldownMax: number = 3000; // 3秒
  private readonly dashDuration: number = 500; // 0.5秒
  private dashTimer: number = 0;
  private dashDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
  private readonly dashSpeedMultiplier: number = 2.5; // ダッシュ時のスピード倍率

  constructor(config: { scene: BattleScene; x: number; y: number; level: number }) {
    super({
      scene: config.scene,
      x: config.x,
      y: config.y,
      texture: 'slime', // テクスチャキー
      name: `Slime Lv.${config.level}`,
      level: config.level,
      baseHealth: 80, // スライムの基本HP
      baseAttack: 8, // スライムの基本攻撃力
      baseDefense: 5, // スライムの基本防御力
      baseSpeed: 90, // スライムの基本速度（高め）
      color: 0x00aaff, // 水色
    });

    // 元のスピードを保存
    this.defaultSpeed = this.speed;

    // 経験値とドロップ率を調整
    this.experienceValue = Math.floor(this.experienceValue * 0.8); // 基本より少ない経験値
    this.dropRate = 0.25; // ドロップ率を低めに設定
  }

  // 更新処理
  update(delta: number): void {
    // 親クラスの更新処理を呼び出し
    super.update(delta);

    // ダッシュ関連の処理
    this.updateDash(delta);
  }

  // ダッシュ処理の更新
  private updateDash(delta: number): void {
    // ダッシュクールダウンの更新
    if (this.dashCooldown > 0) {
      this.dashCooldown -= delta;
    }

    // ダッシュ中の処理
    if (this.isDashing) {
      this.dashTimer -= delta;

      if (this.dashTimer <= 0) {
        // ダッシュ終了
        this.endDash();
      }
    } else if (this.dashCooldown <= 0) {
      // ダッシュ可能かつターゲットがいる場合、確率でダッシュを開始
      const target = this.getTarget();
      if (target && Math.random() < 0.01) {
        // 1%の確率でダッシュ判定
        this.startDash(target);
      }
    }
  }

  // ダッシュ開始
  private startDash(target: Unit): void {
    this.isDashing = true;
    this.dashTimer = this.dashDuration;

    // ターゲットへの方向ベクトルを計算
    this.dashDirection.set(target.x - this.x, target.y - this.y).normalize();

    // スピード変更ではなく、移動計算時に倍率をかける
    // this.speed = Math.floor(this.defaultSpeed * this.dashSpeedMultiplier);

    console.log(`${this.name} starts dashing!`);

    // ダッシュエフェクト
    this.scene.tweens.add({
      targets: this,
      alpha: 0.7,
      duration: 100,
      yoyo: true,
      repeat: 2,
    });
  }

  // ダッシュ終了
  private endDash(): void {
    this.isDashing = false;
    this.dashCooldown = this.dashCooldownMax;

    // スピードを元に戻す（実際の実装ではスピードプロパティが読み取り専用なので、移動計算で調整する）
    // this.speed = this.defaultSpeed;

    console.log(`${this.name} ends dashing!`);

    // ダッシュ終了エフェクト
    this.scene.tweens.add({
      targets: this,
      scale: 1.2,
      duration: 100,
      yoyo: true,
    });
  }

  // AIの更新処理をオーバーライド
  updateAI(delta: number): void {
    if (this.isDashing) {
      // ダッシュ中は方向に沿って移動
      this.x +=
        this.dashDirection.x * this.defaultSpeed * this.dashSpeedMultiplier * (delta / 1000);
      this.y +=
        this.dashDirection.y * this.defaultSpeed * this.dashSpeedMultiplier * (delta / 1000);

      // 画面外に出ないように調整
      const bounds = 20;
      this.x = Phaser.Math.Clamp(this.x, bounds, 800 - bounds);
      this.y = Phaser.Math.Clamp(this.y, bounds, 600 - bounds);

      // ダッシュ中にターゲットにぶつかったら攻撃
      const target = this.getTarget();
      if (target) {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        if (distance < 30) {
          // 衝突判定
          this.performAttack(target);
          this.endDash(); // 攻撃したらダッシュ終了
        }
      }
    } else {
      // 通常時は親クラスのAI処理を使用
      super.updateAI(delta);
    }
  }

  // 現在のターゲットを取得するヘルパーメソッド
  private getTarget(): Unit | null {
    // TODO: 親クラスからターゲットを取得
    return null;
  }
}
