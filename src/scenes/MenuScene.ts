import Phaser from 'phaser';
import { PlayerData, DEFAULT_PLAYER_DATA } from '../types/PlayerTypes';

export class MenuScene extends Phaser.Scene {
  // UI要素
  private titleText!: Phaser.GameObjects.Text;
  private menuContainer!: Phaser.GameObjects.Container;
  private playerStatusPanel!: Phaser.GameObjects.Container;
  private currentSubMenu: Phaser.GameObjects.Container | null = null;
  
  // メニューの状態管理
  private subMenuActive: boolean = false;
  
  // プレイヤーデータ
  private playerData: PlayerData;
  
  constructor() {
    super('MenuScene');
    this.playerData = DEFAULT_PLAYER_DATA;
  }

  init(): void {
    // シーン初期化時に状態をリセット
    this.subMenuActive = false;
    this.currentSubMenu = null;
    console.log("MenuScene initialized, states reset");
  }

  preload(): void {
    // プレイヤーデータのロード（将来的にはセーブデータから）
    // 現在はデフォルト値を使用
  }

  create(): void {
    // 背景
    this.createBackground();
    
    // タイトルテキスト
    this.titleText = this.add.text(
      this.cameras.main.centerX,
      70,
      'オートバトルRPG',
      {
        fontFamily: 'Arial',
        fontSize: '48px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6
      }
    );
    this.titleText.setOrigin(0.5);
    
    // サブタイトル
    const subTitleText = this.add.text(
      this.cameras.main.centerX,
      120,
      '- Phaser TypeScript Edition -',
      {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#cccccc'
      }
    );
    subTitleText.setOrigin(0.5);
    
    // メインメニューの作成
    this.createMainMenu();
    
    // プレイヤーステータスパネルの作成
    this.createPlayerStatusPanel();
    
    // バージョン情報
    const versionText = this.add.text(
      this.cameras.main.width - 10,
      this.cameras.main.height - 10,
      'ver 0.2.0',
      {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#999999'
      }
    );
    versionText.setOrigin(1, 1);
    
    // アニメーション
    this.addAnimations();

    // デバッグテキスト
    this.add.text(10, 10, 'Menu Scene Loaded', {
      font: '16px Arial',
      color: '#ffffff'
    });
  }
  
