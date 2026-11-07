/* term.js — the lesson terminal: a small, faithful Bash-and-coreutils emulator that runs inside a
   `.term` box on session pages. A `bash term=<name>` fence is the script; "Run in terminal" replays it
   line by line against a fresh in-memory filesystem, and the prompt under the screen takes anything the
   reader types. Nothing here touches the real machine: there is no network, no real disk and no real
   shell, only the behaviour of one (paths, flags, pipes, redirection, permissions, error messages) kept
   as close to GNU coreutils as a lesson needs. Loaded only on pages that have a terminal. */
(function () {
  'use strict';
  const doc = document;
  const $ = (s, r) => (r || doc).querySelector(s);
  const $$ = (s, r) => Array.from((r || doc).querySelectorAll(s));
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- filesystem ---------- */
  const USER = 'adventurer';
  const HOST = 'newworld';
  const HOME = `/home/${USER}`;
  const DIR_MODE = 0o755;
  const FILE_MODE = 0o644;

  function mkNode(type, name, extra) {
    const n = { type, name, mode: type === 'dir' ? DIR_MODE : FILE_MODE, mtime: Date.now(), owner: USER };
    if (type === 'dir') n.children = new Map(); else n.content = '';
    return Object.assign(n, extra || {});
  }

  function seedFs() {
    const root = mkNode('dir', '/');
    const mk = (p, type, content) => {
      const parts = p.split('/').filter(Boolean);
      let cur = root;
      parts.forEach((part, i) => {
        const last = i === parts.length - 1;
        if (!cur.children.has(part)) cur.children.set(part, mkNode(last ? type : 'dir', part));
        cur = cur.children.get(part);
      });
      if (type === 'file' && content !== undefined) cur.content = content;
      return cur;
    };
    ['/bin', '/dev', '/etc', '/home', '/tmp', '/usr/bin', '/usr/local/bin', '/var/log', '/root'].forEach((d) => mk(d, 'dir'));
    mk('/dev/null', 'file', '');
    mk('/etc/hostname', 'file', `${HOST}\n`);
    mk('/etc/shells', 'file', '/bin/sh\n/bin/bash\n/usr/bin/zsh\n');
    mk(`${HOME}`, 'dir');
    ['Desktop', 'Documents', 'Downloads', 'Pictures', 'projects'].forEach((d) => mk(`${HOME}/${d}`, 'dir'));
    mk(`${HOME}/.bashrc`, 'file', '# ~/.bashrc: executed by bash for interactive shells\n[ -z "$PS1" ] && return\nalias ll=\'ls -alF\'\nalias la=\'ls -A\'\nexport EDITOR=code\n');
    mk(`${HOME}/.profile`, 'file', '# ~/.profile\nif [ -n "$BASH_VERSION" ]; then\n  . "$HOME/.bashrc"\nfi\n');
    mk(`${HOME}/.bash_history`, 'file', '');
    mk(`${HOME}/Documents/welcome.txt`, 'file', 'Welcome to the new world.\nThe cursor is blinking because it is waiting for you.\n');
    root.children.get('root').mode = 0o700;
    root.children.get('root').owner = 'root';
    root.children.get('tmp').mode = 0o777;
    const binNames = ['bash', 'cat', 'chmod', 'cp', 'date', 'echo', 'grep', 'head', 'ls', 'mkdir', 'mv', 'pwd', 'rm', 'rmdir', 'sort', 'tail', 'touch', 'tree', 'uniq', 'wc', 'whoami', 'which', 'man', 'cal', 'uptime', 'df', 'env', 'printenv', 'clear', 'history', 'sh', 'git', 'node', 'npm', 'code'];
    binNames.forEach((b) => { const n = mk(b === 'code' || b === 'node' || b === 'npm' || b === 'git' ? `/usr/local/bin/${b}` : `/usr/bin/${b}`, 'file', ''); n.mode = 0o755; n.owner = 'root'; n.size = 1024 * (8 + (b.length * 7) % 90); });
    const bash = root.children.get('usr').children.get('bin').children.get('bash'); mk('/bin/bash', 'file', ''); root.children.get('bin').children.get('bash').mode = 0o755; root.children.get('bin').children.get('bash').owner = 'root'; root.children.get('bin').children.get('bash').size = bash.size;
    return root;
  }

  /* ---------- shell ---------- */
  class Shell {
    constructor(screen) {
      this.screen = screen;              // {write(text, cls), clear()}
      this.reset();
    }
    reset() {
      this.root = seedFs();
      this.env = { HOME, USER, LOGNAME: USER, SHELL: '/bin/bash', PWD: HOME, OLDPWD: HOME, PATH: '/usr/local/bin:/usr/bin:/bin', HOSTNAME: HOST, TERM: 'xterm-256color', LANG: 'en_US.UTF-8', EDITOR: 'code', PS1: '\\u@\\h:\\w\\$ ' };
      this.cwd = HOME;
      this.history = [];
      this.aliases = { ll: 'ls -alF', la: 'ls -A' };
      this.lastStatus = 0;
      this.depth = 0;
    }
    prompt() { return `${USER}@${HOST}:${this.shortCwd()}$`; }
    shortCwd() { return this.cwd === HOME ? '~' : this.cwd.startsWith(HOME + '/') ? '~' + this.cwd.slice(HOME.length) : this.cwd; }

    /* paths */
    resolve(p) {
      if (!p) return this.cwd;
      if (p === '~' || p.startsWith('~/')) p = HOME + p.slice(1);
      const abs = p.startsWith('/') ? p : `${this.cwd === '/' ? '' : this.cwd}/${p}`;
      const out = [];
      for (const part of abs.split('/')) {
        if (!part || part === '.') continue;
        if (part === '..') out.pop(); else out.push(part);
      }
      return '/' + out.join('/');
    }
    node(abs) {
      if (abs === '/') return this.root;
      let cur = this.root;
      for (const part of abs.split('/').filter(Boolean)) {
        if (!cur || cur.type !== 'dir') return null;
        cur = cur.children.get(part) || null;
      }
      return cur;
    }
    parentOf(abs) { const i = abs.lastIndexOf('/'); return { dir: i <= 0 ? '/' : abs.slice(0, i), base: abs.slice(i + 1) }; }
    get(p) { return this.node(this.resolve(p)); }
    stat(p) { const n = this.get(p); if (!n) throw new ShErr(`${p}: No such file or directory`); return n; }
    isDir(n) { return n && n.type === 'dir'; }
    touchDir(n) { if (n) n.mtime = Date.now(); }
    size(n) { return n.type === 'dir' ? 4096 : n.size !== undefined ? n.size : new TextEncoder().encode(n.content).length; }
    writeFile(p, content, append) {
      const abs = this.resolve(p);
      const { dir, base } = this.parentOf(abs);
      const parent = this.node(dir);
      if (!parent || parent.type !== 'dir') throw new ShErr(`${p}: No such file or directory`);
      let n = parent.children.get(base);
      if (n && n.type === 'dir') throw new ShErr(`${p}: Is a directory`);
      if (!n) { n = mkNode('file', base); parent.children.set(base, n); this.touchDir(parent); }
      if (abs === '/dev/null') return n;   // the bit bucket: writes vanish
      n.content = append ? n.content + content : content;
      delete n.size;
      n.mtime = Date.now();
      return n;
    }
    readFile(p, who) {
      const n = this.get(p);
      if (!n) throw new ShErr(`${p}: No such file or directory`, who);
      if (n.type === 'dir') throw new ShErr(`${p}: Is a directory`, who);
      if (n.owner !== USER && !(n.mode & 0o004)) throw new ShErr(`${p}: Permission denied`, who);
      return n.content;
    }
    ls(abs) { const n = this.node(abs); return n && n.type === 'dir' ? Array.from(n.children.values()) : []; }

    /* lexing: words made of parts (so quotes control expansion), plus operators */
    lex(line) {
      const toks = [];
      let i = 0;
      let word = null;
      const push = () => { if (word) { toks.push({ word }); word = null; } };
      const part = (text, q) => { if (!word) word = []; word.push({ text, q }); };
      while (i < line.length) {
        const c = line[i];
        if (c === ' ' || c === '\t') { push(); i++; continue; }
        if (c === '#' && !word) break;                         // comment to end of line
        if (c === "'") { const j = line.indexOf("'", i + 1); if (j < 0) throw new ShErr('syntax error: unterminated single quote'); part(line.slice(i + 1, j), 's'); i = j + 1; continue; }
        if (c === '"') {
          let j = i + 1, buf = '';
          while (j < line.length && line[j] !== '"') { if (line[j] === '\\' && j + 1 < line.length && '"\\$`'.includes(line[j + 1])) { buf += line[j + 1]; j += 2; } else buf += line[j++]; }
          if (j >= line.length) throw new ShErr('syntax error: unterminated double quote');
          part(buf, 'd'); i = j + 1; continue;
        }
        if (c === '\\' && i + 1 < line.length) { part(line[i + 1], 's'); i += 2; continue; }
        if (c === '|' || c === '&' || c === ';' || c === '>' || c === '<') {
          push();
          const two = line.slice(i, i + 2);
          if (two === '||' || two === '&&' || two === '>>') { toks.push({ op: two }); i += 2; continue; }
          if (c === '&') throw new ShErr('syntax error: background jobs (&) are not part of this lesson terminal');
          toks.push({ op: c }); i++; continue;
        }
        if (c === '2' && line[i + 1] === '>' && !word) { toks.push({ op: line[i + 2] === '>' ? '2>>' : '2>' }); i += line[i + 2] === '>' ? 3 : 2; continue; }
        // unquoted run
        let j = i, buf = '';
        while (j < line.length && !' \t\'"|&;><\\'.includes(line[j])) buf += line[j++];
        part(buf, null); i = j;
      }
      push();
      return toks;
    }

    /* expansion of one word → list of strings (globs may yield several) */
    expand(word) {
      let text = '';
      let glob = false;
      word.forEach((p, idx) => {
        if (p.q === 's') { text += p.text; return; }
        let t = this.expandDollar(p.text);
        if (p.q === null) {
          if (idx === 0 && (t === '~' || t.startsWith('~/'))) t = HOME + t.slice(1);
          if (/[*?]/.test(t)) glob = true;
        }
        text += t;
      });
      if (!glob) return [text];
      const hits = this.glob(text);
      return hits.length ? hits : [text];
    }
    expandDollar(t) {
      let out = '';
      for (let i = 0; i < t.length; i++) {
        const c = t[i];
        if (c === '$' && t[i + 1] === '(') {
          let depth = 1, j = i + 2;
          while (j < t.length && depth) { if (t[j] === '(') depth++; else if (t[j] === ')') depth--; j++; }
          out += this.capture(t.slice(i + 2, j - 1)); i = j - 1; continue;
        }
        if (c === '`') { const j = t.indexOf('`', i + 1); if (j > 0) { out += this.capture(t.slice(i + 1, j)); i = j; continue; } }
        if (c === '$' && t[i + 1] === '{') { const j = t.indexOf('}', i); const name = t.slice(i + 2, j); out += this.env[name] !== undefined ? this.env[name] : ''; i = j; continue; }
        if (c === '$' && /[A-Za-z_?]/.test(t[i + 1] || '')) {
          let j = i + 1; while (j < t.length && /[A-Za-z0-9_]/.test(t[j])) j++;
          if (t[i + 1] === '?') { out += String(this.lastStatus); i = i + 1; continue; }
          const name = t.slice(i + 1, j); out += this.env[name] !== undefined ? this.env[name] : ''; i = j - 1; continue;
        }
        out += c;
      }
      return out;
    }
    glob(pattern) {
      const abs = pattern.startsWith('/');
      const parts = pattern.split('/');
      let bases = [abs ? '/' : this.cwd];
      const prefixOut = [];
      parts.forEach((part, idx) => {
        if (idx === 0 && abs) return;
        if (!part) return;
        const next = [];
        const re = new RegExp('^' + part.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
        for (const b of bases) {
          if (!/[*?]/.test(part)) { const p = b === '/' ? '/' + part : `${b}/${part}`; if (this.node(p)) next.push(p); continue; }
          for (const ch of this.ls(b)) if (re.test(ch.name) && (part.startsWith('.') || !ch.name.startsWith('.'))) next.push(b === '/' ? '/' + ch.name : `${b}/${ch.name}`);
        }
        bases = next;
      });
      const rel = (p) => (abs ? p : p.startsWith(this.cwd + '/') ? p.slice(this.cwd.length + 1) : p);
      return bases.map(rel).sort((a, b) => a.localeCompare(b));
    }
    capture(line) {
      if (this.depth > 8) throw new ShErr('command substitution nested too deep');
      this.depth++;
      const buf = [];
      try { this.runLine(line, { write: (t) => buf.push(t), err: (t) => this.screen.write(t, 'err') }); } finally { this.depth--; }
      return buf.join('').replace(/\n+$/, '');
    }

    /* parsing a line into lists → pipelines → simple commands */
    runLine(line, io) {
      io = io || { write: (t) => this.screen.write(t), err: (t) => this.screen.write(t, 'err'), tty: true };
      let toks;
      try { toks = this.lex(line); } catch (e) { io.err(`bash: ${e.message}\n`); this.lastStatus = 2; return 2; }
      // split by ; && ||
      const lists = [];
      let cur = [];
      let joiner = ';';
      for (const t of toks) {
        if (t.op === ';' || t.op === '&&' || t.op === '||') { lists.push({ toks: cur, joiner }); cur = []; joiner = t.op; }
        else cur.push(t);
      }
      lists.push({ toks: cur, joiner });
      let status = 0;
      for (const l of lists) {
        if (l.joiner === '&&' && status !== 0) continue;
        if (l.joiner === '||' && status === 0) continue;
        if (!l.toks.length) continue;
        try { status = this.runPipeline(l.toks, io); }
        catch (e) { io.err(`bash: ${e.message}\n`); status = 2; }
      }
      this.lastStatus = status;
      return status;
    }
    runPipeline(toks, io) {
      const stages = [[]];
      for (const t of toks) { if (t.op === '|') stages.push([]); else stages[stages.length - 1].push(t); }
      let input = '';
      let status = 0;
      stages.forEach((st, idx) => {
        const last = idx === stages.length - 1;
        const cmd = { args: [], redirects: [] };
        for (let i = 0; i < st.length; i++) {
          const t = st[i];
          if (t.op) {
            const target = st[i + 1];
            if (!target || !target.word) throw new ShErr('syntax error near unexpected token `newline\'');
            cmd.redirects.push({ op: t.op, file: this.expand(target.word)[0] }); i++;
          } else cmd.args.push(...this.expand(t.word));
        }
        if (!cmd.args.length) return;
        let out = '';
        let err = '';
        // A stage is "on a terminal" only if it is the last one, nothing redirects its output, and the line itself is on one.
        const tty = !!io.tty && last && !cmd.redirects.some((r) => r.op === '>' || r.op === '>>');
        const sub = { write: (t) => { out += t; }, err: (t) => { err += t; }, tty };
        for (const r of cmd.redirects) {
          if (r.op !== '<') continue;
          try { input = this.readFile(r.file, 'bash'); } catch (e) { io.err(`bash: ${e.message}\n`); status = 1; return; }
        }
        status = this.exec(cmd.args, input, sub);
        // redirections
        for (const r of cmd.redirects) {
          try {
            if (r.op === '>' || r.op === '>>') { this.writeFile(r.file, out, r.op === '>>'); out = ''; }
            else if (r.op === '2>' || r.op === '2>>') { if (r.file !== '/dev/null') this.writeFile(r.file, err, r.op === '2>>'); err = ''; }
            else if (r.op === '<') { /* input redirection: already consumed above via stdinFrom */ }
          } catch (e) { io.err(`bash: ${e.message}\n`); status = 1; }
        }
        if (err) io.err(err);
        if (last) { if (out) io.write(out); }
        else input = out;
      });
      return status;
    }
    stdinFrom(cmd, input) { return input; }

    /* command dispatch */
    exec(args, input, io) {
      let [name, ...rest] = args;
      if (this.aliases[name] && !this._noAlias) { const al = this.lex(this.aliases[name]).filter((t) => t.word).flatMap((t) => this.expand(t.word)); name = al[0]; rest = al.slice(1).concat(rest); }
      if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(name) && !rest.length) { const i = name.indexOf('='); this.env[name.slice(0, i)] = name.slice(i + 1); return 0; }
      const fn = CMDS[name];
      if (fn && rest.length === 1 && rest[0] === '--help' && HELP[name]) { io.write(`Usage: ${HELP[name]}\n`); return 0; }
      if (fn) {
        try { return fn.call(this, rest, input, io) || 0; }
        catch (e) { if (e instanceof ShErr) { io.err(`${e.cmd || name}: ${e.message}\n`); return e.status || 1; } io.err(`${name}: ${e.message}\n`); return 1; }
      }
      if (name.includes('/')) {
        const n = this.get(name);
        if (!n) { io.err(`bash: ${name}: No such file or directory\n`); return 127; }
        if (n.type === 'dir') { io.err(`bash: ${name}: Is a directory\n`); return 126; }
        if (!(n.mode & 0o100)) { io.err(`bash: ${name}: Permission denied\n`); return 126; }
        return this.runScript(n, rest, io);
      }
      io.err(`${this.scriptCtx ? `${this.scriptCtx.name}: line ${this.scriptCtx.line}` : 'bash'}: ${name}: command not found\n`);
      return 127;
    }
    runScript(n, args, io) {
      const lines = n.content.split('\n');
      let status = 0;
      const saved = this.env;
      this.env = Object.assign({}, saved, { 0: n.name });
      args.forEach((a, i) => { this.env[String(i + 1)] = a; });
      const savedCtx = this.scriptCtx;
      lines.forEach((line, i) => {
        if (!line.trim() || line.trim().startsWith('#')) return;
        this.scriptCtx = { name: n.name.includes('/') ? n.name : `./${n.name}`, line: i + 1 };
        status = this.runLine(line, io);
      });
      this.scriptCtx = savedCtx;
      this.env = saved;
      return status;
    }
  }

  class ShErr extends Error { constructor(msg, cmd, status) { super(msg); this.cmd = cmd; this.status = status; } }

  /* ---------- helpers for commands ---------- */
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const pad2 = (n) => String(n).padStart(2, '0');
  function lsDate(ms) { const d = new Date(ms); return `${MON[d.getMonth()]} ${String(d.getDate()).padStart(2, ' ')} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }
  function tz() { try { const s = new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }); return s.split(' ').pop(); } catch (e) { return 'UTC'; } }
  function dateStr(d) { return `${DAY[d.getDay()]} ${MON[d.getMonth()]} ${String(d.getDate()).padStart(2, ' ')} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())} ${tz()} ${d.getFullYear()}`; }
  function modeStr(n) {
    const m = n.mode;
    const bits = (v) => `${v & 4 ? 'r' : '-'}${v & 2 ? 'w' : '-'}${v & 1 ? 'x' : '-'}`;
    return `${n.type === 'dir' ? 'd' : '-'}${bits(m >> 6)}${bits((m >> 3) & 7)}${bits(m & 7)}`;
  }
  function human(bytes) {
    if (bytes === 0) return '0';
    if (bytes < 1024) return String(bytes);
    const units = ['K', 'M', 'G'];
    let v = bytes / 1024, u = 0;
    while (v >= 1024 && u < units.length - 1) { v /= 1024; u++; }
    return (v < 10 ? (Math.ceil(v * 10) / 10).toFixed(1) : String(Math.ceil(v))) + units[u];
  }
  /* GNU basic regular expressions → JS: in a BRE, + ? { } ( ) | are literal unless backslashed, and \. \* \[ stay escaped. */
  function breToJs(pat) {
    let out = '';
    for (let i = 0; i < pat.length; i++) {
      const c = pat[i];
      if (c === '\\' && i + 1 < pat.length) { const n = pat[++i]; out += '+?{}()|'.includes(n) ? n : '\\' + n; continue; }
      out += '+?{}()|'.includes(c) ? '\\' + c : c;
    }
    return out;
  }
  function flags(args, spec) {
    // spec: { letters: 'lahtR1', withValue: { n: true } } → { opts:{}, rest:[] }
    const opts = {}; const rest = [];
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '--') { rest.push(...args.slice(i + 1)); break; }
      if (a.startsWith('--') && a.length > 2) { const [k, v] = a.slice(2).split('='); opts[k] = v === undefined ? true : v; continue; }
      if (a.startsWith('-') && a.length > 1 && !(spec.numeric && /^-\d+$/.test(a))) {
        for (let j = 1; j < a.length; j++) {
          const ch = a[j];
          if (spec.withValue && spec.withValue[ch]) { const v = j + 1 < a.length ? a.slice(j + 1) : args[++i]; opts[ch] = v; break; }
          if (spec.letters && !spec.letters.includes(ch)) throw new ShErr(`invalid option -- '${ch}'\nTry '${spec.name} --help' for more information.`, spec.name);
          opts[ch] = true;
        }
        continue;
      }
      if (/^-\d+$/.test(a) && spec.numeric) { opts[spec.numeric] = a.slice(1); continue; }
      rest.push(a);
    }
    return { opts, rest };
  }
  const HELP = {
    echo: 'echo [-n] [STRING]...\n  Display a line of text. -n: no trailing newline.',
    pwd: 'pwd\n  Print the name of the current working directory.',
    whoami: 'whoami\n  Print the user name associated with the current user.',
    date: 'date\n  Print the current date and time.',
    clear: 'clear\n  Clear the terminal screen (Ctrl+L does the same).',
    history: 'history\n  Display the command history list with line numbers.',
    cd: 'cd [DIR]\n  Change the working directory. No DIR: go home. "-": go to the previous directory.',
    ls: 'ls [OPTION]... [FILE]...\n  List directory contents.\n  -a  all entries, including those starting with .\n  -l  long listing: mode, links, owner, group, size, date, name\n  -h  with -l, human-readable sizes (4.0K, 1.2M)\n  -t  sort by modification time, newest first\n  -R  list subdirectories recursively\n  -1  one entry per line',
    mkdir: 'mkdir [-p] DIRECTORY...\n  Create directories. -p: make parent directories as needed; no error if existing.',
    touch: 'touch FILE...\n  Create empty files, or update the timestamps of existing ones.',
    cat: 'cat [-n] [FILE]...\n  Concatenate files and print on the standard output. -n: number all output lines.',
    cp: 'cp [-r] SOURCE DEST\n  Copy files and directories. -r: copy directories recursively.',
    mv: 'mv SOURCE DEST\n  Move (rename) files and directories.',
    rm: 'rm [-r] [-f] FILE...\n  Remove files or directories. -r: recursive. -f: ignore nonexistent files, never prompt.',
    rmdir: 'rmdir DIRECTORY...\n  Remove empty directories.',
    head: 'head [-n NUM] [FILE]...\n  Print the first 10 lines (or NUM) of each FILE.',
    tail: 'tail [-n NUM] [FILE]...\n  Print the last 10 lines (or NUM) of each FILE.',
    wc: 'wc [-l] [-w] [-c] [FILE]...\n  Print newline, word and byte counts for each FILE.',
    grep: 'grep [-i] [-n] [-v] [-c] [-r] PATTERN [FILE]...\n  Print lines that match PATTERN.\n  -i ignore case  -n line numbers  -v invert  -c count only  -r recurse into directories',
    sort: 'sort [-r] [-n] [FILE]...\n  Sort lines of text. -r: reverse. -n: numeric.',
    uniq: 'uniq [-c] [FILE]\n  Report or omit repeated adjacent lines. -c: prefix lines by the number of occurrences.',
    chmod: 'chmod MODE FILE...\n  Change file mode bits. MODE is symbolic (u+x, go-w, a+r, +x) or octal (755, 644).',
    which: 'which COMMAND...\n  Locate a command: print the path of the executable that would run.',
    man: 'man COMMAND\n  Show the manual page for COMMAND (short form on this page).',
    tree: 'tree [DIR]\n  List the contents of directories in a tree-like format.',
    code: 'code [PATH]\n  Open PATH in Visual Studio Code.',
    cal: 'cal\n  Display a calendar of the current month.',
    env: 'env\n  Print the environment.',
    export: 'export NAME=VALUE\n  Set an environment variable for this shell and the programs it starts.',
    alias: 'alias [NAME=VALUE]\n  Define or display aliases.',
    test: 'test EXPR · [ EXPR ]\n  File tests (-f -d -e -x), string tests (-z -n = !=) and integer comparisons (-eq -lt …); exit 0 when true.',
    exit: 'exit\n  Exit the shell.',
  };
  const MAN = Object.assign({}, HELP, {
    ls: HELP.ls + '\n\nReading the long format:\n  -rw-r--r-- 1 adventurer adventurer 0 Nov  3 21:50 hello.txt\n  type+permissions  links  owner  group  size  modified  name',
    chmod: HELP.chmod + '\n\nOctal digits add r=4, w=2, x=1 for owner, group, others:\n  755 = rwxr-xr-x (scripts, directories)   644 = rw-r--r-- (ordinary files)',
  });

  /* ---------- commands ---------- */
  const CMDS = {
    echo(args, input, io) {
      let nl = true; let i = 0;
      while (args[i] === '-n' || args[i] === '-e') { if (args[i] === '-n') nl = false; i++; }
      let s = args.slice(i).join(' ');
      if (args.includes('-e')) s = s.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
      io.write(s + (nl ? '\n' : ''));
    },
    printf(args, input, io) { io.write(args.join(' ').replace(/\\n/g, '\n')); },
    pwd(args, input, io) { io.write(this.cwd + '\n'); },
    whoami(args, input, io) { io.write(USER + '\n'); },
    hostname(args, input, io) { io.write(HOST + '\n'); },
    date(args, input, io) { io.write(dateStr(new Date()) + '\n'); },
    clear() { this.screen.clear(); },
    history(args, input, io) { io.write(this.history.map((h, i) => `${String(i + 1).padStart(5, ' ')}  ${h}`).join('\n') + (this.history.length ? '\n' : '')); },
    true() { return 0; },
    false() { return 1; },
    exit(args, input, io) { io.write('logout\n(this terminal stays on the page; press Run to start it again)\n'); },
    logout(args, input, io) { return CMDS.exit.call(this, args, input, io); },
    cd(args, input, io) {
      let target = args[0];
      if (args.length > 1) throw new ShErr('too many arguments', 'bash: cd');
      if (target === undefined) target = HOME;
      if (target === '-') { target = this.env.OLDPWD; io.write(target + '\n'); }
      const abs = this.resolve(target);
      const n = this.node(abs);
      if (!n) throw new ShErr(`${args[0]}: No such file or directory`, 'bash: cd');
      if (n.type !== 'dir') throw new ShErr(`${args[0]}: Not a directory`, 'bash: cd');
      if (n.owner !== USER && !(n.mode & 0o001)) throw new ShErr(`${args[0]}: Permission denied`, 'bash: cd');
      this.env.OLDPWD = this.cwd; this.cwd = abs; this.env.PWD = abs;
    },
    ls(args, input, io) {
      const { opts, rest } = flags(args, { letters: 'lahtrR1AFdS', name: 'ls' });
      const targets = rest.length ? rest : ['.'];
      let status = 0;
      const entriesOf = (dirNode, dirAbs) => {
        let list = Array.from(dirNode.children.values());
        if (opts.a) list = [Object.assign({}, dirNode, { name: '.' }), mkNode('dir', '..', { mode: DIR_MODE, mtime: dirNode.mtime })].concat(list);
        else if (!opts.A) list = list.filter((n) => !n.name.startsWith('.'));
        list.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
        if (opts.t) list.sort((a, b) => b.mtime - a.mtime);
        if (opts.S) list.sort((a, b) => this.size(b) - this.size(a));
        if (opts.r) list.reverse();
        return list;
      };
      const nameOf = (n) => n.name + (opts.F && n.type === 'dir' && n.name !== '.' && n.name !== '..' ? '/' : opts.F && n.type === 'file' && n.mode & 0o100 ? '*' : '');
      const render = (list, withTotal) => {
        if (opts.l) {
          const rows = list.map((n) => [modeStr(n), String(n.type === 'dir' ? 2 + Array.from(n.children.values()).filter((c) => c.type === 'dir').length : 1), n.owner, n.owner === 'root' ? 'root' : USER, opts.h ? human(this.size(n)) : String(this.size(n)), lsDate(n.mtime), nameOf(n)]);
          const w = [0, 0, 0, 0, 0];
          rows.forEach((r) => { for (let i = 1; i <= 4; i++) w[i] = Math.max(w[i], r[i].length); });
          const total = list.reduce((s, n) => s + (n.type === 'dir' ? 4 : Math.ceil(this.size(n) / 4096) * 4), 0);
          return (withTotal ? `total ${total}\n` : '') + rows.map((r) => `${r[0]} ${r[1].padStart(w[1])} ${r[2].padEnd(w[2])} ${r[3].padEnd(w[3])} ${r[4].padStart(w[4])} ${r[5]} ${r[6]}`).join('\n') + (rows.length ? '\n' : '');
        }
        if (!list.length) return '';
        if (opts['1'] || !io.tty) return list.map(nameOf).join('\n') + '\n';   // like real ls: one per line into a pipe or a file
        return list.map(nameOf).join('  ') + '\n';
      };
      const files = [], dirs = [];
      for (const t of targets) {
        const n = this.get(t);
        if (!n) { io.err(`ls: cannot access '${t}': No such file or directory\n`); status = 2; continue; }
        if (n.type === 'dir' && n.owner !== USER && !(n.mode & 0o004)) { io.err(`ls: cannot open directory '${t}': Permission denied\n`); status = 2; continue; }
        if (n.type === 'dir' && !opts.d) dirs.push({ t, n }); else files.push(Object.assign({}, n, { name: t }));
      }
      if (files.length) io.write(render(files));
      const showDir = (t, n, header) => {
        if (header) io.write(`${t}:\n`);
        io.write(render(entriesOf(n, this.resolve(t)), true));
        if (opts.R) {
          for (const ch of entriesOf(n, this.resolve(t))) if (ch.type === 'dir' && ch.name !== '.' && ch.name !== '..') { io.write('\n'); showDir(`${t === '/' ? '' : t}/${ch.name}`.replace(/^\.\//, './'), ch, true); }
        }
      };
      dirs.forEach((d, i) => { if (i > 0 || files.length) io.write('\n'); showDir(d.t, d.n, dirs.length > 1 || files.length > 0 || opts.R); });
      return status;
    },
    tree(args, input, io) {
      const { rest } = flags(args, { letters: 'aL', name: 'tree' });
      const start = rest[0] || '.';
      const n = this.get(start);
      if (!n) { io.err(`tree: ${start} [error opening dir]\n`); return 1; }
      let d = 0, f = 0;
      const lines = [start];
      const walk = (node, prefix) => {
        const kids = Array.from(node.children.values()).filter((c) => !c.name.startsWith('.')).sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
        kids.forEach((c, i) => {
          const last = i === kids.length - 1;
          lines.push(`${prefix}${last ? '└── ' : '├── '}${c.name}`);
          if (c.type === 'dir') { d++; walk(c, prefix + (last ? '    ' : '│   ')); } else f++;
        });
      };
      if (n.type === 'dir') walk(n, '');
      lines.push('', `${d} director${d === 1 ? 'y' : 'ies'}, ${f} file${f === 1 ? '' : 's'}`);
      io.write(lines.join('\n') + '\n');
    },
    mkdir(args, input, io) {
      const { opts, rest } = flags(args, { letters: 'pv', name: 'mkdir' });
      if (!rest.length) throw new ShErr('missing operand\nTry \'mkdir --help\' for more information.', 'mkdir');
      let status = 0;
      for (const t of rest) {
        const abs = this.resolve(t);
        if (opts.p) {
          let cur = this.root;
          for (const part of abs.split('/').filter(Boolean)) {
            if (!cur.children.has(part)) { cur.children.set(part, mkNode('dir', part)); cur.mtime = Date.now(); if (opts.v) io.write(`mkdir: created directory '${t}'\n`); }
            cur = cur.children.get(part);
            if (cur.type !== 'dir') { io.err(`mkdir: cannot create directory '${t}': Not a directory\n`); status = 1; break; }
          }
          continue;
        }
        const { dir, base } = this.parentOf(abs);
        const parent = this.node(dir);
        if (!parent || parent.type !== 'dir') { io.err(`mkdir: cannot create directory '${t}': No such file or directory\n`); status = 1; continue; }
        if (parent.children.has(base)) { io.err(`mkdir: cannot create directory '${t}': File exists\n`); status = 1; continue; }
        parent.children.set(base, mkNode('dir', base)); parent.mtime = Date.now();
        if (opts.v) io.write(`mkdir: created directory '${t}'\n`);
      }
      return status;
    },
    rmdir(args, input, io) {
      let status = 0;
      for (const t of args) {
        const n = this.get(t);
        if (!n) { io.err(`rmdir: failed to remove '${t}': No such file or directory\n`); status = 1; continue; }
        if (n.type !== 'dir') { io.err(`rmdir: failed to remove '${t}': Not a directory\n`); status = 1; continue; }
        if (n.children.size) { io.err(`rmdir: failed to remove '${t}': Directory not empty\n`); status = 1; continue; }
        const { dir, base } = this.parentOf(this.resolve(t)); this.node(dir).children.delete(base);
      }
      return status;
    },
    touch(args, input, io) {
      if (!args.length) throw new ShErr('missing file operand\nTry \'touch --help\' for more information.', 'touch');
      let status = 0;
      for (const t of args) {
        const n = this.get(t);
        if (n) { n.mtime = Date.now(); continue; }
        try { this.writeFile(t, '', false); } catch (e) { io.err(`touch: cannot touch '${t}': ${e.message.replace(/^.*?: /, '')}\n`); status = 1; }
      }
      return status;
    },
    cat(args, input, io) {
      const { opts, rest } = flags(args, { letters: 'nAE', name: 'cat' });
      let status = 0;
      const emit = (text) => { if (opts.n) { const ls = text.split('\n'); if (ls[ls.length - 1] === '') ls.pop(); io.write(ls.map((l, i) => `${String(i + 1).padStart(6, ' ')}\t${l}`).join('\n') + (ls.length ? '\n' : '')); } else io.write(text); };
      if (!rest.length) { emit(input || ''); return 0; }
      for (const t of rest) {
        if (t === '-') { emit(input || ''); continue; }
        try { emit(this.readFile(t, 'cat')); } catch (e) { io.err(`cat: ${e.message}\n`); status = 1; }
      }
      return status;
    },
    head(args, input, io) { return headTail.call(this, 'head', args, input, io); },
    tail(args, input, io) { return headTail.call(this, 'tail', args, input, io); },
    wc(args, input, io) {
      const { opts, rest } = flags(args, { letters: 'lwcm', name: 'wc' });
      const any = opts.l || opts.w || opts.c || opts.m;
      const count = (text) => ({ l: (text.match(/\n/g) || []).length, w: text.split(/\s+/).filter(Boolean).length, c: new TextEncoder().encode(text).length });
      const fmt = (c, name) => { const cols = []; if (!any || opts.l) cols.push(c.l); if (!any || opts.w) cols.push(c.w); if (!any || opts.c || opts.m) cols.push(c.c); return cols.map((v) => String(v).padStart(rest.length ? 7 : 1, ' ')).join(' ') + (name ? ' ' + name : '') + '\n'; };
      if (!rest.length) { io.write(fmt(count(input || '')).replace(/^\s+/, '')); return 0; }
      let status = 0; const tot = { l: 0, w: 0, c: 0 };
      for (const t of rest) {
        try { const c = count(this.readFile(t, 'wc')); tot.l += c.l; tot.w += c.w; tot.c += c.c; io.write(fmt(c, t)); } catch (e) { io.err(`wc: ${e.message}\n`); status = 1; }
      }
      if (rest.length > 1) io.write(fmt(tot, 'total'));
      return status;
    },
    grep(args, input, io) {
      const { opts, rest } = flags(args, { letters: 'invcrlEwoh', name: 'grep' });
      if (!rest.length) { io.err('Usage: grep [OPTION]... PATTERNS [FILE]...\nTry \'grep --help\' for more information.\n'); return 2; }
      const [pat, ...files] = rest;
      let re;
      try { re = new RegExp(opts.w ? `\\b(?:${opts.E ? pat : pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b` : opts.E ? pat : breToJs(pat), opts.i ? 'i' : ''); } catch (e) { io.err(`grep: ${e.message}\n`); return 2; }
      let found = false;
      const scan = (text, label) => {
        const lines = text.split('\n'); if (lines[lines.length - 1] === '') lines.pop();
        const hits = [];
        lines.forEach((l, i) => { const m = re.test(l); if (m !== !!opts.v) hits.push({ i: i + 1, l }); });
        if (hits.length) found = true;
        if (opts.c) { io.write(`${label ? label + ':' : ''}${hits.length}\n`); return; }
        if (opts.l) { if (hits.length) io.write(label + '\n'); return; }
        for (const h of hits) io.write(`${label && !opts.h ? label + ':' : ''}${opts.n ? h.i + ':' : ''}${h.l}\n`);
      };
      if (!files.length) { scan(input || '', ''); return found ? 0 : 1; }
      let status = found ? 0 : 1;
      const many = files.length > 1 || opts.r;
      const visit = (t) => {
        const n = this.get(t);
        if (!n) { io.err(`grep: ${t}: No such file or directory\n`); status = 2; return; }
        if (n.type === 'dir') {
          if (!opts.r) { io.err(`grep: ${t}: Is a directory\n`); return; }
          for (const ch of Array.from(n.children.values())) visit(`${t.replace(/\/$/, '')}/${ch.name}`);
          return;
        }
        scan(n.content, many ? t : '');
      };
      files.forEach(visit);
      return status === 2 ? 2 : found ? 0 : 1;
    },
    sort(args, input, io) {
      const { opts, rest } = flags(args, { letters: 'rnu', name: 'sort' });
      let text = '';
      for (const t of rest) text += this.readFile(t, 'sort');
      if (!rest.length) text = input || '';
      let lines = text.split('\n'); if (lines[lines.length - 1] === '') lines.pop();
      lines.sort(opts.n ? (a, b) => parseFloat(a) - parseFloat(b) || a.localeCompare(b) : (a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }) || (a < b ? -1 : a > b ? 1 : 0));
      if (opts.r) lines.reverse();
      if (opts.u) lines = lines.filter((l, i) => i === 0 || l !== lines[i - 1]);
      io.write(lines.join('\n') + (lines.length ? '\n' : ''));
    },
    uniq(args, input, io) {
      const { opts, rest } = flags(args, { letters: 'cdi', name: 'uniq' });
      const text = rest.length ? this.readFile(rest[0], 'uniq') : input || '';
      const lines = text.split('\n'); if (lines[lines.length - 1] === '') lines.pop();
      const out = [];
      for (const l of lines) { const last = out[out.length - 1]; if (last && last.l === l) last.n++; else out.push({ l, n: 1 }); }
      io.write(out.filter((o) => !opts.d || o.n > 1).map((o) => (opts.c ? `${String(o.n).padStart(7, ' ')} ${o.l}` : o.l)).join('\n') + (out.length ? '\n' : ''));
    },
    cp(args, input, io) {
      const { opts, rest } = flags(args, { letters: 'rRv', name: 'cp' });
      if (rest.length < 2) throw new ShErr(rest.length ? `missing destination file operand after '${rest[0]}'` : 'missing file operand', 'cp');
      const dest = rest[rest.length - 1]; const srcs = rest.slice(0, -1);
      const destNode = this.get(dest);
      if (srcs.length > 1 && !(destNode && destNode.type === 'dir')) throw new ShErr(`target '${dest}' is not a directory`, 'cp');
      const clone = (n, name) => { const c = mkNode(n.type, name, { mode: n.mode }); if (n.type === 'dir') for (const [k, v] of n.children) c.children.set(k, clone(v, k)); else c.content = n.content; return c; };
      let status = 0;
      for (const s of srcs) {
        const n = this.get(s);
        if (!n) { io.err(`cp: cannot stat '${s}': No such file or directory\n`); status = 1; continue; }
        if (n.type === 'dir' && !(opts.r || opts.R)) { io.err(`cp: -r not specified; omitting directory '${s}'\n`); status = 1; continue; }
        const targetAbs = destNode && destNode.type === 'dir' ? `${this.resolve(dest)}/${this.parentOf(this.resolve(s)).base}`.replace('//', '/') : this.resolve(dest);
        const { dir, base } = this.parentOf(targetAbs);
        const parent = this.node(dir);
        if (!parent) { io.err(`cp: cannot create '${dest}': No such file or directory\n`); status = 1; continue; }
        parent.children.set(base, clone(n, base)); parent.mtime = Date.now();
        if (opts.v) io.write(`'${s}' -> '${dest}'\n`);
      }
      return status;
    },
    mv(args, input, io) {
      const { opts, rest } = flags(args, { letters: 'v', name: 'mv' });
      if (rest.length < 2) throw new ShErr(rest.length ? `missing destination file operand after '${rest[0]}'` : 'missing file operand', 'mv');
      const dest = rest[rest.length - 1]; const srcs = rest.slice(0, -1);
      const destNode = this.get(dest);
      if (srcs.length > 1 && !(destNode && destNode.type === 'dir')) throw new ShErr(`target '${dest}' is not a directory`, 'mv');
      let status = 0;
      for (const s of srcs) {
        const abs = this.resolve(s); const n = this.node(abs);
        if (!n) { io.err(`mv: cannot stat '${s}': No such file or directory\n`); status = 1; continue; }
        const targetAbs = destNode && destNode.type === 'dir' ? `${this.resolve(dest)}/${this.parentOf(abs).base}`.replace('//', '/') : this.resolve(dest);
        if (targetAbs === abs || targetAbs.startsWith(abs + '/')) { io.err(`mv: cannot move '${s}' to a subdirectory of itself, '${dest}'\n`); status = 1; continue; }
        const from = this.parentOf(abs); const to = this.parentOf(targetAbs);
        const toParent = this.node(to.dir);
        if (!toParent || toParent.type !== 'dir') { io.err(`mv: cannot move '${s}' to '${dest}': No such file or directory\n`); status = 1; continue; }
        this.node(from.dir).children.delete(from.base);
        n.name = to.base; toParent.children.set(to.base, n); toParent.mtime = Date.now();
        if (this.cwd === abs || this.cwd.startsWith(abs + '/')) { this.cwd = targetAbs + this.cwd.slice(abs.length); this.env.PWD = this.cwd; }
        if (opts.v) io.write(`renamed '${s}' -> '${dest}'\n`);
      }
      return status;
    },
    rm(args, input, io) {
      const { opts, rest } = flags(args, { letters: 'rRfvdi', name: 'rm' });
      if (!rest.length) { if (opts.f) return 0; throw new ShErr('missing operand\nTry \'rm --help\' for more information.', 'rm'); }
      let status = 0;
      for (const t of rest) {
        const abs = this.resolve(t);
        if (abs === '/') { io.err("rm: it is dangerous to operate recursively on '/'\nrm: use --no-preserve-root to override this failsafe\n"); status = 1; continue; }
        const n = this.node(abs);
        if (!n) { if (!opts.f) { io.err(`rm: cannot remove '${t}': No such file or directory\n`); status = 1; } continue; }
        if (n.type === 'dir' && !(opts.r || opts.R)) { io.err(`rm: cannot remove '${t}': Is a directory\n`); status = 1; continue; }
        if (n.owner === 'root' && !opts.f) { io.err(`rm: cannot remove '${t}': Permission denied\n`); status = 1; continue; }
        const { dir, base } = this.parentOf(abs);
        this.node(dir).children.delete(base); this.node(dir).mtime = Date.now();
        if (opts.v) io.write(`removed ${n.type === 'dir' ? 'directory ' : ''}'${t}'\n`);
        if (this.cwd === abs || this.cwd.startsWith(abs + '/')) { /* bash keeps you in a deleted directory; pwd still prints it */ }
      }
      return status;
    },
    chmod(args, input, io) {
      const { opts, rest } = flags(args, { letters: 'Rv', name: 'chmod' });
      if (rest.length < 2) throw new ShErr(rest.length ? `missing operand after '${rest[0]}'` : 'missing operand', 'chmod');
      const [mode, ...files] = rest;
      let status = 0;
      const apply = (n) => {
        if (/^[0-7]{3,4}$/.test(mode)) { n.mode = parseInt(mode.slice(-3), 8); return; }
        const m = mode.match(/^([ugoa]*)([+\-=])([rwxX]*)$/);
        if (!m) throw new ShErr(`invalid mode: '${mode}'`, 'chmod');
        const who = m[1] || 'a'; const op = m[2]; const perms = m[3];
        let bits = 0;
        if (perms.includes('r')) bits |= 4; if (perms.includes('w')) bits |= 2; if (perms.includes('x') || (perms.includes('X') && (n.type === 'dir' || n.mode & 0o111))) bits |= 1;
        const masks = { u: 0o700, g: 0o070, o: 0o007 };
        for (const w of who === 'a' ? 'ugo' : who) {
          const shift = w === 'u' ? 6 : w === 'g' ? 3 : 0;
          const val = bits << shift;
          if (op === '+') n.mode |= val; else if (op === '-') n.mode &= ~val; else n.mode = (n.mode & ~masks[w]) | val;
        }
      };
      for (const f of files) {
        const n = this.get(f);
        if (!n) { io.err(`chmod: cannot access '${f}': No such file or directory\n`); status = 1; continue; }
        if (n.owner === 'root') { io.err(`chmod: changing permissions of '${f}': Operation not permitted\n`); status = 1; continue; }
        apply(n);
        if (opts.R && n.type === 'dir') { const walk = (d) => { for (const c of d.children.values()) { apply(c); if (c.type === 'dir') walk(c); } }; walk(n); }
        if (opts.v) io.write(`mode of '${f}' changed to ${(n.mode).toString(8).padStart(4, '0')} (${modeStr(n).slice(1)})\n`);
      }
      return status;
    },
    which(args, input, io) {
      let status = 0;
      for (const a of args) {
        if (a === 'cd' || a === 'export' || a === 'alias' || a === 'history' || a === 'exit') { io.err(`which: no ${a} in (${this.env.PATH})\n`); status = 1; continue; }
        const dirs = this.env.PATH.split(':'); let hit = null;
        for (const d of dirs) { const n = this.node(`${d}/${a}`); if (n && n.type === 'file' && n.mode & 0o100) { hit = `${d}/${a}`; break; } }
        if (hit) io.write(hit + '\n'); else { status = 1; }
      }
      return status;
    },
    type(args, input, io) { for (const a of args) { if (CMDS[a]) io.write(this.aliases[a] ? `${a} is aliased to \`${this.aliases[a]}'\n` : ['cd', 'export', 'alias', 'history', 'exit', 'echo', 'pwd', 'type', 'source'].includes(a) ? `${a} is a shell builtin\n` : `${a} is /usr/bin/${a}\n`); else io.err(`bash: type: ${a}: not found\n`); } },
    man(args, input, io) {
      if (!args.length) { io.err('What manual page do you want?\nFor example, try \'man ls\'.\n'); return 1; }
      const page = MAN[args[0]];
      if (!page) { io.err(`No manual entry for ${args[0]}\n`); return 16; }
      if (/^[A-Z]+\(1\)/.test(page)) { io.write(page + '\n'); return 0; }
      io.write(`${args[0].toUpperCase()}(1)                     User Commands\n\nNAME\n    ${args[0]}\n\nSYNOPSIS\n    ${page.split('\n').join('\n    ')}\n\n(short form: the real page is longer; on your machine press q to leave it)\n`);
    },
    help(args, input, io) { io.write('This lesson terminal understands: ' + Object.keys(CMDS).sort().join(', ') + '\nTry `man ls` or `ls --help`.\n'); },
    cal(args, input, io) {
      const d = new Date(); const y = d.getFullYear(); const m = d.getMonth();
      const title = `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m]} ${y}`;
      const padL = Math.floor((20 - title.length) / 2);
      const lines = [' '.repeat(padL) + title, 'Su Mo Tu We Th Fr Sa'];
      const first = new Date(y, m, 1).getDay(); const days = new Date(y, m + 1, 0).getDate();
      let row = '   '.repeat(first);
      for (let day = 1; day <= days; day++) {
        row += String(day).padStart(2, ' ') + ' ';
        if ((first + day) % 7 === 0) { lines.push(row.replace(/\s+$/, '')); row = ''; }
      }
      if (row.trim()) lines.push(row.replace(/\s+$/, ''));
      io.write(lines.join('\n') + '\n');
    },
    uptime(args, input, io) { const d = new Date(); const up = Math.max(1, Math.round((Date.now() - PAGE_LOADED) / 60000)); io.write(` ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())} up ${up} min,  1 user,  load average: 0.12, 0.08, 0.03\n`); },
    df(args, input, io) { const h = args.includes('-h'); io.write(h ? 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        98G   21G   72G  23% /\ntmpfs           7.8G     0  7.8G   0% /tmp\n' : 'Filesystem     1K-blocks     Used Available Use% Mounted on\n/dev/sda1      102687672 21965204  75464140  23% /\ntmpfs            8155136        0   8155136   0% /tmp\n'); },
    env(args, input, io) { io.write(Object.keys(this.env).filter((k) => !/^\d+$/.test(k)).sort().map((k) => `${k}=${this.env[k]}`).join('\n') + '\n'); },
    printenv(args, input, io) { if (!args.length) return CMDS.env.call(this, args, input, io); let st = 0; for (const a of args) { if (this.env[a] !== undefined) io.write(this.env[a] + '\n'); else st = 1; } return st; },
    export(args, input, io) { for (const a of args) { const i = a.indexOf('='); if (i > 0) this.env[a.slice(0, i)] = a.slice(i + 1); } },
    unset(args) { for (const a of args) delete this.env[a]; },
    test(args, input, io) {
      // the shell's [ ]: file tests, string tests, integer comparisons; status 0 = true, 1 = false
      let a = args.slice();
      if (a[a.length - 1] === ']') a = a.slice(0, -1);
      let neg = false;
      if (a[0] === '!') { neg = true; a = a.slice(1); }
      let r;
      const n = (p) => this.get(p);
      if (a.length === 0) r = false;
      else if (a.length === 1) r = a[0] !== '';
      else if (a.length === 2) {
        const [op, x] = a;
        r = op === '-f' ? !!(n(x) && n(x).type === 'file') : op === '-d' ? !!(n(x) && n(x).type === 'dir') : op === '-e' ? !!n(x) : op === '-s' ? !!(n(x) && n(x).type === 'file' && n(x).content.length > 0) : op === '-x' ? !!(n(x) && (n(x).mode & 0o100)) : op === '-r' ? !!n(x) : op === '-z' ? x === '' : op === '-n' ? x !== '' : null;
        if (r === null) { io.err(`bash: test: ${op}: unary operator expected\n`); return 2; }
      } else if (a.length === 3) {
        const [x, op, y] = a;
        const num = () => { if (!/^-?\d+$/.test(x) || !/^-?\d+$/.test(y)) { throw new ShErr(`${/^-?\d+$/.test(x) ? y : x}: integer expression expected`, 'bash: test'); } return [Number(x), Number(y)]; };
        if (op === '=' || op === '==') r = x === y; else if (op === '!=') r = x !== y;
        else if (op === '-eq') { const [p, q] = num(); r = p === q; } else if (op === '-ne') { const [p, q] = num(); r = p !== q; }
        else if (op === '-lt') { const [p, q] = num(); r = p < q; } else if (op === '-le') { const [p, q] = num(); r = p <= q; }
        else if (op === '-gt') { const [p, q] = num(); r = p > q; } else if (op === '-ge') { const [p, q] = num(); r = p >= q; }
        else { io.err(`bash: test: ${op}: binary operator expected\n`); return 2; }
      } else { io.err('bash: test: too many arguments\n'); return 2; }
      return (neg ? !r : r) ? 0 : 1;
    },
    '['(args, input, io) { if (args[args.length - 1] !== ']') { io.err("bash: [: missing `]'\n"); return 2; } return CMDS.test.call(this, args, input, io); },
    true() { return 0; },
    false() { return 1; },
    alias(args, input, io) {
      if (!args.length) { io.write(Object.keys(this.aliases).sort().map((k) => `alias ${k}='${this.aliases[k]}'`).join('\n') + '\n'); return; }
      for (const a of args) { const i = a.indexOf('='); if (i > 0) this.aliases[a.slice(0, i)] = a.slice(i + 1).replace(/^['"]|['"]$/g, ''); else if (this.aliases[a]) io.write(`alias ${a}='${this.aliases[a]}'\n`); else { io.err(`bash: alias: ${a}: not found\n`); return 1; } }
    },
    unalias(args) { for (const a of args) delete this.aliases[a]; },
    source(args, input, io) { if (!args.length) throw new ShErr('filename argument required\nsource: usage: source filename [arguments]', 'bash: source'); const n = this.get(args[0]); if (!n) throw new ShErr(`${args[0]}: No such file or directory`, 'bash'); return this.runScript(n, args.slice(1), io); },
    bash(args, input, io) { if (!args.length) { io.write('(a new bash would start here; on this page you are already in one)\n'); return 0; } const n = this.get(args[0]); if (!n) { io.err(`bash: ${args[0]}: No such file or directory\n`); return 127; } return this.runScript(n, args.slice(1), io); },
    sh(args, input, io) { return CMDS.bash.call(this, args, input, io); },
    code(args, input, io) { const t = args[0] || '.'; if (t.startsWith('-')) { if (t === '--version') { io.write('1.106.0\nf2c8a4b0e3d1c7a9b5e6f4d2c1a0b9e8d7c6b5a4\nx64\n'); return 0; } io.write(`(code ${t}: handled by VS Code on your machine)\n`); return 0; } const n = this.get(t); io.write(`Opening ${n ? (n.type === 'dir' ? 'folder' : 'file') + ' ' : ''}${t} in VS Code… ${n ? '' : '(it does not exist yet; VS Code would create it when you save)'}\n(on this page that is as far as it goes: the editor is on your machine)\n`); },
    open(args, input, io) { io.write(`(open ${args.join(' ')}: on your machine this hands the file to the default app)\n`); },
    'xdg-open'(args, input, io) { return CMDS.open.call(this, args, input, io); },
    git(args, input, io) { if (args[0] === '--version') { io.write('git version 2.47.1\n'); return 0; } io.write('git: this terminal is for the shell. Git gets its own terminal in session 1.3.\n'); return 1; },
    node(args, input, io) { if (args[0] === '--version' || args[0] === '-v') { io.write('v24.13.0\n'); return 0; } io.write('node: this terminal is for the shell. Node runs for real in the Run buttons from Unit 3 on.\n'); return 1; },
    npm(args, input, io) { if (args[0] === '--version' || args[0] === '-v') { io.write('11.6.2\n'); return 0; } io.write('npm: this terminal is for the shell. npm arrives in Unit 4.\n'); return 1; },
    sudo(args, input, io) { io.write('[sudo] password for adventurer: ********\n'); if (!args.length) return 0; return this.exec(args, input, Object.assign({}, io, { err: (t) => io.err(t) })); },
    apt(args, input, io) { io.write(`apt ${args.join(' ')}: packages are not installed from a lesson page. On your machine this would ${args[0] === 'update' ? 'refresh the package lists' : args[0] === 'upgrade' ? 'upgrade every installed package' : args[0] === 'install' ? `download and install ${args.slice(1).filter((a) => !a.startsWith('-')).join(', ') || 'the packages named'}` : 'run'}.\n`); },
    'apt-get'(args, input, io) { return CMDS.apt.call(this, args, input, io); },
    brew(args, input, io) { io.write(`brew ${args.join(' ')}: Homebrew is not installed from a lesson page. On your Mac this would ${args[0] === 'install' ? `download and install ${args.slice(1).join(', ') || 'the formulae named'}` : 'run'}.\n`); },
    curl(args, input, io) { io.write('curl: this terminal has no network. On your machine curl fetches a URL and prints (or saves) what comes back.\n'); return 6; },
    wget(args, input, io) { return CMDS.curl.call(this, args, input, io); },
    ssh(args, input, io) { io.write('ssh: this terminal has no network. On your machine ssh opens a shell on another computer; session 1.4 uses it to talk to GitHub.\n'); return 255; },
    sleep() { return 0; },
    seq(args, input, io) { const n = args.map(Number); const [a, b] = n.length === 1 ? [1, n[0]] : n; const out = []; for (let i = a; i <= b; i++) out.push(i); io.write(out.join('\n') + '\n'); },
    yes(args, input, io) { io.write(Array(20).fill(args[0] || 'y').join('\n') + '\n(on your machine this never stops: press Ctrl+C)\n'); },
    tr(args, input, io) { const [a, b] = args.filter((x) => !x.startsWith('-')); const del = args.includes('-d'); const expandSet = (s) => s.replace(/a-z/g, 'abcdefghijklmnopqrstuvwxyz').replace(/A-Z/g, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ').replace(/0-9/g, '0123456789'); const A = expandSet(a || ''), B = expandSet(b || ''); io.write(Array.from(input || '').map((c) => { const i = A.indexOf(c); if (i < 0) return c; if (del) return ''; return B[Math.min(i, B.length - 1)] || c; }).join('')); },
    cut(args, input, io) { const { opts, rest } = flags(args, { letters: '', withValue: { d: true, f: true, c: true }, name: 'cut' }); const text = rest.length ? this.readFile(rest[0], 'cut') : input || ''; const lines = text.split('\n'); if (lines[lines.length - 1] === '') lines.pop(); const out = lines.map((l) => { if (opts.f) { const parts = l.split(opts.d || '\t'); return opts.f.split(',').map((f) => parts[Number(f) - 1] || '').join(opts.d || '\t'); } if (opts.c) { const [a, b] = opts.c.split('-').map(Number); return l.slice(a - 1, b || a); } return l; }); io.write(out.join('\n') + (out.length ? '\n' : '')); },
    less(args, input, io) { return CMDS.cat.call(this, args, input, io); },
    more(args, input, io) { return CMDS.cat.call(this, args, input, io); },
    nano(args, input, io) { io.write(`(nano ${args.join(' ')}: a full-screen editor would open here; on this page use echo and >> to write files, or code to open VS Code)\n`); },
    vim(args, input, io) { io.write(`(vim ${args.join(' ')}: a full-screen editor would open here; the famous way out is Esc then :q! Enter)\n`); },
    vi(args, input, io) { return CMDS.vim.call(this, args, input, io); },
    file(args, input, io) { for (const a of args) { const n = this.get(a); if (!n) io.err(`file: cannot open '${a}' (No such file or directory)\n`); else io.write(`${a}: ${n.type === 'dir' ? 'directory' : n.content === '' ? 'empty' : /^#!/.test(n.content) ? 'Bourne-Again shell script, ASCII text executable' : 'ASCII text'}\n`); } },
    stat(args, input, io) { for (const a of args) { const n = this.get(a); if (!n) { io.err(`stat: cannot statx '${a}': No such file or directory\n`); continue; } io.write(`  File: ${a}\n  Size: ${this.size(n)}\tBlocks: 8\t${n.type === 'dir' ? 'directory' : 'regular file'}\nAccess: (${n.mode.toString(8).padStart(4, '0')}/${modeStr(n)})  Uid: ( 1000/${n.owner})   Gid: ( 1000/${n.owner})\nModify: ${new Date(n.mtime).toISOString()}\n`); } },
    basename(args, input, io) { io.write(this.parentOf(this.resolve(args[0] || '')).base + '\n'); },
    dirname(args, input, io) { io.write(this.parentOf(this.resolve(args[0] || '')).dir + '\n'); },
    readlink(args, input, io) { io.write(this.resolve(args[args.length - 1] || '.') + '\n'); },
    realpath(args, input, io) { io.write(this.resolve(args[0] || '.') + '\n'); },
  };
  function headTail(which, args, input, io) {
    const { opts, rest } = flags(args, { letters: 'q', withValue: { n: true, c: true }, numeric: 'n', name: which });
    const n = Number(opts.n === undefined ? 10 : String(opts.n).replace(/^[+-]/, ''));
    const pick = (text) => { const lines = text.split('\n'); const trail = lines[lines.length - 1] === ''; if (trail) lines.pop(); const sel = which === 'head' ? lines.slice(0, n) : lines.slice(Math.max(0, lines.length - n)); return sel.join('\n') + (sel.length ? '\n' : ''); };
    if (!rest.length) { io.write(pick(input || '')); return 0; }
    let status = 0;
    rest.forEach((t, i) => {
      try { const text = this.readFile(t, which); if (rest.length > 1) io.write(`${i ? '\n' : ''}==> ${t} <==\n`); io.write(pick(text)); }
      catch (e) { io.err(`${which}: cannot open '${t}' for reading: No such file or directory\n`); status = 1; }
    });
    return status;
  }
  const PAGE_LOADED = Date.now();

  /* ---------- the box on the page ---------- */
  const boxes = new Map();
  function termFor(name) {
    if (boxes.has(name)) return boxes.get(name);
    const box = $(`.term[data-term="${CSS.escape(name)}"]`);
    if (!box) return null;
    const screenEl = $('[data-term-screen]', box);
    const stateEl = $('[data-term-state]', box);
    const input = $('[data-term-input]', box);
    const promptEl = $('[data-term-prompt]', box);
    const form = $('[data-term-form]', box);
    const screen = {
      write(text, cls) {
        if (!text) return;
        const lines = text.split('\n');
        if (lines[lines.length - 1] === '') lines.pop();
        for (const l of lines) { const div = doc.createElement('div'); div.className = 'term-out' + (cls ? ' term-' + cls : ''); div.textContent = l; screenEl.appendChild(div); }
        screenEl.scrollTop = screenEl.scrollHeight;
      },
      cmd(prompt, command) {
        const div = doc.createElement('div'); div.className = 'term-cmd';
        const p = doc.createElement('span'); p.className = 'term-ps1'; p.textContent = prompt + ' ';
        const c = doc.createElement('span'); c.className = 'term-typed'; c.textContent = command;
        div.appendChild(p); div.appendChild(c); screenEl.appendChild(div); screenEl.scrollTop = screenEl.scrollHeight;
        return c;
      },
      clear() { screenEl.textContent = ''; },
    };
    const sh = new Shell(screen);
    const t = { name, box, sh, screen, screenEl, stateEl, input, promptEl, form, script: ($('[data-term-script]', box) || { content: { textContent: '' } }).content.textContent, running: false, histIdx: -1, ran: 0 };
    promptEl.textContent = sh.prompt();
    const run = (command) => {
      const line = command.trim();
      screen.cmd(sh.prompt(), command);
      if (line) { sh.history.push(line); sh.runLine(line); t.ran++; }
      promptEl.textContent = sh.prompt();
      t.histIdx = sh.history.length;
    };
    t.run = run;
    form.addEventListener('submit', (ev) => { ev.preventDefault(); if (t.running) return; const v = input.value; input.value = ''; run(v); if (!box.classList.contains('is-live')) { box.classList.add('is-live'); } stateEl.textContent = `${t.ran} command${t.ran === 1 ? '' : 's'} run`; });
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowUp') { ev.preventDefault(); if (t.histIdx > 0) { t.histIdx--; input.value = sh.history[t.histIdx]; } }
      else if (ev.key === 'ArrowDown') { ev.preventDefault(); if (t.histIdx < sh.history.length - 1) { t.histIdx++; input.value = sh.history[t.histIdx]; } else { t.histIdx = sh.history.length; input.value = ''; } }
      else if (ev.key === 'l' && ev.ctrlKey) { ev.preventDefault(); screen.clear(); }
      else if (ev.key === 'c' && ev.ctrlKey && !window.getSelection().toString()) { ev.preventDefault(); screen.cmd(sh.prompt(), input.value + '^C'); input.value = ''; }
      else if (ev.key === 'Tab') {
        ev.preventDefault();
        const v = input.value; const m = v.match(/(\S*)$/); const partial = m ? m[1] : '';
        const slash = partial.lastIndexOf('/');
        const dirPart = slash >= 0 ? partial.slice(0, slash + 1) : ''; const base = partial.slice(slash + 1);
        const dirAbs = sh.resolve(dirPart || '.');
        const first = v.trim().indexOf(' ') < 0;
        let cands = first ? Object.keys(CMDS).filter((c) => c.startsWith(base)) : sh.ls(dirAbs).filter((n) => n.name.startsWith(base) && (base.startsWith('.') || !n.name.startsWith('.'))).map((n) => n.name + (n.type === 'dir' ? '/' : ''));
        if (!cands.length) return;
        let common = cands[0];
        for (const c of cands) { let i = 0; while (i < common.length && common[i] === c[i]) i++; common = common.slice(0, i); }
        if (common.length > base.length) input.value = v.slice(0, v.length - base.length) + common + (cands.length === 1 && !common.endsWith('/') ? ' ' : '');
        else if (cands.length > 1) { screen.cmd(sh.prompt(), v); screen.write(cands.join('  ') + '\n'); }
      }
    });
    screenEl.addEventListener('click', () => { if (!window.getSelection().toString()) input.focus(); });
    boxes.set(name, t);
    return t;
  }

  async function replay(btn) {
    const name = btn.getAttribute('data-term');
    const t = termFor(name);
    if (!t || t.running) return;
    t.running = true;
    btn.classList.add('is-running');
    t.box.classList.remove('is-live', 'is-failed');
    t.sh.reset();
    resetHooks.forEach((fn) => fn(t.sh));
    t.screen.clear();
    t.ran = 0;
    t.stateEl.textContent = 'running…';
    t.input.value = '';
    const lines = t.script.split('\n');
    const delay = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));
    let errors = 0;
    for (const raw of lines) {
      const line = raw.replace(/\s+$/, '');
      if (!line.trim()) continue;
      if (line.trim().startsWith('#')) { t.screen.write(line, 'comment'); await delay(120); continue; }
      const el = t.screen.cmd(t.sh.prompt(), '');
      // typing effect: fast, capped so a long block still replays in a few seconds
      const step = Math.max(3, Math.min(14, Math.floor(480 / Math.max(1, line.length))));
      if (reduced) el.textContent = line;
      else for (let i = 1; i <= line.length; i++) { el.textContent = line.slice(0, i); await delay(step); }
      await delay(60);
      t.sh.history.push(line.trim());
      const status = t.sh.runLine(line);
      t.ran++;
      if (status === 127) errors++;
      t.promptEl.textContent = t.sh.prompt();
      await delay(110);
    }
    t.box.classList.add('is-live');
    t.stateEl.textContent = `${t.ran} command${t.ran === 1 ? '' : 's'} run${errors ? ` · ${errors} not found` : ''} · now type your own`;
    btn.classList.remove('is-running');
    t.running = false;
    t.histIdx = t.sh.history.length;
    t.input.focus({ preventScroll: true });
  }

  doc.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.run-btn[data-term]');
    if (btn) { ev.preventDefault(); replay(btn); }
  });
  $$('.term[data-term]').forEach((box) => termFor(box.getAttribute('data-term')));
  const resetHooks = [];
  window.__dtcTerm = { Shell, termFor, CMDS, ShErr, mkNode, HELP, MAN, onReset: (fn) => resetHooks.push(fn), fireReset: () => resetHooks.forEach((fn) => fn()) };
})();
