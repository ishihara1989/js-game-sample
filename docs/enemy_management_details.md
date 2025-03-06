# 敵ユニット管理 実装詳細

## 現状の課題

現在の敵ユニット管理には以下の問題があります：

- 敵とプレイヤーに同じUnitクラスを使用しており、敵特有の行動パターンの実装が難しい
- 敵の種類ごとに異なる特性や行動を持たせることができない
- 敵の生成と管理がBattleSceneに直接実装されているため拡張性に乏しい
- 複数の敵ユニットを配置するための仕組みが整っていない

## 実装の方針

敵ユニットの管理を改善し、より柔軟な敵の行動パターンや多様な敵タイプを実現します。

### 1. 敵ユニットの基本クラス

Unit クラスを拡張した EnemyUnit 基底クラスを実装します：

```typescript
// src/objects/EnemyUnit.ts
import { Unit } from './Unit';
import { BattleScene } from '../scenes/BattleScene';

// 敵の行動パターンを定義する型
export enum EnemyBehavior {
  AGGRESSIVE,  // 積極的に攻撃
  DEFENSIVE,   // 守備重視
  SUPPORT,     // 援護型
  RANGED       // 遠距離型
}

export abstract class EnemyUnit extends Unit {
  // 敵特有のプロパティ
  protected behavior: EnemyBehavior;
  protected aggroRange: number; // 敵が反応する距離
  protected specialAbilityCooldown: number = 0;
  protected specialAbilityMaxCooldown: number = 5000; // ミリ秒
  
  constructor(config: UnitConfig, behavior: EnemyBehavior = EnemyBehavior.AGGRESSIVE) {
    super({
      ...config,
      isPlayer: false
    });
    
    this.behavior = behavior;
    this.aggroRange = config.aggroRange || 300;
  }
  
  // ユニットの更新処理をオーバーライド
  update(delta: number): void {
    // 基本的な更新処理は親クラスと同じ
    super.update(delta);
    
    // 特殊能力のクールダウンを更新
    if (this.specialAbilityCooldown > 0) {
      this.specialAbilityCooldown -= delta;
      if (this.specialAbilityCooldown < 0) {
        this.specialAbilityCooldown = 0;
      }
    }
  }
  
  // 敵特有の行動パターンを実装
  protected updateAI(delta: number): void {
    // 基本的なAI処理はそのまま継承
    super.updateAI(delta);
    
    // ここに行動パターンに応じた追加のAI処理を実装
    switch (this.behavior) {
      case EnemyBehavior.AGGRESSIVE:
        this.updateAggressiveBehavior();
        break;
      case EnemyBehavior.DEFENSIVE:
        this.updateDefensiveBehavior();
        break;
      case EnemyBehavior.SUPPORT:
        this.updateSupportBehavior();
        break;
      case EnemyBehavior.RANGED:
        this.updateRangedBehavior();
        break;
    }
    
    // 特殊能力の使用判定
    this.checkSpecialAbility();
  }
  
  // 積極的な攻撃行動パターン
  private updateAggressiveBehavior(): void {
    // ターゲットに向かって積極的に近づく
    if (this.target && this.moveCooldown <= 0 && !this.movementTarget) {
      const distance = Phaser.Math.Distance.Between(
        this.x, this.y,
        this.target.x, this.target.y
      );
      
      if (distance > 100) {
        // より近くに移動
        this.moveCloserToTarget();
      }
    }
  }
  
  // 守備的な行動パターン
  private updateDefensiveBehavior(): void {
    // 距離を保ちつつ戦う
    if (this.target && this.moveCooldown <= 0 && !this.movementTarget) {
      const distance = Phaser.Math.Distance.Between(
        this.x, this.y,
        this.target.x, this.target.y
      );
      
      // 近すぎる場合は距離を取る
      if (distance < 80) {
        this.moveAwayFromTarget();
      }
      // 遠すぎる場合は適度に近づく
      else if (distance > 200) {
        this.moveCloserToTarget();
      }
    }
  }
  
  // 支援型の行動パターン
  private updateSupportBehavior(): void {
    // 味方を優先的に回復/強化する行動など
    // この例では単純化のため省略
  }
  
  // 遠距離型の行動パターン
  private updateRangedBehavior(): void {
    // 距離を保ちながら遠距離攻撃を行う
    if (this.target && this.moveCooldown <= 0 && !this.movementTarget) {
      const distance = Phaser.Math.Distance.Between(
        this.x, this.y,
        this.target.x, this.target.y
      );
      
      // 最適な射撃距離を保つ
      const optimalRange = 250;
      if (distance < optimalRange - 50) {
        this.moveAwayFromTarget();
      } else if (distance > optimalRange + 50) {
        this.moveCloserToTarget();
      }
    }
  }
  
  // 特殊能力の使用判定（サブクラスでオーバーライド）
  protected checkSpecialAbility(): void {
    // 特殊能力のクールダウンが0かつ条件を満たす場合に特殊能力を使用
    if (this.specialAbilityCooldown <= 0 && this.target) {
      // サブクラスで具体的な判定と処理を実装
    }
  }
  
  // 特殊能力（サブクラスでオーバーライド）
  protected useSpecialAbility(): void {
    // サブクラスで具体的な特殊能力を実装
    this.specialAbilityCooldown = this.specialAbilityMaxCooldown;
  }
  
  // ターゲットに近づく
  protected moveCloserToTarget(): void {
    if (!this.target) return;
    
    const angle = Phaser.Math.Angle.Between(
      this.x, this.y,
      this.target.x, this.target.y
    );
    
    const distance = 100;
    const targetX = this.target.x - Math.cos(angle) * distance;
    const targetY = this.target.y - Math.sin(angle) * distance;
    
    // 移動先を設定
    this.movementTarget = new Phaser.Math.Vector2(targetX, targetY);
    this.moveCooldown = this.moveCooldownMax;
  }
  
  // ターゲットから離れる
  protected moveAwayFromTarget(): void {
    if (!this.target) return;
    
    const angle = Phaser.Math.Angle.Between(
      this.x, this.y,
      this.target.x, this.target.y
    );
    
    const distance = 150;
    const targetX = this.x + Math.cos(angle) * distance;
    const targetY = this.y + Math.sin(angle) * distance;
    
    // 画面外に出ないように調整
    const bounds = 50;
    const clampedX = Phaser.Math.Clamp(targetX, bounds, 800 - bounds);
    const clampedY = Phaser.Math.Clamp(targetY, bounds, 600 - bounds);
    
    // 移動先を設定
    this.movementTarget = new Phaser.Math.Vector2(clampedX, clampedY);
    this.moveCooldown = this.moveCooldownMax;
  }
  
  // 敵の種類に応じたスキル使用をオーバーライド
  useSkill(): void {
    // サブクラスで具体的なスキルを実装
    super.useSkill();
  }
  
  // 敵の種類名を取得（サブクラスでオーバーライド）
  getEnemyType(): string {
    return "Unknown Enemy";
  }
  
  // 敵のドロップアイテム情報を取得（サブクラスでオーバーライド）
  getDropItems(): string[] {
    return [];
  }
}
```

