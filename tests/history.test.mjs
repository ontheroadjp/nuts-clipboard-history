import assert from 'node:assert/strict';
import {addItem, searchItems, parseHistory, isTerminal, MAX_ITEMS, MAX_TEXT_LENGTH} from '../nuts-clipboard-history@local/history.js';

assert.deepEqual(addItem(['a', 'b'], 'b'), ['b', 'a']);
assert.deepEqual(addItem(['a'], ''), ['a']);
assert.deepEqual(addItem([], 'x'.repeat(MAX_TEXT_LENGTH + 1)), []);
assert.equal(Array.from({length: MAX_ITEMS + 1}, (_, i) => String(i)).reduce(addItem, []).length, MAX_ITEMS);
assert.deepEqual(searchItems(['Alpha\nBeta', 'gamma'], 'BETA'), ['Alpha\nBeta']);
assert.deepEqual(parseHistory('["new", "old", "new", 12]'), ['new', 'old']);
assert.throws(() => parseHistory('{}'));
assert.equal(isTerminal('Alacritty', 'org.alacritty.Alacritty.desktop'), true);
assert.equal(isTerminal('org.gnome.Terminal.desktop'), true);
assert.equal(isTerminal(null, 'firefox'), false);
console.log('History tests passed');
