# アイテムシステム 実装計画

## 概要

アイテムと装備のシステムは、RPGの核となる要素です。プレイヤーの進行と成長を支援し、ゲーム体験を豊かにします。現在はこの機能が未実装であるため、将来的な開発計画としてシステムの設計案をまとめます。

## 目標

1. プレイヤーがアイテムを収集、使用、管理できるシステムの構築
2. 装備品による能力値の強化システムの実装
3. 戦闘や探索でのアイテム収集の仕組みづくり
4. アイテムの売買システムの構築

## アイテムシステムの基本設計

### 1. アイテムの基本構造

```typescript
// src/objects/Item.ts
export enum ItemType {
  CONSUMABLE,  // 消費アイテム（ポーションなど）
  WEAPON,      // 武器
  ARMOR,       // 防具
  ACCESSORY,   // アクセサリー
  KEY_ITEM     // イベントアイテム
}

export enum ItemRarity {
  COMMON,      // 一般的
  UNCOMMON,    // 珍しい
  RARE,        // レア
  EPIC,        // エピック
  LEGENDARY    // 伝説級
}

export interface ItemEffect {
  // 効果の種類
  type: 'heal' | 'damage' | 'buff' | 'debuff';
  // 影響を与えるステータス
  stat?: 'health' | 'attack' | 'defense' | 'speed';
  // 効果の量
  value: number;
  // 効果の持続時間（バフ/デバフの場合）
  duration?: number;
}

export class Item {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: ItemType;
  readonly rarity: ItemRarity;
  readonly value: number; // 売却価格
  readonly effects: ItemEffect[];
  readonly iconKey: string; // アイコン画像のキー
  
  constructor(config: {
    id: string;
    name: string;
    description: string;
    type: ItemType;
    rarity: ItemRarity;
    value: number;
    effects: ItemEffect[];
    iconKey: string;
  }) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.type = config.type;
    this.rarity = config.rarity;
    this.value = config.value;
    this.effects = config.effects;
    this.iconKey = config.iconKey;
  }
  
  // アイテムを使用
  use(target: Unit): boolean {
    if (this.type !== ItemType.CONSUMABLE) {
      console.warn(`${this.name} is not a consumable item.`);
      return false;
    }
    
    // 各効果を適用
    this.effects.forEach(effect => {
      this.applyEffect(effect, target);
    });
    
    return true;
  }
  
  // 効果の適用
  private applyEffect(effect: ItemEffect, target: Unit): void {
    switch (effect.type) {
      case 'heal':
        if (effect.stat === 'health') {
          target.heal(effect.value);
        }
        break;
        
      case 'buff':
        if (effect.stat && effect.duration) {
          target.addBuff(effect.stat, effect.value, effect.duration);
        }
        break;
        
      case 'debuff':
        if (effect.stat && effect.duration) {
          target.addDebuff(effect.stat, effect.value, effect.duration);
        }
        break;
        
      case 'damage':
        target.takeDamage(effect.value);
        break;
    }
  }
  
  // アイテムのレア度に応じた色コードを取得
  getRarityColor(): number {
    switch (this.rarity) {
      case ItemRarity.COMMON: return 0xffffff;     // 白
      case ItemRarity.UNCOMMON: return 0x00ff00;   // 緑
      case ItemRarity.RARE: return 0x0000ff;       // 青
      case ItemRarity.EPIC: return 0x800080;       // 紫
      case ItemRarity.LEGENDARY: return 0xffa500;  // オレンジ
      default: return 0xffffff;
    }
  }
}
```

### 2. 装備品クラス

```typescript
// src/objects/Equipment.ts
import { Item, ItemType } from './Item';

export interface EquipmentStats {
  attack?: number;
  defense?: number;
  health?: number;
  speed?: number;
}

export class Equipment extends Item {
  readonly equipmentType: 'weapon' | 'armor' | 'accessory';
  readonly stats: EquipmentStats;
  
  constructor(config: {
    id: string;
    name: string;
    description: string;
    rarity: ItemRarity;
    value: number;
    effects: ItemEffect[];
    iconKey: string;
    equipmentType: 'weapon' | 'armor' | 'accessory';
    stats: EquipmentStats;
  }) {
    super({
      ...config,
      type: this.getItemTypeFromEquipmentType(config.equipmentType)
    });
    
    this.equipmentType = config.equipmentType;
    this.stats = config.stats;
  }
  
  // 装備タイプからItemTypeを取得
  private static getItemTypeFromEquipmentType(equipType: string): ItemType {
    switch (equipType) {
      case 'weapon': return ItemType.WEAPON;
      case 'armor': return ItemType.ARMOR;
      case 'accessory': return ItemType.ACCESSORY;
      default: return ItemType.WEAPON;
    }
  }
  
  // 装備できるかどうかを確認
  canEquip(unit: Unit): boolean {
    // 将来的に職業やレベル制限などを実装
    return true;
  }
}
```

