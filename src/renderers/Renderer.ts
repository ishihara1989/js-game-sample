/**
 * 描画コンポーネントの基本インターフェース
 * すべての描画コンポーネントはこのインターフェースを実装する
 */
export interface Renderer {
  /**
   * 初期化処理
   * リソースの作成やシーンへの登録を行う
   */
  initialize(): void;

  /**
   * 更新処理
   * @param delta 前フレームからの経過時間
   */
  update(delta: number): void;

  /**
   * 描画処理
   * グラフィックスの更新や位置の調整を行う
   */
  render(): void;

  /**
   * クリーンアップ処理
   * リソースの解放やシーンからの削除を行う
   */
  destroy(): void;
}
