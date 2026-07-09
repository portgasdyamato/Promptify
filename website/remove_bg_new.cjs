const sharp = require('sharp');

async function processImage(filename) {
    try {
        const { data, info } = await sharp(filename)
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const alpha = Math.max(r, g, b);
            
            if (alpha === 0) {
                data[i + 3] = 0;
            } else {
                data[i] = Math.min(255, Math.floor((r * 255) / alpha));
                data[i + 1] = Math.min(255, Math.floor((g * 255) / alpha));
                data[i + 2] = Math.min(255, Math.floor((b * 255) / alpha));
                data[i + 3] = Math.min(255, Math.floor(alpha * 1.4));
            }
        }

        await sharp(data, {
            raw: {
                width: info.width,
                height: info.height,
                channels: 4,
            }
        }).toFile(filename + ".out.png");
        
        const fs = require('fs');
        fs.renameSync(filename + ".out.png", filename);
        console.log(`Processed ${filename}`);
    } catch (err) {
        console.error(`Error processing ${filename}:`, err.message);
    }
}

['public/new_asset1.png', 'public/new_asset2.png'].forEach(processImage);
