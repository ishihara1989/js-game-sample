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
  private healthBars: Map<Unit, Phaser.GameObjects.Graphics> = new Map();
  private skillBars: Map<Unit, Phaser.GameObjects.Graphics> = new Map();

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
    this.healthBars.clear();
    this.skillBars.clear();
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

    // プレイヤーユニットをリストに追加
    this.allUnits = [this.playerUnit];

    // プレイヤーユニットのUI作成
    this.createUnitUI(this.playerUnit);

    // ステージの作成と初期化
    this.currentStage = StageFactory.createStage(this.stageId, this);
    this.currentStage.initialize(this.playerUnit);

    // バトル開始
    this.startBattle();
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

  // ユニットのUI作成（プレイヤーと敵で共通）
  private createUnitUI(unit: Unit): void {
    console.log(`Creating UI for ${unit.name}, isPlayer: ${unit.isPlayer}`);

    // HPバー
    this.healthBars.set(unit, this.add.graphics());

    // スキルゲージ
    this.skillBars.set(unit, this.add.graphics());

    // 初回の描画
    const healthBar = this.healthBars.get(unit);
    const skillBar = this.skillBars.get(unit);
    if (healthBar && skillBar) {
      this.drawHealthBar(healthBar, unit, 20);
      this.drawSkillBar(skillBar, unit, 40);
    }
  }

  // 敵ユニットを追加するメソッド（ステージから呼び出される）
  addEnemyUnit(enemy: Unit): void {
    // 敵ユニットをリストに追加
    this.allUnits.push(enemy);

    // 敵のUI要素を作成
    this.createUnitUI(enemy);
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
    }
    unit.hpText.setText(`${Math.floor(unit.health)}/${unit.maxHealth}`);
    unit.hpText.setPosition(x + width / 2 - unit.hpText.width / 2, y - 15);
    unit.hpText.setDepth(1); // 前面に表示
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
    const enemies = this.allUnits.filter((unit) => unit !== this.playerUnit);
    enemies.forEach((enemy, index) => {
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
