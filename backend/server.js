
const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const {
  detectMood,
  detectResponseIntent,
  getRecommendation,
  introMessage
} = require("./mood_logic");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

/
app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.emit("botMessage", introMessage());

  socket.on("userMessage", (msg) => {
    console.log("User:", msg);
    const mood = detectMood(msg);
    const intent = detectResponseIntent(msg);
    const rec = getRecommendation(mood);

    let response = "";
    if (mood === "fallback_soft") {
      response = "I'm not sure I understood that. Can you rephrase?";
    } else {
      response = `You're feeling ${mood}. How about a ${rec.genre} with ${rec.snack} and ${rec.drink}? Want to play ${rec.game}?`;
    }

    socket.emit("botMessage", response);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