### 2. 具体的な敵クラスの例

#### 2.1 ゴブリン

```typescript
// src/objects/enemies/GoblinEnemy.ts
import { EnemyUnit, EnemyBehavior } from '../EnemyUnit';
import { BattleScene } from '../../scenes/BattleScene';

export class GoblinEnemy extends EnemyUnit {
  constructor(scene: BattleScene, x: number, y: number) {
    super({
      scene,
      x,
      y,
      texture: 'enemy', // 適切なゴブリンのテクスチャに変更予定
      name: 'Goblin',
      maxHealth: 80,
      attack: 8,
      defense: 3,
      speed: 1.5,
      color: 0xff5555,
      aggroRange: 250
    }, EnemyBehavior.AGGRESSIVE);
    
    // ゴブリン特有の設定
    this.specialAbilityMaxCooldown = 8000; // 8秒
  }
  
  // ゴブリン特有のスキル
  useSkill(): void {
    if (!this.target) return;
    if (this.skillCooldown < this.skillMaxCooldown) return;
    
    // スキルクールダウンをリセット
    this.skillCooldown = 0;
    this.attackCooldown = this.attackCooldownMax;
    
    // ゴブリン特有のスキル効果（連続攻撃など）
    const hits = 2; // 2回攻撃
    let totalDamage = 0;
    
    for (let i = 0; i < hits; i++) {
      const damage = Math.max(1, Math.floor(this.attackPower * 0.7) - Math.floor(this.target.defense / 3));
      this.target.takeDamage(damage);
      totalDamage += damage;
      
      // 少し遅延をつけて攻撃エフェクトを表示
      if (this.scene instanceof BattleScene) {
        this.scene.time.delayedCall(i * 200, () => {
          this.scene.showAttackEffect(this, this.target!);
        });
      }
    }
    
    // スキルエフェクト
    if (this.scene instanceof BattleScene) {
      this.scene.showSkillEffect(this, this.target);
    }
    
    console.log(`${this.name} uses Goblin Frenzy on ${this.target.name} for ${totalDamage} total damage!`);
  }
  
  // ゴブリン特有の特殊能力（怒り状態）
  protected checkSpecialAbility(): void {
    if (this.specialAbilityCooldown <= 0 && this.target && this.health < this.maxHealth * 0.3) {
      // 体力が30%以下で発動
      this.useSpecialAbility();
    }
  }
  
  protected useSpecialAbility(): void {
    // 怒り状態になり、攻撃力一時的に上昇
    const originalAttack = this.attackPower;
    this.attackPower = Math.floor(this.attackPower * 1.5);
    
    // エフェクト表示
    if (this.scene instanceof BattleScene) {
      // 赤い怒りオーラなどのエフェクト
      const rageEffect = this.scene.add.graphics();
      rageEffect.fillStyle(0xff0000, 0.3);
      rageEffect.fillCircle(0, 0, 30);
      this.add(rageEffect);
      
      // 怒りテキスト表示
      const rageText = this.scene.add.text(0, -50, 'Rage!', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ff0000'
      });
      rageText.setOrigin(0.5);
      this.add(rageText);
      
      // 効果時間後に元に戻す
      this.scene.time.delayedCall(3000, () => {
        this.attackPower = originalAttack;
        rageEffect.destroy();
        rageText.destroy();
      });
    }
    
    // クールダウン設定
    this.specialAbilityCooldown = this.specialAbilityMaxCooldown;
    
    console.log(`${this.name} enters a rage state!`);
  }
  
  getEnemyType(): string {
    return "Goblin";
  }
  
  getDropItems(): string[] {
    return ['Goblin Fang', 'Leather Scrap'];
  }
}
```

