
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


app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Fallback tracking per user
const fallbackTracker = {};
const MAX_FALLBACK = 3;

const softFallbackMessages = [
  "I'm not sure I got that — could you try saying it differently?",
  "Oops, I didn’t catch that. Can you rephrase?",
  "Hmm... I'm having trouble understanding. Can you try again?",
  "Sorry, that confused me. Mind rewording your message?"
];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  fallbackTracker[socket.id] = 0;

  const restartConversation = () => {
    socket.emit("botMessage", "I'm really sorry, I’m still not getting it. Let's start over.");
    socket.emit("botMessage", introMessage());
  };

  socket.emit("botMessage", introMessage());

  socket.on("userMessage", (msg) => {
    console.log("User:", msg);
    const mood = detectMood(msg);

    if (mood === "fallback_soft") {
      fallbackTracker[socket.id]++;

      if (fallbackTracker[socket.id] >= MAX_FALLBACK) {
        fallbackTracker[socket.id] = 0;
        restartConversation();
        return;
      }

      const softMessage = softFallbackMessages[Math.floor(Math.random() * softFallbackMessages.length)];
      socket.emit("botMessage", softMessage);
      return;
    }

    // Reset fallback count on success
    fallbackTracker[socket.id] = 0;

    const intent = detectResponseIntent(msg);
    const rec = getRecommendation(mood);

    const response = `You're feeling ${mood}. How about a ${rec.genre} with ${rec.snack} and ${rec.drink}? Want to play ${rec.game}?`;
    socket.emit("botMessage", response);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete fallbackTracker[socket.id];
  });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
