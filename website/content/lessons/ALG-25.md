## The idea

Picture a row of light switches, thirty-two of them, each on or off. That row is an integer. Bitwise operators in JavaScript work on 32-bit signed integers, so switch 31 is the sign, and `1 << 31` comes back negative. A wider row needs `BigInt`, or plain arithmetic with `Math.floor`.

Four moves cover the row. Test switch i by shifting it down to the end and masking with 1. Set it by OR-ing a 1 into that position. Clear it by AND-ing with the inverse of that 1. Toggle it by XOR-ing that 1. XOR is the useful one to feel in your hands: flip the same switch twice and it is back where it started. Two copies of a number cancel. One copy remains. `x ^ x` is 0, and `x ^ 0` is `x`.

`n & (n - 1)` turns off the lowest switch that is on. Loop that and you count the on switches, one per set bit. That is Brian Kernighan's trick. `n & -n` isolates that same lowest switch. A power of two is a row with exactly one switch on: `n > 0` and `n & (n - 1)` is 0.

## Why it matters

You reach for the switches when the problem says "without using plus or times," a value that appears once while everything else appears twice or three times, the number of 1 bits, a power of two, the subsets of a small set, or an XOR. You also reach for them when a visited-set would be natural and n is small enough to pack into the bits of one integer, about twenty or fewer.

Each operation on a 32-bit int is O(1). Kernighan's loop is proportional to the number of set bits. Enumerating subsets by walking every mask is O(2^n · n).

## A small example

```javascript
function singleNumber(nums) {
  let acc = 0;
  for (const x of nums) acc ^= x;
  return acc;
}

const lone = singleNumber([4, 1, 2, 1, 2]);
```

`1` cancels with `1`, `2` cancels with `2`, and `4` has nothing to cancel with. `lone` is `4`. The whole row of numbers collapses in one pass and constant extra space.

## What the code below is doing

The sheet opens with the operators and the idioms: AND, OR, XOR, NOT (which is `-a - 1`), left shift, arithmetic right shift that keeps the sign, and logical right shift `>>>` that fills with zeros. Then test, set, clear, toggle, clear-lowest, isolate-lowest, and the power-of-two test. The 32-bit trap is asserted: `1 << 31` is negative, `>>> 0` reinterprets it as unsigned, and `1n << 40n` is how you leave the 32-bit row.

Single number XORs the whole array. Pairs cancel, the loner remains, and negatives are fine. Single number II, where every other value appears three times, counts set bits per position modulo 3 and rebuilds the answer, using `| 0` so the sign bit behaves. That is O(32n). Number of 1 bits is the Kernighan loop, `n &= n - 1` once per set bit. Counting bits from 0 through n is a small dynamic-programming fill: `bits[i] = bits[i >> 1] + (i & 1)`, or one plus the count after clearing the lowest set bit. Reverse bits shifts a result left, ORs in the lowest bit of n, and logically shifts n right, thirty-two times.

Missing number XORs every index from 0 through n with every value. The matched pairs cancel and the hole remains. Sum of two integers without `+` uses XOR for the sum-without-carry and `(a & b) << 1` for the carry, repeating until the carry is 0, which finishes within 32 rounds. Subsets via bitmask walk every mask from 0 to `2^n - 1` and include `nums[i]` when bit i is set. The visited-set section packs a path into one integer: `visited | (1 << i)` marks i, and the mask equals `(1 << n) - 1` when every bit is on. The last note is the guard for values past `2^31`: bitwise ops truncate, so you switch to `Math.floor` or `BigInt`.

When you talk about it, say this: a row of switches, XOR cancels pairs, and remember the row is 32 bits wide unless you asked for bigger.
