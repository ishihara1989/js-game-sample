import { Stage } from './Stage';
import { BattleScene } from '../scenes/BattleScene';
import { StageConfig } from '../types/StageTypes';

/**
 * ステージ1-2: ゴブリンの森 2
 */
export class Stage_1_2 extends Stage {
  constructor(scene: BattleScene) {
    const config: StageConfig = {
      id: '1-2',
      name: 'ゴブリンの森 2',
      description: 'ゴブリンの森の奥へと進む道。複数のゴブリンが現れます。',
      difficulty: 2,
      recommendedLevel: 3,
      rewards: {
        exp: 80,
        gold: 50,
        items: ['potion_small', 'potion_small'],
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
        level: 2,
        position: { x: 550, y: 200 },
      },
      {
        type: 'goblin',
        level: 2,
        position: { x: 650, y: 400 },
      },
    ];
  }

  /**
   * 背景の設定をオーバーライド
   */
  protected setupBackground(): void {
    // 基本的な背景を使用
    super.setupBackground();
    
    // 追加の装飾（森の深さを表現）
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      // より大きい木
      const treeBase = this.scene.add.rectangle(x, y, 12, 40, 0x663300);
      const treeTop = this.scene.add.circle(x, y - 30, 35, 0x004400, 0.8);
    }
    
    // 霧のエフェクト
    const fogGraphics = this.scene.add.graphics();
    fogGraphics.fillStyle(0xffffff, 0.1);
    
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(0, 800);
      const y = Phaser.Math.Between(0, 600);
      const radius = Phaser.Math.Between(50, 150);
      
      fogGraphics.fillCircle(x, y, radius);
    }
  }

  /**
   * ステージクリア時の処理をカスタマイズ
   */
  protected onStageCleared(): void {
    // 基本的なクリア処理
    super.onStageCleared();
    
    // 追加のエフェクト（例：光のエフェクト）
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;
    
    const victoryEffect = this.scene.add.circle(centerX, centerY, 10, 0xffff00, 1);
    
    this.scene.tweens.add({
      targets: victoryEffect,
      scale: 20,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        victoryEffect.destroy();
      }
    });
  }
}
