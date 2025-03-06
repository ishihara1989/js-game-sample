import Phaser from 'phaser';
import { BattleScene } from '../scenes/BattleScene';
import { Skill } from '../skills/Skill';
import { UnitRenderer } from '../renderers/UnitRenderer';

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
  level?: number; // レベルを追加（省略可能）
}

/**
 * レベルに応じたスキル解放定義
 */
export interface SkillUnlock {
  level: number;      // スキル解放レベル
  skillFactory: () => Skill; // スキル生成関数
  message?: string;   // 解放時のメッセージ（省略可）
}

export class Unit extends Phaser.GameObjects.Container {
  // 基本プロパティ
  readonly isPlayer: boolean;
  readonly name: string;
  readonly maxHealth: number;
  readonly attackPower: number;
  readonly defense: number;
  readonly speed: number;

  // 状態プロパティ
  health: number;
  skillCooldown: number = 0;
  readonly skillMaxCooldown: number = 100;
  protected attackCooldown: number = 0;
  readonly attackCooldownMax: number = 1500; // ミリ秒
  protected moveCooldown: number = 0;
  readonly moveCooldownMax: number = 500; // ミリ秒

  // レベルと経験値関連
  protected level: number = 1;
  protected experience: number = 0;
  protected requiredExperience: number = 100; // レベル2になるための必要経験値
  protected skillUnlocks: SkillUnlock[] = [];

  // 戦闘報酬関連
  protected expValue: number = 0; // 倒した時に得られる経験値

  // 参照
  protected target: Unit | null = null;
  public battleScene: BattleScene;

  // 移動関連
  protected movementTarget: Phaser.Math.Vector2 | null = null;
  protected wanderTimer: number = 0;
  protected readonly wanderInterval: number = 3000; // 3秒ごとにランダム移動

  // スキル関連
  protected skills: Skill[] = []; // スキル配列
  protected activeSkillIndex: number = 0; // 現在選択中のスキルインデックス

  // 描画コンポーネント
  protected renderer: UnitRenderer;

  constructor(config: UnitConfig) {
    super(config.scene, config.x, config.y);

    // プロパティの設定
    this.isPlayer = config.isPlayer;
    this.name = config.name;
    this.maxHealth = config.maxHealth;
    this.health = config.maxHealth;
    this.attackPower = config.attack;
    this.defense = config.defense;
    this.speed = config.speed;
    this.battleScene = config.scene as BattleScene;
    
    // レベルの設定（指定があれば使用）
    if (config.level) {
      this.level = config.level;
    }

    // コンテナ自体に深度を設定
    this.setDepth(5);

    // シーンに追加
    this.scene.add.existing(this);

    // レンダラーの作成（描画を担当するコンポーネント）
    this.renderer = new UnitRenderer(this, this.scene, config.color);

    console.warn(`Created unit ${this.name} at ${this.x},${this.y}. isPlayer: ${this.isPlayer}`);
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

    // レンダラーの更新
    this.renderer.update(delta);
    
    // レンダラーの描画
    this.renderer.render();
  }

  protected updateCooldowns(delta: number): void {
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

    // 各スキルのクールダウン更新
    this.skills.forEach((skill) => skill.update(delta));
  }

