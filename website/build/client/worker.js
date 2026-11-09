/* It's Deeper Than Code — run worker.
   Executes a prep file (or the naive/optimal pairs) inside a Web Worker with just enough of
   Node shimmed for the files the build marked `worker`: require('node:assert/strict'),
   node:util, node:events, node:url; module/exports; a console that streams back to the page.
   Message in:  { id, src }            fetch src and run it
   Messages out: { id, type:'log'|'error'|'done', text, level, ms } */
'use strict';

/* ---------- deep equality (strict semantics, close to Node's isDeepStrictEqual) ---------- */
function isDeepStrictEqual(a, b, seen) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  seen = seen || new Map();
  if (seen.get(a) === b) return true;
  seen.set(a, b);
  if (a instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof RegExp) return a.source === b.source && a.flags === b.flags;
  if (a instanceof Error) return a.name === b.name && a.message === b.message;
  if (ArrayBuffer.isView(a)) { if (a.length !== b.length) return false; for (let i = 0; i < a.length; i++) if (!Object.is(a[i], b[i])) return false; return true; }
  if (a instanceof Map) { if (a.size !== b.size) return false; for (const [k, v] of a) { if (!b.has(k) || !isDeepStrictEqual(v, b.get(k), seen)) return false; } return true; }
  if (a instanceof Set) {
    if (a.size !== b.size) return false;
    outer: for (const v of a) { if (b.has(v)) continue; for (const w of b) if (isDeepStrictEqual(v, w, seen)) continue outer; return false; }
    return true;
  }
  if (Array.isArray(a)) { if (a.length !== b.length) return false; for (let i = 0; i < a.length; i++) if (!isDeepStrictEqual(a[i], b[i], seen)) return false; return true; }
  const ka = Reflect.ownKeys(a).filter((k) => Object.prototype.propertyIsEnumerable.call(a, k));
  const kb = Reflect.ownKeys(b).filter((k) => Object.prototype.propertyIsEnumerable.call(b, k));
  if (ka.length !== kb.length) return false;
  for (const k of ka) { if (!Object.prototype.propertyIsEnumerable.call(b, k) || !isDeepStrictEqual(a[k], b[k], seen)) return false; }
  return true;
}

/* ---------- inspect / format ---------- */
function inspect(v, depth, seen) {
  depth = depth === undefined ? 3 : depth; seen = seen || new Set();
  const t = typeof v;
  if (v === null) return 'null';
  if (t === 'undefined') return 'undefined';
  if (t === 'string') return JSON.stringify(v).replace(/^"|"$/g, "'");
  if (t === 'number') return Object.is(v, -0) ? '-0' : String(v);
  if (t === 'boolean') return String(v);
  if (t === 'bigint') return v + 'n';
  if (t === 'symbol') return v.toString();
  if (t === 'function') return `[${v.constructor && v.constructor.name === 'AsyncFunction' ? 'AsyncFunction' : 'Function'}${v.name ? ': ' + v.name : ' (anonymous)'}]`;
  if (v instanceof Error) return v.stack || `${v.name}: ${v.message}`;
  if (v instanceof Date) return isNaN(v) ? 'Invalid Date' : v.toISOString();
  if (v instanceof RegExp) return v.toString();
  if (v instanceof Promise) return 'Promise { <pending> }';
  if (seen.has(v)) return '[Circular]';
  if (depth < 0) return Array.isArray(v) ? '[Array]' : '[Object]';
  seen.add(v);
  const next = (x) => inspect(x, depth - 1, seen);
  let out;
  if (Array.isArray(v)) { const items = v.slice(0, 100).map(next); if (v.length > 100) items.push(`... ${v.length - 100} more items`); out = items.length ? `[ ${items.join(', ')} ]` : '[]'; }
  else if (v instanceof Map) { const items = []; for (const [k, x] of v) { if (items.length >= 100) { items.push('...'); break; } items.push(`${next(k)} => ${next(x)}`); } out = `Map(${v.size}) {${items.length ? ' ' + items.join(', ') + ' ' : ''}}`; }
  else if (v instanceof Set) { const items = []; for (const x of v) { if (items.length >= 100) { items.push('...'); break; } items.push(next(x)); } out = `Set(${v.size}) {${items.length ? ' ' + items.join(', ') + ' ' : ''}}`; }
  else if (ArrayBuffer.isView(v)) { out = `${v.constructor.name}(${v.length}) [ ${Array.from(v.slice(0, 50)).join(', ')}${v.length > 50 ? ', ...' : ''} ]`; }
  else {
    const keys = Object.keys(v);
    const items = keys.slice(0, 100).map((k) => `${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${next(v[k])}`);
    if (keys.length > 100) items.push(`... ${keys.length - 100} more properties`);
    const name = v.constructor && v.constructor !== Object && v.constructor.name ? v.constructor.name + ' ' : '';
    out = items.length ? `${name}{ ${items.join(', ')} }` : `${name}{}`;
  }
  seen.delete(v);
  return out;
}
function format() {
  const args = Array.prototype.slice.call(arguments);
  if (typeof args[0] !== 'string') return args.map((a) => (typeof a === 'string' ? a : inspect(a))).join(' ');
  let i = 1;
  let s = args[0].replace(/%[sdifjoO%]/g, (m) => {
    if (m === '%%') return '%';
    if (i >= args.length) return m;
    const a = args[i++];
    switch (m) {
      case '%s': return typeof a === 'string' ? a : inspect(a);
      case '%d': case '%i': return typeof a === 'bigint' ? a + 'n' : String(m === '%i' ? parseInt(a, 10) : Number(a));
      case '%f': return String(parseFloat(a));
      case '%j': try { return JSON.stringify(a); } catch (e) { return '[Circular]'; }
      default: return inspect(a);
    }
  });
  for (; i < args.length; i++) s += ' ' + (typeof args[i] === 'string' ? args[i] : inspect(args[i]));
  return s;
}

