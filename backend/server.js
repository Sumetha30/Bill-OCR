const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const ocrRoutes = require('./routes/ocrRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' }
});

// simple in-memory rooms storage
const rooms = {}; // { roomId: { items: [], people: [] } }

io.on('connection', socket => {
  console.log('socket connected', socket.id);

  socket.on('join_group', roomId => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = { items: [], people: [] };
    // send current state
    socket.emit('state', rooms[roomId]);
  });

  socket.on('update_state', ({ roomId, state }) => {
    rooms[roomId] = state;
    socket.to(roomId).emit('state', rooms[roomId]);
  });

  socket.on('disconnect', () => {
    // optional: cleanup logic
  });
});

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

app.use('/api/ocr', ocrRoutes);

app.get('/', (req, res) => res.send('Bill Split Backend is running'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
