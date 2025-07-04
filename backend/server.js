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

// Initialize express app
const app = express();

// CORS for Express
app.use(cors());

// SSL options for HTTPS
const sslOptions = {
  key: process.env.SSL_KEY ? fs.readFileSync(process.env.SSL_KEY) : null,
  cert: process.env.SSL_CERT ? fs.readFileSync(process.env.SSL_CERT) : null
};

// Create HTTP/HTTPS server based on environment
const httpServer = http.createServer(app);
const server = (process.env.NODE_ENV === 'production' && sslOptions.key && sslOptions.cert)
  ? https.createServer(sslOptions, app)
  : httpServer;

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL || 'https://your-domain.com'
      : "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});


app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Fallback tracking per user
const fallbackTracker = {};
const MAX_FALLBACK = 3;

const softFallbackMessages = [
  "I'm not sure I got that — could you try saying it differently?",
  "I didn’t quite catch that. Can you rephrase?",
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

    // Reset fallback
    fallbackTracker[socket.id] = 0;

    const intent = detectResponseIntent(msg);
    const rec = getRecommendation(mood);

    const response = `You're feeling ${mood}. How about a ${rec.genre} with ${rec.snack} and ${rec.drink}? You could also play ${rec.game}?`;
    socket.emit("botMessage", response);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete fallbackTracker[socket.id];
  });
});


// Start the server
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

if (process.env.NODE_ENV === 'production' && sslOptions.key && sslOptions.cert) {
  // Start both HTTP and HTTPS in production
  http.createServer((req, res) => {
    res.writeHead(301, { 'Location': 'https://' + req.headers['host'] + req.url });
    res.end();
  }).listen(PORT);
  
  server.listen(HTTPS_PORT, "0.0.0.0", () => {
    console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
  });
} else {
  // Development - HTTP only
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

//  React static files 
app.use(express.static(path.join(__dirname, '../frontend/build')));

const userStates = new Map();

const conversationFlow = [
  { id: 'initial', question: "Hey! I'm YARA, your personal movie planner. How are you feeling today?" },
  { id: 'mood_follow', question: "Would you like a movie that matches your current mood or something to change it?" },
  { id: 'company', question: "Are you planning to watch alone or with someone?" },
  { id: 'time', question: "How much time do you have for the movie?" },
  { id: 'genre_pref', question: "Do you have any specific genre preferences?" },
  { id: 'snacks', question: "Would you like some snack suggestions to go with the movie?" },
  { id: 'previous_movies', question: "What's the last movie you really enjoyed?" }
];

// Socket.io connection 
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // User state etc.
  userStates.set(socket.id, {
    currentStep: 0,
    mood: null,
    matchMood: null,
    company: null,
    timePreference: null,
    genrePreference: null,
    conversationHistory: [],
    fallbackCount: 0
  });

  // Send welcome message
  socket.emit('bot-message', conversationFlow[0].question);

  socket.on('user-message', (message) => {
    const userState = userStates.get(socket.id);
    console.log('User:', message);
    
    // Conversation history
    userState.conversationHistory.push({ role: 'user', message });
    
    const response = handleUserMessage(message, userState);
    socket.emit('bot-message', response);
    
    userState.conversationHistory.push({ role: 'bot', message: response });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    userStates.delete(socket.id);
  });
});

// Intent processing function
function handleUserMessage(message, userState) {
  const intent = detectIntent(message);

  if (intent) {
    userState.fallbackCount = 0; // reset if bot understands
    
    if (intent.startsWith('mood_')) {
      userState.mood = intent.replace('mood_', '');
      return processNextStep(userState);
    }
    
    return respondToIntent(intent, userState);
  } else {
    userState.fallbackCount++;

    if (userState.fallbackCount >= 3) {
      userState.fallbackCount = 0;
      userState.currentStep = 0; // reset convo
      return "I'm having trouble understanding. Let's start over — " + conversationFlow[0].question;
    } else {
      return "I didn't quite catch that. Could you rephrase? " + conversationFlow[userState.currentStep].question;
    }
  }
}

