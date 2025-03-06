# ステージシステム 実装詳細

## 現状の課題

現在のBattleSceneは以下の問題があります：

- 敵の初期化、配置、バトルの進行などの処理が全て単一クラスに集中している
- 新しいステージを追加するたびにBattleSceneを修正する必要がある
- 敵の種類やステージによる違いを表現するための柔軟性が欠けている
- 責務が明確に分離されていないため、拡張が難しい

## 実装の方針

BattleSceneからステージ関連の処理を分離し、Stage基底クラスと個別のステージクラスを実装することで、ステージごとの実装を容易にします。

### 1. ステージの基底クラス

すべてのステージに共通の機能を提供するStage基底クラスを実装します：

```typescript
// src/stages/Stage.ts
import { BattleScene } from "../scenes/BattleScene";
import { Unit } from "../objects/Unit";
import { BattleResult } from "../types/BattleTypes";

export abstract class Stage {
  protected scene: BattleScene;
  protected playerUnit: Unit | null = null;
  protected enemyUnits: Unit[] = [];
  
  constructor(scene: BattleScene) {
    this.scene = scene;
  }
  
  // 各ステージクラスで実装する抽象メソッド
  abstract initialize(playerUnit: Unit): void;
  
  // 敵ユニットをステージに配置（サブクラスでオーバーライド）
  protected spawnEnemies(): void {
    // サブクラスで実装
  }
  
  // ステージ特有の背景設定（サブクラスでオーバーライド）
  protected setupEnvironment(): void {
    // サブクラスで実装
  }
  
  // 戦闘開始時の処理
  startBattle(): void {
    if (!this.playerUnit) return;
    
    // 敵ユニットに対してプレイヤーをターゲットに設定
    this.enemyUnits.forEach(enemy => {
      enemy.setTarget(this.playerUnit);
    });
    
    // プレイヤーのターゲットを設定（初期値は最初の敵）
    if (this.enemyUnits.length > 0) {
      this.playerUnit.setTarget(this.enemyUnits[0]);
    }
  }
  
  // ステージのクリア条件確認
  checkStageClear(): boolean {
    // デフォルトではすべての敵を倒すことがクリア条件
    return this.enemyUnits.every(enemy => enemy.health <= 0);
  }
  
  // 敵の全滅確認
  areAllEnemiesDefeated(): boolean {
    return this.enemyUnits.every(enemy => enemy.health <= 0);
  }
  
  // ステージ更新処理（毎フレーム呼ばれる）
  update(delta: number): void {
    // 敵ユニットの状態更新
    this.enemyUnits.forEach(enemy => {
      if (enemy.health > 0) {
        enemy.update(delta);
      }
    });
    
    // 死亡した敵をリストから除外
    this.enemyUnits = this.enemyUnits.filter(enemy => enemy.health > 0);
  }
  
  // 戦闘結果の生成
  getBattleResult(): BattleResult {
    // プレイヤーが勝利したかどうかで結果を分岐
    const victory = this.areAllEnemiesDefeated();
    
    return {
      victory,
      defeatedUnit: victory ? this.enemyUnits[0] : this.playerUnit!, // 注: victory時は別の取り方が必要
      victorUnit: victory ? this.playerUnit! : this.enemyUnits[0],
      exp: victory ? this.getExpReward() : 0,
      gold: victory ? this.getGoldReward() : 0,
      items: victory ? this.getItemRewards() : []
    };
  }
  
  // 経験値報酬（サブクラスでオーバーライド可能）
  protected getExpReward(): number {
    return 50;
  }
  
  // ゴールド報酬（サブクラスでオーバーライド可能）
  protected getGoldReward(): number {
    return 30;
  }
  
  // アイテム報酬（サブクラスでオーバーライド可能）
  protected getItemRewards(): string[] {
    return ['Healing Potion'];
  }
  
  // プレイヤーターゲットの切り替え
  switchPlayerTarget(): void {
    if (!this.playerUnit || this.enemyUnits.length <= 1) return;
    
    // 現在のターゲットのインデックスを取得
    const currentTargetIndex = this.enemyUnits.findIndex(enemy => 
      enemy === this.playerUnit!.getTarget());
    
    // 次のターゲットのインデックスを計算（ローテーション）
    const nextTargetIndex = (currentTargetIndex + 1) % this.enemyUnits.length;
    
    // 新しいターゲットを設定
    this.playerUnit.setTarget(this.enemyUnits[nextTargetIndex]);
  }
  
  // 利用可能な敵ユニットの取得
  getEnemyUnits(): Unit[] {
    return this.enemyUnits.filter(enemy => enemy.health > 0);
  }
  
  // ステージ名の取得（サブクラスでオーバーライド）
  getStageName(): string {
    return "Unknown Stage";
  }
}
```

