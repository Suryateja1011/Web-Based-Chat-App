const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const usersInRoom = {}; // { roomName: Set([socket.id, ...]) }

dotenv.config();

const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinRoom', async ({ username, room }) => {
    socket.join(room);
    socket.username = username;
    socket.room = room;

    // Track in-memory
    if (!usersInRoom[room]) {
        usersInRoom[room] = new Set();
    }
    usersInRoom[room].add(socket.id);

    // Send updated count
    io.to(room).emit('roomUserCount', { room, count: usersInRoom[room].size });

    // Load last 20 messages from Firestore
    const messagesRef = db.collection('rooms').doc(room).collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(20);

    const snapshot = await messagesRef.get();
    const messages = [];
    snapshot.forEach(doc => {
      messages.unshift(doc.data());
    });

    socket.emit('loadMessages', messages);

    io.to(room).emit('message', {
      username: 'System',
      text: `${username} has joined the room.`,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('chatMessage', async (msg) => {
    const messageData = {
      username: socket.username,
      text: msg,
      timestamp: new Date().toISOString()
    };

    await db.collection('rooms').doc(socket.room).collection('messages').add(messageData);
    io.to(socket.room).emit('message', messageData);
  });

  socket.on('disconnect', () => {
    if (socket.room && socket.username) {
      // Remove user from room tracking
      if (socket.room && usersInRoom[socket.room]) {
        usersInRoom[socket.room].delete(socket.id);
        io.to(socket.room).emit('roomUserCount', { room: socket.room, count: usersInRoom[socket.room].size });
      }

      io.to(socket.room).emit('message', {
        username: 'System',
        text: `${socket.username} has left the room.`,
        timestamp: new Date().toISOString()
      });
    }
  });
});



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


