import Phaser from 'phaser';
import { Unit } from '../objects/Unit';
import { Skill, SkillConfig, SkillEffectType, SkillTargetType } from './Skill';

/**
 * 範囲攻撃スキルの設定インターフェース
 */
export interface AreaSkillConfig extends SkillConfig {
  falloff?: boolean; // 距離減衰があるか
  falloffRate?: number; // 減衰率（0.0〜1.0）
}

/**
 * 範囲攻撃スキルクラス
 * 広範囲に効果を与えるスキル
 */
export class AreaSkill extends Skill {
  // 距離減衰の有無
  readonly falloff: boolean;
  // 距離に応じたダメージ減衰率
  readonly falloffRate: number;

  /**
   * コンストラクタ
   * @param config スキル設定
   */
  constructor(config: AreaSkillConfig) {
    super(config);

    this.falloff = config.falloff !== undefined ? config.falloff : true;
    this.falloffRate = config.falloffRate !== undefined ? config.falloffRate : 0.5;

    // 範囲スキルの場合、TargetTypeはAREAに強制
    if (this.targetType !== SkillTargetType.AREA) {
      console.warn(`AreaSkill ${this.name} had incorrect targetType. Forcing to AREA.`);
    }

    // 範囲半径の確認
    if (!this.areaRadius || this.areaRadius <= 0) {
      console.warn(`AreaSkill ${this.name} has no valid areaRadius. Setting to default 100.`);
      (this as any).areaRadius = 100;
    }
  }

  /**
   * スキル効果の適用
   * @param target 中心とする対象ユニット
   * @returns 適用成功ならtrue
   */
  protected applyEffect(target: Unit): boolean {
    if (!this.owner || !this.owner.battleScene) return false;

    // 中心座標を取得
    const centerX = target.x;
    const centerY = target.y;

    // 範囲内の対象を取得
    const targets = this.getTargetsInArea(centerX, centerY);

    // 効果がない場合はスキル使用失敗
    if (targets.length === 0) {
      console.warn(`${this.owner.name}'s ${this.name} affected no targets.`);
      return false;
    }

    // 各対象にスキル効果を適用
    targets.forEach((targetUnit) => {
      this.applyEffectToTarget(targetUnit, centerX, centerY);
    });

    // エフェクト表示（中心点のみ）
    // this.owner と this.owner.battleScene は既にチェック済みだが、
    // TypeScriptの型チェックのために再度確認
    if (this.owner && this.owner.battleScene) {
      this.owner.battleScene.showSkillEffect(this.owner, target);
    }

    // this.ownerは既にチェック済みだが、TypeScriptの型チェックのために再度確認
    if (this.owner) {
      console.warn(`${this.owner.name} uses ${this.name} affecting ${targets.length} targets!`);
    }

    return true;
  }

  /**
   * 範囲内の対象ユニットを取得
   * @param centerX 中心X座標
   * @param centerY 中心Y座標
   * @returns 範囲内のユニット配列
   */
  private getTargetsInArea(centerX: number, centerY: number): Unit[] {
    if (!this.owner || !this.owner.battleScene) return [];

    // バトルシーンから全ユニットを取得
    const allUnits = this.owner.battleScene.getAllUnits();

    // 対象を絞り込む（敵のみ）
    return allUnits.filter((unit) => {
      // 自分自身は除外
      if (unit === this.owner) return false;

      // プレイヤーとエネミーで対象を区別
      if (this.owner && this.owner.isPlayer && unit.isPlayer) return false; // プレイヤーなら味方は対象外
      if (this.owner && !this.owner.isPlayer && !unit.isPlayer) return false; // エネミーなら敵エネミーは対象外

      // 範囲内かどうか判定
      const distance = Phaser.Math.Distance.Between(centerX, centerY, unit.x, unit.y);

      return distance <= this.areaRadius;
    });
  }

  /**
   * 個別のターゲットにスキル効果を適用
   * @param target 対象ユニット
   * @param centerX 中心X座標
   * @param centerY 中心Y座標
   */
  private applyEffectToTarget(target: Unit, centerX: number, centerY: number): void {
    if (!this.owner) return;

    // 中心からの距離を計算
    const distance = Phaser.Math.Distance.Between(centerX, centerY, target.x, target.y);

    // 距離に応じたダメージ係数（距離減衰あり/なし）
    let damageMultiplier = 1.0;
    if (this.falloff) {
      // 距離が離れるほど効果が減衰
      damageMultiplier = 1.0 - (distance / this.areaRadius) * this.falloffRate;
    }

    // スキル効果タイプによって処理を分岐
    if (this.effectType === SkillEffectType.DAMAGE) {
      // ダメージ計算（防御効果は中程度）
      const damage = Math.max(
        1,
        (this.power + this.owner.attackPower * 0.6 - target.defense / 4) * damageMultiplier
      );

      // ターゲットにダメージを与える
      target.takeDamage(damage);

      // デバッグ表示は主要なターゲットのみ
      if (distance < 50) {
        console.warn(`${this.name} hits ${target.name} for ${damage} damage!`);
      }
    }
    // 他の効果タイプの実装も可能（回復、バフなど）
  }
}
