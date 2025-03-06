import Phaser from 'phaser';
import { Unit } from '../objects/Unit';
import { UnitRenderer } from './UnitRenderer';

/**
 * プレイヤーユニット描画クラス
 * プレイヤーユニット専用の描画機能を提供する
 */
export class PlayerRenderer extends UnitRenderer {
  // 描画対象のプレイヤーユニット
  private playerUnit: Unit;

  // プレイヤー特有の描画要素
  private expBar: Phaser.GameObjects.Graphics;
  private expText: Phaser.GameObjects.Text;

  /**
   * コンストラクタ
   * @param player 描画対象のプレイヤーユニット
   * @param scene 描画先のシーン
   * @param color プレイヤーの色
   */
  constructor(player: Unit, scene: Phaser.Scene, color: number = 0x5555ff) {
    // 親クラスのコンストラクタを呼び出し
    super(player, scene, color);

    // プレイヤーユニットへの参照を保持
    this.playerUnit = player;

    // 経験値バーの作成
    this.expBar = this.scene.add.graphics();
    this.expBar.setDepth(10);

    // 経験値テキストの作成
    this.expText = this.scene.add.text(0, 0, '', {
      font: '12px Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.expText.setOrigin(0.5);
    this.expText.setDepth(11);

    // プレイヤー特有の初期化
    this.initializePlayerSpecific();
  }

  /**
   * プレイヤー特有の初期化処理
   */
  private initializePlayerSpecific(): void {
    // 経験値バーの初期描画
    this.drawExpBar();
  }

  /**
   * 描画処理（オーバーライド）
   */
  render(): void {
    // 親クラスの描画処理を実行
    super.render();

    // プレイヤー特有の描画処理を追加
    this.drawPlayerSpecific();

    // 経験値バーの描画
    this.drawExpBar();
  }

  /**
   * プレイヤー特有の描画処理
   */
  private drawPlayerSpecific(): void {
    // プレイヤー特有の描画が必要な場合はここに実装
    // 例：装備品の表示など
  }

  /**
   * 経験値バーの描画
   */
  private drawExpBar(): void {
    this.expBar.clear();

    // 現在の経験値情報を取得
    // 注意: これらのプロパティはprivateなので、本来はUnitクラスにgetterメソッドを追加すべき
    // デモのため、as anyを使用してアクセス
    const currentExp = (this.playerUnit as any).experience || 0;
    const requiredExp = (this.playerUnit as any).requiredExperience || 100;
    const playerLevel = this.playerUnit.getLevel();

    // 経験値バーは画面下部に配置
    const barWidth = 400;
    const barHeight = 15;
    const x = (this.scene.sys.game.config.width as number) / 2 - barWidth / 2;
    const y = (this.scene.sys.game.config.height as number) - 30;

    // 背景（黒）
    this.expBar.fillStyle(0x000000, 0.7);
    this.expBar.fillRect(x, y, barWidth, barHeight);

    // 経験値バー（青緑）
    const expPercent = Math.min(1, currentExp / requiredExp);
    this.expBar.fillStyle(0x00aaff, 1);
    this.expBar.fillRect(x, y, barWidth * expPercent, barHeight);

    // 枠線
    this.expBar.lineStyle(2, 0xffffff, 0.8);
    this.expBar.strokeRect(x, y, barWidth, barHeight);

    // 経験値テキストの更新
    this.expText.setText(`Level ${playerLevel} - EXP: ${currentExp}/${requiredExp}`);
    this.expText.setPosition(x + barWidth / 2, y - 15);
  }

  /**
   * クリーンアップ（オーバーライド）
   */
  destroy(): void {
    // 親クラスのクリーンアップ
    super.destroy();

    // 追加リソースのクリーンアップ
    this.expBar.destroy();
    this.expText.destroy();
  }

  /**
   * レベルアップ時の特殊エフェクト表示
   */
  showLevelUpSpecialEffect(): void {
    // レベルアップ時のより派手なエフェクト
    const particles = this.scene.add.particles(this.playerUnit.x, this.playerUnit.y, 'particle', {
      speed: { min: 100, max: 200 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 1500,
      quantity: 30,
      tint: 0xffff00,
    });

    // パーティクルが終了したら削除
    this.scene.time.delayedCall(1500, () => {
      particles.destroy();
    });

    // 円形の輝きエフェクト
    const glow = this.scene.add.graphics();
    glow.fillStyle(0xffff00, 0.5);
    glow.fillCircle(this.playerUnit.x, this.playerUnit.y, 60);
    glow.setDepth(4);

    // グローエフェクトのアニメーション
    this.scene.tweens.add({
      targets: glow,
      alpha: 0,
      scale: 2,
      duration: 1500,
      onComplete: () => {
        glow.destroy();
      },
    });

    // 標準のレベルアップエフェクトも表示
    super.showLevelUpEffect();
  }
}
