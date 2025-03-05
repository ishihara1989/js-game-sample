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

## ビルド方法

開発が完了し、プロジェクトを本番環境にデプロイする準備ができたら、以下のコマンドでビルドを実行します：

```bash
npm run build
# または
yarn build
```

ビルドが成功すると、`dist` ディレクトリに最適化されたファイルが生成されます。これらのファイルは任意のウェブサーバーにデプロイできます。

### ビルド出力の確認方法

ビルド後の出力を確認するには、`dist` ディレクトリの内容を任意のウェブサーバーでホストするか、以下のようなシンプルなHTTPサーバーを使用します：

```bash
# グローバルにhttpサーバーをインストール
npm install -g http-server

# distディレクトリでサーバーを起動
cd dist
http-server -o
```

または、ローカルで実行するならPythonの組み込みサーバーも利用できます：

```bash
# Python 3の場合
cd dist
python -m http.server
```

ブラウザで http://localhost:8000 を開くと、ビルドされたアプリケーションが表示されます。

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
├── .gitignore            # Git管理対象外ファイルの設定
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