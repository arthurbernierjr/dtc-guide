/* git.js — the `git` command for the lesson terminal (term.js). A small, faithful model of the porcelain a
   first unit uses: init, config, status, add, rm, commit, log (--oneline --graph --all), diff (--staged),
   branch, checkout / switch, merge (fast-forward, three-way with real diff3 conflicts, --abort), restore,
   reset, stash, and, for the remote session, remote / push / pull / fetch / clone against an in-memory
   "GitHub". Repositories live on the `.git` directory node of the emulator's filesystem; nothing touches
   the real machine. Messages follow Git 2.47 wording so the reader learns the real sentences. Loaded only
   on pages that have a terminal, after term.js. */
(function () {
  'use strict';
  const T = window.__dtcTerm;
  if (!T) return;
  const { CMDS, ShErr, mkNode, HELP, MAN } = T;
  const USER = 'adventurer';
  const HOME = `/home/${USER}`;
  const HOST = 'newworld';

  /* ---------- small utilities ---------- */
  function hashOf(str) {
    // 40 hex chars from two FNV-1a passes with different seeds; deterministic for the same input.
    let out = '';
    for (let seed = 0; out.length < 40; seed++) {
      let h = (0x811c9dc5 ^ (seed * 0x9e3779b1)) >>> 0;
      for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
      out += h.toString(16).padStart(8, '0');
    }
    return out.slice(0, 40);
  }
  const short = (h) => h.slice(0, 7);
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const p2 = (n) => String(n).padStart(2, '0');
  function gitDate(ms) {
    const d = new Date(ms);
    const off = -d.getTimezoneOffset();
    const sign = off >= 0 ? '+' : '-';
    const a = Math.abs(off);
    return `${DAY[d.getDay()]} ${MON[d.getMonth()]} ${d.getDate()} ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())} ${d.getFullYear()} ${sign}${p2(Math.floor(a / 60))}${p2(a % 60)}`;
  }
  const splitLines = (s) => { if (s === '' || s == null) return []; const l = s.split('\n'); if (l[l.length - 1] === '') l.pop(); return l; };
  const joinLines = (l) => (l.length ? l.join('\n') + '\n' : '');

  /* longest common subsequence of two line arrays → list of [i, j] matches */
  function lcs(a, b) {
    const n = a.length, m = b.length;
    if (n * m > 250000 || n + m > 4000) throw new ShErr('diff is too large for this simulation; use smaller files or run Git locally');
    const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const out = [];
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) { out.push([i, j]); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
      else j++;
    }
    return out;
  }
  /* line diff → ops [{t:' '|'-'|'+', s}] */
  function diffOps(a, b) {
    const m = lcs(a, b);
    const ops = [];
    let i = 0, j = 0;
    for (const [mi, mj] of m) {
      while (i < mi) ops.push({ t: '-', s: a[i++] });
      while (j < mj) ops.push({ t: '+', s: b[j++] });
      ops.push({ t: ' ', s: a[i] }); i++; j++;
    }
    while (i < a.length) ops.push({ t: '-', s: a[i++] });
    while (j < b.length) ops.push({ t: '+', s: b[j++] });
    return ops;
  }
  function counts(a, b) { let ins = 0, del = 0; for (const o of diffOps(a, b)) { if (o.t === '+') ins++; else if (o.t === '-') del++; } return { ins, del }; }

  /* unified diff of one file, three lines of context, like `git diff` */
  function unified(path, oldText, newText, oldLabel, newLabel) {
    const a = splitLines(oldText), b = splitLines(newText);
    const ops = diffOps(a, b);
    if (!ops.some((o) => o.t !== ' ')) return '';
    const head = [`diff --git a/${path} b/${path}`];
    if (oldText == null) head.push('new file mode 100644', `index 0000000..${short(hashOf(newText))}`, '--- /dev/null', `+++ b/${path}`);
    else if (newText == null) head.push('deleted file mode 100644', `index ${short(hashOf(oldText))}..0000000`, `--- a/${path}`, '+++ /dev/null');
    else head.push(`index ${short(hashOf(oldText))}..${short(hashOf(newText))} 100644`, `--- ${oldLabel || 'a/' + path}`, `+++ ${newLabel || 'b/' + path}`);
    // hunks: group changes with up to 3 lines of context
    const hunks = [];
    let k = 0;
    while (k < ops.length) {
      if (ops[k].t === ' ') { k++; continue; }
      let start = Math.max(0, k - 3), end = k;
      while (end < ops.length) {
        if (ops[end].t !== ' ') { end++; continue; }
        // run of context: if the next change is within 6 lines, keep going
        let run = end; while (run < ops.length && ops[run].t === ' ') run++;
        if (run < ops.length && run - end <= 6) { end = run; continue; }
        end = Math.min(ops.length, end + 3); break;
      }
      hunks.push(ops.slice(start, end)); k = end;
    }
    let ai = 0, bi = 0, pos = 0;
    const lines = [];
    for (const h of hunks) {
      // compute starting line numbers by counting ops before the hunk
      const before = ops.slice(pos, ops.indexOf(h[0], pos));
      for (const o of before) { if (o.t !== '+') ai++; if (o.t !== '-') bi++; }
      pos = ops.indexOf(h[0], pos);
      const la = h.filter((o) => o.t !== '+').length, lb = h.filter((o) => o.t !== '-').length;
      lines.push(`@@ -${la ? ai + 1 : ai},${la} +${lb ? bi + 1 : bi},${lb} @@`);
      for (const o of h) { lines.push(o.t + o.s); if (o.t !== '+') ai++; if (o.t !== '-') bi++; }
      pos += h.length;
    }
    const tail = (a.length && !oldText.endsWith('\n')) || (b.length && !newText.endsWith('\n')) ? ['\\ No newline at end of file'] : [];
    return head.concat(lines, tail).join('\n') + '\n';
  }

  /* diff3 merge of line arrays → { lines, conflict } */
  function merge3(base, ours, theirs, oursLabel, theirsLabel) {
    const mo = new Map(lcs(base, ours)), mt = new Map(lcs(base, theirs));
    const out = [];
    let conflict = false;
    let bi = 0, oi = 0, ti = 0;
    const flush = (be, oe, te) => {
      const b = base.slice(bi, be), o = ours.slice(oi, oe), t = theirs.slice(ti, te);
      const same = (x, y) => x.length === y.length && x.every((l, i) => l === y[i]);
      if (same(o, t)) out.push(...o);
      else if (same(o, b)) out.push(...t);
      else if (same(t, b)) out.push(...o);
      else { conflict = true; out.push(`<<<<<<< ${oursLabel}`, ...o, '=======', ...t, `>>>>>>> ${theirsLabel}`); }
      bi = be; oi = oe; ti = te;
    };
    for (let i = 0; i < base.length; i++) {
      const o = mo.get(i), t = mt.get(i);
      if (o === undefined || t === undefined) continue;            // base line changed on at least one side
      // stable line: everything between the previous stable point and here is one unstable region
      flush(i, o, t);
      out.push(base[i]); bi = i + 1; oi = o + 1; ti = t + 1;
    }
    flush(base.length, ours.length, theirs.length);
    return { lines: out, conflict };
  }

  /* gitignore */
  function ignoreMatcher(text) {
    const rules = splitLines(text || '').map((l) => l.trim()).filter((l) => l && !l.startsWith('#') && !l.startsWith('!')).map((pat) => {
      const dirOnly = pat.endsWith('/'); if (dirOnly) pat = pat.slice(0, -1);
      const anchored = pat.includes('/'); if (pat.startsWith('/')) pat = pat.slice(1);
      const re = new RegExp('^' + pat.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*') + '$');
      return { re, dirOnly, anchored };
    });
    return (relPath, isDir) => {
      const parts = relPath.split('/');
      for (let i = 0; i < parts.length; i++) {
        const seg = parts[i], last = i === parts.length - 1;
        const segIsDir = !last || isDir;
        for (const r of rules) {
          if (r.dirOnly && !segIsDir) continue;
          if (r.anchored ? r.re.test(parts.slice(0, i + 1).join('/')) : r.re.test(seg)) return true;
        }
      }
      return false;
    };
  }

  /* ---------- repository model ---------- */
  function newRepo(branch) {
    return { commits: new Map(), refs: new Map(), head: branch, index: new Map(), merge: null, stash: [], seq: 0, remotes: new Map(), upstream: new Map() };
  }
  function cloneTree(m) { return new Map(m); }
  function headHash(repo) { return repo.refs.get(repo.head) || null; }
  // HEAD · main · 7fabaf3 · HEAD~1 · main^ · HEAD~2 → full hash or null
  function resolveRev(repo, rev) {
    const m = rev.match(/^(.*?)((?:~\d*|\^)*)$/);
    const base = m[1] || 'HEAD';
    let h = base === 'HEAD' ? headHash(repo) : repo.refs.get(base) || (repo.remoteRefs && repo.remoteRefs.get(base)) || [...repo.commits.keys()].find((k) => k.startsWith(base) && base.length >= 4) || null;
    if (!h) return null;
    const hops = m[2].match(/~\d*|\^/g) || [];
    for (const hop of hops) {
      const n = hop === '^' ? 1 : hop === '~' ? 1 : Number(hop.slice(1));
      for (let i = 0; i < n && h; i++) { const c = repo.commits.get(h); h = c && c.parents.length ? c.parents[0] : null; }
    }
    return h;
  }
  function treeOf(repo, hash) { return hash ? cloneTree(repo.commits.get(hash).tree) : new Map(); }
  function headTree(repo) { return treeOf(repo, headHash(repo)); }
  function ancestors(repo, hash) { const seen = new Set(); const st = hash ? [hash] : []; while (st.length) { const h = st.pop(); if (seen.has(h)) continue; seen.add(h); st.push(...repo.commits.get(h).parents); } return seen; }
  function isAncestor(repo, a, b) { return !!a && ancestors(repo, b).has(a); }
  function mergeBase(repo, a, b) {
    const A = ancestors(repo, a);
    // breadth-first from b: the first commit also in A is a best common ancestor for the simple histories here
    const q = [b]; const seen = new Set();
    while (q.length) { const h = q.shift(); if (seen.has(h)) continue; seen.add(h); if (A.has(h)) return h; q.push(...repo.commits.get(h).parents); }
    return null;
  }
  function orderCommits(repo, tips) {
    const seen = new Set(); const st = tips.filter(Boolean).slice(); const list = [];
    while (st.length) { const h = st.pop(); if (seen.has(h)) continue; seen.add(h); const c = repo.commits.get(h); list.push(c); st.push(...c.parents); }
    return list.sort((x, y) => y.seq - x.seq);
  }
  function decorations(repo, hash, remote) {
    const names = [];
    for (const [b, h] of repo.refs) if (h === hash) names.push(b === repo.head ? `HEAD -> ${b}` : b);
    for (const [rn, r] of repo.remotes) for (const [b, h] of r.refs) if (h === hash && repo.remoteRefs && repo.remoteRefs.get(`${rn}/${b}`) === hash) names.push(`${rn}/${b}`);
    names.sort((a, b) => (a.startsWith('HEAD') ? -1 : b.startsWith('HEAD') ? 1 : 0));
    return names.length ? `(${names.join(', ')}) ` : '';
  }

  /* ---------- the shell side: find repo, read/write worktree ---------- */
  function findRepo(sh, from) {
    let abs = from || sh.cwd;
    for (;;) {
      const n = sh.node(abs);
      const g = n && n.type === 'dir' && n.children.get('.git');
      if (g && g.repo) return { repo: g.repo, root: abs, gitNode: g };
      if (abs === '/') return null;
      abs = abs.slice(0, abs.lastIndexOf('/')) || '/';
    }
  }
  // `-qb`, `-qu`: clustered single-letter flags, split so each subcommand can keep testing for `-q` and `-b` separately
  function unclump(args, letters) {
    const out = [];
    for (const a of args) {
      if (/^-[a-zA-Z]{2,}$/.test(a) && [...a.slice(1)].every((ch) => letters.includes(ch))) for (const ch of a.slice(1)) out.push('-' + ch);
      else out.push(a);
    }
    return out;
  }
  function requireRepo(sh) {
    const r = findRepo(sh);
    if (!r) throw new ShErr('not a git repository (or any of the parent directories): .git', 'fatal', 128);
    return r;
  }
  function relTo(from, abs) {
    // path of abs relative to directory from (both absolute)
    const f = from.split('/').filter(Boolean), a = abs.split('/').filter(Boolean);
    let i = 0; while (i < f.length && i < a.length && f[i] === a[i]) i++;
    return [...Array(f.length - i).fill('..'), ...a.slice(i)].join('/') || '.';
  }
  function worktree(sh, root) {
    const out = new Map();
    const walk = (node, prefix) => {
      for (const [name, ch] of node.children) {
        if (prefix === '' && name === '.git') continue;
        const p = prefix ? `${prefix}/${name}` : name;
        if (ch.type === 'dir') walk(ch, p); else out.set(p, ch.content);
      }
    };
    walk(sh.node(root), '');
    return out;
  }
  function writeTreeFile(sh, root, rel, content) {
    const parts = rel.split('/');
    let cur = sh.node(root);
    for (let i = 0; i < parts.length - 1; i++) {
      if (!cur.children.has(parts[i])) cur.children.set(parts[i], mkNode('dir', parts[i]));
      cur = cur.children.get(parts[i]);
    }
    const base = parts[parts.length - 1];
    let n = cur.children.get(base);
    if (!n) { n = mkNode('file', base); cur.children.set(base, n); }
    n.content = content; n.mtime = Date.now(); delete n.size;
  }
  function removeTreeFile(sh, root, rel) {
    const parts = rel.split('/');
    const dirs = [sh.node(root)];
    for (let i = 0; i < parts.length - 1; i++) { const d = dirs[dirs.length - 1].children.get(parts[i]); if (!d) return; dirs.push(d); }
    dirs[dirs.length - 1].children.delete(parts[parts.length - 1]);
    for (let i = dirs.length - 1; i > 0; i--) { if (dirs[i].children.size === 0) dirs[i - 1].children.delete(parts[i - 1]); else break; }
  }
  function applyTree(sh, root, fromTree, toTree) {
    for (const [p, c] of toTree) if (fromTree.get(p) !== c) writeTreeFile(sh, root, p, c);
    for (const p of fromTree.keys()) if (!toTree.has(p)) removeTreeFile(sh, root, p);
  }
  function ignoredFn(sh, root) {
    const n = sh.node(`${root}/.gitignore`);
    return ignoreMatcher(n && n.type === 'file' ? n.content : '');
  }

  /* status model */
  function statusOf(sh, ctx) {
    const { repo, root } = ctx;
    const head = headTree(repo), index = repo.index, work = worktree(sh, root);
    const ignored = ignoredFn(sh, root);
    const staged = [], unstaged = [], untracked = [];
    const paths = new Set([...head.keys(), ...index.keys()]);
    for (const p of [...paths].sort()) {
      const inHead = head.has(p), inIdx = index.has(p);
      if (repo.merge && repo.merge.conflicts.has(p)) continue;
      if (inIdx && !inHead) staged.push({ kind: 'new file', path: p });
      else if (!inIdx && inHead) staged.push({ kind: 'deleted', path: p });
      else if (inIdx && inHead && index.get(p) !== head.get(p)) staged.push({ kind: 'modified', path: p });
      if (inIdx) {
        if (!work.has(p)) unstaged.push({ kind: 'deleted', path: p });
        else if (work.get(p) !== index.get(p)) unstaged.push({ kind: 'modified', path: p });
      }
    }
    for (const p of [...work.keys()].sort()) if (!index.has(p) && !ignored(p, false)) untracked.push(p);
    // collapse untracked directories the way git does
    const shown = [];
    for (const p of untracked) {
      const parts = p.split('/');
      let display = p;
      for (let i = 1; i < parts.length; i++) {
        const dir = parts.slice(0, i).join('/') + '/';
        if (![...index.keys()].some((k) => k.startsWith(dir))) { display = dir; break; }
      }
      if (!shown.includes(display)) shown.push(display);
    }
    const conflicts = repo.merge ? [...repo.merge.conflicts].sort() : [];
    return { staged, unstaged, untracked: shown, conflicts, clean: !staged.length && !unstaged.length && !shown.length && !conflicts.length };
  }

  /* ---------- config (~/.gitconfig as a real INI file) ---------- */
  function readConfig(sh) {
    const n = sh.node(`${HOME}/.gitconfig`);
    const out = {};
    if (!n || n.type !== 'file') return out;
    let section = '';
    for (const raw of splitLines(n.content)) {
      const l = raw.trim();
      const m = l.match(/^\[(.+)\]$/);
      if (m) { section = m[1].trim(); continue; }
      const kv = l.match(/^([^=\s]+)\s*=\s*(.*)$/);
      if (kv) out[`${section}.${kv[1]}`] = kv[2];
    }
    return out;
  }
  function writeConfig(sh, key, value) {
    const cfg = readConfig(sh);
    if (value === null) delete cfg[key]; else cfg[key] = value;
    const sections = new Map();
    for (const [k, v] of Object.entries(cfg)) { const i = k.indexOf('.'); const s = k.slice(0, i), name = k.slice(i + 1); if (!sections.has(s)) sections.set(s, []); sections.get(s).push([name, v]); }
    let text = '';
    for (const [s, kvs] of sections) { text += `[${s}]\n`; for (const [k, v] of kvs) text += `\t${k} = ${v}\n`; }
    sh.writeFile(`${HOME}/.gitconfig`, text, false);
  }
  function identity(sh) {
    const c = readConfig(sh);
    return { name: c['user.name'], email: c['user.email'] };
  }

  /* ---------- output helpers ---------- */
  function diffstat(fromTree, toTree) {
    const paths = [...new Set([...fromTree.keys(), ...toTree.keys()])].sort();
    const rows = []; let files = 0, ins = 0, del = 0; const modes = [];
    for (const p of paths) {
      const a = fromTree.get(p), b = toTree.get(p);
      if (a === b) continue;
      const c = counts(splitLines(a == null ? '' : a), splitLines(b == null ? '' : b));
      files++; ins += c.ins; del += c.del;
      rows.push({ p, n: c.ins + c.del, bar: '+'.repeat(Math.min(c.ins, 30)) + '-'.repeat(Math.min(c.del, 30)) });
      if (a == null) modes.push(` create mode 100644 ${p}`);
      if (b == null) modes.push(` delete mode 100644 ${p}`);
    }
    const w = Math.max(0, ...rows.map((r) => r.p.length));
    const nw = Math.max(1, ...rows.map((r) => String(r.n).length));
    const lines = rows.map((r) => ` ${r.p.padEnd(w)} | ${String(r.n).padStart(nw)} ${r.bar}`);
    const summary = ` ${files} file${files === 1 ? '' : 's'} changed` + (ins ? `, ${ins} insertion${ins === 1 ? '' : 's'}(+)` : '') + (del ? `, ${del} deletion${del === 1 ? '' : 's'}(-)` : '');
    return { lines, summary, modes, files, ins, del };
  }
  function statusText(sh, ctx) {
    const { repo, root } = ctx;
    const st = statusOf(sh, ctx);
    const rel = (p) => relTo(sh.cwd, `${root}/${p}`).replace(/\/$/, '') + (p.endsWith('/') ? '/' : '');
    const out = [];
    out.push(`On branch ${repo.head}`);
    if (repo.merge) {
      if (st.conflicts.length) out.push('You have unmerged paths.', '  (fix conflicts and run "git commit")', '  (use "git merge --abort" to abort the merge)');
      else out.push('All conflicts fixed but you are still merging.', '  (use "git commit" to conclude merge)');
      out.push('');
    } else if (!headHash(repo)) out.push('', 'No commits yet', '');
    else {
      const up = repo.upstream.get(repo.head);
      if (up) {
        const r = repo.remotes.get(up.remote); const rh = r && r.refs.get(up.branch);
        const lh = headHash(repo);
        if (rh === lh) out.push(`Your branch is up to date with '${up.remote}/${up.branch}'.`);
        else if (rh && isAncestor(repo, rh, lh)) { const n = orderCommits(repo, [lh]).filter((c) => !ancestors(repo, rh).has(c.hash)).length; out.push(`Your branch is ahead of '${up.remote}/${up.branch}' by ${n} commit${n === 1 ? '' : 's'}.`, '  (use "git push" to publish your local commits)'); }
        else if (rh && repo.commits.has(rh) && isAncestor(repo, lh, rh)) { const n = orderCommits(repo, [rh]).filter((c) => !ancestors(repo, lh).has(c.hash)).length; out.push(`Your branch is behind '${up.remote}/${up.branch}' by ${n} commit${n === 1 ? '' : 's'}, and can be fast-forwarded.`, '  (use "git pull" to update your local branch)'); }
      }
      out.push('');
    }
    if (st.staged.length) {
      out.push('Changes to be committed:', headHash(repo) ? '  (use "git restore --staged <file>..." to unstage)' : '  (use "git rm --cached <file>..." to unstage)');
      for (const s of st.staged) out.push(`\t${(s.kind + ':').padEnd(12)}${rel(s.path)}`);
      out.push('');
    }
    if (st.conflicts.length) {
      out.push('Unmerged paths:', '  (use "git add <file>..." to mark resolution)');
      for (const p of st.conflicts) out.push(`\tboth modified:   ${rel(p)}`);
      out.push('');
    }
    if (st.unstaged.length) {
      out.push('Changes not staged for commit:', '  (use "git add <file>..." to update what will be committed)', '  (use "git restore <file>..." to discard changes in working directory)');
      for (const s of st.unstaged) out.push(`\t${(s.kind + ':').padEnd(12)}${rel(s.path)}`);
      out.push('');
    }
    if (st.untracked.length) {
      out.push('Untracked files:', '  (use "git add <file>..." to include in what will be committed)');
      for (const p of st.untracked) out.push(`\t${rel(p)}`);
      out.push('');
    }
    if (st.clean) out.push(headHash(repo) || repo.merge ? 'nothing to commit, working tree clean' : 'nothing to commit (create/copy files and use "git add" to track)');
    else if (!st.staged.length && !st.conflicts.length) out.push(st.unstaged.length ? 'no changes added to commit (use "git add" and/or "git commit -a")' : 'nothing added to commit but untracked files present (use "git add" to track)');
    else if (st.conflicts.length && !st.staged.length) out.push('no changes added to commit (use "git add" and/or "git commit -a")');
    return out.join('\n').replace(/\n+$/, '') + '\n';
  }
  function shortStatus(sh, ctx) {
    const { root } = ctx;
    const st = statusOf(sh, ctx);
    const rel = (p) => relTo(sh.cwd, `${root}/${p}`);
    const code = { 'new file': 'A', modified: 'M', deleted: 'D' };
    const rows = new Map();
    for (const s of st.staged) rows.set(s.path, [code[s.kind], ' ']);
    for (const s of st.unstaged) { const r = rows.get(s.path) || [' ', ' ']; r[1] = code[s.kind]; rows.set(s.path, r); }
    for (const p of st.conflicts) rows.set(p, ['U', 'U']);
    let out = '';
    for (const [p, r] of [...rows].sort()) out += `${r[0]}${r[1]} ${rel(p)}\n`;
    for (const p of st.untracked) out += `?? ${rel(p)}\n`;
    return out;
  }

  /* resolve pathspecs ("." , "file", "dir/") into repo-relative paths present in index or worktree */
  function pathspec(sh, ctx, specs, { work, index }) {
    const { root } = ctx;
    const all = new Set([...work.keys(), ...index.keys()]);
    const out = new Set();
    for (const s of specs) {
      const abs = sh.resolve(s);
      if (!abs.startsWith(root)) throw new ShErr(`${s}: '${s}' is outside repository at '${root}'`, 'fatal', 128);
      const rel = abs === root ? '' : abs.slice(root.length + 1);
      const n = sh.node(abs);
      let hit = false;
      for (const p of all) { if (rel === '' || p === rel || p.startsWith(rel + '/')) { out.add(p); hit = true; } }
      if (!hit && !(n && n.type === 'dir')) throw new ShErr(`pathspec '${s}' did not match any files`, 'fatal', 128);
    }
    return [...out].sort();
  }

  /* ---------- commands ---------- */
  // three-way merge of whole trees; conflicts get diff3 markers in the result
  function mergeTrees(baseTree, ourTree, theirTree, name, ourName = 'HEAD') {
    const result = new Map(ourTree);
    const conflicts = new Set();
    const notes = [];
    for (const p of new Set([...baseTree.keys(), ...ourTree.keys(), ...theirTree.keys()])) {
      const b = baseTree.get(p), o = ourTree.get(p), t = theirTree.get(p);
      if (o === t) continue;
      if (o === b) { if (t === undefined) result.delete(p); else result.set(p, t); continue; }
      if (t === b) continue;
      if (o === undefined || t === undefined) { conflicts.add(p); notes.push(`CONFLICT (modify/delete): ${p} deleted in ${o === undefined ? ourName : name} and modified in ${o === undefined ? name : ourName}.`); result.set(p, o === undefined ? t : o); continue; }
      const m = merge3(splitLines(b || ''), splitLines(o), splitLines(t), ourName, name);
      notes.push(`Auto-merging ${p}`);
      if (m.conflict) { conflicts.add(p); notes.push(`CONFLICT (content): Merge conflict in ${p}`); }
      result.set(p, joinLines(m.lines));
    }
    return { result, conflicts, notes };
  }
  function makeCommit(sh, ctx, message, parents, tree) {
    const { repo } = ctx;
    const id = identity(sh);
    const now = Date.now();
    repo.seq++;
    const hash = hashOf(`${repo.seq}|${message}|${parents.join(',')}|${[...tree].map(([p, c]) => p + ':' + c).join('|')}|${now}`);
    const c = { hash, parents, tree: cloneTree(tree), message, author: id.name, email: id.email, date: now, seq: repo.seq };
    repo.commits.set(hash, c);
    repo.refs.set(repo.head, hash);
    return c;
  }
  function needIdentity(sh, io) {
    const id = identity(sh);
    if (id.name && id.email) return true;
    io.err('Author identity unknown\n\n*** Please tell me who you are.\n\nRun\n\n  git config --global user.email "you@example.com"\n  git config --global user.name "Your Name"\n\nto set your account\'s default identity.\nOmit --global to set the identity only in this repository.\n\n');
    io.err(`fatal: unable to auto-detect email address (got '${USER}@${HOST}.(none)')\n`);
    return false;
  }
  function checkoutTree(sh, ctx, targetTree, io, what) {
    // refuse when local changes to files that differ would be lost (git's exact rule, simplified to the files that differ)
    const { repo, root } = ctx;
    const cur = headTree(repo), work = worktree(sh, root);
    const blocked = [];
    for (const p of new Set([...cur.keys(), ...targetTree.keys()])) {
      if (cur.get(p) === targetTree.get(p)) continue;
      const dirty = (work.has(p) ? work.get(p) : null) !== (cur.has(p) ? cur.get(p) : null) || (repo.index.has(p) ? repo.index.get(p) : null) !== (cur.has(p) ? cur.get(p) : null);
      if (dirty) blocked.push(p);
    }
    if (blocked.length) {
      io.err(`error: Your local changes to the following files would be overwritten by ${what}:\n${blocked.map((p) => '\t' + p).join('\n')}\nPlease commit your changes or stash them before you ${what === 'merge' ? 'merge' : 'switch branches'}.\nAborting\n`);
      return false;
    }
    // untracked files that the target would overwrite
    const clobber = [...targetTree.keys()].filter((p) => !cur.has(p) && work.has(p) && work.get(p) !== targetTree.get(p));
    if (clobber.length) { io.err(`error: The following untracked working tree files would be overwritten by ${what}:\n${clobber.map((p) => '\t' + p).join('\n')}\nPlease move or remove them before you ${what === 'merge' ? 'merge' : 'switch branches'}.\nAborting\n`); return false; }
    // carry over changes to files identical in both trees; everything else follows the target
    const carried = [];
    for (const p of new Set([...work.keys(), ...repo.index.keys()])) if (cur.get(p) === targetTree.get(p) && cur.has(p) && (work.get(p) !== cur.get(p) || repo.index.get(p) !== cur.get(p))) carried.push(p);
    applyTree(sh, root, cur, targetTree);
    const idx = cloneTree(targetTree);
    for (const p of carried) { if (repo.index.has(p)) idx.set(p, repo.index.get(p)); else idx.delete(p); }
    repo.index = idx;
    return carried;
  }
  function setHeadFile(ctx) { const h = ctx.gitNode.children.get('HEAD'); if (h) h.content = `ref: refs/heads/${ctx.repo.head}\n`; }

  const git = {
    init(sh, args, io) {
      const quiet = args.includes('-q') || args.includes('--quiet');
      const target = args.find((a) => !a.startsWith('-')) || '.';
      const abs = sh.resolve(target);
      let dir = sh.node(abs);
      if (!dir) { const { dir: parent, base } = sh.parentOf(abs); const pn = sh.node(parent); if (!pn) throw new ShErr(`cannot mkdir ${target}: No such file or directory`, 'fatal', 128); dir = mkNode('dir', base); pn.children.set(base, dir); }
      if (dir.children.get('.git') && dir.children.get('.git').repo) { io.write(`Reinitialized existing Git repository in ${abs}/.git/\n`); return 0; }
      const cfg = readConfig(sh);
      let branch = cfg['init.defaultBranch'];
      if (!branch) {
        if (!quiet) io.err("hint: Using 'master' as the name for the initial branch. This default branch name\nhint: is subject to change. To configure the initial branch name to use in all\nhint: of your new repositories, which will suppress this warning, call:\nhint:\nhint: \tgit config --global init.defaultBranch <name>\nhint:\nhint: Names commonly chosen instead of 'master' are 'main', 'trunk' and\nhint: 'development'. The just-created branch can be renamed via this command:\nhint:\nhint: \tgit branch -m <name>\n");
        branch = 'master';
      }
      const g = mkNode('dir', '.git');
      g.repo = newRepo(branch);
      g.children.set('HEAD', mkNode('file', 'HEAD', { content: `ref: refs/heads/${branch}\n` }));
      g.children.set('config', mkNode('file', 'config', { content: '[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n\tbare = false\n\tlogallrefupdates = true\n' }));
      g.children.set('description', mkNode('file', 'description', { content: "Unnamed repository; edit this file 'description' to name the repository.\n" }));
      ['objects', 'refs', 'hooks', 'info'].forEach((d) => g.children.set(d, mkNode('dir', d)));
      g.children.get('refs').children.set('heads', mkNode('dir', 'heads'));
      g.children.get('refs').children.set('tags', mkNode('dir', 'tags'));
      dir.children.set('.git', g);
      if (!quiet) io.write(`Initialized empty Git repository in ${abs}/.git/\n`);
      return 0;
    },
    config(sh, args, io) {
      const rest = args.filter((a) => a !== '--global' && a !== '--local');
      if (rest[0] === '--list' || rest[0] === '-l') { const c = readConfig(sh); for (const [k, v] of Object.entries(c)) io.write(`${k}=${v}\n`); return 0; }
      if (rest[0] === '--unset') { writeConfig(sh, rest[1], null); return 0; }
      if (!rest.length) { io.err('usage: git config [<options>]\n'); return 129; }
      if (rest.length === 1) { const v = readConfig(sh)[rest[0]]; if (v === undefined) return 1; io.write(v + '\n'); return 0; }
      if (!/^[a-z]+\.[A-Za-z]+$/.test(rest[0])) { io.err(`error: key does not contain a section: ${rest[0]}\n`); return 2; }
      writeConfig(sh, rest[0], rest.slice(1).join(' '));
      return 0;
    },
    status(sh, args, io) {
      const ctx = requireRepo(sh);
      io.write(args.includes('-s') || args.includes('--short') ? shortStatus(sh, ctx) : statusText(sh, ctx));
      return 0;
    },
    add(sh, args, io) {
      const ctx = requireRepo(sh);
      const { repo, root } = ctx;
      const flagsOnly = args.filter((a) => a.startsWith('-'));
      let specs = args.filter((a) => !a.startsWith('-'));
      if (flagsOnly.includes('-A') || flagsOnly.includes('--all')) specs = [root];
      if (!specs.length) { io.err("Nothing specified, nothing added.\nhint: Maybe you wanted to say 'git add .'?\nhint: Turn this message off by running\nhint: \"git config advice.addEmptyPathspec false\"\n"); return 0; }
      const work = worktree(sh, root);
      const ignored = ignoredFn(sh, root);
      const paths = pathspec(sh, ctx, specs, { work, index: repo.index });
      for (const p of paths) {
        if (work.has(p)) {
          if (!repo.index.has(p) && ignored(p, false)) {
            const explicit = specs.some((s) => sh.resolve(s) === `${root}/${p}`);
            if (!explicit) continue;
            io.err(`The following paths are ignored by one of your .gitignore files:\n${p}\nhint: Use -f if you really want to add them.\nhint: Turn this message off by running\nhint: "git config advice.addIgnoredFile false"\n`); return 1;
          }
          repo.index.set(p, work.get(p));
        } else repo.index.delete(p);
        if (repo.merge) repo.merge.conflicts.delete(p);
      }
      return 0;
    },
    rm(sh, args, io) {
      const ctx = requireRepo(sh);
      const { repo, root } = ctx;
      const cached = args.includes('--cached');
      const specs = args.filter((a) => !a.startsWith('-'));
      const work = worktree(sh, root);
      const paths = pathspec(sh, ctx, specs, { work, index: repo.index });
      for (const p of paths) {
        if (!repo.index.has(p)) { io.err(`fatal: pathspec '${p}' did not match any files\n`); return 128; }
        repo.index.delete(p);
        if (!cached) removeTreeFile(sh, root, p);
        io.write(`rm '${p}'\n`);
      }
      return 0;
    },
    commit(sh, args, io) {
      const ctx = requireRepo(sh);
      const { repo, root } = ctx;
      let message = null, all = false, quiet = false;
      const amend = args.includes('--amend');
      const noEdit = args.includes('--no-edit');
      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '--all') all = true;
        else if (a === '--quiet') quiet = true;
        else if (a === '--message') message = args[++i];
        else if (a.startsWith('--message=')) message = a.slice(10);
        else if (/^-[a-zA-Z]+$/.test(a)) { for (let k = 1; k < a.length; k++) { const ch = a[k]; if (ch === 'a') all = true; else if (ch === 'q') quiet = true; else if (ch === 'm') { message = k + 1 < a.length ? a.slice(k + 1) : args[++i]; break; } else { io.err(`error: unknown switch \`${ch}'\n`); return 129; } } }
      }
      if (!needIdentity(sh, io)) return 128;
      if (repo.merge && repo.merge.conflicts.size) { io.err("error: Committing is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use 'git add/rm <file>'\nhint: as appropriate to mark resolution and make a commit.\nfatal: Exiting because of an unresolved conflict.\n"); return 128; }
      if (all) { const work = worktree(sh, root); for (const p of [...repo.index.keys()]) { if (work.has(p)) repo.index.set(p, work.get(p)); else repo.index.delete(p); } }
      if (amend) {
        const last = headHash(repo);
        if (!last) { io.err('fatal: You have nothing to amend.\n'); return 128; }
        if (repo.merge) { io.err('fatal: You are in the middle of a merge -- cannot amend.\n'); return 128; }
        const lc = repo.commits.get(last);
        if (message === null) { if (!noEdit) { io.err("error: no commit message given.\nhint: on this page there is no editor to open; pass --no-edit to keep the message or -m \"...\" to change it\n"); return 1; } message = lc.message; }
        const base = lc.parents.length ? treeOf(repo, lc.parents[0]) : new Map();
        repo.seq++;
        const now = Date.now();
        const hash = hashOf(`${repo.seq}|${message}|${lc.parents.join(',')}|${[...repo.index].map(([p, c]) => p + ':' + c).join('|')}|${now}`);
        const nc = { hash, parents: lc.parents.slice(), tree: cloneTree(repo.index), message, author: lc.author, email: lc.email, date: lc.date, seq: repo.seq };
        repo.commits.set(hash, nc);
        for (const [n, h] of repo.refs) if (h === last) repo.refs.set(n, hash);
        if (!quiet) { const ds = diffstat(base, nc.tree); io.write(`[${repo.head}${lc.parents.length ? '' : ' (root-commit)'} ${short(hash)}] ${message.split('\n')[0]}\n Date: ${gitDate(lc.date)}\n${ds.summary}\n${ds.modes.map((m) => m + '\n').join('')}`); }
        return 0;
      }
      const head = headTree(repo);
      const same = head.size === repo.index.size && [...repo.index].every(([p, c]) => head.get(p) === c);
      if (same && !repo.merge) { io.write(statusText(sh, ctx)); return 1; }
      if (message === null) {
        if (repo.merge) message = repo.merge.message || `Merge branch '${repo.merge.name}'`;
        else { io.err("error: no commit message given.\nhint: on this page there is no editor to open; pass the message with -m \"...\"\n"); return 1; }
      }
      if (!message.trim()) { io.err('Aborting commit due to empty commit message.\n'); return 1; }
      const parents = headHash(repo) ? [headHash(repo)] : [];
      if (repo.merge) parents.push(repo.merge.theirs);
      const root0 = !parents.length;
      const wasMerge = !!repo.merge;
      const c = makeCommit(sh, ctx, message, parents, repo.index);
      const ds = diffstat(head, c.tree);
      // a merge commit reports only its header line, like git; ordinary commits add the diffstat summary
      if (!quiet) io.write(`[${repo.head}${root0 ? ' (root-commit)' : ''} ${short(c.hash)}] ${message.split('\n')[0]}\n${wasMerge ? '' : ds.summary + '\n' + ds.modes.map((m) => m + '\n').join('')}`);
      repo.merge = null;
      return 0;
    },
    log(sh, args, io) {
      const ctx = requireRepo(sh);
      const { repo } = ctx;
      const oneline = args.includes('--oneline');
      const graph = args.includes('--graph');
      const all = args.includes('--all');
      let limit = Infinity;
      for (let i = 0; i < args.length; i++) { const m = args[i].match(/^-(\d+)$/) || (args[i] === '-n' && [null, args[i + 1]]) || (args[i].startsWith('--max-count=') && [null, args[i].slice(12)]); if (m) limit = Number(m[1]); }
      if (!headHash(repo) && !(all && repo.refs.size)) { io.err(`fatal: your current branch '${repo.head}' does not have any commits yet\n`); return 128; }
      const tips = all ? [...new Set([...repo.refs.values(), ...(repo.remoteRefs ? repo.remoteRefs.values() : [])])] : [headHash(repo)];
      const list = orderCommits(repo, tips).slice(0, limit);
      const line1 = (c) => `${short(c.hash)} ${decorations(repo, c.hash)}${c.message.split('\n')[0]}`;
      const stat = args.includes('--stat');
      const statOf = (c) => { if (!stat || c.parents.length > 1) return []; const ds = diffstat(c.parents.length ? treeOf(repo, c.parents[0]) : new Map(), c.tree); return ds.lines.concat(ds.summary, ''); };
      const full = (c) => [`commit ${c.hash} ${decorations(repo, c.hash).trim()}`.trimEnd(), ...(c.parents.length > 1 ? [`Merge: ${c.parents.map(short).join(' ')}`] : []), `Author: ${c.author} <${c.email}>`, `Date:   ${gitDate(c.date)}`, '', ...c.message.split('\n').map((l) => '    ' + l), '', ...statOf(c)];
      if (!graph) { for (const c of list) io.write(oneline ? line1(c) + '\n' : full(c).join('\n') + '\n'); return 0; }
      // lanes
      let lanes = [];
      const rows = [];
      const laneRow = (mark) => lanes.map((h, j) => mark(j)).join(' ');
      for (const c of list) {
        let i = lanes.indexOf(c.hash);
        if (i < 0) { lanes.push(c.hash); i = lanes.length - 1; }
        const isMerge = c.parents.length > 1;
        const body = oneline ? [line1(c)] : full(c);
        rows.push(laneRow((j) => (j === i ? '*' : '|')) + (isMerge ? '  ' : '') + ' ' + body[0]);
        for (const extra of body.slice(1)) rows.push((laneRow(() => '|') + ' ' + extra).trimEnd());
        if (!c.parents.length) { lanes.splice(i, 1); continue; }
        lanes[i] = c.parents[0];
        let added = 0;
        for (const p of c.parents.slice(1)) if (!lanes.includes(p)) { lanes.splice(i + 1 + added, 0, p); added++; }
        if (isMerge) rows.push(lanes.map((h, j) => (j === i ? '|' : j === i + 1 && added ? '\\' : '|')).join(' ').replace('| \\', '|\\'));
        // converge duplicate lanes
        for (let a = 0; a < lanes.length; a++) for (let b = a + 1; b < lanes.length; b++) if (lanes[a] === lanes[b]) { rows.push(lanes.map((h, j) => (j === b ? '/' : '|')).join(' ').replace(/\| \//, '|/')); lanes.splice(b, 1); b--; }
      }
      io.write(rows.join('\n') + '\n');
      return 0;
    },
    diff(sh, args, io) {
      const ctx = requireRepo(sh);
      const { repo, root } = ctx;
      const staged = args.includes('--staged') || args.includes('--cached');
      const specs = args.filter((a) => !a.startsWith('-'));
      const work = worktree(sh, root);
      const from = staged ? headTree(repo) : repo.index;
      const to = staged ? repo.index : work;
      let paths = [...new Set([...from.keys(), ...to.keys()])].sort();
      if (!staged) paths = paths.filter((p) => repo.index.has(p));          // untracked files never appear in git diff
      if (specs.length) { const want = new Set(pathspec(sh, ctx, specs, { work, index: repo.index })); paths = paths.filter((p) => want.has(p)); }
      let out = '';
      for (const p of paths) { const a = from.has(p) ? from.get(p) : null, b = to.has(p) ? to.get(p) : null; if (a !== b) out += unified(p, a, b); }
      io.write(out);
      return 0;
    },
    branch(sh, args, io) {
      const ctx = requireRepo(sh);
      const { repo, root } = ctx;
      const flags = args.filter((a) => a.startsWith('-')), rest = args.filter((a) => !a.startsWith('-'));
      if (flags.includes('-m') || flags.includes('-M')) {
        const [from, to] = rest.length === 2 ? rest : [repo.head, rest[0]];
        if (!repo.refs.has(from) && headHash(repo)) { io.err(`error: refname refs/heads/${from} not found\nfatal: Branch rename failed\n`); return 128; }
        if (from === to) return 0;
        if (repo.refs.has(to) && !flags.includes('-M')) { io.err(`fatal: a branch named '${to}' already exists\n`); return 128; }
        if (repo.refs.has(from)) { repo.refs.set(to, repo.refs.get(from)); repo.refs.delete(from); }
        if (repo.upstream.has(from)) { repo.upstream.set(to, repo.upstream.get(from)); repo.upstream.delete(from); }
        if (repo.head === from) { repo.head = to; setHeadFile(ctx); }
        return 0;
      }
      if (flags.includes('-d') || flags.includes('-D')) {
        for (const name of rest) {
          if (!repo.refs.has(name)) { io.err(`error: branch '${name}' not found\n`); return 1; }
          if (name === repo.head) { io.err(`error: cannot delete branch '${name}' used by worktree at '${root}'\n`); return 1; }
          if (flags.includes('-d') && !isAncestor(repo, repo.refs.get(name), headHash(repo))) { io.err(`error: the branch '${name}' is not fully merged\nhint: If you are sure you want to delete it, run 'git branch -D ${name}'\n`); return 1; }
          const h = repo.refs.get(name); repo.refs.delete(name);
          io.write(`Deleted branch ${name} (was ${short(h)}).\n`);
        }
        return 0;
      }
      if (!rest.length) {
        const names = [...repo.refs.keys()].sort();
        if (!names.length && headHash(repo) === null) return 0;
        const nw = Math.max(...names.map((n) => n.length));
        for (const n of names) io.write(`${n === repo.head ? '* ' : '  '}${flags.includes('-v') ? `${n.padEnd(nw)} ${short(repo.refs.get(n))} ${repo.commits.get(repo.refs.get(n)).message.split('\n')[0]}` : n}\n`);
        if (flags.includes('-a') || flags.includes('--all')) for (const k of (repo.remoteRefs ? [...repo.remoteRefs.keys()] : []).sort()) io.write(`  remotes/${k}\n`);
        return 0;
      }
      const name = rest[0];
      if (!headHash(repo)) { io.err(`fatal: not a valid object name: '${repo.head}'\n`); return 128; }
      if (repo.refs.has(name)) { io.err(`fatal: a branch named '${name}' already exists\n`); return 128; }
      if (!/^[A-Za-z0-9._\/-]+$/.test(name) || name.startsWith('-')) { io.err(`fatal: '${name}' is not a valid branch name\n`); return 128; }
      repo.refs.set(name, rest[1] && repo.refs.has(rest[1]) ? repo.refs.get(rest[1]) : headHash(repo));
      return 0;
    },
    switchTo(sh, ctx, name, io, create) {
      const { repo } = ctx;
      if (create) {
        if (repo.refs.has(name)) { io.err(`fatal: a branch named '${name}' already exists\n`); return 128; }
        if (!headHash(repo)) { // switching the name of an unborn branch
          repo.head = name; setHeadFile(ctx); io.write(`Switched to a new branch '${name}'\n`); return 0;
        }
        repo.refs.set(name, headHash(repo));
        repo.head = name; setHeadFile(ctx);
        io.write(`Switched to a new branch '${name}'\n`);
        return 0;
      }
      if (!repo.refs.has(name)) {
        const remoteHit = repo.remoteRefs && [...repo.remoteRefs.keys()].find((k) => k.endsWith('/' + name));
        if (remoteHit) { repo.refs.set(name, repo.remoteRefs.get(remoteHit)); repo.upstream.set(name, { remote: remoteHit.split('/')[0], branch: name }); io.write(`branch '${name}' set up to track '${remoteHit}'.\n`); }
        else { io.err(`error: pathspec '${name}' did not match any file(s) known to git\n`); return 1; }
      }
      if (name === repo.head) { io.write(`Already on '${name}'\n`); return 0; }
      if (repo.merge) { io.err(`error: you need to resolve your current index first\n`); return 1; }
      const carried = checkoutTree(sh, ctx, treeOf(repo, repo.refs.get(name)), io, 'checkout');
      if (carried === false) return 1;
      repo.head = name; setHeadFile(ctx);
      for (const p of carried) io.write(`M\t${p}\n`);
      io.write(`Switched to branch '${name}'\n`);
      const up = repo.upstream.get(name);
      if (up) { const r = repo.remotes.get(up.remote); if (r && r.refs.get(up.branch) === headHash(repo)) io.write(`Your branch is up to date with '${up.remote}/${up.branch}'.\n`); }
      return 0;
    },
    checkout(sh, args, io) {
      const ctx = requireRepo(sh);
      const { repo, root } = ctx;
      args = unclump(args, 'qbB');
      if (args.includes('-q') || args.includes('--quiet')) { args = args.filter((a) => a !== '-q' && a !== '--quiet'); io = { write: () => {}, err: io.err }; }
      if (args[0] === '-b' || args[0] === '-B') { if (!args[1]) { io.err("fatal: missing branch name; try -b <name>\n"); return 128; } return git.switchTo(sh, ctx, args[1], io, true); }
      const dd = args.indexOf('--');
      if (dd >= 0 || (args.length && !repo.refs.has(args[0]) && (sh.get(args[0]) || repo.index.has(args[0])))) {
        // git checkout -- <file>: restore from the index
        const specs = dd >= 0 ? args.slice(dd + 1) : args;
        const work = worktree(sh, root);
        for (const p of pathspec(sh, ctx, specs, { work, index: repo.index })) { if (repo.index.has(p)) writeTreeFile(sh, root, p, repo.index.get(p)); else { io.err(`error: pathspec '${p}' did not match any file(s) known to git\n`); return 1; } }
        return 0;
      }
      if (!args.length) { io.write(statusText(sh, ctx)); return 0; }
      return git.switchTo(sh, ctx, args[0], io, false);
    },
    switch(sh, args, io) {
      const ctx = requireRepo(sh);
      if (args[0] === '-c' || args[0] === '-C') { if (!args[1]) { io.err('fatal: missing branch name; try -c <name>\n'); return 128; } return git.switchTo(sh, ctx, args[1], io, true); }
      if (!args.length) { io.err('fatal: missing branch or commit argument\n'); return 128; }
      return git.switchTo(sh, ctx, args[0], io, false);
    },
    merge(sh, args, io, viaPull) {
      // viaPull: { label, message } — `git pull` merges FETCH_HEAD, so markers carry the commit hash and the message names the remote
      const ctx = requireRepo(sh);
      const { repo, root } = ctx;
      if (args[0] === '--abort') {
        if (!repo.merge) { io.err('fatal: There is no merge to abort (MERGE_HEAD missing).\n'); return 128; }
        applyTree(sh, root, worktree(sh, root), headTree(repo)); repo.index = headTree(repo); repo.merge = null; return 0;
      }
      const name = args.find((a) => !a.startsWith('-'));
      if (!name) { io.err('fatal: No remote for the current branch.\n'); return 128; }
      if (repo.merge) { io.err('error: Merging is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use \'git add/rm <file>\'\nhint: as appropriate to mark resolution and make a commit.\nfatal: Exiting because of an unresolved conflict.\n'); return 128; }
      let theirs = repo.refs.get(name);
      if (!theirs && repo.remoteRefs && repo.remoteRefs.has(name)) theirs = repo.remoteRefs.get(name);
      if (!theirs) { io.err(`merge: ${name} - not something we can merge\n`); return 1; }
      const ours = headHash(repo);
      if (!ours) { // merging into an unborn branch: just take theirs
        repo.refs.set(repo.head, theirs); const t = treeOf(repo, theirs); applyTree(sh, root, worktree(sh, root), t); repo.index = t; return 0;
      }
      const base = mergeBase(repo, ours, theirs);
      if (base === theirs) { io.write('Already up to date.\n'); return 0; }
      const theirTree = treeOf(repo, theirs), ourTree = headTree(repo), baseTree = treeOf(repo, base);
      if (base === ours) {
        // fast-forward
        const carried = checkoutTree(sh, ctx, theirTree, io, 'merge');
        if (carried === false) return 1;
        repo.refs.set(repo.head, theirs);
        const ds = diffstat(ourTree, theirTree);
        io.write(`Updating ${short(ours)}..${short(theirs)}\nFast-forward\n${ds.lines.map((l) => l + '\n').join('')}${ds.summary}\n${ds.modes.map((m) => m + '\n').join('')}`);
        return 0;
      }
      // three-way
      if (!needIdentity(sh, io)) return 128;
      const st = statusOf(sh, ctx);
      if (st.staged.length || st.unstaged.length) {
        const touched = [...new Set([...st.staged, ...st.unstaged].map((s) => s.path))].filter((p) => theirTree.get(p) !== baseTree.get(p));
        if (touched.length) { io.err(`error: Your local changes to the following files would be overwritten by merge:\n${touched.map((p) => '\t' + p).join('\n')}\nPlease commit your changes or stash them before you merge.\nAborting\n`); return 1; }
      }
      const label = viaPull ? viaPull.label : name;
      const message = viaPull ? viaPull.message : repo.refs.has(name) ? `Merge branch '${name}'` : `Merge remote-tracking branch '${name}'`;
      const { result, conflicts, notes } = mergeTrees(baseTree, ourTree, theirTree, label);
      applyTree(sh, root, worktree(sh, root), result);
      repo.index = new Map(result);
      for (const p of conflicts) repo.index.set(p, ourTree.get(p) === undefined ? '' : ourTree.get(p)); // the index keeps "ours" until git add
      if (conflicts.size) {
        repo.merge = { theirs, name, message, conflicts };
        io.write(notes.join('\n') + '\nAutomatic merge failed; fix conflicts and then commit the result.\n');
        return 1;
      }
      const c = makeCommit(sh, ctx, message, [ours, theirs], result);
      const ds = diffstat(ourTree, c.tree);
      io.write(`${notes.filter((n) => n.startsWith('Auto-merging')).map((n) => n + '\n').join('')}Merge made by the 'ort' strategy.\n${ds.lines.map((l) => l + '\n').join('')}${ds.summary}\n${ds.modes.map((m) => m + '\n').join('')}`);
      return 0;
    },
    restore(sh, args, io) {
      const ctx = requireRepo(sh);
      const { repo, root } = ctx;
      const staged = args.includes('--staged');
      const specs = args.filter((a) => !a.startsWith('-'));
      if (!specs.length) { io.err('fatal: you must specify path(s) to restore\n'); return 128; }
      const work = worktree(sh, root);
      const paths = pathspec(sh, ctx, specs, { work, index: repo.index });
      const head = headTree(repo);
      for (const p of paths) {
        if (staged) { if (head.has(p)) repo.index.set(p, head.get(p)); else repo.index.delete(p); }
        else if (repo.index.has(p)) writeTreeFile(sh, root, p, repo.index.get(p));
        else { io.err(`error: pathspec '${p}' did not match any file(s) known to git\n`); return 1; }
      }
      return 0;
    },
    reset(sh, args, io) {
      const ctx = requireRepo(sh);
      const { repo, root } = ctx;
      if (args.includes('--hard')) {
        const rev = args.find((a) => !a.startsWith('-'));
        let target = headHash(repo);
        if (rev) { target = resolveRev(repo, rev); if (!target) { io.err(`fatal: ambiguous argument '${rev}': unknown revision or path not in the working tree.\nUse '--' to separate paths from revisions, like this:\n'git <command> [<revision>...] -- [<file>...]'\n`); return 128; } }
        if (target) repo.refs.set(repo.head, target);
        const t = headTree(repo); applyTree(sh, root, worktree(sh, root), t); repo.index = t; repo.merge = null;
        io.write(target ? `HEAD is now at ${short(target)} ${repo.commits.get(target).message.split('\n')[0]}\n` : '');
        return 0;
      }
      const specs = args.filter((a) => !a.startsWith('-') && a !== 'HEAD');
      const head = headTree(repo);
      const paths = specs.length ? pathspec(sh, ctx, specs, { work: worktree(sh, root), index: repo.index }) : [...new Set([...repo.index.keys(), ...head.keys()])];
      const changed = [];
      for (const p of paths) { if (repo.index.get(p) !== head.get(p)) changed.push(p); if (head.has(p)) repo.index.set(p, head.get(p)); else repo.index.delete(p); }
      const work = worktree(sh, root);
      const left = changed.filter((p) => work.get(p) !== head.get(p));
      if (left.length) io.write('Unstaged changes after reset:\n' + left.map((p) => `M\t${p}`).join('\n') + '\n');
      return 0;
    },
    stash(sh, args, io) {
      const ctx = requireRepo(sh);
      const { repo, root } = ctx;
      const sub = args[0] && !args[0].startsWith('-') ? args[0] : 'push';
      const h = headHash(repo);
      if (sub === 'list') { repo.stash.forEach((s, i) => io.write(`stash@{${i}}: ${s.label}\n`)); return 0; }
      if (sub === 'push' || sub === 'save') {
        if (!h) { io.err('You do not have the initial commit yet\n'); return 1; }
        const st = statusOf(sh, ctx);
        if (!st.staged.length && !st.unstaged.length) { io.write('No local changes to save\n'); return 0; }
        const label = `WIP on ${repo.head}: ${short(h)} ${repo.commits.get(h).message.split('\n')[0]}`;
        const work = worktree(sh, root);
        const tracked = new Map([...work].filter(([p]) => repo.index.has(p)));
        repo.stash.unshift({ label, index: cloneTree(repo.index), work: tracked, base: h });
        const t = headTree(repo);
        for (const p of repo.index.keys()) { if (t.has(p)) writeTreeFile(sh, root, p, t.get(p)); else removeTreeFile(sh, root, p); }
        repo.index = t;
        io.write(`Saved working directory and index state ${label}\n`);
        return 0;
      }
      if (sub === 'pop' || sub === 'apply') {
        const s = repo.stash[0];
        if (!s) { io.err('No stash entries found.\n'); return 1; }
        for (const [p, c] of s.work) writeTreeFile(sh, root, p, c);
        for (const [p, c] of s.index) repo.index.set(p, c);
        if (sub === 'pop') repo.stash.shift();
        io.write(statusText(sh, ctx));
        if (sub === 'pop') io.write(`Dropped refs/stash@{0} (${hashOf(s.label + s.base)})\n`);
        return 0;
      }
      if (sub === 'drop') { if (!repo.stash.length) { io.err('No stash entries found.\n'); return 1; } const s = repo.stash.shift(); io.write(`Dropped refs/stash@{0} (${hashOf(s.label + s.base)})\n`); return 0; }
      if (sub === 'clear') { repo.stash = []; return 0; }
      io.err(`error: unknown subcommand: '${sub}'\n`); return 129;
    },
    show(sh, args, io) {
      const ctx = requireRepo(sh);
      const { repo } = ctx;
      const ref = args.find((a) => !a.startsWith('-')) || 'HEAD';
      const h = resolveRev(repo, ref);
      if (!h) { io.err(`fatal: ambiguous argument '${ref}': unknown revision or path not in the working tree.\nUse '--' to separate paths from revisions, like this:\n'git <command> [<revision>...] -- [<file>...]'\n`); return 128; }
      const c = repo.commits.get(h);
      const parentTree = c.parents.length ? treeOf(repo, c.parents[0]) : new Map();
      io.write(`commit ${c.hash} ${decorations(repo, c.hash).trim()}`.trimEnd() + (c.parents.length > 1 ? `\nMerge: ${c.parents.map(short).join(' ')}` : '') + `\nAuthor: ${c.author} <${c.email}>\nDate:   ${gitDate(c.date)}\n\n${c.message.split('\n').map((l) => '    ' + l).join('\n')}\n\n`);
      if (args.includes('--stat')) { const ds = diffstat(parentTree, c.tree); io.write(ds.lines.concat(ds.summary).join('\n') + '\n'); return 0; }
      for (const p of [...new Set([...parentTree.keys(), ...c.tree.keys()])].sort()) { const a = parentTree.has(p) ? parentTree.get(p) : null, b = c.tree.has(p) ? c.tree.get(p) : null; if (a !== b) io.write(unified(p, a, b)); }
      return 0;
    },

    /* ---------- remotes: an in-memory GitHub (session 1.4) ---------- */
    remote(sh, args, io) {
      const ctx = requireRepo(sh);
      const { repo } = ctx;
      const sub = args[0];
      if (!sub || sub === '-v' || sub === '--verbose') { for (const [n, r] of repo.remotes) io.write(sub ? `${n}\t${r.url} (fetch)\n${n}\t${r.url} (push)\n` : `${n}\n`); return 0; }
      if (sub === 'add') {
        const [, name, url] = args;
        if (!name || !url) { io.err('usage: git remote add [<options>] <name> <url>\n'); return 129; }
        if (repo.remotes.has(name)) { io.err(`error: remote ${name} already exists.\n`); return 3; }
        const hub = GitHub.repoFor(sh, url, true);
        repo.remotes.set(name, { url, refs: hub.refs, hub });
        return 0;
      }
      if (sub === 'remove' || sub === 'rm') { if (!repo.remotes.delete(args[1])) { io.err(`error: No such remote: '${args[1]}'\n`); return 2; } return 0; }
      if (sub === 'get-url') { const r = repo.remotes.get(args[1]); if (!r) { io.err(`error: No such remote '${args[1]}'\n`); return 2; } io.write(r.url + '\n'); return 0; }
      if (sub === 'set-url') { const r = repo.remotes.get(args[1]); if (!r) { io.err(`error: No such remote '${args[1]}'\n`); return 2; } r.url = args[2]; return 0; }
      io.err(`error: unknown subcommand: '${sub}'\n`); return 129;
    },
    push(sh, args, io) {
      const ctx = requireRepo(sh);
      const { repo } = ctx;
      args = unclump(args, 'quf');
      if (args.includes('-q') || args.includes('--quiet')) io = { write: () => {}, err: io.err };
      const setUp = args.includes('-u') || args.includes('--set-upstream');
      const force = args.includes('-f') || args.includes('--force');
      const rest = args.filter((a) => !a.startsWith('-'));
      let [remoteName, branch] = rest;
      if (args.includes('--delete') || args.includes('-d')) {
        const r = repo.remotes.get(remoteName);
        if (!r) { io.err(`fatal: '${remoteName || ''}' does not appear to be a git repository\nfatal: Could not read from remote repository.\n\nPlease make sure you have the correct access rights\nand the repository exists.\n`); return 128; }
        if (!GitHub.authorized(sh, r.url, io, true)) return 128;
        if (!r.hub.refs.has(branch)) { io.err(`error: unable to delete '${branch}': remote ref does not exist\nerror: failed to push some refs to '${r.url}'\n`); return 1; }
        if (branch === (r.hub.defaultBranch || 'main')) { io.err(`To ${r.url}\n ! [remote rejected] ${branch} (refusing to delete the current branch: refs/heads/${branch})\nerror: failed to push some refs to '${r.url}'\n`); return 1; }
        r.hub.refs.delete(branch);
        if (repo.remoteRefs) repo.remoteRefs.delete(`${remoteName}/${branch}`);
        io.write(`To ${r.url}\n - [deleted]         ${branch}\n`);
        return 0;
      }
      const up = repo.upstream.get(repo.head);
      if (!remoteName) { if (!up) { if (!repo.remotes.size) { io.err('fatal: No configured push destination.\nEither specify the URL from the command-line or configure a remote repository using\n\n    git remote add <name> <url>\n\nand then push using the remote name\n\n    git push <name>\n\n'); return 128; } io.err(`fatal: The current branch ${repo.head} has no upstream branch.\nTo push the current branch and set the remote as upstream, use\n\n    git push --set-upstream origin ${repo.head}\n\nTo have this happen automatically for branches without a tracking\nupstream, see 'push.autoSetupRemote' in 'git help config'.\n\n`); return 128; } remoteName = up.remote; branch = up.branch; }
      if (!branch) branch = repo.head;
      const r = repo.remotes.get(remoteName);
      if (!r) { io.err(`fatal: '${remoteName}' does not appear to be a git repository\nfatal: Could not read from remote repository.\n\nPlease make sure you have the correct access rights\nand the repository exists.\n`); return 128; }
      if (!GitHub.authorized(sh, r.url, io, true)) return 128;
      const local = repo.refs.get(branch);
      if (!local) { io.err(`error: src refspec ${branch} does not match any\nerror: failed to push some refs to '${r.url}'\n`); return 1; }
      const remoteHash = r.hub.refs.get(branch);
      if (remoteHash && remoteHash !== local && !force) {
        if (!repo.commits.has(remoteHash) || !isAncestor(repo, remoteHash, local)) {
          io.err(`To ${r.url}\n ! [rejected]        ${branch} -> ${branch} (fetch first)\nerror: failed to push some refs to '${r.url}'\nhint: Updates were rejected because the remote contains work that you do not\nhint: have locally. This is usually caused by another repository pushing to\nhint: the same ref. If you want to integrate the remote changes, use\nhint: 'git pull' before pushing again.\nhint: See the 'Note about fast-forwards' in 'git push --help' for details.\n`);
          return 1;
        }
      }
      // transfer objects
      let n = 0;
      for (const c of orderCommits(repo, [local])) if (!r.hub.commits.has(c.hash)) { r.hub.commits.set(c.hash, c); n++; }
      const isNew = !remoteHash;
      r.hub.refs.set(branch, local);
      if (!r.hub.defaultBranch) r.hub.defaultBranch = branch;
      if (!repo.remoteRefs) repo.remoteRefs = new Map();
      repo.remoteRefs.set(`${remoteName}/${branch}`, local);
      if (n) io.write(`Enumerating objects: ${n * 3}, done.\nCounting objects: 100% (${n * 3}/${n * 3}), done.\nDelta compression using up to 8 threads\nCompressing objects: 100% (${n * 2}/${n * 2}), done.\nWriting objects: 100% (${n * 3}/${n * 3}), ${(n * 412 + 120).toLocaleString()} bytes | ${(n * 412 + 120).toLocaleString()}.00 KiB/s, done.\nTotal ${n * 3} (delta ${Math.max(0, n - 1)}), reused 0 (delta 0), pack-reused 0 (from 0)\n`);
      io.write(`To ${r.url}\n${isNew ? ` * [new branch]      ${branch} -> ${branch}` : remoteHash === local ? 'Everything up-to-date' : `   ${short(remoteHash)}..${short(local)}  ${branch} -> ${branch}`}\n`);
      if (isNew && remoteHash === undefined && !n) io.write('');
      if (setUp) { repo.upstream.set(branch, { remote: remoteName, branch }); io.write(`branch '${branch}' set up to track '${remoteName}/${branch}'.\n`); }
      GitHub.noteActivity(r.hub, { kind: 'push', branch, by: USER });
      return 0;
    },
    fetch(sh, args, io) {
      const ctx = requireRepo(sh);
      const { repo } = ctx;
      const name = args.find((a) => !a.startsWith('-')) || (repo.upstream.get(repo.head) || {}).remote || 'origin';
      const r = repo.remotes.get(name);
      if (!r) { io.err(`fatal: '${name}' does not appear to be a git repository\nfatal: Could not read from remote repository.\n\nPlease make sure you have the correct access rights\nand the repository exists.\n`); return 128; }
      if (!repo.remoteRefs) repo.remoteRefs = new Map();
      let any = false; const lines = [];
      for (const [b, h] of r.hub.refs) {
        for (const c of orderCommits(r.hub, [h])) if (!repo.commits.has(c.hash)) { repo.commits.set(c.hash, c); repo.seq = Math.max(repo.seq, c.seq); any = true; }
        const old = repo.remoteRefs.get(`${name}/${b}`);
        if (old !== h) { lines.push(old ? `   ${short(old)}..${short(h)}  ${b.padEnd(10)} -> ${name}/${b}` : ` * [new branch]      ${b.padEnd(10)} -> ${name}/${b}`); repo.remoteRefs.set(`${name}/${b}`, h); any = true; }
      }
      if (any) io.write(`From ${r.url.replace(/\.git$/, '').replace(/^[^@/]+@/, '')}\n${lines.join('\n')}\n`);
      return 0;
    },
    pull(sh, args, io) {
      const ctx = requireRepo(sh);
      const { repo } = ctx;
      const rest = args.filter((a) => !a.startsWith('-'));
      const up = repo.upstream.get(repo.head);
      const name = rest[0] || (up && up.remote);
      const branch = rest[1] || (up && up.branch) || repo.head;
      if (!name) { io.err(`There is no tracking information for the current branch.\nPlease specify which branch you want to merge with.\nSee git-pull(1) for details.\n\n    git pull <remote> <branch>\n\nIf you wish to set tracking information for this branch you can do so with:\n\n    git branch --set-upstream-to=origin/<branch> ${repo.head}\n\n`); return 1; }
      const before = repo.remoteRefs ? repo.remoteRefs.get(`${name}/${branch}`) : undefined;
      const st = git.fetch(sh, [name], io);
      if (st) return st;
      const h = repo.remoteRefs.get(`${name}/${branch}`);
      if (!h) { io.err(`fatal: couldn't find remote ref ${branch}\n`); return 1; }
      void before;
      const r = repo.remotes.get(name);
      return git.merge(sh, [`${name}/${branch}`], io, { label: h, message: `Merge branch '${branch}' of ${r.url.replace(/\.git$/, '').replace(/^[^@/]+@/, '')}` });
    },
    clone(sh, args, io) {
      const rest = args.filter((a) => !a.startsWith('-'));
      const [url, dirArg] = rest;
      if (!url) { io.err('fatal: You must specify a repository to clone.\n'); return 129; }
      const hub = GitHub.repoFor(sh, url, false);
      const dirName = dirArg || url.replace(/\/+$/, '').split('/').pop().replace(/\.git$/, '');
      io.write(`Cloning into '${dirName}'...\n`);
      if (!hub) { io.err(`ERROR: Repository not found.\nfatal: Could not read from remote repository.\n\nPlease make sure you have the correct access rights\nand the repository exists.\n`); return 128; }
      if (!hub.public && !GitHub.authorized(sh, url, io)) return 128;
      const abs = sh.resolve(dirName);
      if (sh.node(abs)) { io.err(`fatal: destination path '${dirName}' already exists and is not an empty directory.\n`); return 128; }
      const { dir: parent, base } = sh.parentOf(abs);
      const pn = sh.node(parent);
      const dir = mkNode('dir', base); pn.children.set(base, dir);
      const branch = hub.defaultBranch || 'main';
      const g = mkNode('dir', '.git');
      const repo = newRepo(branch);
      g.repo = repo;
      g.children.set('HEAD', mkNode('file', 'HEAD', { content: `ref: refs/heads/${branch}\n` }));
      g.children.set('config', mkNode('file', 'config', { content: `[core]\n\trepositoryformatversion = 0\n[remote "origin"]\n\turl = ${url}\n\tfetch = +refs/heads/*:refs/remotes/origin/*\n[branch "${branch}"]\n\tremote = origin\n\tmerge = refs/heads/${branch}\n` }));
      dir.children.set('.git', g);
      let n = 0;
      for (const [b, h] of hub.refs) for (const c of orderCommits(hub, [h])) if (!repo.commits.has(c.hash)) { repo.commits.set(c.hash, c); repo.seq = Math.max(repo.seq, c.seq); n++; }
      repo.remotes.set('origin', { url, refs: hub.refs, hub });
      repo.remoteRefs = new Map([...hub.refs].map(([b, h]) => [`origin/${b}`, h]));
      if (hub.refs.has(branch)) {
        repo.refs.set(branch, hub.refs.get(branch));
        repo.upstream.set(branch, { remote: 'origin', branch });
        const t = treeOf(repo, hub.refs.get(branch));
        for (const [p, c] of t) writeTreeFile(sh, abs, p, c);
        repo.index = t;
      } else io.write("warning: You appear to have cloned an empty repository.\n");
      if (n) io.write(`remote: Enumerating objects: ${n * 3}, done.\nremote: Counting objects: 100% (${n * 3}/${n * 3}), done.\nremote: Compressing objects: 100% (${n * 2}/${n * 2}), done.\nremote: Total ${n * 3} (delta ${Math.max(0, n - 1)}), reused ${n * 3} (delta ${Math.max(0, n - 1)}), pack-reused 0 (from 0)\nReceiving objects: 100% (${n * 3}/${n * 3}), done.\n${n > 1 ? `Resolving deltas: 100% (${n - 1}/${n - 1}), done.\n` : ''}`);
      return 0;
    },
  };

  /* ---------- the in-memory GitHub ---------- */
  const GitHub = {
    // each shell (each terminal box) gets its own GitHub; it is recreated when the box is replayed
    _state(sh) { if (!sh.__github) sh.__github = { repos: new Map(), keys: new Set(), seeded: false, prs: new Map(), loggedIn: false, knownHost: false }; return sh.__github; },
    user: 'adventurer-dev',
    reset(sh) { if (sh) delete sh.__github; },
    parse(url) {
      const m = url.match(/^(?:git@github\.com:|https:\/\/github\.com\/)([^\/]+)\/([^\/]+?)(?:\.git)?\/?$/);
      return m ? { owner: m[1], name: m[2] } : null;
    },
    seed(sh) {
      const st = this._state(sh);
      if (st.seeded) return; st.seeded = true;
      // one public repository to clone: the guild's shared quest board
      const hub = { owner: 'newworld-guild', name: 'quest-board', commits: new Map(), refs: new Map(), defaultBranch: 'main', public: true, activity: [] };
      const mk = (seq, parents, message, tree, ms) => { const h = hashOf(`seed|${seq}|${message}`); const c = { hash: h, parents, tree: new Map(Object.entries(tree)), message, author: 'Guild Master', email: 'guildmaster@newworld.dev', date: ms, seq }; hub.commits.set(h, c); return h; };
      const t0 = Date.parse('2026-10-20T09:00:00');
      const a = mk(1, [], 'Open the quest board', { 'README.md': '# Quest Board\n\nOpen quests for every adventurer in the guild.\n', 'quests/welcome.md': '# Welcome quest\n\nClone this board, add your name to adventurers.txt, open a pull request.\n', 'adventurers.txt': 'guildmaster\n' }, t0);
      const b = mk(2, [a], 'Add the first three quests', { 'README.md': '# Quest Board\n\nOpen quests for every adventurer in the guild.\n\nSee the quests/ folder.\n', 'quests/welcome.md': '# Welcome quest\n\nClone this board, add your name to adventurers.txt, open a pull request.\n', 'quests/terminal.md': '# Master the terminal\n\nReward: 100 gold\n', 'quests/git.md': '# Learn Git\n\nReward: 250 gold\n', 'adventurers.txt': 'guildmaster\nkenji\n' }, t0 + 3600e3 * 5);
      hub.refs.set('main', b);
      st.repos.set('newworld-guild/quest-board', hub);
    },
    repoFor(sh, url, create) {
      this.seed(sh);
      const st = this._state(sh);
      const p = this.parse(url);
      if (!p) return null;
      const key = `${p.owner}/${p.name}`;
      if (!st.repos.has(key)) {
        if (!create) return null;
        st.repos.set(key, { owner: p.owner, name: p.name, url, commits: new Map(), refs: new Map(), defaultBranch: null, public: true, activity: [], prs: [], createdBy: 'remote add' });
      }
      return st.repos.get(key);
    },
    hubByName(sh, ownerName) { this.seed(sh); return this._state(sh).repos.get(ownerName) || null; },
    urlOf(hub) { return `git@github.com:${hub.owner}/${hub.name}.git`; },
    webOf(hub) { return `https://github.com/${hub.owner}/${hub.name}`; },
    authorized(sh, url, io, write) {
      const p = this.parse(url);
      if (!p) { io.err(`fatal: repository '${url}' does not exist\n`); return false; }
      if (url.startsWith('git@github.com:')) {
        const key = sh.node(`${HOME}/.ssh/id_ed25519.pub`);
        if (!key) { io.err(`git@github.com: Permission denied (publickey).\nfatal: Could not read from remote repository.\n\nPlease make sure you have the correct access rights\nand the repository exists.\n`); return false; }
        if (!this._state(sh).keys.has(key.content.trim())) { io.err(`git@github.com: Permission denied (publickey).\nfatal: Could not read from remote repository.\n\nPlease make sure you have the correct access rights\nand the repository exists.\n`); return false; }
      }
      if (write && p.owner !== this.user) { io.err(`ERROR: Permission to ${p.owner}/${p.name}.git denied to ${this.user}.\nfatal: Could not read from remote repository.\n\nPlease make sure you have the correct access rights\nand the repository exists.\n`); return false; }
      if (p.owner !== this.user && !(this._state(sh).repos.get(`${p.owner}/${p.name}`) || {}).public) { io.err(`ERROR: Permission to ${p.owner}/${p.name}.git denied to ${this.user}.\nfatal: Could not read from remote repository.\n`); return false; }
      return true;
    },
    noteActivity(hub, ev) { hub.activity.push(Object.assign({ at: Date.now() }, ev)); },
  };

  /* ---------- wire into the shell ---------- */
  CMDS.git = function (args, input, io) {
    const sh = this;
    if (!args.length) { io.write("usage: git [-v | --version] [-h | --help] <command> [<args>]\n\nThese are common Git commands used in various situations:\n\nstart a working area\n   clone     Clone a repository into a new directory\n   init      Create an empty Git repository or reinitialize an existing one\n\nwork on the current change\n   add       Add file contents to the index\n   mv        Move or rename a file, a directory, or a symlink\n   restore   Restore working tree files\n   rm        Remove files from the working tree and from the index\n\nexamine the history and state\n   diff      Show changes between commits, commit and working tree, etc\n   log       Show commit logs\n   show      Show various types of objects\n   status    Show the working tree status\n\ngrow, mark and tweak your common history\n   branch    List, create, or delete branches\n   commit    Record changes to the repository\n   merge     Join two or more development histories together\n   switch    Switch branches\n\ncollaborate\n   fetch     Download objects and refs from another repository\n   pull      Fetch from and integrate with another repository or a local branch\n   push      Update remote refs along with associated objects\n\n'git help -a' and 'git help -g' list available subcommands and some\nconcept guides. See 'git help <command>' or 'git help <concept>'\nto read about a specific subcommand or concept.\n"); return 1; }
    const [sub, ...rest] = args;
    if (sub === '--version' || sub === '-v') { io.write('git version 2.47.1\n'); return 0; }
    if (sub === '--help' || sub === 'help' || sub === '-h') { return CMDS.git.call(sh, [], input, io) && 0; }
    const fn = git[sub];
    if (!fn || sub === 'switchTo') { io.err(`git: '${sub}' is not a git command. See 'git --help'.\n`); return 1; }
    try { return fn(sh, rest, io) || 0; }
    catch (e) { if (e instanceof ShErr) { io.err(`${e.cmd || 'fatal'}: ${e.message}\n`); return e.status || 128; } io.err(`fatal: ${e.message}\n`); return 128; }
  };
  HELP.git = 'git <command> [<args>]\n  init · config · status · add · commit -m · log [--oneline --graph --all] · diff [--staged] · branch · checkout / switch · merge · restore · reset · stash · remote · push · pull · fetch · clone';
  MAN.git = 'GIT(1)\n\nNAME\n    git - the stupid content tracker\n\nSYNOPSIS\n    git [--version] [--help] <command> [<args>]\n\nDESCRIPTION\n    Git is a fast, scalable, distributed revision control system. On this page it\n    is a faithful model: every command below behaves and speaks like Git 2.47.\n\n    init, config, status, add, rm, commit, log, diff, show, branch, checkout,\n    switch, merge, restore, reset, stash, remote, push, pull, fetch, clone\n\n(short form: the real page is longer; on your machine press q to leave it)';

  /* ---------- session 1.4: SSH keys, the GitHub CLI, and the pull-request flow over the in-memory GitHub ---------- */
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  function b64Of(seedStr, n) { let out = ''; for (let i = 0; out.length < n; i++) { const h = hashOf(`${seedStr}|${i}`); for (let j = 0; j < h.length - 1 && out.length < n; j += 2) out += B64[parseInt(h.slice(j, j + 2), 16) % 64]; } return out; }
  function fingerprintOf(pub) { return 'SHA256:' + b64Of('fp|' + pub, 43); }
  // OpenSSH's "drunken bishop" randomart, drawn from the key's fingerprint bytes
  function randomart(pub, header) {
    const W = 17, H = 9, grid = Array.from({ length: H }, () => new Array(W).fill(0));
    let x = 8, y = 4; const hex = hashOf('art|' + pub) + hashOf('art2|' + pub);
    for (let i = 0; i < 32; i++) { let byte = parseInt(hex.slice(i * 2, i * 2 + 2), 16); for (let k = 0; k < 4; k++) { const d = byte & 3; byte >>= 2; x += d & 1 ? 1 : -1; y += d & 2 ? 1 : -1; x = Math.max(0, Math.min(W - 1, x)); y = Math.max(0, Math.min(H - 1, y)); grid[y][x]++; } }
    const S = ' .o+=*BOX@%&#/^';
    const rows = grid.map((r) => r.map((v) => S[Math.min(v, S.length - 1)]).join(''));
    rows[4] = rows[4].slice(0, 8) + 'S' + rows[4].slice(9);
    rows[y] = rows[y].slice(0, x) + 'E' + rows[y].slice(x + 1);
    const top = `+--[${header}]--+`.padEnd(W + 2, '-'); const bot = '+----[SHA256]-----+';
    return [top.length === W + 2 ? top : `+--[${header}]--+`, ...rows.map((r) => `|${r}|`), bot].join('\n');
  }
  const sshDir = (sh, make) => { const d = sh.node(`${HOME}/.ssh`); if (d || !make) return d; const n = mkNode('dir', '.ssh', { mode: 0o700 }); sh.node(HOME).children.set('.ssh', n); return n; };
  function identityFile(sh) { const f = sh.node(`${HOME}/.ssh/id_ed25519.pub`); return f ? f.content.trim() : null; }
  function knownHostsLine(sh, io) {
    const st = GitHub._state(sh);
    if (st.knownHost) return;
    st.knownHost = true;
    io.err("The authenticity of host 'github.com (140.82.112.4)' can't be established.\nED25519 key fingerprint is SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU.\nThis key is not known by any other names.\nAre you sure you want to continue connecting (yes/no/[fingerprint])? yes\nWarning: Permanently added 'github.com' (ED25519) to the list of known hosts.\n");
    sshDir(sh, true);
    sh.writeFile(`${HOME}/.ssh/known_hosts`, 'github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl\n', true);
  }

  CMDS['ssh-keygen'] = function (args, input, io) {
    const sh = this;
    const opt = {}; const rest = [];
    for (let i = 0; i < args.length; i++) { const a = args[i]; if (a === '-t' || a === '-C' || a === '-f' || a === '-N' || a === '-b') opt[a] = args[++i] === undefined ? '' : args[i]; else if (a.startsWith('-')) opt[a] = true; else rest.push(a); }
    const type = (opt['-t'] || 'ed25519').toLowerCase();
    if (type !== 'ed25519' && type !== 'rsa') { io.err(`unknown key type ${type}\n`); return 1; }
    const comment = opt['-C'] !== undefined ? opt['-C'] : `${USER}@${HOST}`;
    const file = opt['-f'] ? sh.resolve(opt['-f']) : `${HOME}/.ssh/id_${type}`;
    io.write(`Generating public/private ${type} key pair.\n`);
    if (!opt['-f']) io.write(`Enter file in which to save the key (${file}): \n`);
    if (sh.node(file)) { io.write(`${file} already exists.\nOverwrite (y/n)? n\n`); return 1; }
    if (opt['-N'] === undefined) io.write(`Enter passphrase for "${file}" (empty for no passphrase): \nEnter same passphrase again: \n`);
    const { dir, base } = sh.parentOf(file);
    if (!sh.node(dir)) { if (dir === `${HOME}/.ssh`) sshDir(sh, true); else { io.err(`Saving key "${file}" failed: No such file or directory\n`); return 1; } }
    const pub = (type === 'ed25519' ? 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI' + b64Of('pub|' + comment + '|' + Date.now(), 43) : 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQ' + b64Of('pub|' + comment + '|' + Date.now(), 372)) + ' ' + comment;
    const priv = '-----BEGIN OPENSSH PRIVATE KEY-----\n' + b64Of('priv|' + pub, 70 * 5).match(/.{1,70}/g).join('\n') + '\n-----END OPENSSH PRIVATE KEY-----\n';
    const parent = sh.node(dir);
    parent.children.set(base, mkNode('file', base, { content: priv, mode: 0o600 }));
    parent.children.set(base + '.pub', mkNode('file', base + '.pub', { content: pub + '\n', mode: 0o644 }));
    io.write(`Your identification has been saved in ${file}\nYour public key has been saved in ${file}.pub\nThe key fingerprint is:\n${fingerprintOf(pub)} ${comment}\nThe key's randomart image is:\n${randomart(pub, type === 'ed25519' ? 'ED25519 256' : 'RSA 3072')}\n`);
    return 0;
  };
  CMDS['ssh-agent'] = function (args, input, io) {
    const pid = 4000 + Math.floor(Math.random() * 900);
    const sock = `/tmp/ssh-${b64Of('sock|' + pid, 10).replace(/[^A-Za-z0-9]/g, 'x')}/agent.${pid - 1}`;
    if (args.includes('-k')) { if (!this.env.SSH_AGENT_PID) { io.err('SSH_AGENT_PID not set, cannot kill agent\n'); return 1; } io.write(`unset SSH_AUTH_SOCK;\nunset SSH_AGENT_PID;\necho Agent pid ${this.env.SSH_AGENT_PID} killed;\n`); return 0; }
    io.write(`SSH_AUTH_SOCK=${sock}; export SSH_AUTH_SOCK;\nSSH_AGENT_PID=${pid}; export SSH_AGENT_PID;\necho Agent pid ${pid};\n`);
    return 0;
  };
  CMDS['ssh-add'] = function (args, input, io) {
    const sh = this;
    if (!sh.env.SSH_AUTH_SOCK) { io.err('Could not open a connection to your authentication agent.\n'); return 2; }
    if (args.includes('-l') || args.includes('-L')) { const ids = sh.__sshAdded || []; if (!ids.length) { io.write('The agent has no identities.\n'); return 1; } for (const f of ids) { const pub = sh.node(f + '.pub'); io.write(args.includes('-L') ? pub.content : `256 ${fingerprintOf(pub.content.trim())} ${pub.content.trim().split(' ').slice(2).join(' ')} (ED25519)\n`); } return 0; }
    const file = args.find((a) => !a.startsWith('-')) || `${HOME}/.ssh/id_ed25519`;
    const abs = sh.resolve(file);
    const n = sh.node(abs);
    if (!n) { io.err(`${file}: No such file or directory\n`); return 1; }
    const pub = sh.node(abs + '.pub');
    const comment = pub ? pub.content.trim().split(' ').slice(2).join(' ') : '';
    (sh.__sshAdded = sh.__sshAdded || []).push(abs);
    io.write(`Identity added: ${abs} (${comment})\n`);
    return 0;
  };
  CMDS.eval = function (args, input, io) { if (!args.length) return 0; return this.runLine(args.join(' ').split('\n').map((l) => l.trim()).filter(Boolean).join(' ; '), io); };
  CMDS.pbcopy = function (args, input, io) { this.__clipboard = input || ''; return 0; };
  CMDS.pbpaste = function (args, input, io) { io.write(this.__clipboard || ''); return 0; };
  CMDS.xclip = function (args, input, io) { if (args.includes('-o')) { io.write(this.__clipboard || ''); return 0; } this.__clipboard = input || ''; return 0; };
  CMDS.ssh = function (args, input, io) {
    const sh = this;
    const flags = args.filter((a) => a.startsWith('-')); const host = args.find((a) => !a.startsWith('-'));
    if (!host) { io.err('usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] [-B bind_interface] [-b bind_address]\n           [-c cipher_spec] [-D [bind_address:]port] [-E log_file]\n           [-e escape_char] [-F configfile] [-I pkcs11] [-i identity_file]\n           [-J destination] [-L address] [-l login_name] [-m mac_spec]\n           [-O ctl_cmd] [-o option] [-P tag] [-p port] [-R address]\n           [-S ctl_path] [-W host:port] [-w local_tun[:remote_tun]]\n           destination [command [argument ...]]\n'); return 255; }
    if (host !== 'git@github.com' && host !== 'github.com') { io.err(`ssh: Could not resolve hostname ${host.replace(/^.*@/, '')}: Name or service not known\n`); return 255; }
    knownHostsLine(sh, io);
    const pub = identityFile(sh);
    if (!pub || !GitHub._state(sh).keys.has(pub)) { io.err('git@github.com: Permission denied (publickey).\n'); return 255; }
    io.err(`Hi ${GitHub.user}! You've successfully authenticated, but GitHub does not provide shell access.\n`);
    void flags;
    return 1;
  };

  /* gh: the GitHub CLI. The lesson shows the website clicks; the box does the same steps with gh. */
  const GH_VERSION = 'gh version 2.80.0 (2025-10-14)\nhttps://github.com/cli/cli/releases/tag/v2.80.0\n';
  function ghNeedLogin(sh, io) { if (GitHub._state(sh).loggedIn) return true; io.err("To get started with GitHub CLI, please run:  gh auth login\nAlternatively, populate the GH_TOKEN environment variable with a GitHub API authentication token.\n"); return false; }
  function ghFlags(args) { const f = {}; const rest = []; for (let i = 0; i < args.length; i++) { const a = args[i]; if (a.startsWith('--')) { const eq = a.indexOf('='); if (eq > 0) f[a.slice(2, eq)] = a.slice(eq + 1); else if (i + 1 < args.length && !args[i + 1].startsWith('-') && !['public', 'private', 'push', 'clone', 'merge', 'squash', 'rebase', 'delete-branch', 'web', 'fill', 'confirm', 'disable-blame'].includes(a.slice(2))) f[a.slice(2)] = args[++i]; else f[a.slice(2)] = true; } else if (a.startsWith('-') && a.length === 2) { const k = { t: 'title', b: 'body', B: 'base', H: 'head', d: 'description', m: 'merge', s: 'squash', r: 'rebase', R: 'repo', w: 'web', c: 'clone' }[a[1]] || a[1]; if (['title', 'body', 'base', 'head', 'description', 'repo'].includes(k) && i + 1 < args.length) f[k] = args[++i]; else f[k] = true; } else rest.push(a); } return { f, rest }; }
  function currentHub(sh, io, f) {
    if (f && f.repo) { const hub = GitHub.hubByName(sh, f.repo.replace(/^https:\/\/github\.com\//, '')); if (!hub) io.err(`GraphQL: Could not resolve to a Repository with the name '${f.repo}'. (repository)\n`); return hub; }
    const ctx = findRepo(sh);
    if (!ctx) { io.err('failed to run git: fatal: not a git repository (or any of the parent directories): .git\n'); return null; }
    const origin = ctx.repo.remotes.get('origin');
    if (!origin) { io.err('none of the git remotes configured for this repository point to a known GitHub host. To tell gh about a new GitHub host, please use `gh auth login`\n'); return null; }
    return origin.hub;
  }
  function ago(ms) { const s = Math.max(1, Math.round((Date.now() - ms) / 1000)); if (s < 60) return 'less than a minute ago'; const m = Math.round(s / 60); return m === 1 ? 'about 1 minute ago' : `about ${m} minutes ago`; }
  const gh = {
    auth(sh, args, io) {
      const st = GitHub._state(sh);
      const sub = args[0];
      if (sub === 'login') {
        const pub = identityFile(sh);
        io.write(`? Where do you use GitHub? GitHub.com\n? What is your preferred protocol for Git operations on this host? SSH\n${pub ? '? Upload your SSH public key to your GitHub account? Skip\n' : ''}? How would you like to authenticate GitHub CLI? Login with a web browser\n\n! First copy your one-time code: ${b64Of('otp|' + Date.now(), 4).replace(/[^A-Z0-9]/gi, 'X').toUpperCase()}-${b64Of('otp2|' + Date.now(), 4).replace(/[^A-Z0-9]/gi, 'Y').toUpperCase()}\nPress Enter to open https://github.com/login/device in your browser... \n✓ Authentication complete.\n- gh config set -h github.com git_protocol ssh\n✓ Configured git protocol\n`);
        st.loggedIn = true;
        io.write(`✓ Logged in as ${GitHub.user}\n`);
        return 0;
      }
      if (sub === 'status') {
        if (!st.loggedIn) { io.err('You are not logged into any GitHub hosts. To log in, run: gh auth login\n'); return 1; }
        io.write(`github.com\n  ✓ Logged in to github.com account ${GitHub.user} (keyring)\n  - Active account: true\n  - Git operations protocol: ssh\n  - Token: gho_************************************\n  - Token scopes: 'gist', 'read:org', 'repo', 'admin:public_key'\n`);
        return 0;
      }
      if (sub === 'logout') { st.loggedIn = false; io.write(`✓ Logged out of github.com account ${GitHub.user}\n`); return 0; }
      io.err('Available commands: login, logout, refresh, setup-git, status, switch, token\n'); return 1;
    },
    'ssh-key'(sh, args, io) {
      const st = GitHub._state(sh);
      if (!ghNeedLogin(sh, io)) return 4;
      const { f, rest } = ghFlags(args);
      const sub = rest[0];
      if (sub === 'add') {
        const file = rest[1]; if (!file) { io.err('cannot add key: a key file is required\n'); return 1; }
        const n = sh.get(file); if (!n) { io.err(`open ${file}: no such file or directory\n`); return 1; }
        const key = n.content.trim();
        if (!/^ssh-(ed25519|rsa) /.test(key)) { io.err('HTTP 422: Validation Failed (https://api.github.com/user/keys)\nkey is invalid. You must supply a key in OpenSSH public key format\n'); return 1; }
        if (st.keys.has(key)) { io.err('HTTP 422: Validation Failed (https://api.github.com/user/keys)\nkey is already in use\n'); return 1; }
        st.keys.add(key); st.keyTitles = st.keyTitles || new Map(); st.keyTitles.set(key, f.title || key.split(' ').slice(2).join(' '));
        io.write('✓ Public key added to your account\n'); return 0;
      }
      if (sub === 'list') { if (!st.keys.size) { io.write('No SSH keys present in the GitHub account.\n'); return 0; } for (const k of st.keys) io.write(`${((st.keyTitles && st.keyTitles.get(k)) || 'key').padEnd(12)}\t${k.split(' ').slice(0, 2).join(' ')}\t${new Date().toISOString().slice(0, 10)}\tauthentication\n`); return 0; }
      io.err('Available commands: add, delete, list\n'); return 1;
    },
    repo(sh, args, io) {
      const st = GitHub._state(sh);
      const { f, rest } = ghFlags(args);
      const sub = rest[0];
      if (sub === 'create') {
        if (!ghNeedLogin(sh, io)) return 4;
        let name = rest[1];
        if (!name) { io.err('`gh repo create` needs a repository name on this page (the interactive prompts are a browser thing): gh repo create <name> --public\n'); return 1; }
        if (!name.includes('/')) name = `${GitHub.user}/${name}`;
        const [owner, repoName] = name.split('/');
        if (owner !== GitHub.user) { io.err(`HTTP 403: Resource not accessible by personal access token (https://api.github.com/orgs/${owner}/repos)\n`); return 1; }
        if (!f.public && !f.private && !f.internal) { io.err('`--public`, `--private`, or `--internal` required when not running interactively\n'); return 1; }
        if (st.repos.has(name)) { io.err(`GraphQL: Name already exists on this account (createRepository)\n`); return 1; }
        const hub = GitHub.repoFor(sh, `git@github.com:${name}.git`, true);
        hub.public = !!f.public; hub.description = f.description || ''; hub.createdBy = 'gh repo create';
        io.write(`✓ Created repository ${name} on GitHub\n  ${GitHub.webOf(hub)}\n`);
        if (f.source) {
          const ctx = findRepo(sh, sh.resolve(f.source));
          if (!ctx) { io.err(`X ${f.source} is not a git repository\n`); return 1; }
          const remoteName = f.remote || 'origin';
          ctx.repo.remotes.set(remoteName, { url: GitHub.urlOf(hub), refs: hub.refs, hub });
          io.write(`✓ Added remote ${GitHub.urlOf(hub)}\n`);
          if (f.push) { const saveCwd = sh.cwd; sh.cwd = ctx.root; const r = git.push(sh, ['-u', remoteName, ctx.repo.head], { write: () => {}, err: (t) => io.err(t) }); sh.cwd = saveCwd; if (r) return r; io.write(`✓ Pushed commits to ${GitHub.urlOf(hub)}\n`); }
        }
        return 0;
      }
      if (sub === 'view') {
        const hub = rest[1] ? GitHub.hubByName(sh, rest[1]) : currentHub(sh, io);
        if (!hub) { if (rest[1]) io.err(`GraphQL: Could not resolve to a Repository with the name '${rest[1]}'. (repository)\n`); return 1; }
        const head = hub.refs.get(hub.defaultBranch || 'main');
        const readme = head && hub.commits.get(head).tree.get('README.md');
        io.write(`${hub.owner}/${hub.name}\n${hub.description || 'No description provided'}\n\n${readme ? readme.split('\n').map((l) => '  ' + l).join('\n') : '  This repository does not have a README'}\n\nView this repository on GitHub: ${GitHub.webOf(hub)}\n`);
        return 0;
      }
      if (sub === 'clone') { const target = rest[1]; if (!target) { io.err('cannot clone: repository argument required\n'); return 1; } const url = /^(git@|https:)/.test(target) ? target : `git@github.com:${target.includes('/') ? target : GitHub.user + '/' + target}.git`; return git.clone(sh, [url, ...rest.slice(2)], io); }
      if (sub === 'fork') {
        if (!ghNeedLogin(sh, io)) return 4;
        const src = rest[1] ? GitHub.hubByName(sh, rest[1]) : currentHub(sh, io);
        if (!src) { if (rest[1]) io.err(`GraphQL: Could not resolve to a Repository with the name '${rest[1]}'. (repository)\n`); return 1; }
        if (src.owner === GitHub.user) { io.err(`failed to fork: ${src.owner}/${src.name} cannot be forked. A single user account cannot own both a parent and fork.\n`); return 1; }
        const key = `${GitHub.user}/${src.name}`;
        if (st.repos.has(key)) { io.write(`! ${key} already exists\n`); } else {
          const fork = { owner: GitHub.user, name: src.name, url: `git@github.com:${key}.git`, commits: new Map(src.commits), refs: new Map(src.refs), defaultBranch: src.defaultBranch, public: true, activity: [], prs: [], forkOf: `${src.owner}/${src.name}` };
          st.repos.set(key, fork);
          io.write(`✓ Created fork ${key}\n`);
        }
        if (f.clone) {
          const r = git.clone(sh, [`git@github.com:${key}.git`], io);
          if (r) return r;
          const ctx2 = findRepo(sh, sh.resolve(src.name));
          if (ctx2) { ctx2.repo.remotes.set('upstream', { url: GitHub.urlOf(src), refs: src.refs, hub: src }); io.write(`✓ Cloned fork\n! Repository ${src.owner}/${src.name} set as the default repository. To learn more about the default repository, run: gh repo set-default --help\n`); }
          return 0;
        }
        return 0;
      }
      if (sub === 'list') { const mine = [...st.repos.values()].filter((h) => h.owner === GitHub.user); if (!mine.length) { io.write(`No repositories found for ${GitHub.user}\n`); return 0; } io.write(`\nShowing ${mine.length} of ${mine.length} repositories in @${GitHub.user}\n\n`); for (const h of mine) io.write(`${(h.owner + '/' + h.name).padEnd(34)}${(h.description || '').padEnd(24)}${h.public ? 'public' : 'private'}\n`); return 0; }
      io.err('Available commands: archive, clone, create, delete, edit, fork, list, rename, set-default, sync, view\n'); return 1;
    },
    pr(sh, args, io) {
      if (!ghNeedLogin(sh, io)) return 4;
      const { f, rest } = ghFlags(args);
      const sub = rest[0];
      const origin = currentHub(sh, io, f);
      if (!origin) return 1;
      const parent = origin.forkOf ? GitHub.hubByName(sh, origin.forkOf) : null;
      const hub = parent || origin;                       // pull requests on a fork are opened against its parent
      hub.prs = hub.prs || [];
      const ctx = findRepo(sh);
      const headLabel = (b) => (parent ? `${GitHub.user}:${b}` : b);
      if (sub === 'create') {
        const head = f.head || (ctx && ctx.repo.head);
        const base = f.base || hub.defaultBranch || 'main';
        if (!f.title) { io.err('`gh pr create` needs --title and --body on this page (the editor prompt is a terminal thing your machine has and this box does not)\n'); return 1; }
        if (head === base) { io.err(`pull request create failed: head and base branches are both '${base}'\n`); return 1; }
        if (!origin.refs.has(head)) {
          // real gh offers to push the branch for you; the box does the same
          if (!ctx || !ctx.repo.refs.has(head)) { io.err(`pull request create failed: head branch '${head}' does not exist\n`); return 1; }
          io.write(`? Where should we push the '${head}' branch? ${origin.owner}/${origin.name}\n`);
          const remoteName = [...ctx.repo.remotes].find(([, r]) => r.hub === origin)[0];
          const r = git.push(sh, ['-u', remoteName, head], { write: () => {}, err: (t) => io.err(t) });
          if (r) return r;
        }
        if (!hub.refs.has(base)) { io.err(`pull request create failed: base branch '${base}' does not exist on ${hub.owner}/${hub.name}\n`); return 1; }
        for (const c of orderCommits(origin, [origin.refs.get(head)])) if (!hub.commits.has(c.hash)) hub.commits.set(c.hash, c);   // the parent can see the fork's commits
        if (isAncestor(hub, origin.refs.get(head), hub.refs.get(base))) { io.err(`pull request create failed: GraphQL: No commits between ${base} and ${headLabel(head)} (createPullRequest)\n`); return 1; }
        const open = hub.prs.find((p) => p.head === head && p.fromFork === !!parent && p.state === 'OPEN');
        if (open) { io.err(`a pull request for branch "${headLabel(head)}" into branch "${base}" already exists:\n${GitHub.webOf(hub)}/pull/${open.number}\n`); return 1; }
        const pr = { number: hub.prs.length + 1, title: f.title, body: f.body || '', head, base, fromFork: !!parent, headRepo: origin, state: 'OPEN', merged: false, createdAt: Date.now(), author: GitHub.user, headSha: origin.refs.get(head), baseSha: mergeBase(hub, hub.refs.get(base), origin.refs.get(head)) };
        hub.prs.push(pr);
        io.write(`\nCreating pull request for ${headLabel(head)} into ${base} in ${hub.owner}/${hub.name}\n\n${GitHub.webOf(hub)}/pull/${pr.number}\n`);
        return 0;
      }
      if (sub === 'list') {
        const open = hub.prs.filter((p) => p.state === 'OPEN');
        if (!open.length) { io.write(`no open pull requests in ${hub.owner}/${hub.name}\n`); return 0; }
        io.write(`\nShowing ${open.length} of ${open.length} open pull request${open.length === 1 ? '' : 's'} in ${hub.owner}/${hub.name}\n\n`);
        const w = Math.max(5, ...open.map((p) => p.title.length)), bw = Math.max(6, ...open.map((p) => (p.fromFork ? headLabel(p.head) : p.head).length));
        io.write(`${'ID'.padEnd(5)}${'TITLE'.padEnd(w + 2)}${'BRANCH'.padEnd(bw + 2)}CREATED AT\n`);
        for (const p of open) io.write(`${('#' + p.number).padEnd(5)}${p.title.padEnd(w + 2)}${(p.fromFork ? headLabel(p.head) : p.head).padEnd(bw + 2)}${ago(p.createdAt)}\n`);
        return 0;
      }
      const pick = () => { const n = rest[1] ? Number(String(rest[1]).replace('#', '')) : null; const pr = n ? hub.prs.find((p) => p.number === n) : hub.prs.find((p) => p.state === 'OPEN' && ctx && p.head === ctx.repo.head); if (!pr) io.err(n ? `GraphQL: Could not resolve to a PullRequest with the number of ${n}. (repository.pullRequest)\n` : `no pull requests found for branch "${ctx ? ctx.repo.head : ''}"\n`); return pr; };
      if (sub === 'view') {
        const pr = pick(); if (!pr) return 1;
        // the stats GitHub shows are the PR's own: head against the merge base recorded when it was opened (unchanged by the merge)
        const headC = hub.commits.get(pr.headSha), baseSha = pr.baseSha || null;
        const ds = headC ? diffstat(baseSha ? hub.commits.get(baseSha).tree : new Map(), headC.tree) : { ins: 0, del: 0 };
        const baseAnc = baseSha ? new Set(orderCommits(hub, [baseSha]).map((c) => c.hash)) : new Set();
        const nCommits = headC ? orderCommits(hub, [pr.headSha]).filter((c) => !baseAnc.has(c.hash)).length : 1;
        io.write(`${pr.title} ${hub.owner}/${hub.name}#${pr.number}\n${pr.merged ? 'Merged' : pr.state === 'OPEN' ? 'Open' : 'Closed'} • ${pr.author} wants to merge ${nCommits} commit${nCommits === 1 ? '' : 's'} into ${pr.base} from ${pr.fromFork ? headLabel(pr.head) : pr.head} • ${ago(pr.createdAt)}\n+${ds.ins} -${ds.del} • No checks\n\n${pr.body ? pr.body.split('\n').map((l) => '  ' + l).join('\n') : '  No description provided'}\n\n\nView this pull request on GitHub: ${GitHub.webOf(hub)}/pull/${pr.number}\n`);
        return 0;
      }
      if (sub === 'merge') {
        const pr = pick(); if (!pr) return 1;
        if (pr.state !== 'OPEN') { io.err(`X Pull request ${hub.owner}/${hub.name}#${pr.number} (${pr.title}) was already merged\n`); return 1; }
        if (hub.owner !== GitHub.user) { io.err(`X Pull request ${hub.owner}/${hub.name}#${pr.number} (${pr.title}) can't be merged by you: GraphQL: ${GitHub.user} does not have the correct permissions to execute \`MergePullRequest\` (mergePullRequest)\n(the maintainers of ${hub.owner}/${hub.name} review it and decide; that is the whole point of a pull request from a fork)\n`); return 1; }
        if (!f.merge && !f.squash && !f.rebase) { io.err('? What merge method would you like to use? (on this page pass --merge, --squash or --rebase; the interactive menu is a terminal thing)\n'); return 1; }
        const baseSha = hub.refs.get(pr.base), headSha = (pr.headRepo || hub).refs.get(pr.head);
        if (!headSha) { io.err(`X Pull request ${hub.owner}/${hub.name}#${pr.number} is not mergeable: the head branch no longer exists.\n`); return 1; }
        const base = mergeBase(hub, baseSha, headSha);
        const baseTree = treeOf(hub, base), ours = treeOf(hub, baseSha), theirs = treeOf(hub, headSha);
        const m = mergeTrees(baseTree, ours, theirs, pr.head, pr.base);
        if (m.conflicts.size) { io.err(`X Pull request ${hub.owner}/${hub.name}#${pr.number} is not mergeable: the merge commit cannot be cleanly created.\nTo have the pull request merged after all the requirements have been met, add the \`--auto\` flag.\nRun the following to resolve the merge conflicts locally:\n  gh pr checkout ${pr.number} && git fetch origin ${pr.base} && git merge origin/${pr.base}\n`); return 1; }
        const seq = Math.max(0, ...[...hub.commits.values()].map((c) => c.seq || 0)) + 1;
        const now = Date.now();
        let message, parents, tree = m.result;
        if (f.squash) { message = `${pr.title} (#${pr.number})\n\n${pr.body}`.trim(); parents = [baseSha]; }
        else if (f.rebase) { message = hub.commits.get(headSha).message; parents = [baseSha]; }
        else { message = `Merge pull request #${pr.number} from ${hub.owner}/${pr.head}\n\n${pr.title}`; parents = [baseSha, headSha]; }
        const hash = hashOf(`${seq}|${message}|${parents.join(',')}|${now}`);
        hub.commits.set(hash, { hash, parents, tree: cloneTree(tree), message, author: GitHub.user, email: `${GitHub.user}@users.noreply.github.com`, date: now, seq });
        hub.refs.set(pr.base, hash);
        pr.state = 'MERGED'; pr.merged = true; pr.mergedAt = now; pr.mergeSha = hash;
        io.write(`✓ ${f.squash ? 'Squashed and merged' : f.rebase ? 'Rebased and merged' : 'Merged'} pull request ${hub.owner}/${hub.name}#${pr.number} (${pr.title})\n`);
        if (f['delete-branch']) {
          (pr.headRepo || hub).refs.delete(pr.head);
          if (ctx && ctx.repo.refs.has(pr.head)) {
            if (ctx.repo.head === pr.head) { git.switchTo(sh, ctx, pr.base, { write: () => {}, err: () => {} }, false); io.write(`✓ Deleted local branch ${pr.head} and switched to branch ${pr.base}\n`); } else io.write(`✓ Deleted local branch ${pr.head}\n`);
            ctx.repo.refs.delete(pr.head); ctx.repo.upstream.delete(pr.head);
            if (ctx.repo.remoteRefs) ctx.repo.remoteRefs.delete(`origin/${pr.head}`);
          }
          io.write(`✓ Deleted remote branch ${pr.head}\n`);
        }
        return 0;
      }
      if (sub === 'status') { const open = hub.prs.filter((p) => p.state === 'OPEN'); io.write(`\nRelevant pull requests in ${hub.owner}/${hub.name}\n\nCurrent branch\n  ${open.find((p) => ctx && p.head === ctx.repo.head) ? `#${open.find((p) => p.head === ctx.repo.head).number}  ${open.find((p) => p.head === ctx.repo.head).title} [${ctx.repo.head}]` : `There is no pull request associated with [${ctx ? ctx.repo.head : ''}]`}\n\nCreated by you\n  ${open.length ? open.map((p) => `#${p.number}  ${p.title} [${p.head}]`).join('\n  ') : 'You have no open pull requests'}\n\nRequesting a code review from you\n  You have no pull requests to review\n\n`); return 0; }
      if (sub === 'checkout') { const pr = pick(); if (!pr) return 1; if (!ctx) return 1; git.fetch(sh, ['origin'], { write: () => {}, err: () => {} }); return git.checkout(sh, [pr.head], io); }
      io.err('Available commands: checkout, checks, close, comment, create, diff, edit, list, lock, merge, ready, reopen, review, status, unlock, update-branch, view\n'); return 1;
    },
    browse(sh, args, io) { const hub = currentHub(sh, io); if (!hub) return 1; io.write(`Opening ${GitHub.webOf(hub)} in your browser.\n(on this page that is as far as it goes: the browser is on your machine)\n`); return 0; },
  };
  CMDS.gh = function (args, input, io) {
    const sh = this;
    if (!args.length || args[0] === '--help' || args[0] === 'help') { io.write("Work seamlessly with GitHub from the command line.\n\nUSAGE\n  gh <command> <subcommand> [flags]\n\nCORE COMMANDS\n  auth:          Authenticate gh and git with GitHub\n  browse:        Open repositories, issues, pull requests, and more in the browser\n  codespace:     Connect to and manage codespaces\n  gist:          Manage gists\n  issue:         Manage issues\n  org:           Manage organizations\n  pr:            Manage pull requests\n  project:       Work with GitHub Projects.\n  release:       Manage releases\n  repo:          Manage repositories\n\nADDITIONAL COMMANDS\n  ssh-key:       Manage SSH keys\n  status:        Print information about relevant issues, pull requests, and notifications across repositories\n\nFLAGS\n  --help      Show help for command\n  --version   Show gh version\n\nEXAMPLES\n  $ gh issue create\n  $ gh repo clone cli/cli\n  $ gh pr checkout 321\n\nLEARN MORE\n  Use `gh <command> <subcommand> --help` for more information about a command.\n  Read the manual at https://cli.github.com/manual\n"); return 0; }
    if (args[0] === '--version' || args[0] === 'version') { io.write(GH_VERSION); return 0; }
    const fn = gh[args[0]];
    if (!fn) { io.err(`unknown command "${args[0]}" for "gh"\n\nUsage:  gh <command> <subcommand> [flags]\n\nAvailable commands:\n  auth\n  browse\n  pr\n  repo\n  ssh-key\n`); return 1; }
    try { return fn(sh, args.slice(1), io) || 0; }
    catch (e) { if (e instanceof ShErr) { io.err(`${e.message}\n`); return e.status || 1; } io.err(`gh: ${e.message}\n`); return 1; }
  };
  HELP.gh = 'gh <command> <subcommand> [flags]\n  auth login/status · ssh-key add/list · repo create/view/clone/fork/list · pr create/list/view/merge/status · browse';
  MAN.gh = 'GH(1)\n\nNAME\n    gh - GitHub CLI\n\nSYNOPSIS\n    gh <command> <subcommand> [flags]\n\nDESCRIPTION\n    Work seamlessly with GitHub from the command line. On this page gh talks to\n    the same in-memory GitHub that git push and git clone use, so the browser\n    steps of session 1.4 (add an SSH key, create a repository, open and merge a\n    pull request) can be rehearsed here as commands.\n\n(short form: the real page is longer; on your machine press q to leave it)';
  HELP['ssh-keygen'] = 'ssh-keygen -t ed25519 -C "comment"\n  Generate an SSH key pair in ~/.ssh (the prompts answer themselves with Enter on this page).';
  HELP['ssh-add'] = 'ssh-add [file]\n  Add a private key to the running ssh-agent.';
  HELP['ssh-agent'] = 'eval "$(ssh-agent -s)"\n  Start the key agent and export its variables into this shell.';
  HELP.eval = 'eval STRING\n  Run STRING as a shell command line.';
  HELP.pbcopy = 'pbcopy < file · command | pbcopy\n  Copy standard input to the clipboard (macOS). pbpaste prints it back.';
  MAN.ssh = 'SSH(1)\n\nNAME\n    ssh - OpenSSH remote login client\n\nSYNOPSIS\n    ssh [-T] destination\n\nDESCRIPTION\n    On this page the only destination that answers is git@github.com, and only\n    with -T, which is how you test that GitHub recognises your key.\n\n(short form: the real page is longer; on your machine press q to leave it)';
  window.__dtcGit = { git, gh, GitHub, merge3, unified, lcs };
  // every Run in terminal resets the shell; the in-memory GitHub resets with it so pushes are repeatable
  if (T.onReset) T.onReset((sh) => GitHub.reset(sh));
})();
