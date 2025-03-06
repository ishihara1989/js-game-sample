import { Unit } from '../objects/Unit';
import { Skill, SkillConfig, SkillEffectType, SkillTargetType } from './Skill';

/**
 * 遠距離攻撃スキルの設定インターフェース
 */
export interface RangeSkillConfig extends SkillConfig {
  accuracy?: number; // 命中率（0.0〜1.0）
  projectileSpeed?: number; // 投射物の速度
}

/**
 * 遠距離攻撃スキルクラス
 * 長距離から攻撃を行うスキル
 */
export class RangeSkill extends Skill {
  // 命中率（1.0が100%）
  readonly accuracy: number;
  // 投射物の速度（アニメーション用）
  readonly projectileSpeed: number;

  /**
   * コンストラクタ
   * @param config スキル設定
   */
  constructor(config: RangeSkillConfig) {
    super(config);

    this.accuracy = config.accuracy !== undefined ? config.accuracy : 0.9;
    this.projectileSpeed = config.projectileSpeed || 5;

    // 遠距離スキルの場合、TargetTypeはSINGLEに強制
    if (this.targetType !== SkillTargetType.SINGLE) {
      console.warn(`RangeSkill ${this.name} had incorrect targetType. Forcing to SINGLE.`);
    }
  }

  /**
   * スキル効果の適用
   * @param target 対象ユニット
   * @returns 適用成功ならtrue
   */
  protected applyEffect(target: Unit): boolean {
    if (!this.owner) return false;

    // 命中判定
    const hit = Math.random() <= this.accuracy;

    // ミスした場合
    if (!hit) {
      console.warn(`${this.owner.name}'s ${this.name} missed ${target.name}!`);

      // ミスしたときもエフェクトは表示（ただし、ダメージなし）
      if (this.owner.battleScene) {
        this.owner.battleScene.showSkillEffect(this.owner, target);
      }

      return true; // スキル自体は使用したと見なす
    }

    // ダメージ計算（防御効果は近接攻撃より小さい）
    const damage = Math.max(1, this.power + this.owner.attackPower * 0.8 - target.defense / 3);

    // ターゲットにダメージを与える
    target.takeDamage(damage);

    // エフェクト表示
    if (this.owner.battleScene) {
      this.owner.battleScene.showSkillEffect(this.owner, target);
    }

    console.warn(`${this.owner.name} uses ${this.name} on ${target.name} for ${damage} damage!`);

    return true;
  }
}
