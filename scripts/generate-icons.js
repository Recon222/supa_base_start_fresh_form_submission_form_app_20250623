/**
 * PWA Icon Generator
 * Generates all required icon sizes from source SVG
 *
 * Prerequisites:
 *   npm install sharp
 *
 * Usage:
 *   node scripts/generate-icons.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SOURCE_SVG = path.join(__dirname, '../assets/images/homicide-logo-300x300.svg');
const OUTPUT_DIR = path.join(__dirname, '../assets/images/icons');

// Icon sizes for iOS, Windows, and Desktop PWA
const ICON_SIZES = [16, 32, 144, 152, 180, 192, 512];

async function generateIcons() {
  console.log('PWA Icon Generator');
  console.log('==================');
  console.log('Source:', SOURCE_SVG);
  console.log('Output:', OUTPUT_DIR);
  console.log('');

  // Verify source exists
  if (!fs.existsSync(SOURCE_SVG)) {
    console.error('ERROR: Source SVG not found:', SOURCE_SVG);
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log('Created output directory');
  }

  // Read source SVG
  const svgBuffer = fs.readFileSync(SOURCE_SVG);
  console.log('Loaded source SVG (' + svgBuffer.length + ' bytes)');
  console.log('');

  // Generate icons
  console.log('Generating icons...');
  for (const size of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);

    try {
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 10, g: 10, b: 10, alpha: 1 } // #0a0a0a
        })
        .png()
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      console.log(`  [OK] icon-${size}x${size}.png (${stats.size} bytes)`);
    } catch (error) {
      console.error(`  [FAIL] icon-${size}x${size}.png: ${error.message}`);
    }
  }

  console.log('');
  console.log('Icon generation complete!');
  console.log('Output directory:', OUTPUT_DIR);

  // List generated files
  console.log('');
  console.log('Generated files:');
  const files = fs.readdirSync(OUTPUT_DIR);
  files.forEach(file => {
    const filePath = path.join(OUTPUT_DIR, file);
    const stats = fs.statSync(filePath);
    console.log(`  - ${file} (${stats.size} bytes)`);
  });
}

generateIcons().catch(error => {
  console.error('Icon generation failed:', error);
  process.exit(1);
});
