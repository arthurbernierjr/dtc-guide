## The idea

Picture a maze drawn on paper. You stand at the entrance with a pencil. You step into a corridor, draw a line behind you, and keep going. When you hit a wall, you walk back to the last corner and erase that last step. Then you try the next corridor. You are building a path, exploring it, and undoing the choice that failed.

That is backtracking. The maze is a decision tree. Each corner is a choice: include this number or skip it, place this queen or try the next column, add an open parenthesis or a close one. You push the choice onto a path, recurse, and when that call returns you pop the choice off. Choose, explore, un-choose. The partial path is the pencil line. The pop is the eraser.

The template is one function. If the path is a finished answer, copy it into the results and return. Copy, because the path array will be mutated on the way back out. Then for each legal choice, skip the ones that break a rule, mark the choice, recurse, and unmark it. Pruning is refusing a corridor you can already see is a dead end, before you walk it.

Combinations and subsets pass a start index, so order does not matter and you never reuse an earlier item. Permutations pass a `used` array, so every item is considered at every position. When the input has duplicates, sort first, then skip a value that matches the one you just skipped at this same level.

## Why it matters

You reach for this when the problem says "all possible," "generate all," combinations, permutations, subsets, "place N" of something, "valid arrangements," or "partition into." The constraint is small. Once n is past about twenty, the maze is too big to walk.

The cost follows the shape of the maze, and it is output-sensitive: you pay for every answer you write down. Subsets are O(2^n · n). Permutations are O(n! · n). Combinations of k out of n are O(C(n, k) · k).

## A small example

```javascript
function subsets(nums) {
  const out = [];
  const path = [];
  function walk(start) {
    out.push(path.slice());
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      walk(i + 1);
      path.pop();
    }
  }
  walk(0);
  return out;
}

const kits = subsets([1, 2]);
```

`kits` holds `[]`, `[1]`, `[1, 2]`, and `[2]`. `path.slice()` is the copy. `path.pop()` is the walk back to the last corner. The start index is why `[2, 1]` never appears.

## What the code below is doing

The sheet prints the template first: goal, prune, choose, explore, un-choose, plus the start-index rule, the `used[]` rule, and the sorted-duplicate skip. Subsets walk that template, include-or-not from a start index. Subsets II sorts and skips `a[i] === a[i - 1]` when `i > start`. Permutations swap in a `used` flag and stop when the path length equals n. Permutations II sorts and skips a duplicate whose previous twin is unused, so the same value is only taken in order.

Combinations C(n, k) keep a start index and prune when the remaining numbers are fewer than you still need. Combination sum allows reuse by recursing at the same index, and breaks early once a sorted candidate overshoots the target. Combination sum II uses each element once and skips equal siblings. Generate parentheses adds `'('` while opens are under n, and `')'` while closes are under opens. That count is the Catalan shape, on the order of 4^n over square root of n. Letter combinations of a phone number take one letter per digit, per level, O(4^n · n).

N-Queens places one queen per row and keeps sets of used columns, diagonals `r - c`, and anti-diagonals `r + c`. Word search is the maze on a grid: mark a cell, try four directions, restore the cell on the way out, O(mn · 3^L) for a word of length L. Palindrome partitioning cuts at every end index where the slice is a palindrome. Sudoku finds an empty cell, tries the digits that survive the row, column, and box, and undoes the digit when the recursive call fails.

When you talk about it, say this: choose, explore, un-choose, and copy the path when it is done.