#### 2.2 オーク

```typescript
// src/objects/enemies/OrcEnemy.ts
import { EnemyUnit, EnemyBehavior } from '../EnemyUnit';
import { BattleScene } from '../../scenes/BattleScene';

export class OrcEnemy extends EnemyUnit {
  constructor(scene: BattleScene, x: number, y: number) {
    super({
      scene,
      x,
      y,
      texture: 'enemy', // 適切なオークのテクスチャに変更予定
      name: 'Orc',
      maxHealth: 120,
      attack: 12,
      defense: 6,
      speed: 1.2,
      color: 0x885533,
      aggroRange: 200
    }, EnemyBehavior.DEFENSIVE);
    
    // オーク特有の設定
    this.specialAbilityMaxCooldown = 10000; // 10秒
  }
  
  // オーク特有のスキル
  useSkill(): void {
    if (!this.target) return;
    if (this.skillCooldown < this.skillMaxCooldown) return;
    
    // スキルクールダウンをリセット
    this.skillCooldown = 0;
    this.attackCooldown = this.attackCooldownMax;
    
    // オーク特有のスキル効果（強力な一撃）
    const damage = Math.max(2, this.attackPower * 2.5 - this.target.defense);
    this.target.takeDamage(damage);
    
    // スキルエフェクト
    if (this.scene instanceof BattleScene) {
      this.scene.showSkillEffect(this, this.target);
    }
    
    console.log(`${this.name} uses Orc Smash on ${this.target.name} for ${damage} damage!`);
  }
  
  // オーク特有の特殊能力（防御態勢）
  protected checkSpecialAbility(): void {
    if (this.specialAbilityCooldown <= 0 && this.target && 
        Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) < 120) {
      // 敵が近くにいる場合に発動
      this.useSpecialAbility();
    }
  }
  
  protected useSpecialAbility(): void {
    // 防御態勢になり、防御力一時的に上昇
    const originalDefense = this.defense;
    this.defense = Math.floor(this.defense * 2);
    
    // エフェクト表示
    if (this.scene instanceof BattleScene) {
      // 防御シールドのエフェクト
      const shieldEffect = this.scene.add.graphics();
      shieldEffect.lineStyle(2, 0x0088ff, 0.8);
      shieldEffect.strokeCircle(0, 0, 35);
      this.add(shieldEffect);
      
      // 防御テキスト表示
      const defenseText = this.scene.add.text(0, -50, 'Defense Up!', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#0088ff'
      });
      defenseText.setOrigin(0.5);
      this.add(defenseText);
      
      // 効果時間後に元に戻す
      this.scene.time.delayedCall(4000, () => {
        this.defense = originalDefense;
        shieldEffect.destroy();
        defenseText.destroy();
      });
    }
    
    // クールダウン設定
    this.specialAbilityCooldown = this.specialAbilityMaxCooldown;
    
    console.log(`${this.name} enters a defensive stance!`);
  }
  
  getEnemyType(): string {
    return "Orc";
  }
  
  getDropItems(): string[] {
    return ['Orc Tooth', 'Heavy Bone', 'Rusted Armor Piece'];
  }
}
```

