const Tesseract = require('tesseract.js');
const { smartCorrectAndExtract } = require('../utils/correction');

async function processImage(base64) {
  // base64: data:image/png;base64,....
  const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let buffer;
  if (matches) {
    buffer = Buffer.from(matches[2], 'base64');
  } else {
    buffer = Buffer.from(base64, 'base64');
  }

  // Use tesseract.js to recognize
  const worker = Tesseract.createWorker({
    logger: m => { /* optional logs */ }
  });

  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');

  const { data } = await worker.recognize(buffer);
  await worker.terminate();

  const rawText = data.text;
  // smart-correct and parse items
  const items = smartCorrectAndExtract(rawText);
  return items;
}

module.exports = { processImage };
