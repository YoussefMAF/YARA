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

  socket.on('user-message', (msg) => {
    console.log('User:', msg);
    socket.emit('bot-message', `You said: "${msg}"`);
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
    default:
      return "Not sure how to help with that yet.";
  }
}