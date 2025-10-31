const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins for local testing
    methods: ["GET", "POST"],
  },
  path: "/socket.io",
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("ping", () => {
    console.log("Received ping from client");
    socket.emit("pong");
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
