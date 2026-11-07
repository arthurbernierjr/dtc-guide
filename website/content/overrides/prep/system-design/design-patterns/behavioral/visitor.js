// ─────────────────────────────────────────────────────────────────────────────
// VISITOR                                                           [Behavioral]
// ─────────────────────────────────────────────────────────────────────────────
// INTENT  : Represent an operation to be performed on the elements of an object structure; define a new
//           operation without changing the classes of the elements on which it operates.
// PROBLEM : A document tree (Heading, Paragraph, Image, Section) needs render-to-HTML, render-to-Markdown,
//           word count, link extraction... Adding each as a method on every node class bloats the nodes and
//           smears one feature across many files.
// SAY     : Participants: Visitor (visitX() per element type), ConcreteVisitor (one operation), Element
//           (accept(visitor)), ConcreteElement (calls visitor.visitX(this) — "double dispatch"),
//           ObjectStructure (the tree). Pitch: "new operations over a stable set of node types, without
//           touching the nodes."
// SEEN IN : Babel / TypeScript compiler AST traversal (`traverse(ast, { Identifier(path) {} })`); ESLint rules
//           (objects keyed by node type); GraphQL-js `visit(ast, visitor)`; PostCSS `walkRules/walkDecls`;
//           Prettier printers (print by node type); `JSON.parse(s, reviver)` / `JSON.stringify(v, replacer)`
//           — a callback visiting every node (-ish).
// VS      : Iterator yields elements and you do the work outside; Visitor dispatches on element TYPE and the
//           work lives in the visitor. Interpreter puts the ONE operation on the nodes; Visitor pulls operations
//           OUT — pick Visitor when ops change often, Interpreter/Composite when node types do.
// ─────────────────────────────────────────────────────────────────────────────
'use strict';
const assert = require('node:assert/strict');

// ── 0. Start here: three elements, two visitors
// Session 2.2 showed the DevTools Styles panel: pick one element and the panel walks the rules that matched
// it, asking each rule the same question ("what do you set?"). Visitor is that walk, written as code.
const page = [                                              // a literal three-element document
  { kind: 'heading', text: 'Guild notices' },
  { kind: 'paragraph', text: 'Two quests remain open tonight.' },
  { kind: 'image', alt: 'quest board' },
];
const toText = {                                            // visitor 1: one method per element kind
  visitHeading: (n) => n.text.toUpperCase(),
  visitParagraph: (n) => n.text,
  visitImage: (n) => `[${n.alt}]`,
};
const wordCount = {                                         // visitor 2: the same three method names, different answers
  visitHeading: (n) => n.text.split(' ').length,
  visitParagraph: (n) => n.text.split(' ').length,
  visitImage: () => 0,
};
const methodFor = { heading: 'visitHeading', paragraph: 'visitParagraph', image: 'visitImage' };
const accept = (node, visitor) => visitor[methodFor[node.kind]](node);   // the element picks the method by its kind
//
//   element      method called     toText returns                      wordCount returns
//   heading      visitHeading      'GUILD NOTICES'                     2
//   paragraph    visitParagraph    'Two quests remain open tonight.'   5
//   image        visitImage        '[quest board]'                     0
assert.deepEqual(page.map((n) => accept(n, toText)), ['GUILD NOTICES', 'Two quests remain open tonight.', '[quest board]']);
assert.deepEqual(page.map((n) => accept(n, wordCount)), [2, 5, 0]);
// Two choices decide what runs: the element's kind picks the method, the visitor object supplies the body.
// Two objects dispatching together is what the sections below call "double dispatch".

// ── 1. Classic shape (classes, so the participant names are visible)
// ConcreteElements — each accept() dispatches to the matching visit method (double dispatch)
class Heading { constructor(level, text) { this.level = level; this.text = text; } accept(v) { return v.visitHeading(this); } }
class Paragraph { constructor(text) { this.text = text; } accept(v) { return v.visitParagraph(this); } }
class Image { constructor(src, alt) { this.src = src; this.alt = alt; } accept(v) { return v.visitImage(this); } }
class Section {                                           // composite element — still just accept()
  constructor(...children) { this.children = children; }
  accept(v) { return v.visitSection(this); }
}

