// ─────────────────────────────────────────────────────────────────────────────
// INTERPRETER                                                       [Behavioral]
// ─────────────────────────────────────────────────────────────────────────────
// INTENT  : Given a language, define a representation for its grammar along with an interpreter that uses
//           the representation to interpret sentences in the language.
// PROBLEM : Ops/users need to express rules ("price * qty - discount / 2", "tier == gold and region in EU")
//           as DATA, not code — you need a tiny language, a tree for it, and an evaluator over a context.
// SAY     : Participants: AbstractExpression (interpret(context)), TerminalExpression (literal, variable),
//           NonterminalExpression (add, mul, and, or — holds sub-expressions), Context (variable values),
//           Client (parses/builds the tree). Pitch: "grammar rules become node classes; evaluating is
//           walking the tree."
// SEEN IN : `RegExp`; template engines (Handlebars/Mustache, JSX → createElement); MongoDB / Prisma `where`
//           query objects; GraphQL-js & SQL parsers; rules engines & feature flags (JSON Logic, LaunchDarkly
//           targeting); `JSON.parse`, math.js; CSS selector matching in `querySelector`.
// VS      : Visitor separates operations from the tree (add ops without touching nodes); Interpreter puts ONE
//           operation (interpret) on every node. Composite is the structure; Interpreter is a Composite whose
//           job is evaluating a language. Strategy picks an algorithm; Interpreter runs a sentence.
// ─────────────────────────────────────────────────────────────────────────────
'use strict';
const assert = require('node:assert/strict');

// ── 0. Why this page is linked from CSS: nav a:hover
// Session 2.2 wrote `nav a:hover`. A selector is a tiny language. The browser splits it into pieces,
// builds a tree from them, and asks each element on the page "do you match?". That is the whole pattern.
//
// The four pieces of `nav a:hover` (the space is one of them), and the question each piece asks an element:
//
//   piece      kind          question asked of the element
//   nav        type          is your tag nav?
//   (space)    descendant    is there an element above you that answers yes to the piece on the left?
//   a          type          is your tag a?
//   :hover     pseudo-class  is the pointer over you right now?
//
// Three elements, asked in turn. One "no" anywhere means the rule does not apply:
//
//   element                                   nav above?   tag a?   hovered?   matches
//   an <a> inside <nav>, pointer over it      yes          yes      yes        yes
//   the same <a>, pointer elsewhere           yes          yes      no         no
//   a hovered <a> inside <body>, no <nav>     no           yes      yes        no
//
// Stop here on your first visit from Session 2.2; those two tables are the visit. Come back after Session 3.4 to
// run the code below, which is the same four pieces and three elements in JavaScript. Sections 1 and 2 are the
// interview shapes for Unit 9.
const tokenizeSelector = (sel) => sel.match(/:[a-z]+|\s+|[a-z]+/g).map((t) => (/^\s+$/.test(t) ? ' ' : t));
assert.deepEqual(tokenizeSelector('nav a:hover'), ['nav', ' ', 'a', ':hover']);   // four pieces; the space is one of them

// Three node kinds. Each answers interpret(element) with true or false; the Context is the element itself.
const type = (name) => ({ interpret: (el) => el.tag === name });                                 // `nav`, `a`
const pseudo = (inner, state) => ({ interpret: (el) => inner.interpret(el) && el[state] === true });  // `a:hover`
const descendant = (ancestor, inner) => ({                                                       // the space: "somewhere inside"
  interpret: (el) => inner.interpret(el) && el.ancestors.some((p) => ancestor.interpret(p)),
});
const navHover = descendant(type('nav'), pseudo(type('a'), 'hover'));                            // the tree for nav a:hover

const navEl = { tag: 'nav', ancestors: [] };
const hovered = { tag: 'a', hover: true, ancestors: [navEl] };                      // <nav><a> with the pointer over it
const resting = { tag: 'a', hover: false, ancestors: [navEl] };                     // the same link, pointer elsewhere
const loose = { tag: 'a', hover: true, ancestors: [{ tag: 'body', ancestors: [] }] };  // a hovered link outside any nav
assert.equal(navHover.interpret(hovered), true);                                    // matches: in a nav, and hovered
assert.equal(navHover.interpret(resting), false);                                   // no: not hovered
assert.equal(navHover.interpret(loose), false);                                     // no: no nav above it
// The arithmetic example below is the same idea with numbers.

