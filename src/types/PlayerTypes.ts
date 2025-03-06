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

// デフォルトのプレイヤーデータ
export const DEFAULT_PLAYER_DATA: PlayerData = {
  name: 'Hero',
  level: 1,
  exp: 0,
  maxExp: 100,
  health: 100,
  maxHealth: 100,
  attack: 10,
  defense: 5,
  speed: 2,
  gold: 100,
  items: [
    {
      id: 'potion_small',
      name: '小さな回復薬',
      type: 'consumable',
      quantity: 3,
      effect: {
        healHealth: 30
      }
    }
  ],
  equipment: {
    weapon: {
      id: 'sword_basic',
      name: '銅の剣',
      type: 'weapon',
      statBonus: {
        attack: 3
      }
    },
    armor: {
      id: 'armor_leather',
      name: '革の鎧',
      type: 'armor',
      statBonus: {
        defense: 2
      }
    },
    accessory: undefined
  }
};
