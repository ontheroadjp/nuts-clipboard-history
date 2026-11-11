#!/usr/bin/env bash
set -euo pipefail
root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
uuid='nuts-clipboard-history@local'
dest="${XDG_DATA_HOME:-$HOME/.local/share}/gnome-shell/extensions/$uuid"
if [[ ! -L "$dest" || $(readlink "$dest") != "$root/$uuid" ]]; then
    printf 'No matching installation at %s\n' "$dest" >&2
    exit 1
fi
gnome-extensions disable "$uuid"
unlink "$dest"
printf 'Extension removed. History remains in %s/nuts-clipboard-history/history.json\n' "${XDG_DATA_HOME:-$HOME/.local/share}"
