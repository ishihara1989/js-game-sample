import { BattleScene } from '../../scenes/BattleScene';
import { EnemyUnit, /* DropItem */ } from '../EnemyUnit';
import { Unit } from '../Unit';
// Include Phaser import for direct usage in this file
import Phaser from 'phaser';

/**
 * スライムエネミークラス
 * 速度が速いが攻撃力の低い敵
 * 時間経過で分裂する可能性がある（将来実装予定）
 */
export class SlimeEnemy extends EnemyUnit {
  private dashCooldown: number = 0;
  private readonly dashCooldownMax: number = 5000; // 5秒
  private isDashing: boolean = false;
  private originalSpeed: number = 0;
  private speedMultiplier: number = 1.0; // 移動速度の倍率

  constructor(scene: BattleScene, x: number, y: number, level: number) {
    super({
      scene,
      x,
      y,
      name: 'Slime',
      level,
      isPlayer: false,
      color: 0x00aaff, // 青色
    });

    // 元のスピードを記録
    this.originalSpeed = this.speed;
  }

  /**
   * 基本ステータスの初期化
   */
  protected initializeBaseStats(): void {
    this.baseMaxHealth = 60;
    this.baseAttack = 5;
    this.baseDefense = 2;
    this.baseSpeed = 1.8;
    this.baseExpValue = 20;
  }

  /**
   * ドロップアイテムの初期化
   */
  protected initializeDrops(): void {
    this.possibleDrops = [
      {
        id: 'slime_jelly',
        name: 'Slime Jelly',
        dropRate: 0.5, // 50%の確率でドロップ
      },
      {
        id: 'small_potion',
        name: 'Small Potion',
        dropRate: 0.2, // 20%の確率でドロップ
      },
    ];

    // レベルに応じた追加ドロップ
    if (this.level >= 4) {
      this.possibleDrops.push({
        id: 'sticky_compound',
        name: 'Sticky Compound',
        dropRate: 0.15, // 15%の確率でドロップ
      });
    }
  }

  /**
   * スライム固有の行動パターン
   * 定期的にダッシュ攻撃を行う
   * @param delta 前フレームからの経過時間
   */
  protected updateAI(delta: number): void {
    // ダッシュ中は通常のAI行動をスキップ
    if (this.isDashing) {
      this.updateDash(delta);
      return;
    }

    // 基本的なAI行動を継承
    super.updateAI(delta);

    // ダッシュクールダウン更新
    if (this.dashCooldown > 0) {
      this.dashCooldown -= delta;
    } else if (this.target && !this.isDashing) {
      // ダッシュ準備の条件：
      // 1. クールダウンが終了している
      // 2. ターゲットがいる
      // 3. 現在ダッシュ中でない
      this.prepareDash();
    }
  }

