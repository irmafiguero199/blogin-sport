const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== '404.html');

// Conversion pages (equivalent of free-trial/pricing/checkout for this site)
const CONVERSION_PAGES = [
  'best-iptv-for-sports.html',
  'best-free-sports-streaming-sites.html',
  'iptv-canada-review.html'
];
const CONVERSION_EXTERNAL = [
  'amslerfamilyfondation.org/free-trial.html',
  'amslerfamilyfondation.org',
  'iptvv.online'
];

// Hub/parent pages
const HUB_PAGES = ['index.html', 'blog.html'];

// Bad anchor text patterns
const BAD_ANCHORS = />(click here|learn more|read more|here|this link|this page)<\//gi;

// See Also / sidebar / related check
const SEE_ALSO_MARKERS = ['see-also', 'related-box', 'sidebar', 'See Also', 'Related Articles', 'related-grid', 'see_also'];

// Group pages for cross-link check
const GROUPS = {
  'NHL': ['how-to-watch-nhl-online.html','reddit-nhl-streams-alternatives.html','maple-leafs-vs-senators.html'],
  'World Cup': ['how-to-watch-world-cup-2026.html','world-cup-2026-groups.html','world-cup-2026-schedule.html','world-cup-2026-stadiums.html','world-cup-2026-teams.html','world-cup-2026-tickets.html'],
  'Soccer': ['how-to-watch-premier-league.html','how-to-watch-champions-league.html','how-to-watch-europa-league.html','football-news-today.html','football-transfers-2026.html'],
  'IPTV Canada': ['iptv-canada-review.html','iptv-canada-free.html','iptv-canada-reddit.html','iptv-for-indians-canada.html','what-is-iptv-canada.html','how-to-set-up-iptv-canada.html'],
  'Streaming': ['best-free-sports-streaming-sites.html','crackstreams-alternatives.html','best-iptv-for-sports.html'],
};

const results = [];

for (const file of files) {
  const html = fs.readFileSync(path.join(dir, file), 'utf8');
  const issues = [];
  const passes = [];

  // RULE 1 — links UP to hub (index or blog)
  const linksHub = HUB_PAGES.some(h => html.includes(`href="/${h}`) || html.includes(`href="${h}`));
  if (linksHub) passes.push('R1 ✅ links to hub');
  else issues.push('R1 ❌ no link to index.html or blog.html');

  // RULE 2 — links to conversion page (internal or external IPTV site)
  const linksConvInternal = CONVERSION_PAGES.some(p => html.includes(`href="/${p}`) || html.includes(`href="${p}`));
  const linksConvExternal = CONVERSION_EXTERNAL.some(p => html.includes(p));
  if (linksConvInternal || linksConvExternal) passes.push('R2 ✅ links to conversion');
  else issues.push('R2 ❌ no link to conversion page (best-iptv / free-trial)');

  // RULE 3 — cross-links within group
  let inGroup = null;
  for (const [grp, pages] of Object.entries(GROUPS)) {
    if (pages.includes(file)) { inGroup = { grp, pages }; break; }
  }
  if (inGroup) {
    const siblings = inGroup.pages.filter(p => p !== file);
    const crossLinked = siblings.some(p => html.includes(`href="/${p}`) || html.includes(`href="${p}`));
    if (crossLinked) passes.push(`R3 ✅ cross-links within ${inGroup.grp}`);
    else issues.push(`R3 ❌ no cross-link to siblings in group "${inGroup.grp}": ${siblings.join(', ')}`);
  } else {
    passes.push('R3 — (no group)');
  }

  // RULE 4 — no bad anchor text
  const badMatch = html.match(BAD_ANCHORS);
  if (badMatch) issues.push(`R4 ❌ bad anchor text: ${[...new Set(badMatch)].join(', ')}`);
  else passes.push('R4 ✅ anchor text OK');

  // RULE 5 — has See Also / sidebar / related section
  const hasSeeAlso = SEE_ALSO_MARKERS.some(m => html.includes(m));
  if (hasSeeAlso) passes.push('R5 ✅ has See Also / Related section');
  else issues.push('R5 ❌ no See Also / sidebar / Related section');

  results.push({ file, issues, passes });
}

// ── PRINT RESULTS ─────────────────────────────────────────────────────────────
let totalIssues = 0;
let totalPasses = 0;
const failing = results.filter(r => r.issues.length > 0);
const passing = results.filter(r => r.issues.length === 0);

console.log('\n══════════════════════════════════════════════════════');
console.log('  INTERNAL LINKING RULES CHECKLIST');
console.log('══════════════════════════════════════════════════════\n');

if (failing.length === 0) {
  console.log('✅ ALL PAGES PASS — no issues found.\n');
} else {
  console.log(`❌ ${failing.length} pages have issues:\n`);
  for (const r of failing) {
    console.log(`  📄 ${r.file}`);
    for (const i of r.issues) console.log(`       ${i}`);
    console.log('');
    totalIssues += r.issues.length;
  }
}

console.log(`✅ ${passing.length} pages fully pass all rules`);
console.log(`❌ ${failing.length} pages have at least 1 issue`);
console.log(`   Total issues: ${totalIssues}\n`);

// Summary by rule
const ruleCounts = {R1:0,R2:0,R3:0,R4:0,R5:0};
for (const r of results) {
  for (const i of r.issues) {
    const m = i.match(/R(\d)/);
    if (m) ruleCounts['R'+m[1]]++;
  }
}
console.log('── Issues by rule ─────────────────────────────────');
for (const [rule, count] of Object.entries(ruleCounts)) {
  const bar = '█'.repeat(count);
  console.log(`  ${rule}: ${count} pages  ${bar}`);
}
console.log('');
