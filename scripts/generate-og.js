import sharp from 'sharp';
import fs from 'fs';

async function generateOG() {
  const width = 1200;
  const height = 630;

  const bgPath = 'public/assets/sequence/ezgif-frame-150.png';
  if (!fs.existsSync(bgPath)) {
    console.error(`ERROR: Required background asset missing: ${bgPath}`);
    process.exit(1);
  }

  // Background frame
  const bg = await sharp(bgPath)
    .resize(width, height, { fit: 'cover' })
    .toBuffer();

  const svgText = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#bff205" />
          <stop offset="100%" stop-color="#00e5ff" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="rgba(17, 18, 16, 0.7)" />
      
      <text x="80" y="280" font-family="sans-serif" font-weight="bold" font-size="85" fill="#ffffff">Neel Shingavi</text>
      <text x="80" y="380" font-family="sans-serif" font-size="45" fill="#a0a0a0">Product Engineer | Backend Systems | AI Analytics</text>
      
      <line x1="80" y1="460" x2="200" y2="460" stroke="url(#grad1)" stroke-width="6" />
    </svg>
  `;

  await sharp(bg)
    .composite([
      { input: Buffer.from(svgText), blend: 'over' }
    ])
    .jpeg({ quality: 90 })
    .toFile('public/og-image.jpg');

  console.log('OG image generated: public/og-image.jpg');
}

generateOG().catch((err) => {
  console.error('ERROR: OG image generation failed:', err);
  process.exit(1);
});
