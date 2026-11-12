# extension.js

GNOME Shell の選択変更を監視し、テキスト履歴の保存、検索画面、ショートカット、貼り付けを管理する（`nuts-clipboard-history@local/extension.js:18-103`）。

検索画面はモーダルでキーボードを取得し、上下キーまたは Ctrl+J/K で選択、Enter で貼り付ける。画面外のクリックまたはタッチで画面を閉じ、画面内のイベントは伝播させる（`nuts-clipboard-history@local/extension.js:90-194`）。選択時はクリップボードを更新し、元ウィンドウにフォーカスが戻った場合だけ仮想キーを送る。既知の端末には Ctrl+Shift+V、その他には Ctrl+V を送る（`nuts-clipboard-history@local/extension.js:196-221`）。独自ショートカットや未登録の端末には対応しない。

履歴はユーザーデータ領域に保存され、拡張の無効化時にショートカットと監視を解除する。Shell と Mutter の API に依存する。

## 変更履歴（git log より自動生成）

- 9843d82 feat(#4): dismiss history on outside click
- 1c241f8 feat(#2): add searchable clipboard history (#3)