### 3. 敵管理クラス

敵ユニットと戦闘シーンを橋渡しする `EnemyManager` クラスを実装します：

```typescript
// src/managers/EnemyManager.ts
import { BattleScene } from '../scenes/BattleScene';
import { EnemyUnit } from '../objects/EnemyUnit';
import { Unit } from '../objects/Unit';
import { GoblinEnemy } from '../objects/enemies/GoblinEnemy';
import { OrcEnemy } from '../objects/enemies/OrcEnemy';
// 他の敵タイプもインポート

export enum EnemyType {
  GOBLIN,
  ORC,
  SKELETON,
  SLIME,
  WOLF,
  // 他の敵タイプ
}

export class EnemyManager {
  private scene: BattleScene;
  private enemyUnits: EnemyUnit[] = [];
  
  constructor(scene: BattleScene) {
    this.scene = scene;
  }
  
  // 敵ユニットを作成
  createEnemy(type: EnemyType, x: number, y: number): EnemyUnit {
    let enemy: EnemyUnit;
    
    switch (type) {
      case EnemyType.GOBLIN:
        enemy = new GoblinEnemy(this.scene, x, y);
        break;
      case EnemyType.ORC:
        enemy = new OrcEnemy(this.scene, x, y);
        break;
      // 他の敵タイプの場合分け
      default:
        enemy = new GoblinEnemy(this.scene, x, y);
    }
    
    this.enemyUnits.push(enemy);
    return enemy;
  }
  
  // 全ての敵にプレイヤーをターゲットとして設定
  setPlayerAsTarget(player: Unit): void {
    this.enemyUnits.forEach(enemy => {
      enemy.setTarget(player);
    });
  }
  
  // 生きている敵の取得
  getLivingEnemies(): EnemyUnit[] {
    return this.enemyUnits.filter(enemy => enemy.health > 0);
  }
  
  // 全ての敵が倒されたか確認
  areAllEnemiesDefeated(): boolean {
    return this.getLivingEnemies().length === 0;
  }
  
  // 敵ユニットの更新
  update(delta: number): void {
    this.enemyUnits.forEach(enemy => {
      if (enemy.health > 0) {
        enemy.update(delta);
      }
    });
  }
  
  // 敵ユニットをクリア
  clear(): void {
    this.enemyUnits = [];
  }
  
  // 特定の敵タイプの生成
  createGoblin(x: number, y: number): GoblinEnemy {
    return this.createEnemy(EnemyType.GOBLIN, x, y) as GoblinEnemy;
  }
  
  createOrc(x: number, y: number): OrcEnemy {
    return this.createEnemy(EnemyType.ORC, x, y) as OrcEnemy;
  }
  
  // 戦闘結果から敵のドロップアイテムを取得
  getDroppedItems(): string[] {
    const items: string[] = [];
    
    // 倒された敵からアイテムを収集
    this.enemyUnits.forEach(enemy => {
      if (enemy.health <= 0) {
        items.push(...enemy.getDropItems());
      }
    });
    
    return items;
  }
}
```