class HtmlRenderer {                                      // ConcreteVisitor
  visitHeading(h) { return `<h${h.level}>${h.text}</h${h.level}>`; }
  visitParagraph(p) { return `<p>${p.text}</p>`; }
  visitImage(i) { return `<img src="${i.src}" alt="${i.alt}">`; }
  visitSection(s) { return `<section>${s.children.map((c) => c.accept(this)).join('')}</section>`; }
}
class MarkdownRenderer {                                  // ConcreteVisitor — new output, zero node changes
  visitHeading(h) { return `${'#'.repeat(h.level)} ${h.text}`; }
  visitParagraph(p) { return p.text; }
  visitImage(i) { return `![${i.alt}](${i.src})`; }
  visitSection(s) { return s.children.map((c) => c.accept(this)).join('\n\n'); }
}
class StatsVisitor {                                      // ConcreteVisitor with accumulated state
  constructor() { this.words = 0; this.images = 0; this.headings = []; }
  visitHeading(h) { this.headings.push(h.text); this.words += h.text.split(/\s+/).length; }
  visitParagraph(p) { this.words += p.text.split(/\s+/).length; }
  visitImage() { this.images += 1; }
  visitSection(s) { s.children.forEach((c) => c.accept(this)); return this; }
}

const doc = new Section(                                  // ObjectStructure
  new Heading(1, 'Release notes'),
  new Paragraph('Faster builds and fewer bugs.'),
  new Section(new Heading(2, 'Breaking'), new Image('/diff.png', 'diff'), new Paragraph('Node 18 dropped.')),
);
assert.equal(doc.accept(new HtmlRenderer()),
  '<section><h1>Release notes</h1><p>Faster builds and fewer bugs.</p>'
  + '<section><h2>Breaking</h2><img src="/diff.png" alt="diff"><p>Node 18 dropped.</p></section></section>');
assert.equal(doc.accept(new MarkdownRenderer()),
  '# Release notes\n\nFaster builds and fewer bugs.\n\n## Breaking\n\n![diff](/diff.png)\n\nNode 18 dropped.');
const stats = doc.accept(new StatsVisitor());
assert.equal(stats.words, 2 + 5 + 1 + 3);
assert.equal(stats.images, 1);
assert.deepEqual(stats.headings, ['Release notes', 'Breaking']);
assert.equal(new Image('a', 'b').accept(new MarkdownRenderer()), '![b](a)');   // same accept(), picked by runtime type

// ── 2. Idiomatic JS shape: plain `{ type }` AST nodes + a visitor object keyed by type (Babel/ESLint style)
const ast = {
  type: 'Program',
  body: [
    { type: 'VariableDeclaration', id: 'total',
      init: { type: 'BinaryExpression', op: '*', left: { type: 'Identifier', name: 'price' }, right: { type: 'Literal', value: 3 } } },
    { type: 'CallExpression', callee: { type: 'Identifier', name: 'log' }, args: [{ type: 'Identifier', name: 'total' }] },
  ],
};
const traverse = (node, visitor) => {                     // generic walk — knows nothing about the operations
  if (!node || typeof node.type !== 'string') return;
  visitor.enter?.(node);
  visitor[node.type]?.(node);
  for (const v of Object.values(node)) {
    if (Array.isArray(v)) v.forEach((c) => traverse(c, visitor));
    else if (v && typeof v === 'object') traverse(v, visitor);
  }
};
const replace = (node, next) => { for (const k of Object.keys(node)) delete node[k]; Object.assign(node, next); };

const identifiers = [];
traverse(ast, { Identifier: (n) => identifiers.push(n.name) });
assert.deepEqual(identifiers, ['price', 'log', 'total']);

const counts = {};
traverse(ast, { enter: (n) => { counts[n.type] = (counts[n.type] ?? 0) + 1; } });
assert.deepEqual(counts, { Program: 1, VariableDeclaration: 1, BinaryExpression: 1, Identifier: 3, Literal: 1, CallExpression: 1 });

// Mutating visitors (what a Babel plugin does): inline a known constant, then constant-fold
traverse(ast, { Identifier: (n) => { if (n.name === 'price') replace(n, { type: 'Literal', value: 10 }); } });
traverse(ast, {
  BinaryExpression: (n) => {
    if (n.op === '*' && n.left.type === 'Literal' && n.right.type === 'Literal') replace(n, { type: 'Literal', value: n.left.value * n.right.value });
  },
});
assert.deepEqual(ast.body[0].init, { type: 'Literal', value: 30 });
assert.deepEqual(ast.body[1].args, [{ type: 'Identifier', name: 'total' }]);   // untouched nodes stay intact

// JSON.parse's reviver is a visitor called bottom-up on every (key, value)
const revived = JSON.parse('{"createdAt":"2024-01-02T00:00:00.000Z","n":1}', (k, v) => (k.endsWith('At') ? new Date(v) : v));
assert.ok(revived.createdAt instanceof Date);
assert.equal(revived.n, 1);

console.log('ok: design-patterns/behavioral/visitor.js');
