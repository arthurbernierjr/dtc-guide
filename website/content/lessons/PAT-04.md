## The idea

Picture a permission slip on the teacher's desk. She fills it in once: the trip, the fee, the line that says bring lunch. She does not retype that form for every kid. She photocopies the finished slip and writes one kid's name on the copy. If Sam scribbles "bus 4" on his copy, the master on the desk still says only "bring lunch." Each copy is a new slip.

A prototype is that master slip. You configure one instance, then you copy it instead of constructing another one from scratch. The copy is a new object. You tweak the copy. The client calls `clone`, not `new`, when it wants another one. You copy when the starting point is a finished setup you already paid for: currency, tax, a default line, a footer.

Copying has a catch, and the slip shows it. A real photocopy has its own sticky note. A sloppy copy duplicates the top page and leaves the stapled second page shared, so a mark on that page hits the master too. A see-through cover laid on the original is not a copy at all. Change the fee on the master and the cover shows the new fee, because it was looking through, not holding its own paper.

## Why it matters

The bug this pattern prevents is paying the setup cost over and over, or worse, handing two customers the same sheet. An invoice template for the EU already has euros, a tax rate, a footer, and a support line. Clone it per customer, add that customer's seats to the copy, and the next customer's clone still starts from the master. If the line items were shared, one customer's price edit would change the template and every later invoice.

You already use this without the textbook name. JavaScript objects delegate through a prototype chain, and `Object.create` sets that link on purpose. `structuredClone` deep-copies data, including dates, maps, sets, and nested arrays. Spread is the everyday copy-then-tweak in reducers and React state updates. `new Map(existingMap)`, `Buffer.from`, `Request.clone`, and `Response.clone` copy a value you already have. Document and email templates get cloned per recipient. Immer's `produce` copies on write.

A factory method is the neighbor that builds fresh with `new`. A prototype starts from an instance that already exists and copies it. A builder assembles a thing step by step from empty parts. A prototype starts from a finished object. A memento snapshots state so you can restore the same object later. A prototype's copy is a new object with its own identity.

## A small example

```javascript
function permissionSlip(info) {
  const notes = info.notes.slice();
  return {
    trip: info.trip,
    fee: info.fee,
    student: info.student,
    notes,
    copy() {
      return permissionSlip({
        trip: this.trip,
        fee: this.fee,
        student: this.student,
        notes: this.notes,
      });
    },
  };
}

const master = permissionSlip({ trip: 'museum', fee: 5, student: '', notes: ['bring lunch'] });
const sam = master.copy();
sam.student = 'Sam';
sam.notes.push('bus 4');
const masterStillClean = master.student === '' && master.notes.length === 1;
```

`copy` runs the slip back through the same setup, and `slice` gives the copy its own notes. Sam's extra line stays on Sam's paper. `masterStillClean` is true.

## What the code below is doing

The sheet shows the same idea twice. The second pass is three different ways to "copy," and they do not mean the same thing.

The first shape uses a class so the book names are visible. `InvoiceTemplate` is both the prototype and the concrete prototype. It holds currency, tax rate, lines, and a footer. `addLine` pushes onto this instance. `total` sums cents times quantity, then applies tax. `clone` builds a new `InvoiceTemplate`, copies the plain fields, and maps each line into a new object. The class stays intact. The client keeps one configured master per region and clones it per customer. The EU master is euros, tax `0.2`, footer "VAT included," and a support line at `10000` cents. `inv1` clones it and adds four seats at `2500` cents, so the total is both lines with tax. `inv2` clones it and stays at `12000`. The master still has one line. Setting `inv2`'s line to one cent leaves the master at `10000`. New identity, same class, deep copy of the lines.

The second shape is how you would write it on a normal day, and it is three tools that do not mean the same thing. `Object.create` is the see-through cover. `slowConfig` sits on `baseConfig`, overrides `timeoutMs`, and inherits `retries` and `describe`, so it reads as three tries and `30000` milliseconds. Change the base `retries` to `5` and the slow config sees `5`. That link is live. It is delegation, not a snapshot. `structuredClone` is the real photocopy of data. A preset with a nested item and a `Map` is cloned. Pushing an item and editing the map on the copy leaves the preset at one item and source `web`. The copy's map is still a `Map`. A function cannot be cloned that way, and cloning the invoice instance drops the class: the result's prototype is `Object.prototype`. Spread is the sloppy copy. Status can become paid on a new object while `items` is still the preset's array. Nested data stays shared.

When you talk about it, say this: copy a configured instance instead of constructing one. The prototype declares `clone`, the concrete prototype does the deep or shallow copy, and the client calls `clone` instead of `new`.
