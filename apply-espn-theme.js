const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'index.html');

// ── ESPN CSS override injected in <head> ──────────────────────────────────────
const ESPN_CSS = `<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Roboto:wght@300;400;500;700;900&display=swap" rel="stylesheet"/>
<style id="espn-theme">
/* ESPN Theme Override */
:root{--red:#cc0000;--red2:#a50000}
/* Scores bar */
#scores-bar{background:#0d0d0d;border-bottom:2px solid #cc0000;overflow:hidden}
.scores-inner{display:flex;white-space:nowrap;animation:scoreScroll 40s linear infinite;padding:8px 0}
.scores-inner:hover{animation-play-state:paused}
@keyframes scoreScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.score-item{display:inline-flex;align-items:center;gap:10px;padding:0 28px;font-size:12px;border-right:1px solid #2e2e2e;flex-shrink:0}
.score-league{font-family:'Oswald',sans-serif;font-size:10px;font-weight:600;letter-spacing:.08em;color:#cc0000;text-transform:uppercase;min-width:32px}
.score-teams{display:flex;flex-direction:column;gap:1px}
.score-team{display:flex;justify-content:space-between;gap:16px;font-size:11px}
.score-team-name{color:#aaa;font-weight:500}
.score-team-score{font-weight:700;color:#fff}
.score-status{font-size:10px;color:#cc0000;font-weight:700;letter-spacing:.04em;white-space:nowrap}
/* ESPN Nav */
#nav{background:#0d0d0d!important;border-bottom:3px solid #cc0000!important;backdrop-filter:none!important;padding:0!important;position:sticky!important;top:0!important}
.nav-wrap{max-width:1200px;margin:0 auto;padding:0 16px}
.nav-top{display:flex;align-items:center;justify-content:space-between;padding:10px 0;gap:16px}
.nav-logo-espn{font-family:'Oswald',sans-serif;font-size:28px;font-weight:700;letter-spacing:.04em;line-height:1;text-decoration:none}
.nav-logo-espn .esp{color:#cc0000}
.nav-logo-espn .n{color:#fff}
.nav-tabs-espn{display:flex;align-items:center;overflow-x:auto;scrollbar-width:none;padding-bottom:0}
.nav-tabs-espn::-webkit-scrollbar{display:none}
.nav-tab-espn{font-family:'Oswald',sans-serif;font-size:13px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#aaa;padding:10px 14px;border-bottom:3px solid transparent;margin-bottom:-3px;transition:.15s;white-space:nowrap;text-decoration:none;display:inline-block}
.nav-tab-espn:hover{color:#fff;border-bottom-color:#cc0000}
.nav-cta-espn{background:#cc0000;color:#fff;padding:8px 18px;font-family:'Oswald',sans-serif;font-size:14px;font-weight:600;letter-spacing:.04em;transition:.2s;white-space:nowrap;text-decoration:none;border-radius:3px}
.nav-cta-espn:hover{background:#a50000}
.hamburger-espn{display:none;flex-direction:column;gap:5px;padding:4px;cursor:pointer;background:none;border:none}
.hamburger-espn span{width:22px;height:2px;background:#fff;border-radius:2px}
@media(max-width:700px){.nav-tabs-espn{display:none}.hamburger-espn{display:flex}}
/* ESPN Footer */
#footer-espn{background:#0d0d0d;border-top:3px solid #cc0000;padding:40px 0 20px}
.footer-espn-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:32px;margin-bottom:32px;max-width:1200px;margin-left:auto;margin-right:auto;padding:0 16px}
.footer-espn-logo{font-family:'Oswald',sans-serif;font-size:28px;font-weight:700;margin-bottom:10px}
.footer-espn-logo .esp{color:#cc0000}
.footer-espn-about{font-size:13px;color:#aaa;line-height:1.7;max-width:280px;margin-bottom:12px}
.footer-espn-disclaimer{font-size:11px;color:#555;line-height:1.6;background:rgba(255,255,255,.03);border:1px solid #2e2e2e;padding:10px 12px}
.footer-espn-col-title{font-family:'Oswald',sans-serif;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#fff;margin-bottom:12px;border-bottom:1px solid #2e2e2e;padding-bottom:8px}
.footer-espn-links{display:flex;flex-direction:column;gap:7px}
.footer-espn-links a{font-size:13px;color:#aaa;transition:.15s;text-decoration:none}
.footer-espn-links a:hover{color:#cc0000}
.footer-espn-bottom{display:flex;justify-content:space-between;align-items:center;padding:20px 16px 0;border-top:1px solid #2e2e2e;font-size:12px;color:#555;flex-wrap:wrap;gap:10px;max-width:1200px;margin:0 auto}
.footer-espn-bottom a{color:#555;text-decoration:none;transition:.15s}
.footer-espn-bottom a:hover{color:#cc0000}
@media(max-width:700px){.footer-espn-grid{grid-template-columns:1fr 1fr}}
</style>`;

