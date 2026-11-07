## The idea

Picture a sheet of graph paper. Each square has a row and a column, `grid[r][c]`. Reading left to right, then down to the next row, is row-major order. That is the order the squares sit in memory, and it is the friendly way to walk them. Column-major walks down first.

A square's neighbors are the squares that share a side: down, up, right, left. You keep those four steps in one directions array and loop it, instead of writing four copies of the same bounds check. The check is the edge of the paper. A row or a column that falls off the sheet is not a square. Eight-direction neighbors include the corners, which is what a Game of Life cell counts.

Some questions treat the paper as a picture you turn or a map you search. Turning a square photo 90 degrees clockwise is a transpose, swapping `grid[r][c]` with `grid[c][r]`, then reversing each row. Searching the paper for land is a graph search where each square is a node and each shared side is an edge. When you visit a land square you sink it, so the next walk does not count that island again.

## Why it matters

You reach for this when the problem says an m by n grid, rotate an image, spiral, islands, flood fill, neighbors, cells, minutes until everything has spread, or search a sorted matrix. The bug is almost always an off-the-paper index, or a visit you forgot to mark, so the same island gets counted twice.

Any full walk of the paper is O(mn). Breadth-first and depth-first search over the squares are O(mn) too. Staircase search, on a matrix whose rows and columns are each sorted, is O(m + n).

## A small example

```javascript
function countIslands(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  function sink(r, c) {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== 1) return;
    grid[r][c] = 0;
    for (const [dr, dc] of dirs) sink(r + dr, c + dc);
  }
  let islands = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) {
        islands += 1;
        sink(r, c);
      }
    }
  }
  return islands;
}

const n = countIslands([[1, 1, 0], [0, 1, 0], [0, 0, 1]]);
```

Two clumps of `1`s share sides inside themselves and not with each other. `n` is `2`. Sinking a square to `0` is the mark that keeps the walk from coming back.

## What the code below is doing

The sheet opens with the four-direction array and an in-bounds helper, then row-major and column-major walks. Transpose writes `out[c][r] = grid[r][c]`, and it works for a rectangle. Rotate 90 clockwise in place is that transpose plus reversing each row. Counterclockwise is the transpose plus reversing each column. Reversing the rows and then transposing is the other route. Spiral order keeps four shrinking boundaries, top, bottom, left, and right, and it checks the bounds again before the bottom row and the left column so a single remaining row or column is not walked twice.

Set-matrix-zeroes uses row 0 and column 0 as the marker arrays, with a separate flag for column 0, so the extra space stays constant. Search in a fully sorted matrix binary-searches the flat index, O(log(mn)). Search when each row and each column is sorted starts at the top-right corner and walks like a staircase: too big moves left, too small moves down, O(m + n).

Number of islands, flood fill, and max island area are the graph searches. Islands and flood fill sink or recolor as they go. Flood fill bails out when the new color is already the old color. Max area returns `1` plus the sum of the neighbor calls. Rotting oranges is multi-source breadth-first search: every rotten orange is queued before the clock starts, each layer of the queue is one minute, and fresh oranges left at the end mean the answer fails. Diagonal traversal groups squares that share `r + c` and flips direction with the parity of that sum. Game of Life counts eight neighbors and stores the next state in an extra bit so the board stays in place. Pascal's triangle sets the edges to 1 and fills each inner cell from the two parents above it. Word search is grid depth-first search with backtracking: mark the cell, try four directions, restore it, at O(mn · 3^L).

When you talk about it, say this: row and column, a directions array, an in-bounds check, and whether you are turning the paper or searching it.
