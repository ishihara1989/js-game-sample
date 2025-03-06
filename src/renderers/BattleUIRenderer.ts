import Phaser from 'phaser';
import { Unit } from '../objects/Unit';
import { BattleScene } from '../scenes/BattleScene';
import { Renderer } from './Renderer';

/**
 * バトルUI描画クラス
 * バトルシーン全体のUI要素を描画する
 */
export class BattleUIRenderer implements Renderer {
  private scene: BattleScene;

  // デバッグ情報
  private debugText: Phaser.GameObjects.Text;

  // バトル情報
  private battleInfoText: Phaser.GameObjects.Text;

  // 時間表示
  private timerText: Phaser.GameObjects.Text;

  // ステージ情報
  private stageText: Phaser.GameObjects.Text;

  /**
   * コンストラクタ
   * @param scene バトルシーン
   */
  constructor(scene: BattleScene) {
    this.scene = scene;

    // デバッグテキストの作成
    this.debugText = this.scene.add.text(10, 10, '', {
      font: '16px Arial',
      color: '#ffffff',
    });
    this.debugText.setDepth(100);

    // バトル情報テキストの作成
    this.battleInfoText = this.scene.add.text(10, 50, '', {
      font: '14px Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.battleInfoText.setDepth(100);

    // 時間表示テキストの作成
    this.timerText = this.scene.add.text(
      (this.scene.sys.game.config.width as number) - 10,
      10,
      '',
      {
        font: '14px Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
      }
    );
    this.timerText.setOrigin(1, 0);
    this.timerText.setDepth(100);

    // ステージ情報テキストの作成
    this.stageText = this.scene.add.text((this.scene.sys.game.config.width as number) / 2, 10, '', {
      font: '16px Arial',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.stageText.setOrigin(0.5, 0);
    this.stageText.setDepth(100);
  }

  /**
   * 初期化処理
   */
  initialize(): void {
    // 初回の描画
    this.render();
  }

  /**
   * 更新処理
   * @param delta 前フレームからの経過時間
   */
  update(delta: number): void {
    // 時間の更新
    this.updateTimer(delta);
  }

  /**
   * 描画処理
   */
  render(): void {
    // デバッグ情報の更新
    this.updateDebugText();

    // バトル情報の更新
    this.updateBattleInfo();

    // ステージ情報の更新
    this.updateStageText();
  }

  /**
   * クリーンアップ
   */
  destroy(): void {
    // テキスト要素のクリーンアップ
    this.debugText.destroy();
    this.battleInfoText.destroy();
    this.timerText.destroy();
    this.stageText.destroy();
  }

  /**
   * デバッグテキストの表示/非表示設定
   * @param visible 表示するかどうか
   */
  setDebugVisible(visible: boolean): void {
    this.debugText.setVisible(visible);
  }

  /**
   * デバッグ情報の更新
   */
  private updateDebugText(): void {
    if (!this.scene.playerUnit) return;

    let debugInfo = `Player: HP ${Math.floor(this.scene.playerUnit.health)}/${this.scene.playerUnit.maxHealth}, `;
    debugInfo += `Skill: ${Math.floor(this.scene.playerUnit.skillCooldown)}/${this.scene.playerUnit.skillMaxCooldown}\\n`;
    debugInfo += `Level: ${this.scene.playerUnit.getLevel()}\\n`;

    // 敵の情報も表示
    const enemies = this.scene.getAllUnits().filter((unit) => unit !== this.scene.playerUnit);
    enemies.forEach((enemy, index) => {
      debugInfo += `Enemy ${index + 1}: HP ${Math.floor(enemy.health)}/${enemy.maxHealth}\\n`;
    });

    // ステージ情報の追加
    if (this.scene.currentStage) {
      debugInfo += `Stage: ${this.scene.currentStage.id} (${this.scene.currentStage.name})\\n`;
    }

    this.debugText.setText(debugInfo);
  }

  /**
   * バトル情報の更新
   */
  private updateBattleInfo(): void {
    if (!this.scene.playerUnit) return;

    let infoText = '';

    // バトルの状態（アクティブかどうか）
    infoText += `Status: ${this.scene.battleActive ? 'Battle in progress' : 'Battle ended'}\\n`;

    // ユニット数
    const units = this.scene.getAllUnits();
    infoText += `Units: ${units.length} (Player: 1, Enemies: ${units.length - 1})\\n`;

    this.battleInfoText.setText(infoText);
  }

  /**
   * 時間表示の更新
   * @param delta 前フレームからの経過時間
   */
  private updateTimer(_delta: number): void {
    // バトル時間の表示形式を整形（分:秒.ミリ秒）
    const totalSeconds = this.scene.battleTime / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.floor((totalSeconds * 100) % 100);

    const timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    this.timerText.setText(`Time: ${timeText}`);
  }

  /**
   * ステージ情報テキストの更新
   */
  private updateStageText(): void {
    if (!this.scene.currentStage) return;

    this.stageText.setText(`Stage ${this.scene.currentStage.id}: ${this.scene.currentStage.name}`);
  }

  /**
   * バトル開始メッセージの表示
   */
  showBattleStartMessage(): void {
    const startText = this.scene.add.text(
      (this.scene.sys.game.config.width as number) / 2,
      (this.scene.sys.game.config.height as number) / 2,
      'BATTLE START!',
      {
        font: 'bold 32px Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
      }
    );
    startText.setOrigin(0.5);
    startText.setDepth(200);

    // テキストアニメーション
    this.scene.tweens.add({
      targets: startText,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        startText.destroy();
      },
    });
  }

  /**
   * バトル終了メッセージの表示
   * @param victory 勝利したかどうか
   */
  showBattleEndMessage(victory: boolean): void {
    const endText = this.scene.add.text(
      (this.scene.sys.game.config.width as number) / 2,
      (this.scene.sys.game.config.height as number) / 2,
      victory ? 'VICTORY!' : 'DEFEAT...',
      {
        font: 'bold 40px Arial',
        color: victory ? '#ffff00' : '#ff0000',
        stroke: '#000000',
        strokeThickness: 6,
      }
    );
    endText.setOrigin(0.5);
    endText.setDepth(200);

    // テキストアニメーション
    this.scene.tweens.add({
      targets: endText,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        endText.destroy();
      },
    });
  }
}
