## The idea

Picture a set of Russian dolls. You open the outer doll and there is a smaller doll inside, the same shape, the same job. You open that one too. Eventually you reach the tiny solid doll that does not open. That solid doll is the base case. Every larger doll is the recursive case: make the problem smaller, then trust that the doll inside already knows how to finish the job.

In code a function is defined in terms of a smaller instance of itself. The call stack is the line of open dolls sitting on the table. Each call is a frame. The depth is how many dolls are open at once. You do not re-solve the inner doll while you are holding it. You wait for it to come back with an answer, then you do your one piece: add a digit, append a character, move one disk.

The rule is two lines. The base case returns directly. The recursive case makes the input smaller and trusts the sub-result. If the input never shrinks, you never reach the solid doll, and the table fills until it tips over.

## Why it matters

Anything nested has this shape: a tree, a list of lists, a value defined by smaller values of the same kind, a divide-and-conquer split, a flatten, a deep copy. "All combinations" often starts here too, though the search version of that lives with backtracking. You reach for recursion when the problem is already a smaller copy of itself.

Time is the number of calls times the work inside each call. Space is the deepest the call stack gets, which is the tallest stack of open dolls, even when the total number of dolls you ever open is larger. A naive Fibonacci opens an exponential number of dolls, on the order of φ to the n, because it reopens the same inner dolls over and over. A memo map writes each answer down once and brings that back to linear time and linear space.

## A small example

```javascript
function openDolls(doll) {
  if (doll.inside === null) return 1;
  return 1 + openDolls(doll.inside);
}

const set = { inside: { inside: { inside: null } } };
const count = openDolls(set);
```

The solid center returns 1. Each outer doll adds itself to whatever the inner doll returned. `count` is `3`. The function never inspects a doll two levels down. It trusts the recursive call.

## What the code below is doing

The sheet starts with that anatomy: base case, then a smaller input, then trust. Fast exponentiation is divide and conquer on the exponent. You square `x^(n/2)` and multiply by `x` one extra time when `n` is odd, so the depth is logarithmic. Sum of digits is the last digit plus the sum of the rest. Reverse is the reverse of the rest, then the first character. As a demo that is fine; string concatenation makes the time quadratic even though the depth is linear.

Flatten walks a nested array and pushes a value when it is not an array. Deep clone maps arrays recursively, rebuilds objects from their entries, and returns primitives as they are. The sheet notes that a built-in structured clone covers more kinds of values, including dates and cycles, and still skips functions. Tower of Hanoi is the three-step doll: move `n - 1` to the spare peg, move one disk to the target, move `n - 1` from the spare onto the target. That is O(2^n) moves.

Fibonacci is shown twice, naive and memoized, so you can see the same dolls recomputed and then computed once. The next section turns the call stack into an explicit stack you push and pop yourself. Same cost, and you can see the frames. Tail calls are in the language spec. V8 still grows the stack on a tail-recursive loop, so a tail call is a doll you still have to hold. The depth probe on a default Node stack lands roughly ten to twelve thousand frames, then a `RangeError`. A linked list of a hundred thousand nodes will blow up if you reverse it recursively. Mutual recursion is two functions calling each other, `isEven` and `isOdd`, each with its own base case.

When you talk about it, say this: name the base case, show that each call gets smaller, and trust the inner doll.