### 2. 具体的なステージクラスの実装

具体的なステージはStageクラスを継承して実装します。例としてStage_1_1を示します：

```typescript
// src/stages/Stage_1_1.ts
import { Stage } from './Stage';
import { Unit } from '../objects/Unit';
import { BattleScene } from '../scenes/BattleScene';

export class Stage_1_1 extends Stage {
  constructor(scene: BattleScene) {
    super(scene);
  }
  
  initialize(playerUnit: Unit): void {
    // プレイヤーユニットの参照を保存
    this.playerUnit = playerUnit;
    
    // ステージ特有の環境設定
    this.setupEnvironment();
    
    // 敵の生成と配置
    this.spawnEnemies();
  }
  
  protected setupEnvironment(): void {
    // Stage 1-1特有の背景設定
    // 例：森の背景を追加
    const forestBg = this.scene.add.image(400, 300, 'forest_bg');
    forestBg.setAlpha(0.3); // 半透明で戦闘画面の邪魔にならないように
  }
  
  protected spawnEnemies(): void {
    // ゴブリン1体を生成（初級ステージ）
    const goblin = new Unit({
      scene: this.scene,
      x: 600,
      y: 300,
      texture: 'enemy',
      name: 'Goblin',
      maxHealth: 80,
      attack: 8,
      defense: 3,
      speed: 1.5,
      isPlayer: false,
      color: 0xff5555
    });
    
    this.enemyUnits.push(goblin);
  }
  
  // 経験値報酬をオーバーライド
  protected getExpReward(): number {
    return 40; // 初級ステージなので少なめ
  }
  
  // ゴールド報酬をオーバーライド
  protected getGoldReward(): number {
    return 25; // 初級ステージなので少なめ
  }
  
  // ステージ名を返す
  getStageName(): string {
    return "ゴブリンの森 1";
  }
}
```

より難易度の高いステージの例:

