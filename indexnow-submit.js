const https = require('https');
const fs = require('fs');

const KEY = 'iptvquebec2026indexnowkey';
const HOST = 'livesportsontv.online';
const SITEMAP = `https://${HOST}/sitemap.xml`;

// Extract all URLs from sitemap
const xml = fs.readFileSync('sitemap.xml', 'utf8');
const urls = [];
const re = /<loc>(.*?)<\/loc>/g;
let m;
while ((m = re.exec(xml)) !== null) urls.push(m[1]);

console.log(`\nFound ${urls.length} URLs\n`);

function post(hostname, path, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const options = {
      hostname,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', e => resolve({ status: 'ERROR', body: e.message }));
    req.write(data);
    req.end();
  });
}

async function main() {
  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls
  };

  // Submit to IndexNow API (covers Bing, Yandex, etc.)
  console.log('── Submitting to api.indexnow.org ──────────────────');
  const r1 = await post('api.indexnow.org', '/indexnow', payload);
  console.log(`Status: ${r1.status} ${r1.status === 200 || r1.status === 202 ? '✅' : '⚠️'}`);
  if (r1.body) console.log('Response:', r1.body.substring(0, 200));

  // Submit to Bing directly
  console.log('\n── Submitting to Bing ──────────────────────────────');
  const r2 = await post('www.bing.com', '/indexnow', payload);
  console.log(`Status: ${r2.status} ${r2.status === 200 || r2.status === 202 ? '✅' : '⚠️'}`);

  // Submit to Yandex
  console.log('\n── Submitting to Yandex ────────────────────────────');
  const r3 = await post('yandex.com', '/indexnow', payload);
  console.log(`Status: ${r3.status} ${r3.status === 200 || r3.status === 202 ? '✅' : '⚠️'}`);

  console.log(`\n✅ Done — ${urls.length} URLs submitted to IndexNow\n`);
  console.log('Pages will be indexed within 24-48 hours on Bing/Yandex.');
  console.log('For Google: submit sitemap in Search Console + request indexing manually.\n');
}

main();
