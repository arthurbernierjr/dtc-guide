// ─────────────────────────────────────────────────────────────────────────────
// JS REGEX — the 20% you use 80% of the time
// ─────────────────────────────────────────────────────────────────────────────
// FIRST VISIT : From Session 9.1, read the METHODS row, then section 1 (test) and the isSlug line in
//               section 10: that is the shape check an id needs. Stop there; the other sections are lookup
//               for when a pattern misbehaves.
// FLAGS   : g global, i ignore case, m multiline (^$ per line), s dotAll, u unicode, y sticky
// CLASSES : \d \w \s and negations \D \W \S; [a-z]; [^abc]; . (not newline)
// QUANT   : * + ? {n} {n,} {n,m}; lazy with trailing ?  (.*? vs .*)
// ANCHORS : ^ $ \b (word boundary)
// GROUPS  : (x) capture, (?:x) non-capture, (?<name>x) named, \1 backref,
//           (?=x) lookahead, (?!x) neg lookahead, (?<=x) lookbehind, (?<!x)
// METHODS : re.test(s), s.match(re) (all with /g, else groups), s.matchAll(re),
//           s.replace(re, str|fn), s.split(re), re.exec(s) (stateful with /g!)
// TRAP    : escape . * + ? ( ) [ ] { } | ^ $ \ /;  /g regex objects keep lastIndex;
//           match() without /g returns [full, ...groups] with .index
// SAY     : "greedy vs lazy", "capture group", "backreference", "lookaround",
//           "anchored", "ReDoS / catastrophic backtracking"
// ─────────────────────────────────────────────────────────────────────────────
'use strict';
const assert = require('node:assert/strict');

// ── 1. test / match / matchAll
assert.equal(/^\d{3}-\d{4}$/.test('555-1234'), true);
assert.deepEqual('x=1, y=22'.match(/\d+/g), ['1', '22']);                // /g -> all matches, no groups
assert.equal('abc'.match(/\d/g), null);                                  // no match -> null (guard with ?? [])
const m = 'key: value'.match(/^(\w+): (\w+)$/);                          // no /g -> first match + groups
assert.equal(m[0], 'key: value');
assert.deepEqual([m[1], m[2], m.index], ['key', 'value', 0]);
const named = '2024-01-31'.match(/(?<y>\d{4})-(?<mo>\d{2})-(?<d>\d{2})/).groups;
assert.deepEqual({ ...named }, { y: '2024', mo: '01', d: '31' });   // .groups has a null prototype — spread it before deepEqual
const all = [...'a=1;b=2'.matchAll(/(\w)=(\d)/g)].map(x => [x[1], Number(x[2])]);   // matchAll needs /g
assert.deepEqual(all, [['a', 1], ['b', 2]]);

