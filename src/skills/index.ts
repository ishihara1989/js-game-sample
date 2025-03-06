/**
 * スキルシステムのエクスポート
 */

// 基本スキルクラスとタイプのエクスポート
export { Skill, SkillConfig, SkillTargetType, SkillEffectType } from './Skill';

// 各スキルタイプのエクスポート
export { MeleeSkill, MeleeSkillConfig } from './MeleeSkill';
export { RangeSkill, RangeSkillConfig } from './RangeSkill';
export { AreaSkill, AreaSkillConfig } from './AreaSkill';

// スキル作成用ファクトリ関数
import { Skill, SkillConfig } from './Skill';
import { MeleeSkill, MeleeSkillConfig } from './MeleeSkill';
import { RangeSkill, RangeSkillConfig } from './RangeSkill';
import { AreaSkill, AreaSkillConfig } from './AreaSkill';

/**
 * スキルタイプ列挙型
 */
export enum SkillType {
  MELEE = 'melee',
  RANGE = 'range',
  AREA = 'area'
}

/**
 * スキルファクトリ：スキルタイプに応じて適切なスキルインスタンスを作成
 */
export class SkillFactory {
  /**
   * 近接攻撃スキルを作成
   * @param config スキル設定
   * @returns 近接攻撃スキルインスタンス
   */
  static createMeleeSkill(config: MeleeSkillConfig): MeleeSkill {
    return new MeleeSkill(config);
  }

  /**
   * 遠距離攻撃スキルを作成
   * @param config スキル設定
   * @returns 遠距離攻撃スキルインスタンス
   */
  static createRangeSkill(config: RangeSkillConfig): RangeSkill {
    return new RangeSkill(config);
  }

  /**
   * 範囲攻撃スキルを作成
   * @param config スキル設定
   * @returns 範囲攻撃スキルインスタンス
   */
  static createAreaSkill(config: AreaSkillConfig): AreaSkill {
    return new AreaSkill(config);
  }

  /**
   * スキルタイプに応じてスキルを作成
   * @param type スキルタイプ
   * @param config スキル設定
   * @returns スキルインスタンス
   */
  static createSkill(type: SkillType, config: SkillConfig): Skill {
    switch (type) {
      case SkillType.MELEE:
        return SkillFactory.createMeleeSkill(config as MeleeSkillConfig);
      case SkillType.RANGE:
        return SkillFactory.createRangeSkill(config as RangeSkillConfig);
      case SkillType.AREA:
        return SkillFactory.createAreaSkill(config as AreaSkillConfig);
      default:
        throw new Error(`Unknown skill type: ${type}`);
    }
  }

  /**
   * 基本的な近接攻撃スキルを作成（簡易作成用）
   * @param name スキル名
   * @param power 威力
   * @returns 近接攻撃スキル
   */
  static createBasicMeleeSkill(name: string, power: number): MeleeSkill {
    return SkillFactory.createMeleeSkill({
      id: `melee_${name.toLowerCase().replace(/\s+/g, '_')}`,
      name: name,
      description: `Basic melee attack: ${name}`,
      cooldown: 3000,
      targetType: 0, // SINGLE
      effectType: 0, // DAMAGE
      range: 150,
      power: power,
      knockback: 0
    });
  }

  /**
   * 基本的な遠距離攻撃スキルを作成（簡易作成用）
   * @param name スキル名
   * @param power 威力
   * @returns 遠距離攻撃スキル
   */
  static createBasicRangeSkill(name: string, power: number): RangeSkill {
    return SkillFactory.createRangeSkill({
      id: `range_${name.toLowerCase().replace(/\s+/g, '_')}`,
      name: name,
      description: `Basic ranged attack: ${name}`,
      cooldown: 4000,
      targetType: 0, // SINGLE
      effectType: 0, // DAMAGE
      range: 300,
      power: power,
      accuracy: 0.9
    });
  }

  /**
   * 基本的な範囲攻撃スキルを作成（簡易作成用）
   * @param name スキル名
   * @param power 威力
   * @param radius 範囲半径
   * @returns 範囲攻撃スキル
   */
  static createBasicAreaSkill(name: string, power: number, radius: number = 150): AreaSkill {
    return SkillFactory.createAreaSkill({
      id: `area_${name.toLowerCase().replace(/\s+/g, '_')}`,
      name: name,
      description: `Area attack: ${name}`,
      cooldown: 6000,
      targetType: 1, // AREA
      effectType: 0, // DAMAGE
      range: 200,
      power: power,
      areaRadius: radius,
      falloff: true
    });
  }
}
