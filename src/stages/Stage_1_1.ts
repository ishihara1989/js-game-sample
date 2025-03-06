import Phaser from 'phaser';
import { Stage } from './Stage';
import { BattleScene } from '../scenes/BattleScene';
import { StageConfig } from '../types/StageTypes';

/**
 * ステージ1-1: ゴブリンの森 1
 */
export class Stage_1_1 extends Stage {
  constructor(scene: BattleScene) {
    const config: StageConfig = {
      id: '1-1',
      name: 'ゴブリンの森 1',
      description: 'ゴブリンが生息する森の入り口。初心者向けの難易度です。',
      difficulty: 1,
      recommendedLevel: 1,
      rewards: {
        exp: 50,
        gold: 30,
        items: ['potion_small'],
      },
    };

    super(scene, config);
  }

  /**
   * 敵の配置設定
   */
  protected setupEnemyConfigs(): void {
    this.enemyConfigs = [
      {
        type: 'goblin',
        level: 1,
        position: { x: 600, y: 300 },
      },
    ];
  }

  /**
   * 背景の設定をオーバーライド（必要な場合）
   */
  protected setupBackground(): void {
    // 基本的な背景を使用
    super.setupBackground();

    // 追加の装飾（木など）
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);

      // 簡単な木の表現
      const treeBase = this.scene.add.circle(x, y, 10, 0x663300);
      const treeTop = this.scene.add.circle(x, y - 20, 30, 0x006600, 0.8);
    }
  }
}
