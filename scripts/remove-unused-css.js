#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// CSS files to remove from HTML (not used in any widget)
const unusedCSSPatterns = [
  'widget-carousel-module-base.min.css',
  'widget-mega-menu.min.css',
  'widget-testimonial-carousel.min.css'
];

const htmlFiles = [];
let removedCount = 0;

// Find all HTML files
function findHtmlFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('.git')) {
      findHtmlFiles(fullPath);
    } else if (file.endsWith('.html')) {
      htmlFiles.push(fullPath);
    }
  }
}

findHtmlFiles('.');

console.log(`Found ${htmlFiles.length} HTML files\n`);

for (const htmlFile of htmlFiles) {
  let content = fs.readFileSync(htmlFile, 'utf-8');
  const originalLength = content.length;
  
  for (const pattern of unusedCSSPatterns) {
    const regex = new RegExp(`<link[^>]*href="[^"]*${pattern}"[^>]*>\\s*`, 'g');
    const matches = content.match(regex) || [];
    if (matches.length > 0) {
      content = content.replace(regex, '');
      console.log(`Removed ${matches.length} unused CSS link(s) from ${path.basename(htmlFile)}`);
      removedCount += matches.length;
    }
  }
  
  if (content.length !== originalLength) {
    fs.writeFileSync(htmlFile, content);
  }
}

console.log(`\nTotal unused CSS links removed: ${removedCount}`);
