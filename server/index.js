const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://prompt-invaders-frontend.vercel.app"]
        : ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
  path: "/socket.io",
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://prompt-invaders-frontend.vercel.app"]
        : ["http://localhost:5173", "http://localhost:3000"],
  })
);
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/prompt-invaders"
  )
  .then(() => console.log("📦 MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Score Schema
const scoreSchema = new mongoose.Schema({
  username: { type: String, required: true, maxlength: 20 },
  score: { type: Number, required: true },
  wave: { type: Number, default: 1 },
  date: { type: Date, default: Date.now },
});

const Score = mongoose.model("Score", scoreSchema);

// Gemini AI Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Bug Database
const CODING_BUGS = {
  NullPointer: {
    description: "Accessing null reference",
    context: "JavaScript object property access",
  },
  IndexOutOfBounds: {
    description: "Array index exceeds length",
    context: "Array manipulation in JavaScript",
  },
  TypeError: {
    description: "Wrong data type operation",
    context: "JavaScript type conversion",
  },
  ReferenceError: {
    description: "Undefined variable access",
    context: "JavaScript variable scope",
  },
  SyntaxError: {
    description: "Invalid code structure",
    context: "JavaScript syntax rules",
  },
  MemoryLeak: {
    description: "Unreleased memory references",
    context: "JavaScript memory management",
  },
  RaceCondition: {
    description: "Concurrent access conflict",
    context: "JavaScript async operations",
  },
  BufferOverflow: {
    description: "Data exceeds allocated space",
    context: "JavaScript string/array operations",
  },
  LogicError: {
    description: "Incorrect algorithm implementation",
    context: "JavaScript conditional logic",
  },
  InfiniteLoop: {
    description: "Loop never terminates",
    context: "JavaScript iteration control",
  },
};

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "🎮 Prompt Invaders Backend API",
    version: "1.0.0",
    endpoints: ["/generate-test", "/score", "/scores", "/leaderboard"],
  });
});

// Health endpoint for uptime checks
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Generate Dynamic Wave Bugs using AI
app.post("/generate-wave-bugs", async (req, res) => {
  try {
    const {
      wave,
      theme,
      complexity,
      examples,
      enemyCount = 4,
      difficultyMultiplier = 1,
    } = req.body || {};

    if (!wave || !theme) {
      return res.status(400).json({
        error: "Wave and theme are required",
      });
    }

    const prompt = `You are an expert software engineering instructor creating realistic coding bugs for a programming education game.

Wave: ${wave}
Theme: ${theme}
Complexity: ${complexity}
Difficulty Multiplier: ${difficultyMultiplier}x
Enemy Count: ${enemyCount}
Example Categories: ${examples.join(", ")}

Generate ${enemyCount} unique, realistic coding bug names for this wave. Each bug should:
1. Be specific and educational (not generic)
2. Match the ${complexity} difficulty level
3. Relate to the ${theme} theme
4. Be progressively harder with ${difficultyMultiplier}x multiplier
5. Sound like real bugs developers encounter
6. Be 2-4 words max for display

Examples of good bug names:
- "Null Dereference" (not just "NullPointer")  
- "SQL Injection" (not just "SecurityBug")
- "Race Condition" (not just "ConcurrencyIssue")
- "Buffer Overflow" (not just "MemoryBug")

Return only JSON array of strings:
["BugName1", "BugName2", "BugName3", "BugName4"]`;

    // Fallback bugs if no AI key
    if (!process.env.GEMINI_API_KEY) {
      const fallbackBugs = [
        `${theme} Error`,
        `${complexity} Bug`,
        `Wave${wave} Issue`,
        `${examples[0]} Problem`,
      ];
      return res.json({ bugs: fallbackBugs.slice(0, enemyCount) });
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response?.text?.() ?? "";

    // Extract bug names from response
    let bugs;
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const clean = jsonMatch[0]
          .replace(/^```(json)?/i, "")
          .replace(/```$/i, "")
          .trim();
        bugs = JSON.parse(clean);
      } else {
        throw new Error("No JSON array found");
      }
    } catch (parseError) {
      console.error("Failed to parse AI bug response:", responseText);
      // Fallback to themed bugs
      bugs = [
        `${theme} Error`,
        `${complexity} Bug`,
        `Wave${wave} Issue`,
        `${examples[0]} Problem`,
      ].slice(0, enemyCount);
    }

    // Ensure we have the right number of bugs
    while (bugs.length < enemyCount) {
      bugs.push(`${theme} Bug ${bugs.length + 1}`);
    }
    bugs = bugs.slice(0, enemyCount);

    console.log(`🎯 Generated Wave ${wave} bugs:`, bugs);

    res.json({
      bugs,
      wave,
      theme,
      complexity,
      difficultyMultiplier,
    });
  } catch (error) {
    console.error("Error generating wave bugs:", error);
    // Ultimate fallback
    const fallbackBugs = [
      "Logic Error",
      "Type Bug",
      "Syntax Issue",
      "Runtime Error",
    ];
    res.json({ bugs: fallbackBugs.slice(0, req.body?.enemyCount || 4) });
  }
});

