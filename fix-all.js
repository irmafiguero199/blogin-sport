const fs = require('fs');
const path = require('path');
const dir = __dirname;

const DOMAIN = 'livesportsontv.online';
const WRONG  = 'livesportstream.net';

const SKIP_ALL  = ['404.html','privacy.html','terms.html','about.html',
                   'author-jake-morrison.html','editorial-standards.html','fix-all.js'];
const SKIP_CONTENT = [...SKIP_ALL, 'blog.html'];

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && !SKIP_ALL.includes(f));
const contentFiles = files.filter(f => !SKIP_CONTENT.includes(f));

let stats = { domain:0, badWords:0, seeAlso:0, cta:0, waFloat:0, sitemap:0 };

// ── WA Float HTML ─────────────────────────────────────────────────────────
const WA_FLOAT = `
<!-- WA FLOAT -->
<a href="https://wa.me/212776056268?text=Hi!%20I%20want%20a%20free%20IPTV%20trial%20on%20iptvv.online." class="wa-float" target="_blank" rel="noopener" aria-label="WhatsApp — Free IPTV Trial" style="position:fixed;bottom:28px;right:28px;z-index:9999;display:flex;align-items:center;gap:10px;background:#25D366;color:#fff;border-radius:100px;padding:13px 20px 13px 15px;box-shadow:0 8px 32px rgba(37,211,102,.4);font-weight:700;font-size:13px;text-decoration:none">
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  Free IPTV Trial
</a>`;

// ── CTA box per page type ─────────────────────────────────────────────────
function getCTA(file) {
  const f = file.toLowerCase();
  let msg  = "Hi! I want a free IPTV trial — saw livesportsontv.online.";
  let title = 'Watch Sports Without Cable';
  let desc  = 'Get 25,000+ live channels — TSN, Sportsnet, RDS, ESPN, beIN Sports, Sky Sports. No cable. No contract. From $12.99 CAD/month.';
  let btn   = '🎁 Free 24h Trial — No Card';

  if (f.includes('nhl') || f.includes('hockey')) {
    msg = 'Hi! I want to watch NHL live on IPTV — free trial please.';
    title = 'Watch Every NHL Game Live'; desc = 'iptvv.online IPTV includes all TSN 1–5 and Sportsnet channels — zero blackouts, zero cable. From $12.99 CAD/month.';
  } else if (f.includes('nfl') || f.includes('football-')) {
    msg = 'Hi! I want to watch NFL on IPTV — free trial please.';
    title = 'Watch Every NFL Game Live'; desc = 'iptvv.online gives you ESPN, NBC Sports, Fox, NFL Network and every game live from $12.99 CAD/month. No blackouts.';
  } else if (f.includes('nba')) {
    msg = 'Hi! I want to watch NBA on IPTV — free trial please.';
    title = 'Stream Every NBA Game'; desc = 'TSN, ESPN, ABC, NBA TV — all included in iptvv.online IPTV. 25,000+ channels from $12.99 CAD/month.';
  } else if (f.includes('premier-league') || f.includes('football')) {
    msg = 'Hi! I want to watch Premier League on IPTV — free trial please.';
    title = 'Watch Premier League Live'; desc = 'Every EPL match on DAZN, beIN Sports, Sky Sports, TNT Sports — all in iptvv.online IPTV from $12.99/month.';
  } else if (f.includes('world-cup')) {
    msg = 'Hi! I want to watch World Cup 2026 on IPTV — free trial please.';
    title = 'Watch World Cup 2026 Live'; btn = '🎁 Get Free Trial — Watch WC 2026';
    desc = 'Every World Cup 2026 match live in 4K — TSN, CBC, Telemundo, Fox Sports. iptvv.online from $12.99 CAD/month.';
  } else if (f.includes('ufc')) {
    msg = 'Hi! I want to watch UFC on IPTV — free trial please.';
    title = 'Stream Every UFC Fight Night'; desc = 'Every UFC event including PPV — ESPN+, TSN, Sportsnet. iptvv.online IPTV from $12.99 CAD/month. No PPV fees.';
  } else if (f.includes('champions-league')) {
    msg = 'Hi! I want to watch Champions League on IPTV — free trial please.';
    title = 'Watch UCL Every Match Day'; desc = 'DAZN, CBS Sports, beIN Sports, TNT Sports — every Champions League game live on iptvv.online IPTV.';
  } else if (f.includes('f1')) {
    msg = 'Hi! I want to watch F1 on IPTV — free trial please.';
    title = 'Stream Every F1 Race Live'; desc = 'Every Formula 1 race on TSN, ESPN F1, Sky Sports F1 — all included in iptvv.online from $12.99/month.';
  } else if (f.includes('iptv') || f.includes('streaming')) {
    msg = 'Hi! I want to subscribe to iptvv.online IPTV Canada.';
    title = 'Try Canada\'s Best IPTV Free'; btn = '🎁 Free 24h Trial — No Card';
    desc = '25,000+ channels, TSN, RDS, CBC, Sportsnet, 4K Ultra HD. From $12.99 CAD/month. Interac e-Transfer accepted.';
  }

  const waLink = `https://wa.me/212776056268?text=${encodeURIComponent(msg)}`;
  return `
<!-- CTA BOX -->
<div style="background:linear-gradient(135deg,rgba(0,230,118,.09),rgba(0,100,60,.07));border:1px solid rgba(0,230,118,.2);border-radius:20px;padding:44px 40px;text-align:center;margin:48px 0">
  <h2 style="font-family:'Bebas Neue',cursive;font-size:clamp(30px,3.8vw,48px);letter-spacing:.02em;text-transform:uppercase;margin-bottom:10px">${title} <span style="color:#00e676">on IPTV</span></h2>
  <p style="color:rgba(255,255,255,.55);font-size:15px;line-height:1.7;margin-bottom:24px;max-width:520px;margin-left:auto;margin-right:auto">${desc}</p>
  <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap">
    <a href="https://iptvv.online/free-trial.html" target="_blank" style="display:inline-flex;align-items:center;gap:8px;padding:15px 30px;border-radius:100px;font-weight:700;font-size:14px;background:#00e676;color:#000;text-decoration:none">${btn}</a>
    <a href="${waLink}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;padding:15px 30px;border-radius:100px;font-weight:700;font-size:14px;background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.2);text-decoration:none">💬 Ask on WhatsApp</a>
  </div>
  <p style="font-size:12px;color:rgba(255,255,255,.3);margin-top:14px">Powered by <a href="https://iptvv.online" target="_blank" style="color:rgba(0,230,118,.6);text-decoration:none">iptvv.online</a> · From $12.99 CAD/month</p>
</div>`;
}