// ── 2. replace with string patterns and functions
assert.equal('a.b.c'.replace(/\./g, '-'), 'a-b-c');
assert.equal('John Smith'.replace(/(\w+) (\w+)/, '$2, $1'), 'Smith, John');
assert.equal('2024-01-31'.replace(/(?<y>\d+)-(?<m>\d+)-(?<d>\d+)/, '$<d>/$<m>/$<y>'), '31/01/2024');
assert.equal('a1b22'.replace(/\d+/g, d => `[${d.length}]`), 'a[1]b[2]');
assert.equal('hello world'.replace(/\b\w/g, c => c.toUpperCase()), 'Hello World');
assert.equal('snake_case_name'.replace(/_(\w)/g, (_, c) => c.toUpperCase()), 'snakeCaseName');
assert.equal('camelCaseName'.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`), 'camel_case_name');
assert.equal('  a   b  '.trim().replace(/\s+/g, ' '), 'a b');

// ── 3. Greedy vs lazy
assert.equal('<b>x</b><b>y</b>'.match(/<b>.*<\/b>/)[0], '<b>x</b><b>y</b>');      // greedy eats everything
assert.equal('<b>x</b><b>y</b>'.match(/<b>.*?<\/b>/)[0], '<b>x</b>');            // lazy stops early

// ── 4. Lookaround
assert.deepEqual('price: $42, cost: $7'.match(/(?<=\$)\d+/g), ['42', '7']);       // lookbehind: digits after $
assert.deepEqual('a1 b2 c'.match(/[a-z](?=\d)/g), ['a', 'b']);                    // letters followed by digit
assert.equal(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test('Passw0rdX'), true);    // password policy via lookaheads
assert.equal('1234567'.replace(/\B(?=(\d{3})+(?!\d))/g, ','), '1,234,567');       // thousands separator

// ── 5. Backreferences
assert.equal(/(\w)\1/.test('hello'), true);                                       // doubled letter
assert.equal('aaabcc'.replace(/(.)\1+/g, '$1'), 'abc');                          // collapse runs
assert.equal(/^(['"]).*\1$/.test('"quoted"'), true);                             // matching quotes

// ── 6. Split
assert.deepEqual('a1b2c3'.split(/\d/), ['a', 'b', 'c', '']);
assert.deepEqual('a1b2c3'.split(/(\d)/), ['a', '1', 'b', '2', 'c', '3', '']);    // capture group keeps separators
assert.deepEqual('one, two;three'.split(/[,;]\s*/), ['one', 'two', 'three']);

// ── 7. Escaping user input into a regex
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
assert.equal(new RegExp(escapeRe('a.b')).test('axb'), false);
assert.equal(new RegExp(escapeRe('a.b')).test('a.b'), true);
assert.equal(new RegExp(`^${escapeRe('(x)')}$`).test('(x)'), true);
const re = new RegExp('\\d+', 'g');                                               // string form: double the backslashes

// ── 8. The /g lastIndex trap
const g = /a/g;
assert.equal(g.test('a'), true);
assert.equal(g.test('a'), false);                                                 // lastIndex moved past the end
g.lastIndex = 0;
assert.equal(g.test('a'), true);
// Rule: don't reuse a /g regex object across test() calls; or reset lastIndex; or use match()/matchAll().

// ── 9. Flags
assert.equal(/HELLO/i.test('hello'), true);
assert.deepEqual('a\nb'.match(/^\w$/gm), ['a', 'b']);                            // m: ^$ per line
assert.equal(/a.b/.test('a\nb'), false);
assert.equal(/a.b/s.test('a\nb'), true);                                          // s: dot matches newline
assert.equal(/^.$/u.test('😀'), true);                                            // u: code points
assert.equal(/\p{L}+/u.test('héllo'), true);                                     // unicode property escapes

// ── 10. Common validators (good enough for interviews; say "RFC-complete email regex doesn't exist")
const isEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isHex = s => /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s);
const isIPv4 = s => /^((25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(25[0-5]|2[0-4]\d|1?\d?\d)$/.test(s);
const isInt = s => /^-?\d+$/.test(s);
const isSlug = s => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
assert.equal(isEmail('a@b.co') && !isEmail('a@b') && isHex('#fff') && isIPv4('192.168.1.1') && !isIPv4('256.1.1.1'), true);
assert.equal(isInt('-42') && !isInt('4.2') && isSlug('my-post-1') && !isSlug('My Post'), true);

// ── 11. Tokenizing (regex + sticky or matchAll)
const tokens = [...'3 + 42 * (x-1)'.matchAll(/\d+|[a-z]+|[-+*/()]/g)].map(t => t[0]);
assert.deepEqual(tokens, ['3', '+', '42', '*', '(', 'x', '-', '1', ')']);

// ── 12. ReDoS smell: nested quantifiers on overlapping classes, e.g. /(a+)+$/ — avoid; anchor and keep classes disjoint.
assert.equal(typeof re.exec, 'function');

console.log('ok: javascript/regex.js');
