import Phaser from 'phaser';
import { Unit } from '../objects/Unit';

/**
 * スキル効果範囲タイプ
 */
export enum SkillTargetType {
  SINGLE, // 単体対象
  AREA, // 範囲対象
  SELF, // 自己対象
}

/**
 * スキル効果タイプ
 */
export enum SkillEffectType {
  DAMAGE, // ダメージ
  HEAL, // 回復
  BUFF, // バフ
  DEBUFF, // デバフ
}

/**
 * スキル基本設定インターフェース
 */
export interface SkillConfig {
  id: string; // スキルID
  name: string; // スキル名
  description: string; // 説明文
  cooldown: number; // クールダウン時間（ミリ秒）
  targetType: SkillTargetType; // 対象タイプ
  effectType: SkillEffectType; // 効果タイプ
  range: number; // 射程距離
  power: number; // 基本効果量（ダメージ/回復量など）
  areaRadius?: number; // 範囲半径（範囲スキルの場合）
  duration?: number; // 効果持続時間（バフ/デバフの場合）
}

/**
 * スキル基本クラス
 * すべてのスキルタイプの基底クラス
 */
export abstract class Skill {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly cooldownMax: number;
  readonly targetType: SkillTargetType;
  readonly effectType: SkillEffectType;
  readonly range: number;
  readonly power: number;
  readonly areaRadius: number;
  readonly duration: number;

  protected cooldown: number = 0;
  protected owner: Unit | null = null;

  /**
   * コンストラクタ
   * @param config スキル設定
   */
  constructor(config: SkillConfig) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.cooldownMax = config.cooldown;
    this.targetType = config.targetType;
    this.effectType = config.effectType;
    this.range = config.range;
    this.power = config.power;
    this.areaRadius = config.areaRadius || 0;
    this.duration = config.duration || 0;
  }

  /**
   * スキル所有者を設定
   * @param unit スキルを使用するユニット
   */
  setOwner(unit: Unit): void {
    this.owner = unit;
  }

  /**
   * スキルが使用可能かどうかを判定
   * @returns 使用可能ならtrue
   */
  isReady(): boolean {
    return this.cooldown <= 0 && this.owner !== null;
  }

  /**
   * スキルの使用
   * @param target 対象ユニット
   * @returns 使用成功したらtrue
   */
  use(target: Unit): boolean {
    if (!this.isReady()) return false;
    if (!this.canTargetUnit(target)) return false;

    // 具体的なスキル効果はサブクラスで実装
    const success = this.applyEffect(target);

    if (success) {
      // クールダウンをリセット
      this.cooldown = this.cooldownMax;
    }

    return success;
  }

  /**
   * 対象ユニットに効果を適用
   * サブクラスで実装
   * @param target 対象ユニット
   * @returns 適用成功ならtrue
   */
  protected abstract applyEffect(target: Unit): boolean;

  /**
   * ユニットが対象にできるかを判定
   * @param target 対象候補ユニット
   * @returns 対象にできるならtrue
   */
  canTargetUnit(target: Unit): boolean {
    if (!this.owner) return false;

    // 射程内か確認
    const distance = Phaser.Math.Distance.Between(this.owner.x, this.owner.y, target.x, target.y);

    return distance <= this.range;
  }

  /**
   * クールダウンの更新
   * @param delta 経過時間（ミリ秒）
   */
  update(delta: number): void {
    if (this.cooldown > 0) {
      this.cooldown -= delta;
      if (this.cooldown < 0) {
        this.cooldown = 0;
      }
    }
  }

  /**
   * クールダウンの残り時間を取得
   * @returns クールダウン残り時間（ミリ秒）
   */
  getCooldown(): number {
    return this.cooldown;
  }

  /**
   * クールダウン進行率を取得 (0.0 〜 1.0)
   * @returns クールダウン進行率
   */
  getCooldownProgress(): number {
    if (this.cooldownMax <= 0) return 1.0;
    return 1.0 - this.cooldown / this.cooldownMax;
  }
}