// Generate AI Test for Bug
app.post("/generate-test", async (req, res) => {
  try {
    const { bugName, playerLevel = 1 } = req.body || {};

    if (!bugName || !CODING_BUGS[bugName]) {
      return res.status(400).json({
        error: "Invalid bug name",
        availableBugs: Object.keys(CODING_BUGS),
      });
    }

    const bug = CODING_BUGS[bugName];

    const prompt = `You are a senior software developer creating a failing unit test for a common coding bug.

Bug: ${bugName}
Description: ${bug.description}
Context: ${bug.context}
Player Level: ${playerLevel}

Create a FAILING JavaScript unit test that demonstrates this bug. The test should:
1. Be realistic and educational
2. Show clear before/after expectations
3. Include a brief explanation
4. Be appropriate for level ${playerLevel} difficulty
5. Use Jest/Vitest syntax

Return only JSON in this exact format:
{
  "testCode": "// Your complete test code here with describe/it blocks",
  "explanation": "Brief explanation of what the bug does and why the test fails",
  "bugSeverity": "Low|Medium|High|Critical",
  "pointsWorth": 50-500
}`;

    // If no API key, return fallback immediately for non-tech demo use
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        testCode: `describe('${bugName} Bug Test', () => {\n  it('should demonstrate ${bug.description}', () => {\n    expect(true).toBe(false); // Simulated failure\n  });\n});`,
        explanation: `Demo mode: no AI key set. Showing a simulated failing test for ${bugName}.`,
        bugSeverity: "Medium",
        pointsWorth: 120,
        bugName,
        testPassed: false,
        executionTime: 50,
        timestamp: new Date().toISOString(),
      });
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response?.text?.() ?? "";

    // Extract JSON from response
    let testData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const clean = jsonMatch[0]
          .replace(/^```(json)?/i, "")
          .replace(/```$/i, "")
          .trim();
        testData = JSON.parse(clean);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      // Fallback test
      testData = {
        testCode: `describe('${bugName} Bug Test', () => {\n  it('should demonstrate ${bug.description}', () => {\n    // This test shows the ${bugName} bug\n    expect(true).toBe(false); // Simulated failure\n  });\n});`,
        explanation: `This test demonstrates a ${bugName} bug: ${bug.description}`,
        bugSeverity: "Medium",
        pointsWorth: 100,
      };
    }

    // Simulate test execution result
    const testResult = {
      ...testData,
      bugName,
      testPassed: false, // Always fails initially
      executionTime: Math.random() * 100 + 20, // 20-120ms
      timestamp: new Date().toISOString(),
    };

    res.json(testResult);
  } catch (error) {
    console.error("Error generating test:", error);
    res.status(500).json({
      error: "Failed to generate test",
      message: error.message,
    });
  }
});

// Simulate fixing the bug (test passes)
app.post("/fix-bug", async (req, res) => {
  try {
    const { bugName, testCode } = req.body;

    // Simulate AI fix generation
    const fixedResult = {
      bugName,
      testPassed: true,
      fixCode: `// Fixed: ${bugName}\n// The bug has been resolved!`,
      explanation: `Bug ${bugName} has been successfully fixed!`,
      executionTime: Math.random() * 50 + 10,
      timestamp: new Date().toISOString(),
    };

    res.json(fixedResult);
  } catch (error) {
    console.error("Error fixing bug:", error);
    res.status(500).json({ error: "Failed to fix bug" });
  }
});

// Save Score
app.post("/score", async (req, res) => {
  try {
    const { username, score, wave } = req.body;

    if (!username || score === undefined) {
      return res.status(400).json({ error: "Username and score required" });
    }

    const newScore = new Score({
      username: username.slice(0, 20), // Limit username length
      score: Math.max(0, Math.floor(score)), // Ensure positive integer
      wave: wave || 1,
    });

    await newScore.save();

    // Broadcast to all connected clients
    io.emit("newScore", {
      username: newScore.username,
      score: newScore.score,
      wave: newScore.wave,
      date: newScore.date,
    });

    res.json({
      message: "Score saved!",
      score: newScore,
    });
  } catch (error) {
    console.error("Error saving score:", error);
    res.status(500).json({ error: "Failed to save score" });
  }
});

// Get Leaderboard
app.get("/scores", async (req, res) => {
  try {
    const scores = await Score.find()
      .sort({ score: -1, date: -1 })
      .limit(10)
      .select("username score wave date");

    res.json(scores);
  } catch (error) {
    console.error("Error fetching scores:", error);
    res.status(500).json({ error: "Failed to fetch scores" });
  }
});

// Get available bugs
app.get("/bugs", (req, res) => {
  const bugs = Object.keys(CODING_BUGS).map((name) => ({
    name,
    ...CODING_BUGS[name],
  }));
  res.json(bugs);
});

// Socket.IO Connection
io.on("connection", (socket) => {
  console.log("🔌 Player connected:", socket.id);

  socket.on("joinLeaderboard", () => {
    socket.join("leaderboard");
    console.log("📊 Player joined leaderboard room");
  });

  socket.on("disconnect", () => {
    console.log("🔌 Player disconnected:", socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

server.listen(PORT, () => {
  console.log(`
🚀 Prompt Invaders Backend Server Running!
🔗 Port: ${PORT}
🌐 Environment: ${process.env.NODE_ENV || "development"}
📡 Socket.IO: Enabled
🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? "✅ Connected" : "❌ No API Key"}
📦 MongoDB: ${process.env.MONGODB_URI ? "✅ Connected" : "❌ No URI"}
  `);
});

module.exports = app;
