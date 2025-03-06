import { Unit, UnitConfig } from './Unit';
import { BattleScene } from '../scenes/BattleScene';
import { GameStateManager } from '../managers/GameStateManager';

/**
 * プレイヤーユニットクラス
 * GameStateManagerから永続的なデータを取得して戦闘用のステータスを構築する
 */
export class PlayerUnit extends Unit {
  // GameStateManagerへの参照
  private gameStateManager: GameStateManager;

  // プレイヤーユニット用の簡略化されたコンストラクタ
  constructor(scene: BattleScene, x: number, y: number) {
    // GameStateManagerからプレイヤーデータを取得
    const gameStateManager = GameStateManager.getInstance();
    const playerData = gameStateManager.getPlayerData();
    
    // 戦闘用ステータスを計算
    const battleStats = gameStateManager.calculateBattleStats();
    
    // 親クラスのコンストラクタに渡す値を作成
    const config: UnitConfig = {
      scene,
      x,
      y,
      texture: 'player',
      name: playerData.name,
      maxHealth: battleStats.maxHealth,
      attack: battleStats.attack,
      defense: battleStats.defense,
      speed: battleStats.speed,
      isPlayer: true,
      color: 0x5555ff,
      level: playerData.level, // レベルも渡す
    };
    
    // 親クラスのコンストラクタを呼び出す
    super(config);
    
    // GameStateManagerを保存
    this.gameStateManager = gameStateManager;
    
    console.warn(`PlayerUnit created with level ${this.level} from GameStateManager`);
  }
  
  /**
   * 経験値をゲームステートマネージャーに追加し、表示も行う
   * @param exp 経験値
   * @returns レベルアップしたかどうか
   */
  addExperience(exp: number): boolean {
    // まずテキスト表示を行う
    this.showExpGain(exp);
    
    // GameStateManagerに経験値を反映
    const leveledUp = this.gameStateManager.addExperience(exp);
    
    if (leveledUp) {
      // レベルアップ時はレベルを同期し、エフェクトを表示
      const playerData = this.gameStateManager.getPlayerData();
      this.setLevel(playerData.level);
      this.showLevelUpEffect();
      
      // レベルに応じたスキルをチェックしてアンロック
      this.checkSkillUnlocks();
    }
    
    return leveledUp;
  }
  
  /**
   * レベルアップによるスキル解放をチェック
   */
  private checkSkillUnlocks(): void {
    // 現在のレベルで解放されるスキルを検索
    const newSkills = this.skillUnlocks.filter(unlock => unlock.level === this.level);
    
    if (newSkills.length > 0) {
      // スキル解放の処理
      newSkills.forEach(unlockInfo => {
        // スキルを生成して追加
        const newSkill = unlockInfo.skillFactory();
        this.addSkill(newSkill);
        
        // 解放メッセージがあれば表示
        if (unlockInfo.message) {
          this.showSkillUnlockMessage(newSkill.name, unlockInfo.message);
        } else {
          this.showSkillUnlockMessage(newSkill.name);
        }
      });
    }
  }
}
