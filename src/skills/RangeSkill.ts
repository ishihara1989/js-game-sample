import { Unit } from '../objects/Unit';
import { Skill, SkillConfig, SkillEffectType, SkillTargetType } from './Skill';

/**
 * 遠距離攻撃スキル設定インターフェース
 */
export interface RangeSkillConfig extends SkillConfig {
  projectileSpeed?: number; // 発射物の速度
  accuracy?: number;        // 命中率 (0.0 〜 1.0)
}

/**
 * 遠距離攻撃スキルクラス
 * 遠距離から敵を攻撃するスキル
 */
export class RangeSkill extends Skill {
  private projectileSpeed: number;
  private accuracy: number;

  /**
   * コンストラクタ
   * @param config スキル設定
   */
  constructor(config: RangeSkillConfig) {
    // デフォルト値を設定
    const rangeConfig: RangeSkillConfig = {
      ...config,
      targetType: SkillTargetType.SINGLE,
      effectType: SkillEffectType.DAMAGE,
      range: config.range || 300, // デフォルト射程
    };

    super(rangeConfig);
    this.projectileSpeed = config.projectileSpeed || 5;
    this.accuracy = config.accuracy ?? 0.9; // デフォルト命中率90%
  }

  /**
   * スキル効果を適用
   * @param target 対象ユニット
   * @returns 成功したらtrue
   */
  protected applyEffect(target: Unit): boolean {
    if (!this.owner || !this.owner.battleScene) return false;

    // 命中判定
    const hit = Math.random() <= this.accuracy;
    
    if (hit) {
      // ダメージ計算（防御力の影響は小さめ）
      const damage = Math.max(1, this.power - target.defense / 4);

      // 発射物のエフェクトを作成
      this.createProjectileEffect(target, () => {
        // コールバック：発射物が命中したときに実行
        target.takeDamage(damage);
        console.log(`${this.owner?.name} hits ${target.name} with ${this.name} for ${damage} damage!`);
      });

      return true;
    } else {
      // 発射物が外れた場合のエフェクト
      this.createProjectileEffect(target, () => {
        console.log(`${this.owner?.name}'s ${this.name} missed ${target.name}!`);
      }, true);

      return false;
    }
  }

  /**
   * 発射物エフェクトを作成
   * @param target 対象ユニット
   * @param onHit 命中時コールバック
   * @param miss 外れたか
   */
  private createProjectileEffect(target: Unit, onHit: () => void, miss: boolean = false): void {
    if (!this.owner || !this.owner.battleScene) return;

    // 発射物グラフィックを作成
    const projectile = this.owner.battleScene.add.graphics();
    projectile.fillStyle(0x00aaff, 1);
    projectile.fillCircle(0, 0, 5);
    projectile.setDepth(5);
    projectile.setPosition(this.owner.x, this.owner.y);

    // 対象位置（外れる場合はランダムに少しずらす）
    let targetX = target.x;
    let targetY = target.y;
    
    if (miss) {
      const missOffset = 40; // 外れる距離
      targetX += Phaser.Math.Between(-missOffset, missOffset);
      targetY += Phaser.Math.Between(-missOffset, missOffset);
    }

    // 発射物の移動アニメーション
    this.owner.battleScene.tweens.add({
      targets: projectile,
      x: targetX,
      y: targetY,
      duration: this.calculateProjectileDuration(targetX, targetY),
      ease: 'Linear',
      onComplete: () => {
        // 命中エフェクト
        if (!miss) {
          this.createHitEffect(targetX, targetY);
        }
        
        // コールバック実行
        onHit();
        
        // 発射物削除
        projectile.destroy();
      }
    });
  }

  /**
   * 発射物の飛行時間を計算
   * @param targetX 対象X座標
   * @param targetY 対象Y座標
   * @returns 飛行時間（ミリ秒）
   */
  private calculateProjectileDuration(targetX: number, targetY: number): number {
    if (!this.owner) return 500;
    
    // 距離に応じた時間を計算
    const distance = Phaser.Math.Distance.Between(
      this.owner.x, 
      this.owner.y, 
      targetX, 
      targetY
    );
    
    return distance / this.projectileSpeed;
  }

  /**
   * 命中エフェクトを作成
   * @param x X座標
   * @param y Y座標
   */
  private createHitEffect(x: number, y: number): void {
    if (!this.owner || !this.owner.battleScene) return;
    
    // 命中エフェクトグラフィックを作成
    const hitEffect = this.owner.battleScene.add.graphics();
    hitEffect.fillStyle(0xffaa00, 0.8);
    hitEffect.fillCircle(0, 0, 15);
    hitEffect.setDepth(6);
    hitEffect.setPosition(x, y);
    
    // エフェクトのアニメーション
    this.owner.battleScene.tweens.add({
      targets: hitEffect,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      onComplete: () => {
        hitEffect.destroy();
      }
    });
  }
}
