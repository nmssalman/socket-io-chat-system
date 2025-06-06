
//new

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let usersCount = 0;
const correctPassword = "888"; // Set the hardcoded password
const maxUsers = 2; // Limit to 2 users

// Serve static files (like index.html)
app.use(express.static('public'));

// Listen for incoming socket connections
io.on('connection', (socket) => {
  if (usersCount >= maxUsers) {
    // If the user limit is reached, disconnect new users and close chat
    socket.emit('chat-closed', 'Chat is full. Closing chat...');
    socket.disconnect();  // Disconnect the user
    return;
  }

  // Increment user count when a new user joins
  usersCount++;
  io.emit('user count', usersCount); // Emit updated user count to all clients

  console.log(`A user connected. Total users: ${usersCount}`);

  // Handle authentication
  socket.on('auth', (password) => {
    if (password === correctPassword) {
      socket.emit('auth-success'); // Allow access if password is correct
    } else {
      socket.emit('auth-failed'); // Reject if password is incorrect
      socket.disconnect(); // Disconnect the user
    }
  });

  // Listen for chat messages
  socket.on('chat message', (msg) => {
    io.emit('chat message', { id: socket.id, text: msg.text });
  });

  // Handle leave chat event
  socket.on('leave chat', () => {
    usersCount--;
    io.emit('user count', usersCount); // Update user count when someone leaves
    console.log(`A user left. Total users: ${usersCount}`);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    usersCount--;
    io.emit('user count', usersCount); // Emit updated user count after disconnect
    console.log(`A user disconnected. Total users: ${usersCount}`);
  });
});

const PORT = process.env.PORT || 3000;  // Heroku uses process.env.PORT

// Start the server on port 3000
server.listen(PORT, () => {
  console.log('Server is running on port %d', PORT);
});
