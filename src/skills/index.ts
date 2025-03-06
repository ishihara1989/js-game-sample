/**
 * スキルシステムのエクスポートファイル
 * すべてのスキル関連クラスとインターフェースをエクスポート
 */

// 基本スキルクラスとインターフェースをエクスポート
import { 
  Skill, 
  SkillConfig, 
  SkillTargetType, 
  SkillEffectType 
} from './Skill';

// 近接攻撃スキル
import { 
  MeleeSkill, 
  MeleeSkillConfig 
} from './MeleeSkill';

// 遠距離攻撃スキル
import { 
  RangeSkill, 
  RangeSkillConfig 
} from './RangeSkill';

// 範囲攻撃スキル
import { 
  AreaSkill, 
  AreaSkillConfig 
} from './AreaSkill';

// 再エクスポート
export {
  Skill,
  SkillConfig,
  SkillTargetType,
  SkillEffectType,
  MeleeSkill,
  MeleeSkillConfig,
  RangeSkill,
  RangeSkillConfig,
  AreaSkill,
  AreaSkillConfig
};

/**
 * 基本スキルのファクトリー関数
 * 汎用的なスキルインスタンスを作成
 */

// 基本の近接攻撃スキルを作成
export function createBasicMeleeSkill() {
  return new MeleeSkill({
    id: 'basic_melee',
    name: '近接攻撃',
    description: '単体の敵に近接攻撃を行う',
    cooldown: 1500,
    targetType: SkillTargetType.SINGLE,
    effectType: SkillEffectType.DAMAGE,
    range: 150,
    power: 15,
  });
}

// 基本の強力な近接攻撃スキルを作成
export function createPowerMeleeSkill() {
  return new MeleeSkill({
    id: 'power_melee',
    name: '強力な近接攻撃',
    description: '単体の敵に強力な近接攻撃を行い、ノックバック効果を与える',
    cooldown: 3000,
    targetType: SkillTargetType.SINGLE,
    effectType: SkillEffectType.DAMAGE,
    range: 150,
    power: 25,
    knockback: 30,
  });
}

// 基本の遠距離攻撃スキルを作成
export function createBasicRangeSkill() {
  return new RangeSkill({
    id: 'basic_range',
    name: '遠距離攻撃',
    description: '遠距離から敵を攻撃する',
    cooldown: 2000,
    targetType: SkillTargetType.SINGLE,
    effectType: SkillEffectType.DAMAGE,
    range: 300,
    power: 12,
    accuracy: 0.9,
  });
}

// 高精度の遠距離攻撃スキルを作成
export function createPrecisionRangeSkill() {
  return new RangeSkill({
    id: 'precision_range',
    name: '精密射撃',
    description: '高い命中率で遠距離から敵を攻撃する',
    cooldown: 2500,
    targetType: SkillTargetType.SINGLE,
    effectType: SkillEffectType.DAMAGE,
    range: 350,
    power: 18,
    accuracy: 0.98,
    projectileSpeed: 8,
  });
}

// 基本の範囲攻撃スキルを作成
export function createBasicAreaSkill() {
  return new AreaSkill({
    id: 'basic_area',
    name: '範囲攻撃',
    description: '周囲の敵に範囲攻撃を行う',
    cooldown: 5000,
    targetType: SkillTargetType.AREA,
    effectType: SkillEffectType.DAMAGE,
    range: 250,
    areaRadius: 120,
    power: 10,
    falloff: true,
  });
}

// 大規模範囲攻撃スキルを作成
export function createLargeAreaSkill() {
  return new AreaSkill({
    id: 'large_area',
    name: '大規模範囲攻撃',
    description: '広範囲の敵に強力な攻撃を行う',
    cooldown: 8000,
    targetType: SkillTargetType.AREA,
    effectType: SkillEffectType.DAMAGE,
    range: 250,
    areaRadius: 180,
    power: 15,
    falloff: true,
    falloffRate: 0.3,
  });
}
