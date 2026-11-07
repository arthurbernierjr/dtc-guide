## The idea

Picture a notebook you are allowed to ruin, plus a stack of sealed photos of the pages. Before you erase a paragraph, you take a photo, tape it shut, and hand it to a friend. Your friend can hold the photo, label it "after version 1", and hand it back later. Your friend cannot open it and rewrite the words inside. When you want the old page, you take the photo back, and you are the only one who knows how to put those words onto the same notebook.

That photo is a memento. The notebook is the originator: it creates the snapshot, and it is the only one who can restore from it. The friend is the caretaker: a history stack that stores the photos and never inspects them. The snapshot is opaque. Outsiders can see the label. They cannot see the title, the body, or the tags.

You need this when you want undo, rollback, or "put my draft back" without letting every caller poke private fields. The object hands out a sealed snapshot and later accepts that same object back. Encapsulation stays intact because the internal state never becomes a public bag of fields for the rest of the program to scribble on.

## Why it matters

The bug this pattern prevents is a restore that lies. If undo means "reach in and copy title, body, and tags from wherever you stashed them," any other function can mutate that stash, forget a field, or paste the words into a different notebook. A sealed photo has one writer and one reader: the originator. A forged object that only looks like a snapshot, a label with no real payload, fails the restore instead of half-applying.

You already use the idea. An editor undo stack is photos of the document. A database savepoint is a photo you can roll back to. A history entry you push before a navigation is a small snapshot of where you were. Time-travel debugging is a list of past photos you can pop back onto the same page.

Command is the pattern this gets confused with. A command stores the operation and how to invert it. "Add the tag" undoes with "remove the tag." That stays small, and it falls apart when every operation needs its own inverse and you forgot one. A memento stores the state. Undo is "put this photo back on the same notebook," which is simple, and the cost is size, because you kept the whole page. Prototype is the other neighbor. A prototype clones an object so you can start a new one. A memento captures state so you can restore the same object later. The notebook does not become a second notebook. The words on this notebook go back.

## A small example

```javascript
function createDoc() {
  let body = '';
  const snaps = new WeakMap();
  return {
    edit(next) { body = next; },
    read() { return body; },
    save(label) {
      const token = { label };
      snaps.set(token, body);
      return token;
    },
    restore(token) {
      if (!snaps.has(token)) throw new Error('not a snapshot');
      body = snaps.get(token);
    },
  };
}

const doc = createDoc();
doc.edit('v1');
const saved = doc.save('v1');
doc.edit('v2');
doc.restore(saved);
```

`saved` is the sealed photo. The only field on it is the label. The body lives in the `WeakMap`, where the caretaker cannot read it. After the second edit the notebook says `"v2"`. After `restore`, it says `"v1"` again, on the same document.

## What the code below is doing

The sheet shows the same idea twice, then a short note about copying mutable objects.

The first shape uses classes so the names are visible. `DocumentMemento` is the sealed photo. Its constructor stores the real state in a `WeakMap` that only this originator can read, freezes the memento, and leaves `label` as the only visible field. `TextDocument` is the notebook. Title, body, and tags are private fields. `edit`, `tag`, and `rename` change them. `save` builds a memento from those fields. `restore` reads the `WeakMap`, throws if the object was never saved here, and writes the three fields back onto this same document. `History` is the friend holding the stack. It pushes and pops mementos and will tell you the labels. It has no way to read a body.

The asserts walk an edit of one notebook. Save "initial", write "v1 draft" and tag it, save "after v1", then rename and rewrite toward a final title. Two restores walk backward: first to the v1 draft, then to the empty original, and the history length is 0. A later save of body `"x"` stringifies as `{"label":"x"}`. The page is not on the photo. Restore still brings `"x"` back after further edits and a new tag. Restoring a handmade `{ label: 'forged' }` throws, because that object was never taped shut by this document.

The second shape is an array of immutable snapshots, the way a time-travel store works. `dispatch` pushes the current state onto `past`, runs the reducer, and clears `future`. `undo` and `redo` move one photo between those stacks and put it back on the same store. Adding `'A'` then `'B'` and undoing leaves `['A']`. Redo puts `'B'` back. Extra undos at the start do nothing. The old object is the snapshot, so nothing is deep-copied.

The last fragment is a mutable draft email. `structuredClone` takes the photo so a later push onto `to` cannot corrupt it. Copying the clone back onto the draft is the restore. Same notebook. Old words.

When you talk about it, say this: save a sealed snapshot now, and hand it back later to roll back.
