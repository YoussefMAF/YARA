from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from mood_logic import detect_mood, detect_response_intent, recommendations

app = Flask(__name__)
socketio = SocketIO(app)
user_states = {}

@app.route("/")
def index():
    return render_template("index.html")

@socketio.on("user_message")
def handle_message(msg):
    sid = str(socketio.sid)
    if sid not in user_states:
        user_states[sid] = {"mood": None, "fallback_count": 0}

    user = user_states[sid]

    if not user["mood"]:
        mood = detect_mood(msg)
        if mood:
            user["mood"] = mood
            emit("bot_message", f"You're feeling {mood}. Want a movie that matches that or something to shift your mood?")
        else:
            user["fallback_count"] += 1
            if user["fallback_count"] >= 2:
                emit("bot_message", "Let's start again. How are you feeling?")
                user["fallback_count"] = 0
            else:
                emit("bot_message", "Hmm, tell me how you're feeling.")
    else:
        intent = detect_response_intent(msg)
        if intent == "match":
            r = recommendations[user["mood"]]
            emit("bot_message", f"{r['genre']} 🎬, {r['snack']} 🍿, {r['drink']} 🥤, {r['game']} 🎲")
        elif intent == "shift":
            user["mood"] = None
            emit("bot_message", "Tell me what mood you want instead.")
        else:
            emit("bot_message", "Should I match or change your mood?")

if __name__ == "__main__":
    socketio.run(app, port=5000)
