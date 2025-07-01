const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);


app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.emit("botMessage", "Hey! I'm YARA, your personal movie planner. Tell me your mood and I’ll find the perfect movie — and if you're up for it, I’ll suggest snacks, drinks, a theme, and even games. So… how are you feeling?");

  socket.on("userMessage", (msg) => {
    console.log("User:", msg);
    const intent = detectIntent(msg);
    const response = handleIntent(intent);
    socket.emit("botMessage", response);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Simple intent detection logic
function detectIntent(message) {
  const text = message.toLowerCase();
  if (text.includes("happy")) return "happy";
  if (text.includes("sad")) return "sad";
  if (text.includes("bored")) return "bored";
  if (text.includes("anxious")) return "anxious";
  if (text.includes("romantic")) return "romantic";
  if (text.includes("angry")) return "angry";
  return "unknown";
}

function handleIntent(intent) {
  switch (intent) {
    case "happy":
      return "You're feeling happy! Try a Comedy or Musical with cotton candy and soda. Want to play Charades?";
    case "sad":
      return "Feeling down? A feel-good animated movie with ice cream and hot chocolate might cheer you up.";
    case "bored":
      return "Let’s shake things up! Try a mystery movie with chips and iced tea.";
    case "anxious":
      return "Take a breath. A light comedy with cookies and herbal tea might help.";
    case "romantic":
      return "Love is in the air! A romantic drama with chocolate and wine could be perfect.";
    case "angry":
      return "Let out the steam! Try an action movie with spicy snacks.";
    default:
      return "Hmm, I didn’t quite catch that. Can you rephrase?";
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
