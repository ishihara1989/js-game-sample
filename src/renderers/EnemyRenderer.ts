import Phaser from 'phaser';
import { EnemyUnit } from '../objects/EnemyUnit';
import { UnitRenderer } from './UnitRenderer';

/**
 * 敵ユニット描画クラス
 * EnemyUnit専用の描画機能を提供する
 */
export class EnemyRenderer extends UnitRenderer {
  // 描画対象の敵ユニット（型を特定）
  protected enemyUnit: EnemyUnit;

  // 敵の状態変化に関する色
  protected normalColor: number; // privateからprotectedに変更
  protected specialColor: number | null = null; // privateからprotectedに変更

  /**
   * コンストラクタ
   * @param enemy 描画対象の敵ユニット
   * @param scene 描画先のシーン
   * @param color 敵の色
   */
  constructor(enemy: EnemyUnit, scene: Phaser.Scene, color: number) {
    // 親クラスのコンストラクタを呼び出し
    super(enemy, scene, color);

    // 敵ユニットへの参照を保持
    this.enemyUnit = enemy;

    // 通常の色を保存
    this.normalColor = color;

    // 敵特有の初期化
    this.initializeEnemySpecific();
  }

  /**
   * 敵特有の初期化処理
   */
  protected initializeEnemySpecific(): void {
    // privateからprotectedに変更
    // 敵特有の追加表示要素があれば、ここで初期化
    // 現在は特になし
  }

  /**
   * 描画処理（オーバーライド）
   */
  render(): void {
    // 親クラスの描画処理を実行
    super.render();

    // 敵特有の描画処理を追加
    this.drawEnemySpecific();
  }

  /**
   * 敵特有の描画処理
   */
  protected drawEnemySpecific(): void {
    // privateからprotectedに変更
    // 敵特有の描画が必要な場合はここに実装
    // 例：敵の種類によって異なるエフェクトなど
  }

  /**
   * 敵のドロップアイテム表示
   * @param itemId ドロップしたアイテムID
   * @param itemName アイテム名
   */
  showItemDrop(itemId: string, itemName: string): void {
    // ドロップアイテムテキスト
    const dropText = this.scene.add.text(
      this.enemyUnit.x,
      this.enemyUnit.y - 30,
      `Got ${itemName}!`,
      {
        font: 'bold 14px Arial',
        color: '#ffffaa',
        stroke: '#000000',
        strokeThickness: 3,
      }
    );
    dropText.setOrigin(0.5);
    dropText.setDepth(15);

    // テキストアニメーション
    this.scene.tweens.add({
      targets: dropText,
      y: dropText.y - 40,
      alpha: 0,
      duration: 1500,
      delay: 500,
      onComplete: () => {
        dropText.destroy();
      },
    });
  }

  /**
   * 敵の死亡エフェクト表示
   */
  showDeathEffect(): void {
    // 死亡時のパーティクルエフェクト
    const particles = this.scene.add.particles(this.enemyUnit.x, this.enemyUnit.y, 'particle', {
      speed: { min: 50, max: 100 },
      scale: { start: 0.8, end: 0 },
      blendMode: 'ADD',
      lifespan: 1000,
      quantity: 20,
    });

    // パーティクルが終了したら削除
    this.scene.time.delayedCall(1000, () => {
      particles.destroy();
    });

    // 敵のグラフィックスをフェードアウト
    this.scene.tweens.add({
      targets: this.enemyUnit,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
    });
  }

  /**
   * 敵の色を変更する（エンレイジ状態など）
   * @param color 新しい色
   */
  changeColor(color: number): void {
    this.specialColor = color;
    this.unitColor = color;
    // 次のrenderで反映される
  }

  /**
   * 敵の色を元に戻す
   */
  resetColor(): void {
    this.specialColor = null;
    this.unitColor = this.normalColor;
    // 次のrenderで反映される
  }

  /**
   * スケール変更エフェクト
   * @param scaleX X方向のスケール
   * @param scaleY Y方向のスケール
   * @param duration 変化にかかる時間
   * @param yoyo 元に戻すかどうか
   * @param onComplete 完了時のコールバック
   */
  scaleEffect(
    scaleX: number,
    scaleY: number,
    duration: number = 300,
    yoyo: boolean = false,
    onComplete?: () => void
  ): void {
    this.scene.tweens.add({
      targets: this.enemyUnit,
      scaleX: scaleX,
      scaleY: scaleY,
      duration: duration,
      yoyo: yoyo,
      onComplete: onComplete ? onComplete : undefined,
    });
  }
}
