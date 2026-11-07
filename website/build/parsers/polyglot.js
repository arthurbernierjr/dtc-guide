// Polyglot language guides (content/source/polyglot/*) + overrides + the language switcher map.
const fs = require('fs');
const path = require('path');
const S = require('../sources.config');
const { parseFrontmatter } = require('./markdown');

const LANGS = [
  { code: 'javascript', name: 'JavaScript', short: 'JS', fw: null },
  { code: 'python', name: 'Python', short: 'PY', fw: 'Django', docs: ['https://docs.python.org/3/', 'https://docs.djangoproject.com/en/stable/', 'https://www.django-rest-framework.org/'] },
  { code: 'ruby', name: 'Ruby', short: 'RB', fw: 'Rails', docs: ['https://docs.ruby-lang.org/en/master/', 'https://guides.rubyonrails.org/'] },
  { code: 'go', name: 'Go', short: 'GO', fw: 'chi', docs: ['https://go.dev/doc/', 'https://github.com/go-chi/chi', 'https://github.com/jackc/pgx'] },
  { code: 'java', name: 'Java', short: 'JV', fw: 'Spring Boot', docs: ['https://docs.oracle.com/en/java/', 'https://docs.spring.io/spring-boot/'] },
  { code: 'cs', name: 'C#', short: 'C#', fw: 'ASP.NET Core / Entity Framework Core', docs: ['https://learn.microsoft.com/dotnet/', 'https://learn.microsoft.com/aspnet/core/', 'https://learn.microsoft.com/ef/core/'] },
  { code: 'php', name: 'PHP', short: 'PHP', fw: 'Laravel', docs: ['https://www.php.net/manual/en/', 'https://laravel.com/docs'] },
  { code: 'rust', name: 'Rust', short: 'RS', fw: 'Axum', docs: ['https://doc.rust-lang.org/book/', 'https://docs.rs/axum/latest/axum/', 'https://github.com/launchbadge/sqlx'] },
  { code: 'dart', name: 'Dart', short: 'DT', fw: 'shelf', docs: ['https://dart.dev/guides', 'https://pub.dev/packages/shelf'] },
];
const SUBPAGES = ['intro', 'oop', 'routing', 'models', 'api'];
const FRONTEND = [
  { code: 'react', name: 'React', short: 'RE', docs: ['https://react.dev/', 'https://reactrouter.com/'] },
  { code: 'vue', name: 'Vue', short: 'VU', docs: ['https://vuejs.org/', 'https://router.vuejs.org/'] },
  { code: 'angular', name: 'Angular', short: 'NG', docs: ['https://angular.dev/'] },
  { code: 'svelte', name: 'Svelte', short: 'SV', docs: ['https://svelte.dev/docs'] },
  { code: 'react-cheatsheet', name: 'Cheatsheet', short: 'RC', docs: ['https://react.dev/', 'https://reactrouter.com/'] },
];

function readIf(p) { return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null; }

/** Load a page body with override precedence. Returns {md, frontmatter, override:boolean, sourcePath, overridePath} */
function loadWithOverride(sourceAbs, overrideRel) {
  const overridePath = path.join(S.OVERRIDES, overrideRel);
  const ov = readIf(overridePath);
  if (ov !== null) {
    const { data, body } = parseFrontmatter(ov);
    return { md: body, frontmatter: data, override: true, sourcePath: sourceAbs, overridePath };
  }
  const src = readIf(sourceAbs);
  if (src === null) throw new Error('Missing source ' + sourceAbs);
  const { data, body } = parseFrontmatter(src);
  return { md: body, frontmatter: data, override: false, sourcePath: sourceAbs, overridePath: null };
}

function loadLanguagePage(code, sub) {
  return loadWithOverride(path.join(S.POLYGLOT, code, sub + '.md'), path.join('languages', code, sub + '.md'));
}

const CHALLENGE_BY_TEXT = [
  { re: /fizz/i, name: 'fizzbuzz', title: 'FizzBuzz' },
  { re: /anagram/i, name: 'anagrams', title: 'Anagrams' },
  { re: /capitalize/i, name: 'capitalize', title: 'Capitalize' },
  { re: /chunk/i, name: 'chunk', title: 'Array chunking' },
  { re: /palindrome/i, name: 'palindrome', title: 'Palindrome' },
];

/** Parse a language index.md: the "Data Structures To Attempt" list and the challenge prompts. */
function parseLanguageIndex(code) {
  const raw = readIf(path.join(S.POLYGLOT, code, 'index.md'));
  const { data, body } = parseFrontmatter(raw);
  const dsMatch = body.match(/## Data Structures To Attempt\n([\s\S]*?)(?=\n## |$)/);
  const dataStructures = dsMatch ? dsMatch[1].split('\n').filter((l) => /^- /.test(l)).map((l) => l.replace(/^- /, '').trim()) : [];
  const chalMatch = body.match(/## Algo Challenges to Attempt\n([\s\S]*)$/);
  const blocks = chalMatch ? Array.from(chalMatch[1].matchAll(/```js\n([\s\S]*?)```/g)).map((m) => m[1].trim()) : [];
  const challenges = blocks.map((b) => {
    const hit = CHALLENGE_BY_TEXT.find((c) => c.re.test(b));
    return { code: b, name: hit ? hit.name : null, title: hit ? hit.title : 'Challenge' };
  });
  return { frontmatter: data, dataStructures, challenges };
}

module.exports = { LANGS, SUBPAGES, FRONTEND, loadWithOverride, loadLanguagePage, parseLanguageIndex };

if (require.main === module) {
  for (const l of LANGS.slice(1)) {
    const idx = parseLanguageIndex(l.code);
    console.log(l.code, idx.dataStructures.length, idx.challenges.map((c) => c.name).join(','));
  }
}
