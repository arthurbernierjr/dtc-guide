## The idea

Picture a bakery counter on a Saturday. You do not slide over one giant form with a blank for every optional detail. You say the size, then the flavor, then another flavor. When you say "box it," they hand you a cake. Forget the size and they will not box a cake that has no pan. The conversation is not the cake. The cake is what you carry out.

A builder is that counter. Each step adds one part and hands the counter back, so the calls chain. `build()` is "box it." It checks that the required part is there, then returns a separate product. The steps are the construction. The cake is the representation. The same conversation can box a chocolate cake or a vanilla one.

In code the product is something with too many optional pieces for one honest constructor. A SQL query has a table, columns, filters, an order, and a limit. A request has a method, a url, headers, a query, and a body. Cramming those into one `new` call is a telescoping constructor: a long argument list, half the slots optional, and a skipped comma shifts every value after it. A giant options bag leaves the same hole. You can hold a half-built object and treat it as finished, because nothing refused to hand it over.

The builder keeps the pieces private while you stack them. A director is the coworker who already knows the Saturday birthday special and runs those steps for you. The director knows the recipe. It does not decide how the boxed cake is written down.

## Why it matters

The bug this pattern prevents is a usable-looking object that was never finished. Eight optional parameters means you can forget the table and still hold a query. The builder refuses. No table, no product. Filter values stay beside the SQL sentence, in order, so the words and the parameters cannot drift apart.

You already use this without the textbook name. Knex and Kysely are query builders: select, then where, then order by. Zod and Yup schemas chain string, min, email. Superagent and supertest chain get, set, query. Webpack-chain builds a config the same way. `new URL()` plus appending search params assembles an address one piece at a time. Test fixtures read like a user, with a role, then build.

A factory is the one-call neighbor. You ask once and the product comes back. A builder is many calls, then `build()`. An abstract factory picks a whole family of related objects and keeps that family consistent. A builder assembles one complex thing. A fluent chain by itself is not a builder. If the chain never hands you a distinct product at the end, you only have a chatty object. The cake leaving the box is the point.

## A small example

```javascript
function cakeOrder() {
  const parts = { size: null, flavors: [] };
  return {
    size(inches) {
      parts.size = inches;
      return this;
    },
    flavor(name) {
      parts.flavors.push(name);
      return this;
    },
    build() {
      if (!parts.size) throw new Error('size is required');
      return { size: parts.size, flavors: parts.flavors.slice() };
    },
  };
}

const cake = cakeOrder().size(8).flavor('chocolate').flavor('vanilla').build();
```

`cake` is the boxed order. The counter is not. Skip the size and `build()` throws before anything leaves.

## What the code below is doing

The sheet shows the same idea twice.

The first shape uses classes so the book names are visible. `SqlQuery` is the product. It stores the table, columns, where clauses, order, and limit. `toString()` builds the SELECT, and `params` lists the filter values beside the question marks. `SelectBuilder` is the concrete builder. The step methods are the builder interface. There is no separate builder class. `from`, `select`, `where`, `orderBy`, and `limit` each store a part and return `this`. Columns start as every column. `build()` throws if `from()` never ran, and otherwise returns a new `SqlQuery`. The book sometimes calls that last step `getResult`. This sheet calls it `build`. `ReportQueries` is the director. `recentPaidOrders` takes a builder and a number of days and runs one recipe: orders, id and total, status paid, created after that many days, newest first, limit 50, then `build()`. It does not write the SQL. The checks show that recipe with its two parameter values kept separate, a users query that stays a select of every column, and a throw when columns are chosen and no table is named.

The second shape is how you would write it on a normal day. `requestBuilder` closes over its state, and every step returns a new builder, so a branch does not edit the one it came from. It starts as GET with empty headers and an empty query. Header names are stored lowercase. `json` sets the body and marks it as JSON. `build()` throws without a url, folds the query onto the url, and freezes the result. One base carries the orders url and an authorization header. A list branch adds a page and stays GET. A create branch switches to POST with a JSON body. Building the base again still yields the bare orders url, and the created request is frozen.

When you talk about it, say this: fluent steps, then build. The builder is the step interface, the concrete builder stacks the parts and hands back the product, and a director can run a known recipe of those steps.
