import React, { useState, useRef } from "react";
import axios from "axios";

export default function UploadPage({ onNext }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const clear = () => {
    setFile(null);
    setPreview(null);
    inputRef.current.value = "";
  };

  const submit = async () => {
    if (!file) return alert("Please choose an image");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("http://localhost:8000/ocr-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });

      const text = res.data.text || "";
      console.log("OCR TEXT:", text);

      // very small, robust parser to capture lines with trailing numbers
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
      const ignoreWords = ["total","subtotal","gst","tax","amount","thank","balance","cashier","service","charge"];
      const items = [];
      for (const line of lines) {
        const lower = line.toLowerCase();
        if (ignoreWords.some(w => lower.includes(w))) continue;
        const m = line.match(/(\d{1,9}(?:\.\d{1,2})?)\s*$/);
        if (!m) continue;
        const price = parseFloat(m[1].replace(/[^\d.]/g,""));
        if (isNaN(price) || price <= 0) continue;
        const name = line.replace(m[0],"").trim();
        if (!name) continue;
        items.push({ name, price, assigned: [] });
      }

      onNext(items);
    } catch (err) {
      console.error(err);
      alert("OCR failed. Try a clearer image or crop to the bill only.");
    }

    setLoading(false);
  };

  return (
    <div className="card upload-card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div>
          <h3 style={{margin:'0 0 6px'}}>Upload bill photo</h3>
          <div className="hint">Use phone camera for best results. Crop tightly to the bill.</div>
        </div>
        <div className="room-badge">Live OCR</div>
      </div>

      <div className="upload-grid">
        <div className="upload-left">
          <div className="preview-box">
            {preview ? (
              <img src={preview} alt="preview" />
            ) : (
              <div className="center" style={{flexDirection:'column',gap:8}}>
                <div style={{fontWeight:800,color:'#9aa7c7'}}>No image selected</div>
                <div className="hint">Drop or choose an image</div>
              </div>
            )}
          </div>

          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
            <div className="upload-controls">
              <label className="file-input primary-btn" style={{cursor:'pointer'}}>
                Choose file
                <input ref={inputRef} onChange={handleFile} type="file" accept="image/*" style={{display:'none'}} />
              </label>
              <button className="ghost-btn" onClick={clear}>Clear</button>
            </div>

            <div>
              <button className="primary-btn" onClick={submit} disabled={loading}>
                {loading ? <>Running OCR <span className="spinner"/></> : "Run OCR & Next"}
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="card summary-card">
            <h4 style={{marginTop:0}}>Quick Tips</h4>
            <ul style={{color:'#475569',lineHeight:1.6}}>
              <li>Crop tightly to the receipt — remove background.</li>
              <li>Try phone camera, good lighting, no glare.</li>
              <li>For typed/large fonts OCR is highly accurate.</li>
              <li>If OCR fails, use the OCR page to edit items manually.</li>
            </ul>

            <div style={{marginTop:12}}>
              <strong>Demo image:</strong>
              <div className="hint" style={{marginTop:6}}>Using sample: <code>/mnt/data/a111082e-7b56-4060-9f6f-26c47e5fdc9e.png</code></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
