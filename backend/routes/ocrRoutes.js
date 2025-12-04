const express = require('express');
const router = express.Router();
const { processImage } = require('../controllers/ocrController');

router.post('/', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'No image provided' });
    const items = await processImage(imageBase64);
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OCR failed' });
  }
});

module.exports = router;