// ── 1. Classic shape (classes, so the participant names are visible)
// Grammar: expr := term (('+'|'-') term)* ; term := factor (('*'|'/') factor)* ; factor := NUM | VAR | '(' expr ')'
class NumberExpr {                                        // TerminalExpression
  constructor(v) { this.v = v; }
  interpret() { return this.v; }
}
class VariableExpr {                                      // TerminalExpression — reads the Context
  constructor(name) { this.name = name; }
  interpret(ctx) {
    if (!(this.name in ctx)) throw new Error(`unbound variable: ${this.name}`);
    return ctx[this.name];
  }
}
class BinaryExpr {                                        // NonterminalExpression
  static ops = { '+': (a, b) => a + b, '-': (a, b) => a - b, '*': (a, b) => a * b, '/': (a, b) => a / b };
  constructor(op, left, right) { Object.assign(this, { op, left, right }); }
  interpret(ctx) { return BinaryExpr.ops[this.op](this.left.interpret(ctx), this.right.interpret(ctx)); }
}

// Client: tokenizer + recursive-descent parser produce the expression tree
const tokenize = (src) => src.match(/\d+(?:\.\d+)?|[a-zA-Z_]\w*|[-+*/()]/g) ?? [];
function parse(src) {
  const toks = tokenize(src);
  let i = 0;
  const peek = () => toks[i];
  const next = () => toks[i++];
  const factor = () => {
    const t = next();
    if (t === '(') { const e = expr(); if (next() !== ')') throw new SyntaxError('expected )'); return e; }
    if (t === undefined) throw new SyntaxError('unexpected end');
    return /^\d/.test(t) ? new NumberExpr(Number(t)) : new VariableExpr(t);
  };
  const term = () => { let l = factor(); while (peek() === '*' || peek() === '/') l = new BinaryExpr(next(), l, factor()); return l; };
  const expr = () => { let l = term(); while (peek() === '+' || peek() === '-') l = new BinaryExpr(next(), l, term()); return l; };
  const tree = expr();
  if (i !== toks.length) throw new SyntaxError(`unexpected token ${peek()}`);
  return tree;
}

const ast = parse('price * qty - discount / 2');
const ctx = { price: 25, qty: 4, discount: 10 };          // Context
assert.ok(ast instanceof BinaryExpr);
assert.equal(ast.op, '-');                                // precedence encoded in the tree shape
assert.equal(ast.interpret(ctx), 95);                     // (25*4) - (10/2)
assert.equal(parse('(price + 5) * qty').interpret(ctx), 120);
assert.equal(parse('2 + 3 * 4').interpret({}), 14);
assert.equal(ast.interpret({ ...ctx, qty: 10 }), 245);    // same tree, new context
assert.throws(() => parse('price * tax').interpret(ctx), /unbound variable: tax/);
assert.throws(() => parse('(1 + 2'), SyntaxError);
assert.throws(() => parse('1 2'), /unexpected token 2/);

// ── 2. Idiomatic JS shape: a JSON rule language (JSON Logic / Mongo-query style) + one recursive evaluator
const evaluate = (node, data) => {
  if (!Array.isArray(node)) return node;                  // literal
  const [op, ...args] = node;
  const v = (n) => evaluate(n, data);
  switch (op) {
    case 'var': return args[0].split('.').reduce((o, k) => o?.[k], data);
    case 'and': return args.every(v);
    case 'or': return args.some(v);
    case 'not': return !v(args[0]);
    case '==': return v(args[0]) === v(args[1]);
    case '>': return v(args[0]) > v(args[1]);
    case 'in': return args[1].includes(v(args[0]));     // second arg is a literal list, not a sub-expression
    default: throw new Error(`unknown op ${op}`);
  }
};

// The rule is DATA (DB row, flag config, admin UI) — change business rules without a deploy
const freeShipping = ['or',
  ['>', ['var', 'order.total'], 100],
  ['and', ['==', ['var', 'customer.tier'], 'gold'], ['in', ['var', 'order.region'], ['EU', 'UK']]],
];
assert.equal(evaluate(freeShipping, { order: { total: 150, region: 'US' }, customer: { tier: 'basic' } }), true);
assert.equal(evaluate(freeShipping, { order: { total: 20, region: 'EU' }, customer: { tier: 'gold' } }), true);
assert.equal(evaluate(freeShipping, { order: { total: 20, region: 'US' }, customer: { tier: 'gold' } }), false);
assert.equal(evaluate(['not', freeShipping], { order: { total: 20, region: 'US' }, customer: {} }), true);
assert.equal(evaluate(JSON.parse(JSON.stringify(freeShipping)), { order: { total: 101 }, customer: {} }), true);   // storable
assert.throws(() => evaluate(['between', 1, 2], {}), /unknown op/);

console.log('ok: design-patterns/behavioral/interpreter.js');
