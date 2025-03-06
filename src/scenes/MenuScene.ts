import Phaser from 'phaser';
import { PlayerData } from '../types/PlayerTypes';
import { GameStateManager } from '../managers/GameStateManager';

export class MenuScene extends Phaser.Scene {
  // UI要素
  private titleText!: Phaser.GameObjects.Text;
  private menuContainer!: Phaser.GameObjects.Container;
  private playerStatusPanel!: Phaser.GameObjects.Container;
  private currentSubMenu: Phaser.GameObjects.Container | null = null;

  // メニューの状態管理
  private subMenuActive: boolean = false;

  // ゲームステートマネージャー
  private gameStateManager: GameStateManager;

  constructor() {
    super('MenuScene');
    // ゲームステートマネージャーのインスタンスを取得
    this.gameStateManager = GameStateManager.getInstance();
  }

  init(): void {
    // シーン初期化時に状態をリセット
    this.subMenuActive = false;
    this.currentSubMenu = null;
    console.warn('MenuScene initialized, states reset');
  }

  preload(): void {
    // 今後の拡張で必要なプリロード処理があればここに追加
  }

  create(): void {
    // 背景
    this.createBackground();

    // タイトルテキスト
    this.titleText = this.add.text(this.cameras.main.centerX, 70, 'オートバトルRPG', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
    });
    this.titleText.setOrigin(0.5);

    // サブタイトル
    const subTitleText = this.add.text(
      this.cameras.main.centerX,
      120,
      '- Phaser TypeScript Edition -',
      {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#cccccc',
      }
    );
    subTitleText.setOrigin(0.5);

    // メインメニューの作成
    this.createMainMenu();

    // プレイヤーステータスパネルの作成（簡略化）
    this.createSimplePlayerStatusPanel();

    // バージョン情報
    const versionText = this.add.text(
      this.cameras.main.width - 10,
      this.cameras.main.height - 10,
      'ver 0.3.0',
      {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#999999',
      }
    );
    versionText.setOrigin(1, 1);

    // アニメーション
    this.addAnimations();

