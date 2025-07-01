const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS for socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Enable CORS for Express
app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

let fallbackCount = 0;
const MAX_FALLBACK = 3;

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  // Send welcome message
  socket.emit('bot-message', "Hey! I'm YARA, your personal movie planner. Tell me your mood and I'll find the perfect movie — and if you're up for it, I'll suggest snacks, drinks, a theme, and even games. So… how are you feeling?");

  socket.on('user-message', (message) => {
    console.log('User:', message);
    const response = handleUserMessage(message);
    socket.emit('bot-message', response);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// The "catchall" handler: for any request that doesn't match an API route,
// send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Intent processing function
function handleUserMessage(message) {
  const intent = detectIntent(message);

  if (intent) {
    fallbackCount = 0; // reset if bot understands
    return respondToIntent(intent);
  } else {
    fallbackCount++;

    if (fallbackCount >= MAX_FALLBACK) {
      fallbackCount = 0;
      return "I'm having trouble understanding. Let's start over — what's your name?";
    } else {
      return "Hmm, I didn't quite catch that. Could you rephrase?";
    }
  }
}

// Intent detection using keywords
function detectIntent(message) {
  const lowered = message.toLowerCase();

  if (lowered.includes("hello") || lowered.includes("hi")) {
    return "greet";
  } else if (lowered.includes("help")) {
    return "help";
  } else if (lowered.includes("happy") || lowered.includes("joyful")) {
    return "mood_happy";
  } else if (lowered.includes("sad") || lowered.includes("depressed")) {
    return "mood_sad";
  } else if (lowered.includes("bored")) {
    return "mood_bored";
  } else if (lowered.includes("anxious") || lowered.includes("nervous")) {
    return "mood_anxious";
  } else if (lowered.includes("romantic") || lowered.includes("love")) {
    return "mood_romantic";
  } else if (lowered.includes("angry") || lowered.includes("mad")) {
    return "mood_angry";
  }

  return null; // fallback if no intent found
}

// Response
function respondToIntent(intent) {
  switch (intent) {
    case "greet":
      return "Hi there! What can I help you with today?";
    case "help":
      return "Sure! Just tell me what you need help with.";
    case "mood_happy":
      return "You're feeling happy! Try a Comedy or Musical with cotton candy and soda. Want to play Charades?";
    case "mood_sad":
      return "Feeling down? A feel-good animated movie with ice cream and hot chocolate might cheer you up.";
    case "mood_bored":
      return "Let's shake things up! How about a mystery or adventure movie with chips and iced tea?";
    case "mood_anxious":
      return "Deep breath. A light comedy with cookies and herbal tea might be soothing.";
    case "mood_romantic":
      return "Love is in the air! A romantic drama with chocolate and wine could be perfect.";
    case "mood_angry":
      return "Let out the steam! An action or thriller movie with spicy nuts and an energy drink could match the mood.";   
    default:
      return "Not sure how to help with that yet.";
  }
}