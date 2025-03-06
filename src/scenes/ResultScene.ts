import Phaser from 'phaser';
import { BattleResult } from '../types/BattleTypes';

export class ResultScene extends Phaser.Scene {
  private result!: BattleResult;

  constructor() {
    super('ResultScene');
  }

  init(data: { result: BattleResult }): void {
    this.result = data.result;
  }

  create(): void {
    // 背景
    const bg = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      this.result.victory ? 0x003366 : 0x330000
    );

    // 勝敗結果のタイトル
    const titleText = this.add.text(
      this.cameras.main.centerX,
      100,
      this.result.victory ? 'VICTORY!' : 'DEFEAT...',
      {
        font: 'bold 48px Arial',
        color: this.result.victory ? '#00ffff' : '#ff0000',
      }
    );
    titleText.setOrigin(0.5);

    // リザルト情報のコンテナ
    const resultContainer = this.add.container(this.cameras.main.centerX, 200);

    // 背景パネル
    const panel = this.add.rectangle(0, 0, 400, 300, 0x000000, 0.7);
    resultContainer.add(panel);

    // 結果詳細
    const detailsText = this.add.text(0, -120, this.getResultDetails(), {
      font: '20px Arial',
      color: '#ffffff',
      align: 'center',
    });
    detailsText.setOrigin(0.5);
    resultContainer.add(detailsText);

    // 得られた報酬
    if (this.result.victory) {
      const rewardsText = this.add.text(0, 0, this.getRewardsText(), {
        font: '18px Arial',
        color: '#ffff00',
        align: 'center',
      });
      rewardsText.setOrigin(0.5);
      resultContainer.add(rewardsText);
    }

    // 次へ進むボタン
    const continueButton = this.add.rectangle(0, 120, 200, 50, 0x0088ff);
    const continueText = this.add.text(0, 120, 'CONTINUE', {
      font: 'bold 20px Arial',
      color: '#ffffff',
    });
    continueText.setOrigin(0.5);

    resultContainer.add(continueButton);
    resultContainer.add(continueText);

    // ボタンをクリック可能に
    continueButton.setInteractive();
    continueButton.on('pointerdown', () => {
      this.returnToMenuScene();
    });

    // ボタンホバーエフェクト
    continueButton.on('pointerover', () => {
      continueButton.fillColor = 0x00aaff;
    });

    continueButton.on('pointerout', () => {
      continueButton.fillColor = 0x0088ff;
    });

    // 全体のアニメーション
    this.tweens.add({
      targets: [titleText, resultContainer],
      alpha: { from: 0, to: 1 },
      y: '+=10',
      duration: 800,
      ease: 'Power2',
    });
  }

  private getResultDetails(): string {
    // ユニット情報がある場合はそれを使用し、ない場合は新しいスタイルのリザルトを表示
    if (this.result.victorUnit && this.result.defeatedUnit) {
      const victorName = this.result.victorUnit.name;
      const defeatedName = this.result.defeatedUnit.name;

      if (this.result.victory) {
        return `${victorName} has defeated ${defeatedName}!\n\nCongratulations!`;
      } else {
        return `${defeatedName} was defeated by ${victorName}...\n\nBetter luck next time!`;
      }
    } else {
      // 新しいリザルト表示スタイル
      if (this.result.victory) {
        const stageInfo = this.result.stageId
          ? `Stage ${this.result.stageId} cleared!`
          : 'Stage cleared!';
        const enemiesInfo = this.result.enemiesDefeated
          ? `Defeated ${this.result.enemiesDefeated} enemies.`
          : '';

        return `${stageInfo}\n${enemiesInfo}\n\nCongratulations!`;
      } else {
        return `You have been defeated...\n\nBetter luck next time!`;
      }
    }
  }

  private getRewardsText(): string {
    let text = 'Rewards:\n\n';

    // 古いスタイルのリワード
    if (this.result.exp !== undefined) {
      text += `EXP: ${this.result.exp}\n`;
    } else if (this.result.experienceGained !== undefined) {
      text += `EXP: ${this.result.experienceGained}\n`;
    }

    if (this.result.gold !== undefined) {
      text += `Gold: ${this.result.gold}\n`;
    }

    // アイテム表示（旧スタイル）
    if (this.result.items && this.result.items.length > 0) {
      text += '\nItems:\n';
      this.result.items.forEach((item) => {
        text += `- ${item}\n`;
      });
    }
    // アイテム表示（新スタイル）
    else if (this.result.itemsDropped && this.result.itemsDropped.length > 0) {
      text += '\nItems:\n';
      this.result.itemsDropped.forEach((item) => {
        text += `- ${item}\n`;
      });
    }

    return text;
  }

  private returnToMenuScene(): void {
    // メニューシーンに戻る
    this.scene.start('MenuScene');
  }
}
