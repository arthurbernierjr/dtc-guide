## The idea

Picture a row of letter beads on a string. You can pinch the two ends and walk your fingers inward, comparing beads as you go. If they match all the way to the middle, the string reads the same forward and backward. That is a palindrome, and the two fingers are the whole check.

You can also dump the beads into twenty-six cups, one cup per letter, and count. An anagram is two strings that fill the cups the same way. Add one for the first string, subtract one for the second, and every cup should end at zero. When the problem promises lowercase English letters, the cups are a length-26 array, indexed by `code - 97`, and `'a'.charCodeAt(0)` is 97. `String.fromCharCode(97 + i)` turns the index back into a letter.

The rest of the work is still beads and cups. Expand around a center to grow the longest mirrored stretch. Shrink a shared prefix until every word still starts with it. Count a run of the same bead and write the letter plus the count. Parse a bead at a time when the string is really a number or a Roman numeral hiding in costume.

## Why it matters

Strings invite you to chop them into arrays and sort every slice. That is sometimes the right key, and it is often a quadratic habit wearing a library call. You reach for this sheet when the problem says palindrome, anagram, lowercase letters only, substring, prefix, parse, or compress. The tell is "the characters themselves are the data." The tool is a scan, a cup count, or two fingers.

A plain scan is O(n). Expanding around every center to find the longest palindromic substring is O(n²). Grouping anagrams by sorting each word of length k is O(n · k log k).

## A small example

```javascript
function isPalindrome(word) {
  let lo = 0;
  let hi = word.length - 1;
  while (lo < hi) {
    if (word[lo] !== word[hi]) return false;
    lo += 1;
    hi -= 1;
  }
  return true;
}

const ok = isPalindrome('kayak');
```

The fingers start on the two `k`s, meet in the middle on `y`, and `ok` is `true`. One mismatch returns `false` and the walk stops. No second string is built.

## What the code below is doing

The sheet starts with the char-code arithmetic, so the cups have an address. Palindrome check is the two-finger walk, linear time and constant space. Valid anagram is the length-26 cup array, plus one, minus one, then a zero check. Reverse words splits on whitespace, drops the empty pieces, reverses the list, and joins. Longest palindromic substring tries `2n - 1` centers, the odd-length ones on a bead and the even-length ones between beads, and expands while the sides match.

Longest common prefix shrinks a candidate until every word `startsWith` it, linear in the total number of characters. Run-length compression counts a run and emits the character plus the count when the run is longer than one. First unique character counts, then walks again for the first index whose count is 1. Isomorphic strings keep two maps, `s` to `t` and `t` to `s`, and both directions have to agree, so the mapping is a bijection. Group anagrams sorts each word and uses that sorted string as the map key.

The parse sections are a single left-to-right scan. The atoi-style parser skips whitespace, reads a sign, reads digits, and clamps into the 32-bit integer range. Roman to integer adds the value, and subtracts when a smaller value sits immediately before a larger one, the way `IV` is four. The last section builds the KMP failure table, the longest proper prefix that is also a suffix, and then searches by jumping the pattern index through that table on a mismatch, so the text and the pattern are each scanned a linear number of times.

When you talk about it, say this: beads in a row, cups for letters, and a scan that decides one character at a time.
