import Phaser from 'phaser';
import { Unit } from '../objects/Unit';
import { BattleResult } from '../types/BattleTypes';

export class BattleScene extends Phaser.Scene {
  // ユニット関連
  private playerUnit!: Unit;
  private enemyUnit!: Unit;
  private allUnits: Unit[] = [];
  
  // バトル状態管理
  private battleActive: boolean = false;
  private battleResult: BattleResult | null = null;
  
  // UI要素
  private playerHealthBar!: Phaser.GameObjects.Graphics;
  private enemyHealthBar!: Phaser.GameObjects.Graphics;
  private playerSkillBar!: Phaser.GameObjects.Graphics;
  private enemySkillBar!: Phaser.GameObjects.Graphics;
  
  // デバッグテキスト
  private debugText!: Phaser.GameObjects.Text;
  
  constructor() {
    super('BattleScene');
  }
  
  create(): void {
    // 背景の設定
    this.createBackground();
    
    // ユニットの作成
    this.createUnits();
    
    // UI要素の作成
    this.createUI();
    
    // デバッグテキスト
    this.debugText = this.add.text(10, 10, 'Battle Started', { 
      font: '16px Arial', 
      color: '#ffffff' 
    });
    
    // バトル開始
    this.startBattle();
  }
  
  update(time: number, delta: number): void {
    if (!this.battleActive) return;
    
    // 全ユニットの更新
    this.allUnits.forEach(unit => unit.update(delta));
    
    // UIの更新
    this.updateUI();
    
    // 勝敗判定
    this.checkBattleEnd();
  }
  
  private createBackground(): void {
    // 簡単な地面の表現
    const ground = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x3a5c3a);
    ground.setOrigin(0, 0);
    