// ── See Also links per page type ──────────────────────────────────────────
function getSeeAlso(file) {
  const f = file.toLowerCase();
  let links = [];

  if (f.includes('world-cup'))
    links = ['how-to-watch-world-cup-2026.html|Watch World Cup 2026','world-cup-2026-schedule.html|WC Schedule','world-cup-2026-groups.html|WC Groups','world-cup-2026-teams.html|WC Teams','world-cup-2026-tickets.html|WC Tickets','football-news-today.html|Football News'];
  else if (f.includes('football') || f.includes('premier-league'))
    links = ['how-to-watch-premier-league.html|Premier League','how-to-watch-world-cup-2026.html|World Cup 2026','world-cup-2026-groups.html|WC 2026 Groups','football-transfers-2026.html|Transfers 2026','how-to-watch-champions-league.html|Champions League','best-iptv-for-sports.html|Best IPTV Sports'];
  else if (f.includes('nhl') || f.includes('hockey'))
    links = ['how-to-watch-nhl-online.html|Watch NHL Online','reddit-nhl-streams-alternatives.html|Reddit NHL Streams','best-iptv-for-sports.html|Best IPTV Sports','how-to-watch-nfl-online.html|Watch NFL Online','best-free-sports-streaming-sites.html|Free Streaming','iptv-canada-review.html|IPTV Canada Review'];
  else if (f.includes('nfl'))
    links = ['how-to-watch-nfl-online.html|Watch NFL Online','how-to-watch-nhl-online.html|Watch NHL Online','how-to-watch-nba-online.html|Watch NBA Online','best-iptv-for-sports.html|Best IPTV Sports','best-free-sports-streaming-sites.html|Free Streaming'];
  else if (f.includes('nba'))
    links = ['how-to-watch-nba-online.html|Watch NBA Online','how-to-watch-nfl-online.html|Watch NFL Online','how-to-watch-nhl-online.html|Watch NHL Online','best-iptv-for-sports.html|Best IPTV Sports','best-free-sports-streaming-sites.html|Free Streaming'];
  else if (f.includes('ufc'))
    links = ['how-to-watch-ufc-online.html|Watch UFC Online','how-to-watch-sports-online.html|Watch Sports Online','best-iptv-for-sports.html|Best IPTV Sports','best-free-sports-streaming-sites.html|Free Streaming'];
  else if (f.includes('champions-league'))
    links = ['how-to-watch-champions-league.html|Champions League','how-to-watch-premier-league.html|Premier League','how-to-watch-sports-online.html|Watch Sports Online','best-iptv-for-sports.html|Best IPTV Sports'];
  else if (f.includes('f1'))
    links = ['how-to-watch-f1-online.html|Watch F1 Online','how-to-watch-sports-online.html|Watch Sports Online','best-iptv-for-sports.html|Best IPTV Sports','best-free-sports-streaming-sites.html|Free Streaming'];
  else if (f.includes('rugby'))
    links = ['how-to-watch-rugby-online.html|Watch Rugby Online','how-to-watch-sports-online.html|Watch Sports Online','how-to-watch-world-cup-2026.html|World Cup 2026','best-iptv-for-sports.html|Best IPTV Sports'];
  else if (f.includes('iptv') || f.includes('crackstream') || f.includes('streaming'))
    links = ['best-iptv-for-sports.html|Best IPTV Sports','iptv-canada-review.html|IPTV Canada Review','iptv-canada-free.html|Free IPTV Canada','how-to-set-up-iptv-canada.html|IPTV Setup Guide','what-is-iptv-canada.html|What is IPTV','reddit-nhl-streams-alternatives.html|Reddit Streams'];
  else if (f.includes('reddit'))
    links = ['reddit-nhl-streams-alternatives.html|Reddit NHL Streams','crackstreams-alternatives.html|Crackstreams Alt.','best-free-sports-streaming-sites.html|Free Streaming','best-iptv-for-sports.html|Best IPTV Sports','how-to-watch-nhl-online.html|Watch NHL Online'];
  else
    links = ['how-to-watch-sports-online.html|Watch Sports Online','best-iptv-for-sports.html|Best IPTV Sports','best-free-sports-streaming-sites.html|Free Streaming','how-to-watch-nhl-online.html|Watch NHL Online','iptv-canada-review.html|IPTV Canada Review'];

  const linksHTML = links.map(l => {
    const [href, text] = l.split('|');
    return `<a href="/${href}" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:6px 14px;font-size:13px;font-weight:600;color:#fff;text-decoration:none">${text}</a>`;
  }).join('\n      ');

  return `
<!-- SEE ALSO -->
<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:20px 24px;margin:36px 0">
  <div style="font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:12px">📖 Related Articles</div>
  <div style="display:flex;flex-wrap:wrap;gap:8px">
    ${linksHTML}
  </div>
</div>`;
}

