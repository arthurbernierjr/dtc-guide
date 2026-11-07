## The idea

Picture a grocery sack. A granola bar weighs 40 grams. A lunch bag holds that bar and an apple, and the bag's weight is the sum of what is inside. The sack holds the lunch bag and a bag of chips, and you ask the sack the same way. The question is `weight`. A bar, a bag, and a sack all take it. Bags can hold bags. That is a tree.

A composite is that tree. Objects form a part-whole hierarchy, and the client treats a single object and a group of objects through one interface. The component is the shared interface, here `weight`, and on the sheet `size`, `find`, and a printable form. A leaf has no children. It answers from its own data. A composite has children. It answers by asking each child and combining the answers. The client does not ask which kind it is holding before it calls.

In code the usual tree is files and folders. A file's size is its bytes. A folder's size sums its children, and a child folder does the same. `find` follows that rule. The call stays `node.size()` whether the node is a readme or the whole project.

## Why it matters

The bug this pattern prevents is a pile of type checks at every call site. `if (node.isFolder) recurse() else handle()` gets copied into size, into search, and into printing. Miss one branch and a folder is treated as a file. Put the operation on the shared interface and the tree walks itself. Remove a folder and the next `size` follows the tree as it is now.

You already use this without the textbook name. The DOM is a composite: elements and text share a node interface, and only some nodes have children. React trees work the same way. A container renders by rendering its children. Babel and ESLint walk AST nodes through one shared shape. An Express `Router` mounted on an app contains routers and routes, and all of them handle a request. Menu trees do this, and so does a three.js scene graph, where `add` puts one object inside another of the same family.

A decorator is the neighbor that wraps a single child and adds behavior, like foil around one bar. A composite holds many children and aggregates. A chain of responsibility is a line that passes along. A composite is a tree, and the call fans out. Visitor and iterator are how you walk a composite when you want the walk written outside the nodes.

## A small example

```javascript
function snack(name, grams) {
  return { name: name, weight: () => grams };
}
function bag(name, items) {
  return {
    name: name,
    weight: () => items.reduce((sum, item) => sum + item.weight(), 0),
  };
}
const bar = snack('granola', 40);
const lunch = bag('lunch', [bar, snack('apple', 180)]);
const sack = bag('sack', [lunch, snack('chips', 50)]);
const weights = [bar.weight(), lunch.weight(), sack.weight()];
```

`weights` is 40, then 220, then 270. One question, three levels. The sack never inspects whether a child is a bar or a bag. It only calls `weight`.

## What the code below is doing

The sheet shows the same idea twice.

The first shape uses classes so the book names are visible. `FsNode` is the component. `size` throws on the base. `find` keeps this node when the predicate matches. `toString` prints the name, the size, and indentation. `File` is the leaf. Its size is its bytes, and inherited `find` checks only itself. `Directory` is the composite. `add` and `remove` edit the children. `children` returns a copy of that list. `size` sums `child.size()`, and that recursion is the pattern. `find` checks the directory, then each child, into one array. `toString` prints itself, then each child one level deeper. The client builds a readme of `1200` bytes, a `src` directory with `index.js` at `800` and `utils.js` at `300`, and `node_modules` holding `left-pad` holding a `90` byte file, all under `project`. File size is `1200`, `src` is `1100`, and the root is `2390`. Finding `.js` names returns src's index, utils, then the nested index. Finding directories returns four: project, src, node_modules, and left-pad. Removing `node_modules` drops the root to `2300`, and the printed tree is the project, the readme, and src with its two files.

The second shape is how you would write it on a normal day: nested plain objects and recursive functions. A branch has `children`. A leaf has `bytes`. `size` sums children, or returns `bytes` when there are none. The project is `2300`. The readme leaf, same call, is `1200`. `walk` yields a path, then each child path: the project, the readme, src, and the two files under src. The React picture under that is the same tree. `render` of a string returns the string. `render` of an element wraps its type around its rendered children. A `ul` of two `li` elements, each holding one letter, becomes those tags nested. Leaf and branch both go through `render`.

When you talk about it, say this: a tree where every node, leaf or branch, answers the same calls. The component is that shared interface, the leaf has no children, the composite holds children and aggregates, and the client does not care which one it is holding.
