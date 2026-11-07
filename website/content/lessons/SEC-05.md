## The idea

Picture a fill-in-the-blank worksheet. The printed line is the instruction: "Please find the student named ____." The blank is supposed to hold a name. If the teacher reads whatever landed in the blank as more instruction, the worksheet stops being a form. The words you wrote became part of the command.

That is Injection. Untrusted text is handed to an interpreter as if it belonged in the program. The interpreter might be a database, a shell, a browser, a template engine, or a response header. The real control is to keep the command fixed and pass the data beside it. A SQL call keeps a constant query string and sends the value as a parameter. A login filter demands real strings and rejects an object where a string was required, so a query operator never becomes the password. A process is started with an argument array, and the host is checked against a hostname pattern before it joins that array. HTML is escaped for the context it lands in. A link a user supplied is kept only when the scheme is http or https. Templates are functions you wrote, chosen by a fixed name, and the user's text is data those functions escape. A header value that contains a carriage return or a line feed is rejected.

Failure looks like the blank eating the sentence. Text built into a SQL string with concatenation changes the shape of the statement. A JSON object arrives where a password string should be, and the database treats the object's keys as operators. A host value glued into a shell command line gives the shell extra words to run. A name dropped into HTML with `innerHTML`, or into a string you send as markup, becomes markup. A template the user authored gets compiled on the server. A redirect value that carries a line break smuggles a second header.

## Why it matters

Injection is how a form field becomes someone else's query, process, or page. On the 2025 OWASP list this category includes cross-site scripting, because the browser is an interpreter too.

On the way in, check the type and the shape. On the way into an interpreter, bind data apart from the command. On the way out, encode for HTML, a URL, or a header. A content security policy is the backstop when a page still slips. Give the database login only the rights that feature needs. Allow a template name, a hostname pattern, or a URL scheme you listed.

## A small example

```javascript
function findUserByEmail(email) {
  if (typeof email !== 'string' || email.length === 0 || email.length > 256) {
    throw new TypeError('email must be a string');
  }
  return {
    text: 'SELECT id FROM users WHERE email = $1',
    values: [email],
  };
}

const query = findUserByEmail('student@school.example');
```

`query.text` stays the sentence you wrote. `email` rides in `values`. The database binds it as data, so the characters in the string do not become syntax.

## What the code below is doing

Six interpreters. Six ways of keeping data beside the command.

SQL is `buildSafeQuery`, next to a string-building function the page never executes. The safe function returns a fixed `text` and a `values` array. The asserts keep the text constant and keep the input out of that text.

Document stores are `requireString`, `loginFilter`, and `hasOperatorKey`. Email and password have to be strings with a bounded length. An object in either field throws. `hasOperatorKey` walks nested objects and reports a key that starts with `$`.

Operating-system commands are `pingArgs`. The host has to match a hostname pattern. The return value is `['-c', '1', host]`, the shape you pass to `execFile` so a shell never parses the host. A host that fails the pattern throws. The comment above names the timeout you would pass with that call.

Cross-site scripting is `escapeHtml` and `safeHref`. `escapeHtml` replaces `&`, `<`, `>`, quotes, and `/` with entities. `safeHref` allows `http:` and `https:` and returns `#` for anything else, including schemes a browser would treat as script. A short content security policy is checked so the policy text contains no unsafe-inline grant.

Templates are the `templates` map and `render`. Lookup uses `Object.hasOwn`. An unknown name throws. `welcome` escapes `name` through `escapeHtml`. The user's characters stay data inside a template that lives in your code.

Headers are `headerValue`. A carriage return or a line feed throws. An ordinary path is returned as itself. The closing comment points at directory filters: escape the metacharacters, or call a library that binds the values.

When you talk about it, say this: keep the command fixed, pass data beside it, check types on the way in, and encode on the way out.
