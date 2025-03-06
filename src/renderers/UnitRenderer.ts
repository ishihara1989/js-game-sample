import Phaser from 'phaser';
import { Unit } from '../objects/Unit';
import { Renderer } from './Renderer';

/**
 * ユニット描画クラス
 * Unitの見た目の描画を担当する
 */
export class UnitRenderer implements Renderer {
  // 参照するユニット
  protected unit: Unit;

  // 所属するシーン
  protected scene: Phaser.Scene;

  // 描画要素 - サブクラスからアクセスできるようprotectedに変更
  protected unitCircle: Phaser.GameObjects.Graphics;
  protected directionIndicator: Phaser.GameObjects.Graphics;
  protected nameText: Phaser.GameObjects.Text;
  protected levelText: Phaser.GameObjects.Text;
  protected hpText: Phaser.GameObjects.Text;
  protected hpBar: Phaser.GameObjects.Graphics;
  protected skillBar: Phaser.GameObjects.Graphics;

  // 色設定 - サブクラスからアクセスできるようprotectedに変更
  protected unitColor: number;

  /**
   * コンストラクタ
   * @param unit 描画対象のユニット
   * @param scene 描画先のシーン
   * @param color ユニットの色
   */
  constructor(unit: Unit, scene: Phaser.Scene, color: number = 0x5555ff) {
    this.unit = unit;
    this.scene = scene;
    this.unitColor = color;

    // グラフィックス要素を初期化
    this.unitCircle = this.scene.add.graphics();
    this.directionIndicator = this.scene.add.graphics();
    this.nameText = this.scene.add.text(0, 0, '', {});
    this.levelText = this.scene.add.text(0, 0, '', {});
    this.hpText = this.scene.add.text(0, 0, '', {});
    this.hpBar = this.scene.add.graphics();
    this.skillBar = this.scene.add.graphics();

    // 初期化処理
    this.initialize();
  }

