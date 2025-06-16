//setup
const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require("express");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

//handlers
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("user-message", (msg) => {
    console.log("User said:", msg);
    socket.emit("bot-message", `YARA: I heard you say "${msg}"!`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

//run server
const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
