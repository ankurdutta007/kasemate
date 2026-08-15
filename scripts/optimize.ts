import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function optimizeImage(inputPath: string, isSquare: boolean) {
  const outputPath = inputPath.replace(/\.[^/.]+$/, ".webp");
  const originalSize = fs.statSync(inputPath).size;

  let image = sharp(inputPath);
  
  if (isSquare) {
    image = image.resize(240, 240, { fit: 'cover' });
  } else {
    image = image.resize({ height: 400 });
  }

  // Convert to WebP and ensure size is under 150KB (150 * 1024 bytes)
  let quality = 80;
  let optimizedBuffer = await image.webp({ quality }).toBuffer();
  
  while (optimizedBuffer.length > 150 * 1024 && quality > 10) {
    quality -= 10;
    optimizedBuffer = await image.webp({ quality }).toBuffer();
  }

  fs.writeFileSync(outputPath, optimizedBuffer);
  const optimizedSize = fs.statSync(outputPath).size;

  console.log(`${path.basename(inputPath)}: ${(originalSize / 1024).toFixed(2)} KB -> ${(optimizedSize / 1024).toFixed(2)} KB`);
  
  // Remove original
  fs.unlinkSync(inputPath);
}

async function run() {
  const dir = path.join(process.cwd(), 'src/imports');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));

  for (const file of files) {
    const isSquare = file.includes('avatar');
    await optimizeImage(path.join(dir, file), isSquare);
  }
}

run().catch(console.error);
