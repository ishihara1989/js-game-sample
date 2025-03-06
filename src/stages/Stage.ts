import Phaser from 'phaser';
import { BattleScene } from '../scenes/BattleScene';
import { Unit } from '../objects/Unit';
import { EnemyUnit } from '../objects/EnemyUnit';
import { StageConfig, EnemyConfig, StageStatus, StageResult } from '../types/StageTypes';
import { EnemyFactory, EnemyType } from '../objects/enemies';

/**
 * ステージの基底クラス
 * すべてのステージはこのクラスを継承する
 */
export class Stage {
  protected scene: BattleScene;
  protected config: StageConfig;
  protected enemyConfigs: EnemyConfig[] = [];
  protected playerUnit: Unit | null = null;
  protected enemyUnits: Unit[] = [];
  protected status: StageStatus = StageStatus.NOT_STARTED;
  protected startTime: number = 0;

  /**
   * ステージの初期化
   * @param scene バトルシーン
   * @param config ステージ設定
   */
  constructor(scene: BattleScene, config: StageConfig) {
    this.scene = scene;
    this.config = config;

    // 敵の構成はサブクラスで定義
    this.setupEnemyConfigs();
  }

  /**
   * ステージIDの取得
   */
  get id(): string {
    return this.config.id;
  }

  /**
   * ステージ名の取得
   */
  get name(): string {
    return this.config.name;
  }

  /**
   * 敵ユニットの取得
   */
  getEnemyUnits(): Unit[] {
    return this.enemyUnits;
  }

  /**
   * 敵の種類と配置を設定
   * このメソッドはサブクラスでオーバーライドする
   */
  protected setupEnemyConfigs(): void {
    // 基底クラスでは何もしない
    // サブクラスでenemyConfigsを設定する
  }

  /**
   * ステージの初期化
   * @param playerUnit プレイヤーユニット
   */
  initialize(playerUnit: Unit): void {
    this.status = StageStatus.NOT_STARTED;
    this.startTime = 0;
    this.playerUnit = playerUnit;
    this.enemyUnits = [];

    // 背景の設定
    this.setupBackground();

    // 敵ユニットの生成
    this.createEnemyUnits();
  }

  /**
   * 背景の設定
   * サブクラスでオーバーライドして背景をカスタマイズ可能
   */
  protected setupBackground(): void {
    // 基本的な背景の設定（サブクラスでオーバーライド可能）

    // デフォルトの背景
    if (!this.config.backgroundKey) {
      // 簡単な地面の表現
      const ground = this.scene.add.rectangle(
        0,
        0,
        this.scene.cameras.main.width,
        this.scene.cameras.main.height,
        0x3a5c3a
      );
      ground.setOrigin(0, 0);
      // 背景に最も低い深度を設定
      ground.setDepth(-10);

      // 格子状の線を描画して地面をわかりやすく
      const gridGraphics = this.scene.add.graphics();
      gridGraphics.lineStyle(1, 0x336633, 0.3);
      // 格子も背景の一部として低い深度を設定
      gridGraphics.setDepth(-9);

      // 横線
      for (let y = 0; y < this.scene.cameras.main.height; y += gridSize) {
        gridGraphics.moveTo(0, y);
        gridGraphics.lineTo(this.scene.cameras.main.width, y);
      }

      // 縦線
      for (let x = 0; x < this.scene.cameras.main.width; x += gridSize) {
        gridGraphics.moveTo(x, 0);
        gridGraphics.lineTo(x, this.scene.cameras.main.height);
      }

      gridGraphics.strokePath();
    } else {
      // 背景画像を指定されている場合
      const backgroundImage = this.scene.add.image(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2,
        this.config.backgroundKey
      );
      // 背景画像にも低い深度を設定
      backgroundImage.setDepth(-10);
    }
  }

  /**
   * 敵ユニットの生成
   */
  protected createEnemyUnits(): void {
    // 敵ファクトリーを使って敵ユニットを生成
    this.enemyConfigs.forEach((enemyConfig) => {
      // 位置の決定
      let x = 600; // デフォルト位置
      let y = 300;

      if (enemyConfig.position) {
        x = enemyConfig.position.x;
        y = enemyConfig.position.y;
      }

      // 敵タイプをEnemyTypeに変換
      let enemyType: EnemyType;
      switch (enemyConfig.type) {
        case 'goblin':
          enemyType = EnemyType.GOBLIN;
          break;
        case 'orc':
          enemyType = EnemyType.ORC;
          break;
        case 'slime':
          enemyType = EnemyType.SLIME;
          break;
        default:
          enemyType = EnemyType.GOBLIN; // デフォルト
      }

      // EnemyFactoryを使って敵を生成
      const enemy = EnemyFactory.createEnemy(enemyType, this.scene, x, y, enemyConfig.level || 1);

      // カスタムステータスの適用（設定されている場合）
      // この部分はEnemyUnitクラスに移動しています

      // ユニットをリストに追加
      this.enemyUnits.push(enemy);

      // バトルシーンに敵ユニットを登録
      this.scene.addEnemyUnit(enemy);
    });

    // プレイヤーとの関連付け
    if (this.playerUnit && this.enemyUnits.length > 0) {
      // 初期の敵をターゲットに設定
      this.playerUnit.setTarget(this.enemyUnits[0]);

      // 敵もプレイヤーをターゲットに設定
      this.enemyUnits.forEach((enemy) => {
        if (this.playerUnit) {
          // nullチェックを追加
          enemy.setTarget(this.playerUnit);
        }
      });
    }
  }

