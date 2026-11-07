## The idea

Picture a cookie recipe card. The order of the steps is printed in ink, and one line is a blank you fill in pencil. Heat the oven. Mix the butter and sugar. Stir in the ___. Scoop. Bake. The blank might say chocolate chips. It might say raisins. Nobody gets to bake before they mix, and nobody gets to scribble a new step order on the card. The card owns the sequence. You only fill the blank.

That card is a template method. The parent defines `export` as a fixed skeleton: keep some rows, shape them, serialize them, name the file, store it, then run an after-step. Subclasses, or an options object of callbacks, fill the blanks. `serialize` and `extension` are required blanks. The base throws if you leave them empty, because a recipe that never says what the dough became is not a recipe. `include`, `transform`, `baseName`, and `afterExport` are optional hooks with boring defaults: keep every row, leave it unchanged, name the file "export", and do nothing when you are done.

CSV and JSON exports want that same card. Left as two copied functions, they drift. One filters before it shapes, the other shapes before it filters, and a third forgets to tell anyone the tray came out. The skeleton makes that drift something you cannot do by accident. You can change the blank. You cannot change the ink.

## Why it matters

The bug this pattern prevents is three exporters that were twins in March and strangers by November. Someone writes the file before filtering on the spreadsheet path. Counts stop matching. The "tell the audit log" step runs for JSON and not for CSV, because that line was a blank someone forgot to copy. Fixing the sequence means hunting every card you photocopied.

You already fill blanks like this. A stream base class runs the machinery, and you override the one method that transforms a chunk. `JSON.stringify` walks its own card and calls your `toJSON` when it hits the blank for "what should this object look like." Test runners call your setup and teardown around a test they still own. The framework holds the order. You hold the pencil.

Strategy is the pattern to keep separate. Strategy swaps the whole algorithm by plugging in a different chip. The button does not care how the swing is computed, and there is no printed order of steps inside the call. Template method keeps the skeleton and swaps steps. Classically that is inheritance: a child class overrides a step and does not override `export`. In plain JavaScript it is often an options object of callbacks, which is the same card with the blanks passed in. Factory method is a template method whose blank happens to be "create the product." Same ink. Narrower pencil line.

## A small example

```javascript
function exportRows(rows, steps) {
  const include = steps.include || (() => true);
  const transform = steps.transform || ((row) => row);
  const kept = rows.filter(include);
  const shaped = kept.map(transform);
  return steps.serialize(shaped);
}

const rows = [
  { id: 1, status: 'paid' },
  { id: 2, status: 'open' },
];
const csv = exportRows(rows, {
  serialize: (list) => list.map((row) => `${row.id},${row.status}`).join('\n'),
});
const paid = exportRows(rows, {
  include: (row) => row.status === 'paid',
  serialize: (list) => JSON.stringify(list),
});
```

`exportRows` is the card. Filter, then shape, then serialize. The first call fills only the serialize blank, so `csv` has both rows. The second call also fills `include`, so `paid` is a JSON array of the one paid row. Nobody reordered the steps.

## What the code below is doing

The sheet shows the same card twice, then a blank the language already calls for you.

The first shape uses classes so the names are visible. `DataExporter.export` is the template method, the ink. It filters with `include`, maps with `transform`, serializes, builds a file name from `baseName` and `extension`, pushes the name, body, and count to the sink, and calls `afterExport`. `serialize` and `extension` throw, and the error names the class, if a child leaves a required blank empty. The hooks default to keep-all, identity, `"export"`, and a no-op. `CsvExporter` fills only the two required blanks, so all three orders become a CSV string named `export.csv`, the count is 3, and the audit list stays empty because the default after-step does nothing. `PaidOrdersJsonExporter` fills primitives and hooks. `include` keeps rows whose status is paid. `transform` turns cents into a money string. The name becomes `paid-orders.json`. `afterExport` writes `"paid-orders.json: 2 rows"` on the audit log. The body is the two paid orders. The refunded row never made the tray. Calling `export` on the bare base class throws, because that card still has empty required blanks.

The second shape is the card as a function, for when you do not want a subclass. Defaults cover `include`, `transform`, `name`, and `onDone`. `serialize` is required, and a missing one throws a `TypeError`. A TSV caller fills serialize, a name, and `onDone`, and gets three lines. A second call keeps only cents over 400 and maps each row down to its id, so the body is `[1,2]`. `onDone` ran for the first call only. The pencil marks differ. The ink does not.

The last fragment is the language holding the card. `JSON.stringify` calls `Money.toJSON` at the blank, so 1250 cents becomes `"12.50"` USD. `Symbol.toPrimitive` is the blank for coercion: the same object prints as `$12.50` or as the number `1250`. You did not rewrite `JSON.stringify`. You filled the step it left open.

When you talk about it, say this: the parent owns the algorithm's order. Children fill in the blanks.
