import Phaser from 'phaser';
import { Unit } from '../objects/Unit';
import { BattleResult } from '../types/BattleTypes';
import { Stage } from '../stages/Stage';
import { StageFactory } from '../stages/StageFactory';
// Remove unused import
// import { StageStatus } from '../types/StageTypes';
import { createBasicMeleeSkill, createBasicRangeSkill, createBasicAreaSkill } from '../skills';

export class BattleScene extends Phaser.Scene {
  // ユニット関連
  private playerUnit!: Unit;
  private allUnits: Unit[] = [];

  // バトル状態管理
  private battleActive: boolean = false;
  private battleResult: BattleResult | null = null;

  // UI要素
  private healthBars: Map<Unit, Phaser.GameObjects.Graphics> = new Map();
  private skillBars: Map<Unit, Phaser.GameObjects.Graphics> = new Map();
  private expBar: Phaser.GameObjects.Graphics | null = null; // プレイヤーのEXPバー

  // デバッグテキスト
  private debugText!: Phaser.GameObjects.Text;

  // ステージ関連
  private stageId: string = '1-1'; // デフォルトステージ
  private currentStage: Stage | null = null;

  constructor() {
    super('BattleScene');
  }

  // Changed type from 'any' to more explicit type
  init(data: { stageId?: string }): void {
    // 受け取ったパラメータをチェック
    if (data && data.stageId) {
      this.stageId = data.stageId;
      console.warn(`Initializing battle with stage ID: ${this.stageId}`);
    } else {
      this.stageId = '1-1'; // デフォルト値
      console.warn('No stage ID provided, using default stage 1-1');
    }

    // バトル状態をリセット
    this.battleActive = false;
    this.battleResult = null;
    this.allUnits = [];
    this.healthBars.clear();
    this.skillBars.clear();
    this.expBar = null;
  }

  create(): void {
    // デバッグテキスト（最初に作成）
    this.debugText = this.add.text(10, 10, 'Battle Starting...', {
      font: '16px Arial',
      color: '#ffffff',
    });
    // デバッグテキストは最前面に表示
    this.debugText.setDepth(100);

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

    // プレイヤーユニットをリストに追加
    this.allUnits = [this.playerUnit];

    // プレイヤーユニットに基本スキルを追加
    this.setupPlayerSkills();

    // プレイヤーユニットのUI作成
    this.createUnitUI(this.playerUnit);
    
    // 経験値バーの作成
    this.createExpBar();

    // ステージの作成と初期化
    this.currentStage = StageFactory.createStage(this.stageId, this);
    this.currentStage.initialize(this.playerUnit);

    // バトル開始
    this.startBattle();
    
    // 定期的なユニットチェック
    this.time.addEvent({
      delay: 500, // 500ミリ秒ごとに実行
      callback: this.checkUnits,
      callbackScope: this,
      loop: true
    });
  }

  update(time: number, delta: number): void {
    if (!this.battleActive) return;

    // 全ユニットの更新
    this.allUnits.forEach((unit) => {
      if (unit.health > 0) {
        unit.update(delta);
      }
    });

    // ステージの更新
    if (this.currentStage) {
      this.currentStage.update(delta);
    }

    // UIの更新
    this.updateAllUI();

    // デバッグ情報の更新
    this.updateDebugText();
  }
  