  /**
   * ステージの開始
   */
  start(): void {
    this.status = StageStatus.IN_PROGRESS;
    this.startTime = this.scene.time.now;

    console.log(`Stage ${this.config.id} (${this.config.name}) started!`);
  }

  /**
   * ステージの更新（毎フレーム呼ばれる）
   * @param delta 前フレームからの経過時間
   */
  update(delta: number): void {
    if (this.status !== StageStatus.IN_PROGRESS) return;

    // 敵ユニットの更新
    this.enemyUnits.forEach((unit) => {
      if (unit.health > 0) {
        unit.update(delta);
      }
    });

    // 勝敗判定
    this.checkBattleEnd();
  }

  /**
   * 戦闘終了の判定
   */
  protected checkBattleEnd(): void {
    // プレイヤーのHPが0以下になったら敗北
    if (this.playerUnit && this.playerUnit.health <= 0) {
      this.status = StageStatus.DEFEAT;
      this.onStageFailed();
      return;
    }

    // すべての敵のHPが0以下になったら勝利
    const allEnemiesDefeated = this.enemyUnits.every((unit) => unit.health <= 0);
    if (allEnemiesDefeated) {
      this.status = StageStatus.VICTORY;
      this.onStageCleared();
      return;
    }
  }

  /**
   * ステージクリア時の処理
   */
  protected onStageCleared(): void {
    console.log(`Stage ${this.config.id} cleared!`);

    // リザルトシーンに渡すデータを作成
    if (this.playerUnit && this.enemyUnits.length > 0) {
      const victorUnit = this.playerUnit;
      const defeatedUnit = this.enemyUnits[0]; // 代表として最初の敵を設定

      // 経験値と報酬計算
      let totalExp = this.config.rewards.exp;
      const totalGold = this.config.rewards.gold;
      const items = [...(this.config.rewards.items || [])];

      // EnemyUnitから報酬を取得
      this.enemyUnits.forEach((unit) => {
        if (unit instanceof EnemyUnit) {
          const rewards = unit.getRewards();
          totalExp += rewards.experience;
          if (rewards.item) {
            items.push(rewards.item);
          }
        }
      });

      const result = {
        victory: true,
        defeatedUnit,
        victorUnit,
        exp: totalExp,
        gold: totalGold,
        items,
      };

      // 少し待ってからリザルト画面へ
      this.scene.time.delayedCall(1500, () => {
        this.scene.endBattle(result);
      });
    }
  }

  /**
   * ステージ失敗時の処理
   */
  protected onStageFailed(): void {
    console.log(`Stage ${this.config.id} failed!`);

    // リザルトシーンに渡すデータを作成
    if (this.playerUnit && this.enemyUnits.length > 0) {
      // 生き残っている敵の中から勝者を選択
      const aliveEnemies = this.enemyUnits.filter((unit) => unit.health > 0);
      const victorUnit = aliveEnemies.length > 0 ? aliveEnemies[0] : this.enemyUnits[0];

      const result = {
        victory: false,
        defeatedUnit: this.playerUnit,
        victorUnit,
        exp: 0,
        gold: 0,
        items: [],
      };

      // 少し待ってからリザルト画面へ
      this.scene.time.delayedCall(1500, () => {
        this.scene.endBattle(result);
      });
    }
  }

  /**
   * ステージの結果データを取得
   */
  getResult(): StageResult {
    const timeTaken = this.startTime > 0 ? this.scene.time.now - this.startTime : 0;
    const enemiesDefeated = this.enemyUnits.filter((unit) => unit.health <= 0).length;

    return {
      stageId: this.config.id,
      status: this.status,
      battleResult: null, // BattleSceneでセットされる
      enemiesDefeated,
      totalEnemies: this.enemyUnits.length,
      timeTaken,
    };
  }

  /**
   * ステージの次の敵をターゲットとして設定
   * 現在のターゲットが倒された場合に呼び出す
   */
  setNextTarget(): void {
    if (!this.playerUnit) return;

    // 生きている敵を探す
    const nextEnemy = this.enemyUnits.find((unit) => unit.health > 0);
    if (nextEnemy) {
      this.playerUnit.setTarget(nextEnemy);
    }
  }

  /**
   * ステージの状態をクリーンアップ
   */
  cleanup(): void {
    console.log('Cleaning up stage...');
    // 敵ユニットの参照をクリア（実際のオブジェクト削除はBattleSceneで行う）
    this.enemyUnits = [];
    this.playerUnit = null;
    this.status = StageStatus.NOT_STARTED;
  }
}

// グリッドサイズの定数を追加
const gridSize = 50;
