const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const players = {};

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("new-player", (player) => {
    players[socket.id] = player;
    io.emit("update-players", players);
  });

  socket.on("move-player", (player) => {
    players[socket.id] = player;
    io.emit("update-players", players);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("update-players", players);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
