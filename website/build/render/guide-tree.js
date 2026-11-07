// The Ultimate Guide's source order is preserved; chapter boundaries organize its headings.
const { escapeHtml, icon } = require('./components');

const CHAPTERS = [
  ['Start here', 'The destruction of imposter syndrome...'],
  ['Web foundations', 'HTML'],
  ['Application architecture', 'CRUD'],
  ['Networking', 'Client-Server Model'],
  ['Storage & performance', 'Databse'],
  ['Traffic & routing', 'Proxy'],
  ['Hashing & data systems', 'Hashing'],
  ['Design patterns', 'Design Systems'],
  ['JavaScript interviews', 'JavaScript Questions You Should Be Able To Answer'],
  ['System design walkthroughs', 'Build Twitter'],
];

function guideTree(headings) {
  const groups = [];
  let group;
  let topic;
  for (const h of headings.filter(h => h.level === 2 || h.level === 3)) {
    const chapter = h.level === 2 && CHAPTERS.find(([, start]) => start === h.text);
    if (chapter) { group = { title: chapter[0], topics: [] }; groups.push(group); }
    if (!group) throw new Error(`Guide outline has no chapter for ${h.text}`);
    if (h.level === 2) {
      topic = { ...h, children: [] };
      group.topics.push(topic);
    } else {
      if (!topic) throw new Error(`Guide outline has no parent for ${h.text}`);
      topic.children.push(h);
    }
  }
  if (groups.length !== CHAPTERS.length) throw new Error('Guide outline is missing a chapter boundary');
  const link = h => `<a href="#${escapeHtml(h.id)}">${escapeHtml(h.text)}</a>`;
  const items = groups.map((g, i) => `<li class="tree-group${i === 0 ? ' open' : ''}"><button type="button" aria-expanded="${i === 0}">${icon('chevron')}<span>${escapeHtml(g.title)}</span><span class="count">${g.topics.length}</span></button><ul class="guide-topics">${g.topics.map(h => `<li>${link(h)}${h.children.length ? `<ul class="guide-subtopics">${h.children.map(child => `<li>${link(child)}</li>`).join('')}</ul>` : ''}</li>`).join('')}</ul></li>`).join('');
  return `<p class="tree-title"><a href="/mindset/">Mindset</a><span>GUIDE</span></p><ul class="tree guide-tree" id="tree">${items}</ul><p class="guide-next"><a href="/mindset/grit/">Grit: The Long Return ${icon('arrow-right')}</a></p>`;
}

module.exports = { guideTree };
