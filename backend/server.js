const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

let fallbackCount = 0;
const MAX_FALLBACK = 3;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('userMessage', (msg) => {
    console.log('User:', msg);
    socket.emit('botMessage', `You said: "${msg}"`);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
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
      return "Hmm, I didn’t quite catch that. Could you rephrase?";
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