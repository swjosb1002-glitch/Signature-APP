const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure images directory exists
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

app.use(express.static(__dirname));
app.use('/images', express.static(imagesDir));

// Multer memory storage for processing via Sharp
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg','image/png','image/gif','image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

app.post('/upload-photo', (req, res) => {
  const single = upload.single('photo');
  single(req, res, async (err) => {
    try {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ error: 'File too large. Max 10MB.' });
        }
        return res.status(400).json({ error: err.message || 'Upload error' });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const size = 400; // enforce fixed edited image size

      const origName = path.basename(req.file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
      const base = path.basename(origName, path.extname(origName)).slice(0, 40) || 'photo';
      const filename = `${base}-${Date.now()}.png`;
      const outPath = path.join(imagesDir, filename);

      const circleMask = Buffer.from(
        `<svg width="${size}" height="${size}">
           <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="#ffffff"/>
         </svg>`
      );

      // Create a solid border ring (8px) around the circle
      const strokeWidth = 8;
      const ringSvg = Buffer.from(
        `<svg width="${size}" height="${size}">
           <circle cx="${size/2}" cy="${size/2}" r="${size/2 - strokeWidth/2}" fill="none" stroke="#39afd7" stroke-width="${strokeWidth}" />
         </svg>`
      );
      const ringBuf = await sharp(ringSvg).png().toBuffer();

      await sharp(req.file.buffer)
        .rotate() // respect EXIF orientation
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .composite([
          { input: circleMask, blend: 'dest-in' }, // make image circular
          { input: ringBuf, blend: 'over' }        // add blurred border on top
        ])
        .png({ compressionLevel: 9 })
        .toFile(outPath);

      const url = `/images/${filename}`;
      return res.json({ url, size });
    } catch (e) {
      console.error('Upload processing error:', e);
      return res.status(500).json({ error: 'Image processing failed' });
    }
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'signature-builder.html'));
});

app.listen(PORT, () => {
  console.log(`Signature Builder running at http://localhost:${PORT}/`);
});