// ── Bad words fix ─────────────────────────────────────────────────────────
function fixBadWords(html) {
  return html
    .replace(/\bdelve\b/gi, 'look')
    .replace(/\bdelving\b/gi, 'looking')
    .replace(/\bcrucial\b/gi, 'important')
    .replace(/\bleverage\b/gi, 'use')
    .replace(/\bleveraging\b/gi, 'using')
    .replace(/\bcomprehensive\b/gi, 'complete');
}

// ── MAIN LOOP ─────────────────────────────────────────────────────────────
files.forEach(file => {
  const fp = path.join(dir, file);
  let html = fs.readFileSync(fp, 'utf8');
  let changed = false;

  // 1. Fix wrong domain (CRITICAL)
  if (html.includes(WRONG)) {
    const count = (html.match(new RegExp(WRONG, 'g')) || []).length;
    html = html.split(WRONG).join(DOMAIN);
    stats.domain += count;
    changed = true;
  }

  // 2. Fix bad words
  const fixed = fixBadWords(html);
  if (fixed !== html) {
    html = fixed;
    stats.badWords++;
    changed = true;
  }

  // 3. Add WA Float (content pages only, if missing)
  if (!SKIP_CONTENT.includes(file) && !html.includes('wa.me') && !html.includes('whatsapp')) {
    if (html.includes('<footer') || html.includes('</body>')) {
      html = html.replace(/(<footer|<\/body>)/, WA_FLOAT + '\n$1');
      stats.waFloat++;
      changed = true;
    }
  }

  // 4. Add See Also (content pages only, if missing)
  if (!SKIP_CONTENT.includes(file) && !html.includes('Related Articles') && !html.includes('see-also')) {
    const seeAlso = getSeeAlso(file);
    const points = ['class="faq-list"','class="faq-item','<!-- CTA','<footer'];
    for (const p of points) {
      if (html.includes(p)) {
        html = html.replace(p, seeAlso + '\n' + p);
        stats.seeAlso++;
        changed = true;
        break;
      }
    }
  }

  // 5. Add CTA box (content pages only, if missing)
  if (!SKIP_CONTENT.includes(file) && !html.includes('iptvv.online/free-trial') && !html.includes('CTA BOX')) {
    const cta = getCTA(file);
    const points = ['<!-- SEE ALSO -->','class="faq-list"','class="faq-item','<footer'];
    for (const p of points) {
      if (html.includes(p)) {
        html = html.replace(p, cta + '\n' + p);
        stats.cta++;
        changed = true;
        break;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(fp, html, 'utf8');
    console.log(`✅ ${file}`);
  }
});

// ── Fix sitemap lastmod ───────────────────────────────────────────────────
const sitemapPath = path.join(dir, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
const oldSitemap = sitemap;
sitemap = sitemap.replace(/2026-03-3[01]/g, '2026-04-16');
sitemap = sitemap.replace(/2026-04-0[01]/g, '2026-04-16');
if (sitemap !== oldSitemap) {
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
  stats.sitemap++;
  console.log('✅ sitemap.xml — lastmod updated');
}

// ── Summary ───────────────────────────────────────────────────────────────
console.log('\n════ AUDIT FIX DONE ════');
console.log(`🔴 Domain fixed       : ${stats.domain} occurrences`);
console.log(`🟠 Bad words fixed    : ${stats.badWords} pages`);
console.log(`🟡 WA Float added     : ${stats.waFloat} pages`);
console.log(`🟢 See Also added     : ${stats.seeAlso} pages`);
console.log(`🟢 CTA box added      : ${stats.cta} pages`);
console.log(`🔵 Sitemap updated    : ${stats.sitemap ? 'YES' : 'NO'}`);