### 3. インベントリシステム

```typescript
// src/systems/Inventory.ts
import { Item } from '../objects/Item';
import { Equipment } from '../objects/Equipment';

export interface InventoryItem {
  item: Item;
  quantity: number;
}

export class Inventory {
  private items: Map<string, InventoryItem> = new Map();
  private maxSize: number;
  
  constructor(maxSize: number = 20) {
    this.maxSize = maxSize;
  }
  
  // アイテムの追加
  addItem(item: Item, quantity: number = 1): boolean {
    // 容量確認
    if (this.items.size >= this.maxSize && !this.items.has(item.id)) {
      console.warn('Inventory is full');
      return false;
    }
    
    // 既存アイテムの場合は数量を増やす
    if (this.items.has(item.id)) {
      const inventoryItem = this.items.get(item.id)!;
      inventoryItem.quantity += quantity;
      this.items.set(item.id, inventoryItem);
    } else {
      // 新規アイテムの場合は追加
      this.items.set(item.id, { item, quantity });
    }
    
    return true;
  }
  
  // アイテムの使用
  useItem(itemId: string, target: Unit): boolean {
    if (!this.items.has(itemId)) {
      console.warn(`Item ${itemId} not found in inventory`);
      return false;
    }
    
    const inventoryItem = this.items.get(itemId)!;
    
    // 消費アイテムでない場合は使用できない
    if (inventoryItem.item.type !== ItemType.CONSUMABLE) {
      console.warn(`Item ${itemId} is not consumable`);
      return false;
    }
    
    // アイテムを使用
    if (inventoryItem.item.use(target)) {
      // 使用したアイテムの数を減らす
      inventoryItem.quantity--;
      
      // 数量が0になったら削除
      if (inventoryItem.quantity <= 0) {
        this.items.delete(itemId);
      } else {
        this.items.set(itemId, inventoryItem);
      }
      
      return true;
    }
    
    return false;
  }
  
  // アイテムの取得
  getItem(itemId: string): InventoryItem | undefined {
    return this.items.get(itemId);
  }
  
  // 全アイテムの取得
  getAllItems(): InventoryItem[] {
    return Array.from(this.items.values());
  }
  
  // アイテムの削除
  removeItem(itemId: string, quantity: number = 1): boolean {
    if (!this.items.has(itemId)) {
      return false;
    }
    
    const inventoryItem = this.items.get(itemId)!;
    
    if (inventoryItem.quantity <= quantity) {
      this.items.delete(itemId);
    } else {
      inventoryItem.quantity -= quantity;
      this.items.set(itemId, inventoryItem);
    }
    
    return true;
  }
  
  // インベントリのクリア
  clear(): void {
    this.items.clear();
  }
  
  // インベントリの現在のサイズ
  get size(): number {
    return this.items.size;
  }
  
  // インベントリの最大サイズ
  get capacity(): number {
    return this.maxSize;
  }
}
```

### 4. 装備システム

```typescript
// src/systems/EquipmentSystem.ts
import { Unit } from '../objects/Unit';
import { Equipment } from '../objects/Equipment';

export class EquipmentSystem {
  private unit: Unit;
  private weapon: Equipment | null = null;
  private armor: Equipment | null = null;
  private accessory: Equipment | null = null;
  
  constructor(unit: Unit) {
    this.unit = unit;
  }
  
  // 装備の着脱
  equip(equipment: Equipment): boolean {
    // 装備可能かチェック
    if (!equipment.canEquip(this.unit)) {
      return false;
    }
    
    // 既存の装備を外す
    const oldEquipment = this.getEquipmentByType(equipment.equipmentType);
    if (oldEquipment) {
      this.unequip(equipment.equipmentType);
    }
    
    // 新しい装備を着ける
    switch (equipment.equipmentType) {
      case 'weapon':
        this.weapon = equipment;
        break;
      case 'armor':
        this.armor = equipment;
        break;
      case 'accessory':
        this.accessory = equipment;
        break;
    }
    
    // ユニットのステータスを更新
    this.updateUnitStats();
    
    return true;
  }
  
  // 装備を外す
  unequip(equipmentType: 'weapon' | 'armor' | 'accessory'): Equipment | null {
    let removed: Equipment | null = null;
    
    switch (equipmentType) {
      case 'weapon':
        removed = this.weapon;
        this.weapon = null;
        break;
      case 'armor':
        removed = this.armor;
        this.armor = null;
        break;
      case 'accessory':
        removed = this.accessory;
        this.accessory = null;
        break;
    }
    
    // ユニットのステータスを更新
    this.updateUnitStats();
    
    return removed;
  }
  
  // 装備タイプから現在の装備を取得
  getEquipmentByType(type: 'weapon' | 'armor' | 'accessory'): Equipment | null {
    switch (type) {
      case 'weapon': return this.weapon;
      case 'armor': return this.armor;
      case 'accessory': return this.accessory;
      default: return null;
    }
  }
  
  // すべての装備を取得
  getAllEquipment(): (Equipment | null)[] {
    return [this.weapon, this.armor, this.accessory];
  }
  
  // ユニットのステータスを更新
  private updateUnitStats(): void {
    // 基本ステータスにリセット
    this.unit.resetStats();
    
    // 装備による追加ステータスを適用
    const allEquipment = this.getAllEquipment().filter(e => e !== null) as Equipment[];
    
    for (const equipment of allEquipment) {
      if (equipment.stats.attack) {
        this.unit.addAttackBonus(equipment.stats.attack);
      }
      if (equipment.stats.defense) {
        this.unit.addDefenseBonus(equipment.stats.defense);
      }
      if (equipment.stats.health) {
        this.unit.addMaxHealthBonus(equipment.stats.health);
      }
      if (equipment.stats.speed) {
        this.unit.addSpeedBonus(equipment.stats.speed);
      }
    }
  }
}
```

