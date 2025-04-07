const fs = require('fs');
const path = require('path');

// Create public/images directory if it doesn't exist
const publicImagesDir = path.join(process.cwd(), 'public', 'images');
if (!fs.existsSync(publicImagesDir)) {
  fs.mkdirSync(publicImagesDir, { recursive: true });
}

// Path to leaflet images in node_modules
const leafletImagesDir = path.join(process.cwd(), 'node_modules', 'leaflet', 'dist', 'images');

// Copy marker images
const imagesToCopy = [
  'marker-icon.png',
  'marker-icon-2x.png',
  'marker-shadow.png'
];

imagesToCopy.forEach(image => {
  const sourcePath = path.join(leafletImagesDir, image);
  const destPath = path.join(publicImagesDir, image);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${image} to public/images`);
  } else {
    console.error(`Could not find ${image} in leaflet package`);
  }
}); 