/* ---------- assert (strict) ---------- */
class AssertionError extends Error {
  constructor(o) {
    super(o.message || `${inspect(o.actual)} ${o.operator} ${inspect(o.expected)}`);
    this.name = 'AssertionError'; this.code = 'ERR_ASSERTION';
    this.actual = o.actual; this.expected = o.expected; this.operator = o.operator;
    this.generatedMessage = !o.message;
  }
}
function fail(actual, expected, message, operator, defaultMsg) {
  if (message instanceof Error) throw message;
  throw new AssertionError({ actual, expected, operator, message: message || defaultMsg });
}
function matchesExpected(err, expected, message) {
  if (expected === undefined) return;
  if (typeof expected === 'function') {
    if (expected.prototype !== undefined && err instanceof expected) return;
    if (Error.isPrototypeOf(expected)) fail(err, expected, message, 'throws', `The error is expected to be an instance of "${expected.name}". Received "${err && err.constructor && err.constructor.name}"`);
    if (expected.call({}, err) === true) return;
    fail(err, expected, message, 'throws', 'The validation function is expected to return "true". Received false');
  }
  if (expected instanceof RegExp) { if (expected.test(String(err && err.message !== undefined ? err.message : err)) || expected.test(String(err))) return; fail(err, expected, message, 'throws', `The input did not match the regular expression ${expected}. Input:\n\n${inspect(String(err))}\n`); }
  if (typeof expected === 'object' && expected !== null) {
    for (const k of Object.keys(expected)) {
      const want = expected[k]; const got = err ? err[k] : undefined;
      const ok = want instanceof RegExp && typeof got === 'string' ? want.test(got) : isDeepStrictEqual(got, want);
      if (!ok) fail(err, expected, message, 'throws', `Expected values to be strictly deep-equal:\n+ actual - expected\n\n  ${k}: ${inspect(got)} vs ${inspect(want)}`);
    }
  }
}
function makeAssert() {
  const assert = function ok(value, message) { if (!value) fail(value, true, message, '==', 'The expression evaluated to a falsy value'); };
  assert.ok = assert;
  assert.AssertionError = AssertionError;
  assert.fail = function (message) { if (message instanceof Error) throw message; throw new AssertionError({ message: message || 'Failed', operator: 'fail' }); };
  assert.equal = assert.strictEqual = function (a, e, m) { if (!Object.is(a, e)) fail(a, e, m, 'strictEqual', `Expected values to be strictly equal:\n\n${inspect(a)} !== ${inspect(e)}\n`); };
  assert.notEqual = assert.notStrictEqual = function (a, e, m) { if (Object.is(a, e)) fail(a, e, m, 'notStrictEqual', `Expected "actual" to be strictly unequal to: ${inspect(e)}`); };
  assert.deepEqual = assert.deepStrictEqual = function (a, e, m) { if (!isDeepStrictEqual(a, e)) fail(a, e, m, 'deepStrictEqual', `Expected values to be strictly deep-equal:\n+ actual - expected\n\n+ ${inspect(a)}\n- ${inspect(e)}`); };
  assert.notDeepEqual = assert.notDeepStrictEqual = function (a, e, m) { if (isDeepStrictEqual(a, e)) fail(a, e, m, 'notDeepStrictEqual', `Expected "actual" not to be strictly deep-equal to: ${inspect(e)}`); };
  assert.throws = function (fn, expected, message) {
    if (typeof expected === 'string') { message = expected; expected = undefined; }
    let threw = false, err;
    try { fn(); } catch (e) { threw = true; err = e; }
    if (!threw) fail(undefined, expected, message, 'throws', 'Missing expected exception' + (message ? `: ${message}` : '.'));
    matchesExpected(err, expected, message);
  };
  assert.doesNotThrow = function (fn, expected, message) { if (typeof expected === 'string') { message = expected; } try { fn(); } catch (e) { fail(e, undefined, message, 'doesNotThrow', `Got unwanted exception.\nActual message: "${e && e.message}"`); } };
  assert.rejects = async function (p, expected, message) {
    if (typeof expected === 'string') { message = expected; expected = undefined; }
    let threw = false, err;
    try { await (typeof p === 'function' ? p() : p); } catch (e) { threw = true; err = e; }
    if (!threw) fail(undefined, expected, message, 'rejects', 'Missing expected rejection' + (message ? `: ${message}` : '.'));
    matchesExpected(err, expected, message);
  };
  assert.doesNotReject = async function (p, expected, message) { if (typeof expected === 'string') { message = expected; } try { await (typeof p === 'function' ? p() : p); } catch (e) { fail(e, undefined, message, 'doesNotReject', `Got unwanted rejection.\nActual message: "${e && e.message}"`); } };
  assert.match = function (s, re, m) { if (typeof s !== 'string' || !re.test(s)) fail(s, re, m, 'match', `The input did not match the regular expression ${re}. Input:\n\n${inspect(s)}\n`); };
  assert.doesNotMatch = function (s, re, m) { if (typeof s === 'string' && re.test(s)) fail(s, re, m, 'doesNotMatch', `The input was expected to not match the regular expression ${re}. Input:\n\n${inspect(s)}\n`); };
  assert.ifError = function (v) { if (v !== null && v !== undefined) { if (v instanceof Error) throw v; throw new AssertionError({ actual: v, expected: null, operator: 'ifError', message: `ifError got unwanted exception: ${inspect(v)}` }); } };
  assert.strict = assert;
  return assert;
}

