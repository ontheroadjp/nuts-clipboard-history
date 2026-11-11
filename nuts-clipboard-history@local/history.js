export const MAX_ITEMS = 100;
export const MAX_TEXT_LENGTH = 100000;

export function addItem(items, text) {
    if (typeof text !== 'string' || !text || text.length > MAX_TEXT_LENGTH)
        return items;
    return [text, ...items.filter(item => item !== text)].slice(0, MAX_ITEMS);
}

export function searchItems(items, query) {
    const needle = query.toLocaleLowerCase();
    return items.filter(item => item.toLocaleLowerCase().includes(needle));
}

export function parseHistory(data) {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed))
        throw new Error('History is not an array');
    return parsed.reverse().reduce(addItem, []);
}

const TERMINAL_IDS = new Set([
    'alacritty', 'org.alacritty.alacritty', 'org.gnome.terminal',
    'org.gnome.terminal-server', 'org.gnome.ptyxis', 'ptyxis',
    'kitty', 'net.kovidgoyal.kitty', 'org.kde.konsole', 'konsole',
    'com.mitchellh.ghostty', 'ghostty', 'org.wezfurlong.wezterm',
    'wezterm', 'com.gexperts.tilix', 'tilix', 'terminator', 'xterm',
]);

export function isTerminal(...identifiers) {
    return identifiers.some(id => typeof id === 'string' &&
        TERMINAL_IDS.has(id.toLowerCase().replace(/\.desktop$/, '')));
}