### 4. Stage クラスとの連携

ステージシステムと敵ユニット管理を連携させます：

```typescript
// src/stages/Stage.ts の一部修正
import { EnemyManager, EnemyType } from '../managers/EnemyManager';

export abstract class Stage {
  protected scene: BattleScene;
  protected playerUnit: Unit | null = null;
  protected enemyManager: EnemyManager;
  
  constructor(scene: BattleScene) {
    this.scene = scene;
    this.enemyManager = new EnemyManager(scene);
  }
  
  // 以下のように enemyUnits の代わりに enemyManager を使用
  
  areAllEnemiesDefeated(): boolean {
    return this.enemyManager.areAllEnemiesDefeated();
  }
  
  update(delta: number): void {
    this.enemyManager.update(delta);
  }
  
  getBattleResult(): BattleResult {
    const victory = this.enemyManager.areAllEnemiesDefeated();
    
    return {
      victory,
      defeatedUnit: victory ? this.enemyManager.getLivingEnemies()[0] : this.playerUnit!,
      victorUnit: victory ? this.playerUnit! : this.enemyManager.getLivingEnemies()[0],
      exp: victory ? this.getExpReward() : 0,
      gold: victory ? this.getGoldReward() : 0,
      items: victory ? this.getItemRewards() : []
    };
  }
  
  // アイテム報酬を敵のドロップと組み合わせ
  protected getItemRewards(): string[] {
    const stageItems = ['Healing Potion']; // ステージ固有のアイテム
    const enemyDrops = this.enemyManager.getDroppedItems(); // 敵からのドロップ
    
    return [...stageItems, ...enemyDrops];
  }
}
```

具体的なステージでの敵の配置例：

```typescript
// src/stages/Stage_1_1.ts の spawnEnemies メソッド修正
protected spawnEnemies(): void {
  // EnemyManager を使って敵を生成
  const goblin = this.enemyManager.createGoblin(600, 300);
  
  // プレイヤーをターゲットに設定
  if (this.playerUnit) {
    this.enemyManager.setPlayerAsTarget(this.playerUnit);
  }
}

// src/stages/Stage_1_3.ts の spawnEnemies メソッド修正
protected spawnEnemies(): void {
  // 複数の敵を配置
  const goblinWarrior = this.enemyManager.createGoblin(500, 250);
  const orc = this.enemyManager.createOrc(650, 350);
  
  // プレイヤーをターゲットに設定
  if (this.playerUnit) {
    this.enemyManager.setPlayerAsTarget(this.playerUnit);
  }
}
```

## 実装計画

1. Unit クラスから共通機能を継承した EnemyUnit 基底クラスの作成
2. 各敵タイプごとの具体的なクラスの実装（GoblinEnemy、OrcEnemy など）
3. EnemyManager による敵ユニットの一元管理の実装
4. Stage クラスで EnemyManager を使用するよう更新
5. 敵の特殊能力やドロップアイテムの実装

## 技術的な注意点

1. **継承関係の適切な設計**:
   - Unit → EnemyUnit → 具体的な敵クラス の階層関係
   - 共通機能は上位クラスに、特有の機能は下位クラスに実装

2. **相互参照と依存関係の管理**:
   - EnemyUnit と BattleScene の相互参照に注意
   - Stage と EnemyManager の明確な責務分担

3. **拡張性の確保**:
   - 新しい敵タイプの追加が容易なインターフェース設計
   - 行動パターンの柔軟な組み合わせ

4. **パフォーマンスの考慮**:
   - 多数の敵ユニットがある場合のメモリと処理負荷の最適化
   - 不要になったオブジェクトの適切な破棄
