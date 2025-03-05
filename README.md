# Phaser オートバトル RPG

PhaserとTypeScriptを使用したオートバトルRPGゲームプロジェクトです。

## 環境構築

### 必要条件

- Node.js (v14以上推奨)
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/ishihara1989/js-game-sample.git
cd js-game-sample

# 依存パッケージをインストール
npm install
# または
yarn install
```

## 開発サーバーの起動

```bash
npm start
# または
yarn start
```

ブラウザで http://localhost:8080 を開いてゲームを確認できます。

## 動作確認の手順

1. `npm start` でローカル開発サーバーを起動します
2. ブラウザで http://localhost:8080 を開きます
3. 画面に「Phaser Auto Battle RPG」というテキストと赤い四角が表示されていれば成功です

## トラブルシューティング

### 「npm start」でエラーが発生する場合

以下の手順を試してみてください：

1. プロジェクトフォルダで `npm install` を再実行して依存パッケージが正しくインストールされているか確認
2. Node.jsとnpmが最新バージョンになっているか確認（`node -v` と `npm -v` で確認可能）
3. 開発ポート（8080）が他のアプリケーションで使われていないか確認

### ブラウザで表示されない場合

- コンソールを確認してエラーメッセージを確認してください
- ブラウザのキャッシュをクリアしてみてください
- 別のブラウザで試してみてください（Chrome推奨）

## プロジェクト構成

```
├── src/                  # ソースコード
│   ├── assets/           # ゲームアセット（画像、音声など）
│   ├── scenes/           # Phaserのシーン
│   ├── objects/          # ゲームオブジェクト
│   ├── systems/          # ゲームシステム（バトル、レベルアップなど）
│   └── index.ts          # エントリーポイント
├── public/               # 静的ファイル
│   └── index.html        # HTMLテンプレート
├── dist/                 # ビルド出力ディレクトリ
├── webpack.config.js     # Webpackの設定
├── tsconfig.json         # TypeScriptの設定
├── package.json          # プロジェクト依存関係
└── README.md             # プロジェクト説明
```

## 主要な技術

- [Phaser 3](https://phaser.io/phaser3) - HTML5ゲームフレームワーク
- [TypeScript](https://www.typescriptlang.org/) - 型付きJavaScript
- [Webpack](https://webpack.js.org/) - モジュールバンドラー

## 開発について

### オートバトルシステム

このRPGは自動で進行するバトルシステムを採用します。プレイヤーはキャラクターの装備や能力値を調整することでバトル結果に影響を与えることができます。

### 今後の実装予定

- キャラクター作成システム
- 装備とインベントリ管理
- 戦闘アニメーション
- 敵AIシステム
- レベルアップと成長システム