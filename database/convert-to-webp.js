const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const directories = [
  path.join(__dirname, '..', 'src', 'assets', 'cards'),
  path.join(__dirname, '..', 'asset')
];

async function convertDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      const baseName = path.basename(file, ext);
      const inputPath = path.join(dir, file);
      const outputPath = path.join(dir, `${baseName}.webp`);

      const inputStat = fs.statSync(inputPath);
      // Neu da co file webp va thoi gian sua sau thi bo qua
      if (fs.existsSync(outputPath)) {
        const outputStat = fs.statSync(outputPath);
        if (outputStat.mtimeMs >= inputStat.mtimeMs) {
          console.log(`[Skip] Already converted: ${file}`);
          continue;
        }
      }

      try {
        await sharp(inputPath)
          .webp({ quality: 85, effort: 4 })
          .toFile(outputPath);
        const outputStat = fs.statSync(outputPath);
        const savedPercent = Math.round((1 - outputStat.size / inputStat.size) * 100);
        console.log(`[Converted] ${file} -> ${baseName}.webp (${Math.round(inputStat.size/1024)}KB -> ${Math.round(outputStat.size/1024)}KB, -${savedPercent}%)`);
      } catch (err) {
        console.error(`[Error] Failed to convert ${file}:`, err.message);
      }
    }
  }
}

async function main() {
  console.log('--- START CONVERTING IMAGES TO WEBP ---');
  for (const d of directories) {
    console.log(`Processing directory: ${d}`);
    await convertDir(d);
  }
  console.log('--- CONVERSION COMPLETED ---');
}

main();