  /**
   * ユニット状態のチェック（敵の死亡判定など）
   */
  private checkUnits(): void {
    if (!this.battleActive) return;
    
    const deadEnemies: Unit[] = [];
    
    // HPが0になった敵を検出
    this.allUnits.forEach(unit => {
      if (unit !== this.playerUnit && unit.health <= 0) {
        deadEnemies.push(unit);
      }
    });
    
    // 敵の処理
    deadEnemies.forEach(enemy => {
      // 経験値の獲得
      const expValue = enemy.getExpValue();
      const leveledUp = this.playerUnit.addExperience(expValue);
      
      if (leveledUp) {
        // レベルアップ効果など、必要に応じて処理を追加
        console.warn(`Player leveled up! New abilities unlocked.`);
      }
      
      // ユニットリストから削除
      this.allUnits = this.allUnits.filter(unit => unit !== enemy);
      
      // UI要素を削除
      const healthBar = this.healthBars.get(enemy);
      if (healthBar) {
        healthBar.destroy();
        this.healthBars.delete(enemy);
      }
      
      const skillBar = this.skillBars.get(enemy);
      if (skillBar) {
        skillBar.destroy();
        this.skillBars.delete(enemy);
      }
      
      // ユニットのクリーンアップ
      enemy.cleanup();
    });
    
    // 経験値バーの更新
    this.updateExpBar();
    
    // プレイヤーの死亡チェック
    if (this.playerUnit.health <= 0) {
      // 敗北
      this.endBattle({ 
        victory: false, 
        stageId: this.stageId,
        enemiesDefeated: 0,
        experienceGained: 0,
        itemsDropped: []
      });
    }
  }

  // プレイヤーユニットに基本スキルを設定
  private setupPlayerSkills(): void {
    if (!this.playerUnit) return;

    // レベルによって解放されるスキルを設定
    this.playerUnit.setSkillUnlocks([
      // レベル1 - 近接攻撃
      {
        level: 1,
        skillFactory: createBasicMeleeSkill,
      },
      // レベル2 - 遠距離攻撃
      {
        level: 2,
        skillFactory: createBasicRangeSkill,
        message: "遠距離からの攻撃が可能になった!"
      },
      // レベル3 - 範囲攻撃
      {
        level: 3,
        skillFactory: createBasicAreaSkill,
        message: "複数の敵を同時に攻撃できるようになった!"
      }
    ]);

    console.warn('Player skills setup completed');
  }

  // ユニットのUI作成（プレイヤーと敵で共通）
  private createUnitUI(unit: Unit): void {
    console.warn(`Creating UI for ${unit.name}, isPlayer: ${unit.isPlayer}`);

    // HPバー
    const healthBar = this.add.graphics();
    this.healthBars.set(unit, healthBar);
    // HPバーに高い深度を設定
    healthBar.setDepth(10);

    // スキルゲージ
    const skillBar = this.add.graphics();
    this.skillBars.set(unit, skillBar);
    // スキルゲージに高い深度を設定
    skillBar.setDepth(10);

    // 初回の描画
    if (healthBar && skillBar) {
      this.drawHealthBar(healthBar, unit, 20);
      this.drawSkillBar(skillBar, unit, 40);
    }
  }
  
  /**
   * 経験値バーの作成
   */
  private createExpBar(): void {
    // 経験値バーのグラフィック
    this.expBar = this.add.graphics();
    this.expBar.setDepth(10);
    
    // 初回描画
    this.updateExpBar();
  }
  
