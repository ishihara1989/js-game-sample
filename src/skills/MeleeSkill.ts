import { Unit } from '../objects/Unit';
import { Skill, SkillConfig, SkillEffectType, SkillTargetType } from './Skill';

/**
 * 近接攻撃スキル設定インターフェース
 */
export interface MeleeSkillConfig extends SkillConfig {
  knockback?: number; // ノックバック距離
}

/**
 * 近接攻撃スキルクラス
 * 単体の敵に対して近距離で高威力の攻撃を行うスキル
 */
export class MeleeSkill extends Skill {
  private knockback: number;

  /**
   * コンストラクタ
   * @param config スキル設定
   */
  constructor(config: MeleeSkillConfig) {
    // デフォルト値を設定
    const meleeConfig: MeleeSkillConfig = {
      ...config,
      targetType: SkillTargetType.SINGLE,
      effectType: SkillEffectType.DAMAGE,
      range: config.range || 150, // デフォルト射程
    };

    super(meleeConfig);
    this.knockback = config.knockback || 0;
  }

  /**
   * スキル効果を適用
   * @param target 対象ユニット
   * @returns 成功したらtrue
   */
  protected applyEffect(target: Unit): boolean {
    if (!this.owner) return false;

    // ダメージ計算（防御力を考慮）
    const damage = Math.max(1, this.power - target.defense / 2);

    // ダメージを与える
    target.takeDamage(damage);

    // ノックバック効果があれば適用
    if (this.knockback > 0) {
      this.applyKnockback(target);
    }

    // スキル使用エフェクトを表示（ユニットクラスに実装されている場合）
    if (this.owner.battleScene) {
      this.owner.battleScene.showSkillEffect(this.owner, target);
    }

    console.log(`${this.owner.name} uses ${this.name} on ${target.name} for ${damage} damage!`);
    return true;
  }

  /**
   * ノックバック効果を適用
   * @param target 対象ユニット
   */
  private applyKnockback(target: Unit): void {
    if (!this.owner) return;

    // ノックバックの方向を計算
    const angle = Phaser.Math.Angle.Between(this.owner.x, this.owner.y, target.x, target.y);

    // ノックバック量に応じて位置を移動
    const newX = target.x + Math.cos(angle) * this.knockback;
    const newY = target.y + Math.sin(angle) * this.knockback;

    // 画面外に出ないように調整
    const bounds = 20;
    const clampedX = Phaser.Math.Clamp(newX, bounds, 800 - bounds);
    const clampedY = Phaser.Math.Clamp(newY, bounds, 600 - bounds);

    // 位置を設定
    target.setPosition(clampedX, clampedY);
  }
}
