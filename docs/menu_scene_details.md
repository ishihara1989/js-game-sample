# メニュー画面シーン 実装詳細

## 現状の課題

現在のMainSceneはタイトル表示とバトル開始ボタンのみの単純な画面構成となっており、以下の問題があります:

- RPGに必要な機能（アイテム管理、装備変更、ステータス確認など）が実装されていない
- 戦闘リザルトから戻った後のユーザー体験が不十分
- ステージの選択機能がない

## 実装の方針

MainSceneをMenuSceneとして拡張し、RPGの中心となる機能ハブとして実装します。

### 1. 基本UI構造

```typescript
// src/scenes/MenuScene.ts
export class MenuScene extends Phaser.Scene {
  // UI要素
  private titleText!: Phaser.GameObjects.Text;
  private menuContainer!: Phaser.GameObjects.Container;
  private playerStatusPanel!: Phaser.GameObjects.Container;
  
  // メニューの状態管理
  private activeMenuIndex: number = 0;
  private subMenuActive: boolean = false;
  
  // プレイヤーデータ
  private playerData: PlayerData;
  
  constructor() {
    super('MenuScene');
  }
  
  create(): void {
    // 背景の作成
    this.createBackground();
    
    // タイトル表示
    this.createTitle();
    
    // メインメニューの作成
    this.createMainMenu();
    
    // プレイヤーステータスパネルの作成
    this.createPlayerStatusPanel();
  }
}
```

### 2. メインメニュー項目

メインメニューには以下の項目を実装します:

1. **バトル開始** - ステージ選択サブメニューを開く
2. **アイテム** - 所持アイテムの確認・使用画面を開く
3. **装備** - 装備の確認・変更画面を開く
4. **ステータス** - プレイヤーの詳細ステータスを表示

```typescript
private createMainMenu(): void {
  this.menuContainer = this.add.container(50, 150);
  
  const menuItems = [
    { text: 'バトル開始', action: this.openStageSelect },
    { text: 'アイテム', action: this.openItemMenu },
    { text: '装備', action: this.openEquipmentMenu },
    { text: 'ステータス', action: this.openStatusMenu }
  ];
  
  // メニューボタンの作成
  menuItems.forEach((item, index) => {
    const button = this.createMenuButton(item.text, 0, index * 60);
    button.on('pointerdown', item.action, this);
    this.menuContainer.add(button);
  });
}

// ボタン作成ヘルパーメソッド
private createMenuButton(text: string, x: number, y: number): Phaser.GameObjects.Container {
  const container = this.add.container(x, y);
  
  // ボタン背景
  const background = this.add.rectangle(0, 0, 200, 50, 0x0088ff, 0.8);
  background.setInteractive({ useHandCursor: true });
  
  // ボタンテキスト
  const buttonText = this.add.text(0, 0, text, {
    fontFamily: 'Arial',
    fontSize: '18px',
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
```

### 3. ステージ選択サブメニュー

バトル開始を選択したときに表示するステージ選択メニューです:

```typescript
private openStageSelect(): void {
  this.subMenuActive = true;
  
  // 既存のメインメニューを一時的に隠す
  this.tweens.add({
    targets: this.menuContainer,
    x: -200,
    duration: 300
  });
  
  // ステージ選択メニューの作成
  const stageSelectContainer = this.add.container(800, 150);
  
  // 利用可能なステージリスト
  const stages = [
    { id: '1-1', name: 'ゴブリンの森 1', level: 1, unlocked: true },
    { id: '1-2', name: 'ゴブリンの森 2', level: 3, unlocked: true },
    { id: '1-3', name: 'ゴブリンの森 3', level: 5, unlocked: false }
  ];
  
  // ステージボタン生成
  stages.forEach((stage, index) => {
    const button = this.createStageButton(stage, 0, index * 70);
    stageSelectContainer.add(button);
  });
  
  // 戻るボタン
  const backButton = this.createMenuButton('戻る', 0, stages.length * 70 + 20);
  backButton.on('pointerdown', () => {
    this.closeSubMenu(stageSelectContainer);
  });
  stageSelectContainer.add(backButton);
  
  // アニメーションでメニューを表示
  this.tweens.add({
    targets: stageSelectContainer,
    x: 300,
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
  
  // クリックイベント
  if (stage.unlocked) {
    background.on('pointerdown', () => {
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
  
  return container;
}

// バトル開始
private startBattle(stageId: string): void {
  this.scene.start('BattleScene', { stageId });
}
```

### 4. プレイヤーステータスパネル

画面右側にプレイヤーの基本情報を表示するパネルを実装します:

```typescript
private createPlayerStatusPanel(): void {
  this.playerStatusPanel = this.add.container(600, 150);
  
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
```

### 5. アイテムメニュー

アイテム管理画面の基本実装です:

```typescript
private openItemMenu(): void {
  this.subMenuActive = true;
  
  // メインメニューを隠す
  this.tweens.add({
    targets: this.menuContainer,
    x: -200,
    duration: 300
  });
  
  // アイテムメニューコンテナ
  const itemMenuContainer = this.add.container(800, 150);
  
  // タイトル
  const titleText = this.add.text(0, -40, 'アイテム', {
    fontFamily: 'Arial',
    fontSize: '24px',
    color: '#ffffff'
  });
  titleText.setOrigin(0.5, 0.5);
  
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
    emptyText.setOrigin(0.5, 0.5);
    itemListContainer.add(emptyText);
  }
  
  // 戻るボタン
  const backButton = this.createMenuButton('戻る', 0, 250);
  backButton.on('pointerdown', () => {
    this.closeSubMenu(itemMenuContainer);
  });
  
  itemMenuContainer.add([titleText, listBackground, itemListContainer, backButton]);
  
  // アニメーションでメニューを表示
  this.tweens.add({
    targets: itemMenuContainer,
    x: 400,
    duration: 300
  });
}
```

### 6. プレイヤーデータ型定義

メニュー間でデータを共有するためのプレイヤーデータインターフェースを定義します:

```typescript
// src/types/PlayerTypes.ts
export interface PlayerData {
  name: string;
  level: number;
  exp: number;
  maxExp: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  gold: number;
  items: InventoryItem[];
  equipment: Equipment;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'consumable' | 'equipment' | 'key';
  quantity: number;
  effect?: ItemEffect;
}

export interface Equipment {
  weapon?: EquipmentItem;
  armor?: EquipmentItem;
  accessory?: EquipmentItem;
}

export interface EquipmentItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  statBonus: {
    attack?: number;
    defense?: number;
    health?: number;
    speed?: number;
  };
}

export interface ItemEffect {
  healHealth?: number;
  temporaryBoost?: {
    stat: 'attack' | 'defense' | 'speed';
    amount: number;
    duration: number;
  };
}
```

## 実装計画

1. プレイヤーデータ型の定義と基本データ構造の実装
2. MainSceneを拡張したMenuSceneの基本UIの実装
3. 各メニュー画面の実装（ステージ選択、アイテム、装備、ステータス）
4. リザルトシーンからMenuSceneへの遷移処理の実装
5. プレイヤーデータの永続化（localStorageを利用）

## 技術的な注意点

- コンポーネント指向の設計で、UI要素を再利用可能なコンポーネントとして実装
- アニメーションを活用したスムーズなUI遷移
- プレイヤーデータを中央で管理し、シーン間で適切に受け渡す仕組み
- 将来的な拡張を考慮した柔軟な設計
