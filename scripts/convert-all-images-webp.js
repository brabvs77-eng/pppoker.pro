import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mediaPath = path.join(__dirname, '../assets/media');
let convertedCount = 0;
let skippedCount = 0;
let errorCount = 0;

async function convertImage(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    
    // Skip if already WebP or SVG
    if (ext === '.webp' || ext === '.svg') {
      skippedCount++;
      return;
    }

    // Only convert PNG and JPG
    if (!['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) {
      skippedCount++;
      return;
    }

    const webpPath = filePath.replace(/\.[^.]+$/, '.webp');
    
    // Skip if WebP already exists
    if (fs.existsSync(webpPath)) {
      skippedCount++;
      return;
    }

    // Read original file size
    const originalSize = fs.statSync(filePath).size;
    
    // Convert to WebP
    await sharp(filePath)
      .webp({ quality: 80 })
      .toFile(webpPath);

    const webpSize = fs.statSync(webpPath).size;
    const saved = ((1 - webpSize / originalSize) * 100).toFixed(1);
    
    console.log(`✓ ${path.basename(filePath)} → ${path.basename(webpPath)} (${saved}% saved)`);
    convertedCount++;

  } catch (error) {
    console.error(`✗ Error converting ${filePath}:`, error.message);
    errorCount++;
  }
}

async function findAndConvertImages(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await findAndConvertImages(filePath);
    } else {
      await convertImage(filePath);
    }
  }
}

async function main() {
  console.log('Starting image conversion to WebP...\n');
  
  try {
    await findAndConvertImages(mediaPath);
    
    console.log('\n========== CONVERSION COMPLETE ==========');
    console.log(`✓ Converted: ${convertedCount} images`);
    console.log(`⊘ Skipped: ${skippedCount} images`);
    console.log(`✗ Errors: ${errorCount} images`);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
