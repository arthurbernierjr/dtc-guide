## The idea

Picture recipe cards clipped into a pile you can hold. A number card just says 3. A name card says "look up price on the cheat sheet." A minus card has a clip on the left and a clip on the right, and each clip holds another card. You do not bake "price times quantity, minus half the discount" into the cash register as a new function every time the specials change. You write the sentence down. You turn it into cards. You walk the cards.

An interpreter is that walk. You have a tiny language. You define a representation for its grammar, and you define an interpreter that uses the representation to run a sentence. Ops people need rules as data: a price formula, or "tier is gold and the region is in the EU." You need the language, a tree, and an evaluator that reads a context of variable values.

A terminal expression is a leaf: a literal, or a variable. A nonterminal expression holds smaller expressions: add, multiply, and, or. Every node has `interpret(context)`. The client parses the sentence and builds the tree. Evaluating is walking it.

## Why it matters

The bug this pattern prevents is rules trapped in a deploy. If "free shipping over 100, or gold tier in the EU or the UK" is an `if` in the server, changing it means a release. If that sentence is data, an operator changes the sentence. Your code walks whatever tree it is given. The same tree with a new cheat sheet is a new answer, which is how one saved rule serves many orders.

You already run little languages. A regular expression is a sentence in a pattern language. Handlebars, Mustache, JSX, and `JSON.parse` turn text into a tree and walk it. A Mongo or Prisma `where` object is a query written as data. GraphQL, SQL, CSS selectors, and feature-flag rules such as JSON Logic are the same kind of sentence.

A visitor keeps the tree and lets you add operations without editing the nodes. An interpreter puts one operation, `interpret`, on every node. A composite is the tree shape. An interpreter is a composite whose job is to evaluate a language. A strategy picks an algorithm. An interpreter runs a sentence.

## A small example

```javascript
function num(value) {
  return { interpret() { return value; } };
}

function name(key) {
  return {
    interpret(sheet) {
      if (!(key in sheet)) throw new Error('unbound ' + key);
      return sheet[key];
    },
  };
}

function minus(left, right) {
  return {
    interpret(sheet) {
      return left.interpret(sheet) - right.interpret(sheet);
    },
  };
}

const sentence = minus(name('price'), num(2));
const total = sentence.interpret({ price: 10 });
```

`sentence` is three cards: a minus card holding a name card and a number card. `total` is 8. The cheat sheet supplied `price`. The minus card never looks up `price` itself. It asks the cards it holds.

## What the code below is doing

The sheet shows the same idea twice.

The first shape uses classes so the book names are visible. The grammar is the usual one. An expression is terms joined by `+` or `-`. A term is factors joined by `*` or `/`. A factor is a number, a variable, or a parenthesized expression. `NumberExpr` returns its value and ignores the context. `VariableExpr` reads the context and throws `unbound variable` when the name is missing. `BinaryExpr` holds an operator and two children, and `interpret` runs the matching function on the two child results. The operations are add, subtract, multiply, and divide.

The client is a tokenizer plus a small recursive-descent parser. Tokens are numbers, names, and the operator and parenthesis characters. `factor`, `term`, and `expr` build the tree. Multiplication lives in `term`, addition lives in `expr`, so precedence is the shape of the tree, not a special case inside `interpret`. Parsing `price * qty - discount / 2` yields a minus node. With price 25, quantity 4, and discount 10, the walk returns 95. `(price + 5) * qty` is 120. `2 + 3 * 4` with an empty context is 14. The same minus tree with quantity 10 returns 245. `price * tax` parses, then throws at interpret time because `tax` is unbound. A missing close parenthesis throws a `SyntaxError`. Two numbers in a row throw on the unexpected second token.

The second shape is a JSON rule language, in the style of JSON Logic or a Mongo query, plus one recursive evaluator. A non-array node is a literal. An array is an operator followed by arguments. `var` walks a dotted path. `and`, `or`, and `not` combine booleans. `==` and `>` compare evaluated children. `in` evaluates only the first argument and treats the second as a literal list, not as a child expression. The free-shipping rule is data: total over 100, or gold tier and a region in `EU` or `UK`. An order of 150 in the US for a basic customer is free. An order of 20 in the EU for gold is free. An order of 20 in the US for gold is not. Negating a total of 20 in the US with an empty customer is true. The rule still works after a JSON round trip, which is what "storable" means. An unknown operator throws.

When you talk about it, say this: grammar rules become node classes, and evaluating is walking the tree.
