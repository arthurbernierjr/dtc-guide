## The idea

Picture a house with a solid door and a good lock. The spare key is under the mat. The alarm code is on a sticky note in the window. A little sign names the brand of lock. The walls were built correctly. The way you left the house is the problem.

That is Security Misconfiguration. The code can be careful while the settings around it are loose. The real control is configuration you load once at startup, check before the program accepts traffic, and freeze. Debug mode stays off unless someone opts in with an explicit true. A session secret has to be long, and a famous default is rejected. A wildcard cross-origin setting is rejected in production. Responses carry a content security policy, strict transport security, a nosniff header, and a frame denial. Headers that advertise your framework come off. The browser hears a generic error. The full detail stays in the log with a request id. Methods you did not list are refused. Shipped-in pairs such as admin and admin are refused.

Failure looks like the key under the mat. The process starts with debug unset and treats that silence as on. The session secret falls back to a word everyone has already tried. A production error page prints a stack, a file path, and a database address. Directory listing is on. A cloud bucket is world-readable. A sample admin screen is still mounted. Your laptop and production disagree because nobody checked the values at boot.

## Why it matters

This category ranks high on the 2025 OWASP list because defaults are enough. A stranger does not need a clever bug in your logic when the sample password still works, the error page draws a map of the server, or the browser is allowed to frame your site. Misconfiguration lives in environment variables, framework defaults, headers you forgot, and cloud consoles left on the vendor's easy option.

A stack trace teaches your layout. A missing nosniff header lets a browser treat a file as something more powerful than you intended. A missing frame policy lets another site wrap yours. A default credential is a key under the mat for every copy of the product. An open bucket is a folder on the sidewalk.

Load config in one function. Require `NODE_ENV` to be a known name. Require the secret. Treat debug as on only when the value is the string `true`. Use one code path for development, test, and production, and let only the values change. Fail the boot when production asks for a wildcard origin or a debug flag. Put the header set in one frozen object and apply it in one place. In production the client hears "Internal Server Error" plus a request id. You keep the rest for the log.

## A small example

```javascript
function loadConfig(env) {
  const errors = [];
  if (env.NODE_ENV !== 'production' && env.NODE_ENV !== 'development') {
    errors.push('NODE_ENV invalid');
  }
  if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) {
    errors.push('SESSION_SECRET too short');
  }
  if (env.NODE_ENV === 'production' && env.DEBUG === 'true') {
    errors.push('DEBUG on in production');
  }
  if (errors.length) throw new Error(errors.join('; '));
  return Object.freeze({
    isProd: env.NODE_ENV === 'production',
    debug: env.DEBUG === 'true',
  });
}

const config = loadConfig({
  NODE_ENV: 'production',
  SESSION_SECRET: 'x'.repeat(32),
});
```

`config.debug` is false. Production has to opt in. A short secret, or a `NODE_ENV` you do not recognize, throws before the process listens.

## What the code below is doing

The page shows five pieces of hardening.

Startup validation is `loadConfig`. It accepts production, development, or test. It rejects a missing or short session secret and the literal default `changeme`. In production it rejects `DEBUG=true` and a CORS origin of `*`. Debug is true only when the variable is the string `true`. The returned object is frozen. `exposeErrors` is on only outside production.

Security headers are a frozen map applied by `applyHeaders`. You get a content security policy, strict transport security, nosniff, frame denial, a referrer policy, a permissions policy, and cross-origin policies. Authenticated responses are marked `no-store`. `X-Powered-By` and `Server` are removed.

The error handler is `errorResponse`. Production returns a generic message and the request id. Development may add `err.message`. The stack stays in the log. The asserts show a database address present on the error object and absent from the production JSON.

Method and credential checks are small predicates. `methodAllowed` refuses `TRACE` and accepts `GET`. `rejectsDefaultCredential` refuses pairs such as `admin:admin`, `root:root`, and `guest:guest`.

The last block is a checklist in comments: static files with dotfiles denied and directory indexes off, public cloud access blocked at the account, and playground plus sample routes removed in production.

When you talk about it, say this: secure by default, checked at boot, same config path everywhere, only the values change.