  protected updateMovement(_delta: number): void {
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
    } else if (this.target) {
      // ターゲットがnullでないことを確認
      // ターゲットの方向を向く（レンダラーが方向を描画）
    }
  }

  protected updateAI(_delta: number): void {
    // プレイヤーユニットは手動制御を想定（現在はAIで自動行動）
    if (!this.target) return; // ターゲットがない場合は処理しない

    // 攻撃可能距離かどうかを判定
    const distanceToTarget = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.target.x,
      this.target.y
    );

    // 利用可能なスキルがあるか確認
    const availableSkill = this.getReadySkill();

    if (availableSkill) {
      // スキルの射程範囲内かどうか確認
      if (distanceToTarget <= availableSkill.range) {
        // スキルを使用
        this.useSkillOnTarget(this.target);
      } else {
        // 射程外ならターゲットに接近
        if (!this.movementTarget && this.moveCooldown <= 0) {
          this.moveToRandomPositionNearTarget();
        }
      }
    } else {
      // スキルが使えない場合、攻撃距離内なら通常攻撃
      const attackRange = 150; // 通常攻撃の射程
      if (distanceToTarget < attackRange) {
        if (this.attackCooldown <= 0) {
          this.performAttack(this.target);
        }
      } else {
        // 攻撃範囲外ならターゲットに接近
        if (!this.movementTarget && this.moveCooldown <= 0) {
          this.moveToRandomPositionNearTarget();
        }
      }
    }

    // ランダム移動のタイマー更新
    this.wanderTimer += _delta;
    if (this.wanderTimer >= this.wanderInterval) {
      this.wanderTimer = 0;
      if (!this.movementTarget && this.moveCooldown <= 0) {
        this.moveToRandomPositionNearTarget();
      }
    }
  }

  protected moveToRandomPositionNearTarget(): void {
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

  // 通常攻撃
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

    console.warn(`${this.name} attacks ${target.name} for ${damage} damage!`);
  }

  // スキル関連メソッド

  /**
   * スキルを追加
   * @param skill 追加するスキル
   */
  addSkill(skill: Skill): void {
    skill.setOwner(this);
    this.skills.push(skill);
    console.warn(`${this.name} learned skill: ${skill.name}`);
  }

  /**
   * スキルを取得
   * @param skillId スキルID
   * @returns 見つかったスキル、または undefined
   */
  getSkill(skillId: string): Skill | undefined {
    return this.skills.find((skill) => skill.id === skillId);
  }

  /**
   * 使用可能なスキルを取得
   * @returns 使用可能なスキル、またはnull
   */
  getReadySkill(): Skill | null {
    // 現在のアクティブスキルを最初にチェック
    if (this.skills.length > 0 && this.activeSkillIndex < this.skills.length) {
      const activeSkill = this.skills[this.activeSkillIndex];
      if (activeSkill.isReady()) {
        return activeSkill;
      }
    }

    // 使用可能な他のスキルをチェック
    for (const skill of this.skills) {
      if (skill.isReady()) {
        return skill;
      }
    }

    return null;
  }

  /**
   * ターゲットにスキルを使用
   * @param target 対象ユニット
   * @returns 成功したらtrue
   */
  useSkillOnTarget(target: Unit): boolean {
    const readySkill = this.getReadySkill();
    if (!readySkill) return false;

    const success = readySkill.use(target);
    if (success) {
      // 攻撃クールダウンも一緒に設定（スキル使用後は一時的に行動不能に）
      this.attackCooldown = this.attackCooldownMax / 2;
    }

    return success;
  }

  // 古いスキル使用メソッド（後方互換性のため残す）
  useSkill(): void {
    if (!this.target) return;

    // 新しいスキルシステムを使用
    const success = this.useSkillOnTarget(this.target);

    // 新しいスキルシステムが失敗した場合は古い処理を行う
    if (!success && this.skillCooldown >= this.skillMaxCooldown) {
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

      console.warn(`${this.name} uses skill on ${this.target.name} for ${damage} damage!`);
    }
  }

  // ダメージを受ける
  takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health < 0) this.health = 0;

    // レンダラーにダメージエフェクト表示を依頼
    this.renderer.showDamageText(amount);
    this.renderer.flashUnit();
  }

  // ターゲットを設定
  setTarget(unit: Unit): void {
    this.target = unit;
  }

  // 経験値の取得
  getExpValue(): number {
    return this.expValue;
  }

  /**
   * 現在のレベルを取得
   * @returns 現在のレベル
   */
  getLevel(): number {
    return this.level;
  }

  /**
   * 経験値を加算し、必要に応じてレベルアップを処理
   * @param exp 獲得した経験値
   * @returns レベルアップしたかどうか
   */
  addExperience(exp: number): boolean {
    // 経験値を加算
    this.experience += exp;

    // 経験値獲得メッセージ
    console.warn(`${this.name} gained ${exp} experience points.`);
    
    // レンダラーに経験値獲得テキストの表示を依頼
    this.renderer.showExpText(exp);

    // レベルアップのチェック
    if (this.experience >= this.requiredExperience) {
      this.levelUp();
      return true;
    }

    return false;
  }

  /**
   * レベルアップ処理
   */
  private levelUp(): void {
    // レベルを上げる
    this.level++;
    
    // 余った経験値を次のレベルに持ち越し
    this.experience -= this.requiredExperience;
    
    // 次のレベルに必要な経験値を更新（レベルが上がるごとに必要経験値が増加）
    this.requiredExperience = Math.floor(this.requiredExperience * 1.5);
    
    // レンダラーにレベルアップエフェクト表示を依頼
    this.renderer.showLevelUpEffect();
    
    console.warn(`${this.name} leveled up to ${this.level}!`);
    
    // レベルアップによるスキル解放チェック
    this.checkSkillUnlocks();
  }

  /**
   * レベルアップによるスキル解放をチェック
   */
  private checkSkillUnlocks(): void {
    // 現在のレベルで解放されるスキルを検索
    const newSkills = this.skillUnlocks.filter(unlock => unlock.level === this.level);
    
    if (newSkills.length > 0) {
      // スキル解放の処理
      newSkills.forEach(unlockInfo => {
        // スキルを生成して追加
        const newSkill = unlockInfo.skillFactory();
        this.addSkill(newSkill);
        
        // レンダラーにスキル解放メッセージの表示を依頼
        if (unlockInfo.message) {
          this.renderer.showSkillUnlockMessage(newSkill.name, unlockInfo.message);
        } else {
          this.renderer.showSkillUnlockMessage(newSkill.name);
        }
      });
    }
  }

  /**
   * レベルアップによって解放されるスキルを設定
   * @param skillUnlocks スキル解放定義の配列
   */
  setSkillUnlocks(skillUnlocks: SkillUnlock[]): void {
    this.skillUnlocks = skillUnlocks;
    
    // 既に到達しているレベルのスキルを解放（初期化時など）
    const availableSkills = skillUnlocks.filter(unlock => unlock.level <= this.level);
    
    if (availableSkills.length > 0) {
      availableSkills.forEach(unlockInfo => {
        const skill = unlockInfo.skillFactory();
        this.addSkill(skill);
      });
    }
  }

  // ユニットのクリーンアップ
  cleanup(): void {
    // レンダラーのクリーンアップ
    this.renderer.destroy();

    // コンテナを削除
    this.destroy();
  }
}
