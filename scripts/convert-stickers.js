const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const stickersDir = path.join(__dirname, '../public/stickers');
const svgFiles = fs.readdirSync(stickersDir).filter(file => file.endsWith('.svg'));

async function convertSvgToPng() {
  for (const svgFile of svgFiles) {
    const svgPath = path.join(stickersDir, svgFile);
    const pngPath = path.join(stickersDir, svgFile.replace('.svg', '.png'));
    
    try {
      await sharp(svgPath)
        .resize(512, 512)
        .png()
        .toFile(pngPath);
      
      console.log(`Converted ${svgFile} to PNG`);
    } catch (error) {
      console.error(`Error converting ${svgFile}:`, error);
    }
  }
}

convertSvgToPng(); 