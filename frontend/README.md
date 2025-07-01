# Chatbot Frontend

A modern, responsive React-based chatbot interface built with Bootstrap 5 and Socket.IO.

## Features

- **Modern UI/UX**: Clean, modern design with gradient backgrounds and smooth animations
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop devices
- **Real-time Communication**: Uses Socket.IO for real-time chat functionality
- **Component-based Architecture**: Built with React components for maintainability
- **Bootstrap 5**: Modern CSS framework for responsive design

## Components

1. **ChatWindow**: Main container component that manages the chat interface
2. **ChatHeader**: Displays the chatbot title and status
3. **MessageList**: Renders the list of messages with alternating user/bot styling
4. **Message**: Individual message component with different styles for user and bot
5. **MessageInput**: Input field with send button for user messages
6. **BotAvatar**: Visual avatar component for the bot with different sizes
7. **TypingIndicator**: Animated indicator when the bot is typing

## Setup

### Prerequisites

- Node.js v22.14.0 LTS
- npm

### Installation

```bash
cd frontend
npm install
```

### Running the Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## Usage

1. Start the backend server first (see backend README)
2. Start the frontend development server
3. Open your browser and navigate to `http://localhost:3000`
4. Start chatting with the bot!

## Technologies Used

- **React 18**: Modern React with hooks
- **Bootstrap 5**: CSS framework for responsive design
- **Socket.IO Client**: Real-time communication with backend
- **CSS3**: Custom styling with animations and responsive design

## Project Structure

```
frontend/
├── public/
│   ├── index.html          # Main HTML template
│   ├── styles.css          # Global styles
│   └── README.md           # This file
├── src/
│   ├── components/         # React components
│   │   ├── ChatWindow.js
│   │   ├── ChatHeader.js
│   │   ├── MessageList.js
│   │   ├── Message.js
│   │   ├── MessageInput.js
│   │   ├── BotAvatar.js
│   │   └── TypingIndicator.js
│   ├── App.js              # Main App component
│   ├── index.js            # React entry point
│   └── index.css           # Global styles
└── package.json            # Dependencies and scripts
```

## Responsive Design

The interface is fully responsive and adapts to different screen sizes:

- **Desktop**: Full-width chat container with rounded corners
- **Tablet**: Optimized layout with adjusted spacing
- **Mobile**: Full-screen chat interface with touch-friendly buttons

## Customization

You can customize the appearance by modifying the CSS files in the `src/components/` directory. The design uses CSS custom properties and Bootstrap 5 utilities for easy theming.
