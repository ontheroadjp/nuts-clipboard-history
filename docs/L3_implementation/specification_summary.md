# 実装仕様サマリ

### 履歴と検索

Shell の clipboard selection 変更を監視し、テキストをユーザーデータ領域の JSON に保存します（`nuts-clipboard-history@local/extension.js:18-103`）。同じテキストは最新に移動し、最大 100 件、1 件最大 100,000 文字です。検索は大小文字を区別しない部分一致です（`nuts-clipboard-history@local/history.js:1-22`）。画像やファイルは履歴対象ではありません（`README.md:5-10`）。

### 選択と貼り付け

設定スキーマの Ctrl+Shift+backslash で画面を開き、上下キーまたは Ctrl+J/K で移動して Enter で選択します。画面外のクリックまたはタッチで画面を閉じます（`nuts-clipboard-history@local/schemas/org.gnome.shell.extensions.nuts-clipboard-history.gschema.xml:1-9`, `nuts-clipboard-history@local/extension.js:90-194`）。元のウィンドウにフォーカスが戻ったとき、既知の端末では Ctrl+Shift+V、それ以外では Ctrl+V を送ります（`nuts-clipboard-history@local/extension.js:196-221`, `nuts-clipboard-history@local/history.js:23-33`）。

### インストールと検証

`install.sh` が拡張の symlink とスキーマを用意し、`uninstall.sh` は履歴を残して拡張を削除します（`install.sh:1-28`, `uninstall.sh:1-12`）。Node.js による履歴テストを `package.json` で定義しています（`package.json:1`, `tests/history.test.mjs:1-14`）。
