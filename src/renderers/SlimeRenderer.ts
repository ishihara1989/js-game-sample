import Phaser from 'phaser';
import { SlimeEnemy } from '../objects/enemies/SlimeEnemy';
import { EnemyRenderer } from './EnemyRenderer';

/**
 * スライムエネミー描画クラス
 * SlimeEnemy専用の描画機能を提供する
 */
export class SlimeRenderer extends EnemyRenderer {
  // 描画対象のスライムエネミー
  private slimeEnemy: SlimeEnemy;

  // ダッシュ状態かどうか
  private isDashing: boolean = false;

  // 通常色とダッシュ色
  protected normalColor: number = 0x00aaff; // 通常時の青色
  private dashingColor: number = 0x00ffff; // ダッシュ時の水色

  /**
   * コンストラクタ
   * @param slime 描画対象のスライムエネミー
   * @param scene 描画先のシーン
   */
  constructor(slime: SlimeEnemy, scene: Phaser.Scene) {
    // 親クラスのコンストラクタを呼び出し（通常色で初期化）
    super(slime, scene, 0x00aaff);

    // スライムへの参照を保持
    this.slimeEnemy = slime;
  }

  /**
   * ダッシュ状態に変更
   */
  setDashing(dashing: boolean): void {
    // 状態が変わらなければ何もしない
    if (this.isDashing === dashing) return;

    this.isDashing = dashing;

    if (dashing) {
      // ダッシュ開始時の視覚効果
      this.updateUnitColor(this.dashingColor);
    } else {
      // ダッシュ終了時は通常色に戻す
      this.updateUnitColor(this.normalColor);
    }
  }

  /**
   * ダッシュ準備エフェクト表示
   */
  showDashPreparation(): void {
    // 視覚的な前兆効果（少し縮む）
    this.scene.tweens.add({
      targets: this.slimeEnemy,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 300,
      yoyo: true,
    });
  }

  /**
   * ダッシュ攻撃エフェクト表示
   * @param targetX 対象X座標
   * @param targetY 対象Y座標
   */
  showDashAttackEffect(targetX: number, targetY: number): void {
    const midX = (this.slimeEnemy.x + targetX) / 2;
    const midY = (this.slimeEnemy.y + targetY) / 2;

    const dashEffect = this.scene.add.circle(midX, midY, 25, this.dashingColor);
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

  /**
   * 描画処理（オーバーライド）
   */
  render(): void {
    // 親クラスの描画処理を実行
    super.render();

    // ダッシュ状態なら特殊効果を追加
    if (this.isDashing) {
      this.drawDashingEffect();
    }
  }

  /**
   * ダッシュ時の特殊効果描画
   */
  private drawDashingEffect(): void {
    // ダッシュエフェクト（軌跡など）
    // 現在は特に実装なし
  }

  /**
   * ユニットの色を更新
   * @param color 新しい色
   */
  private updateUnitColor(color: number): void {
    this.unitCircle.clear();
    this.unitCircle.fillStyle(color, 1);
    this.unitCircle.fillCircle(this.slimeEnemy.x, this.slimeEnemy.y, 20);
    this.unitCircle.lineStyle(2, 0xffffff, 0.8);
    this.unitCircle.strokeCircle(this.slimeEnemy.x, this.slimeEnemy.y, 20);
  }
}
