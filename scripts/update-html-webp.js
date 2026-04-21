const fs = require('fs');
const path = require('path');
const glob = require('glob');

const htmlFiles = glob.sync('**/*.html', { ignore: 'node_modules/**' });

let totalReplacements = 0;

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let replacements = 0;

  // Replace PNG references
  const pngRegex = /(["\'])([^"']*\.png)(["\'])/gi;
  content = content.replace(pngRegex, (match, quote1, path, quote2) => {
    // Skip if it's already webp or data URI
    if (path.includes('.webp') || path.includes('data:')) return match;
    replacements++;
    return `${quote1}${path.replace(/\.png$/i, '.webp')}${quote2}`;
  });

  // Replace JPG/JPEG references
  const jpgRegex = /(["\'])([^"']*\.(jpg|jpeg))(["\'])/gi;
  content = content.replace(jpgRegex, (match, quote1, filePath, ext, quote2) => {
    // Skip if already webp
    if (filePath.includes('.webp')) return match;
    replacements++;
    return `${quote1}${filePath.replace(/\.(jpg|jpeg)$/i, '.webp')}${quote2}`;
  });

  if (replacements > 0) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ ${file}: ${replacements} replacements`);
    totalReplacements += replacements;
  }
});

console.log(`\n========== UPDATE COMPLETE ==========`);
console.log(`✓ Total replacements: ${totalReplacements}`);
console.log(`✓ Files updated: ${htmlFiles.length}`);
