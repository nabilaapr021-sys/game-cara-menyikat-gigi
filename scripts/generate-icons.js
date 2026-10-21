import fs from 'fs';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function generatePNG(width, height) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw image data with scanline filter byte 0
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  const cx = width / 2;
  const cy = height / 2;
  const rTooth = width * 0.35;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const dx = (x - cx) / cx;
      const dy = (y - cy) / cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background gradient: Sky blue (#0284c7 to #38bdf8)
      let r = 14 + Math.floor((x / width) * 40);
      let g = 165 - Math.floor((y / height) * 35);
      let b = 233 + Math.floor((y / height) * 15);
      let a = 255;

      // Rounded tooth center
      const toothDist = Math.hypot(x - cx, y - cy * 1.05);
      if (toothDist < rTooth) {
        // Tooth white
        r = 255;
        g = 255;
        b = 255;
        // Tooth cute eyes
        const eye1Dist = Math.hypot(x - (cx - width * 0.1), y - (cy - height * 0.05));
        const eye2Dist = Math.hypot(x - (cx + width * 0.1), y - (cy - height * 0.05));
        if (eye1Dist < width * 0.035 || eye2Dist < width * 0.035) {
          r = 15; g = 23; b = 42; // dark eye
        }
        // Cute blush
        const blush1 = Math.hypot(x - (cx - width * 0.18), y - (cy + height * 0.03));
        const blush2 = Math.hypot(x - (cx + width * 0.18), y - (cy + height * 0.03));
        if (blush1 < width * 0.035 || blush2 < width * 0.035) {
          r = 251; g = 113; b = 133;
        }
        // Smile
        const smileY = cy + height * 0.08 + Math.pow((x - cx) / (width * 0.12), 2) * (height * 0.02);
        if (Math.abs(y - smileY) < height * 0.015 && Math.abs(x - cx) < width * 0.08) {
          r = 15; g = 23; b = 42;
        }
      }

      // Toothbrush bar across
      const brushLine = (x * 0.7 - y + cy * 0.8);
      if (Math.abs(brushLine) < height * 0.04 && x > width * 0.3 && x < width * 0.9) {
        r = 244; g = 63; b = 94; // coral handle
      }

      // Sparkle star at top right
      const sparkX = cx + width * 0.28;
      const sparkY = cy - height * 0.28;
      const dspX = Math.abs(x - sparkX);
      const dspY = Math.abs(y - sparkY);
      if ((dspX < width * 0.08 && dspY < width * 0.015) || (dspY < width * 0.08 && dspX < width * 0.015)) {
        r = 250; g = 204; b = 21; // yellow star
      }

      rawData[offset++] = Math.min(255, Math.max(0, r));
      rawData[offset++] = Math.min(255, Math.max(0, g));
      rawData[offset++] = Math.min(255, Math.max(0, b));
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync('public/pwa-192x192.png', generatePNG(192, 192));
fs.writeFileSync('public/pwa-512x512.png', generatePNG(512, 512));
fs.writeFileSync('public/pwa-maskable-512x512.png', generatePNG(512, 512));
fs.writeFileSync('public/apple-touch-icon.png', generatePNG(180, 180));
fs.writeFileSync('public/favicon.ico', generatePNG(48, 48));

console.log('PWA PNG icons generated successfully!');
