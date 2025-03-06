import { Unit } from '../objects/Unit';
import { Skill, SkillConfig, SkillEffectType, SkillTargetType } from './Skill';

/**
 * 範囲攻撃スキル設定インターフェース
 */
export interface AreaSkillConfig extends SkillConfig {
  falloff?: boolean;         // 距離による減衰があるか
  falloffRate?: number;      // 減衰率
  maxTargets?: number;       // 最大対象数
}

/**
 * 範囲攻撃スキルクラス
 * 指定範囲内の敵全てに影響を与えるスキル
 */
export class AreaSkill extends Skill {
  private falloff: boolean;
  private falloffRate: number;
  private maxTargets: number;

  /**
   * コンストラクタ
   * @param config スキル設定
   */
  constructor(config: AreaSkillConfig) {
    // デフォルト値を設定
    const areaConfig: AreaSkillConfig = {
      ...config,
      targetType: SkillTargetType.AREA,
      areaRadius: config.areaRadius || 150, // デフォルト範囲
    };

    super(areaConfig);
    this.falloff = config.falloff ?? true;
    this.falloffRate = config.falloffRate ?? 0.5;
    this.maxTargets = config.maxTargets ?? 0; // 0は無制限
  }

  /**
   * スキル効果を適用
   * @param target 対象ユニット（範囲の中心）
   * @returns 成功したらtrue
   */
  protected applyEffect(target: Unit): boolean {
    if (!this.owner || !this.owner.battleScene) return false;

    // 範囲内の全てのユニットを取得
    const targets = this.getTargetsInArea(target);
    if (targets.length === 0) return false;

    // 範囲エフェクトを表示
    this.showAreaEffect(target.x, target.y);

    // 各ターゲットに効果を適用
    targets.forEach(targetUnit => {
      this.applyEffectToTarget(targetUnit, target);
    });

    console.log(`${this.owner.name} uses ${this.name} affecting ${targets.length} units!`);
    return true;
  }

  /**
   * 範囲内のターゲットを取得
   * @param center 中心ユニット
   * @returns 範囲内のユニット配列
   */
  private getTargetsInArea(center: Unit): Unit[] {
    if (!this.owner || !this.owner.battleScene) return [];

    // 全てのユニットを取得
    const allUnits = this.owner.battleScene.getAllUnits();
    
    // 敵のみをフィルタリング
    const enemies = allUnits.filter(unit => 
      unit.isPlayer !== this.owner?.isPlayer && unit !== center
    );

    // 範囲内の敵を抽出
    const targetsInRange = enemies.filter(enemy => {
      const distance = Phaser.Math.Distance.Between(
        center.x, center.y, enemy.x, enemy.y
      );
      return distance <= this.areaRadius;
    });

    // 距離でソート（近い順）
    targetsInRange.sort((a, b) => {
      const distA = Phaser.Math.Distance.Between(center.x, center.y, a.x, a.y);
      const distB = Phaser.Math.Distance.Between(center.x, center.y, b.x, b.y);
      return distA - distB;
    });

    // 最大対象数を制限
    if (this.maxTargets > 0 && targetsInRange.length > this.maxTargets) {
      return targetsInRange.slice(0, this.maxTargets);
    }

    return targetsInRange;
  }

  /**
   * 個別のターゲットに効果を適用
   * @param targetUnit 対象ユニット
   * @param center 中心ユニット
   */
  private applyEffectToTarget(targetUnit: Unit, center: Unit): void {
    if (!this.owner) return;

    // 距離に基づく効果の減衰を計算
    let effectPower = this.power;
    
    if (this.falloff) {
      const distance = Phaser.Math.Distance.Between(
        center.x, center.y, targetUnit.x, targetUnit.y
      );
      
      // 距離に応じて効果を減衰
      const distanceRatio = distance / this.areaRadius;
      effectPower = this.power * (1 - distanceRatio * this.falloffRate);
    }

    // 効果タイプに応じて処理
    switch (this.effectType) {
      case SkillEffectType.DAMAGE:
        // ダメージ計算（防御力の影響を考慮）
        const damage = Math.max(1, effectPower - targetUnit.defense / 3);
        targetUnit.takeDamage(damage);
        break;
        
      case SkillEffectType.HEAL:
        // 味方の場合は回復（未実装）
        // TODO: 回復機能の実装
        break;
        
      case SkillEffectType.BUFF:
      case SkillEffectType.DEBUFF:
        // バフ/デバフ効果（未実装）
        // TODO: バフ/デバフシステムの実装
        break;
    }

    // ターゲットごとの小さいエフェクト
    this.showTargetEffect(targetUnit.x, targetUnit.y);
  }

  /**
   * 範囲エフェクトを表示
   * @param x 中心X座標
   * @param y 中心Y座標
   */
  private showAreaEffect(x: number, y: number): void {
    if (!this.owner || !this.owner.battleScene) return;
    
    // エフェクト色を効果タイプに応じて設定
    let color = 0xffaa00;
    switch (this.effectType) {
      case SkillEffectType.DAMAGE:
        color = 0xff3300;
        break;
      case SkillEffectType.HEAL:
        color = 0x00ff33;
        break;
      case SkillEffectType.BUFF:
        color = 0x00aaff;
        break;
      case SkillEffectType.DEBUFF:
        color = 0xaa00ff;
        break;
    }
    
    // 範囲エフェクトグラフィックを作成
    const areaEffect = this.owner.battleScene.add.graphics();
    areaEffect.fillStyle(color, 0.3);
    areaEffect.fillCircle(0, 0, this.areaRadius);
    areaEffect.lineStyle(2, color, 0.8);
    areaEffect.strokeCircle(0, 0, this.areaRadius);
    areaEffect.setDepth(4);
    areaEffect.setPosition(x, y);
    
    // エフェクトのアニメーション
    this.owner.battleScene.tweens.add({
      targets: areaEffect,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        areaEffect.destroy();
      }
    });
  }

  /**
   * ターゲットに対する個別エフェクトを表示
   * @param x X座標
   * @param y Y座標
   */
  private showTargetEffect(x: number, y: number): void {
    if (!this.owner || !this.owner.battleScene) return;
    
    // ターゲットエフェクト色
    let color = 0xffaa00;
    switch (this.effectType) {
      case SkillEffectType.DAMAGE:
        color = 0xff3300;
        break;
      case SkillEffectType.HEAL:
        color = 0x00ff33;
        break;
      case SkillEffectType.BUFF:
        color = 0x00aaff;
        break;
      case SkillEffectType.DEBUFF:
        color = 0xaa00ff;
        break;
    }
    
    // ターゲットエフェクトを作成
    const targetEffect = this.owner.battleScene.add.graphics();
    targetEffect.fillStyle(color, 0.6);
    targetEffect.fillCircle(0, 0, 10);
    targetEffect.setDepth(6);
    targetEffect.setPosition(x, y);
    
    // エフェクトのアニメーション
    this.owner.battleScene.tweens.add({
      targets: targetEffect,
      alpha: 0,
      scale: 1.5,
      duration: 400,
      onComplete: () => {
        targetEffect.destroy();
      }
    });
  }
}