  /**
   * 初期化処理
   */
  initialize(): void {
    // ユニット本体の描画設定
    this.unitCircle.setDepth(5);

    // 方向インディケータの描画設定
    this.directionIndicator.setDepth(5);

    // 名前テキストの設定
    this.nameText = this.scene.add.text(this.unit.x, this.unit.y - 60, this.unit.name, {
      font: '14px Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.nameText.setOrigin(0.5);
    this.nameText.setDepth(10);

    // レベルテキストの設定
    this.levelText = this.scene.add.text(
      this.unit.x,
      this.unit.y - 45,
      `Lv.${this.unit.getLevel()}`,
      {
        font: '12px Arial',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 2,
      }
    );
    this.levelText.setOrigin(0.5);
    this.levelText.setDepth(10);

    // HPバーの設定
    this.hpBar = this.scene.add.graphics();
    this.hpBar.setDepth(10);

    // HPテキストの設定
    this.hpText = this.scene.add.text(this.unit.x, this.unit.y - 35, '', {
      font: '12px Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.hpText.setOrigin(0.5);
    this.hpText.setDepth(11);

    // スキルゲージの設定
    this.skillBar = this.scene.add.graphics();
    this.skillBar.setDepth(10);

    // 初回描画
    this.render();
  }

  /**
   * 更新処理
   * @param delta 前フレームからの経過時間
   */
  update(delta: number): void {
    // 位置に関連する更新は描画時に行うため、ここでは特に何もしない
  }

  /**
   * 描画処理
   */
  render(): void {
    // 位置の更新
    this.updatePosition();

    // ユニット本体の描画
    this.drawUnit();

    // 方向インディケータの描画
    this.drawDirectionIndicator();

    // HPバーの描画
    this.drawHealthBar();

    // スキルゲージの描画
    this.drawSkillBar();

    // テキスト類の更新
    this.updateTexts();
  }

  /**
   * クリーンアップ
   */
  destroy(): void {
    // グラフィックスの削除
    this.unitCircle.destroy();
    this.directionIndicator.destroy();

    // テキストの削除
    this.nameText.destroy();
    this.levelText.destroy();
    this.hpText.destroy();

    // バーの削除
    this.hpBar.destroy();
    this.skillBar.destroy();
  }

  /**
   * 位置の更新
   */
  protected updatePosition(): void {
    // privateからprotectedに変更
    // テキスト類の位置更新
    this.nameText.setPosition(this.unit.x, this.unit.y - 60);
    this.levelText.setPosition(this.unit.x, this.unit.y - 45);
  }

  /**
   * ユニット本体の描画
   */
  protected drawUnit(): void {
    // privateからprotectedに変更
    this.unitCircle.clear();
    this.unitCircle.fillStyle(this.unitColor, 1);
    this.unitCircle.fillCircle(this.unit.x, this.unit.y, 20);
    this.unitCircle.lineStyle(2, 0xffffff, 0.8);
    this.unitCircle.strokeCircle(this.unit.x, this.unit.y, 20);
  }

  /**
   * 方向インディケータの描画
   */
  protected drawDirectionIndicator(): void {
    // privateからprotectedに変更
    // ユニットが向いている方向を示す三角形
    // ターゲットがいる場合はターゲットの方向を向く
    if (this.unit['target']) {
      const target = this.unit['target'] as Unit;
      const angle = Phaser.Math.Angle.Between(this.unit.x, this.unit.y, target.x, target.y);
      this.updateDirection(angle);
    }
  }

  /**
   * 向きの更新
   * @param angle 向く角度
   */
  protected updateDirection(angle: number): void {
    this.directionIndicator.clear();
    this.directionIndicator.fillStyle(0xffffff, 1);

    // 回転した三角形を描画
    const x1 = this.unit.x + Math.cos(angle) * 30;
    const y1 = this.unit.y + Math.sin(angle) * 30;
    const x2 = this.unit.x + Math.cos(angle + Math.PI * 0.8) * 15;
    const y2 = this.unit.y + Math.sin(angle + Math.PI * 0.8) * 15;
    const x3 = this.unit.x + Math.cos(angle - Math.PI * 0.8) * 15;
    const y3 = this.unit.y + Math.sin(angle - Math.PI * 0.8) * 15;

    this.directionIndicator.fillTriangle(x1, y1, x2, y2, x3, y3);
  }

  /**
   * HPバーの描画
   */
  protected drawHealthBar(): void {
    // privateからprotectedに変更
    this.hpBar.clear();

    const x = this.unit.x - 40;
    const y = this.unit.y - 20;
    const width = 80;
    const height = 10;
    const healthPercent = this.unit.health / this.unit.maxHealth;

    // 背景（黒）
    this.hpBar.fillStyle(0x000000, 0.7);
    this.hpBar.fillRect(x, y, width, height);

    // HPバー（緑→黄→赤）
    const barColor = this.getHealthBarColor(healthPercent);
    this.hpBar.fillStyle(barColor, 1);
    this.hpBar.fillRect(x, y, width * healthPercent, height);

    // 枠線
    this.hpBar.lineStyle(1, 0xffffff, 0.8);
    this.hpBar.strokeRect(x, y, width, height);

    // HP値テキストの更新
    this.hpText.setText(`${Math.floor(this.unit.health)}/${this.unit.maxHealth}`);
    this.hpText.setPosition(x + width / 2, y - 10);
  }

  /**
   * スキルゲージの描画
   */
  protected drawSkillBar(): void {
    // privateからprotectedに変更
    this.skillBar.clear();

    const x = this.unit.x - 40;
    const y = this.unit.y - 5;
    const width = 80;
    const height = 6;
    const skillPercent = this.unit.skillCooldown / this.unit.skillMaxCooldown;

    // 背景（黒）
    this.skillBar.fillStyle(0x000000, 0.7);
    this.skillBar.fillRect(x, y, width, height);

    // スキルゲージ（青）
    this.skillBar.fillStyle(0x3498db, 1);
    this.skillBar.fillRect(x, y, width * skillPercent, height);

    // 枠線
    this.skillBar.lineStyle(1, 0xffffff, 0.5);
    this.skillBar.strokeRect(x, y, width, height);
  }

  /**
   * HPバーの色を取得
   * @param percent HP率
   * @returns 色コード
   */
  protected getHealthBarColor(percent: number): number {
    // privateからprotectedに変更
    if (percent > 0.6) return 0x00ff00; // 緑
    if (percent > 0.3) return 0xffff00; // 黄
    return 0xff0000; // 赤
  }

  /**
   * テキスト類の更新
   */
  protected updateTexts(): void {
    // privateからprotectedに変更
    // レベルテキスト更新
    this.levelText.setText(`Lv.${this.unit.getLevel()}`);
  }

  /**
   * ダメージエフェクトの表示
   * @param amount ダメージ量
   */
  showDamageText(amount: number): void {
    const damageText = this.scene.add.text(
      this.unit.x,
      this.unit.y - 20,
      `-${Math.floor(amount)}`,
      {
        font: 'bold 16px Arial',
        color: '#ff0000',
      }
    );
    damageText.setOrigin(0.5);
    damageText.setDepth(15);

    // テキストを上に浮かせながらフェードアウト
    this.scene.tweens.add({
      targets: damageText,
      y: damageText.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        damageText.destroy();
      },
    });
  }

  /**
   * 経験値獲得テキストの表示
   * @param exp 獲得経験値
   */
  showExpText(exp: number): void {
    const expText = this.scene.add.text(this.unit.x, this.unit.y - 40, `+${exp} EXP`, {
      font: 'bold 14px Arial',
      color: '#00ff00',
    });
    expText.setOrigin(0.5);
    expText.setDepth(15);

    // テキストを上に浮かせながらフェードアウト
    this.scene.tweens.add({
      targets: expText,
      y: expText.y - 30,
      alpha: 0,
      duration: 1500,
      onComplete: () => {
        expText.destroy();
      },
    });
  }

  /**
   * レベルアップエフェクトの表示
   */
  showLevelUpEffect(): void {
    // レベルアップテキスト
    const levelUpText = this.scene.add.text(this.unit.x, this.unit.y - 70, 'LEVEL UP!', {
      font: 'bold 18px Arial',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 4,
    });
    levelUpText.setOrigin(0.5);
    levelUpText.setDepth(20);

    // 輝くエフェクト（グラフィックス）
    const glowEffect = this.scene.add.graphics();
    glowEffect.fillStyle(0xffff00, 0.3);
    glowEffect.fillCircle(this.unit.x, this.unit.y, 50);
    glowEffect.setDepth(3);

    // エフェクトアニメーション
    this.scene.tweens.add({
      targets: [glowEffect],
      alpha: 0,
      scale: 2,
      duration: 1000,
      onComplete: () => {
        glowEffect.destroy();
      },
    });

    // テキストアニメーション（上に移動しながらフェードアウト）
    this.scene.tweens.add({
      targets: levelUpText,
      y: levelUpText.y - 40,
      alpha: 0,
      duration: 1500,
      delay: 500,
      onComplete: () => {
        levelUpText.destroy();
      },
    });
  }

  /**
   * スキル解放メッセージの表示
   * @param skillName スキル名
   * @param message 追加メッセージ（省略可）
   */
  showSkillUnlockMessage(skillName: string, message?: string): void {
    // スキル解放テキスト
    const unlockText = this.scene.add.text(
      this.unit.x,
      this.unit.y - 90,
      `New Skill: ${skillName}!`,
      {
        font: 'bold 16px Arial',
        color: '#00ffff',
        stroke: '#000000',
        strokeThickness: 3,
      }
    );
    unlockText.setOrigin(0.5);
    unlockText.setDepth(20);

    // 詳細メッセージ（指定があれば）
    if (message) {
      const detailText = this.scene.add.text(this.unit.x, this.unit.y - 70, message, {
        font: '12px Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
      });
      detailText.setOrigin(0.5);
      detailText.setDepth(20);

      // 詳細メッセージのアニメーション
      this.scene.tweens.add({
        targets: detailText,
        alpha: 0,
        duration: 2000,
        delay: 2000,
        onComplete: () => {
          detailText.destroy();
        },
      });
    }

    // テキストアニメーション
    this.scene.tweens.add({
      targets: unlockText,
      alpha: 0,
      duration: 2000,
      delay: 1500,
      onComplete: () => {
        unlockText.destroy();
      },
    });
  }

  /**
   * ユニットをフェードさせる（ダメージ表現など）
   */
  flashUnit(): void {
    this.scene.tweens.add({
      targets: this.unitCircle,
      alpha: 0.5,
      yoyo: true,
      duration: 100,
      repeat: 1,
    });
  }
}