### 5. アイテムマネージャー

```typescript
// src/managers/ItemManager.ts
import { Item, ItemType, ItemRarity, ItemEffect } from '../objects/Item';
import { Equipment, EquipmentStats } from '../objects/Equipment';

export class ItemManager {
  private items: Map<string, Item> = new Map();
  
  constructor() {
    // 初期アイテムのロード
    this.loadItems();
  }
  
  // アイテムの取得
  getItem(itemId: string): Item | undefined {
    return this.items.get(itemId);
  }
  
  // アイテムの生成と登録
  private createItem(config: any): Item {
    let item: Item;
    
    // 装備品の場合
    if (config.type === ItemType.WEAPON || config.type === ItemType.ARMOR || config.type === ItemType.ACCESSORY) {
      item = new Equipment({
        ...config,
        equipmentType: this.getEquipmentTypeFromItemType(config.type),
        stats: config.stats || {}
      });
    } else {
      // 通常アイテムの場合
      item = new Item(config);
    }
    
    // アイテムを登録
    this.items.set(item.id, item);
    
    return item;
  }
  
  // ItemTypeから装備タイプへの変換
  private getEquipmentTypeFromItemType(itemType: ItemType): 'weapon' | 'armor' | 'accessory' {
    switch (itemType) {
      case ItemType.WEAPON: return 'weapon';
      case ItemType.ARMOR: return 'armor';
      case ItemType.ACCESSORY: return 'accessory';
      default: return 'weapon'; // デフォルト値
    }
  }
  
  // 初期アイテムのロード
  private loadItems(): void {
    // 回復アイテム
    this.createItem({
      id: 'potion_small',
      name: '小さな回復薬',
      description: 'HPを30回復します',
      type: ItemType.CONSUMABLE,
      rarity: ItemRarity.COMMON,
      value: 50,
      effects: [
        { type: 'heal', stat: 'health', value: 30 }
      ],
      iconKey: 'potion_small'
    });
    
    this.createItem({
      id: 'potion_medium',
      name: '回復薬',
      description: 'HPを75回復します',
      type: ItemType.CONSUMABLE,
      rarity: ItemRarity.UNCOMMON,
      value: 120,
      effects: [
        { type: 'heal', stat: 'health', value: 75 }
      ],
      iconKey: 'potion_medium'
    });
    
    // 武器
    this.createItem({
      id: 'sword_basic',
      name: '銅の剣',
      description: '基本的な剣です',
      type: ItemType.WEAPON,
      rarity: ItemRarity.COMMON,
      value: 150,
      effects: [],
      stats: { attack: 5 },
      iconKey: 'sword_basic'
    });
    
    this.createItem({
      id: 'sword_steel',
      name: '鋼の剣',
      description: '丈夫な鋼鉄製の剣です',
      type: ItemType.WEAPON,
      rarity: ItemRarity.UNCOMMON,
      value: 350,
      effects: [],
      stats: { attack: 12 },
      iconKey: 'sword_steel'
    });
    
    // 防具
    this.createItem({
      id: 'armor_leather',
      name: '革の鎧',
      description: '基本的な革の防具です',
      type: ItemType.ARMOR,
      rarity: ItemRarity.COMMON,
      value: 200,
      effects: [],
      stats: { defense: 5 },
      iconKey: 'armor_leather'
    });
    
    // アクセサリー
    this.createItem({
      id: 'ring_speed',
      name: '素早さの指輪',
      description: '移動速度が上昇します',
      type: ItemType.ACCESSORY,
      rarity: ItemRarity.RARE,
      value: 500,
      effects: [],
      stats: { speed: 0.5 },
      iconKey: 'ring_speed'
    });
  }
}
```

