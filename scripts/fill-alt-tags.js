const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Generate alt text from filename and context
function generateAltText(filename, context) {
  // Remove extension and numbers
  let alt = filename
    .replace(/\.[^/.]+$/, '') // remove extension
    .replace(/-(\d+)x(\d+)(@2x)?$/, '') // remove dimensions like -300x200
    .replace(/-(\d{4})-(\d{2})-(\d{2})/, '') // remove date patterns
    .replace(/[-_]/g, ' ') // replace dashes/underscores with spaces
    .replace(/\d+/g, '') // remove remaining numbers
    .trim();

  // Capitalize words
  alt = alt
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Add context if available
  if (context) {
    if (alt.length === 0) alt = context;
    else if (!alt.toLowerCase().includes(context.toLowerCase())) {
      alt = `${context} - ${alt}`;
    }
  }

  // Clean up
  alt = alt.replace(/\s+/g, ' ').trim();
  return alt || 'Image';
}

// Process a single HTML file
function processHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Find all img tags and add alt if missing
  content = content.replace(/<img([^>]*)>/gi, (match, attrs) => {
    // Skip if already has meaningful alt
    if (/alt="[^"]+"/i.test(attrs) && !attrs.includes('alt=""')) {
      return match;
    }

    // Extract src
    const srcMatch = attrs.match(/src="([^"]+)"/i);
    if (!srcMatch) return match;

    const src = srcMatch[1];
    const filename = path.basename(src).split('?')[0]; // remove query params
    const alt = generateAltText(filename, extractContext(content, match));

    // Remove existing alt="" and add new alt
    let newAttrs = attrs.replace(/\s*alt="[^"]*"/gi, '');
    newAttrs = newAttrs.trim();

    modified = true;
    return `<img${newAttrs} alt="${alt}">`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  return modified;
}

// Extract context from surrounding content
function extractContext(content, imgTag) {
  const idx = content.indexOf(imgTag);
  const before = content.substring(Math.max(0, idx - 200), idx);
  const after = content.substring(idx, Math.min(content.length, idx + 200));

  // Look for surrounding text that might describe the image
  const contextMatch = (before + after).match(
    /<(h[1-6]|p|figcaption|span|div)[^>]*>([^<]+)<\/\1>/i
  );

  if (contextMatch && contextMatch[2]) {
    return contextMatch[2]
      .trim()
      .substring(0, 50)
      .replace(/\d+/g, '')
      .trim();
  }

  return '';
}

// Main execution
function main() {
  const pattern = './**/*.html';
  const files = glob.sync(pattern, { ignore: 'node_modules/**' });

  let totalProcessed = 0;
  let filesModified = 0;

  console.log(`Processing ${files.length} HTML files...`);

  files.forEach(filePath => {
    if (processHtmlFile(filePath)) {
      filesModified++;
      console.log(`✓ Updated: ${filePath}`);
    }
    totalProcessed++;
  });

  console.log(`\n✅ Complete!`);
  console.log(`Total files processed: ${totalProcessed}`);
  console.log(`Files modified: ${filesModified}`);
}

main();