  /**
   * 経験値バーの更新
   */
  private updateExpBar(): void {
    if (!this.expBar || !this.playerUnit) return;
    
    this.expBar.clear();
    
    // 画面下部に経験値バーを配置
    const barWidth = 400;
    const barHeight = 15;
    const x = this.sys.game.config.width as number / 2 - barWidth / 2;
    const y = (this.sys.game.config.height as number) - 30;
    
    // 背景（黒）
    this.expBar.fillStyle(0x000000, 0.7);
    this.expBar.fillRect(x, y, barWidth, barHeight);
    
    // テキスト表示用に現在の経験値情報を取得
    // 注意: これらのプロパティはprivateなので、本来はUnitクラスにgetterメソッドを追加すべき
    // デモのため、as anyを使用してアクセス
    const currentExp = (this.playerUnit as any).experience || 0;
    const requiredExp = (this.playerUnit as any).requiredExperience || 100;
    const playerLevel = this.playerUnit.getLevel();
    
    // 経験値バー（青緑）
    const expPercent = Math.min(1, currentExp / requiredExp);
    this.expBar.fillStyle(0x00aaff, 1);
    this.expBar.fillRect(x, y, barWidth * expPercent, barHeight);
    
    // 枠線
    this.expBar.lineStyle(2, 0xffffff, 0.8);
    this.expBar.strokeRect(x, y, barWidth, barHeight);
    
    // EXPテキスト
    let expText = this.children.getByName('exp_text') as Phaser.GameObjects.Text;
    if (!expText) {
      expText = this.add.text(x + barWidth / 2, y - 15, '', {
        font: '12px Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      });
      expText.setName('exp_text');
      expText.setOrigin(0.5, 0.5);
      expText.setDepth(11);
    }
    
    expText.setText(`Level ${playerLevel} - EXP: ${currentExp}/${requiredExp}`);
  }

  // 敵ユニットを追加するメソッド（ステージから呼び出される）
  addEnemyUnit(enemy: Unit): void {
    // 敵ユニットをリストに追加
    this.allUnits.push(enemy);

    // 敵のUI要素を作成
    this.createUnitUI(enemy);
  }

  // 全ユニットを取得するメソッド（スキルシステムで使用）
  getAllUnits(): Unit[] {
    return this.allUnits.filter((unit) => unit.health > 0);
  }

  // 全ユニットのUI更新
  private updateAllUI(): void {
    // 全ユニットのバーをクリア
    this.healthBars.forEach((bar) => bar.clear());
    this.skillBars.forEach((bar) => bar.clear());

    // すべてのユニットのバーを更新
    this.allUnits.forEach((unit) => {
      const healthBar = this.healthBars.get(unit);
      const skillBar = this.skillBars.get(unit);

      if (healthBar && skillBar) {
        this.drawHealthBar(healthBar, unit, 20);
        this.drawSkillBar(skillBar, unit, 40);
      }
    });
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
      unit.hpText = this.add.text(x, y - 15, '', {
        font: '12px Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
      });
      // HP値テキストに高い深度を設定
      unit.hpText.setDepth(11);
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

    let debugInfo = `Player: HP ${Math.floor(this.playerUnit.health)}/${this.playerUnit.maxHealth}, Skill: ${Math.floor(this.playerUnit.skillCooldown)}/${this.playerUnit.skillMaxCooldown}\\n`;
    debugInfo += `Level: ${this.playerUnit.getLevel()}\\n`;

    // 敵の情報も表示
    const enemies = this.allUnits.filter((unit) => unit !== this.playerUnit);
    enemies.forEach((enemy, index) => {
      debugInfo += `Enemy ${index + 1}: HP ${Math.floor(enemy.health)}/${enemy.maxHealth}\\n`;
    });

    // ステージ情報の追加
    if (this.currentStage) {
      debugInfo += `Stage: ${this.currentStage.id} (${this.currentStage.name})\\n`;
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

    // すべてのユニットをクリーンアップ
    this.allUnits.forEach((unit) => {
      // Unit側のcleanupメソッドを呼び出す
      unit.cleanup();
    });

    // UIのクリーンアップ
    this.healthBars.forEach((bar) => bar.destroy());
    this.skillBars.forEach((bar) => bar.destroy());
    this.healthBars.clear();
    this.skillBars.clear();
    
    // 経験値バーのクリーンアップ
    if (this.expBar) {
      this.expBar.destroy();
      this.expBar = null;
    }
    
    // 経験値テキストの削除
    const expText = this.children.getByName('exp_text');
    if (expText) {
      expText.destroy();
    }

    // リストをクリア
    this.allUnits = [];

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
    // エフェクトに高い深度を設定
    attackEffect.setDepth(20);

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
    // スキルグラフィックに高い深度を設定
    skillGraphics.setDepth(20);
    skillGraphics.fillStyle(color, 0.8);

    // プレイヤーと敵で異なるスキルエフェクト
    if (caster.isPlayer) {
      // プレイヤースキル: 魔法の弾
      const projectile = this.add.circle(startX, startY, 10, color);
      // 投射物に高い深度を設定
      projectile.setDepth(20);

      this.tweens.add({
        targets: projectile,
        x: target.x,
        y: target.y,
        duration: 500,
        onComplete: () => {
          // 着弾時の爆発エフェクト
          const explosion = this.add.circle(target.x, target.y, 5, color);
          // 爆発エフェクトに高い深度を設定
          explosion.setDepth(20);

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
      // 渦巻きエフェクトに高い深度を設定
      swirl.setDepth(20);
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
