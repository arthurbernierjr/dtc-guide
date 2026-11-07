## The idea

Picture school lunch. You do not cook it. You trust the line. One day the tray has your friend's name with one letter wrong, and the dessert is labeled "whatever was baked this morning," so Tuesday's cake is a different cake from Monday's. You still eat it. Your name is on the tray only because you asked someone else to grab it.

That is a Software Supply Chain Failure. The surprise arrives in a package, a base image, a registry, or a build action. Your own functions can be careful and the program still runs somebody else's code. The real control is exact versions, a lockfile you commit, and an install that uses that lockfile. Each downloaded file has an integrity hash, and you compare it in constant time before you trust the bytes. Internal packages live under a scope that always resolves to your registry. A name one or two edits away from a famous package gets a second look. Build actions are pinned to a full commit id. Install scripts stay off until you turn on the ones you mean. The build machine is production: small permissions, reviewed lockfile diffs, images pinned by digest.

Failure looks like the wrong tray. A range such as a caret, a star, or `latest` lets a new publish change the app with no edit from you. A missing lockfile means every build resolves the world again. An internal package with a public-shaped name can lose to a higher version from the public registry. A package named almost like a famous one slips into a command you copied. An action pinned to a moving tag can change under a build that was green yesterday. A postinstall script runs because installers run scripts unless you say otherwise.

## Why it matters

On the 2025 OWASP list this category is wider than a library with a known bug. A current package can still be the wrong bytes, and a build can still pull whatever is newest overnight. You ship what the pipeline assembled.

The harm is code you did not review, running with your app's permissions, including on the build machine where tokens live. A lookalike name is a stranger's project with a familiar label. A mix-up replaces a private tool with a public package that picked the same short name. An unpinned action can change after you read it.

Write versions as exact major, minor, and patch, and commit the lockfile. Install from that lockfile and skip scripts until you choose the ones you need. Recompute the integrity hash. Scope every internal name at your registry. Flag names within two edits of a popular package. Pin actions to a full commit id and images to a digest. Review a lockfile diff the way you review your own code.

## A small example

```javascript
const crypto = require('node:crypto');

function sriHash(buf) {
  return 'sha512-' + crypto.createHash('sha512').update(buf).digest('base64');
}

function verifyIntegrity(buf, expected) {
  const actual = Buffer.from(sriHash(buf));
  const want = Buffer.from(expected);
  if (actual.length !== want.length) return false;
  return crypto.timingSafeEqual(actual, want);
}

const bytes = Buffer.from('package-bytes-v1');
const pinned = sriHash(bytes);
const ok = verifyIntegrity(bytes, pinned);
```

`ok` is true when the bytes still match the hash you pinned. A different buffer fails the compare. The check uses `timingSafeEqual` and a hash name you allow.

## What the code below is doing

Five sections, all about trusting other people's code on purpose.

Unpinned versions come first. `findUnpinned` walks `dependencies`, `devDependencies`, and `optionalDependencies`. A version has to match an exact pattern. A caret, a tilde, a star, `latest`, and an open range all land in the bad list.

Integrity is next. `sriHash` builds a `sha512-` digest of the bytes. `verifyIntegrity` recomputes it and compares with `timingSafeEqual`. The algorithm has to be `sha256`, `sha384`, or `sha512`. A matching buffer passes. A changed buffer fails. An `md5` prefix fails.

Dependency confusion is `checkInternalScoped`. Names you marked as internal have to start with your scope. `@myorg/billing-utils` passes. A bare name such as `billing-utils` is reported. The comment above the function shows the registry setting that sends that scope to your own server.

Typosquatting is `editDistance` plus `suspectTyposquat`. A name within two edits of lodash, express, cross-env, react, or axios is flagged. The exact popular name is left alone.

The last section is a checklist: install from the lockfile with scripts ignored, audit plus signature checks, a software bill of materials, actions pinned to a forty-character commit, contents permission limited to read, container images pinned by digest, and lockfile updates reviewed with major bumps left for a person. `actionRef` matches a pinned action and rejects a floating tag and a branch name.

When you talk about it, say this: pin it, lock it, verify the bytes, scan it, and treat the build machine as production.
