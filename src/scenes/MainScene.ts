import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload(): void {
    // アセットのロードはここで行います
    // this.load.image('player', 'assets/player.png');
  }

  create(): void {
    // タイトルテキストの作成
    const text = this.add.text(
      this.cameras.main.centerX,
      100,
      'Phaser Auto Battle RPG',
      {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#ffffff'
      }
    );
    text.setOrigin(0.5);

    // テスト用の赤い四角を描画（動作確認用）
    const rect = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      100,
      100,
      0xff0000
    );
    
    // アニメーションの追加
    this.tweens.add({
      targets: rect,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // コンソールにメッセージを表示（動作確認用）
    console.log('MainScene created successfully!');
  }

  update(): void {
    // ゲームの更新ロジックはここに記述します
  }
}