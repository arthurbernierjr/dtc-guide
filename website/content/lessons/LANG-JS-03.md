## The idea

Think of a string like a row of letter tiles glued to a stick. You can read tile 0. You can count the tiles with `length`. You cannot pry one tile off and glue a different letter down. `text[0] = 'h'` leaves the stick exactly as it was. Any change is a new stick: `'h' + text.slice(1)`.

That is what immutable means. `slice`, `toLowerCase`, `trim`, `replace`, `padStart`, and `repeat` each return a new string. The old stick stays put, so a helper cannot rewrite the text you passed in. Tiles are indexed from 0. `s.at(-1)` reads from the right end. `slice(start, end)` copies a window. The end index is excluded, and a negative index counts backward from the last tile. `slice` is the cutter to reach for when the indexes are negative.

Each tile also has a numeric code. `'a'` is 97, `'A'` is 65, `'0'` is 48. `charCodeAt` reads the code of one tile. `String.fromCharCode` presses a code back into a tile. A Caesar shift is arithmetic on that code, wrapped around 26 so it stays a lowercase letter. Comparisons with `<` and `>` use those codes too. That order is lexicographic at the code-unit level. `'B' < 'a'` is true, because 66 comes before 97.

## Why it matters

Names, dates, and "does this sentence read the same backward" are all sticks of tiles.

`replace` changes the first match and stops. `'v1.2.3'.replace('.', '-')` is `'v1-2.3'`. `replaceAll`, or a regex with the `g` flag, walks the whole stick. In a regex, a bare `.` is a wildcard, any character, so the pattern escapes it: `/\./g`. `join()` with no argument inserts commas. `['v1', 'v2'].join()` is `'v1,v2'`. Pass `''` when the tiles should sit tight against each other. `split(',')` keeps empty pieces, so `'a,b,,c'` has four parts, one of them `''`.

`localeCompare` asks the locale for dictionary order. `toLowerCase` is the ASCII case change. Full case-folding is a bigger job: the run checks that `'Straße'.toLowerCase()` and `'strasse'` are different strings. Say case-fold for the language's idea of the same letter.

The stick is stored as UTF-16 code units. One emoji can occupy two units, so `'😀'.length` is 2. Spread walks code points: `[...'😀'].length` is 1. `split('')` walks units and can tear a character in half. A combining accent can make `'é'` look like one letter and measure as two until you `normalize`. NFC packs the mark back into a single character. NFD pulls it apart. Compare text after you normalize it, when the problem mentions accents or emoji.

Building with `+=` in a loop is fine in this engine, and so is an array of pieces plus `join`. Template literals interpolate and can span lines. Once either side of `+` is a string, the result is a string, so `` `${1}${2}` `` is `'12'`. `toFixed` returns a string of digits.

## A small example

```javascript
const sign = 'Cafe';

function retitle(label, first) {
  return first + label.slice(1);
}

const next = retitle(sign, 'c');
const dots = 'v1.2.3';
const firstOnly = dots.replace('.', '-');
const allOfThem = dots.replace(/\./g, '-');
const csv = ['v1', 'v2'].join();
```

`sign` is still `'Cafe'`. `next` is `'cafe'`, a new stick, because the glued tiles would not move. `firstOnly` is `'v1-2.3'`. `replace` stops after the first dot. `allOfThem` is `'v1-2-3'`, because the pattern escapes the dot and carries the `g` flag. `csv` is `'v1,v2'`. `join` with no separator uses a comma.

## What the code below is doing

The code below is ten sections on one idea: every operation returns a new string.

Basics cover `length`, index access, `at(-1)`, `slice` with a negative window, `indexOf`, `lastIndexOf`, `includes`, `startsWith`, `endsWith`, case change, `trim`, `repeat`, `padStart`, `padEnd`, and `concat`. Split and join show empty pieces kept, a whitespace regex, a limit argument, spread versus `split('')`, the default comma, and a reverse-by-words one-liner. Build and reverse do spread-then-reverse-then-join, and a loop that prepends each character. A comment notes that `+=` in a loop is fine here.

Char codes read `'a'`, `'A'`, and `'0'`, build a letter with `fromCharCode`, run a Caesar `shift`, and test digit, letter, and alphanumeric with ranges and a small regex. A 26-slot array counts lowercase frequencies. Replace shows first-only, `replaceAll`, an escaped dot, a function replacer that capitalizes words, and `$1` style group refs that flip `year-month-day` into `day/month/year`.

Compare checks `'B' < 'a'`, `localeCompare`, ordinary `===`, and the `Straße` case-fold example. Template literals do a plural and a multi-line string. Number to string and back covers `String`, `toString(2)`, `Number`, `parseInt` with a radix, `toFixed` as a string, and concatenation of `'1'` and `'2'`.

Classic patterns: a palindrome that lowercases and strips non-alphanumerics, an anagram check by sorting code points, a vowel count that treats a `null` from `match` as no vowels, capitalize, a whitespace split, and a run-length compress. Unicode notes close the run: emoji length 2 versus one code point, and `normalize('NFD')` on `'é'`.

The header's trap, in one breath: strings are immutable. `join()` defaults to a comma. `replace` changes the first match only. A bare `.` in a regex is a wildcard. `<` and `>` compare code units, which is why `'B' < 'a'`. Say immutable, code unit versus code point, lexicographic, and case-fold.
