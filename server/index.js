const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

let timer;
let duration = 3600; // default duration

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('start-timer', (testDuration) => {
    duration = testDuration;
    clearInterval(timer);
    timer = setInterval(() => {
      duration--;
      io.emit('time-update', duration);
      if (duration === 0) {
        io.emit('time-up');
        clearInterval(timer);
      }
    }, 1000);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(4000, () => {
  console.log('listening on *:4000');
});
