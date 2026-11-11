# extension.js

GNOME Shell の選択変更を監視し、テキスト履歴の保存、検索画面、ショートカット、貼り付けを管理する（`nuts-clipboard-history@local/extension.js:18-103`）。

検索画面はキーボードを取得し、上下キーまたは Ctrl+J/K で選択、Enter で貼り付ける（`nuts-clipboard-history@local/extension.js:105-181`）。選択時はクリップボードを更新し、元ウィンドウにフォーカスが戻った場合だけ仮想キーを送る。既知の端末には Ctrl+Shift+V、その他には Ctrl+V を送る（`nuts-clipboard-history@local/extension.js:182-215`）。独自ショートカットや未登録の端末には対応しない。

履歴はユーザーデータ領域に保存され、拡張の無効化時にショートカットと監視を解除する。Shell と Mutter の API に依存する。
