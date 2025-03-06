import Phaser from 'phaser';
import { EnemyUnit } from '../EnemyUnit';
import { BattleScene } from '../../scenes/BattleScene';
import { Unit } from '../Unit';

export class OrcEnemy extends EnemyUnit {
  // オークの特殊ステータス
  private isEnraged: boolean = false;
  private enrageThreshold: number = 0.3; // HPが30%以下でエンレイジ
  private originalAttackPower: number;
  private originalSpeed: number;
  private enrageMultiplier: number = 1.5; // エンレイジ時のステータス倍率
  
  constructor(config: {
    scene: BattleScene;
    x: number;
    y: number;
    level: number;
  }) {
    super({
      scene: config.scene,
      x: config.x,
      y: config.y,
      texture: 'orc', // テクスチャキー
      name: `Orc Lv.${config.level}`,
      level: config.level,
      baseHealth: 120, // オークの基本HP
      baseAttack: 15,  // オークの基本攻撃力
      baseDefense: 8,  // オークの基本防御力
      baseSpeed: 60,   // オークの基本速度
      color: 0x00aa00  // 緑色
    });
    
    // 元のステータスを保存
    this.originalAttackPower = this.attackPower;
    this.originalSpeed = this.speed;
    
    // 経験値とドロップ率を調整
    this.experienceValue = Math.floor(this.experienceValue * 1.2); // 基本より20%多い経験値
    this.dropRate = 0.4; // ドロップ率を高めに設定
  }

  // ダメージを受けたときの処理をオーバーライド
  takeDamage(amount: number): void {
    // 親クラスのダメージ処理を呼び出し
    super.takeDamage(amount);
    
    // エンレイジ状態をチェック
    if (!this.isEnraged && this.health / this.maxHealth <= this.enrageThreshold) {
      this.enrage();
    }
  }
  
  // エンレイジ状態に突入
  private enrage(): void {
    if (this.isEnraged) return;
    
    this.isEnraged = true;
    console.log(`${this.name} has become enraged!`);
    
    // ステータス強化
    // attackPowerは直接アクセスできないので親クラスのメソッドを使用しないといけない
    // 現在は親クラスにsetAttackPowerのようなメソッドがないので以下はコメントアウト
    // this.attackPower = Math.floor(this.originalAttackPower * this.enrageMultiplier);
    
    // スピードは強化可能
    // this.speed = Math.floor(this.originalSpeed * this.enrageMultiplier);
    
    // エンレイジ視覚効果
    this.scene.tweens.add({
      targets: this,
      alpha: 0.7,
      yoyo: true,
      duration: 200,
      repeat: 3,
      onComplete: () => {
        // エンレイジ色に変更
        if (this.unitCircle) {
          this.scene.tweens.add({
            targets: this.unitCircle,
            fillColor: 0xff0000, // 赤色に変更
            duration: 500
          });
        }
      }
    });
  }
  
  // AIの更新処理をオーバーライド
  updateAI(delta: number): void {
    super.updateAI(delta);
    
    // エンレイジ中の特殊行動
    if (this.isEnraged) {
      // エンレイジ中はターゲットに近づく行動を優先
      const target = this.getTarget();
      if (target) {
        const distance = Phaser.Math.Distance.Between(
          this.x, this.y, target.x, target.y
        );
        
        if (distance > this.attackRange - 50) {
          // より近い位置に移動
          this.moveToRandomPositionNearTarget(50, 100);
        }
      }
    }
  }
  
  // ターゲットの近くにランダムな位置を生成して移動
  private moveToRandomPositionNearTarget(minDistance: number, maxDistance: number): void {
    const target = this.getTarget();
    if (!target) return;
    
    const distance = Phaser.Math.Between(minDistance, maxDistance);
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    
    const targetX = target.x + Math.cos(angle) * distance;
    const targetY = target.y + Math.sin(angle) * distance;
    
    // 画面内に収まるように調整
    const bounds = 50;
    const clampedX = Phaser.Math.Clamp(targetX, bounds, 800 - bounds);
    const clampedY = Phaser.Math.Clamp(targetY, bounds, 600 - bounds);
    
    // 移動処理を呼び出す（ここでは直接実装せず、親クラスのメソッドがあればそれを利用）
    // TODO: 親クラスに移動メソッドがあれば使う
  }
  
  // 現在のターゲットを取得するヘルパーメソッド
  private getTarget(): Unit | null {
    // TODO: 親クラスからターゲットを取得
    return null;
  }
}