// ── Scores bar HTML ───────────────────────────────────────────────────────────
const SCORES_BAR = `
<!-- SCORES BAR -->
<div id="scores-bar">
  <div style="max-width:1200px;margin:0 auto;padding:0 16px">
    <div class="scores-inner">
      <div class="score-item"><span class="score-league">NHL</span><div class="score-teams"><div class="score-team"><span class="score-team-name">Maple Leafs</span><span class="score-team-score">4</span></div><div class="score-team"><span class="score-team-name">Bruins</span><span class="score-team-score">2</span></div></div><span class="score-status">FINAL</span></div>
      <div class="score-item"><span class="score-league">NBA</span><div class="score-teams"><div class="score-team"><span class="score-team-name">Raptors</span><span class="score-team-score">108</span></div><div class="score-team"><span class="score-team-name">Celtics</span><span class="score-team-score">115</span></div></div><span class="score-status">FINAL</span></div>
      <div class="score-item"><span class="score-league">PL</span><div class="score-teams"><div class="score-team"><span class="score-team-name">Arsenal</span><span class="score-team-score">2</span></div><div class="score-team"><span class="score-team-name">Chelsea</span><span class="score-team-score">1</span></div></div><span class="score-status">FINAL</span></div>
      <div class="score-item"><span class="score-league">NFL</span><div class="score-teams"><div class="score-team"><span class="score-team-name">Chiefs</span><span class="score-team-score">27</span></div><div class="score-team"><span class="score-team-name">Bills</span><span class="score-team-score">24</span></div></div><span class="score-status">FINAL</span></div>
      <div class="score-item"><span class="score-league">UCL</span><div class="score-teams"><div class="score-team"><span class="score-team-name">Real Madrid</span><span class="score-team-score">3</span></div><div class="score-team"><span class="score-team-name">Man City</span><span class="score-team-score">1</span></div></div><span class="score-status">FINAL</span></div>
      <div class="score-item"><span class="score-league">UFC</span><div class="score-teams"><div class="score-team"><span class="score-team-name">Poirier</span><span class="score-team-score">W</span></div><div class="score-team"><span class="score-team-name">Holloway</span><span class="score-team-score">L</span></div></div><span class="score-status">FINAL</span></div>
      <div class="score-item"><span class="score-league">F1</span><div class="score-teams"><div class="score-team"><span class="score-team-name">Verstappen</span><span class="score-team-score">P1</span></div><div class="score-team"><span class="score-team-name">Hamilton</span><span class="score-team-score">P2</span></div></div><span class="score-status">RACE</span></div>
      <div class="score-item"><span class="score-league">NHL</span><div class="score-teams"><div class="score-team"><span class="score-team-name">Maple Leafs</span><span class="score-team-score">4</span></div><div class="score-team"><span class="score-team-name">Bruins</span><span class="score-team-score">2</span></div></div><span class="score-status">FINAL</span></div>
      <div class="score-item"><span class="score-league">NBA</span><div class="score-teams"><div class="score-team"><span class="score-team-name">Raptors</span><span class="score-team-score">108</span></div><div class="score-team"><span class="score-team-name">Celtics</span><span class="score-team-score">115</span></div></div><span class="score-status">FINAL</span></div>
      <div class="score-item"><span class="score-league">PL</span><div class="score-teams"><div class="score-team"><span class="score-team-name">Arsenal</span><span class="score-team-score">2</span></div><div class="score-team"><span class="score-team-name">Chelsea</span><span class="score-team-score">1</span></div></div><span class="score-status">FINAL</span></div>
      <div class="score-item"><span class="score-league">NFL</span><div class="score-teams"><div class="score-team"><span class="score-team-name">Chiefs</span><span class="score-team-score">27</span></div><div class="score-team"><span class="score-team-name">Bills</span><span class="score-team-score">24</span></div></div><span class="score-status">FINAL</span></div>
      <div class="score-item"><span class="score-league">UCL</span><div class="score-teams"><div class="score-team"><span class="score-team-name">Real Madrid</span><span class="score-team-score">3</span></div><div class="score-team"><span class="score-team-name">Man City</span><span class="score-team-score">1</span></div></div><span class="score-status">FINAL</span></div>
    </div>
  </div>
</div>`;

