const fs = require('fs');
const path = require('path');

const dir = __dirname;
const BASE = 'https://livesportsontv.online';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== '404.html');

const issues = [];
const ok = [];

for (const file of files) {
  const html = fs.readFileSync(path.join(dir, file), 'utf8');
  const pageIssues = [];

  // 1. noindex check
  if (/noindex/i.test(html)) {
    pageIssues.push('❌ has noindex meta tag — Google will NOT index this page');
  }

  // 2. canonical check
  const canonMatch = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i);
  if (!canonMatch) {
    pageIssues.push('❌ missing canonical tag');
  } else {
    const canon = canonMatch[1];
    const expected = `${BASE}/${file}`;
    if (canon !== expected) {
      pageIssues.push(`❌ wrong canonical: "${canon}" → should be "${expected}"`);
    }
  }

  // 3. title check
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  if (!titleMatch || !titleMatch[1].trim()) {
    pageIssues.push('❌ missing <title>');
  } else if (titleMatch[1].length > 65) {
    pageIssues.push(`⚠️  title too long (${titleMatch[1].length} chars): "${titleMatch[1].substring(0,60)}..."`);
  }

  // 4. meta description check
  const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);
  if (!descMatch) {
    pageIssues.push('❌ missing meta description');
  } else if (descMatch[1].length < 50) {
    pageIssues.push(`⚠️  meta description too short (${descMatch[1].length} chars)`);
  } else if (descMatch[1].length > 165) {
    pageIssues.push(`⚠️  meta description too long (${descMatch[1].length} chars)`);
  }

  // 5. h1 check
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/is);
  if (!h1Match) {
    pageIssues.push('❌ missing <h1>');
  }

  // 6. robots meta check
  const robotsMatch = html.match(/<meta[^>]+name="robots"[^>]+content="([^"]+)"/i);
  if (!robotsMatch) {
    pageIssues.push('⚠️  missing robots meta tag (should be index, follow)');
  } else if (/noindex|nofollow/i.test(robotsMatch[1])) {
    pageIssues.push(`❌ robots meta blocks indexing: "${robotsMatch[1]}"`);
  }

  // 7. duplicate canonical with meta content bug (old bug from before)
  if (html.match(/content="[^"]*<link rel="canonical"/)) {
    pageIssues.push('❌ CRITICAL: canonical tag injected inside meta content attribute');
  }

  if (pageIssues.length === 0) {
    ok.push(file);
  } else {
    issues.push({ file, problems: pageIssues });
  }
}

console.log('\n══════════════════════════════════════════════════════');
console.log('  INDEXING HEALTH CHECK — livesportsontv.online');
console.log('══════════════════════════════════════════════════════\n');

if (issues.length === 0) {
  console.log('✅ ALL PAGES CLEAN — ready for indexing\n');
} else {
  console.log(`❌ ${issues.length} pages have issues:\n`);
  for (const p of issues) {
    console.log(`  📄 ${p.file}`);
    for (const prob of p.problems) {
      console.log(`       ${prob}`);
    }
    console.log('');
  }
}

console.log(`✅ Clean: ${ok.length} pages`);
console.log(`❌ Issues: ${issues.length} pages\n`);

// Summary
const counts = { noindex:0, canonical:0, title:0, desc:0, h1:0, robots:0 };
for (const p of issues) {
  for (const prob of p.problems) {
    if (prob.includes('noindex')) counts.noindex++;
    else if (prob.includes('canonical')) counts.canonical++;
    else if (prob.includes('title')) counts.title++;
    else if (prob.includes('description')) counts.desc++;
    else if (prob.includes('h1')) counts.h1++;
    else if (prob.includes('robots')) counts.robots++;
  }
}
console.log('── Issues breakdown ───────────────────────────────');
for (const [k,v] of Object.entries(counts)) {
  if (v > 0) console.log(`  ${k}: ${v} pages`);
}
console.log('');
