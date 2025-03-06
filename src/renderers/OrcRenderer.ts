import Phaser from 'phaser';
import { OrcEnemy } from '../objects/enemies/OrcEnemy';
import { EnemyRenderer } from './EnemyRenderer';

/**
 * オークエネミー描画クラス
 * OrcEnemy専用の描画機能を提供する
 */
export class OrcRenderer extends EnemyRenderer {
  // 描画対象のオークエネミー
  private orcEnemy: OrcEnemy;

  // エンレイジ状態かどうか
  private enraged: boolean = false;

  // エンレイジ色（継承元のnormalColorは使用）
  private enragedColor: number = 0x008800; // エンレイジ時の濃い緑色

  /**
   * コンストラクタ
   * @param orc 描画対象のオークエネミー
   * @param scene 描画先のシーン
   */
  constructor(orc: OrcEnemy, scene: Phaser.Scene) {
    // 親クラスのコンストラクタを呼び出し（通常色で初期化）
    super(orc, scene, 0x00aa00);

    // オークへの参照を保持
    this.orcEnemy = orc;
  }

  /**
   * エンレイジ状態に変更
   */
  setEnraged(): void {
    // すでにエンレイジ状態なら何もしない
    if (this.enraged) return;

    this.enraged = true;

    // エンレイジ視覚効果（赤く点滅）
    this.scene.tweens.add({
      targets: this.unitCircle,
      alpha: 0.7,
      yoyo: true,
      duration: 200,
      repeat: 2,
      onComplete: () => {
        // 色を変更（より濃い緑に）
        this.changeColor(this.enragedColor);
      },
    });
  }

  /**
   * 描画処理（オーバーライド）
   */
  render(): void {
    // 親クラスの描画処理を実行
    super.render();

    // エンレイジ状態なら特殊効果を追加
    if (this.enraged) {
      this.drawEnragedEffect();
    }
  }

  /**
   * ユニット本体の描画（オーバーライド）
   */
  protected drawUnit(): void {
    // 基本描画は親クラスの処理を利用
    super.drawUnit();

    // エンレイジ状態では赤い輪郭を追加
    if (this.enraged) {
      this.unitCircle.lineStyle(2, 0xff0000, 0.8);
      this.unitCircle.strokeCircle(this.orcEnemy.x, this.orcEnemy.y, 20);
    }
  }

  /**
   * エンレイジ時の特殊効果描画
   */
  private drawEnragedEffect(): void {
    // 怒りのオーラ表現（赤い粒子など）を実装予定
  }
}
