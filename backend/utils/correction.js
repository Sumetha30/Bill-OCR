// simple heuristics to clean OCR and extract lines with name + price
function normalizeNumberToken(tok) {
  if (!tok) return null;
  // Remove currency symbols and whitespace
  let s = tok.replace(/[^\dOoSsb\.\,]/g, '');
  // replace O or o with 0 if likely number
  s = s.replace(/[Oo]/g, '0');
  // sometimes S or s is misread for 5
  s = s.replace(/[Ss]/g, '5');
  // replace commas with nothing, strip stray dots except decimal
  s = s.replace(/,/g, '');
  // remove trailing non-digit
  s = s.match(/[\d]+(\.[\d]{1,2})?/)?.[0] || null;
  if (s) return parseFloat(s);
  return null;
}

function extractPotentialPairs(lines) {
  const items = [];
  for (let raw of lines) {
    if (!raw || raw.trim().length === 0) continue;
    // heuristics: extract last token that is a number-like.
    const parts = raw.trim().split(/\s+/);
    // try last 1-2 tokens as price
    let price = null;
    for (let i = 1; i <= 2; i++) {
      const tok = parts[parts.length - i];
      const n = normalizeNumberToken(tok);
      if (n !== null && !isNaN(n)) { price = n; break; }
    }
    // name is rest
    const nameParts = price !== null ? parts.slice(0, parts.length - 1) : parts;
    const name = nameParts.join(' ').replace(/[^a-zA-Z0-9 \-]/g, '').trim();
    if (price !== null) {
      items.push({ name: name || 'Item', price: Math.round(price * 100) / 100 });
    } else {
      // Could be description-only; try to find number inside
      const m = raw.match(/(\d+[\.,]?\d{0,2})/);
      if (m) {
        const n = normalizeNumberToken(m[1]);
        if (n !== null) items.push({ name: name || 'Item', price: Math.round(n * 100) / 100 });
      }
    }
  }
  return items;
}

function smartCorrectAndExtract(rawText) {
  // split by newlines, filter out short garbage
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // try to find lines near "total" and ignore header rows like TAX etc later
  const candidates = extractPotentialPairs(lines);

  // if nothing found, try splitting by punctuation
  if (candidates.length === 0) {
    const alt = rawText.split(/[\r\n,;]+/);
    return extractPotentialPairs(alt);
  }

  // Filter out possible header totals repeated by finding duplicates with 'total' or too large prices maybe keep
  return candidates;
}

module.exports = { smartCorrectAndExtract };
