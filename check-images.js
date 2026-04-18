const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
const allFiles = new Set(fs.readdirSync(dir));

let broken = [];
let ok = 0;

for (const file of files) {
  const html = fs.readFileSync(path.join(dir, file), 'utf8');
  // Match src="..." for local images (not http/data)
  const imgRegex = /src="(?!http|data|\/\/)([\w\-\.\/]+\.(jpg|jpeg|png|gif|webp|svg|avif))"/gi;
  let m;
  while ((m = imgRegex.exec(html)) !== null) {
    const imgPath = m[1].replace(/^\//, '');
    const exists = allFiles.has(imgPath) || fs.existsSync(path.join(dir, imgPath));
    if (!exists) {
      broken.push({ from: file, img: imgPath });
    } else {
      ok++;
    }
  }
}

console.log(`\n✅ OK images: ${ok}`);
console.log(`❌ BROKEN images: ${broken.length}\n`);

// Group by image name
const grouped = {};
for (const b of broken) {
  grouped[b.img] = grouped[b.img] || [];
  grouped[b.img].push(b.from);
}
for (const [img, pages] of Object.entries(grouped)) {
  console.log(`  ❌ /${img}`);
  console.log(`     Used in: ${pages.join(', ')}\n`);
}

// Also list all images that DO exist
console.log('── Images present in folder ──────────────────────');
const imgFiles = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(f));
for (const img of imgFiles) {
  console.log(`  ✅ ${img}`);
}
