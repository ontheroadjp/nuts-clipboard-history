import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import {addItem, isTerminal, parseHistory, searchItems} from './history.js';

const VISIBLE_ITEMS = 10;
const PASTE_DELAY_MS = 150;
// Linux input-event-codes.h: physical Ctrl and V key codes.
const KEY_LEFTCTRL = 29;
const KEY_LEFTSHIFT = 42;
const KEY_V = 47;

export default class ClipboardHistory extends Extension {
    enable() {
        this._enabled = true;
        this._items = [];
        this._generation = 0;
        this._pasteTimeout = 0;
        this._directory = GLib.build_filenamev([GLib.get_user_data_dir(), 'nuts-clipboard-history']);
        this._file = Gio.File.new_for_path(GLib.build_filenamev([this._directory, 'history.json']));
        this._load();
        this._clipboard = St.Clipboard.get_default();
        this._selection = global.display.get_selection();
        this._selectionId = this._selection.connect('owner-changed', (_selection, type) => {
            if (type === Meta.SelectionType.SELECTION_CLIPBOARD)
                this._capture();
        });
        this._buildUI();
        this._settings = this.getSettings();
        Main.wm.addKeybinding('toggle-history', this._settings, Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL, () => this._toggle());
        this._capture();
    }

    disable() {
        this._enabled = false;
        this._generation++;
        if (this._pasteTimeout)
            GLib.source_remove(this._pasteTimeout);
        Main.wm.removeKeybinding('toggle-history');
        this._selection.disconnect(this._selectionId);
        this._hide();
        Main.layoutManager.removeChrome(this._box);
        this._box.destroy();
        this._keyboard = null;
    }

    _load() {
        try {
            const [ok, bytes] = this._file.load_contents(null);
            if (ok)
                this._items = parseHistory(new TextDecoder().decode(bytes));
        } catch (error) {
            if (!error.matches?.(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND))
                console.error('Clipboard history: cannot load history', error);
        }
    }

    _save() {
        try {
            if (GLib.mkdir_with_parents(this._directory, 0o700) !== 0)
                throw new Error('Cannot create history directory');
            this._file.replace_contents(JSON.stringify(this._items), null, false,
                Gio.FileCreateFlags.PRIVATE | Gio.FileCreateFlags.REPLACE_DESTINATION, null);
        } catch (error) {
            console.error('Clipboard history: cannot save history', error);
        }
    }

    _capture() {
        const generation = ++this._generation;
        this._clipboard.get_text(St.ClipboardType.CLIPBOARD, (_clipboard, text) => {
            if (!this._enabled || generation !== this._generation || !text)
                return;
            const next = addItem(this._items, text);
            if (next === this._items)
                return;
            this._items = next;
            this._save();
            if (this._visible)
                this._refresh();
        });
    }

    _buildUI() {
        this._box = new St.BoxLayout({style_class: 'nuts-history', vertical: true, reactive: true});
        this._box.connect('captured-event', (actor, event) => {
            if ((event.type() === Clutter.EventType.BUTTON_PRESS ||
                event.type() === Clutter.EventType.TOUCH_BEGIN) &&
                !actor.contains(global.stage.get_event_actor(event)))
                this._hide();
            return Clutter.EVENT_PROPAGATE;
        });
        this._entry = new St.Entry({style_class: 'nuts-history-entry', hint_text: 'Search clipboard history…', can_focus: true});
        this._results = new St.BoxLayout({vertical: true});
        this._box.add_child(this._entry);
        this._box.add_child(this._results);
        const input = this._entry.get_clutter_text();
        input.connect('text-changed', () => { this._index = 0; this._refresh(); });
        input.connect('key-press-event', (_actor, event) => this._key(event));
        Main.layoutManager.addTopChrome(this._box);
        this._box.hide();
        this._visible = false;
        this._grab = null;
    }

