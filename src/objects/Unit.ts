import Phaser from 'phaser';
import { BattleScene } from '../scenes/BattleScene';

interface UnitConfig {
  scene: BattleScene;
  x: number;
  y: number;
  texture: string;
  name: string;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  isPlayer: boolean;
  color: number;
}

export class Unit extends Phaser.GameObjects.Container {
  // 基本プロパティ
  readonly isPlayer: boolean;
  readonly name: string;
  readonly maxHealth: number;
  readonly attackPower: number; // attackからattackPowerに変更
  readonly defense: number;
  readonly speed: number;

  // 状態プロパティ
  health: number;
  skillCooldown: number = 0;
  readonly skillMaxCooldown: number = 100;
  protected attackCooldown: number = 0; // privateからprotectedに変更
  readonly attackCooldownMax: number = 1500; // ミリ秒
  protected moveCooldown: number = 0; // privateからprotectedに変更
  readonly moveCooldownMax: number = 500; // ミリ秒

  // 戦闘報酬関連
  protected expValue: number = 0; // 倒した時に得られる経験値

  // 参照
  protected target: Unit | null = null; // privateからprotectedに変更
  protected battleScene: BattleScene; // privateからprotectedに変更

  // 見た目関連
  protected unitCircle: Phaser.GameObjects.Graphics; // privateからprotectedに変更
  protected directionIndicator: Phaser.GameObjects.Graphics; // privateからprotectedに変更
  hpText?: Phaser.GameObjects.Text;
  nameText: Phaser.GameObjects.Text;

  // 移動関連
  protected movementTarget: Phaser.Math.Vector2 | null = null; // privateからprotectedに変更
  protected wanderTimer: number = 0; // privateからprotectedに変更
  protected readonly wanderInterval: number = 3000; // 3秒ごとにランダム移動 // privateからprotectedに変更

  constructor(config: UnitConfig) {
    super(config.scene, config.x, config.y);

    // プロパティの設定
    this.isPlayer = config.isPlayer;
    this.name = config.name;
    this.maxHealth = config.maxHealth;
    this.health = config.maxHealth;
    this.attackPower = config.attack; // attackからattackPowerに変更
    this.defense = config.defense;
    this.speed = config.speed;
    this.battleScene = config.scene as BattleScene;

    // コンテナ自体に深度を設定
    this.setDepth(5);

    // グラフィックの作成
    this.unitCircle = this.scene.add.graphics();
    this.unitCircle.fillStyle(config.color, 1);
    this.unitCircle.fillCircle(0, 0, 20);
    this.unitCircle.lineStyle(2, 0xffffff, 0.8);
    this.unitCircle.strokeCircle(0, 0, 20);

    // 向きを示す三角形
    this.directionIndicator = this.scene.add.graphics();
    this.directionIndicator.fillStyle(0xffffff, 1);
    this.directionIndicator.fillTriangle(0, -30, -10, -15, 10, -15);

    // シーンに直接名前を表示（コンテナ外）
    this.nameText = this.scene.add.text(this.x, this.y - 60, this.name, {
      font: '14px Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.nameText.setOrigin(0.5);
    // 名前テキストに高い深度を設定
    this.nameText.setDepth(10);

    // コンテナには円とインディケーターだけ追加
    this.add([this.unitCircle, this.directionIndicator]);

    // シーンに追加
    this.scene.add.existing(this);

    // 名前が見えることを確認
    console.log(`Created unit ${this.name} at ${this.x},${this.y}. isPlayer: ${this.isPlayer}`);
  }

  update(delta: number): void {
    // ターゲットがいない場合は更新しない
    if (!this.target) return;

    // クールダウンの更新
    this.updateCooldowns(delta);

    // 移動処理
    this.updateMovement(delta);

    // AI行動
    this.updateAI(delta);

    // 名前テキストの位置更新
    this.nameText.setPosition(this.x, this.y - 60);
  }

  protected updateCooldowns(delta: number): void {
    // privateからprotectedに変更
    // 攻撃クールダウン
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }

    // 移動クールダウン
    if (this.moveCooldown > 0) {
      this.moveCooldown -= delta;
    }

    // スキルクールダウン（徐々に溜まる）
    if (this.skillCooldown < this.skillMaxCooldown) {
      this.skillCooldown += delta * 0.02; // スキルチャージ速度
      if (this.skillCooldown > this.skillMaxCooldown) {
        this.skillCooldown = this.skillMaxCooldown;
      }
    }
  }

  protected updateMovement(delta: number): void {
    // privateからprotectedに変更
    // 移動クールダウン中は移動しない
    if (this.moveCooldown > 0) return;

    // 移動目標があれば移動
    if (this.movementTarget) {
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        this.movementTarget.x,
        this.movementTarget.y
      );

      // 目標に到達したら移動終了
      if (distance < 5) {
        this.movementTarget = null;
        return;
      }

      // 移動方向を計算
      const angle = Phaser.Math.Angle.Between(
        this.x,
        this.y,
        this.movementTarget.x,
        this.movementTarget.y
      );

      // 移動速度に基づいて位置を更新
      this.x += Math.cos(angle) * this.speed;
      this.y += Math.sin(angle) * this.speed;

      // 向きを更新
      this.updateDirection(angle);
    } else if (this.target) {
      // ターゲットがnullでないことを確認
      // ターゲットの方向を向く
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
      this.updateDirection(angle);
    }
  }

