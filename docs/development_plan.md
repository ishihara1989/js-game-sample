# オートバトルRPG 開発計画書

## 現在の状況

現在のゲームは以下の基本機能が実装されています：

1. **シーン構成**
   - メインシーン（MainScene）：タイトル画面とバトル開始ボタンを表示
   - バトルシーン（BattleScene）：自動戦闘システムの実装
   - リザルトシーン（ResultScene）：戦闘結果の表示

2. **戦闘システム**
   - プレイヤーユニットと敵ユニットの1対1の戦闘
   - 自動的な移動、攻撃、スキル使用
   - HPバーとスキルゲージの表示
   - 攻撃エフェクトとダメージ計算

3. **基本的なゲームフロー**
   - メインメニュー → バトル → リザルト → メインメニュー

## 課題点

現状のコードには以下の課題があります：

1. **メニュー画面の機能が不足**
   - シンプルなタイトル画面のみで、RPGに必要な機能（アイテム管理、装備変更など）がない

2. **バトルシーンの初期化処理が単一クラスに集中**
   - ステージごとの設定が難しい構造になっている
   - 敵の種類やステージによる違いを表現するのが困難

3. **敵ユニットの管理が非効率**
   - 現在は直接バトルシーン内で敵を生成・管理しており、拡張性に乏しい
   - 敵の行動パターンやデータが分散している

4. **アイテムや装備のシステムがない**
   - これらの要素はRPGの基本機能だが未実装

## 今後の開発方針

### 1. メニュー画面シーンの実装

メニュー画面シーンを拡張し、RPGの中心となる機能ハブを作成します。

**具体的な実装内容：**

- 現在のMainSceneを拡張してMenuSceneとして充実させる
- 以下のメニュー項目を実装：
  - 戦闘開始（ステージ選択機能を含む）
  - アイテム管理（所持アイテムの確認、使用）
  - 装備変更（装備品の確認、変更）
  - ステータス確認（プレイヤーの能力値表示）
- ボタンとパネル形式のUIシステムの構築
- 戦闘結果からメニュー画面への適切な遷移処理

### 2. 戦闘シーンの初期化処理の分離

バトルシーンからステージ関連の処理を分離し、ステージごとの実装を可能にします。

**具体的な実装内容：**

- `src/stages` ディレクトリの作成
- 基底となる `Stage` クラスの実装
  - ステージの初期化と設定を担当
  - 敵の配置とイベントの管理機能
- 個別ステージクラスの実装
  - `Stage_1_1`、`Stage_1_2`、`Stage_1_3` の仮実装
  - 各ステージごとの敵の配置や難易度の設定
- BattleSceneとStageクラス間のインターフェース設計

### 3. 敵ユニット管理の改善

敵ユニットの管理を改善し、より柔軟な敵の行動パターンや多様な敵タイプを実現します。

**具体的な実装内容：**

- 敵ユニットの基本クラス `EnemyUnit` の実装（Unitクラスを拡張）
- 敵タイプごとに個別クラスを作成（例: `GoblinEnemy`, `OrcEnemy`など）
- 敵ユニットと戦闘シーン、ステージ間の連携のためのインターフェース設計
- 敵の行動パターンを設定可能にするAIシステムの実装
- 複数敵ユニットの同時管理機能

### 4. アイテムと装備システムの実装（将来課題）

今後の拡張として、アイテムと装備のシステムを実装する予定です。

**検討中の実装内容：**

- アイテムの基本システム（取得、使用、効果適用）
- 装備品システム（装備、取り外し、能力値への影響）
- インベントリ管理システム
- アイテムドロップと収集システム
- ショップシステム（購入、売却）

## 実装スケジュール

1. **第1フェーズ: メニュー画面の実装**
   - MenuSceneのUI実装
   - 基本メニュー機能の実装
   - ResultSceneからの遷移改善

2. **第2フェーズ: ステージシステムの実装**
   - Stageクラスの基本設計
   - BattleSceneの改修
   - 基本ステージの実装

3. **第3フェーズ: 敵ユニット管理の改善**
   - EnemyUnitクラスの実装
   - 敵タイプの実装
   - AIシステムの改善

4. **第4フェーズ: アイテム・装備システム（将来実装）**
   - 基本設計
   - UIの実装
   - ゲームバランスの調整

## 技術的なメモ

### コード構成

```
src/
├── assets/           # ゲームアセット
├── scenes/           
│   ├── MainScene.ts   # 拡張してMenuSceneに
│   ├── BattleScene.ts # ステージシステムと連携するよう改修
│   └── ResultScene.ts # MenuSceneへの遷移を改善
├── objects/          
│   ├── Unit.ts        # 既存のユニット基本クラス
│   ├── EnemyUnit.ts   # 新規: 敵ユニット基本クラス（作成予定）
│   ├── PlayerUnit.ts  # 新規: プレイヤーユニットクラス（作成予定）
│   └── Item.ts        # 新規: アイテムクラス（将来実装）
├── stages/           # 新規ディレクトリ
│   ├── Stage.ts       # 新規: ステージ基本クラス
│   ├── Stage_1_1.ts   # 新規: ステージ1-1
│   ├── Stage_1_2.ts   # 新規: ステージ1-2
│   └── Stage_1_3.ts   # 新規: ステージ1-3
├── types/            
│   ├── BattleTypes.ts # 既存の戦闘関連型定義（拡張予定）
│   ├── ItemTypes.ts   # 新規: アイテム関連型定義（将来実装）
│   └── StageTypes.ts  # 新規: ステージ関連型定義
└── index.ts          # エントリーポイント
```

### 設計方針

1. **コンポーネント指向設計**: 機能ごとにクラスを分割し、責務を明確にする
2. **インターフェースによる疎結合**: クラス間の依存関係を最小限に抑える
3. **段階的な拡張**: 基本機能を先に実装し、徐々に機能を追加・拡張する

## 注意点

- 既存コードとの互換性を維持しつつ、拡張性を高める実装を目指す
- ステージの初期化とユニットの行動を分離することで、コードの可読性と保守性を向上させる
- 将来的なマルチプレイヤーや追加機能を見据えた設計を心がける
