import Phaser from 'phaser';
import { EnemyUnit } from '../EnemyUnit';
import { BattleScene } from '../../scenes/BattleScene';
import { Unit } from '../Unit';

export class GoblinEnemy extends EnemyUnit {
  // ゴブリンの特殊ステータス
  private lastAttackTime: number = 0;
  private readonly attackInterval: number = 1000; // 1秒間隔で連続攻撃を試みる
  private consecutiveAttacks: number = 0;
  private readonly maxConsecutiveAttacks: number = 3; // 最大連続攻撃回数
  
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
      texture: 'goblin', // テクスチャキー
      name: `Goblin Lv.${config.level}`,
      level: config.level,
      baseHealth: 80, // ゴブリンの基本HP
      baseAttack: 10, // ゴブリンの基本攻撃力
      baseDefense: 5,  // ゴブリンの基本防御力
      baseSpeed: 80,   // ゴブリンの基本速度
      color: 0xaa5500  // 茶色
    });
    
    // 経験値とドロップ率を調整
    this.experienceValue = Math.floor(this.experienceValue * 0.9); // 基本より少し少ない経験値
    this.dropRate = 0.35; // ドロップ率を標準に設定
  }

  // 更新処理
  update(delta: number): void {
    // 親クラスの更新処理を呼び出し
    super.update(delta);
    
    // 連続攻撃の処理
    this.updateConsecutiveAttacks(delta);
  }
  
  // 連続攻撃の更新
  private updateConsecutiveAttacks(delta: number): void {
    const currentTime = this.scene.time.now;
    
    // 最後の攻撃から一定時間経過したらカウンターをリセット
    if (currentTime - this.lastAttackTime > 2000 && this.consecutiveAttacks > 0) {
      this.consecutiveAttacks = 0;
    }
  }
  
  // 攻撃処理をオーバーライド
  performAttack(target: Unit): void {
    // 親クラスの攻撃処理を呼び出し
    super.performAttack(target);
    
    // 攻撃時間を記録
    this.lastAttackTime = this.scene.time.now;
    
    // 連続攻撃カウンターを増加
    this.consecutiveAttacks++;
    
    // 連続攻撃が可能な場合、追加攻撃を行う
    if (this.consecutiveAttacks < this.maxConsecutiveAttacks) {
      // 50%の確率で追加攻撃
      if (Math.random() < 0.5) {
        console.log(`${this.name} performs a quick additional attack!`);
        
        // 追加攻撃のエフェクト表示
        if (this.scene instanceof BattleScene) {
          // 小さめのエフェクトを表示
          const midX = (this.x + target.x) / 2;
          const midY = (this.y + target.y) / 2;
          
          const quickAttackEffect = this.scene.add.graphics();
          quickAttackEffect.fillStyle(0xffff00, 0.7);
          quickAttackEffect.fillCircle(midX, midY, 15);
          quickAttackEffect.setDepth(20);
          
          // エフェクトを短時間で消す
          this.scene.tweens.add({
            targets: quickAttackEffect,
            alpha: 0,
            duration: 300,
            onComplete: () => {
              quickAttackEffect.destroy();
            }
          });
        }
        
        // 通常の半分のダメージを与える
        const quickDamage = Math.max(1, Math.floor(this.attackPower / 2 - target.defense / 3));
        target.takeDamage(quickDamage);
      }
    }
  }
  
  // AIの更新処理をオーバーライド
  updateAI(delta: number): void {
    // 連続攻撃中は通常より近い距離を維持
    if (this.consecutiveAttacks > 0) {
      const target = this.getTarget();
      if (target) {
        const distance = Phaser.Math.Distance.Between(
          this.x, this.y, target.x, target.y
        );
        
        // 連続攻撃中は近い距離を維持
        if (distance > 100) {
          // より近い位置に移動
          this.moveToRandomPositionNearTarget(50, 80);
        }
      }
    } else {
      // 通常時は親クラスのAI処理を使用
      super.updateAI(delta);
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