import { BattleScene } from '../scenes/BattleScene';
import { Unit, SkillUnlock } from './Unit';
import {
  createBasicMeleeSkill,
  createPowerMeleeSkill,
  createBasicRangeSkill,
  createPrecisionRangeSkill,
  createBasicAreaSkill,
  createLargeAreaSkill,
} from '../skills';
import { EnemyRenderer } from '../renderers/EnemyRenderer';

/**
 * エネミーユニットの設定インターフェース
 */
export interface EnemyUnitConfig {
  scene: BattleScene;
  x: number;
  y: number;
  texture?: string;
  name: string;
  level: number;
  isPlayer: boolean;
  color: number;
  // 必要に応じてカスタムステータスを設定可能
  customStats?: {
    maxHealth?: number;
    attack?: number;
    defense?: number;
    speed?: number;
  };
}

/**
 * ドロップアイテムの情報
 */
export interface DropItem {
  id: string;
  name: string;
  dropRate: number; // 0.0 〜 1.0 の確率
}

/**
 * エネミーユニットの基本クラス
 * すべてのエネミータイプはこのクラスを継承する
 */
export class EnemyUnit extends Unit {
  // エネミーの基本情報
  protected baseMaxHealth: number = 50;
  protected baseAttack: number = 8;
  protected baseDefense: number = 4;
  protected baseSpeed: number = 1.5;
  protected baseExpValue: number = 10;

  // ドロップアイテム
  protected possibleDrops: DropItem[] = [];

  // 敵用レンダラー
  protected enemyRenderer: EnemyRenderer | null = null;

  /**
   * コンストラクタ
   * @param config エネミー設定
   */
  constructor(config: EnemyUnitConfig) {
    // 初期値を計算
    const calculatedStats = EnemyUnit.calculateStats(config.level, {
      maxHealth: 50,
      attack: 8,
      defense: 4,
      speed: 1.5,
    });

    // 優先的にカスタムステータスを使用し、ない場合は計算済みのステータスを使用
    const maxHealth = config.customStats?.maxHealth || calculatedStats.maxHealth;
    const attack = config.customStats?.attack || calculatedStats.attack;
    const defense = config.customStats?.defense || calculatedStats.defense;
    const speed = config.customStats?.speed || calculatedStats.speed;

    // Unitのコンストラクタを最初に呼び出す
    super({
      scene: config.scene,
      x: config.x,
      y: config.y,
      texture: config.texture || 'enemy',
      name: `${config.name} Lv.${config.level}`,
      maxHealth,
      attack,
      defense,
      speed,
      isPlayer: false, // エネミーなのでfalse
      color: config.color,
      level: config.level,
    });

    // 敵用レンダラーが作成されているか確認
    if (this.renderer instanceof EnemyRenderer) {
      this.enemyRenderer = this.renderer;
    }

    // 基本ステータスの初期化（サブクラスでオーバーライド）
    this.initializeBaseStats();

    // 経験値の初期化
    this.expValue = this.calculateExpValue();

    // ドロップアイテムの初期化
    this.initializeDrops();

    // スキル解放設定
    this.setupEnemySkillUnlocks();
  }

  /**
   * 基本ステータスの初期化
   * サブクラスでオーバーライドして実装
   */
  protected initializeBaseStats(): void {
    // デフォルト値はコンストラクタで設定済み
    // サブクラスでオーバーライドして実装
  }

  /**
   * レベルに応じたステータスを計算する静的メソッド
   * @param level エネミーレベル
   * @param baseStats 基本ステータス
   * @returns 計算されたステータス
   */
  static calculateStats(
    level: number,
    baseStats: { maxHealth: number; attack: number; defense: number; speed: number }
  ) {
    // レベルに応じた成長率
    const growthRate = 1 + (level - 1) * 0.2;

    return {
      maxHealth: Math.floor(baseStats.maxHealth * growthRate),
      attack: Math.floor(baseStats.attack * growthRate),
      defense: Math.floor(baseStats.defense * growthRate),
      speed: baseStats.speed * (1 + (level - 1) * 0.05), // スピードは小幅に上昇
    };
  }

  /**
   * 初期ドロップアイテムの設定
   * サブクラスでオーバーライドして実装
   */
  protected initializeDrops(): void {
    // 基底クラスでは何も設定しない
    // サブクラスで実装する
  }

  /**
   * 敵ユニットのスキル解放設定
   * サブクラスでオーバーライド可能
   */
  protected setupEnemySkillUnlocks(): void {
    // 基本的なスキル解放設定（すべての敵共通）
    const skillUnlocks: SkillUnlock[] = [
      // レベル1 - 近接攻撃
      {
        level: 1,
        skillFactory: createBasicMeleeSkill,
      },
      // レベル3 - 遠距離攻撃
      {
        level: 3,
        skillFactory: createBasicRangeSkill,
        message: '遠距離攻撃を習得した!',
      },
      // レベル5 - 強力な近接攻撃
      {
        level: 5,
        skillFactory: createPowerMeleeSkill,
        message: '強力な近接攻撃を習得した!',
      },
      // レベル8 - 範囲攻撃
      {
        level: 8,
        skillFactory: createBasicAreaSkill,
        message: '範囲攻撃を習得した!',
      },
      // レベル10 - 精密射撃
      {
        level: 10,
        skillFactory: createPrecisionRangeSkill,
        message: '精密射撃を習得した!',
      },
      // レベル15 - 大規模範囲攻撃
      {
        level: 15,
        skillFactory: createLargeAreaSkill,
        message: '大規模範囲攻撃を習得した!',
      },
    ];

    // スキル解放を設定
    this.setSkillUnlocks(skillUnlocks);
  }

  /**
   * 経験値の計算
   * @returns 獲得できる経験値
   */
  protected calculateExpValue(): number {
    // レベルに応じた経験値を計算
    // 基本値 + レベルに応じた増加
    return Math.floor(this.baseExpValue * (1 + (this.getLevel() - 1) * 0.3));
  }

  /**
   * ドロップアイテムの抽選
   * @returns ドロップするアイテムのID配列
   */
  public getDropItems(): string[] {
    const drops: string[] = [];

    // 各アイテムの抽選
    this.possibleDrops.forEach((item) => {
      // 乱数を生成して確率と比較
      if (Math.random() <= item.dropRate) {
        drops.push(item.id);

        // ドロップ時にレンダラーを使ってエフェクト表示
        if (this.enemyRenderer) {
          this.enemyRenderer.showItemDrop(item.id, item.name);
        }
      }
    });

    return drops;
  }

  /**
   * 獲得経験値の取得
   * @returns 獲得できる経験値
   */
  public getExpValue(): number {
    return this.expValue;
  }

  /**
   * エネミーの行動AIを更新
   * 必要に応じてサブクラスでオーバーライドする
   * @param delta 前フレームからの経過時間
   */
  protected updateAI(_delta: number): void {
    // 基本的な行動パターン（親クラスのAIを使用）
    super.updateAI(_delta);

    // サブクラスでオーバーライドして拡張可能
  }

  /**
   * ユニットのクリーンアップ（オーバーライド）
   * 死亡エフェクトを表示してから親クラスのクリーンアップを呼び出す
   */
  cleanup(): void {
    // 死亡エフェクトを表示
    if (this.enemyRenderer) {
      this.enemyRenderer.showDeathEffect();
    }

    // 親クラスのクリーンアップを呼び出す
    super.cleanup();
  }
}
