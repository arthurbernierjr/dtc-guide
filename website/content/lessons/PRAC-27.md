## The idea

Picture four kids on a playground, each holding some strings. A kid is "odd" when they are holding an odd number of strings. You may tie at most two new strings. A string always joins two different kids, and you may not tie a second string where one already hangs. Every new string flips exactly two kids: the two you just joined. Tie both ends of a path of two strings to the same middle kid, and that middle kid flips twice and lands back on the parity they started with.

This is a parity problem on an undirected simple graph. One new edge flips the degree parity of exactly its two endpoints. The handshake lemma says the number of odd-degree vertices is always even, so you will never see 1, 3, or 5 odds. Two edges touch at most four vertices, and a vertex you touch twice nets back to zero. Reading the adjacency matrix is O(n²). After that the decision is O(n).

The graph arrives as a matrix, boolean or 0/1, symmetric, diagonal empty, n at most 50. The question is whether you can add zero, one, or two edges, with no self-loops and no second copy of an edge, so every degree becomes even.

## Why it matters

The slow story is "try every pair of missing edges." At n = 50 that is a pile of combinations, and it hides the structure. The fast story looks only at who is odd.

Zero odds means you are done. Add nothing. Two odds means one edge between them fixes both, if that edge is free. If they are already joined, one more edge between them is illegal, so you borrow a middle vertex w that is tied to neither. The edges u–w and w–v flip u and v once each, and flip w twice, so w stays even. If no such w exists, the answer is no. Four odds means you need both edges, and they have to pair the four vertices into two couples. There are three ways to pair four people. If any of those pairings is two free edges, take it. Six or more odds cannot be fixed. Two edges do not have enough flips.

That case split is the whole problem. Everything else is "is this edge missing?" and "did I count the odds correctly?"

The matrix will not always be numbers. A cell can be `true` or `false`. Summing a row still works, because `true` coerces to 1. The emptiness test has to be falsy, `!matrix[u][v]`. Writing `matrix[u][v] === 0` treats `false` as occupied, since `false === 0` is false, and you will refuse edges that are free.

## A small example

```javascript
function oddVertices(matrix) {
  const odd = [];
  for (let i = 0; i < matrix.length; i++) {
    let degree = 0;
    for (const cell of matrix[i]) degree += cell ? 1 : 0;
    if (degree % 2 === 1) odd.push(i);
  }
  return odd;
}

const path = [
  [0, 1, 0],
  [1, 0, 1],
  [0, 1, 0],
];
const odds = oddVertices(path);
```

`odds` is `[0, 2]`. The ends of a two-edge path are the odd ones. They are not yet joined, so one new edge, 0–2, makes every degree even. The middle vertex was even and you never touched it.

## What the code below is doing

The function walks each row, sums the degree, and collects the odd vertices. Then it branches on how many it found.

Zero odds returns true. A single vertex with no edges. Three isolated vertices. A triangle, where everyone has degree 2. A complete graph on five vertices, where everyone has degree 4. Nothing to add.

More than four odds returns false before any edge is considered. Three disjoint edges on six vertices leave six odds. A complete bipartite graph with two groups of three, every degree 3, does the same. Two new edges cannot flip six parities.

Two odds takes the direct edge when it is free. A path of four has odd ends that are not adjacent, so one edge closes it. When that edge already exists, look for a middle w free toward both. Two vertices with only that one edge have no middle, so the answer is false. Three vertices with the odds already joined leaves the third free on both sides, and two edges through it work. A complete graph on four vertices minus the odds' edge blocks every middle. A middle that is free on only one side also fails. One last case keeps an early return honest: the first candidates are blocked, and only the final vertex is a legal middle.

Four odds tries the three perfect matchings. Two disjoint edges can be cross-matched along edges that do not exist yet. A star, one center and three leaves, uses an existing edge in every pairing, so it fails. A complete graph on four vertices has nothing free. An even bystander does not change the four odds. One case leaves only the third pairing free, so the checks are a real or across all three.

The checks at the bottom of the sheet rerun a two-odd success and a four-odd failure with numeric 0 and 1, so a solution that only understands booleans gets caught. The harness copies the matrix before each call, so a solution that writes into the grid cannot poison the next case. Each case is named after the branch it exercises. The first failure name tells you which branch is missing.

When you talk about it, say this: it is parity. An edge flips two vertices, the handshake lemma keeps the odd count even, two edges fix at most four odds, and the logic after you read the matrix is O(n).
