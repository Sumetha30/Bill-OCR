import React, { useState, useEffect } from 'react';
import UploadPage from './pages/UploadPage';
import OCRPage from './pages/OCRPage';
import SplitPage from './pages/SplitPage';
import SummaryPage from './pages/SummaryPage';
import { socket } from './socket';

export default function App() {
  const [roomId, setRoomId] = useState(null);
  const [page, setPage] = useState('upload'); // upload, ocr, split, summary
  const [state, setState] = useState({ items: [], people: [] });

  useEffect(() => {
    socket.connect();
    socket.on('state', s => {
      setState(s || { items: [], people: [] });
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const joinRoom = (id) => {
    setRoomId(id);
    socket.emit('join_group', id);
    setPage('upload');
  };

  const updateState = (newState) => {
    setState(newState);
    socket.emit('update_state', { roomId, state: newState });
  };

  return (
    <div className="app">
      <header className="app-header">Smart Bill Split</header>

      {!roomId ? (
        <div className="center-card">
          <h2>Create or join a room</h2>
          <div className="row">
            <button onClick={() => joinRoom(Math.random().toString(36).slice(2,8))}>Create Room</button>
            <input placeholder="Enter room id" id="room-input"/>
            <button onClick={() => {
              const v = document.getElementById('room-input').value.trim();
              if (v) joinRoom(v);
            }}>Join</button>
          </div>
          <p className="hint">Share the room id with friends to collaborate in real-time.</p>
        </div>
      ) : (
        <div className="container">
          <div className="room-bar">
            <div>Room: <strong>{roomId}</strong></div>
            <div className="nav">
              <button onClick={() => setPage('upload')}>Upload</button>
              <button onClick={() => setPage('ocr')}>OCR</button>
              <button onClick={() => setPage('split')}>Split</button>
              <button onClick={() => setPage('summary')}>Summary</button>
            </div>
          </div>

          {page === 'upload' && (
            <UploadPage onNext={(items) => { updateState({ ...state, items }); setPage('split'); }} />
          )}
          {page === 'ocr' && (
            <OCRPage state={state} updateState={updateState} />
          )}
          {page === 'split' && (
            <SplitPage state={state} updateState={updateState} setPage={setPage} />
          )}
          {page === 'summary' && (
            <SummaryPage state={state} />
          )}
        </div>
      )}
      <footer className="footer">Mobile-first demo • No login • Real-time</footer>
    </div>
  );
}
