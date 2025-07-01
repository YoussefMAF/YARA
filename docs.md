# Chatbot Project Documentation

## 1. Project Overview

This project implements a topic-focused chatbot that simulates human conversation in a Q&A fashion. The bot is designed to steer conversations, recognize user intents using keyword spotting, and handle fallback scenarios gracefully. The user interface is modern, responsive, and built with React and Bootstrap 5.

**Chosen Topic:** _[Insert your topic here, e.g., Restaurant Ordering, Gym Workout Planning, etc.]_

---

## 2. Requirements

### Functional

- The bot conducts Q&A conversations, steering aggressively.
- Recognizes user intents via keyword spotting.
- Soft fallback: asks user to rephrase if not understood.
- Hard fallback: restarts conversation after repeated failures.
- Remembers conversation history for context and to avoid repetition.
- Can handle conversations exceeding 20 Q&A turns.
- UI alternates user/bot messages in a list.

### Non-Functional

- Frontend: HTML5, CSS, React (≥4 components), Bootstrap 5, responsive design.
- Backend: Node.js (v22.14.0 LTS), Express.js, Socket.IO, extensible intent/response logic.
- Frontend-backend communication via WebSocket (Socket.IO).
- No hardcoded intents/responses—must be extensible via config files.

### Submission

- `contributions.xlsx`: Team members, IDs, responsibilities.
- `url.txt`: URL to deployed solution (for Task 2/3).
- All source, config, and documentation files.
- Setup manual for offline installation and usage.
- No generated files (e.g., `node_modules`), secrets, or credentials in submission.

---

## 3. Directory Structure

```
YARA/
  backend/
    server.js           # Node.js backend (Express, Socket.IO)
    package.json        # Backend dependencies
    ...
  frontend/
    src/                # React components
    public/             # Static files (index.html, styles.css)
    package.json        # Frontend dependencies
    ...
  contributions.xlsx    # Team contributions
  url.txt               # Solution URL
  README.md             # Setup and usage instructions
  docs.md               # This documentation
```

---

## 4. Setup Instructions

### Prerequisites

- Node.js v22.14.0 LTS
- npm (Node Package Manager)

### Installation

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

### Running Locally

#### Start Backend

```bash
cd backend
node server.js
```

#### Start Frontend

```bash
cd frontend
npm start
```

### Accessing the App

Open your browser and go to: `http://localhost:3000` (or the port specified in your frontend config).

---

## 5. Usage

- Interact with the chatbot via the web interface.
- The bot will ask questions, interpret your answers, and steer the conversation.
- If the bot does not understand, it will ask you to rephrase (soft fallback).
- After repeated misunderstandings, the bot will restart the conversation (hard fallback).
- The conversation history is maintained for context.

---

## 6. Extending the Bot

- Intents, keywords, and responses are defined in external config files (e.g., `intents.json`).
- To add a new intent or topic, update the config file—no code changes required.
- Example structure for `intents.json`:

```json
[
  {
    "intent": "order_food",
    "keywords": ["order", "food", "menu"],
    "responses": ["What would you like to order?", "Our menu includes..."]
  },
  ...
]
```

---

## 7. Team Contributions

See `contributions.xlsx` for a list of team members, student IDs, and their responsibilities.

---

## 8. Deployment

- Deploy the backend and frontend to your chosen platform (e.g., Heroku, Vercel, Netlify).
- Add the deployed URL to `url.txt`.

---

## 9. Troubleshooting

- **Port conflicts:** Ensure backend and frontend run on different ports.
- **Socket.IO connection issues:** Check that both frontend and backend use the same Socket.IO version and correct endpoint.
- **No response from bot:** Check backend logs for errors and ensure intents config is loaded correctly.
- **UI not responsive:** Ensure Bootstrap 5 is included and used in your React components.

---

## 10. Notes

- Do not commit `node_modules` or any generated files.
- Do not include any secrets, API keys, or credentials in the repository.
- Follow clean code practices and comment your code where necessary.

---

_This documentation should be updated as the project evolves. For any questions, refer to the README or contact the project team._
