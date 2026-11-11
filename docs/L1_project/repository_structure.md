# リポジトリ構造

- `nuts-clipboard-history@local/`: Shell 拡張、履歴処理、スタイル、設定スキーマ（`nuts-clipboard-history@local/metadata.json:1-8`, `nuts-clipboard-history@local/extension.js:1-18`）。
- `install.sh`、`uninstall.sh`: 拡張の導入と削除（`install.sh:1-28`, `uninstall.sh:1-12`）。
- `tests/`: 履歴と端末判定の Node.js テスト（`tests/history.test.mjs:1-14`）。
- `docs/`: 設計・開発情報（`docs/.ai/repo.profile.json`）。
- `README.md`: 利用手順と制限（`README.md:3-30`）。
- `CLAUDE.md`、`AGENTS.md`: AI 向け運用情報。`AGENTS.md` は `CLAUDE.md` へのシンボリックリンク。

モノレポ構成や CI 定義は確認できません。
