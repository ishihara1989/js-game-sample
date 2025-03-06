/**
 * エネミー関連のエクスポートファイル
 */

// エネミークラスをエクスポート
export { GoblinEnemy } from './GoblinEnemy';
export { OrcEnemy } from './OrcEnemy';
export { SlimeEnemy } from './SlimeEnemy';

// エネミーファクトリの定義
import { BattleScene } from '../../scenes/BattleScene';
import { EnemyUnit } from '../EnemyUnit';
import { GoblinEnemy } from './GoblinEnemy';
import { OrcEnemy } from './OrcEnemy';
import { SlimeEnemy } from './SlimeEnemy';

/**
 * エネミー生成用ファクトリクラス
 */
export class EnemyFactory {
  /**
   * エネミータイプとレベルに応じたエネミーを作成
   * @param scene バトルシーン
   * @param type エネミータイプ
   * @param x X座標
   * @param y Y座標
   * @param level エネミーレベル
   * @returns 作成したエネミーインスタンス
   */
  static createEnemy(
    scene: BattleScene,
    type: string,
    x: number,
    y: number,
    level: number = 1
  ): EnemyUnit {
    switch (type.toLowerCase()) {
      case 'goblin':
        return new GoblinEnemy(scene, x, y, level);
      case 'orc':
        return new OrcEnemy(scene, x, y, level);
      case 'slime':
        return new SlimeEnemy(scene, x, y, level);
      default:
        // デフォルトはゴブリン
        console.warn(`Unknown enemy type: ${type}. Creating a goblin instead.`);
        return new GoblinEnemy(scene, x, y, level);
    }
  }
}