    // 格子状の線を描画して地面をわかりやすく
    const gridSize = 50;
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x336633, 0.3);
    
    // 横線
    for (let y = 0; y < this.cameras.main.height; y += gridSize) {
      gridGraphics.moveTo(0, y);
      gridGraphics.lineTo(this.cameras.main.width, y);
    }
    
    // 縦線
    for (let x = 0; x < this.cameras.main.width; x += gridSize) {
      gridGraphics.moveTo(x, 0);
      gridGraphics.lineTo(x, this.cameras.main.height);
    }
    
    gridGraphics.strokePath();
  }
  
  private createUnits(): void {
    // プレイヤーユニットの作成（左側）
    this.playerUnit = new Unit({
      scene: this,
      x: 200,
      y: 300,
      texture: 'player',
      name: 'Hero',
      maxHealth: 100,
      attack: 10,
      defense: 5,
      speed: 2,
      isPlayer: true,
      color: 0x5555ff
    });
    
    // 敵ユニットの作成（右側）
    this.enemyUnit = new Unit({
      scene: this,
      x: 600,
      y: 300,
      texture: 'enemy',
      name: 'Goblin',
      maxHealth: 80,
      attack: 8,
      defense: 3,
      speed: 1.5,
      isPlayer: false,
      color: 0xff5555
    });
    
    // 全ユニットリストの設定
    this.allUnits = [this.playerUnit, this.enemyUnit];
    
    // 敵と味方の参照を設定
    this.playerUnit.setTarget(this.enemyUnit);
    this.enemyUnit.setTarget(this.playerUnit);
  }
  
  private createUI(): void {
    // プレイヤーのHPバー
    this.playerHealthBar = this.add.graphics();
    
    // 敵のHPバー
    this.enemyHealthBar = this.add.graphics();
    
    // スキルゲージ
    this.playerSkillBar = this.add.graphics();
    this.enemySkillBar = this.add.graphics();
    
    // 初期UI描画
    this.updateUI();
  }
  
  private updateUI(): void {
    // HPバーのクリア
    this.playerHealthBar.clear();
    this.enemyHealthBar.clear();
    this.playerSkillBar.clear();
    this.enemySkillBar.clear();
    
    // プレイヤーのHPバー描画
    this.drawHealthBar(this.playerHealthBar, this.playerUnit, 20);
    
    // 敵のHPバー描画
    this.drawHealthBar(this.enemyHealthBar, this.enemyUnit, 20);
    
    // スキルゲージ描画
    this.drawSkillBar(this.playerSkillBar, this.playerUnit, 40);
    this.drawSkillBar(this.enemySkillBar, this.enemyUnit, 40);
    
    // デバッグ情報の更新
    this.updateDebugText();
  }
  
  private drawHealthBar(graphics: Phaser.GameObjects.Graphics, unit: Unit, yOffset: number): void {
    const x = unit.x - 40;
    const y = unit.y - yOffset;
    const width = 80;
    const height = 10;
    const healthPercent = unit.health / unit.maxHealth;
    
    // 背景（黒）
    graphics.fillStyle(0x000000, 0.7);
    graphics.fillRect(x, y, width, height);
    
    // HPバー（緑→黄→赤）
    const barColor = this.getHealthBarColor(healthPercent);
    graphics.fillStyle(barColor, 1);
    graphics.fillRect(x, y, width * healthPercent, height);
    
    // 枠線
    graphics.lineStyle(1, 0xffffff, 0.8);
    graphics.strokeRect(x, y, width, height);
    
    // HP値を表示
    if (!unit.hpText) {
      unit.hpText = this.add.text(x, y - 15, '', { font: '12px Arial', color: '#ffffff' });
    }
    unit.hpText.setText(`${Math.floor(unit.health)}/${unit.maxHealth}`);
    unit.hpText.setPosition(x + width / 2 - unit.hpText.width / 2, y - 15);
  }
  
  private drawSkillBar(graphics: Phaser.GameObjects.Graphics, unit: Unit, yOffset: number): void {
    const x = unit.x - 40;
    const y = unit.y - yOffset;
    const width = 80;
    const height = 6;
    const skillPercent = unit.skillCooldown / unit.skillMaxCooldown;
    
    // 背景（黒）
    graphics.fillStyle(0x000000, 0.7);
    graphics.fillRect(x, y, width, height);
    
    // スキルゲージ（青）
    graphics.fillStyle(0x3498db, 1);
    graphics.fillRect(x, y, width * skillPercent, height);
    
    // 枠線
    graphics.lineStyle(1, 0xffffff, 0.5);
    graphics.strokeRect(x, y, width, height);
  }
  
  private getHealthBarColor(percent: number): number {
    if (percent > 0.6) return 0x00ff00; // 緑
    if (percent > 0.3) return 0xffff00; // 黄
    return 0xff0000; // 赤
  }
  
  private updateDebugText(): void {
    this.debugText.setText(
      `Player: HP ${Math.floor(this.playerUnit.health)}/${this.playerUnit.maxHealth}, Skill: ${Math.floor(this.playerUnit.skillCooldown)}/${this.playerUnit.skillMaxCooldown}\n` +
      `Enemy: HP ${Math.floor(this.enemyUnit.health)}/${this.enemyUnit.maxHealth}, Skill: ${Math.floor(this.enemyUnit.skillCooldown)}/${this.enemyUnit.skillMaxCooldown}`
    );
  }
  
  private startBattle(): void {
    this.battleActive = true;
    this.debugText.setText('Battle Started');
  }
  
  private checkBattleEnd(): void {
    // どちらかのユニットのHPが0以下になったら勝敗判定
    if (this.playerUnit.health <= 0) {
      this.battleResult = {
        victory: false,
        defeatedUnit: this.playerUnit,
        victorUnit: this.enemyUnit,
        exp: 0,
        gold: 0,
        items: []
      };
      this.endBattle();
    } else if (this.enemyUnit.health <= 0) {
      this.battleResult = {
        victory: true,
        defeatedUnit: this.enemyUnit,
        victorUnit: this.playerUnit,
        exp: 50,
        gold: 30,
        items: ['Healing Potion']
      };
      this.endBattle();
    }
  }
  
  private endBattle(): void {
    this.battleActive = false;
    
    // バトル結果のデバッグ表示
    if (this.battleResult) {
      this.debugText.setText(`Battle Ended: ${this.battleResult.victory ? 'Victory!' : 'Defeat...'}`); 
    }
    
    // 少し待ってからリザルト画面へ
    this.time.delayedCall(1500, () => {
      this.scene.start('ResultScene', { result: this.battleResult });
    });
  }
  
  // 攻撃エフェクトを表示するメソッド（Unitクラスから呼び出される）
  showAttackEffect(attacker: Unit, target: Unit): void {
    const midX = (attacker.x + target.x) / 2;
    const midY = (attacker.y + target.y) / 2;
    
    // シンプルなエフェクト
    const attackEffect = this.add.circle(midX, midY, 15, attacker.isPlayer ? 0x6666ff : 0xff6666);
    
    // エフェクトのアニメーション
    this.tweens.add({
      targets: attackEffect,
      scale: { from: 0.5, to: 1.5 },
      alpha: { from: 1, to: 0 },
      duration: 300,
      onComplete: () => {
        attackEffect.destroy();
      }
    });
  }
  
  // スキルエフェクトを表示するメソッド（Unitクラスから呼び出される）
  showSkillEffect(caster: Unit, target: Unit): void {
    // スキルエフェクトの始点
    const startX = caster.x;
    const startY = caster.y;
    
    // スキルエフェクトの色（プレイヤーは青系、敵は赤系）
    const color = caster.isPlayer ? 0x00aaff : 0xff5500;
    
    // スキルのグラフィック
    const skillGraphics = this.add.graphics();
    skillGraphics.fillStyle(color, 0.8);
    
    // プレイヤーと敵で異なるスキルエフェクト
    if (caster.isPlayer) {
      // プレイヤースキル: 魔法の弾
      const projectile = this.add.circle(startX, startY, 10, color);
      this.tweens.add({
        targets: projectile,
        x: target.x,
        y: target.y,
        duration: 500,
        onComplete: () => {
          // 着弾時の爆発エフェクト
          const explosion = this.add.circle(target.x, target.y, 5, color);
          this.tweens.add({
            targets: explosion,
            scale: { from: 1, to: 3 },
            alpha: { from: 1, to: 0 },
            duration: 300,
            onComplete: () => {
              explosion.destroy();
              projectile.destroy();
            }
          });
        }
      });
    } else {
      // 敵スキル: 渦巻き状のエフェクト
      const swirl = this.add.graphics();
      swirl.fillStyle(color, 0.7);
      
      let angle = 0;
      let scale = 0;
      let alpha = 1;
      
      // 渦巻きエフェクトのアニメーション
      const animateSwirlEffect = () => {
        swirl.clear();
        if (alpha <= 0) {
          swirl.destroy();
          return;
        }
        
        for (let i = 0; i < 4; i++) {
          const currentAngle = angle + (Math.PI / 2) * i;
          const x = target.x + Math.cos(currentAngle) * 30 * scale;
          const y = target.y + Math.sin(currentAngle) * 30 * scale;
          swirl.fillCircle(x, y, 10 * scale);
        }
        
        angle += 0.1;
        scale += 0.04;
        alpha -= 0.02;
        
        swirl.setAlpha(alpha);
        
        if (alpha > 0) {
          this.time.delayedCall(20, animateSwirlEffect);
        }
      };
      
      animateSwirlEffect();
    }
  }
}
