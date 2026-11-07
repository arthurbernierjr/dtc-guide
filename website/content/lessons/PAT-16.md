## The idea

Picture a remote control pointed at a playlist. You press next. A song comes out. You press next again. You never open the speaker to see whether the songs live in one list, on three discs, or get fetched when you press the button. An empty disc is skipped. When nothing is left, next stays done. The only protocol is next, and done.

An iterator is that remote. It gives you the elements of a collection one at a time without exposing how the collection is stored. Callers want `for...of` over a paginated API, a tree, a linked list, or a ring buffer. They should not care that the pages are arrays, that one page is empty, or that the next page is a network call. The iterator's `next` returns `{ value, done }`. The concrete iterator holds the cursor. The aggregate exposes `createIterator`, and in JavaScript that hook is `Symbol.iterator`. Spread, destructuring, and `Array.from` all press the same button.

## Why it matters

The bug this pattern prevents is a caller that knows your storage. If the orders are pages, and the caller loops page index and item index itself, every caller relearns that an empty page is not the end. Move the orders into a map, or start computing them lazily, and every loop breaks. Give them the remote. The storage can change. The button stays.

You already press this button. `for...of`, spread, destructuring, `Array.from`, and `Promise.all` all drive `Symbol.iterator`. Map, Set, and String each hand out iterators. A generator, `function*`, is a concrete iterator whose cursor is the suspended function. `for await` walks async iterators, which is how you read Node streams, readline, and a directory handle. Database cursors, paginated SDK helpers, and Node's map, filter, and take helpers are the same remote pointed at a server.

A visitor pushes an operation into the structure and the structure calls you. An iterator pulls elements out, one at a time, and you decide when to ask. A composite is the tree. An iterator is how you walk it. An observer pushes items at you. With an iterator, you pull. Async iterators blur that line, and you still pull.

## A small example

```javascript
function remote(discs) {
  let disc = 0;
  let track = 0;
  return {
    next() {
      while (disc < discs.length) {
        const songs = discs[disc];
        if (track < songs.length) {
          const song = songs[track];
          track += 1;
          return { value: song, done: false };
        }
        disc += 1;
        track = 0;
      }
      return { value: undefined, done: true };
    },
  };
}

const player = remote([['intro'], [], ['chorus']]);
const first = player.next();
const second = player.next();
```

`first.value` is `intro`. `second.value` is `chorus`. The empty disc in the middle never became a song. The caller did not write a loop over discs.

## What the code below is doing

The sheet shows the same idea twice.

The first shape uses classes so the book names are visible. `PagedOrders` is the concrete aggregate. Its storage is an array of pages. `createIterator` builds a `PagedOrdersIterator`, and `Symbol.iterator` calls that, so the collection itself works with spread. The iterator keeps the page index, the index inside the page, and a fetch count. `next` walks pages. The first time it looks at a page it counts a fetch, which stands in for a network call. An empty page increments the page and resets the index, so the caller never sees it. Past the last page, `next` returns `done: true` and stays there. The iterator is also iterable, by returning itself, so you can spread a cursor you already hold.

The sample pages are two orders, an empty page, and one more order. The first three `next` calls yield ids 1, 2, and 3. The fourth is done, and the fifth is still done. Fetches equal 3, because the empty page was opened. Spread on the aggregate maps to ids 1, 2, and 3, using a fresh iterator rather than the exhausted cursor. Destructuring takes the first order and leaves a rest array of length 2. A brand-new iterator that only calls `next` once has a fetch count of 1. The empty page and the last page stay untouched.

The second shape lets the cursor live in a generator. `OrderHistory` stores orders per customer. Its default iterator walks each customer's list from the end, so the newest order comes first, and customers come in insertion order. Ada's `a2` and `a1`, then Bob's `b1`. `byCustomer` yields that customer's list in the stored order, oldest first, and a missing name yields nothing. `totals` walks the default iterator and yields each total. The three totals sum to 35. `ids` is an infinite generator. `take` pulls only as many as you ask, so three ids are `ord-1`, `ord-2`, and `ord-3` without building an endless array. A second generator remembers its place: the next call is `inv-1`, and the one after is `inv-2`.

The async generator `fetchAllPages` is the remote pointed at a server. It asks for a page, yields every item, and follows `next` until the cursor is null. The fake API returns 1 and 2 with a cursor, then 3 with a null cursor. `for await` collects `[1, 2, 3]`. Node streams work the same way.

When you talk about it, say this: one protocol, next and done, so any collection works with for...of, spread, and destructuring.
