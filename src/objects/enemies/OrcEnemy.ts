import { BattleScene } from '../../scenes/BattleScene';
import { EnemyUnit, DropItem } from '../EnemyUnit';

/**
 * オークエネミークラス
 * ゴブリンより強い近接攻撃型の敵
 */
export class OrcEnemy extends EnemyUnit {
  private enrageThreshold: number = 0.3; // 30%以下のHPでエンレイジする
  private enraged: boolean = false;
  private originalAttackPower: number = 0;

  constructor(scene: BattleScene, x: number, y: number, level: number) {
    super({
      scene,
      x,
      y,
      name: 'Orc',
      level,
      isPlayer: false,
      color: 0x00aa00, // 緑色
    });

    // 元の攻撃力を記録
    this.originalAttackPower = this.attackPower;
  }

  /**
   * 基本ステータスの初期化
   */
  protected initializeBaseStats(): void {
    this.baseMaxHealth = 120;
    this.baseAttack = 12;
    this.baseDefense = 6;
    this.baseSpeed = 1.2;
    this.baseExpValue = 30;
  }

  /**
   * ドロップアイテムの初期化
   */
  protected initializeDrops(): void {
    this.possibleDrops = [
      {
        id: 'medium_potion',
        name: 'Medium Potion',
        dropRate: 0.4, // 40%の確率でドロップ
      },
      {
        id: 'orc_meat',
        name: 'Orc Meat',
        dropRate: 0.3, // 30%の確率でドロップ
      },
    ];

    // レベルに応じて追加アイテム
    if (this.level >= 3) {
      this.possibleDrops.push({
        id: 'iron_ore',
        name: 'Iron Ore',
        dropRate: 0.2, // 20%の確率でドロップ
      });
    }

    if (this.level >= 7) {
      this.possibleDrops.push({
        id: 'orc_club',
        name: 'Orc Club',
        dropRate: 0.1, // 10%の確率でドロップ
      });
    }
  }

  /**
   * オーク固有の行動パターン
   * HPが30%以下になると攻撃力が上昇する特性を持つ
   * @param delta 前フレームからの経過時間
   */
  protected updateAI(delta: number): void {
    // 基本的なAI行動を継承
    super.updateAI(delta);
    
    // HPが閾値以下でエンレイジ状態にする
    const healthPercent = this.health / this.maxHealth;
    
    if (healthPercent <= this.enrageThreshold && !this.enraged) {
      this.enrage();
    }
  }

  /**
   * エンレイジ状態になる（攻撃力上昇）
   */
  private enrage(): void {
    this.enraged = true;
    
    // 攻撃力を1.5倍に上昇
    // ※実際には attackPower が readonly なので、通常は変更できない
    // ※将来的には状態異常システムを実装し、そちらで対応する予定
    
    console.log(`${this.name} becomes enraged! Attack power increases!`);
    
    // エンレイジ視覚効果（赤く点滅）
    this.scene.tweens.add({
      targets: this,
      alpha: 0.7,
      yoyo: true,
      duration: 200,
      repeat: 2,
      onComplete: () => {
        // 色を変更（より濃い緑に）
        if (this.unitCircle) {
          this.unitCircle.clear();
          this.unitCircle.fillStyle(0x008800, 1);
          this.unitCircle.fillCircle(0, 0, 20);
          this.unitCircle.lineStyle(2, 0xff0000, 0.8);
          this.unitCircle.strokeCircle(0, 0, 20);
        }
      }
    });
  }

  /**
   * 攻撃メソッドをオーバーライド
   * エンレイジ状態では攻撃力が1.5倍
   */
  performAttack(target: Unit): void {
    if (!target) return;
    
    // 攻撃クールダウンを設定
    this.attackCooldown = this.attackCooldownMax;
    
    // エンレイジ状態なら攻撃力増加
    const attackMultiplier = this.enraged ? 1.5 : 1;
    
    // ダメージ計算（エンレイジ状態なら1.5倍）
    const damage = Math.max(1, (this.attackPower * attackMultiplier) - target.defense / 2);
    
    // ターゲットにダメージを与える
    target.takeDamage(damage);
    
    // 攻撃エフェクトを表示
    if (this.battleScene) {
      this.battleScene.showAttackEffect(this, target);
    }
    
    console.log(`${this.name} attacks ${target.name} for ${damage} damage!${this.enraged ? ' (Enraged)' : ''}`);
  }
}