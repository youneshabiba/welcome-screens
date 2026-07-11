// server.js
// Patient welcome screen automation.
// - Reception uses /control to type a patient name and pick a room.
// - Each TV's browser stays open on /display?room=1 (etc) and updates live.
//
// State is kept in memory and mirrored to state.json so a screen that
// reloads (e.g. after a Fire Stick reboot) still shows the last name set.

const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');

const STATE_FILE = path.join(__dirname, 'state.json');

// Which rooms exist. Override with ROOMS="1,2,3,4" as an env var if you add rooms.
const ROOM_IDS = (process.env.ROOMS || '1,2,3').split(',').map(s => s.trim());

function loadState() {
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    ROOM_IDS.forEach(id => {
      if (!parsed[id]) parsed[id] = { name: '', updatedAt: null };
    });
    return parsed;
  } catch (err) {
    const fresh = {};
    ROOM_IDS.forEach(id => { fresh[id] = { name: '', updatedAt: null }; });
    return fresh;
  }
}

let state = loadState();

function saveState() {
  fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), (err) => {
    if (err) console.error('Failed to save state.json', err);
  });
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple REST endpoints (handy for debugging / curl, not required for normal use)
app.get('/api/state', (req, res) => res.json({ rooms: ROOM_IDS, state }));

const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  // Every client tells us who they are: a display for a specific room,
  // or the control panel that watches every room.
  socket.on('display:join', (room) => {
    if (!ROOM_IDS.includes(String(room))) return;
    socket.join(`room:${room}`);
    socket.emit('display:update', state[room]);
  });

  socket.on('control:join', () => {
    socket.join('control');
    socket.emit('control:state', { rooms: ROOM_IDS, state });
  });

  socket.on('control:setName', ({ room, name }) => {
    if (!ROOM_IDS.includes(String(room))) return;
    const trimmed = (name || '').trim();
    state[room] = { name: trimmed, updatedAt: Date.now() };
    saveState();
    io.to(`room:${room}`).emit('display:update', state[room]);
    io.to('control').emit('control:state', { rooms: ROOM_IDS, state });
  });

  socket.on('control:clear', ({ room }) => {
    if (!ROOM_IDS.includes(String(room))) return;
    state[room] = { name: '', updatedAt: Date.now() };
    saveState();
    io.to(`room:${room}`).emit('display:update', state[room]);
    io.to('control').emit('control:state', { rooms: ROOM_IDS, state });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Welcome screen server running on port ${PORT}`);
  console.log(`Rooms: ${ROOM_IDS.join(', ')}`);
});
