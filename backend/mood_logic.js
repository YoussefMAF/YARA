
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const moodKeywords = config.mood_keywords;
const responseKeywords = config.response_keywords;
const recommendations = config.recommendations;

function detectMood(message) {
  const msg = message.toLowerCase();
  for (const mood in moodKeywords) {
    if (moodKeywords[mood].some((kw) => msg.includes(kw))) {
      return mood;
    }
  }
  return "fallback_soft";
}

function detectResponseIntent(message) {
  const msg = message.toLowerCase();
  for (const intent in responseKeywords) {
    if (responseKeywords[intent].some((kw) => msg.includes(kw))) {
      return intent;
    }
  }
  return "fallback_soft";
}

function getRecommendation(mood) {
  return recommendations[mood] || {};
}

function introMessage() {
  return (
    "Hey! I'm YARA, your personal movie planner\n" +
    "Tell me your mood and I’ll find the perfect movie — and if you're up for it, " +
    "I’ll suggest snacks, drinks, a theme, and even games.\n" +
    "So… how are you feeling?"
  );
}

module.exports = {
  detectMood,
  detectResponseIntent,
  getRecommendation,
  introMessage
};
