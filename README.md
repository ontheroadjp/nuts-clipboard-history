# Nuts Clipboard History

GNOME Shell Wayland 向けのテキストクリップボード履歴です。

## Features

- コピーされたテキストを最大 100 件保存し、重複は最新に移動します（1 件あたり最大 100,000 文字）。
- `Ctrl+Shift+\` で履歴を開き、部分一致でインクリメンタル検索します。
- 上下キー、`Ctrl+J`／`Ctrl+K`、またはクリックで選択し、Enter で元のウィンドウに貼り付け操作を送ります。Esc または画面外のクリック・タッチで閉じます。
- 画像、ファイル、テキスト以外の形式は保存しません。

## Installation

GNOME Shell 50、Wayland、`gnome-extensions`、`glib-compile-schemas` が必要です。

```sh
./install.sh
```

拡張はリポジトリへのシンボリックリンクとしてインストールされます。Shell が新しい拡張を認識しない場合はログアウト・ログイン後に `gnome-extensions enable nuts-clipboard-history@local` を実行してください。

## Usage

通常どおりコピーし、貼り付け先で `Ctrl+Shift+\` を押します。検索して項目を選ぶと、そのテキストが現在のクリップボードに設定され、画面を閉じた後に通常は `Ctrl+V`、Alacritty など判別できるターミナルには `Ctrl+Shift+V` が送信されます。独自のショートカットを設定したアプリや判別できないターミナルでは、項目選択後にアプリの貼り付け操作を実行してください。

履歴は `${XDG_DATA_HOME:-~/.local/share}/nuts-clipboard-history/history.json` にユーザーのみが読める権限で保存されます。パスワードなどコピーしたテキストも保存されるため注意してください。履歴を消すには拡張を無効化してからこのファイルを削除してください。`./uninstall.sh` は拡張を取り除きますが履歴は削除しません。

検証: `node tests/history.test.mjs`、`bash -n install.sh uninstall.sh`。実機ではコピー、検索、貼り付け、ログインし直した後の履歴を確認してください。

## Design Principles

- Nuts Launcher と同じ GNOME Shell 上の検索画面を使い、Wayland で動作する。
- 履歴をローカルに限定し、外部サービスに送信しない。
- 拡張の無効化時にショートカット、通知、画面を解除する。
