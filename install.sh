#!/usr/bin/env bash
set -euo pipefail
root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
uuid='nuts-clipboard-history@local'
dest="${XDG_DATA_HOME:-$HOME/.local/share}/gnome-shell/extensions/$uuid"
for command in gnome-shell gnome-extensions glib-compile-schemas; do
    command -v "$command" >/dev/null || { printf 'Missing command: %s\n' "$command" >&2; exit 1; }
done
version=$(gnome-shell --version)
if [[ ! "$version" =~ ^GNOME\ Shell\ 50\. ]]; then
    printf 'Unsupported GNOME Shell version: %s (requires 50)\n' "$version" >&2
    exit 1
fi
if [[ -e "$dest" || -L "$dest" ]]; then
    if [[ ! -L "$dest" || $(readlink "$dest") != "$root/$uuid" ]]; then
        printf 'Destination already exists: %s\n' "$dest" >&2
        exit 1
    fi
else
    mkdir -p "$(dirname -- "$dest")"
    ln -s "$root/$uuid" "$dest"
fi
glib-compile-schemas "$root/$uuid/schemas"
if ! gnome-extensions enable "$uuid"; then
    printf 'Could not enable extension. Log out and back in, then run: gnome-extensions enable %s\n' "$uuid" >&2
    exit 1
fi
printf 'Enabled %s. Press Ctrl+Shift+\\ to search history.\n' "$uuid"
