// The path from content/path/path.json, joined to the registry. Week count and session count live in that file.
// A session is "written" when content/path/sessions/<slug>.md exists AND the registry lists its URL;
// one without the other is a build error (the sitemap is the contract, the file is the content).
const fs = require('fs');
const path = require('path');
const S = require('./sources.config');
const { parseFrontmatter } = require('./parsers/markdown');

const PATH_DIR = path.join(S.CONTENT, 'path');
const SESSIONS_DIR = path.join(PATH_DIR, 'sessions');
const DAY_NAME = { Tue: 'Tuesday', Wed: 'Wednesday', Sat: 'Saturday' };

function loadPath(reg) {
  const data = JSON.parse(fs.readFileSync(path.join(PATH_DIR, 'path.json'), 'utf8'));
  const diagrams = JSON.parse(fs.readFileSync(path.join(PATH_DIR, 'diagrams.json'), 'utf8'));
  const actOf = (unit) => data.acts.find((a) => a.units.includes(unit));
  const unitOf = (n) => data.units.find((u) => u.n === n);

  const sessions = data.sessions.map((s) => {
    const url = `/path/${s.slug}/`;
    const file = path.join(SESSIONS_DIR, `${s.slug}.md`);
    const hasFile = fs.existsSync(file);
    const page = reg.byUrl[url] || null;
    if (hasFile && !page) throw new Error(`path: ${s.slug}.md exists but ${url} is not in SITEMAP-AND-USER-STORIES.md`);
    if (page && !hasFile) throw new Error(`path: ${url} is in the sitemap but content/path/sessions/${s.slug}.md is missing`);
    // Home and path index render before session pages. Load their display metadata now,
    // so cards never depend on another page renderer mutating the shared session object.
    const meta = hasFile ? parseFrontmatter(fs.readFileSync(file, 'utf8')).data : {};
    if (hasFile && (!Number.isFinite(Number(meta.read)) || Number(meta.read) <= 0 || !Array.isArray(meta.diagrams) || !meta.hook)) {
      throw new Error(`path: ${s.slug} needs a positive read time, diagrams[] and hook`);
    }
    const act = actOf(s.unit);
    return {
      ...s,
      url,
      file,
      page,
      written: hasFile && !!page,
      read: hasFile ? Number(meta.read) : undefined,
      hook: meta.hook || s.hook,
      diagramCount: hasFile ? meta.diagrams.length : 0,
      dayName: DAY_NAME[s.day] || s.day,
      unitInfo: unitOf(s.unit),
      act,
      color: act.color,
      sideQuestPages: (s.sideQuests || []).map((id) => {
        const p = reg.byId[id];
        if (!p) throw new Error(`path: session ${s.id} names side quest ${id}, which is not a registry page`);
        return p;
      }),
    };
  });
  const ids = new Set(sessions.map((s) => s.id));
  if (ids.size !== sessions.length) throw new Error('path.json has duplicate session ids');
  const weeksNeeded = Math.ceil(sessions.length / data.schedule.length);
  if (data.weeks !== weeksNeeded) throw new Error(`path.json weeks is ${data.weeks}, ${sessions.length} sessions on a ${data.schedule.length}-day week need ${weeksNeeded}`);
  sessions.forEach((s, i) => {
    const week = Math.floor(i / data.schedule.length) + 1;
    const day = data.schedule[i % data.schedule.length];
    if (s.week !== week || s.day !== day) throw new Error(`session ${s.id} is week ${s.week} ${s.day}; index ${i} is week ${week} ${day}`);
  });

  const weeks = Array.from({ length: data.weeks }, (_, i) => i + 1).map((n) => {
    const list = sessions.filter((s) => s.week === n);
    const expected = n < data.weeks ? data.schedule.length : sessions.length - (data.weeks - 1) * data.schedule.length;
    if (list.length !== expected) throw new Error(`path.json: week ${n} has ${list.length} sessions, expected ${expected}`);
    const units = [...new Set(list.map((s) => s.unit))];
    return { n, sessions: list, units, unitInfos: units.map(unitOf), act: actOf(list[0].unit), acts: [...new Set(list.map((s) => s.act.id))] };
  });

  const written = sessions.filter((s) => s.written);
  const latest = written.length ? written[written.length - 1] : null;
  // Every T-SESSION row in the registry must be a session in path.json.
  for (const p of reg.pages.filter((x) => x.template === 'T-SESSION')) {
    if (!sessions.some((s) => s.url === p.url)) throw new Error(`path: ${p.url} is T-SESSION but not in path.json`);
  }

  // Back-links: library page id → the written sessions that list it as a side quest.
  const backlinks = {};
  for (const s of written) for (const p of s.sideQuestPages) (backlinks[p.id] = backlinks[p.id] || []).push(s);

  const byId = Object.fromEntries(sessions.map((s) => [s.id, s]));
  const bySlug = Object.fromEntries(sessions.map((s) => [s.slug, s]));
  const prevWritten = (s) => { const i = written.indexOf(s); return i > 0 ? written[i - 1] : null; };
  const nextWritten = (s) => { const i = written.indexOf(s); return i >= 0 && i < written.length - 1 ? written[i + 1] : null; };
  const neighbours = (s) => { const i = sessions.indexOf(s); return { before: i > 0 ? sessions[i - 1] : null, after: i < sessions.length - 1 ? sessions[i + 1] : null }; };

  return { ...data, sessions, weeks, written, latest, backlinks, byId, bySlug, diagrams, prevWritten, nextWritten, neighbours, actOf, unitOf, SESSIONS_DIR };
}

module.exports = { loadPath, PATH_DIR, SESSIONS_DIR, DAY_NAME };
