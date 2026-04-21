#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all HTML files
const htmlFiles = glob.sync('./**/*.html', { ignore: './node_modules/**' });

console.log(`Found ${htmlFiles.length} HTML files to process`);

let filesModified = 0;
let duplicatesRemoved = 0;

htmlFiles.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Remove duplicate Yandex Metrika initialization (the second one added by wp-yandex-metrika plugin)
    // Pattern: <script>...function(m,e,t,r,i,k,a)...ym("98592596"...)</script>
    const duplicatePattern = /<script type="text\/javascript">\s*\(function\s*\(m,\s*e,\s*t,\s*r,\s*i,\s*k,\s*a\)\s*\{[\s\S]*?mc\.yandex\.ru\/metrika\/tag\.js[\s\S]*?ym\("98592596"[\s\S]*?\}\)[\s\S]*?<\/script>/g;
    
    const matches = content.match(duplicatePattern);
    if (matches && matches.length > 0) {
      duplicatesRemoved += matches.length;
      content = content.replace(duplicatePattern, '');
      console.log(`  ✓ ${path.relative('.', file)}: Removed ${matches.length} duplicate metrika initialization(s)`);
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      filesModified++;
    }
  } catch (error) {
    console.error(`  ✗ Error processing ${file}:`, error.message);
  }
});

console.log(`\nSummary:`);
console.log(`  Files modified: ${filesModified}`);
console.log(`  Duplicate metrika instances removed: ${duplicatesRemoved}`);