    // デバッグテキスト
    this.add.text(10, 10, 'Menu Scene Loaded', {
      font: '16px Arial',
      color: '#ffffff',
    });
  }

  private createBackground(): void {
    // 背景グラデーション（簡易版）
    const bgTop = this.add.rectangle(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height / 2,
      0x001133
    );
    const bgBottom = this.add.rectangle(
      0,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height / 2,
      0x002244
    );
    bgTop.setOrigin(0, 0);
    bgBottom.setOrigin(0, 0);

    // 装飾用の粒子効果（星のような点）
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, this.cameras.main.width);
      const y = Phaser.Math.Between(0, this.cameras.main.height);
      const size = Phaser.Math.FloatBetween(1, 3);
      const alpha = Phaser.Math.FloatBetween(0.3, 0.8);

      const star = this.add.circle(x, y, size, 0xffffff, alpha);

      // 星の点滅アニメーション
      this.tweens.add({
        targets: star,
        alpha: 0.2,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private createMainMenu(): void {
    this.menuContainer = this.add.container(50, 200);

    const menuItems = [
      { text: 'バトル開始', action: () => this.openStageSelect() },
      { text: 'アイテム', action: () => this.openItemMenu() },
      { text: '装備', action: () => this.openEquipmentMenu() },
      { text: 'ステータス', action: () => this.openStatusMenu() },
    ];

    // メニューボタンの作成
    menuItems.forEach((item, index) => {
      const button = this.createMenuButton(item.text, 0, index * 60);
      const background = button.getAt(0) as Phaser.GameObjects.Rectangle;
      background.on('pointerdown', () => {
        console.warn(`Button clicked: ${item.text}`);
        item.action();
      });
      this.menuContainer.add(button);
    });
  }

  // メニューボタン作成のヘルパーメソッド
  private createMenuButton(text: string, x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // ボタン背景
    const background = this.add.rectangle(0, 0, 200, 50, 0x0088ff, 0.8);
    background.setInteractive({ useHandCursor: true });

    // ボタンテキスト
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    });
    buttonText.setOrigin(0.5);

    container.add([background, buttonText]);

    // ホバーエフェクト
    background.on('pointerover', () => {
      background.fillColor = 0x00aaff;
      this.tweens.add({
        targets: container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
      });
    });

    background.on('pointerout', () => {
      background.fillColor = 0x0088ff;
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      });
    });

    return container;
  }

  // 簡略化したプレイヤーステータスパネル
  private createSimplePlayerStatusPanel(): void {
    this.playerStatusPanel = this.add.container(600, 200);

    // パネル背景
    const background = this.add.rectangle(0, 0, 250, 300, 0x000000, 0.5);

    // GameStateManagerからプレイヤーデータを取得
    const playerData = this.gameStateManager.getPlayerData();

    // 基本情報のみ表示
    const nameText = this.add.text(-100, -120, playerData.name, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
    });

    const levelText = this.add.text(-100, -80, `Lv. ${playerData.level}`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    });

    // 簡略化のために最小限のステータスだけ表示
    const hpText = this.add.text(-100, -40, `HP: ${playerData.health}/${playerData.maxHealth}`, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
    });

    this.playerStatusPanel.add([background, nameText, levelText, hpText]);
  }

  private addAnimations(): void {
    // タイトルのアニメーション
    this.tweens.add({
      targets: this.titleText,
      y: 80,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  // ステージ選択メニューを開く
  private openStageSelect(): void {
    if (this.subMenuActive) return;
    this.subMenuActive = true;

    // 既存のメインメニューを一時的に隠す
    this.tweens.add({
      targets: this.menuContainer,
      x: -200,
      duration: 300,
    });

    // ステージ選択メニューの作成
    const stageSelectContainer = this.add.container(800, 200);

    // タイトル
    const titleText = this.add.text(0, -40, 'ステージ選択', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
    });
    titleText.setOrigin(0.5);

    // 利用可能なステージリスト
    const stages = [
      { id: '1-1', name: 'ゴブリンの森 1', level: 1, unlocked: true },
      { id: '1-2', name: 'ゴブリンの森 2', level: 3, unlocked: true },
      { id: '1-3', name: 'ゴブリンの森 3', level: 5, unlocked: false },
    ];

    // ステージボタン生成
    const stageButtons = stages.map((stage, index) => {
      return this.createStageButton(stage, 0, index * 70);
    });

    // 戻るボタン
    const backButton = this.createMenuButton('戻る', 0, stages.length * 70 + 20);
    const backBg = backButton.getAt(0) as Phaser.GameObjects.Rectangle;
    backBg.on('pointerdown', () => {
      this.closeSubMenu(stageSelectContainer);
    });

    stageSelectContainer.add([titleText, ...stageButtons, backButton]);
    this.currentSubMenu = stageSelectContainer;

    // アニメーションでメニューを表示
    this.tweens.add({
      targets: stageSelectContainer,
      x: 400,
      duration: 300,
    });
  }

  // ステージボタンの作成
  private createStageButton(
    stage: { id: string; name: string; level: number; unlocked: boolean },
    x: number,
    y: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // ボタン背景
    const background = this.add.rectangle(0, 0, 300, 60, stage.unlocked ? 0x0088ff : 0x666666, 0.8);

    if (stage.unlocked) {
      background.setInteractive({ useHandCursor: true });

      // クリックイベント
      background.on('pointerdown', () => {
        console.warn(`Starting battle: Stage ${stage.id}`);
        this.startBattle(stage.id);
      });

      // ホバーエフェクト
      background.on('pointerover', () => {
        background.fillColor = 0x00aaff;
      });

      background.on('pointerout', () => {
        background.fillColor = 0x0088ff;
      });
    }

    // ステージ名
    const nameText = this.add.text(-120, -10, stage.name, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    });

    // レベル表示
    const levelText = this.add.text(-120, 15, `推奨Lv: ${stage.level}`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#cccccc',
    });

    container.add([background, nameText, levelText]);

    return container;
  }

  // バトル開始
  private startBattle(stageId: string): void {
    console.warn(`Starting battle with stage ID: ${stageId}`);
    this.scene.start('BattleScene', { stageId });
  }

  // サブメニューを閉じる
  private closeSubMenu(menu: Phaser.GameObjects.Container): void {
    this.tweens.add({
      targets: menu,
      x: 800,
      duration: 300,
      onComplete: () => {
        menu.destroy();
        this.subMenuActive = false;
        this.currentSubMenu = null;

        // メインメニューを元に戻す
        this.tweens.add({
          targets: this.menuContainer,
          x: 50,
          duration: 300,
        });
      },
    });
  }

  // 以下はシンプルな実装として残し、将来拡張できるようにしておく
  private openItemMenu(): void {
    if (this.subMenuActive) return;
    this.subMenuActive = true;
    
    // メインメニューを隠す
    this.tweens.add({
      targets: this.menuContainer,
      x: -200,
      duration: 300,
    });
    
    // 簡易的なダイアログを表示
    const dialogContainer = this.add.container(800, 200);
    const background = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.7);
    const messageText = this.add.text(0, -30, "アイテム機能は開発中です", {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    });
    messageText.setOrigin(0.5);
    
    // 戻るボタン
    const backButton = this.createMenuButton('戻る', 0, 50);
    const backBg = backButton.getAt(0) as Phaser.GameObjects.Rectangle;
    backBg.on('pointerdown', () => {
      this.closeSubMenu(dialogContainer);
    });
    
    dialogContainer.add([background, messageText, backButton]);
    this.currentSubMenu = dialogContainer;
    
    this.tweens.add({
      targets: dialogContainer,
      x: 400,
      duration: 300,
    });
  }

  private openEquipmentMenu(): void {
    // アイテムメニューと同様に簡略化
    this.openSimpleDialog("装備機能は開発中です");
  }

  private openStatusMenu(): void {
    // ステータス詳細も簡略化
    this.openSimpleDialog("詳細ステータス機能は開発中です");
  }

  // 簡易的なダイアログを表示する共通メソッド
  private openSimpleDialog(message: string): void {
    if (this.subMenuActive) return;
    this.subMenuActive = true;
    
    // メインメニューを隠す
    this.tweens.add({
      targets: this.menuContainer,
      x: -200,
      duration: 300,
    });
    
    const dialogContainer = this.add.container(800, 200);
    const background = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.7);
    const messageText = this.add.text(0, -30, message, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
    });
    messageText.setOrigin(0.5);
    
    // 戻るボタン
    const backButton = this.createMenuButton('戻る', 0, 50);
    const backBg = backButton.getAt(0) as Phaser.GameObjects.Rectangle;
    backBg.on('pointerdown', () => {
      this.closeSubMenu(dialogContainer);
    });
    
    dialogContainer.add([background, messageText, backButton]);
    this.currentSubMenu = dialogContainer;
    
    this.tweens.add({
      targets: dialogContainer,
      x: 400,
      duration: 300,
    });
  }
}