```typescript
// src/stages/Stage_1_3.ts
import { Stage } from './Stage';
import { Unit } from '../objects/Unit';
import { BattleScene } from '../scenes/BattleScene';

export class Stage_1_3 extends Stage {
  constructor(scene: BattleScene) {
    super(scene);
  }
  
  initialize(playerUnit: Unit): void {
    // プレイヤーユニットの参照を保存
    this.playerUnit = playerUnit;
    
    // ステージ特有の環境設定
    this.setupEnvironment();
    
    // 敵の生成と配置
    this.spawnEnemies();
  }
  
  protected setupEnvironment(): void {
    // Stage 1-3特有の背景設定
    // 例：暗い森の奥の背景
    const darkForestBg = this.scene.add.image(400, 300, 'dark_forest_bg');
    darkForestBg.setAlpha(0.4);
    
    // 霧のエフェクト追加
    this.addFogEffect();
  }
  
  protected spawnEnemies(): void {
    // 複数の敵を配置（難易度の高いステージ）
    
    // ゴブリン戦士
    const goblinWarrior = new Unit({
      scene: this.scene,
      x: 500,
      y: 250,
      texture: 'enemy',
      name: 'Goblin Warrior',
      maxHealth: 100,
      attack: 12,
      defense: 5,
      speed: 1.3,
      isPlayer: false,
      color: 0xff3333
    });
    
    // ゴブリンアーチャー
    const goblinArcher = new Unit({
      scene: this.scene,
      x: 650,
      y: 350,
      texture: 'enemy',
      name: 'Goblin Archer',
      maxHealth: 70,
      attack: 15,
      defense: 2,
      speed: 1.8,
      isPlayer: false,
      color: 0x33ff33
    });
    
    // ゴブリンシャーマン
    const goblinShaman = new Unit({
      scene: this.scene,
      x: 580,
      y: 450,
      texture: 'enemy',
      name: 'Goblin Shaman',
      maxHealth: 60,
      attack: 18,
      defense: 1,
      speed: 1.2,
      isPlayer: false,
      color: 0x3333ff
    });
    
    // 敵ユニットをリストに追加
    this.enemyUnits.push(goblinWarrior, goblinArcher, goblinShaman);
  }
  
  // 霧のエフェクト
  private addFogEffect(): void {
    const fogGraphics = this.scene.add.graphics();
    fogGraphics.fillStyle(0xcccccc, 0.2);
    
    // ランダムな霧のパーティクルを生成
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, 800);
      const y = Phaser.Math.Between(0, 600);
      const radius = Phaser.Math.Between(30, 80);
      
      fogGraphics.fillCircle(x, y, radius);
      
      // 霧のゆっくりとした動き
      this.scene.tweens.add({
        targets: fogGraphics,
        x: Phaser.Math.Between(-100, 100),
        y: Phaser.Math.Between(-50, 50),
        duration: Phaser.Math.Between(8000, 15000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
  
  // 経験値報酬をオーバーライド（難易度が高いので多めに）
  protected getExpReward(): number {
    return 120;
  }
  
  // ゴールド報酬をオーバーライド（難易度が高いので多めに）
  protected getGoldReward(): number {
    return 80;
  }
  
  // アイテム報酬をオーバーライド（良いアイテムを追加）
  protected getItemRewards(): string[] {
    return ['Healing Potion', 'Magic Stone', 'Iron Sword'];
  }
  
  // ステージ名を返す
  getStageName(): string {
    return "ゴブリンの森 3";
  }
}
```

### 3. BattleSceneの修正

ステージシステムを利用するようにBattleSceneを修正します：

