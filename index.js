const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const CHAT_PASSWORD = 'letmein'; // ✅ Hidden from client

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.authenticated = false;

  // Step 1: Handle authentication request
  socket.on('auth', (password) => {
    if (password === CHAT_PASSWORD) {
      socket.authenticated = true;
      socket.emit('auth-success');
    } else {
      socket.emit('auth-failed');
    }
  });

  // Step 2: Only allow chat if authenticated
  socket.on('chat message', (msgData) => {
    if (!socket.authenticated) return;
    io.emit('chat message', {
      id: socket.id,
      text: msgData.text,
      isImage: msgData.isImage || false
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log('✅ Server running on port:3000');
});

//


