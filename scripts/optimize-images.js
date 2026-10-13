import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const seqDir = path.resolve('public/assets/sequence');

if (!fs.existsSync(seqDir)) {
  console.log('Sequence directory not found:', seqDir);
  process.exit(0);
}

const files = fs.readdirSync(seqDir).filter((f) => f.endsWith('.png'));

if (files.length === 0) {
  console.log('No PNG files found in sequence directory. All assets are already optimized.');
  process.exit(0);
}

console.log(`Optimizing ${files.length} sequence frames to WebP...`);

for (const file of files) {
  const src = path.join(seqDir, file);
  const dst = path.join(seqDir, file.replace('.png', '.webp'));
  try {
    execFileSync('cwebp', ['-q', '75', '-m', '4', src, '-o', dst], { stdio: 'ignore' });
    fs.unlinkSync(src);
  } catch (err) {
    console.error(`Failed to convert ${file}:`, err.message);
  }
}

console.log('Sequence optimization complete.');