function processNextStep(userState) {
  userState.currentStep++;
  if (userState.currentStep < conversationFlow.length) {
    return conversationFlow[userState.currentStep].question;
  }
  return generateRecommendation(userState);
}

function generateRecommendation(userState) {
  const { mood, company, timePreference, genrePreference } = userState;
  let recommendation = "Based on our conversation, ";

  if (mood) {
    recommendation += `since you're feeling ${mood}, `;
  }

  // User mood
  const movieSuggestions = {
    happy: ["La La Land", "The Greatest Showman", "Mamma Mia!"],
    sad: ["Inside Out", "The Secret Life of Walter Mitty", "Big Hero 6"],
    angry: ["School of Rock", "Legally Blonde", "The Intern"],
    anxious: ["Ratatouille", "The Secret Garden", "My Neighbor Totoro"],
    bored: ["Inception", "The Grand Budapest Hotel", "Mission: Impossible"],
    romantic: ["Pride and Prejudice", "Notting Hill", "The Proposal"]
  };

  const movies = movieSuggestions[mood] || ["The Shawshank Redemption", "Forrest Gump", "The Dark Knight"];
  recommendation += `I recommend watching "${movies[Math.floor(Math.random() * movies.length)]}". `;

  // Snacks
  const snacks = {
    happy: "popcorn and candy",
    sad: "ice cream and cookies",
    angry: "spicy chips and pretzels",
    anxious: "herbal tea and chocolate",
    bored: "trail mix and fruit",
    romantic: "chocolate-covered strawberries and wine"
  };

  recommendation += `Grab some ${snacks[mood] || "popcorn"} and enjoy! Would you like another recommendation?`;
  return recommendation;
}

function detectIntent(message) {
  const lowered = message.toLowerCase();
  
  // Mood
  if (lowered.includes("happy") || lowered.includes("great") || lowered.includes("excited")) {
    return "mood_happy";
  } else if (lowered.includes("sad") || lowered.includes("down") || lowered.includes("depressed")) {
    return "mood_sad";
  } else if (lowered.includes("angry") || lowered.includes("mad") || lowered.includes("frustrated")) {
    return "mood_angry";
  } else if (lowered.includes("anxious") || lowered.includes("nervous") || lowered.includes("worried")) {
    return "mood_anxious";
  } else if (lowered.includes("bored") || lowered.includes("nothing to do")) {
    return "mood_bored";
  } else if (lowered.includes("romantic") || lowered.includes("in love")) {
    return "mood_romantic";
  }
  
  // Duration
  if (lowered.includes("hour") || lowered.includes("long") || lowered.includes("short")) {
    return "time_pref";
  }
  
  // Company
  if (lowered.includes("alone") || lowered.includes("myself")) {
    return "company_alone";
  } else if (lowered.includes("friend") || lowered.includes("family") || lowered.includes("together")) {
    return "company_group";
  }
  
  // Genre
  if (lowered.includes("action") || lowered.includes("adventure")) {
    return "genre_action";
  } else if (lowered.includes("comedy") || lowered.includes("funny")) {
    return "genre_comedy";
  } else if (lowered.includes("drama") || lowered.includes("serious")) {
    return "genre_drama";
  }
  
  // Basic intents
  if (lowered.includes("hello") || lowered.includes("hi")) {
    return "greet";
  } else if (lowered.includes("help")) {
    return "help";
  } else if (lowered.includes("yes") || lowered.includes("sure")) {
    return "affirm";
  } else if (lowered.includes("no") || lowered.includes("nope")) {
    return "deny";
  }

  return null;
}

// Chatbot answers
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

// Catchall
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Start servers
httpServer.listen(PORT, () => {
  console.log(`HTTP Server running on http://localhost:${PORT}`);
});

if (process.env.NODE_ENV === 'production' && sslOptions.key && sslOptions.cert) {
  server.listen(HTTPS_PORT, () => {
    console.log(`HTTPS Server running on https://localhost:${HTTPS_PORT}`);
  });
}
