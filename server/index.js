const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = 5000;

const rooms = {};

app.use(cors({ origin: "http://127.0.0.1:5173" }));

app.get("/", (req, res) => {
  res.send("Got get req");
});

io.on("connection", (socket) => {
  //   console.log("a user connected ");
  //   socket.on("disconnect", () => {
  //     console.log("user disconnected");
  //   });
  socket.on("createGame", () => {
    const roomId = makeid(6);
    rooms[roomId] = {};
    socket.join(roomId);
    socket.emit("newGame", { roomId: roomId });
  });

  socket.on("joinGame", (data) => {
    if (rooms[data.roomId] != null) {
      socket.join(data.roomId);
      socket.to(data.roomId).emit("playersConnected", {});
      socket.emit("playersConnected");
    }
  });

  socket.on("p1Choice", (data) => {
    if (rooms[data.roomId] != null) {
      rooms[data.roomId].p1Choice = data.rpsValue;
      socket.broadcast.emit("p1Choice");
      if (rooms[data.roomId].p2Choice != null) {
        declareWinner(data.roomId);
      }
    }
  });

  socket.on("p2Choice", (data) => {
    if (rooms[data.roomId] != null) {
      rooms[data.roomId].p2Choice = data.rpsValue;
      socket.to(data.roomId).emit("p2Choice");
      if (rooms[data.roomId].p1Choice != null) {
        declareWinner(data.roomId);
      }
    }
  });
});

function declareWinner(id) {
  let p1c = rooms[id].p1Choice;
  let p2c = rooms[id].p2Choice;
  let winner = null;

  if (p1c == p2c) {
    winner = "d";
  } else if (p1c == "paper") {
    if (p2c == "scissors") winner = "p2";
    else winner = "p1";
  } else if (p1c == "rock") {
    if (p2c == "paper") winner = "p2";
    else winner = "p2";
  } else if (p1c == "scissors") {
    if (p2c == "rock") winner = "p2";
    else winner = "p1";
  }

  io.sockets.to(id).emit("result", { winner: winner });
}

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

server.listen(PORT, () => {
  console.log(`Connected to port: ${PORT}`);
});
