import { Stage } from './Stage';
import { BattleScene } from '../scenes/BattleScene';
import { StageConfig, StageStatus } from '../types/StageTypes';
import { Unit } from '../objects/Unit';

/**
 * ステージ1-3: ゴブリンの森 3
 */
export class Stage_1_3 extends Stage {
  private bossMode: boolean = false;
  private bossSpawned: boolean = false;
  private bossUnit: Unit | null = null;

  constructor(scene: BattleScene) {
    const config: StageConfig = {
      id: '1-3',
      name: 'ゴブリンの森 3',
      description: 'ゴブリンの森の最深部。ゴブリンの頭目が現れることがあります。',
      difficulty: 3,
      recommendedLevel: 5,
      rewards: {
        exp: 120,
        gold: 80,
        items: ['potion_medium', 'armor_goblin'],
      },
    };

    super(scene, config);
  }

  /**
   * 敵の配置設定
   */
  protected setupEnemyConfigs(): void {
    // 通常の敵構成
    this.enemyConfigs = [
      {
        type: 'goblin',
        level: 3,
        position: { x: 500, y: 200 },
      },
      {
        type: 'goblin',
        level: 3,
        position: { x: 650, y: 300 },
      },
      {
        type: 'goblin',
        level: 2,
        position: { x: 550, y: 400 },
      },
    ];

    // 確率でボスモードにする（実際のゲームでは条件を設定）
    this.bossMode = Math.random() < 0.3; // 30%の確率
  }

  /**
   * 背景の設定をオーバーライド
   */
  protected setupBackground(): void {
    // 基本的な背景
    super.setupBackground();

    // 森の深部を表現
    // 木々を多く配置
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);

      // 大きい木と小さい木をランダムに
      const size = Phaser.Math.Between(1, 2);
      if (size === 1) {
        // 小さい木
        const treeBase = this.scene.add.rectangle(x, y, 8, 30, 0x663300);
        const treeTop = this.scene.add.circle(x, y - 25, 25, 0x004400, 0.8);
      } else {
        // 大きい木
        const treeBase = this.scene.add.rectangle(x, y, 15, 50, 0x552200);
        const treeTop = this.scene.add.circle(x, y - 40, 45, 0x003300, 0.8);
      }
    }

    // 濃い霧のエフェクト
    const fogGraphics = this.scene.add.graphics();
    fogGraphics.fillStyle(0xffffff, 0.15);

    for (let i = 0; i < 12; i++) {
      const x = Phaser.Math.Between(0, 800);
      const y = Phaser.Math.Between(0, 600);
      const radius = Phaser.Math.Between(80, 200);

      fogGraphics.fillCircle(x, y, radius);
    }

    // ボスモードでは特別な演出を追加
    if (this.bossMode) {
      // 不気味な赤い光
      const redLight = this.scene.add.graphics();
      redLight.fillStyle(0xff0000, 0.1);
      redLight.fillCircle(400, 300, 300);

      // 不気味な効果音（将来的に実装）
    }
  }

  /**
   * 敵ユニットの作成をオーバーライド
   */
  protected createEnemyUnits(): void {
    // 通常の敵を作成
    super.createEnemyUnits();

    // ボスモードの場合、最初の敵が全滅したらボスを出現させる
    if (this.bossMode) {
      // ボスのターン出現は update() で監視する
      console.log('Boss mode activated for stage 1-3!');
    }
  }

  /**
   * ボスユニットの作成
   */
  private spawnBossUnit(): void {
    if (!this.scene || this.bossSpawned) return;

    // 画面中央付近に出現させる演出
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    // 出現エフェクト
    const spawnEffect = this.scene.add.circle(centerX, centerY, 10, 0xff0000, 1);
    this.scene.tweens.add({
      targets: spawnEffect,
      scale: 15,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        spawnEffect.destroy();

        // ボスユニット作成
        this.bossUnit = new Unit({
          scene: this.scene,
          x: centerX + 100,
          y: centerY,
          texture: 'enemy',
          name: 'Goblin Chief',
          maxHealth: 200,
          attack: 15,
          defense: 8,
          speed: 1.2,
          isPlayer: false,
          color: 0xaa0000, // 赤みがかった色
        });

        // プレイヤーとボスの関連付け
        if (this.playerUnit && this.bossUnit) {
          this.playerUnit.setTarget(this.bossUnit);
          this.bossUnit.setTarget(this.playerUnit);
        }

        // 敵リストに追加
        this.enemyUnits.push(this.bossUnit);

        // ボスの台詞（将来的にはテキストボックスで）
        const bossText = this.scene.add.text(
          centerX,
          centerY - 100,
          '私の森に入ったことを後悔するがいい！',
          {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4,
          }
        );
        bossText.setOrigin(0.5);

        // 台詞を一定時間後に消す
        this.scene.time.delayedCall(2000, () => {
          this.scene.tweens.add({
            targets: bossText,
            alpha: 0,
            duration: 500,
            onComplete: () => bossText.destroy(),
          });
        });
      },
    });

    this.bossSpawned = true;
  }

  /**
   * ステージの更新
   */
  update(delta: number): void {
    super.update(delta);

    // ボスモードで、まだボスが出現しておらず、通常の敵が全滅している場合
    if (this.bossMode && !this.bossSpawned && this.status === StageStatus.IN_PROGRESS) {
      const initialEnemiesDefeated = this.enemyUnits.every((unit) => unit.health <= 0);

      if (initialEnemiesDefeated) {
        // ボスユニットを出現させる
        console.log('Spawning boss!');
        this.spawnBossUnit();
      }
    }
  }

  /**
   * ステージクリア時の処理をカスタマイズ
   */
  protected onStageCleared(): void {
    // ボスを倒した場合は報酬を増やす
    if (this.bossMode && this.bossSpawned) {
      this.config.rewards.exp = 200;
      this.config.rewards.gold = 150;
      this.config.rewards.items?.push('weapon_goblin_chief');

      console.log('Boss defeated! Increased rewards!');
    }

    // 通常のクリア処理
    super.onStageCleared();

    // 特別な演出（ボスを倒した場合）
    if (this.bossMode && this.bossSpawned) {
      const centerX = this.scene.cameras.main.width / 2;
      const centerY = this.scene.cameras.main.height / 2;

      // 大きな勝利エフェクト
      for (let i = 0; i < 5; i++) {
        const delay = i * 200;
        const radius = 10 + i * 5;

        this.scene.time.delayedCall(delay, () => {
          const victoryEffect = this.scene.add.circle(centerX, centerY, radius, 0xffff00, 1);
          this.scene.tweens.add({
            targets: victoryEffect,
            scale: 10,
            alpha: 0,
            duration: 800,
            onComplete: () => {
              victoryEffect.destroy();
            },
          });
        });
      }
    }
  }
}