  protected updateDirection(angle: number): void {
    // privateからprotectedに変更
    // 方向インディケーターがない場合は何もしない
    if (!this.directionIndicator) return;

    // 方向インディケーターの回転
    this.directionIndicator.clear();
    this.directionIndicator.fillStyle(0xffffff, 1);

    // 回転した三角形を描画
    const x1 = Math.cos(angle) * 30;
    const y1 = Math.sin(angle) * 30;
    const x2 = Math.cos(angle + Math.PI * 0.8) * 15;
    const y2 = Math.sin(angle + Math.PI * 0.8) * 15;
    const x3 = Math.cos(angle - Math.PI * 0.8) * 15;
    const y3 = Math.sin(angle - Math.PI * 0.8) * 15;

    this.directionIndicator.fillTriangle(x1, y1, x2, y2, x3, y3);
  }

  // privateメソッドをprotectedに変更し、サブクラスでオーバーライドできるようにする
  protected updateAI(delta: number): void {
    // プレイヤーユニットは手動制御を想定（現在はAIで自動行動）
    if (!this.target) return; // ターゲットがない場合は処理しない

    // 攻撃可能距離かどうかを判定
    const distanceToTarget = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.target.x,
      this.target.y
    );

    // 攻撃範囲（近接攻撃なら100程度、遠距離なら300程度）
    const attackRange = 150;

    if (distanceToTarget < attackRange) {
      // 攻撃範囲内ならクールダウン次第で攻撃
      if (this.attackCooldown <= 0) {
        // スキルが溜まっていればスキル使用、そうでなければ通常攻撃
        if (this.skillCooldown >= this.skillMaxCooldown) {
          this.useSkill();
        } else {
          this.performAttack(this.target);
        }
      }
    } else {
      // 攻撃範囲外ならターゲットに接近
      if (!this.movementTarget && this.moveCooldown <= 0) {
        // ランダムな位置に移動（ターゲットの近く）
        this.moveToRandomPositionNearTarget();
      }
    }

    // ランダム移動のタイマー更新
    this.wanderTimer += delta;
    if (this.wanderTimer >= this.wanderInterval) {
      this.wanderTimer = 0;
      if (!this.movementTarget && this.moveCooldown <= 0) {
        this.moveToRandomPositionNearTarget();
      }
    }
  }

  protected moveToRandomPositionNearTarget(): void {
    // privateからprotectedに変更
    if (!this.target) return;

    // ターゲット周辺のランダムな位置
    const distance = Phaser.Math.Between(100, 200);
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

    const targetX = this.target.x + Math.cos(angle) * distance;
    const targetY = this.target.y + Math.sin(angle) * distance;

    // 画面内に収まるように調整
    const bounds = 50;
    const clampedX = Phaser.Math.Clamp(targetX, bounds, 800 - bounds);
    const clampedY = Phaser.Math.Clamp(targetY, bounds, 600 - bounds);

    // 移動目標を設定
    this.movementTarget = new Phaser.Math.Vector2(clampedX, clampedY);
    this.moveCooldown = this.moveCooldownMax;
  }

  // 通常攻撃（attackからperformAttackに変更）
  performAttack(target: Unit): void {
    if (!target) return; // ターゲットがない場合は何もしない

    // 攻撃クールダウンを設定
    this.attackCooldown = this.attackCooldownMax;

    // ダメージ計算
    const damage = Math.max(1, this.attackPower - target.defense / 2);

    // ターゲットにダメージを与える
    target.takeDamage(damage);

    // 攻撃エフェクトを表示
    if (this.battleScene) {
      this.battleScene.showAttackEffect(this, target);
    }

    console.log(`${this.name} attacks ${target.name} for ${damage} damage!`);
  }

  // スキル使用
  useSkill(): void {
    if (!this.target) return;
    if (this.skillCooldown < this.skillMaxCooldown) return;

    // スキルクールダウンをリセット
    this.skillCooldown = 0;
    this.attackCooldown = this.attackCooldownMax;

    // スキルダメージ計算（通常攻撃の2倍）
    const damage = Math.max(2, this.attackPower * 2 - this.target.defense);

    // ターゲットにダメージを与える
    this.target.takeDamage(damage);

    // スキルエフェクトを表示
    if (this.battleScene) {
      this.battleScene.showSkillEffect(this, this.target);
    }

    console.log(`${this.name} uses skill on ${this.target.name} for ${damage} damage!`);
  }

  // ダメージを受ける
  takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health < 0) this.health = 0;

    // ダメージテキスト表示
    this.showDamageText(amount);

    // ダメージを受けたときの視覚効果
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      yoyo: true,
      duration: 100,
      repeat: 1,
    });
  }

  // ダメージテキストを表示
  private showDamageText(amount: number): void {
    const damageText = this.scene.add.text(this.x, this.y - 20, `-${Math.floor(amount)}`, {
      font: 'bold 16px Arial',
      color: '#ff0000',
    });
    damageText.setOrigin(0.5);
    // ダメージテキストに高い深度を設定
    damageText.setDepth(15);

    // テキストを上に浮かせながらフェードアウト
    this.scene.tweens.add({
      targets: damageText,
      y: damageText.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        damageText.destroy();
      },
    });
  }

  // ターゲットを設定
  setTarget(unit: Unit): void {
    this.target = unit;
  }

  // 経験値の取得
  getExpValue(): number {
    return this.expValue;
  }

  // ユニットのクリーンアップ
  cleanup(): void {
    // 名前テキストを削除
    if (this.nameText) {
      this.nameText.destroy();
    }

    // HPテキストを削除
    if (this.hpText) {
      this.hpText.destroy();
    }

    // コンテナを削除
    this.destroy();
  }
}
