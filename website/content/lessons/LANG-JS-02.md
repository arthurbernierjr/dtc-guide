## The idea

Think of `sort` like a librarian filing books by the letters printed on the spine. Hand over volumes 10, 2, and 1. The librarian reads the labels as words: "1", then "10", then "2". Volume 10 lands between volume 1 and volume 2 because the character "1" comes before the character "2". Nobody asked which number is larger. The default question is which string comes first.

That default is the whole bug. `sort()` with no comparator converts each element to a string and orders those strings by UTF-16 code units. Lexicographic order. The fix is a comparator, a function `(a, b)` you pass in, the rule card on the cart. Return a negative number and `a` goes on the shelf first. Return a positive number and `b` goes first. Return `0` and those two keep the order they already had. For numbers, `(a, b) => a - b` is ascending. `(a, b) => b - a` is descending.

The librarian rearranges the shelf you handed them. `sort` and `reverse` mutate the array and return that same array. If the arrival order still matters, copy first with `[...books].sort(cmp)`. On Node 20 and later, `toSorted` does the copy inside the method. Since ES2019 the algorithm is a stable sort, TimSort. Equal elements keep their input order. Two books with the same call number do not trade places. The cost of a full sort is O(n log n).

## Why it matters

Single-digit samples hide this. The shelf goes wrong the moment a 10 shows up, while the small tests still pass. Any time you order scores, prices, indexes, or timestamps, pass a comparator.

Strings have a second spine problem. Default sort uses code units, so `'C'` files before `'a'`, because uppercase letters sit earlier in the chart. `localeCompare` asks the language for the order a reader expects. Pass `{ numeric: true }` and `'item2'` files before `'item10'`. A hand-rolled `a < b` test is back to code units. Use it when you mean code units. Use `localeCompare` when you mean words.

Real shelves have more than one label. A leaderboard is score descending, then name ascending when the scores tie. Chain the comparisons with `||`. A comparator result of `0` is falsy, so the next key runs only on a tie. That is a multi-key sort, a tie-breaker. If the key is expensive, compute it once. Map each word to a note `{ w, k: w.length }`, sort the notes, then map back to the words. That decorate-sort-undecorate pass is the Schwartzian transform.

Booleans sort after `Number` turns them into 0 and 1. A custom order is a lookup such as `{ high: 0, medium: 1, low: 2 }`. Map entries are pairs, so you sort `[key, value]` the same way. Top-N is a sort plus `slice`. The k-th smallest is an index into that sorted copy. A linear quickselect is the name to remember if someone asks for the element without a full sort. Numbers stored as strings need `Number(a) - Number(b)`. Subtraction already coerces, so a mix of `3` and `'2'` lands in numeric order under `(a, b) => a - b`. Asking whether a list is already sorted is one forward pass with `every`.

## A small example

```javascript
const arrivals = [10, 2, 1];

function byNumber(a, b) {
  return a - b;
}

const bySpine = [...arrivals].sort();
const bySize = [...arrivals].sort(byNumber);
```

`bySpine` is `[1, 10, 2]`. The librarian read the spines as words. `bySize` is `[1, 2, 10]`, because `byNumber` is the rule card: negative means `a` first. `arrivals` is still `[10, 2, 1]`. The sort ran on a copy. Hand the original array to `sort` and the cart itself gets rearranged.

## What the code below is doing

The code below is ten sections, and the first one is the bug.

Numbers show the string sort of `[10, 9, 1, 100]`, then ascending and descending comparators, and the contract: negative, positive, zero. The copy section spreads before sorting, and the comment names `toSorted` on engines that have it. Strings show code-unit order on `'b'`, `'a'`, and `'C'`, then `localeCompare`, an explicit `<` comparison, and numeric `localeCompare` so `'item2'` precedes `'item10'`.

Multi-key sorting chains with `||`: score descending, then name ascending, then a fresh sort by age. The people array is mutated by those sorts, which is why the copy lesson sits above them. Derived keys decorate each word with its length, sort, and undecorate. Booleans, a priority lookup, and Map entries sorted by count then key come next. Top-N takes the first two after a descending sort. The second-smallest is index 1 of an ascending sort. Stability sorts `{ k, v }` records and keeps `'x'` ahead of `'z'` when the keys tie. Stringy numbers and a mixed array go through subtraction. The last section is `isSorted`, one `every` pass, true for `[1, 2, 2, 3]` and false for `[2, 1]`.

The trap the header names as the rule: `sort()` with no comparator converts every value to a string. Always pass one. `sort` and `reverse` also change the array in place and return it. Stable since ES2019 means ties keep input order. Say comparator, stable sort, multi-key, tie-breaker, O(n log n), sort-then-slice for top-N, and `localeCompare` for strings.
