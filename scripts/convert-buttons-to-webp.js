const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceDir = './assets/media/2024/07';
const fileName = 'but-back.png';
const sourcePath = path.join(sourceDir, fileName);

// Размеры, которые нужны
const sizes = [
  { width: 150, height: 118, suffix: '150x118' },
  { width: 250, height: 118, suffix: '250x118' },
  { width: 300, height: 96, suffix: '300x96' },
  // Оригинальный размер
  { width: null, height: null, suffix: 'original' }
];

async function convertToWebP() {
  try {
    console.log(`Converting ${fileName} to WebP formats...`);
    
    for (const size of sizes) {
      const outputFileName = size.suffix === 'original' 
        ? 'but-back.webp' 
        : `but-back-${size.suffix}.webp`;
      const outputPath = path.join(sourceDir, outputFileName);

      let transform = sharp(sourcePath);
      
      if (size.width && size.height) {
        transform = transform.resize(size.width, size.height, {
          fit: 'cover',
          position: 'center'
        });
      }

      await transform
        .webp({ quality: 80 })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      console.log(`✓ Created: ${outputFileName} (${stats.size} bytes)`);
    }

    console.log('\nAll WebP files created successfully!');
  } catch (error) {
    console.error('Error converting images:', error.message);
    process.exit(1);
  }
}

convertToWebP();
