## The idea

Picture a school office with a wall of lockers and a cash box on the counter. The clock is the time written on the board. A kid hands you a numbered slip, and that number is the time.

Both interview builds share one shape. One class. One map as the source of truth. Records are small objects you can add fields to later. A new level arrives as an optional trailing parameter or a new method. Old signatures stay, so level 1 tests still pass.

Time is an argument named `timestamp`. You never call `Date.now()` inside the class. The tests are deterministic and the timestamps increase from call to call. Returns match the spec: `''`, `'true'`, `'false'`, strings like `account1(500)`, and null versus an empty string. A rank of X descending with id ascending compares as `(a, b) => b.x - a.x || a.id.localeCompare(b.id)`.

The locker wall is an in-memory database: a key, then a field, then a value, plus an expiry and a way to photograph the wall and hang it back up later. The cash box is a bank: accounts, money moving, a ranking of who has sent the most, payments that wait until a due time, and a merge that keeps the old account id usable.

## Why it matters

The spec grows by level, and the old signatures stay. Level 1 is the basic reads and writes. Later levels add a scan or a ranking, then time, then a snapshot or a merge. Optional trailing parameters are how a method grows. Rewriting a level 1 parameter list fails the old tests.

A call to the real clock makes two runs disagree. Compare against the timestamp you were handed. A stored time less than or equal to that number is due.

An expired field is invisible on every read. One helper decides that from the timestamp, and a backup stores remaining lifetime so a later restore can rebuild the expiry.

Misses return the spec's miss value. A missing account returns null from a deposit. A missing field returns `''` from a get, unless that spec says null. The sort and its tie-break are part of the answer.

## A small example

```javascript
class TinyStore {
  #records = new Map();

  set(key, field, value, timestamp = 0) {
    if (!this.#records.has(key)) this.#records.set(key, new Map());
    this.#records.get(key).set(field, { value, writtenAt: timestamp });
    return '';
  }

  get(key, field) {
    const cell = this.#records.get(key)?.get(field);
    return cell ? cell.value : '';
  }
}

const store = new TinyStore();
store.set('user', 'name', 'Ada', 10);
const name = store.get('user', 'name');
```

`name` is `'Ada'`, and a missing field comes back as `''`. The sheet's database uses this nesting, key to field to cell, and puts an expiry on the cell.

## What the code below is doing

The database is one class. `#records` maps a key to a field map, and each field maps to `{ value, expiresAt }`. `expiresAt === null` means the field never expires. Otherwise it expires at that timestamp, and a read at exactly `expiresAt` is already dead. `#backups` is a list of `{ at, snapshot }` in time order.

Two helpers carry the rules. `alive` is "the cell exists and has not expired at now." `liveFields` returns the living pairs for a key. Level 1 is `set`, `get`, and `delete`. `set` grows an optional `ttl`: the expiry is `timestamp + ttl`, or null when no ttl was passed. `set` returns `''`. `get` returns the value, or `''` on a miss or an expiry. `delete` removes the field even if it is already dead, returns the string `'true'` only when it was alive, and drops the key when its field map is empty.

Level 2 lists living fields as `field(value)`, comma-separated and sorted by field name. `scan` uses an empty prefix. A missing key scans to `''`. Level 3 is the optional `ttl` checked on each read. Level 4 stores remaining ttl, `expiresAt - timestamp`, and returns the count of non-empty records as a string. Restore uses the latest backup at or before the requested time, or `''` when none exists, and rebuilds each expiry as that restore timestamp plus the remaining ttl.

The bank's `#accounts` map holds `{ balance, outgoing, createdAt, mergedInto }`. `#payments` holds `{ from, to, amount, cashbackPct, dueAt, status }`, with ids like `payment1`. `#acct` follows `mergedInto` so an old id still reaches the survivor.

Level 1 creates an account at balance 0 and returns false if the id exists. Deposit and transfer return the source balance, or null on a missing account, a non-positive amount, a transfer to the same account after merges, or insufficient funds. A transfer adds to `outgoing`. Level 2 ranks spenders who have not been merged away, outgoing descending, id ascending, formatted `id(outgoing)`.

Level 3 schedules a payment and moves the money when it comes due. Every timestamped operation first runs `processScheduledPayments`, ordered by due time, then id. If the sender can pay, move the amount, count it as outgoing, add `floor(amount * percent / 100)` back at once, and mark it processed. Otherwise mark it failed. Status is null unless the caller is the payer.

Level 4 adds balance and outgoing onto the survivor, zeros the other account, and sets `mergedInto`. The old id stays, and the ranking skips it.

Before you submit, match every return, including `''` versus null versus `'false'`, and the sort's tie-break. Expired rows stay invisible. A missing id returns the miss value. Earlier levels still pass. Due work runs at the top of any method that takes a timestamp.

When you talk about it, say this: one map is the source of truth, new levels add optional parameters or new methods, the timestamp is passed in, and expiry is decided lazily on read.