// ── ESPN Nav HTML ─────────────────────────────────────────────────────────────
const ESPN_NAV = `<nav id="nav">
<div class="nav-wrap">
  <div class="nav-top">
    <a href="/index.html" class="nav-logo-espn"><span class="esp">LIVE</span><span class="n">SPORT</span></a>
    <div class="nav-tabs-espn">
      <a href="/how-to-watch-nfl-online.html" class="nav-tab-espn">NFL</a>
      <a href="/how-to-watch-nba-online.html" class="nav-tab-espn">NBA</a>
      <a href="/how-to-watch-nhl-online.html" class="nav-tab-espn">NHL</a>
      <a href="/how-to-watch-premier-league.html" class="nav-tab-espn">Soccer</a>
      <a href="/how-to-watch-ufc-online.html" class="nav-tab-espn">UFC/MMA</a>
      <a href="/how-to-watch-champions-league.html" class="nav-tab-espn">Champions</a>
      <a href="/how-to-watch-f1-online.html" class="nav-tab-espn">F1</a>
      <a href="/best-free-sports-streaming-sites.html" class="nav-tab-espn">Streaming</a>
      <a href="/blog.html" class="nav-tab-espn">All Guides</a>
    </div>
    <a href="/best-iptv-for-sports.html" class="nav-cta-espn">Best IPTV 2026</a>
    <button class="hamburger-espn" aria-label="Menu" onclick="toggleESPNMenu()"><span></span><span></span><span></span></button>
  </div>
</div>
</nav>`;

// ── ESPN Footer HTML ──────────────────────────────────────────────────────────
const ESPN_FOOTER = `<footer id="footer-espn">
  <div class="footer-espn-grid">
    <div>
      <div class="footer-espn-logo"><span class="esp">LIVE</span><span style="color:#fff">SPORT</span></div>
      <p class="footer-espn-about">The most complete sports streaming guide online. Free and paid options for NHL, NFL, NBA, Premier League, UFC, and 50+ sports — tested and updated monthly.</p>
      <div class="footer-espn-disclaimer">Disclaimer: LiveSportStream provides guides about streaming services. We do not host any streams. Always verify the legality of streaming services in your country.</div>
    </div>
    <div>
      <div class="footer-espn-col-title">By Sport</div>
      <div class="footer-espn-links">
        <a href="/how-to-watch-nhl-online.html">NHL Streaming</a>
        <a href="/how-to-watch-nfl-online.html">NFL Streaming</a>
        <a href="/how-to-watch-premier-league.html">Premier League</a>
        <a href="/how-to-watch-ufc-online.html">UFC Streaming</a>
        <a href="/how-to-watch-nba-online.html">NBA Streaming</a>
        <a href="/how-to-watch-champions-league.html">Champions League</a>
        <a href="/how-to-watch-f1-online.html">F1 Streaming</a>
      </div>
    </div>
    <div>
      <div class="footer-espn-col-title">Top Guides</div>
      <div class="footer-espn-links">
        <a href="/best-free-sports-streaming-sites.html">Free Streaming Sites</a>
        <a href="/crackstreams-alternatives.html">CrackStreams Alt.</a>
        <a href="/reddit-nhl-streams-alternatives.html">Reddit Streams Alt.</a>
        <a href="/best-iptv-for-sports.html">Best IPTV Sports</a>
        <a href="/how-to-watch-world-cup-2026.html">World Cup 2026</a>
      </div>
    </div>
    <div>
      <div class="footer-espn-col-title">Best IPTV</div>
      <div class="footer-espn-links">
        <a href="https://amslerfamilyfondation.org/index.html" target="_blank">NorthStream IPTV</a>
        <a href="https://amslerfamilyfondation.org/free-trial.html" target="_blank">Free 24h Trial</a>
        <a href="https://amslerfamilyfondation.org/best-iptv-canada.html" target="_blank">Best IPTV Canada</a>
        <a href="https://amslerfamilyfondation.org/iptv-firestick-canada.html" target="_blank">IPTV Firestick</a>
        <a href="https://wa.me/212776056268?text=Hi!%20I%20want%20a%20free%20IPTV%20trial" target="_blank">WhatsApp Support</a>
      </div>
    </div>
  </div>
  <div class="footer-espn-bottom">
    <span>© 2026 LiveSportStream — All sports streaming guides</span>
    <div style="display:flex;gap:14px">
      <a href="/privacy.html">Privacy</a>
      <a href="/terms.html">Terms</a>
      <a href="/about.html">About</a>
    </div>
  </div>
</footer>`;