  private createBackground(): void {
    // 背景グラデーション（簡易版）
    const bgTop = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height / 2, 0x001133);
    const bgBottom = this.add.rectangle(0, this.cameras.main.height / 2, this.cameras.main.width, this.cameras.main.height / 2, 0x002244);
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
        ease: 'Sine.easeInOut'
      });
    }
  }
  
  private createMainMenu(): void {
    this.menuContainer = this.add.container(50, 200);
    
    const menuItems = [
      { text: 'バトル開始', action: () => this.openStageSelect() },
      { text: 'アイテム', action: () => this.openItemMenu() },
      { text: '装備', action: () => this.openEquipmentMenu() },
      { text: 'ステータス', action: () => this.openStatusMenu() }
    ];
    
    // メニューボタンの作成
    menuItems.forEach((item, index) => {
      const button = this.createMenuButton(item.text, 0, index * 60);
      const background = button.getAt(0) as Phaser.GameObjects.Rectangle;
      background.on('pointerdown', () => {
        console.log(`Button clicked: ${item.text}`);
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
      color: '#ffffff'
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
        duration: 100
      });
    });
    
    background.on('pointerout', () => {
      background.fillColor = 0x0088ff;
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });
    });
    
    return container;
  }
  
  private createPlayerStatusPanel(): void {
    this.playerStatusPanel = this.add.container(600, 200);
    
    // パネル背景
    const background = this.add.rectangle(0, 0, 250, 300, 0x000000, 0.5);
    
    // プレイヤー名
    const nameText = this.add.text(-100, -120, this.playerData.name, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    });
    
    // レベル
    const levelText = this.add.text(-100, -80, `Lv. ${this.playerData.level}`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    });
    
    // 経験値
    const expText = this.add.text(-100, -50, `EXP: ${this.playerData.exp}/${this.playerData.maxExp}`, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#cccccc'
    });
    
    // ステータス
    const stats = [
      { name: 'HP', value: `${this.playerData.health}/${this.playerData.maxHealth}` },
      { name: '攻撃力', value: this.playerData.attack.toString() },
      { name: '防御力', value: this.playerData.defense.toString() },
      { name: '素早さ', value: this.playerData.speed.toString() },
      { name: '所持金', value: `${this.playerData.gold} G` }
    ];
    
    const statTexts = stats.map((stat, index) => {
      return this.add.text(-100, -10 + index * 30, `${stat.name}: ${stat.value}`, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff'
      });
    });
    
    this.playerStatusPanel.add([background, nameText, levelText, expText, ...statTexts]);
  }
  
  private addAnimations(): void {
    // タイトルのアニメーション
    this.tweens.add({
      targets: this.titleText,
      y: 80,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  // ステージ選択メニューを開く
  private openStageSelect(): void {
    console.log("Opening stage select menu, subMenuActive state:", this.subMenuActive);
    if (this.subMenuActive) {
      console.log("Sub menu already active, not opening new one");
      return;
    }
    this.subMenuActive = true;
    
    // 既存のメインメニューを一時的に隠す
    this.tweens.add({
      targets: this.menuContainer,
      x: -200,
      duration: 300
    });
    
    // ステージ選択メニューの作成
    const stageSelectContainer = this.add.container(800, 200);
    
    // タイトル
    const titleText = this.add.text(0, -40, 'ステージ選択', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    });
    titleText.setOrigin(0.5);
    
    // 利用可能なステージリスト
    const stages = [
      { id: '1-1', name: 'ゴブリンの森 1', level: 1, unlocked: true },
      { id: '1-2', name: 'ゴブリンの森 2', level: 3, unlocked: true },
      { id: '1-3', name: 'ゴブリンの森 3', level: 5, unlocked: false }
    ];
    
    // ステージボタン生成
    const stageButtons = stages.map((stage, index) => {
      return this.createStageButton(stage, 0, index * 70);
    });
    
    // 戻るボタン
    const backButton = this.createMenuButton('戻る', 0, stages.length * 70 + 20);
    const backBg = backButton.getAt(0) as Phaser.GameObjects.Rectangle;
    backBg.on('pointerdown', () => {
      console.log("Back button clicked");
      this.closeSubMenu(stageSelectContainer);
    });
    
    stageSelectContainer.add([titleText, ...stageButtons, backButton]);
    this.currentSubMenu = stageSelectContainer;
    
    // アニメーションでメニューを表示
    this.tweens.add({
      targets: stageSelectContainer,
      x: 400,
      duration: 300
    });
  }
  
  // ステージボタンの作成
  private createStageButton(stage: any, x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // ボタン背景
    const background = this.add.rectangle(0, 0, 300, 60, 
      stage.unlocked ? 0x0088ff : 0x666666, 0.8);
    
    if (stage.unlocked) {
      background.setInteractive({ useHandCursor: true });
      
      // クリックイベント
      background.on('pointerdown', () => {
        console.log(`Starting battle: Stage ${stage.id}`);
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
      color: '#ffffff'
    });
    
    // レベル表示
    const levelText = this.add.text(-120, 15, `推奨Lv: ${stage.level}`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#cccccc'
    });
    
    container.add([background, nameText, levelText]);
    
    return container;
  }
  
  // バトル開始
  private startBattle(stageId: string): void {
    console.log(`Starting battle with stage ID: ${stageId}`);
    this.scene.start('BattleScene', { stageId });
  }
  
  // アイテムメニューを開く
  private openItemMenu(): void {
    console.log("Opening item menu, subMenuActive state:", this.subMenuActive);
    if (this.subMenuActive) {
      console.log("Sub menu already active, not opening new one");
      return;
    }
    this.subMenuActive = true;
    
    // メインメニューを隠す
    this.tweens.add({
      targets: this.menuContainer,
      x: -200,
      duration: 300
    });
    
    // アイテムメニューコンテナ
    const itemMenuContainer = this.add.container(800, 200);
    
    // タイトル
    const titleText = this.add.text(0, -40, 'アイテム', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    });
    titleText.setOrigin(0.5);
    
    // アイテムリスト背景
    const listBackground = this.add.rectangle(0, 100, 350, 300, 0x000000, 0.7);
    
    // アイテムリスト
    const itemListContainer = this.add.container(0, 0);
    
    // アイテムがある場合は表示、ない場合はメッセージ
    if (this.playerData.items.length > 0) {
      this.playerData.items.forEach((item, index) => {
        const itemButton = this.createItemButton(item, -150, index * 40);
        itemListContainer.add(itemButton);
      });
    } else {
      const emptyText = this.add.text(0, 100, 'アイテムがありません', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#cccccc'
      });
      emptyText.setOrigin(0.5);
      itemListContainer.add(emptyText);
    }
    
    // 戻るボタン
    const backButton = this.createMenuButton('戻る', 0, 250);
    const backBg = backButton.getAt(0) as Phaser.GameObjects.Rectangle;
    backBg.on('pointerdown', () => {
      console.log("Back button clicked");
      this.closeSubMenu(itemMenuContainer);
    });
    
    itemMenuContainer.add([titleText, listBackground, itemListContainer, backButton]);
    this.currentSubMenu = itemMenuContainer;
    
    // アニメーションでメニューを表示
    this.tweens.add({
      targets: itemMenuContainer,
      x: 400,
      duration: 300
    });
  }
  
  // アイテムボタンの作成
  private createItemButton(item: any, x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // 背景
    const background = this.add.rectangle(130, 0, 260, 30, 0x333333, 0.8);
    background.setInteractive({ useHandCursor: true });
    
    // アイテム名
    const nameText = this.add.text(0, 0, item.name, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: this.getItemTypeColor(item.type)
    });
    
    // 数量表示
    const quantityText = this.add.text(250, 0, `x${item.quantity}`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff'
    });
    quantityText.setOrigin(1, 0.5);
    
    container.add([background, nameText, quantityText]);
    
    // クリックイベント（仮の実装）
    background.on('pointerdown', () => {
      console.log(`アイテム「${item.name}」をクリックしました`);
    });
    
    return container;
  }
  
  // アイテムタイプに応じた色を取得
  private getItemTypeColor(type: string): string {
    switch (type) {
      case 'consumable': return '#66ff66'; // 緑
      case 'equipment': return '#6666ff';  // 青
      case 'key': return '#ffff66';        // 黄
      default: return '#ffffff';           // 白
    }
  }
  
  // 装備メニューを開く
  private openEquipmentMenu(): void {
    console.log("Opening equipment menu, subMenuActive state:", this.subMenuActive);
    if (this.subMenuActive) {
      console.log("Sub menu already active, not opening new one");
      return;
    }
    this.subMenuActive = true;
    
    // メインメニューを隠す
    this.tweens.add({
      targets: this.menuContainer,
      x: -200,
      duration: 300
    });
    
    // 装備メニューコンテナ
    const equipMenuContainer = this.add.container(800, 200);
    
    // タイトル
    const titleText = this.add.text(0, -40, '装備', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    });
    titleText.setOrigin(0.5);
    
    // 装備スロット
    const equipSlots = [
      { type: 'weapon', name: '武器', item: this.playerData.equipment.weapon },
      { type: 'armor', name: '防具', item: this.playerData.equipment.armor },
      { type: 'accessory', name: 'アクセサリー', item: this.playerData.equipment.accessory }
    ];
    
    const slotContainers = equipSlots.map((slot, index) => {
      const slotContainer = this.add.container(0, index * 60);
      
      // スロット名
      const nameText = this.add.text(-150, 0, slot.name, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff'
      });
      
      // 装備名
      const itemName = slot.item ? slot.item.name : '装備なし';
      const itemColor = slot.item ? '#6666ff' : '#999999';
      
      const itemText = this.add.text(0, 0, itemName, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: itemColor
      });
      
      slotContainer.add([nameText, itemText]);
      return slotContainer;
    });
    
    // 戻るボタン
    const backButton = this.createMenuButton('戻る', 0, 200);
    const backBg = backButton.getAt(0) as Phaser.GameObjects.Rectangle;
    backBg.on('pointerdown', () => {
      console.log("Back button clicked");
      this.closeSubMenu(equipMenuContainer);
    });
    
    equipMenuContainer.add([titleText, ...slotContainers, backButton]);
    this.currentSubMenu = equipMenuContainer;
    
    // アニメーションでメニューを表示
    this.tweens.add({
      targets: equipMenuContainer,
      x: 400,
      duration: 300
    });
  }
  
  // ステータス詳細メニューを開く
  private openStatusMenu(): void {
    console.log("Opening status menu, subMenuActive state:", this.subMenuActive);
    if (this.subMenuActive) {
      console.log("Sub menu already active, not opening new one");
      return;
    }
    this.subMenuActive = true;
    
    // メインメニューを隠す
    this.tweens.add({
      targets: this.menuContainer,
      x: -200,
      duration: 300
    });
    
    // ステータスメニューコンテナ
    const statusMenuContainer = this.add.container(800, 200);
    
    // タイトル
    const titleText = this.add.text(0, -40, 'ステータス詳細', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    });
    titleText.setOrigin(0.5);
    
    // キャラクター名とレベル
    const nameText = this.add.text(-150, 20, `${this.playerData.name} Lv.${this.playerData.level}`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    });
    
    // 経験値バー
    const expBarBg = this.add.rectangle(0, 50, 300, 20, 0x333333);
    const expRatio = this.playerData.exp / this.playerData.maxExp;
    const expBar = this.add.rectangle(-150 + 150 * expRatio, 50, 300 * expRatio, 20, 0x00ff00);
    expBar.setOrigin(0, 0.5);
    
    const expText = this.add.text(0, 50, `${this.playerData.exp} / ${this.playerData.maxExp}`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff'
    });
    expText.setOrigin(0.5);
    
    // 詳細ステータス
    const stats = [
      { name: 'HP', value: `${this.playerData.health} / ${this.playerData.maxHealth}` },
      { name: '攻撃力', value: this.playerData.attack.toString() },
      { name: '防御力', value: this.playerData.defense.toString() },
      { name: '素早さ', value: this.playerData.speed.toString() }
    ];
    
    const statTexts = stats.map((stat, index) => {
      const statContainer = this.add.container(-150, 90 + index * 30);
      
      const nameText = this.add.text(0, 0, stat.name, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#cccccc'
      });
      
      const valueText = this.add.text(100, 0, stat.value, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff'
      });
      
      statContainer.add([nameText, valueText]);
      return statContainer;
    });
    
    // 戻るボタン
    const backButton = this.createMenuButton('戻る', 0, 250);
    const backBg = backButton.getAt(0) as Phaser.GameObjects.Rectangle;
    backBg.on('pointerdown', () => {
      console.log("Back button clicked");
      this.closeSubMenu(statusMenuContainer);
    });
    
    statusMenuContainer.add([titleText, nameText, expBarBg, expBar, expText, ...statTexts, backButton]);
    this.currentSubMenu = statusMenuContainer;
    
    // アニメーションでメニューを表示
    this.tweens.add({
      targets: statusMenuContainer,
      x: 400,
      duration: 300
    });
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
          duration: 300
        });
      }
    });
  }
}