## インターフェースとの連携

### 1. メニューシーンでのアイテム管理画面

```typescript
// src/scenes/MenuScene.ts の一部
private openItemMenu(): void {
  // 既存のメインメニュー処理...
  
  // アイテムリスト表示
  const playerItems = this.playerData.inventory.getAllItems();
  
  if (playerItems.length > 0) {
    playerItems.forEach((inventoryItem, index) => {
      const item = inventoryItem.item;
      const y = index * 40;
      
      // アイテムボタン生成
      const itemButton = this.createItemButton(item, inventoryItem.quantity, 0, y);
      
      // クリックイベント
      itemButton.on('pointerdown', () => {
        // アイテム詳細と操作メニューを表示
        this.showItemActions(item);
      });
      
      itemListContainer.add(itemButton);
    });
  } else {
    // アイテムがない場合のメッセージ
    const emptyText = this.add.text(0, 100, 'アイテムがありません', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#cccccc'
    });
    itemListContainer.add(emptyText);
  }
}

// アイテムボタンの作成
private createItemButton(item: Item, quantity: number, x: number, y: number): Phaser.GameObjects.Container {
  const container = this.add.container(x, y);
  
  // 背景
  const background = this.add.rectangle(0, 0, 300, 35, 0x333333, 0.8);
  background.setInteractive({ useHandCursor: true });
  
  // アイテムアイコン
  const icon = this.add.image(-130, 0, item.iconKey);
  icon.setScale(0.5);
  
  // アイテム名（レア度に応じた色）
  const nameText = this.add.text(-100, 0, item.name, {
    fontFamily: 'Arial',
    fontSize: '16px',
    color: this.getRarityColorString(item.rarity)
  });
  nameText.setOrigin(0, 0.5);
  
  // 数量表示
  const quantityText = this.add.text(130, 0, `x${quantity}`, {
    fontFamily: 'Arial',
    fontSize: '14px',
    color: '#ffffff'
  });
  quantityText.setOrigin(1, 0.5);
  
  container.add([background, icon, nameText, quantityText]);
  
  return container;
}

// アイテム操作メニューの表示
private showItemActions(item: Item): void {
  // アクションメニューのコンテナ
  const actionsContainer = this.add.container(400, 300);
  
  // 背景
  const actionsBg = this.add.rectangle(0, 0, 200, 180, 0x000000, 0.8);
  
  // アクションボタン
  const actions = [
    { text: '使用', action: () => this.useItem(item) },
    { text: '捨てる', action: () => this.discardItem(item) },
    { text: '詳細', action: () => this.showItemDetails(item) },
    { text: '閉じる', action: () => actionsContainer.destroy() }
  ];
  
  // 使用できないアイテムは使用ボタンを無効化
  if (item.type !== ItemType.CONSUMABLE) {
    actions[0].text = '使用 (不可)';
    actions[0].action = () => {
      console.log('このアイテムは使用できません');
    };
  }
  
  // ボタン生成
  const actionButtons = actions.map((action, index) => {
    const y = -60 + index * 40;
    const button = this.createActionButton(action.text, 0, y);
    button.on('pointerdown', action.action);
    return button;
  });
  
  actionsContainer.add([actionsBg, ...actionButtons]);
  
  // アニメーションでメニューを表示
  this.tweens.add({
    targets: actionsContainer,
    scale: { from: 0.5, to: 1 },
    duration: 200,
    ease: 'Back.easeOut'
  });
}
```

## 実装計画と優先順位

アイテムシステムは次のフェーズで実装します：

### フェーズ1: 基本構造の実装
- アイテムとインベントリの基本クラス実装
- シンプルな消費アイテムの実装（回復薬など）
- インベントリUI基本実装

### フェーズ2: 装備システムの実装
- 装備品クラスの実装
- 装備による能力値ボーナスの適用
- 装備管理UI実装

### フェーズ3: ドロップと収集システム
- 敵からのアイテムドロップシステム
- チェストや宝箱の実装
- アイテム収集時の視覚効果

### フェーズ4: ショップシステム
- NPCショップの実装
- アイテムの売買機能
- 価格変動システム（オプション）

## 技術的な注意点

1. **データ構造の最適化**
   - 大量のアイテムデータを効率的に管理
   - JSONなどの外部ファイルからアイテムデータを読み込む仕組み

2. **UIの使いやすさ**
   - ドラッグ＆ドロップによる直感的な操作
   - アイテムの分類とソート機能

3. **ゲームバランス**
   - アイテムの効果とコストのバランス調整
   - 装備の性能が適切に段階的に強化される設計

4. **拡張性**
   - 新しいアイテムタイプの追加が容易な設計
   - 将来的なクエストやクラフトシステムとの連携
