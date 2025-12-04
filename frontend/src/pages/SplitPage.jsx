import React, { useState } from 'react';

export default function SplitPage({ state, updateState, setPage }) {
  const [personName, setPersonName] = useState('');
  const items = state.items || [];
  const people = state.people || [];

  const addPerson = () => {
    const name = personName.trim();
    if (!name) return;
    const newPeople = [...people, { name }];
    updateState({ ...state, people: newPeople });
    setPersonName('');
  };

  const toggleAssign = (itemIdx, personIdx) => {
    const newItems = state.items.map((it) => ({ ...it }));
    if (!newItems[itemIdx].assigned) newItems[itemIdx].assigned = [];
    const assigned = newItems[itemIdx].assigned;
    const pIndex = assigned.indexOf(personIdx);
    if (pIndex === -1) assigned.push(personIdx); else assigned.splice(pIndex,1);
    updateState({ ...state, items: newItems });
  };

  const autoSplitEven = () => {
    if (people.length === 0) return alert('Add people first');
    const newItems = items.map(it => ({ ...it, assigned: people.map((p, idx)=>idx) }));
    updateState({ ...state, items: newItems });
  };

  const computeSummary = () => {
    if (people.length === 0) return alert('Add at least one person');
    const totals = Array(people.length).fill(0);
    items.forEach(it => {
      const assigned = it.assigned && it.assigned.length ? it.assigned : [];
      const share = assigned.length ? (it.price / assigned.length) : 0;
      assigned.forEach(a => totals[a] += share);
    });
    const summary = people.map((p, idx) => ({ name: p.name, total: Math.round((totals[idx]||0)*100)/100 }));
    updateState({ ...state, summary });
    setPage('summary');
  };

  return (
    <div className="card">
      <h3>Assign Items to People</h3>

      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:10}}>
        <input placeholder="Person name" value={personName} onChange={e=>setPersonName(e.target.value)} style={{padding:10,borderRadius:8,border:'1px solid rgba(0,0,0,0.06)'}} />
        <button className="primary-btn" onClick={addPerson}>Add</button>
        <button className="ghost-btn" onClick={autoSplitEven}>Auto split evenly</button>
      </div>

      <div className="people-list" style={{marginBottom:12}}>
        {people.map((p, idx)=><div key={idx} className="pill">{p.name}</div>)}
        {!people.length && <div className="hint">No people yet — add names to assign items.</div>}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {items.map((it,i)=>(
          <div className="item-row" key={i}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div className="item-handle">{i+1}</div>
              <div style={{minWidth:220}}><div style={{fontWeight:800}}>{it.name}</div></div>
            </div>

            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{minWidth:90,textAlign:'right',fontWeight:800,color:'#0f62fe'}}>₹{it.price}</div>
              <div className="assign">
                {people.length ? people.map((p,pi)=> {
                  const isAssigned = (it.assigned||[]).includes(pi);
                  return <button key={pi} className={isAssigned ? 'assigned' : ''} onClick={()=>toggleAssign(i,pi)}>{p.name}</button>
                }) : <div className="hint">Add people to assign</div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{marginTop:14,display:'flex',gap:8}}>
        <button className="primary-btn" onClick={computeSummary}>Compute Summary</button>
        <button className="ghost-btn" onClick={()=>setPage('ocr')}>Back to OCR</button>
      </div>
    </div>
  );
}
