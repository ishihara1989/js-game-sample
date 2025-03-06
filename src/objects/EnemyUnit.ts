import Phaser from 'phaser';
import { Unit } from './Unit';
import { BattleScene } from '../scenes/BattleScene';

// 敵ユニットの設定インターフェース
interface EnemyUnitConfig {
  scene: BattleScene;
  x: number;
  y: number;
  texture: string;
  name: string;
  level: number;
  baseHealth: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  color: number;
}

export class EnemyUnit extends Unit {
  // 敵の基本特性
  level: number;
  baseHealth: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  
  // 経験値とドロップアイテム
  experienceValue: number;
  dropRate: number = 0.3; // ドロップ率のデフォルト値
  
  // AIに関するプロパティ
  aggroRange: number = 400; // 敵対範囲
  attackRange: number = 150; // 攻撃範囲
  
  constructor(config: EnemyUnitConfig) {
    // 先に必要なパラメータを計算
    const scaledHealth = Math.floor(config.baseHealth * (1 + (config.level - 1) * 0.1));
    const scaledAttack = Math.floor(config.baseAttack * (1 + (config.level - 1) * 0.1));
    const scaledDefense = Math.floor(config.baseDefense * (1 + (config.level - 1) * 0.1));
    const scaledSpeed = Math.floor(config.baseSpeed * (1 + (config.level - 1) * 0.05));
    
    // 基本クラスのコンストラクタを呼び出す - 必ず最初に呼び出す
    super({
      scene: config.scene,
      x: config.x,
      y: config.y,
      texture: config.texture,
      name: config.name,
      maxHealth: scaledHealth,
      attack: scaledAttack,
      defense: scaledDefense,
      speed: scaledSpeed,
      isPlayer: false,
      color: config.color
    });
    
    // 敵固有のプロパティを設定
    this.level = config.level;
    this.baseHealth = config.baseHealth;
    this.baseAttack = config.baseAttack;
    this.baseDefense = config.baseDefense;
    this.baseSpeed = config.baseSpeed;
    
    // 経験値の計算（レベルに応じて）
    this.experienceValue = Math.floor(10 * Math.pow(1.2, config.level - 1));
    
    console.log(`Created enemy ${this.name} (Lv.${this.level}) with ${this.health}HP`);
  }
  
  // 戦闘終了時の報酬処理
  getRewards(): { experience: number, item: string | null } {
    // 経験値の取得
    const experience = this.experienceValue;
    
    // ドロップアイテムの判定
    let item: string | null = null;
    if (Math.random() < this.dropRate) {
      item = this.getRandomDrop();
    }
    
    return { experience, item };
  }
  
  // ランダムなドロップアイテムを取得
  private getRandomDrop(): string {
    const commonDrops = ['potion', 'gold'];
    const rareDrops = ['weapon', 'armor', 'accessory'];
    
    // レベルが高いほどレアアイテムのドロップ率が上がる
    const rareChance = Math.min(0.1 + (this.level * 0.02), 0.5);
    
    if (Math.random() < rareChance) {
      return rareDrops[Math.floor(Math.random() * rareDrops.length)];
    } else {
      return commonDrops[Math.floor(Math.random() * commonDrops.length)];
    }
  }
  
  // 基本的なAI行動
  updateAI(delta: number): void {
    // ここに基本的なAI行動を実装
    // 各敵タイプで独自のAIを実装する場合はオーバーライドする
  }
}