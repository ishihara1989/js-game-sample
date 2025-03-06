import { BattleScene } from '../../scenes/BattleScene';
import { EnemyUnit, DropItem } from '../EnemyUnit';

/**
 * ゴブリンエネミークラス
 * 基本的な近接攻撃型の敵
 */
export class GoblinEnemy extends EnemyUnit {
  constructor(scene: BattleScene, x: number, y: number, level: number) {
    super({
      scene,
      x,
      y,
      name: 'Goblin',
      level,
      isPlayer: false,
      color: 0xff5555, // 赤色
    });
  }

  /**
   * 基本ステータスの初期化
   * レベルに応じたステータス計算はEnemyUnitクラスで実装済み
   */
  protected initializeBaseStats(): void {
    this.baseMaxHealth = 40;
    this.baseAttack = 8;
    this.baseDefense = 3;
    this.baseSpeed = 1.5;
    this.baseExpValue = 15;
  }

  /**
   * ドロップアイテムの初期化
   */
  protected initializeDrops(): void {
    this.possibleDrops = [
      {
        id: 'small_potion',
        name: 'Small Potion',
        dropRate: 0.3, // 30%の確率でドロップ
      },
      {
        id: 'goblin_tooth',
        name: 'Goblin Tooth',
        dropRate: 0.2, // 20%の確率でドロップ
      },
    ];

    // レベルが5以上の場合、追加アイテムをドロップする可能性がある
    if (this.level >= 5) {
      this.possibleDrops.push({
        id: 'goblin_dagger',
        name: 'Goblin Dagger',
        dropRate: 0.1, // 10%の確率でドロップ
      });
    }
  }

  /**
   * ゴブリン固有の行動パターン
   * @param delta 前フレームからの経過時間
   */
  protected updateAI(delta: number): void {
    // 基本的なAI行動を継承
    super.updateAI(delta);

    // ゴブリン固有の行動パターン
    // ※将来的にスキル実装時に拡張予定
  }
}
