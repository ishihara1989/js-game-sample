import Phaser from 'phaser';
import { Unit } from '../objects/Unit';
import { Skill, SkillConfig, SkillEffectType, SkillTargetType } from './Skill';

/**
 * 近接攻撃スキルの設定インターフェース
 */
export interface MeleeSkillConfig extends SkillConfig {
  knockback?: number; // ノックバック距離（省略可）
}

/**
 * 近接攻撃スキルクラス
 * 近距離での攻撃を行うスキル
 */
export class MeleeSkill extends Skill {
  // ノックバック距離（0なら効果なし）
  readonly knockback: number;

  /**
   * コンストラクタ
   * @param config スキル設定
   */
  constructor(config: MeleeSkillConfig) {
    super(config);

    this.knockback = config.knockback || 0;

    // 近接スキルの場合、TargetTypeはSINGLEに強制
    if (this.targetType !== SkillTargetType.SINGLE) {
      console.warn(`MeleeSkill ${this.name} had incorrect targetType. Forcing to SINGLE.`);
    }
  }

  /**
   * スキル効果の適用
   * @param target 対象ユニット
   * @returns 適用成功ならtrue
   */
  protected applyEffect(target: Unit): boolean {
    if (!this.owner) return false;

    // ダメージ計算
    const damage = Math.max(1, this.power + this.owner.attackPower - target.defense / 2);

    // ターゲットにダメージを与える
    target.takeDamage(damage);

    // ノックバック効果（設定されている場合）
    if (this.knockback > 0) {
      this.applyKnockback(target);
    }

    // エフェクト表示
    if (this.owner.battleScene) {
      // スキルエフェクトの表示
      this.owner.battleScene.showSkillEffect(this.owner, target);
    }

    console.warn(`${this.owner.name} uses ${this.name} on ${target.name} for ${damage} damage!`);

    return true;
  }

  /**
   * ノックバック効果の適用
   * @param target ノックバック対象
   */
  private applyKnockback(target: Unit): void {
    if (!this.owner) return;

    // ノックバックの方向を計算
    const angle = Phaser.Math.Angle.Between(this.owner.x, this.owner.y, target.x, target.y);

    // ノックバック距離に応じた新しい位置を計算
    const newX = target.x + Math.cos(angle) * this.knockback;
    const newY = target.y + Math.sin(angle) * this.knockback;

    // 画面外に出ないように調整
    const bounds = 50;
    const clampedX = Phaser.Math.Clamp(newX, bounds, 800 - bounds);
    const clampedY = Phaser.Math.Clamp(newY, bounds, 600 - bounds);

    // ターゲットをアニメーションでノックバック
    if (target.scene) {
      target.scene.tweens.add({
        targets: target,
        x: clampedX,
        y: clampedY,
        duration: 300,
        ease: 'Power2',
      });
    }
  }
}
