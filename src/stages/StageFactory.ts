import { BattleScene } from '../scenes/BattleScene';
import { Stage } from './Stage';
import { Stage_1_1 } from './Stage_1_1';
import { Stage_1_2 } from './Stage_1_2';
import { Stage_1_3 } from './Stage_1_3';

/**
 * ステージファクトリークラス
 * 
 * ステージIDに基づいて適切なステージオブジェクトを作成する
 */
export class StageFactory {
  /**
   * ステージオブジェクトを作成する
   * 
   * @param stageId ステージID
   * @param scene バトルシーン
   * @returns Stage ステージオブジェクト
   */
  static createStage(stageId: string, scene: BattleScene): Stage {
    switch (stageId) {
      case '1-1':
        return new Stage_1_1(scene);
      case '1-2':
        return new Stage_1_2(scene);
      case '1-3':
        return new Stage_1_3(scene);
      default:
        console.warn(`Unknown stage ID: ${stageId}, falling back to stage 1-1`);
        return new Stage_1_1(scene);
    }
  }

  /**
   * 利用可能なすべてのステージ情報を取得する
   * 
   * @returns ステージ情報の配列
   */
  static getAvailableStages(): Array<{id: string, name: string, recommendedLevel: number}> {
    return [
      { id: '1-1', name: 'ゴブリンの森 1', recommendedLevel: 1 },
      { id: '1-2', name: 'ゴブリンの森 2', recommendedLevel: 3 },
      { id: '1-3', name: 'ゴブリンの森 3', recommendedLevel: 5 },
      // 将来的にここに新しいステージを追加
    ];
  }

  /**
   * ステージの解放状態をチェックする
   * 
   * @param stageId ステージID
   * @param playerLevel プレイヤーレベル
   * @returns boolean 解放済みかどうか
   */
  static isStageUnlocked(stageId: string, playerLevel: number): boolean {
    // 仮実装: レベルに基づいてアンロック状態を判定
    // 実際のゲームではプレイヤーの進行状況や達成条件をチェック
    
    // 最初のステージは常に解放
    if (stageId === '1-1') return true;
    
    // 他のステージの場合
    const stage = this.getAvailableStages().find(s => s.id === stageId);
    if (!stage) return false;
    
    // 推奨レベルの70%以上ならアンロック
    const requiredLevel = Math.ceil(stage.recommendedLevel * 0.7);
    return playerLevel >= requiredLevel;
  }
}