    _toggle() {
        if (this._visible) {
            this._hide();
            return;
        }
        this._targetWindow = global.display.focus_window;
        const app = this._targetWindow ? Shell.WindowTracker.get_default().get_window_app(this._targetWindow) : null;
        this._targetIsTerminal = isTerminal(app?.get_id(), this._targetWindow?.get_wm_class(),
            this._targetWindow?.get_wm_class_instance());
        this._entry.set_text('');
        this._index = 0;
        this._refresh();
        this._box.show();
        const monitor = Main.layoutManager.currentMonitor ?? Main.layoutManager.primaryMonitor;
        this._box.set_position(monitor.x + Math.round((monitor.width - 600) / 2),
            monitor.y + Math.round(monitor.height / 4));
        const grab = Main.pushModal(this._box, {actionMode: Shell.ActionMode.NORMAL});
        const valid = grab && (typeof grab.get_seat_state === 'function'
            ? Boolean(grab.get_seat_state() & Clutter.GrabState.KEYBOARD) : !grab.is_revoked());
        if (!valid) {
            if (grab)
                Main.popModal(grab);
            this._box.hide();
            console.error('Clipboard history: keyboard grab failed');
            return;
        }
        this._grab = grab;
        this._visible = true;
        this._entry.grab_key_focus();
    }

    _hide() {
        if (this._box)
            this._box.hide();
        this._visible = false;
        if (this._grab) {
            Main.popModal(this._grab);
            this._grab = null;
        }
    }

    _refresh() {
        this._filtered = searchItems(this._items, this._entry.get_text());
        this._index = Math.max(0, Math.min(this._index ?? 0, this._filtered.length - 1));
        this._results.destroy_all_children();
        if (!this._filtered.length) {
            this._results.add_child(new St.Label({style_class: 'nuts-history-empty', text: 'No matching history'}));
            return;
        }
        const start = Math.max(0, this._index - VISIBLE_ITEMS + 1);
        this._filtered.slice(start, start + VISIBLE_ITEMS).forEach((text, offset) => {
            const row = new St.Button({style_class: 'nuts-history-row', x_expand: true,
                label: text.replace(/\s+/g, ' ').slice(0, 120)});
            if (start + offset === this._index)
                row.add_style_pseudo_class('selected');
            row.connect('clicked', () => this._paste(text));
            this._results.add_child(row);
        });
    }

    _key(event) {
        const key = event.get_key_symbol();
        const state = event.get_state();
        const ctrlOnly = (state & (Clutter.ModifierType.CONTROL_MASK |
            Clutter.ModifierType.MOD1_MASK | Clutter.ModifierType.SUPER_MASK)) ===
            Clutter.ModifierType.CONTROL_MASK;
        const down = key === Clutter.KEY_Down ||
            (ctrlOnly && (key === Clutter.KEY_j || key === Clutter.KEY_J));
        const up = key === Clutter.KEY_Up ||
            (ctrlOnly && (key === Clutter.KEY_k || key === Clutter.KEY_K));
        if (key === Clutter.KEY_Escape) {
            this._hide();
        } else if (down || up) {
            this._index += down ? 1 : -1;
            this._refresh();
        } else if (key === Clutter.KEY_Return || key === Clutter.KEY_KP_Enter) {
            if (this._filtered[this._index])
                this._paste(this._filtered[this._index]);
        } else {
            return Clutter.EVENT_PROPAGATE;
        }
        return Clutter.EVENT_STOP;
    }

    _paste(text) {
        const target = this._targetWindow;
        const useShift = this._targetIsTerminal;
        this._clipboard.set_text(St.ClipboardType.CLIPBOARD, text);
        this._hide();
        if (this._pasteTimeout)
            GLib.source_remove(this._pasteTimeout);
        this._pasteTimeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, PASTE_DELAY_MS, () => {
            this._pasteTimeout = 0;
            if (!target || global.display.focus_window !== target) {
                console.warn('Clipboard history: paste cancelled because focus changed');
                return GLib.SOURCE_REMOVE;
            }
            this._keyboard ??= Clutter.get_default_backend().get_default_seat()
                .create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE);
            const time = GLib.get_monotonic_time();
            this._keyboard.notify_key(time, KEY_LEFTCTRL, Clutter.KeyState.PRESSED);
            if (useShift)
                this._keyboard.notify_key(time, KEY_LEFTSHIFT, Clutter.KeyState.PRESSED);
            this._keyboard.notify_key(time, KEY_V, Clutter.KeyState.PRESSED);
            this._keyboard.notify_key(time, KEY_V, Clutter.KeyState.RELEASED);
            if (useShift)
                this._keyboard.notify_key(time, KEY_LEFTSHIFT, Clutter.KeyState.RELEASED);
            this._keyboard.notify_key(time, KEY_LEFTCTRL, Clutter.KeyState.RELEASED);
            return GLib.SOURCE_REMOVE;
        });
    }
}
