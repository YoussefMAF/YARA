mood_keywords = {
    "happy": ["happy", "joyful", "excited", "cheerful"],
    "sad": ["sad", "down", "depressed", "blue"],
    "bored": ["bored", "meh", "nothing to do"],
    "anxious": ["anxious", "nervous", "worried"],
    "romantic": ["romantic", "love", "in love"],
    "angry": ["angry", "mad", "furious"]
}

response_keywords = {
    "match": ["same", "match", "keep", "reflect"],
    "shift": ["change", "shift", "different", "new"]
}

recommendations = {
    "happy": {"genre": "Comedy or Musical", "snack": "Cotton candy", "drink": "Soda", "game": "Charades"},
    "sad": {"genre": "Feel-good or Animated", "snack": "Ice cream", "drink": "Hot chocolate", "game": "Story-building"},
    "bored": {"genre": "Adventure or Mystery", "snack": "Chips", "drink": "Iced tea", "game": "Puzzle games"},
    "anxious": {"genre": "Light comedy", "snack": "Cookies", "drink": "Herbal tea", "game": "Relaxing mobile game"},
    "romantic": {"genre": "Romance or Drama", "snack": "Chocolate", "drink": "Wine", "game": "Couple quiz"},
    "angry": {"genre": "Action or Thriller", "snack": "Spicy nuts", "drink": "Energy drink", "game": "Fighting game"}
}

def detect_mood(message):
    msg = message.lower()
    for mood, keywords in mood_keywords.items():
        if any(kw in msg for kw in keywords):
            return mood
    return None

def detect_response_intent(message):
    msg = message.lower()
    for intent, keywords in response_keywords.items():
        if any(kw in msg for kw in keywords):
            return intent
    return None
