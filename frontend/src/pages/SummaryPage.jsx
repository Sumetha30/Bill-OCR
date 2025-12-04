import React from 'react';

export default function SummaryPage({ state }) {
  const summary = state.summary || [];
  if (!summary.length) return <div className="card"><h3>No summary computed</h3><div className="hint">Run compute summary from Split page first.</div></div>;

  const total = summary.reduce((s,c)=>s+c.total,0);
  const mean = Math.round((total / summary.length) * 100)/100;

  return (
    <div className="card">
      <h3>Summary</h3>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div className="hint">Total split among {summary.length} people</div>
        <div style={{fontWeight:900,fontSize:18,color:'var(--primary)'}}>₹{Math.round(total*100)/100}</div>
      </div>

      <div className="items-list">
        {summary.map((s,i)=>(
          <div key={i} className="item-row">
            <div className="item-left">
              <div className="item-handle">{i+1}</div>
              <div><div style={{fontWeight:800}}>{s.name}</div><div className="hint" style={{fontSize:12}}>Suggested total</div></div>
            </div>
            <div style={{fontWeight:800,color:'#0f62fe'}}>₹{s.total}</div>
          </div>
        ))}
      </div>

      <div style={{marginTop:12}}>
        <div className="hint">Settlement tip: ask highest debtors to pay first, or integrate a payments flow later.</div>
      </div>
    </div>
  );
}
