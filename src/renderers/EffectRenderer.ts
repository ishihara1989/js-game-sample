import Phaser from 'phaser';
import { Unit } from '../objects/Unit';
import { Renderer } from './Renderer';

/**
 * エフェクト描画クラス
 * バトルシーンのエフェクト表示を担当する
 */
export class EffectRenderer implements Renderer {
  private scene: Phaser.Scene;

  // エフェクト管理用のグラフィックスオブジェクト
  private effectGraphics: Phaser.GameObjects.Graphics;

  // パーティクルエミッタ（未使用の場合はnull）
  private particleEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  /**
   * コンストラクタ
   * @param scene 描画先のシーン
   */
  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // エフェクト描画用のグラフィックスを作成
    this.effectGraphics = this.scene.add.graphics();
    this.effectGraphics.setDepth(20);
  }

  /**
   * 初期化処理
   */
  initialize(): void {
    // 初期化時に特に何もしない
  }

  /**
   * 更新処理
   * @param delta 前フレームからの経過時間
   */
  update(delta: number): void {
    // 継続的なエフェクトの更新があれば実装
  }

  /**
   * 描画処理
   */
  render(): void {
    // 定期的に描画する必要のあるエフェクトがあれば実装
  }

  /**
   * クリーンアップ
   */
  destroy(): void {
    // グラフィックスの削除
    this.effectGraphics.destroy();

    // パーティクルエミッタの削除
    if (this.particleEmitter) {
      this.particleEmitter.stop();
      this.particleEmitter = null;
    }
  }

  /**
   * 攻撃エフェクトの表示
   * @param attacker 攻撃者
   * @param target 攻撃対象
   */
  showAttackEffect(attacker: Unit, target: Unit): void {
    const midX = (attacker.x + target.x) / 2;
    const midY = (attacker.y + target.y) / 2;

    // シンプルなエフェクト
    const attackEffect = this.scene.add.circle(
      midX,
      midY,
      15,
      attacker.isPlayer ? 0x6666ff : 0xff6666
    );
    attackEffect.setDepth(20);

    // エフェクトのアニメーション
    this.scene.tweens.add({
      targets: attackEffect,
      scale: { from: 0.5, to: 1.5 },
      alpha: { from: 1, to: 0 },
      duration: 300,
      onComplete: () => {
        attackEffect.destroy();
      },
    });
  }

  /**
   * スキルエフェクトの表示
   * @param caster スキル使用者
   * @param target スキル対象
   */
  showSkillEffect(caster: Unit, target: Unit): void {
    // スキルエフェクトの始点
    const startX = caster.x;
    const startY = caster.y;

    // スキルエフェクトの色（プレイヤーは青系、敵は赤系）
    const color = caster.isPlayer ? 0x00aaff : 0xff5500;

    // プレイヤーと敵で異なるスキルエフェクト
    if (caster.isPlayer) {
      // プレイヤースキル: 魔法の弾
      this.showPlayerSkillEffect(startX, startY, target.x, target.y, color);
    } else {
      // 敵スキル: 渦巻き状のエフェクト
      this.showEnemySkillEffect(target.x, target.y, color);
    }
  }

  /**
   * プレイヤーのスキルエフェクト表示
   * @param startX 開始位置X
   * @param startY 開始位置Y
   * @param targetX 対象位置X
   * @param targetY 対象位置Y
   * @param color エフェクト色
   */
  private showPlayerSkillEffect(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    color: number
  ): void {
    // 魔法の弾
    const projectile = this.scene.add.circle(startX, startY, 10, color);
    projectile.setDepth(20);

    this.scene.tweens.add({
      targets: projectile,
      x: targetX,
      y: targetY,
      duration: 500,
      onComplete: () => {
        // 着弾時の爆発エフェクト
        const explosion = this.scene.add.circle(targetX, targetY, 5, color);
        explosion.setDepth(20);

        this.scene.tweens.add({
          targets: explosion,
          scale: { from: 1, to: 3 },
          alpha: { from: 1, to: 0 },
          duration: 300,
          onComplete: () => {
            explosion.destroy();
            projectile.destroy();
          },
        });
      },
    });
  }

  /**
   * 敵のスキルエフェクト表示
   * @param targetX 対象位置X
   * @param targetY 対象位置Y
   * @param color エフェクト色
   */
  private showEnemySkillEffect(targetX: number, targetY: number, color: number): void {
    // 渦巻き状のエフェクト
    const swirl = this.scene.add.graphics();
    swirl.setDepth(20);
    swirl.fillStyle(color, 0.7);

    let angle = 0;
    let scale = 0;
    let alpha = 1;

    // 渦巻きエフェクトのアニメーション
    const animateSwirlEffect = () => {
      swirl.clear();
      if (alpha <= 0) {
        swirl.destroy();
        return;
      }

      for (let i = 0; i < 4; i++) {
        const currentAngle = angle + (Math.PI / 2) * i;
        const x = targetX + Math.cos(currentAngle) * 30 * scale;
        const y = targetY + Math.sin(currentAngle) * 30 * scale;
        swirl.fillCircle(x, y, 10 * scale);
      }

      angle += 0.1;
      scale += 0.04;
      alpha -= 0.02;

      swirl.setAlpha(alpha);

      if (alpha > 0) {
        this.scene.time.delayedCall(20, animateSwirlEffect);
      }
    };

    animateSwirlEffect();
  }

  /**
   * 範囲攻撃エフェクトの表示
   * @param caster スキル使用者
   * @param targets 対象ユニット配列
   * @param radius 範囲半径
   */
  showAreaSkillEffect(caster: Unit, targets: Unit[], radius: number): void {
    // 範囲の中心を計算（ターゲットの平均位置）
    let centerX = 0;
    let centerY = 0;

    targets.forEach((target) => {
      centerX += target.x;
      centerY += target.y;
    });

    if (targets.length > 0) {
      centerX /= targets.length;
      centerY /= targets.length;
    } else {
      // ターゲットがない場合はキャスターの近くに
      centerX = caster.x + (Math.random() * 100 - 50);
      centerY = caster.y + (Math.random() * 100 - 50);
    }

    // 範囲エフェクトの色
    const color = caster.isPlayer ? 0x00ffaa : 0xff5500;

    // 範囲円の表示
    const areaCircle = this.scene.add.circle(centerX, centerY, radius, color, 0.3);
    areaCircle.setStrokeStyle(2, color, 1);
    areaCircle.setDepth(19); // ユニットの下、エフェクトの下

    // 範囲内の波紋エフェクト
    const ripple = this.scene.add.circle(centerX, centerY, 10, color, 0.7);
    ripple.setDepth(19);

    // 波紋アニメーション
    this.scene.tweens.add({
      targets: ripple,
      scale: { from: 0.2, to: radius / 10 }, // 10pxから範囲サイズまで
      alpha: { from: 0.7, to: 0 },
      duration: 800,
      repeat: 1,
      onComplete: () => {
        ripple.destroy();
      },
    });

    // 範囲円のアニメーション
    this.scene.tweens.add({
      targets: areaCircle,
      alpha: 0,
      duration: 1500,
      onComplete: () => {
        areaCircle.destroy();
      },
    });

    // 個別ターゲットへのエフェクト
    targets.forEach((target) => {
      // ターゲットごとに小さな爆発エフェクト
      const explosion = this.scene.add.circle(target.x, target.y, 15, color, 0.8);
      explosion.setDepth(20);

      this.scene.tweens.add({
        targets: explosion,
        scale: { from: 0.5, to: 2 },
        alpha: { from: 0.8, to: 0 },
        duration: 500,
        onComplete: () => {
          explosion.destroy();
        },
      });
    });
  }

  /**
   * ヒールエフェクトの表示
   * @param target 回復対象
   * @param amount 回復量
   */
  showHealEffect(target: Unit, amount: number): void {
    // 回復テキスト
    const healText = this.scene.add.text(target.x, target.y - 20, `+${Math.floor(amount)}`, {
      font: 'bold 16px Arial',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 3,
    });
    healText.setOrigin(0.5);
    healText.setDepth(15);

    // テキストアニメーション
    this.scene.tweens.add({
      targets: healText,
      y: healText.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        healText.destroy();
      },
    });

    // 回復エフェクト（緑色の輝き）
    const healEffect = this.scene.add.graphics();
    healEffect.fillStyle(0x00ff00, 0.5);
    healEffect.fillCircle(target.x, target.y, 30);
    healEffect.setDepth(4);

    // 緑色の上昇パーティクル
    const particles = this.scene.add.particles(target.x, target.y, 'particle', {
      speed: { min: 50, max: 100 },
      angle: { min: 250, max: 290 },
      scale: { start: 0.6, end: 0 },
      blendMode: 'ADD',
      tint: 0x00ff00,
      lifespan: 1000,
      quantity: 15,
    });

    // アニメーション
    this.scene.tweens.add({
      targets: healEffect,
      alpha: 0,
      scale: 1.5,
      duration: 800,
      onComplete: () => {
        healEffect.destroy();
        particles.destroy();
      },
    });
  }

  /**
   * バフエフェクトの表示
   * @param target バフ対象
   * @param color バフの色（黄色=強化、青=防御など）
   */
  showBuffEffect(target: Unit, color: number = 0xffff00): void {
    // バフテキスト
    const buffText = this.scene.add.text(target.x, target.y - 30, 'BUFF!', {
      font: 'bold 16px Arial',
      color: `#${color.toString(16).padStart(6, '0')}`,
      stroke: '#000000',
      strokeThickness: 3,
    });
    buffText.setOrigin(0.5);
    buffText.setDepth(15);

    // テキストアニメーション
    this.scene.tweens.add({
      targets: buffText,
      y: buffText.y - 20,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        buffText.destroy();
      },
    });

    // バフエフェクト（上昇する輝き）
    for (let i = 0; i < 5; i++) {
      const offset = (i - 2) * 10;
      const startDelay = i * 100;

      const buffSparkle = this.scene.add.circle(target.x + offset, target.y, 5, color, 0.8);
      buffSparkle.setDepth(15);

      this.scene.tweens.add({
        targets: buffSparkle,
        y: target.y - 50,
        alpha: 0,
        scale: 2,
        duration: 800,
        delay: startDelay,
        onComplete: () => {
          buffSparkle.destroy();
        },
      });
    }

    // 対象の周りを回転する光エフェクト
    const orbitalEffect = this.scene.add.graphics();
    orbitalEffect.fillStyle(color, 0.6);
    orbitalEffect.setDepth(16);

    let angle = 0;
    let orbAlpha = 1;

    // 回転アニメーション
    const animateOrbital = () => {
      orbitalEffect.clear();

      if (orbAlpha <= 0) {
        orbitalEffect.destroy();
        return;
      }

      // 3つの球体を描画
      for (let i = 0; i < 3; i++) {
        const orbitAngle = angle + (i * Math.PI * 2) / 3;
        const orbitX = target.x + Math.cos(orbitAngle) * 25;
        const orbitY = target.y + Math.sin(orbitAngle) * 25;

        orbitalEffect.fillCircle(orbitX, orbitY, 6);
      }

      angle += 0.1;
      orbAlpha -= 0.02;
      orbitalEffect.setAlpha(orbAlpha);

      if (orbAlpha > 0) {
        this.scene.time.delayedCall(20, animateOrbital);
      }
    };

    animateOrbital();
  }
}
