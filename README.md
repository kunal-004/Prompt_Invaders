# 🎮 Prompt Invaders

**The AI-Powered Coding Bug Shooter Game**

Blast through waves of coding bugs while learning from AI-generated unit tests! Each enemy you destroy triggers Gemini AI to create educational failing tests, then watch as the AI fixes the code and the enemy explodes.

## 🚀 Game Concept

**Prompt Invaders** combines classic arcade action with modern AI education:

- **Classic Space Invaders gameplay** with a coding twist
- **AI-powered learning** through realistic unit tests
- **Real-time test generation** using Gemini 2.5 API
- **Educational value** - learn about common coding bugs
- **Competitive leaderboards** with Socket.IO real-time updates
- **Retro pixel-perfect aesthetics** with modern web tech

## 🎯 How to Play

1. **Move** your spaceship with ← → arrow keys
2. **Shoot** laser bullets with SPACEBAR
3. **Hit enemies** to trigger AI test generation:
   - 🔍 Gemini AI generates a failing unit test
   - 🧪 Test demonstrates the coding bug
   - ✅ AI fixes the code and test passes
   - 💥 Enemy explodes and you earn points!
4. **Survive waves** and climb the leaderboard
5. **Learn** from each bug's test and explanation

## 🛠️ Technology Stack

### Frontend

- **React 19** - Modern UI framework
- **PixiJS 8** - High-performance 2D graphics
- **Socket.IO Client** - Real-time leaderboard updates
- **Axios** - API communication
- **Vite** - Lightning-fast build tool

### Backend

- **Node.js + Express** - Server framework
- **Socket.IO** - Real-time WebSocket communication
- **MongoDB Atlas** - Cloud database (free M0 tier)
- **Gemini 2.5 API** - AI-powered test generation
- **Mongoose** - MongoDB object modeling

### Deployment

- **Vercel** - Frontend & Backend hosting
- **MongoDB Atlas** - Database hosting
- **Free tier compatible** - No paid services required

## 🧪 Game Features

### AI-Generated Tests

Each coding bug triggers Gemini AI to generate:

- **Realistic unit tests** that demonstrate the bug
- **Educational explanations** of what went wrong
- **Code fixes** that resolve the issue
- **Progressive difficulty** based on player level

### Bug Types Included

- **NullPointer** - Accessing null references
- **IndexOutOfBounds** - Array boundary violations
- **TypeError** - Wrong data type operations
- **ReferenceError** - Undefined variable access
- **SyntaxError** - Invalid code structure
- **MemoryLeak** - Unreleased memory references
- **RaceCondition** - Concurrent access conflicts
- **BufferOverflow** - Data exceeding allocated space
- **LogicError** - Incorrect algorithm implementation
- **InfiniteLoop** - Loops that never terminate

### Scoring System

- **Base points** per bug (varies by severity)
- **Wave completion bonuses**
- **Multiplier effects** for consecutive hits
- **Real-time leaderboard** updates via WebSocket

## 🎮 Play Now!

Ready to start debugging?

**🚀 [Play Prompt Invaders Now!](https://prompt-invaders.vercel.app/)**

---
**Happy Coding & Bug Hunting! 🐛🎯**
