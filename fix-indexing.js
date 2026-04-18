const fs = require('fs');
const path = require('path');

const dir = __dirname;
const BASE = 'https://livesportsontv.online';

// ── FIX 1: Wrong canonicals (livesportstream.net → livesportsontv.online) ───
const WRONG_CANON_PAGES = [
  'about.html',
  'author-jake-morrison.html',
  'editorial-standards.html',
  'privacy.html',
  'terms.html'
];

// ── FIX 2: Titles to shorten ─────────────────────────────────────────────────
const TITLE_FIXES = {
  'blog.html': 'Sports Streaming Guides 2026 — Watch Every Sport Online',
  'crackstreams-alternatives.html': 'CrackStreams Alternatives 2026 — 8 Working Sites',
  'football-news-today.html': 'Football News Today 2026 — Latest Results & Transfers',
  'how-to-set-up-iptv-canada.html': 'How to Set Up IPTV in Canada 2026 — 5 Min Guide',
  'how-to-watch-europa-league.html': 'How to Watch Europa League Online Free 2026',
  'how-to-watch-world-cup-2026.html': 'How to Watch World Cup 2026 Online Free — Full Guide',
  'iptv-canada-reddit.html': 'IPTV Canada Reddit 2026 — Best Subreddits & Reviews',
  'iptv-for-indians-canada.html': 'Best IPTV for Indians in Canada 2026 — Zee TV, Star Plus',
  'maple-leafs-vs-senators.html': 'Watch Maple Leafs vs Senators Online Free 2026',
};

// ── FIX 3: Meta descriptions to fix (too long or missing) ───────────────────
const DESC_FIXES = {
  'about.html': 'LiveSportStream is your complete guide to watching sports online free. NHL, NFL, NBA, Premier League, UFC streaming guides — tested and updated monthly.',
  'privacy.html': 'Privacy Policy for LiveSportStream.net — how we collect, use, and protect your data when you visit our sports streaming guides.',
  'terms.html': 'Terms of Service for LiveSportStream.net — rules and guidelines for using our sports streaming guide website.',
  'index.html': 'Complete guide to watching sports online in 2026. NHL, NFL, NBA, Premier League, UFC — free and paid streaming options tested and compared.',
  'how-to-watch-europa-league.html': 'How to watch Europa League online free in 2026. Best streaming options for every country — legal, free, and paid methods tested.',
  'how-to-watch-mlb-online.html': 'How to watch MLB games online free in 2026. Best streaming options for baseball fans in Canada, USA, and worldwide.',
  'how-to-watch-premier-league.html': 'Watch Premier League online free in 2026. 8 working methods for Canada, USA, and worldwide — legal streaming options tested.',
  'how-to-watch-sports-online.html': 'How to watch sports online free in 2026. Complete guide to NHL, NFL, NBA, Premier League, UFC, and more — free and paid options.',
  'how-to-watch-tennis-online.html': 'How to watch tennis online free in 2026. Stream Wimbledon, US Open, Roland Garros — free and paid options for every country.',
  'iptv-for-indians-canada.html': 'Best IPTV for Indians in Canada 2026. Watch Zee TV, Star Plus, Sony LIV, Colors TV and 500+ Indian channels from $12.99/month.',
};

let fixed = 0;

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  const changes = [];

  // FIX 1 — Wrong canonical domain
  if (WRONG_CANON_PAGES.includes(file)) {
    const before = html;
    html = html.replace(/https:\/\/livesportstream\.net\//g, `${BASE}/`);
    if (html !== before) { changes.push('canonical domain fixed'); changed = true; }
  }

  // FIX 2 — Title too long
  if (TITLE_FIXES[file]) {
    const newTitle = TITLE_FIXES[file];
    const before = html;
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${newTitle}</title>`);
    // Also fix OG title and twitter title
    html = html.replace(/(<meta[^>]+property="og:title"[^>]+content=")[^"]*(")/i, `$1${newTitle}$2`);
    html = html.replace(/(<meta[^>]+name="twitter:title"[^>]+content=")[^"]*(")/i, `$1${newTitle}$2`);
    if (html !== before) { changes.push('title shortened'); changed = true; }
  }

  // FIX 3 — Meta description missing or too long
  if (DESC_FIXES[file]) {
    const newDesc = DESC_FIXES[file];
    const before = html;
    if (html.includes('name="description"')) {
      html = html.replace(/(<meta[^>]+name="description"[^>]+content=")[^"]*(")/i, `$1${newDesc}$2`);
    } else {
      // Insert after <meta name="viewport"
      html = html.replace(
        /(<meta[^>]+name="viewport"[^>]*>)/i,
        `$1\n<meta name="description" content="${newDesc}"/>`
      );
    }
    // Also fix OG description and twitter description
    html = html.replace(/(<meta[^>]+property="og:description"[^>]+content=")[^"]*(")/i, `$1${newDesc}$2`);
    html = html.replace(/(<meta[^>]+name="twitter:description"[^>]+content=")[^"]*(")/i, `$1${newDesc}$2`);
    if (html !== before) { changes.push('meta description fixed'); changed = true; }
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf8');
    fixed++;
    console.log(`✅ ${file}: ${changes.join(', ')}`);
  }
}

console.log(`\nDone: ${fixed} pages fixed`);
