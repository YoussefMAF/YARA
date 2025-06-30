const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
const server = http.createServer(app);

//create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

//set up socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("user-message", (msg) => {
    console.log("Received:", msg);

  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

//start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
