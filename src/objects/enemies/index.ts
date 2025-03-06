import { OrcEnemy } from './OrcEnemy';
import { SlimeEnemy } from './SlimeEnemy';
import { GoblinEnemy } from './GoblinEnemy';
import { BattleScene } from '../../scenes/BattleScene';

// エネミータイプの列挙型
export enum EnemyType {
  GOBLIN = 'goblin',
  ORC = 'orc',
  SLIME = 'slime',
}

// エネミー生成のファクトリークラス
export class EnemyFactory {
  // エネミーを生成するファクトリーメソッド
  static createEnemy(type: EnemyType, scene: BattleScene, x: number, y: number, level: number = 1) {
    switch (type) {
      case EnemyType.GOBLIN:
        return new GoblinEnemy({ scene, x, y, level });
      case EnemyType.ORC:
        return new OrcEnemy({ scene, x, y, level });
      case EnemyType.SLIME:
        return new SlimeEnemy({ scene, x, y, level });
      default:
        // デフォルトはゴブリン
        return new GoblinEnemy({ scene, x, y, level });
    }
  }
}

// エクスポートするクラス
export { OrcEnemy, SlimeEnemy, GoblinEnemy };
