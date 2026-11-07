## The idea

Picture a classroom shelf of labeled boxes. One box says "Inter, 12, not bold." Another says "Inter, 12, bold." Twenty-one letters sit on a page. Most of them look the same. If every letter carried its own copy of the font, the size, and the weight, you would store the same label thousands of times. A document with a million characters and about twenty real styles would spend its memory on copies.

A flyweight is the labeled box. The shared, immutable part is the intrinsic state: font, size, weight. The part that changes per letter is the extrinsic state: which character, and where it sits. The box does not store the character. You pass the character and the position in when you ask the box to draw. A factory keeps one box per label and hands that same box out every time the label matches.

The client, here a document, stores the cheap varying part and a reference to the box. Sharing is the whole point. Copying the box would be the bug.

## Why it matters

The cost this pattern avoids is a pile of identical objects. Building an `Intl.NumberFormat` or an `Intl.DateTimeFormat` is expensive, and a busy server will format the same locale the same way all day. One formatter per locale and options is enough. JavaScript already interns strings. `Symbol.for(key)` is a global shelf: the same key returns the same symbol, including across realms. A plain `Symbol(key)` cuts a new symbol every time. Immutable data libraries share structure for the same reason. Browsers cache glyphs. Games share sprite art. An ORM identity map keeps one object per row id, which is this idea aimed at records.

A singleton means exactly one instance in the whole program. A flyweight means one instance per key, and you are allowed many keys. A prototype copies an object so you can change the copy. A flyweight refuses the copy. An object pool hands out mutable objects and takes them back when you are done. A flyweight stays frozen. If you can write onto the box, every letter that shares it changes, and the sharing becomes a bug.

## A small example

```javascript
function makeShelf() {
  const boxes = new Map();
  return function take(font, size) {
    const label = font + '|' + size;
    if (!boxes.has(label)) {
      boxes.set(label, Object.freeze({ font: font, size: size }));
    }
    return boxes.get(label);
  };
}

const take = makeShelf();
const hello = { char: 'H', x: 0, box: take('Inter', 12) };
const bang = { char: '!', x: 20, box: take('Inter', 12) };
const shared = hello.box === bang.box;
```

`hello` and `bang` each keep their own character and their own spot on the page. `shared` is true. Both letters point at one labeled box. The box has no `x` on it.

## What the code below is doing

The sheet shows the same idea twice.

The first shape uses classes so the book names are visible. `TextStyle` is the concrete flyweight. The constructor stores font, size, and bold, then freezes the object. `render(char, x, y)` receives the extrinsic state and returns a string like the character, the coordinates, and the style. `TextStyleFactory` is the shelf. The key is font, size, and bold joined together. `get` builds a style only on a miss. `count` is the number of labels, not the number of letters.

`Document` is the client. `write` asks the factory for one style, then pushes a glyph per character with that shared style, an `x` equal to how many glyphs exist so far, and a `y` of 0. The sample text is `Hello `, then `World` in bold, then ten exclamation marks, all at size 12. That is 21 glyphs. The factory count is 2. The first glyph and the last glyph are the same object, because both are Inter 12 and not bold. The `W`, which is glyph index 6, is a different object. Asking for Inter 12 with bold left off matches asking for Inter 12 with bold false, because the default is false. Assigning a new size on a style throws a `TypeError`. The frozen box is the point. Index 6 of the rendered lines is `W` at `6,0` in `Inter/12` with a bold mark.

The second shape is a memoized factory over a `Map`. `intern` stringifies the arguments, builds the object once, and returns the cached one after that. `getFormatter` interns `Intl.NumberFormat` by locale and currency. The US dollar formatter is the same object on the second ask. The German euro formatter is a different object. Formatting `1234.5` in US English yields `$1,234.50`. The German formatting uses a dot between thousands, a comma before the cents, and a euro sign. A special space sits before that sign, and the check treats it as a normal space, leaving `1.234,50 €`.

`Symbol.for('app.user')` twice is one symbol. `Symbol('app.user')` twice is two symbols. The last picture is ten thousand map markers and three icon boxes, cafe, atm, and park. Latitude and longitude stay on the marker. The icon is shared. Marker 0 and marker 3 hold the same cafe box. A set of the icons has size 3.

When you talk about it, say this: keep one shared copy of the common part, and pass the part that changes in at call time.
