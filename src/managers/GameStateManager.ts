import { PlayerData, DEFAULT_PLAYER_DATA } from '../types/PlayerTypes';

/**
 * ゲームの永続的な状態を管理するクラス
 * レベル、経験値、ステータス、所持アイテムなどを管理する
 */
export class GameStateManager {
  // シングルトンインスタンス
  private static instance: GameStateManager;

  // プレイヤーデータ
  private playerData: PlayerData;

  /**
   * コンストラクタ（private）
   */
  private constructor() {
    // デフォルトのプレイヤーデータで初期化
    this.playerData = { ...DEFAULT_PLAYER_DATA };
    console.warn('GameStateManager initialized with default player data');
  }

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  /**
   * プレイヤーデータの取得
   */
  public getPlayerData(): PlayerData {
    return this.playerData;
  }

  /**
   * プレイヤーデータの設定
   * @param data 新しいプレイヤーデータ
   */
  public setPlayerData(data: PlayerData): void {
    this.playerData = data;
  }

  /**
   * 経験値を加算し、必要に応じてレベルアップを処理する
   * @param exp 獲得した経験値
   * @returns レベルアップしたかどうか
   */
  public addExperience(exp: number): boolean {
    // 経験値を加算
    this.playerData.exp += exp;
    console.warn(`Player gained ${exp} experience points.`);

    // レベルアップのチェック
    if (this.playerData.exp >= this.playerData.maxExp) {
      return this.levelUp();
    }

    return false;
  }

  /**
   * レベルアップ処理
   * @returns レベルアップしたことを示すboolean
   */
  private levelUp(): boolean {
    // レベルを上げる
    this.playerData.level++;

    // 余った経験値を次のレベルに持ち越し
    this.playerData.exp -= this.playerData.maxExp;

    // 次のレベルに必要な経験値を更新（レベルが上がるごとに必要経験値が増加）
    this.playerData.maxExp = Math.floor(this.playerData.maxExp * 1.5);

    // ステータスの向上
    this.playerData.maxHealth += 10;
    this.playerData.health = this.playerData.maxHealth; // レベルアップで全回復
    this.playerData.attack += 2;
    this.playerData.defense += 1;
    this.playerData.speed += 0.2;

    console.warn(`Player leveled up to ${this.playerData.level}!`);
    return true;
  }

  /**
   * ゴールドを追加
   * @param amount 追加するゴールド量
   */
  public addGold(amount: number): void {
    if (amount <= 0) return;

    this.playerData.gold += amount;
    console.warn(`Player gained ${amount} gold. Total: ${this.playerData.gold}`);
  }

  /**
   * バトルに適したユニットのステータスを計算して返す
   * 装備品のボーナスなども含める
   */
  public calculateBattleStats(): {
    maxHealth: number;
    attack: number;
    defense: number;
    speed: number;
  } {
    // 基本ステータス
    let maxHealth = this.playerData.maxHealth;
    let attack = this.playerData.attack;
    let defense = this.playerData.defense;
    let speed = this.playerData.speed;

    // 装備品によるボーナス
    if (this.playerData.equipment.weapon) {
      const bonus = this.playerData.equipment.weapon.statBonus;
      if (bonus.attack) attack += bonus.attack;
      if (bonus.defense) defense += bonus.defense;
      if (bonus.health) maxHealth += bonus.health;
      if (bonus.speed) speed += bonus.speed;
    }

    if (this.playerData.equipment.armor) {
      const bonus = this.playerData.equipment.armor.statBonus;
      if (bonus.attack) attack += bonus.attack;
      if (bonus.defense) defense += bonus.defense;
      if (bonus.health) maxHealth += bonus.health;
      if (bonus.speed) speed += bonus.speed;
    }

    if (this.playerData.equipment.accessory) {
      const bonus = this.playerData.equipment.accessory.statBonus;
      if (bonus.attack) attack += bonus.attack;
      if (bonus.defense) defense += bonus.defense;
      if (bonus.health) maxHealth += bonus.health;
      if (bonus.speed) speed += bonus.speed;
    }

    return { maxHealth, attack, defense, speed };
  }

  /**
   * プレイヤーデータをリセット（主にデバッグ用）
   */
  public resetPlayerData(): void {
    this.playerData = { ...DEFAULT_PLAYER_DATA };
    console.warn('Player data has been reset to default');
  }

  /**
   * ゲームの進行状況をセーブする（未実装）
   * 将来的にはローカルストレージやサーバーへの保存を実装
   */
  public saveGame(): void {
    console.warn('Game save functionality is not yet implemented');
    // ローカルストレージに保存する例:
    // localStorage.setItem('gameData', JSON.stringify(this.playerData));
  }

  /**
   * ゲームの進行状況をロードする（未実装）
   * 将来的にはローカルストレージやサーバーからのロードを実装
   */
  public loadGame(): boolean {
    console.warn('Game load functionality is not yet implemented');
    // ローカルストレージからロードする例:
    // const savedData = localStorage.getItem('gameData');
    // if (savedData) {
    //   this.playerData = JSON.parse(savedData);
    //   return true;
    // }
    return false;
  }
}
