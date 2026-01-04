/**
 * Script to create placeholder test images for the AI testing framework
 * This creates simple colored rectangles with text labels as placeholders
 * In a real implementation, you would replace these with actual test images
 */

const fs = require('fs');
const path = require('path');

// Simple function to create a placeholder image data URL
function createPlaceholderImage(width, height, color, text) {
  // This is a minimal SVG that can be saved as a file
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${color}"/>
    <text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
  </svg>`;
  return svg;
}

// Test image configurations
const testImages = [
  // Portraits
  { path: 'portraits/happy-person.jpg', color: '#FFD700', text: 'Happy Person' },
  { path: 'portraits/contemplative.jpg', color: '#4682B4', text: 'Contemplative' },
  { path: 'portraits/emotional.jpg', color: '#DC143C', text: 'Emotional' },
  { path: 'portraits/professional.jpg', color: '#2F4F4F', text: 'Professional' },
  { path: 'portraits/shadowed.jpg', color: '#191970', text: 'Shadowed' },
  
  // Abstract
  { path: 'abstract/colorful-swirls.jpg', color: '#FF69B4', text: 'Colorful Swirls' },
  { path: 'abstract/geometric.jpg', color: '#32CD32', text: 'Geometric' },
  { path: 'abstract/chaotic.jpg', color: '#8B0000', text: 'Chaotic' },
  { path: 'abstract/watercolor.jpg', color: '#20B2AA', text: 'Watercolor' },
  { path: 'abstract/dark-void.jpg', color: '#000000', text: 'Dark Void' },
  
  // Nature
  { path: 'nature/forest-path.jpg', color: '#228B22', text: 'Forest Path' },
  { path: 'nature/calm-lake.jpg', color: '#4169E1', text: 'Calm Lake' },
  { path: 'nature/stormy-sky.jpg', color: '#696969', text: 'Stormy Sky' },
  { path: 'nature/mountain-peak.jpg', color: '#A0522D', text: 'Mountain Peak' },
  { path: 'nature/withered-tree.jpg', color: '#8B4513', text: 'Withered Tree' },
  
  // Objects
  { path: 'objects/vintage-key.jpg', color: '#DAA520', text: 'Vintage Key' },
  { path: 'objects/candle.jpg', color: '#FFA500', text: 'Candle' },
  { path: 'objects/broken-mirror.jpg', color: '#C0C0C0', text: 'Broken Mirror' },
  { path: 'objects/compass.jpg', color: '#B8860B', text: 'Compass' },
  { path: 'objects/hourglass.jpg', color: '#F4A460', text: 'Hourglass' }
];

// Create directories and placeholder images
const baseDir = path.join(__dirname, '../../public/test-images');

testImages.forEach(({ path: imagePath, color, text }) => {
  const fullPath = path.join(baseDir, imagePath);
  const dir = path.dirname(fullPath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Create SVG placeholder
  const svg = createPlaceholderImage(400, 300, color, text);
  
  // Save as SVG file (change extension to .svg for now)
  const svgPath = fullPath.replace('.jpg', '.svg');
  fs.writeFileSync(svgPath, svg);
  
  console.log(`Created placeholder: ${svgPath}`);
});

console.log('\nPlaceholder test images created successfully!');
console.log('Note: These are SVG placeholders. In production, replace with actual test images.');