/* ---------- events ---------- */
class EventEmitter {
  constructor() { this._events = new Map(); this._max = 10; }
  on(n, f) { return this.addListener(n, f); }
  addListener(n, f) { if (!this._events.has(n)) this._events.set(n, []); this._events.get(n).push(f); return this; }
  prependListener(n, f) { if (!this._events.has(n)) this._events.set(n, []); this._events.get(n).unshift(f); return this; }
  once(n, f) { const w = (...a) => { this.off(n, w); f.apply(this, a); }; w.listener = f; return this.on(n, w); }
  prependOnceListener(n, f) { const w = (...a) => { this.off(n, w); f.apply(this, a); }; w.listener = f; return this.prependListener(n, w); }
  off(n, f) { return this.removeListener(n, f); }
  removeListener(n, f) { const l = this._events.get(n); if (!l) return this; const i = l.findIndex((x) => x === f || x.listener === f); if (i >= 0) l.splice(i, 1); if (!l.length) this._events.delete(n); return this; }
  removeAllListeners(n) { if (n === undefined) this._events.clear(); else this._events.delete(n); return this; }
  emit(n, ...a) {
    const l = this._events.get(n);
    if (!l || !l.length) { if (n === 'error') { const e = a[0] instanceof Error ? a[0] : new Error(`Unhandled error. (${inspect(a[0])})`); throw e; } return false; }
    for (const f of l.slice()) f.apply(this, a);
    return true;
  }
  listenerCount(n) { const l = this._events.get(n); return l ? l.length : 0; }
  listeners(n) { return (this._events.get(n) || []).map((f) => f.listener || f); }
  rawListeners(n) { return (this._events.get(n) || []).slice(); }
  eventNames() { return Array.from(this._events.keys()); }
  setMaxListeners(n) { this._max = n; return this; }
  getMaxListeners() { return this._max; }
  static once(em, n) { return new Promise((res, rej) => { em.once(n, (...a) => res(a)); if (n !== 'error') em.once('error', rej); }); }
}
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.defaultMaxListeners = 10;

