## The idea

Think of a regular expression as a stencil you lay over a sentence. The holes are the rules for which characters show through. `\d` fits a digit, `\w` a word character, `\s` whitespace. `\D`, `\W`, and `\S` are the opposites. `[a-z]` is a hole you cut yourself. `[^abc]` fits anything except those letters. A dot fits any character except a newline.

Quantifiers say how many times a hole repeats. `*` is zero or more, `+` is one or more, `?` is zero or one, `{n}` is exactly n, `{n,}` is n or more, `{n,m}` is a range. A greedy stencil stretches as far as it can while the rest of the pattern still matches. A lazy one adds a `?`, so `.*?` stops at the first fit. On `<b>x</b><b>y</b>`, greedy `<b>.*</b>` covers both tags. Lazy `<b>.*?</b>` covers only the first.

Anchors pin the stencil. `^` is the start, `$` is the end, `\b` is the edge of a word. With the `m` flag, `^` and `$` mean each line. A capture group `(x)` is a labeled hole. `(?:x)` groups without a label. `(?<y>x)` names the label, and you read it on `.groups`. `\1` means the same text that fell through hole 1, a backreference. Lookahead `(?=x)` and `(?!x)`, and lookbehind `(?<=x)` and `(?<!x)`, peek without taking those characters. A price can require a `$` and still leave the dollar sign out of the match.

Flags change the stencil. `g` finds every fit. `i` ignores case. `m` is multiline. `s` lets a dot cross a newline. `u` is Unicode, so one emoji is one character and `\p{L}` means a letter. `y` is sticky: the next search must start at `lastIndex`.

`test` answers yes or no. `match` with `g` returns every full match, or `null`. Without `g` you get the full text, the groups, and `.index`. `matchAll` needs `g`. `replace` takes a string pattern (`$1`, `$<name>`) or a function. `split` keeps separators when you capture them. `exec` with `g` remembers its place.

## Why it matters

The trap is `lastIndex`. A `/g` regex remembers how far it got. `/a/g` tested on `'a'` is true the first time and false the second, because the stencil starts past the end. Set `lastIndex` back to `0`, or stop reusing one global regex with `test`. `match` and `matchAll` are the other way through the sentence.

Characters that belong to the stencil language are the other trap. `. * + ? ( ) [ ] { } | ^ $ \ /` are holes and pins. If you build `new RegExp` from raw user text, `a.b` also fits `axb`. Escape those characters first. Nested quantifiers on overlapping classes, such as `(a+)+` at the end, can try a ridiculous number of stretches. That is catastrophic backtracking, the ReDoS smell. Anchor the pattern and keep the classes apart. A complete email regex does not exist.

Say greedy versus lazy, capture group, backreference, lookaround, anchored, and ReDoS.

## A small example

```javascript
const greedy = 'axxxaaxxxa'.match(/a.*a/)[0];
const lazy = 'axxxaaxxxa'.match(/a.*?a/)[0];
const titled = 'hello world'.replace(/\b\w/g, (ch) => ch.toUpperCase());
const amounts = 'price: $42, cost: $7'.match(/(?<=\$)\d+/g);
```

`greedy` is the whole `'axxxaaxxxa'`. `lazy` stops at `'axxxa'`. `titled` is `'Hello World'`. `amounts` is `['42', '7']`: digits after a `$`, with the dollar sign left in place.

## What the code below is doing

`test` checks a whole `^\d{3}-\d{4}$` string. `match` with `g` pulls every digit run, and returns `null` when nothing fits, so guard with `?? []`. Without `g`, `'key: value'` comes back as the full match, two groups, and `.index`. A named date exposes `y`, `mo`, and `d` on `.groups`. That object has a null prototype, so the sheet spreads it before comparing. `matchAll` on `'a=1;b=2'` needs `g`.

`replace` turns dots into dashes, swaps two words with `$2, $1`, rewrites a named date, wraps digit runs by length, capitalizes at word edges, converts snake case and camel case, and collapses whitespace after `trim`.

Greedy versus lazy is the two `<b>` matches. Lookaround takes digits after `$`, letters followed by a digit, a password built from lookaheads, and thousands commas.

Backreferences match a doubled letter, collapse a run to one character, and require the closing quote to be the same mark as the opening quote.

`split` on digits drops them and leaves a trailing empty string. A capturing split keeps the separators. Commas and semicolons, plus optional space, split a short list.

User text is escaped by putting a backslash in front of every metacharacter. `a.b` then matches `a.b` and misses `axb`. A string-built `'\\d+'` is the digit class.

The same `/a/g` tests true, then false, then true again after `lastIndex = 0`. Do not reuse a global regex across `test` calls unless you reset that index.

`i` matches `HELLO` to `hello`. `m` lets `^\w$` hit both lines of `'a\nb'`. A dot misses a newline unless `s` is set. `u` treats an emoji as one character, and `\p{L}` matches the letters in `héllo`.

The validators are a rough email, a hex color, an IPv4 address whose parts stay in range, an optional-minus integer, and a lowercase slug joined by single hyphens. `'256.1.1.1'`, `'4.2'`, and `'My Post'` fail.

Tokenizing walks `'3 + 42 * (x-1)'` with `matchAll`. Sticky `y` is the other way to resume at `lastIndex`. Nested quantifiers on overlapping classes are the ReDoS smell.
