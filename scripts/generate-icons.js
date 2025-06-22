const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ensure the output directory exists
const outputDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Input SVG file
const inputFile = path.join(outputDir, 'PTJ SVG.svg');

// Output sizes and filenames
const sizes = [
  { width: 192, filename: 'icon-192x192.png' },
  { width: 512, filename: 'icon-512x512.png' },
  { width: 180, filename: 'apple-touch-icon.png' },
  { width: 16, filename: 'favicon.ico' },
];

async function generateIcons() {
  try {
    // Generate each icon size
    await Promise.all(sizes.map(async ({ width, filename }) => {
      const outputFile = path.join(outputDir, filename);
      await sharp(inputFile)
        .resize(width, width, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toFile(outputFile);
      console.log(`Generated ${filename} (${width}x${width})`);
    }));
    
    console.log('\nAll icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
