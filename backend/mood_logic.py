import json
import os

CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'config.json')
with open(CONFIG_PATH, 'r') as file:
    config = json.load(file)

mood_keywords = config["mood_keywords"]
response_keywords = config["response_keywords"]
recommendations = config["recommendations"]

def detect_mood(message):
    message = message.lower()
    for mood, keywords in mood_keywords.items():
        if any(keywords in message for keywords in keywords):
            return mood
    return "fallback_soft"

def detect_response_intent(message):
    message = message.lower()
    for intent, keywords in response_keywords.items():
        if any(keywords in message for keywords in keywords):
            return intent
    return "fallback_soft"

def get_recommendation(mood):
    return recommendations.get(mood, {})

def intro_message():
    return (
        "Hey! I'm YARA, your personal movie planner\n"
        "Tell me your mood and I’ll find the perfect movie — and if you're up for it, "
        "I’ll suggest snacks, drinks, a theme, and even games.\n"
        "So… how are you feeling?"
    )