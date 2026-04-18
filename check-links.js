const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = new Set(fs.readdirSync(dir).filter(f => f.endsWith('.html')));

let broken = [];
let ok = 0;

for (const file of files) {
  const html = fs.readFileSync(path.join(dir, file), 'utf8');
  const hrefRegex = /href="\/?([\w\-\.]+\.html)"/g;
  let m;
  while ((m = hrefRegex.exec(html)) !== null) {
    const target = m[1].replace(/^\//, '');
    if (!files.has(target)) {
      broken.push({ from: file, to: target });
    } else {
      ok++;
    }
  }
}

console.log(`\n✅ OK links: ${ok}`);
console.log(`❌ BROKEN links: ${broken.length}\n`);
if (broken.length > 0) {
  for (const b of broken) {
    console.log(`  ${b.from}  →  /${b.to}  ← NOT FOUND`);
  }
}
