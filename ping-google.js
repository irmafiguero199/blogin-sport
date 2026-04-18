const https = require('https');
const fs = require('fs');

const SITEMAP = 'https://livesportsontv.online/sitemap.xml';

function ping(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (e) => {
      resolve({ url, status: 'ERROR: ' + e.message });
    });
  });
}

async function main() {
  console.log('\n── Pinging Google & Bing with sitemap ──────────────\n');

  // 1. Google sitemap ping
  const g = await ping(`https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP)}`);
  console.log(`Google ping: HTTP ${g.status} ${g.status === 200 ? '✅' : '⚠️'}`);

  // 2. Bing sitemap ping
  const b = await ping(`https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP)}`);
  console.log(`Bing ping:   HTTP ${b.status} ${b.status === 200 ? '✅' : '⚠️'}`);

  console.log('\n── Extracting all URLs from sitemap ────────────────\n');
  const xml = fs.readFileSync('sitemap.xml', 'utf8');
  const urls = [];
  const re = /<loc>(.*?)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) urls.push(m[1]);

  console.log(`Found ${urls.length} URLs in sitemap`);
  console.log('\n── Pinging each URL to Google ──────────────────────\n');

  let ok = 0;
  for (const u of urls) {
    const r = await ping(`https://www.google.com/ping?sitemap=${encodeURIComponent(u)}`);
    const icon = r.status === 200 ? '✅' : '⚠️';
    console.log(`${icon} ${r.status} — ${u.replace('https://livesportsontv.online/', '')}`);
    if (r.status === 200) ok++;
    await new Promise(res => setTimeout(res, 300));
  }

  console.log(`\n✅ Done: ${ok}/${urls.length} URLs pinged successfully`);
  console.log('\nGoogle will now crawl and index these pages within 24-72 hours.\n');
}

main();
