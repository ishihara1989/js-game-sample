import Phaser from 'phaser';
import { Unit } from '../objects/Unit';
import { BattleResult } from '../types/BattleTypes';
import { Stage } from '../stages/Stage';
import { StageFactory } from '../stages/StageFactory';
import { StageStatus } from '../types/StageTypes';

export class BattleScene extends Phaser.Scene {
  // ユニット関連
  private playerUnit!: Unit;
  private allUnits: Unit[] = [];

  // バトル状態管理
  private battleActive: boolean = false;
  private battleResult: BattleResult | null = null;

  // UI要素
  private playerHealthBar!: Phaser.GameObjects.Graphics;
  private playerSkillBar!: Phaser.GameObjects.Graphics;
  private enemyHealthBars: Map<Unit, Phaser.GameObjects.Graphics> = new Map();
  private enemySkillBars: Map<Unit, Phaser.GameObjects.Graphics> = new Map();

  // デバッグテキスト
  private debugText!: Phaser.GameObjects.Text;

  // ステージ関連
  private stageId: string = '1-1'; // デフォルトステージ
  private currentStage: Stage | null = null;

  constructor() {
    super('BattleScene');
  }

  init(data: any): void {
    // 受け取ったパラメータをチェック
    if (data && data.stageId) {
      this.stageId = data.stageId;
      console.log(`Initializing battle with stage ID: ${this.stageId}`);
    } else {
      this.stageId = '1-1'; // デフォルト値
      console.log('No stage ID provided, using default stage 1-1');
    }

    // バトル状態をリセット
    this.battleActive = false;
    this.battleResult = null;
    this.allUnits = [];
    this.enemyHealthBars.clear();
    this.enemySkillBars.clear();
  }

  create(): void {
    // デバッグテキスト（最初に作成）
    this.debugText = this.add.text(10, 10, 'Battle Starting...', {
      font: '16px Arial',
      color: '#ffffff',
    });

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
      color: 0x5555ff,
    });

    // 全ユニットリストの設定
    this.allUnits = [this.playerUnit];

    // ステージの作成と初期化
    this.currentStage = StageFactory.createStage(this.stageId, this);
    this.currentStage.initialize(this.playerUnit);

    // UI要素の作成
    this.createUI();

    // バトル開始
    this.startBattle();
  }

  update(time: number, delta: number): void {
    if (!this.battleActive) return;

    // プレイヤーユニットの更新
    this.playerUnit.update(delta);

    // ステージの更新（敵の行動含む）
    if (this.currentStage) {
      this.currentStage.update(delta);
    }

    // UIの更新
    this.updateUI();
  }

  private createUI(): void {
    // プレイヤーのHPバー
    this.playerHealthBar = this.add.graphics();

    // スキルゲージ
    this.playerSkillBar = this.add.graphics();

    // 敵のUIも作成 (ステージから敵ユニットを取得)
    if (this.currentStage) {
      // 敵のUIを作成（敵ユニットが生成された後に呼び出す必要がある）
      this.createEnemyUI();
    }

    // 初期UI描画
    this.updateUI();
  }

  private createEnemyUI(): void {
    if (!this.currentStage) return;
    
    // 敵リストを取得 (currentStageのenemyUnitsプロパティを公開する必要がある)
    const enemyUnits = this.getEnemyUnits();
    
    enemyUnits.forEach(enemy => {
      // 各敵ユニットのHPバーとスキルバーを作成
      this.enemyHealthBars.set(enemy, this.add.graphics());
      this.enemySkillBars.set(enemy, this.add.graphics());
    });
  }

  // 敵ユニットを取得するメソッド（ステージからユニットリストを取得）
  private getEnemyUnits(): Unit[] {
    // 直接ステージから敵ユニットを取得する方法を実装
    // 本来はステージクラスにゲッターを追加するべきだが、
    // 一時的な解決策としてallUnitsから自分以外のユニットを返す
    return this.allUnits.filter(unit => unit !== this.playerUnit);
  }

  // 敵ユニットを追加するメソッド（ステージから呼び出される）
  addEnemyUnit(enemy: Unit): void {
    // 敵ユニットを追加
    this.allUnits.push(enemy);
    
    // 敵のUI要素も作成
    this.enemyHealthBars.set(enemy, this.add.graphics());
    this.enemySkillBars.set(enemy, this.add.graphics());
  }

  private updateUI(): void {
    if (!this.playerHealthBar || !this.playerSkillBar) {
      return; // UIが初期化されていない場合は何もしない
    }

    // HPバーのクリア
    this.playerHealthBar.clear();
    this.playerSkillBar.clear();
    
    // 敵のUIもクリア
    this.enemyHealthBars.forEach(bar => bar.clear());
    this.enemySkillBars.forEach(bar => bar.clear());

    // プレイヤーのHPバー描画
    this.drawHealthBar(this.playerHealthBar, this.playerUnit, 20);

    // スキルゲージ描画
    this.drawSkillBar(this.playerSkillBar, this.playerUnit, 40);
    
    // 敵のHPバー描画
    this.enemyHealthBars.forEach((bar, enemy) => {
      this.drawHealthBar(bar, enemy, 20);
    });
    
    // 敵のスキルゲージ描画
    this.enemySkillBars.forEach((bar, enemy) => {
      this.drawSkillBar(bar, enemy, 40);
    });

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
    if (!this.debugText) return;

    let debugInfo = `Player: HP ${Math.floor(this.playerUnit.health)}/${this.playerUnit.maxHealth}, Skill: ${Math.floor(this.playerUnit.skillCooldown)}/${this.playerUnit.skillMaxCooldown}\n`;
    
    // 敵の情報も表示
    this.getEnemyUnits().forEach((enemy, index) => {
      debugInfo += `Enemy ${index + 1}: HP ${Math.floor(enemy.health)}/${enemy.maxHealth}\n`;
    });
    
    // ステージ情報の追加
    if (this.currentStage) {
      debugInfo += `Stage: ${this.currentStage.id} (${this.currentStage.name})\n`;
    }

    this.debugText.setText(debugInfo);
  }

  private startBattle(): void {
    this.battleActive = true;
    
    if (this.currentStage) {
      this.currentStage.start();
    }
    
    if (this.debugText) {
      this.debugText.setText('Battle Started');
    }
  }

  /**
   * バトルを終了する
   * @param result バトル結果
   */
  endBattle(result: BattleResult): void {
    this.battleActive = false;
    this.battleResult = result;

    // バトル結果のデバッグ表示
    if (this.battleResult && this.debugText) {
      this.debugText.setText(
        `Battle Ended: ${this.battleResult.victory ? 'Victory!' : 'Defeat...'}`
      );
    }

    // ステージをクリーンアップ
    if (this.currentStage) {
      this.currentStage.cleanup();
    }

    // リザルト画面へ
    this.scene.start('ResultScene', { result: this.battleResult });
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
      },
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
            },
          });
        },
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