/* ---------- util ---------- */
function makeUtil() {
  const util = {
    inspect, format, isDeepStrictEqual,
    promisify(fn) { return function (...a) { return new Promise((res, rej) => fn.call(this, ...a, (err, ...v) => (err ? rej(err) : res(v.length > 1 ? v : v[0])))); }; },
    callbackify(fn) { return function (...a) { const cb = a.pop(); fn.apply(this, a).then((v) => cb(null, v), (e) => cb(e)); }; },
    inherits(ctor, superCtor) { Object.setPrototypeOf(ctor.prototype, superCtor.prototype); ctor.super_ = superCtor; },
    deprecate(fn) { return fn; },
    types: { isPromise: (v) => v instanceof Promise, isDate: (v) => v instanceof Date, isRegExp: (v) => v instanceof RegExp, isMap: (v) => v instanceof Map, isSet: (v) => v instanceof Set, isTypedArray: (v) => ArrayBuffer.isView(v) && !(v instanceof DataView) },
    TextEncoder: self.TextEncoder, TextDecoder: self.TextDecoder,
    isArray: Array.isArray,
  };
  util.inspect.custom = Symbol.for('nodejs.util.inspect.custom');
  util.inspect.defaultOptions = { depth: 2 };
  return util;
}

/* ---------- url ---------- */
const urlShim = {
  URL: self.URL, URLSearchParams: self.URLSearchParams,
  fileURLToPath(u) { const s = typeof u === 'string' ? u : u.href; return decodeURIComponent(s.replace(/^file:\/\//, '')); },
  pathToFileURL(p) { return new URL('file://' + encodeURI(p)); },
  parse(s) { const u = new URL(s, 'http://localhost'); return { protocol: u.protocol, host: u.host, hostname: u.hostname, port: u.port, pathname: u.pathname, search: u.search, hash: u.hash, query: Object.fromEntries(u.searchParams), href: u.href, path: u.pathname + u.search }; },
  format(o) { return typeof o === 'string' ? o : (o.href || `${o.protocol || 'http:'}//${o.host || o.hostname || ''}${o.pathname || ''}${o.search || ''}${o.hash || ''}`); },
};

/* ---------- runner ---------- */
const SHIMS = {
  'node:assert/strict': makeAssert, 'assert/strict': makeAssert, 'node:assert': makeAssert, assert: makeAssert,
  'node:util': makeUtil, util: makeUtil,
  'node:events': () => EventEmitter, events: () => EventEmitter,
  'node:url': () => urlShim, url: () => urlShim,
};

let currentId = null;
let asyncFailed = false;
const describe = (e) => (e instanceof Error ? (e.name === 'AssertionError' ? `AssertionError [ERR_ASSERTION]: ${e.message}` : (e.stack || `${e.name}: ${e.message}`)) : String(e));
if (self.addEventListener) {
  self.addEventListener('error', (ev) => { asyncFailed = true; self.postMessage({ id: currentId, type: 'log', text: describe(ev.error || ev.message), level: 'err' }); if (ev.preventDefault) ev.preventDefault(); });
  self.addEventListener('unhandledrejection', (ev) => { asyncFailed = true; self.postMessage({ id: currentId, type: 'log', text: 'Unhandled rejection: ' + describe(ev.reason), level: 'err' }); if (ev.preventDefault) ev.preventDefault(); });
}

self.onmessage = async (ev) => {
  const { id, src, code: sourceCode } = ev.data;
  currentId = id; asyncFailed = false;
  const t0 = performance.now();
  const post = (type, text, level) => self.postMessage({ id, type, text, level, ms: Math.round(performance.now() - t0) });
  const counts = new Map(); const clocks = new Map(); let groupDepth = 0;
  const pad = () => '  '.repeat(groupDepth);
  const con = {
    log: (...a) => post('log', pad() + format(...a), 'log'),
    info: (...a) => post('log', pad() + format(...a), 'log'),
    debug: (...a) => post('log', pad() + format(...a), 'dim'),
    warn: (...a) => post('log', pad() + format(...a), 'warn'),
    error: (...a) => post('log', pad() + format(...a), 'err'),
    dir: (v) => post('log', pad() + inspect(v), 'log'),
    table: (v) => post('log', pad() + inspect(v), 'log'),
    trace: (...a) => post('log', pad() + 'Trace: ' + format(...a), 'dim'),
    assert: (c, ...a) => { if (!c) post('log', pad() + 'Assertion failed' + (a.length ? ': ' + format(...a) : ''), 'err'); },
    count: (l = 'default') => { counts.set(l, (counts.get(l) || 0) + 1); post('log', pad() + `${l}: ${counts.get(l)}`, 'log'); },
    countReset: (l = 'default') => counts.set(l, 0),
    group: (...a) => { if (a.length) post('log', pad() + format(...a), 'log'); groupDepth++; },
    groupCollapsed: (...a) => { if (a.length) post('log', pad() + format(...a), 'log'); groupDepth++; },
    groupEnd: () => { groupDepth = Math.max(0, groupDepth - 1); },
    time: (l = 'default') => clocks.set(l, performance.now()),
    timeEnd: (l = 'default') => { const s = clocks.get(l); if (s !== undefined) { post('log', pad() + `${l}: ${(performance.now() - s).toFixed(3)}ms`, 'dim'); clocks.delete(l); } },
    timeLog: (l = 'default', ...a) => { const s = clocks.get(l); if (s !== undefined) post('log', pad() + `${l}: ${(performance.now() - s).toFixed(3)}ms${a.length ? ' ' + format(...a) : ''}`, 'dim'); },
  };
  // process.nextTick runs before promise jobs in Node. A microtask queued *before* the file's
  // synchronous phase starts is first in line once that phase ends, so flushing ticks from it
  // reproduces Node's order (sync → nextTick → microtask → timers) for the usual demos.
  const ticks = []; let flushQueued = false;
  const flushTicks = () => { flushQueued = false; while (ticks.length) { const [f, a] = ticks.shift(); f(...a); } };
  const processShim = {
    env: {}, argv: ['node', src], platform: 'browser', version: 'v24.0.0-worker', versions: { node: '24.0.0' }, exitCode: 0,
    exit(code) { throw Object.assign(new Error(`process.exit(${code || 0})`), { __exit: code || 0 }); },
    hrtime: Object.assign((prev) => { const ms = performance.now(); const s = Math.floor(ms / 1000); const ns = Math.round((ms % 1000) * 1e6); return prev ? [s - prev[0], ns - prev[1]] : [s, ns]; }, { bigint: () => BigInt(Math.round(performance.now() * 1e6)) }),
    memoryUsage: () => ({ rss: 0, heapTotal: 0, heapUsed: 0, external: 0 }),
    nextTick: (f, ...a) => { ticks.push([f, a]); if (!flushQueued) { flushQueued = true; queueMicrotask(flushTicks); } },
    on() { return this; }, once() { return this; }, off() { return this; },
    stdout: { write: (s) => { post('log', String(s).replace(/\n$/, ''), 'log'); return true; }, isTTY: false, columns: 80 },
    stderr: { write: (s) => { post('log', String(s).replace(/\n$/, ''), 'err'); return true; }, isTTY: false },
    cwd: () => '/',
  };
  // Timers are wrapped so the runner can wait for work the file schedules after its last
  // statement (Node keeps the process alive for pending timers; a worker must do it by hand).
  let pending = 0;
  const live = new Set();
  const realSetTimeout = self.setTimeout.bind(self), realClearTimeout = self.clearTimeout.bind(self);
  const realSetInterval = self.setInterval.bind(self), realClearInterval = self.clearInterval.bind(self);
  const timers = {
    setTimeout(fn, ms, ...a) { pending++; const h = realSetTimeout(() => { pending--; live.delete(h); fn(...a); }, ms); live.add(h); return h; },
    clearTimeout(h) { if (live.has(h)) { pending--; live.delete(h); } realClearTimeout(h); },
    setInterval(fn, ms, ...a) { pending++; const h = realSetInterval(fn, ms, ...a); live.add(h); return h; },
    clearInterval(h) { if (live.has(h)) { pending--; live.delete(h); } realClearInterval(h); },
    setImmediate(fn, ...a) { return timers.setTimeout(fn, 0, ...a); },
    clearImmediate(h) { timers.clearTimeout(h); },
  };
  // Done when two consecutive ticks pass with no timer pending: un-awaited async IIFEs hop
  // between microtask awaits (invisible to us) and timers (counted), so a single idle check
  // can land in a gap. 10 s hard cap.
  const drain = async () => {
    const start = performance.now();
    let idle = 0;
    while (idle < 2 && performance.now() - start < 10000) {
      await new Promise((r) => realSetTimeout(r, 5));
      idle = pending === 0 ? idle + 1 : 0;
    }
    for (const h of live) { realClearTimeout(h); realClearInterval(h); }
    return pending > 0;
  };
  const cache = new Map();
  const req = (name) => {
    if (cache.has(name)) return cache.get(name);
    const make = Object.hasOwn(SHIMS, name) ? SHIMS[name] : null;
    if (!make) throw new Error(`Cannot find module '${name}' in the browser runner. Copy the node command instead.`);
    const mod = make(); cache.set(name, mod); return mod;
  };
  try {
    if (typeof sourceCode !== 'string' || sourceCode.length > 500000) throw new Error('Invalid example source.');
    let code = sourceCode;
    // Lines the author kept commented out for the browser are left as-is; shebang is dropped.
    code = code.replace(/^#!.*\n/, '');
    const module = { exports: {} };
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const fn = new AsyncFunction('require', 'module', 'exports', 'console', 'process', '__filename', '__dirname', 'global',
      'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'setImmediate', 'clearImmediate', code + '\n');
    flushQueued = true; queueMicrotask(flushTicks);
    await fn(req, module, module.exports, con, processShim, src, src.replace(/\/[^/]*$/, ''), self,
      timers.setTimeout, timers.clearTimeout, timers.setInterval, timers.clearInterval, timers.setImmediate, timers.clearImmediate);
    const stillPending = await drain();
    if (stillPending) post('log', '[runner] stopped after 10s with timers still pending (an interval was never cleared)', 'dim');
    if (asyncFailed) post('error', 'An error was thrown from a timer or an unawaited promise (see above).', 'err');
    else if (processShim.exitCode) post('error', `process.exitCode = ${processShim.exitCode}`, 'err');
    else post('done', 'ok', 'ok');
  } catch (e) {
    if (e && e.__exit !== undefined) { post('done', e.__exit === 0 ? 'ok' : `exit ${e.__exit}`, e.__exit === 0 ? 'ok' : 'err'); return; }
    post('error', describe(e).split('\n').filter((l) => !/worker\.js|AsyncFunction|^\s+at (?:async )?(?:self\.onmessage|eval)/.test(l)).join('\n'), 'err');
  }
};
