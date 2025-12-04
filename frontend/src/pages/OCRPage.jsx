import React from 'react';

export default function OCRPage({ state, updateState }) {
  const items = state.items || [];

  const editPrice = (idx) => {
    const val = prompt('Enter price', items[idx].price);
    if (val === null) return;
    const p = parseFloat(val);
    if (isNaN(p)) return alert('Invalid number');
    const newItems = [...items];
    newItems[idx].price = Math.round(p * 100) / 100;
    updateState({ ...state, items: newItems });
  };

  const editName = (idx) => {
    const val = prompt('Enter item name', items[idx].name);
    if (val === null) return;
    const newItems = [...items];
    newItems[idx].name = val;
    updateState({ ...state, items: newItems });
  };

  const remove = (idx) => {
    if (!confirm('Remove this item?')) return;
    const newItems = items.filter((_,i)=>i!==idx);
    updateState({...state, items: newItems});
  };

  return (
    <div className="card">
      <h3>Extracted Items (Edit if needed)</h3>
      <div className="items-list">
        {items.length === 0 && <p className="hint">No items found. Try an upload with clearer text or crop tighter.</p>}
        {items.map((it,i)=>(
          <div className="item-row" key={i}>
            <div className="item-left">
              <div className="item-handle">{i+1}</div>
              <div>
                <div className="item-name">{it.name}</div>
                <div className="hint" style={{fontSize:12}}>{(it.assigned||[]).length ? `${it.assigned.length} people assigned` : 'Not assigned'}</div>
              </div>
            </div>

            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div className="item-price">₹{it.price}</div>
              <div style={{display:'flex',gap:8}}>
                <button className="small-btn" onClick={()=>editName(i)}>Edit name</button>
                <button className="small-btn" onClick={()=>editPrice(i)}>Edit price</button>
                <button className="small-btn" onClick={()=>remove(i)} style={{color:'#ef4444'}}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
