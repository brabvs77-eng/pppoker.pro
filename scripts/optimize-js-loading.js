const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

console.log('Starting JavaScript optimization...\n');

// Find all HTML files
const htmlFiles = globSync('./!(.git|node_modules)/**/*.html', {
  absolute: true
});

let totalModified = 0;
let deferAdded = 0;
let asyncAdded = 0;

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;

  // Skip inline scripts
  const lines = content.split('\n');
  const modifiedLines = lines.map(line => {
    // Skip if already has defer or async
    if (line.includes('defer') || line.includes('async')) {
      return line;
    }

    // Add defer to external script tags (except analytics)
    if (line.includes('<script') && line.includes('src=') && !line.includes('</script>')) {
      // Don't defer analytics scripts as they need to run early
      if (line.includes('metrika') || line.includes('facebook') || line.includes('gtag')) {
        return line;
      }
      
      // Add defer to other scripts
      if (!line.includes('defer')) {
        return line.replace('<script', '<script defer');
      }
    }

    return line;
  });

  content = modifiedLines.join('\n');

  // Count changes
  const addedDefer = (content.match(/defer/g) || []).length - (originalContent.match(/defer/g) || []).length;
  if (addedDefer > 0) {
    deferAdded += addedDefer;
    totalModified++;
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ ${path.relative(process.cwd(), file)}: Added ${addedDefer} defer attributes`);
  }
});

console.log(`\n========================================`);
console.log(`HTML files modified: ${totalModified}`);
console.log(`Defer attributes added: ${deferAdded}`);
console.log(`========================================\n`);
