// Temporary, reproducible mitigation for GHSA-gcqx-w48m-w2h4 in Jest's dev dependency.
// No registry version currently contains the upstream fix. Never silently patch unknown code.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
let file;
try { file = require.resolve('deepmerge', {paths:[root]}); }
catch (error) { if (error.code === 'MODULE_NOT_FOUND') { console.log('deepmerge not installed (production-only install); no patch needed.'); process.exit(0); } throw error; }
if (!fs.realpathSync(file).startsWith(path.join(root, 'node_modules', 'deepmerge') + path.sep)) { console.log('deepmerge is not installed locally; no project dependency to patch.'); process.exit(0); }
const input = fs.readFileSync(file,'utf8');
const marker = '// Super Coder: prototype-safe destination writes (GHSA-gcqx-w48m-w2h4).';
if (input.startsWith(marker)) { console.log('deepmerge mitigation already applied.'); process.exit(0); }
const sha = crypto.createHash('sha256').update(input).digest('hex');
if (sha !== '2e5160f84a1141bd927264afe4d15766f1e6cf07daef182b37ff53fea121de7d') throw new Error('deepmerge changed: review GHSA-gcqx-w48m-w2h4 before updating/removing the pinned mitigation.');
let count = 0;
const output = input.replace(/destination\[key\] = ([^;\n]+);/g, (_, value) => {
  count++;
  return `Object.defineProperty(destination, key, {value: ${value}, enumerable: true, configurable: true, writable: true});`;
});
if (count !== 3) throw new Error('deepmerge patch did not match its three destination writes.');
fs.writeFileSync(file,marker+'\n'+output);
console.log('Applied prototype-safe deepmerge destination writes.');
