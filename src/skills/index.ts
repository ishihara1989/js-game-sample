// スキルシステムのエクスポート

// 基本スキルクラスとタイプ
export { Skill, SkillTargetType, SkillEffectType } from './Skill';
export type { SkillConfig } from './Skill';

// 近接攻撃スキル
export { MeleeSkill } from './MeleeSkill';
export type { MeleeSkillConfig } from './MeleeSkill';

// 遠距離攻撃スキル
export { RangeSkill } from './RangeSkill';
export type { RangeSkillConfig } from './RangeSkill';

// 範囲攻撃スキル
export { AreaSkill } from './AreaSkill';
export type { AreaSkillConfig } from './AreaSkill';

// 基本スキルの定義
export const BasicSkills = {
  // 近接攻撃スキル
  MELEE_SLASH: {
    id: 'melee_slash',
    name: '斬撃',
    description: '敵に近接攻撃を行う',
    cooldown: 1200,
    targetType: SkillTargetType.SINGLE,
    effectType: SkillEffectType.DAMAGE,
    range: 150,
    power: 15,
  },

  // 遠距離攻撃スキル
  RANGED_SHOT: {
    id: 'ranged_shot',
    name: '射撃',
    description: '遠距離から敵に攻撃を行う',
    cooldown: 2000,
    targetType: SkillTargetType.SINGLE,
    effectType: SkillEffectType.DAMAGE,
    range: 300,
    power: 12,
  },

  // 範囲攻撃スキル
  AREA_BLAST: {
    id: 'area_blast',
    name: '爆発',
    description: '範囲内の敵に攻撃を行う',
    cooldown: 5000,
    targetType: SkillTargetType.AREA,
    effectType: SkillEffectType.DAMAGE,
    range: 200,
    power: 10,
    areaRadius: 100,
  },
};

// スキルを生成するファクトリー関数
export function createSkill(config: SkillConfig) {
  switch (config.targetType) {
    case SkillTargetType.SINGLE:
      if (config.range > 200) {
        return new RangeSkill(config);
      } else {
        return new MeleeSkill(config);
      }
    case SkillTargetType.AREA:
      return new AreaSkill(config);
    default:
      throw new Error(`Unsupported skill target type: ${config.targetType}`);
  }
}
