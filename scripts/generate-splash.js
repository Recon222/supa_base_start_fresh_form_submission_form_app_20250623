/**
 * PWA iOS Splash Screen Generator
 * Generates splash screen for iPhone 16 Pro
 *
 * Prerequisites:
 *   npm install sharp
 *
 * Usage:
 *   node scripts/generate-splash.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SOURCE_SVG = path.join(__dirname, '../assets/images/homicide-logo-300x300.svg');
const OUTPUT_DIR = path.join(__dirname, '../assets/images/splash');

async function generateSplash() {
  console.log('PWA iOS Splash Screen Generator');
  console.log('================================');
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

  // iPhone 16 Pro: 1206 x 2622 (portrait)
  const width = 1206;
  const height = 2622;
  const logoSize = 400; // Logo size in splash

  console.log(`Target: iPhone 16 Pro (${width}x${height})`);
  console.log('');

  try {
    // Read and resize logo
    console.log('Processing logo...');
    const logo = await sharp(SOURCE_SVG)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 10, g: 10, b: 10, alpha: 0 }
      })
      .png()
      .toBuffer();

    console.log(`  Logo resized to ${logoSize}x${logoSize}`);

    // Create splash with centered logo
    console.log('Creating splash screen...');
    const outputPath = path.join(OUTPUT_DIR, 'splash-1206x2622.png');

    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 10, g: 10, b: 10, alpha: 1 } // #0a0a0a
      }
    })
      .composite([{
        input: logo,
        left: Math.floor((width - logoSize) / 2),
        top: Math.floor((height - logoSize) / 2) - 100 // Slightly above center
      }])
      .png()
      .toFile(outputPath);

    const stats = fs.statSync(outputPath);
    console.log(`  [OK] splash-1206x2622.png (${stats.size} bytes)`);

    console.log('');
    console.log('Splash screen generation complete!');
    console.log('Output:', outputPath);

  } catch (error) {
    console.error('Splash generation failed:', error);
    process.exit(1);
  }
}

generateSplash().catch(error => {
  console.error('Splash generation failed:', error);
  process.exit(1);
});