  /**
   * ダッシュ攻撃の準備
   */
  private prepareDash(): void {
    if (!this.target) return;

    // 視覚的な前兆効果（少し縮む）
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 300,
      yoyo: true,
      onComplete: () => {
        this.startDash();
      },
    });

    console.warn(`${this.name} is preparing to dash!`);
  }

  /**
   * ダッシュ攻撃の開始
   */
  private startDash(): void {
    if (!this.target) return;

    this.isDashing = true;

    // 移動速度倍率を一時的に増加（3倍）
    this.speedMultiplier = 3.0;

    // ターゲットに向かって直線的に移動するための目標設定
    this.movementTarget = new Phaser.Math.Vector2(this.target.x, this.target.y);

    // 色を変更して強調（より鮮やかな青に）
    if (this.unitCircle) {
      this.unitCircle.clear();
      this.unitCircle.fillStyle(0x00ffff, 1);
      this.unitCircle.fillCircle(0, 0, 20);
      this.unitCircle.lineStyle(2, 0xffffff, 0.8);
      this.unitCircle.strokeCircle(0, 0, 20);
    }

    console.warn(`${this.name} dashes towards ${this.target.name}!`);
  }

  /**
   * ダッシュ中の更新処理
   */
  private updateDash(_delta: number): void {
    // Changed parameter name to _delta since it's not used
    if (!this.target || !this.movementTarget) {
      this.endDash();
      return;
    }

    // ターゲットとの距離を計算
    const distanceToTarget = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.target.x,
      this.target.y
    );

    // ターゲットに衝突したらダメージを与えてダッシュ終了
    if (distanceToTarget < 30) {
      this.dashAttack(this.target);
      this.endDash();
      return;
    }

    // ダッシュ移動処理
    if (this.movementTarget) {
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        this.movementTarget.x,
        this.movementTarget.y
      );

      // 目標に到達したら移動終了
      if (distance < 5) {
        this.movementTarget = null;
        this.endDash();
        return;
      }

      // 移動方向を計算
      const angle = Phaser.Math.Angle.Between(
        this.x,
        this.y,
        this.movementTarget.x,
        this.movementTarget.y
      );

      // 移動速度に基づいて位置を更新（speedMultiplierを使用）
      this.x += Math.cos(angle) * this.speed * this.speedMultiplier;
      this.y += Math.sin(angle) * this.speed * this.speedMultiplier;

      // 向きを更新
      this.updateDirection(angle);
    }
  }

  /**
   * ダッシュ攻撃の実行
   */
  private dashAttack(target: Unit): void {
    // 通常攻撃の1.5倍のダメージ
    const damage = Math.max(1, this.attackPower * 1.5 - target.defense / 2);

    // ターゲットにダメージを与える
    target.takeDamage(damage);

    // 攻撃エフェクトを表示（より大きく）
    if (this.battleScene) {
      // 通常の攻撃エフェクトの代わりに、ダッシュ専用のエフェクトを表示
      const midX = (this.x + target.x) / 2;
      const midY = (this.y + target.y) / 2;

      const dashEffect = this.scene.add.circle(midX, midY, 25, 0x00ffff);
      dashEffect.setDepth(20);

      this.scene.tweens.add({
        targets: dashEffect,
        scale: { from: 0.8, to: 2 },
        alpha: { from: 1, to: 0 },
        duration: 400,
        onComplete: () => {
          dashEffect.destroy();
        },
      });
    }

    console.warn(`${this.name} dash attacks ${target.name} for ${damage} damage!`);
  }

  /**
   * ダッシュ終了処理
   */
  private endDash(): void {
    this.isDashing = false;

    // 移動速度倍率を元に戻す
    this.speedMultiplier = 1.0;

    // 色を元に戻す
    if (this.unitCircle) {
      this.unitCircle.clear();
      this.unitCircle.fillStyle(0x00aaff, 1);
      this.unitCircle.fillCircle(0, 0, 20);
      this.unitCircle.lineStyle(2, 0xffffff, 0.8);
      this.unitCircle.strokeCircle(0, 0, 20);
    }

    // クールダウンを設定
    this.dashCooldown = this.dashCooldownMax;

    // 移動目標をクリア
    this.movementTarget = null;
  }

  /**
   * 移動処理のオーバーライド
   * 速度倍率を適用する
   */
  protected updateMovement(_delta: number): void {
    // Changed parameter name to _delta since it's not used
    
    // 移動クールダウン中は移動しない
    if (this.moveCooldown > 0) return;

    // 移動目標があれば移動
    if (this.movementTarget) {
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        this.movementTarget.x,
        this.movementTarget.y
      );

      // 目標に到達したら移動終了
      if (distance < 5) {
        this.movementTarget = null;
        return;
      }

      // 移動方向を計算
      const angle = Phaser.Math.Angle.Between(
        this.x,
        this.y,
        this.movementTarget.x,
        this.movementTarget.y
      );

      // 移動速度に基づいて位置を更新（speedMultiplierを適用）
      this.x += Math.cos(angle) * this.speed * this.speedMultiplier;
      this.y += Math.sin(angle) * this.speed * this.speedMultiplier;

      // 向きを更新
      this.updateDirection(angle);
    } else if (this.target) {
      // ターゲットがnullでないことを確認
      // ターゲットの方向を向く
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
      this.updateDirection(angle);
    }
  }
}
