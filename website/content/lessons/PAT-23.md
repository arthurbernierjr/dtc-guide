## The idea

Picture a house with a fixed set of rooms. One room is a heading. One is a paragraph. One is an image. A section is a hallway that contains more rooms. You want three jobs done in that house: write the tour in HTML, write it in Markdown, and walk around counting words and pictures. You do not hire a carpenter to rebuild every room each time you invent a job. You send a visitor. Each room knows one sentence: come in. The visitor knows what to do once inside that kind of room.

That is the visitor pattern. The rooms are elements. `accept(visitor)` is the door. A heading's door calls `visitHeading` and hands over itself. A paragraph's door calls `visitParagraph`. An image's door calls `visitImage`. The visitor has one method per room type, and a concrete visitor is one whole job. An HTML renderer is one visitor. A Markdown renderer is another visitor walking the same halls. A stats visitor carries a notebook: words, images, and the heading text it has seen. The section is both a room and the object structure, the tree of the house. When a section lets the visitor in, that visitor's section method sends the same visitor through each child door.

The second hop is double dispatch. The room picks the method from its type. The visitor picks the behavior. One `accept`, and the pair decides the result. A new job, a link list or a word count, does not add a method to every room.

## Why it matters

The bug this pattern prevents is one feature smeared across the house. HTML lives on the heading class, the paragraph class, and the image class. Then the same three files grow a Markdown method. Then they grow a word count. The rooms bloat. A small change to "how we describe the house" becomes a tour of every file, and the rooms start knowing about jobs that are not part of being a room.

If the rooms are stable and the jobs are not, put the jobs in visitors. The nodes stay thin: their data, plus a door. You already walk trees this way. A compiler traverse takes an object keyed by node type, and the walker does not know what the rule wants. Linters and printers are the same split. The house stays. The visitor changes. A JSON reviver can turn a date string into a `Date` without teaching every object a new method.

Iterator is the pattern that feels close at the front door. An iterator hands you the next room and leaves the work outside, in your loop, and it does not care whether you walked into a kitchen or a closet. A visitor dispatches on the room's type, and the work lives in the visitor. Interpreter is the other neighbor. Interpreter paints the one operation onto the rooms themselves, which fits when the room types change often and that one operation is the point of the tree. Visitor pulls the jobs out of the house. Pick it when the jobs change often and the floor plan does not.

## A small example

```javascript
function heading(text) {
  return { accept(visitor) { return visitor.heading(text); } };
}

function paragraph(text) {
  return { accept(visitor) { return visitor.paragraph(text); } };
}

const shout = {
  heading: (text) => text.toUpperCase(),
  paragraph: (text) => text,
};

const markdown = {
  heading: (text) => `# ${text}`,
  paragraph: (text) => text,
};

const house = [heading('Notes'), paragraph('Hello')];
const asShout = house.map((room) => room.accept(shout)).join(' / ');
const asMd = house.map((room) => room.accept(markdown)).join('\n');
```

The rooms never mention shouting or Markdown. `accept` only opens the door. `asShout` is `NOTES / Hello`. `asMd` is a heading line, a newline, and `Hello`. A new format is a new visitor, not a new wing on the house.

## What the code below is doing

The sheet shows the same house twice, then a cousin you already call.

The first shape uses classes so the names are visible. `Heading`, `Paragraph`, `Image`, and `Section` are the rooms. Each `accept` calls the matching visit method with `this`: the room picks the door, the visitor picks the work. `Section` does not describe itself. Its visitor walks `children` by calling `accept` again. `HtmlRenderer` and `MarkdownRenderer` are two visitors, and Markdown did not change a room. `StatsVisitor` carries the notebook: headings store their text and add words, paragraphs add words, images bump a counter, and a section returns the same visitor.

The house in the asserts is a section, a heading, a paragraph, and a nested section with a smaller heading, an image, and another paragraph. HTML comes back as nested tags. Markdown comes back with a blank line between blocks. Stats reports 11 words, one image, and both heading strings. A lone image accepted by the Markdown visitor returns an image mark. Same door. The visitor decided the sentence.

The second shape is the plain-object walk compilers use. Rooms have a `type`. `traverse` calls `visitor.enter` if it exists, calls `visitor[node.type]` if it exists, then walks child arrays and objects. It does not know the job. One visitor collects the identifier names `price`, `log`, and `total`. Another counts room types on the way in. A third remodels in place: the identifier `price` becomes the literal `10`, and a later visitor folds `10 * 3` into the literal `30`. The call's argument stays `total`. Rooms nobody opened stay as they were.

The last lines are `JSON.parse` with a reviver, a visitor on the way back up. A key ending in `At` becomes a `Date`. The number under `n` stays `1`. The parser owns the walk. You only said what to do in the room.

When you talk about it, say this: new operations over a stable set of node types, without touching the nodes.
