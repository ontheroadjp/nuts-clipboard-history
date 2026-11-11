# 開発・運用

`./install.sh` は GNOME Shell 50 を確認し、拡張への symlink を作りスキーマをコンパイルして有効化します（`install.sh:1-28`）。Shell が拡張を認識しない場合の手順と履歴削除方法は `README.md:12-26` にあります。`./uninstall.sh` はリンクを外しますが履歴を保持します（`uninstall.sh:1-12`）。

履歴の単体テストは `node tests/history.test.mjs` で実行します（`package.json:1`）。GNOME 上での貼り付け動作は実機確認が必要です（`README.md:28`）。
