const express = require("express");
const path = require("path");
const http = require("http");
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const { Server } = require("socket.io");
const {
  detectMood,
  detectResponseIntent,
  getRecommendation,
  introMessage
} = require("./mood_logic");

// Express 
const app = express();
app.use(cors());

const sslOptions = {
  key: process.env.SSL_KEY ? fs.readFileSync(process.env.SSL_KEY) : null,
  cert: process.env.SSL_CERT ? fs.readFileSync(process.env.SSL_CERT) : null
};

const httpServer = http.createServer(app);
const server = (process.env.NODE_ENV === 'production' && sslOptions.key && sslOptions.cert)
  ? https.createServer(sslOptions, app)
  : httpServer;

// Socket.IO (make sure to check the frontend!!)
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL || 'https://your-domain.com'
      : "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, 'build')));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Conversation flow
const userStates = new Map();
const conversationFlow = [
  { id: 'initial', question: introMessage() },
  { id: 'mood_follow', question: "Would you like a movie that matches your current mood or something to change it?" },
  { id: 'company', question: "Are you planning to watch alone or with someone?" },
  { id: 'time', question: "How much time do you have for the movie?" },
  { id: 'genre_pref', question: "Do you have any specific genre preferences?" },
  { id: 'snacks', question: "Would you like some snack suggestions to go with the movie?" },
  { id: 'previous_movies', question: "What's the last movie you really enjoyed?" }
];

// Single socket.io connection block
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Initial user state
  userStates.set(socket.id, {
    currentStep: 0,
    mood: null,
    company: null,
    timePreference: null,
    genrePreference: null,
    conversationHistory: [],
    fallbackCount: 0
  });
  
  //Log initial step and mood state
  console.log(`Starting conversation flow with user ${socket.id}: step 0 (${conversationFlow[0].id})`);

  // Welcome message
  socket.emit('bot-message', conversationFlow[0].question);

  socket.on('user-message', (msg) => {
    const userState = userStates.get(socket.id);
    if (!userState) return;

    console.log("User:", msg);
    userState.conversationHistory.push({ role: 'user', message: msg });

    const intent = detectIntent(msg);

    let response;
    if (intent) {
      userState.fallbackCount = 0;

      if (intent.startsWith("mood_")) {
        userState.mood = intent.replace("mood_", "");
        response = processNextStep(userState);
      } else {
        response = respondToIntent(intent, userState);
      }
    } else {
      userState.fallbackCount++;
      if (userState.fallbackCount >= 3) {
        userState.fallbackCount = 0;
        userState.currentStep = 0;
        response = "I'm having trouble understanding. Let's start over — " + conversationFlow[0].question;
      } else {
        response = "I didn't quite catch that. Could you rephrase? " + conversationFlow[userState.currentStep].question;
      }
    }

    userState.conversationHistory.push({ role: 'bot', message: response });
    socket.emit("bot-message", response);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    userStates.delete(socket.id);
  });
});

// Mood detection
function detectIntent(message) {
  const lowered = message.toLowerCase();

  if (lowered.includes("happy") || lowered.includes("great") || lowered.includes("excited")) return "mood_happy";
  if (lowered.includes("sad") || lowered.includes("down") || lowered.includes("depressed")) return "mood_sad";
  if (lowered.includes("angry") || lowered.includes("mad") || lowered.includes("frustrated")) return "mood_angry";
  if (lowered.includes("anxious") || lowered.includes("nervous") || lowered.includes("worried")) return "mood_anxious";
  if (lowered.includes("bored") || lowered.includes("nothing to do")) return "mood_bored";
  if (lowered.includes("romantic") || lowered.includes("in love")) return "mood_romantic";

  if (lowered.includes("hour") || lowered.includes("long") || lowered.includes("short")) return "time_pref";
  if (lowered.includes("alone") || lowered.includes("myself")) return "company_alone";
  if (lowered.includes("friend") || lowered.includes("family") || lowered.includes("together")) return "company_group";

  if (lowered.includes("action") || lowered.includes("adventure")) return "genre_action";
  if (lowered.includes("comedy") || lowered.includes("funny")) return "genre_comedy";
  if (lowered.includes("drama") || lowered.includes("serious")) return "genre_drama";

  if (lowered.includes("hello") || lowered.includes("hi")) return "greet";
  if (lowered.includes("help")) return "help";
  if (lowered.includes("yes") || lowered.includes("sure")) return "affirm";
  if (lowered.includes("no") || lowered.includes("nope")) return "deny";

  return null;
}

// Next (tbr)
function processNextStep(userState) {
  userState.currentStep++;
  if (userState.currentStep < conversationFlow.length) {
    return conversationFlow[userState.currentStep].question;
  }
  return generateRecommendation(userState);
}

// Movie recs
function generateRecommendation(userState) {
  const { mood } = userState;

  const movieSuggestions = {
    happy: ["La La Land", "The Greatest Showman", "Mamma Mia!"],
    sad: ["Inside Out", "The Secret Life of Walter Mitty", "Big Hero 6"],
    angry: ["School of Rock", "Legally Blonde", "The Intern"],
    anxious: ["Ratatouille", "The Secret Garden", "My Neighbor Totoro"],
    bored: ["Inception", "The Grand Budapest Hotel", "Mission: Impossible"],
    romantic: ["Pride and Prejudice", "Notting Hill", "The Proposal"]
  };

  const snacks = {
    happy: "popcorn and candy",
    sad: "ice cream and cookies",
    angry: "spicy chips and pretzels",
    anxious: "herbal tea and chocolate",
    bored: "trail mix and fruit",
    romantic: "chocolate-covered strawberries and wine"
  };

  const movie = (movieSuggestions[mood] || ["The Shawshank Redemption", "Forrest Gump", "The Dark Knight"])[Math.floor(Math.random() * 3)];
  const snack = snacks[mood] || "popcorn";

  return `Based on your mood, I recommend watching "${movie}". Grab some ${snack} and enjoy! Would you like another recommendation?`;
}

// Response logic
function respondToIntent(intent, userState) {
  switch (intent) {
    case "greet":
      return conversationFlow[0].question;
    case "help":
      return "I'm here to help you find the perfect movie! " + conversationFlow[userState.currentStep].question;
    case "affirm":
      return processNextStep(userState);
    case "deny":
      return "Okay, no problem! " + conversationFlow[userState.currentStep].question;
    case "company_alone":
      userState.company = "alone";
      return processNextStep(userState);
    case "company_group":
      userState.company = "group";
      return processNextStep(userState);
    case "time_pref":
      userState.timePreference = true;
      return processNextStep(userState);
    default:
      return processNextStep(userState);
  }
}

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.secure) {
      next();
    } else {
      res.redirect('https://' + req.headers.host + req.url);
    }
  });
}

// Catchall React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Start servers (tbf)
const PORT = process.env.PORT || 8080;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

httpServer.listen(PORT, () => {
  console.log(`HTTP Server running on http://localhost:${PORT}`);
});

if (process.env.NODE_ENV === 'production' && sslOptions.key && sslOptions.cert) {
  server.listen(HTTPS_PORT, () => {
    console.log(`HTTPS Server running on https://localhost:${HTTPS_PORT}`);
  });
}