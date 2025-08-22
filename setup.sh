#!/bin/bash

echo "🎮 Starting Prompt Invaders Development Environment..."
echo ""

# Check if .env files exist
if [ ! -f "server/.env" ]; then
    echo "⚠️  server/.env not found. Please:"
    echo "   1. Copy server/.env.example to server/.env"
    echo "   2. Add your Gemini API key and MongoDB URI"
    echo ""
fi

if [ ! -f "client/.env.local" ]; then
    echo "⚠️  client/.env.local not found. Please:"
    echo "   1. Copy client/.env.example to client/.env.local"
    echo "   2. Update API URLs if needed"
    echo ""
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

echo "🚀 Ready to start development!"
echo ""
echo "Next steps:"
echo "1. Set up environment variables (.env files)"
echo "2. Run 'npm run dev' to start both servers"
echo "3. Open http://localhost:5173 to play!"
echo ""
echo "Happy coding! 🐛🎯"
