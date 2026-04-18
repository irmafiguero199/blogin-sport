const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

// Collect all internal links per page
const linkMap = {}; // page -> [links it points to]
const incomingMap = {}; // page -> [pages that link to it]
const allTitles = {};

for (const file of files) {
  linkMap[file] = [];
  incomingMap[file] = incomingMap[file] || [];
}

for (const file of files) {
  const html = fs.readFileSync(path.join(dir, file), 'utf8');

  // Extract title
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  allTitles[file] = titleMatch ? titleMatch[1].replace(' — LiveSportStream','').replace(' — Watch Every Sport Online Free (2026 Guide)','').trim() : file;

  // Extract all href links to local .html files
  const hrefRegex = /href="\/?([\w\-\.]+\.html)"/g;
  let m;
  const seen = new Set();
  while ((m = hrefRegex.exec(html)) !== null) {
    const target = m[1].replace(/^\//, '');
    if (target !== file && files.includes(target) && !seen.has(target)) {
      seen.add(target);
      linkMap[file].push(target);
      incomingMap[target] = incomingMap[target] || [];
      incomingMap[target].push(file);
    }
  }
}

// Find orphan pages (no incoming links from other pages, excluding nav/footer standard links)
// Standard nav links (in every page via ESPN nav):
const NAV_LINKS = [
  'how-to-watch-nfl-online.html','how-to-watch-nba-online.html','how-to-watch-nhl-online.html',
  'how-to-watch-premier-league.html','how-to-watch-ufc-online.html','how-to-watch-champions-league.html',
  'how-to-watch-f1-online.html','best-free-sports-streaming-sites.html','blog.html','index.html'
];
const FOOTER_LINKS = [
  'how-to-watch-nhl-online.html','how-to-watch-nfl-online.html','how-to-watch-premier-league.html',
  'how-to-watch-ufc-online.html','how-to-watch-nba-online.html','how-to-watch-champions-league.html',
  'how-to-watch-f1-online.html','best-free-sports-streaming-sites.html','crackstreams-alternatives.html',
  'reddit-nhl-streams-alternatives.html','best-iptv-for-sports.html','how-to-watch-world-cup-2026.html',
  'privacy.html','terms.html','about.html','index.html'
];
const AUTO_LINKED = new Set([...NAV_LINKS, ...FOOTER_LINKS]);

console.log('\n══════════════════════════════════════════════════════');
console.log('  LIVESPORTSONTV.ONLINE — SITE TREE ANALYSIS');
console.log('══════════════════════════════════════════════════════\n');

console.log('📁 TOTAL PAGES:', files.length);
console.log('');

// Group pages by category
const categories = {
  'HOME / HUB': ['index.html','blog.html','how-to-watch-sports-online.html'],
  'NHL': ['how-to-watch-nhl-online.html','reddit-nhl-streams-alternatives.html','maple-leafs-vs-senators.html'],
  'NFL': ['how-to-watch-nfl-online.html'],
  'NBA': ['how-to-watch-nba-online.html'],
  'SOCCER / FOOTBALL': ['how-to-watch-premier-league.html','how-to-watch-champions-league.html','how-to-watch-europa-league.html','football-news-today.html','football-transfers-2026.html'],
  'UFC / MMA': ['how-to-watch-ufc-online.html'],
  'F1 / RUGBY': ['how-to-watch-f1-online.html','how-to-watch-rugby-online.html'],
  'WORLD CUP 2026': ['how-to-watch-world-cup-2026.html','world-cup-2026-groups.html','world-cup-2026-schedule.html','world-cup-2026-stadiums.html','world-cup-2026-teams.html','world-cup-2026-tickets.html'],
  'STREAMING GUIDES': ['best-free-sports-streaming-sites.html','crackstreams-alternatives.html','best-iptv-for-sports.html'],
  'IPTV CANADA': ['iptv-canada-review.html','iptv-canada-free.html','iptv-canada-reddit.html','iptv-for-indians-canada.html','what-is-iptv-canada.html','how-to-set-up-iptv-canada.html'],
  'SITE PAGES': ['about.html','privacy.html','terms.html','editorial-standards.html','author-jake-morrison.html','404.html'],
};

// Check which files are categorized
const categorized = new Set(Object.values(categories).flat());
const uncategorized = files.filter(f => !categorized.has(f));

console.log('🌳 SITE TREE:');
console.log('');
for (const [cat, pages] of Object.entries(categories)) {
  console.log(`  ┌─ ${cat}`);
  for (const page of pages) {
    const exists = files.includes(page);
    const icon = exists ? '✅' : '❌ MISSING';
    const inLinks = (incomingMap[page] || []).filter(p => !AUTO_LINKED.has(p)).length;
    const outLinks = (linkMap[page] || []).filter(p => !AUTO_LINKED.has(p)).length;
    const title = allTitles[page] ? allTitles[page].substring(0,55) : page;
    console.log(`  │  ├── ${icon} /${page}`);
    console.log(`  │  │     in:${inLinks} content-links  out:${outLinks} content-links`);
  }
  console.log('  │');
}

if (uncategorized.length > 0) {
  console.log('  ┌─ UNCATEGORIZED');
  for (const page of uncategorized) {
    console.log(`  │  ├── ⚠️  /${page}`);
  }
}

// ── ORPHAN CHECK ─────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════');
console.log('  ORPHAN PAGES (only reachable via nav/footer — no content links)');
console.log('══════════════════════════════════════════════════════');
const orphans = [];
for (const file of files) {
  const contentIncoming = (incomingMap[file] || []).filter(p => !AUTO_LINKED.has(p));
  if (contentIncoming.length === 0 && !['index.html','blog.html'].includes(file)) {
    orphans.push(file);
  }
}
if (orphans.length === 0) {
  console.log('  None — all pages have at least 1 content link.\n');
} else {
  for (const o of orphans) {
    console.log(`  ⚠️  /${o}`);
  }
  console.log('');
}

// ── PAGES WITH NO OUTGOING CONTENT LINKS ────────────────────────────────────
console.log('══════════════════════════════════════════════════════');
console.log('  PAGES WITH NO OUTGOING CONTENT LINKS (dead ends)');
console.log('══════════════════════════════════════════════════════');
const deadEnds = [];
for (const file of files) {
  const contentOut = (linkMap[file] || []).filter(p => !AUTO_LINKED.has(p));
  if (contentOut.length === 0) {
    deadEnds.push(file);
  }
}
if (deadEnds.length === 0) {
  console.log('  None.\n');
} else {
  for (const d of deadEnds) {
    console.log(`  ⚠️  /${d}`);
  }
  console.log('');
}

// ── LINK SUMMARY ─────────────────────────────────────────────────────────────
console.log('══════════════════════════════════════════════════════');
console.log('  TOP PAGES BY INCOMING CONTENT LINKS (internal authority)');
console.log('══════════════════════════════════════════════════════');
const ranked = files
  .map(f => ({ file: f, count: (incomingMap[f]||[]).filter(p => !AUTO_LINKED.has(p)).length }))
  .sort((a,b) => b.count - a.count)
  .slice(0,10);
for (const r of ranked) {
  console.log(`  ${String(r.count).padStart(3)} links → /${r.file}`);
}
console.log('');
