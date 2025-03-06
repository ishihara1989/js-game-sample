import { Unit } from '../objects/Unit';
import { BattleResult } from './BattleTypes';

// ステージの基本設定インターフェース
export interface StageConfig {
  id: string;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5; // 1 (簡単) ~ 5 (難しい)
  recommendedLevel: number;
  rewards: StageRewards;
  backgroundKey?: string; // 背景画像のアセットキー（オプション）
}

// ステージクリア報酬
export interface StageRewards {
  exp: number;
  gold: number;
  items?: string[]; // アイテムID配列
}

// 敵ユニット設定
export interface EnemyConfig {
  type: string; // 敵の種類（goblin, orc, slimeなど）
  level: number;
  position?: { x: number; y: number }; // 配置位置（オプション）
  stats?: {
    // 基本ステータスのオーバーライド（オプション）
    maxHealth?: number;
    attack?: number;
    defense?: number;
    speed?: number;
  };
}

// ステージの進行状態
export enum StageStatus {
  NOT_STARTED,
  IN_PROGRESS,
  VICTORY,
  DEFEAT
}

// ステージの結果データ
export interface StageResult {
  stageId: string;
  status: StageStatus;
  battleResult: BattleResult | null;
  enemiesDefeated: number;
  totalEnemies: number;
  timeTaken: number; // ミリ秒
}