// ── Mobile menu script ────────────────────────────────────────────────────────
const MENU_SCRIPT = `
<script id="espn-menu-script">
function toggleESPNMenu(){
  const tabs=document.querySelector('.nav-tabs-espn');
  if(!tabs)return;
  const open=tabs.classList.contains('mob-open');
  if(open){tabs.classList.remove('mob-open');tabs.style.cssText='';}
  else{tabs.classList.add('mob-open');tabs.style.cssText='display:flex;flex-direction:column;position:fixed;top:55px;left:0;right:0;background:#0d0d0d;border-bottom:2px solid #cc0000;padding:12px 16px;gap:2px;z-index:999;';}
}
</script>`;

let updated = 0;
let skipped = 0;

for (const file of files) {
  const filePath = path.join(dir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // Skip if already processed
  if (html.includes('espn-theme')) {
    skipped++;
    continue;
  }

  // 1. Inject ESPN CSS before </head>
  html = html.replace('</head>', ESPN_CSS + '\n</head>');

  // 2. Insert scores bar + replace old nav
  // Find the nav opening tag
  const navStart = html.indexOf('<nav id="nav"');
  if (navStart !== -1) {
    // Find closing </nav>
    const navEnd = html.indexOf('</nav>', navStart) + '</nav>'.length;
    html = html.slice(0, navStart) + SCORES_BAR + '\n' + ESPN_NAV + html.slice(navEnd);
  } else {
    // No nav found — inject after <body>
    html = html.replace('<body>', '<body>\n' + SCORES_BAR + '\n' + ESPN_NAV);
  }

  // 3. Replace old footer variants
  // Case A: footer-mini
  const footerMiniStart = html.indexOf('<footer class="footer-mini"');
  if (footerMiniStart !== -1) {
    const footerMiniEnd = html.indexOf('</footer>', footerMiniStart) + '</footer>'.length;
    html = html.slice(0, footerMiniStart) + ESPN_FOOTER + html.slice(footerMiniEnd);
  }

  // Case B: footer id="footer" (old green footer)
  const footerIdStart = html.indexOf('<footer id="footer"');
  if (footerIdStart !== -1) {
    const footerIdEnd = html.indexOf('</footer>', footerIdStart) + '</footer>'.length;
    html = html.slice(0, footerIdStart) + ESPN_FOOTER + html.slice(footerIdEnd);
  }

  // 4. Inject menu script before </body>
  if (!html.includes('espn-menu-script')) {
    html = html.replace('</body>', MENU_SCRIPT + '\n</body>');
  }

  // 5. Fix padding/margin-top on breadcrumb or main (nav is now sticky, not fixed)
  // Old pages had padding-top:76px or 80px for fixed nav — reduce since nav is sticky now
  // We'll add a small top offset via CSS override
  html = html.replace(
    '</style>\n</head>',
    'body{padding-top:0!important}\n</style>\n</head>'
  );

  fs.writeFileSync(filePath, html, 'utf8');
  updated++;
  console.log(`✓ ${file}`);
}

console.log(`\nDone: ${updated} updated, ${skipped} already done`);