```typescript
// src/scenes/BattleScene.ts（一部抜粋）
import { Stage } from '../stages/Stage';
import { Stage_1_1 } from '../stages/Stage_1_1';
import { Stage_1_2 } from '../stages/Stage_1_2';
import { Stage_1_3 } from '../stages/Stage_1_3';
import { Unit } from '../objects/Unit';
import { BattleResult } from '../types/BattleTypes';

export class BattleScene extends Phaser.Scene {
  // 現在の変数
  private playerUnit!: Unit;
  private battleActive: boolean = false;
  private battleResult: BattleResult | null = null;
  
  // 新しい変数
  private currentStage!: Stage;
  private stageId: string = '1-1'; // デフォルト値
  
  constructor() {
    super('BattleScene');
  }
  
  init(data: any): void {
    // 前のシーンから渡されたデータを取得
    if (data && data.stageId) {
      this.stageId = data.stageId;
    }
  }
  
  create(): void {
    // デバッグテキスト（最初に作成）
    this.debugText = this.add.text(10, 10, 'Battle Starting...', { 
      font: '16px Arial', 
      color: '#ffffff' 
    });
    
    // 背景の共通部分設定
    this.createBackground();
    
    // プレイヤーユニットの作成
    this.createPlayerUnit();
    
    // ステージの初期化
    this.initializeStage();
    
    // UIの作成
    this.createUI();
    
    // バトル開始
    this.startBattle();
  }
  
  private initializeStage(): void {
    // ステージIDに基づいて適切なステージを作成
    switch(this.stageId) {
      case '1-1':
        this.currentStage = new Stage_1_1(this);
        break;
      case '1-2':
        this.currentStage = new Stage_1_2(this);
        break;
      case '1-3':
        this.currentStage = new Stage_1_3(this);
        break;
      default:
        this.currentStage = new Stage_1_1(this); // デフォルト
    }
    
    // ステージの初期化（プレイヤーユニットを渡す）
    this.currentStage.initialize(this.playerUnit);
    
    // デバッグ情報の更新
    if (this.debugText) {
      this.debugText.setText(`Stage: ${this.currentStage.getStageName()}`);
    }
  }
  
  private createPlayerUnit(): void {
    // プレイヤーユニットの作成（左側）
    this.playerUnit = new Unit({
      scene: this,
      x: 200,
      y: 300,
      texture: 'player',
      name: 'Hero',
      maxHealth: 100,
      attack: 10,
      defense: 5,
      speed: 2,
      isPlayer: true,
      color: 0x5555ff
    });
  }
  
  private startBattle(): void {
    this.battleActive = true;
    
    // ステージの戦闘開始処理を呼び出す
    this.currentStage.startBattle();
    
    if (this.debugText) {
      this.debugText.setText(`Battle Started: ${this.currentStage.getStageName()}`);
    }
  }
  
  update(time: number, delta: number): void {
    if (!this.battleActive) return;
    
    // プレイヤーユニットの更新
    this.playerUnit.update(delta);
    
    // ステージの更新
    this.currentStage.update(delta);
    
    // UIの更新
    this.updateUI();
    
    // 勝敗判定
    this.checkBattleEnd();
  }
  
  private checkBattleEnd(): void {
    // プレイヤーが倒れた場合
    if (this.playerUnit.health <= 0) {
      this.battleResult = {
        victory: false,
        defeatedUnit: this.playerUnit,
        victorUnit: this.currentStage.getEnemyUnits()[0], // 最初の敵を勝者とする
        exp: 0,
        gold: 0,
        items: []
      };
      this.endBattle();
    } 
    // ステージクリア（全ての敵を倒した）場合
    else if (this.currentStage.areAllEnemiesDefeated()) {
      this.battleResult = this.currentStage.getBattleResult();
      this.endBattle();
    }
  }
  
  private endBattle(): void {
    this.battleActive = false;
    
    // バトル結果のデバッグ表示
    if (this.battleResult && this.debugText) {
      this.debugText.setText(`Battle Ended: ${this.battleResult.victory ? 'Victory!' : 'Defeat...'}`); 
    }
    
    // 少し待ってからリザルト画面へ
    this.time.delayedCall(1500, () => {
      this.scene.start('ResultScene', { result: this.battleResult });
    });
  }
  
  // 攻撃エフェクトを表示するメソッド（Unitクラスから呼び出される）
  showAttackEffect(attacker: Unit, target: Unit): void {
    // 現状のエフェクト処理をそのまま維持
  }
  
  // スキルエフェクトを表示するメソッド（Unitクラスから呼び出される）
  showSkillEffect(caster: Unit, target: Unit): void {
    // 現状のエフェクト処理をそのまま維持
  }
}
```

### 4. ステージ選択インターフェース

ステージ関連の型定義を追加します：

```typescript
// src/types/StageTypes.ts
export interface StageInfo {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  unlocked: boolean;
  enemyCount: number;
  difficulty: 'easy' | 'normal' | 'hard';
  rewards: {
    expMin: number;
    expMax: number;
    goldMin: number;
    goldMax: number;
    possibleItems: string[];
  };
}

export interface StageProgress {
  stageId: string;
  completed: boolean;
  bestTime?: number; // ミリ秒単位
  clearCount: number;
}
```

## 実装計画

1. 基本となるStageクラスの実装
2. Stage_1_1、Stage_1_2、Stage_1_3の実装
3. BattleSceneのステージシステム対応
4. MenuSceneのステージ選択機能の実装
5. 戦闘結果とステージの進行状況の連携

## 技術的な注意点

1. **責務の分離**:
   - BattleSceneは戦闘の進行と全体の制御に専念
   - Stageクラスはステージ固有の設定と敵の配置を担当
   - Unitクラスは個々のユニットの行動を制御

2. **拡張性の確保**:
   - 新しいステージタイプの追加を容易にするインターフェース設計
   - 様々な戦闘条件や目標を実装できる柔軟性

3. **コードの再利用**:
   - 共通機能をStage基底クラスに集約
   - ステージ固有の実装はサブクラスでオーバーライド

4. **パフォーマンスの考慮**:
   - 大量の敵が存在する場合のパフォーマンス最適化
   - 不要なオブジェクトの適切な破棄
