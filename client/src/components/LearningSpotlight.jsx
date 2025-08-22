import { useState } from "react";

const LearningSpotlight = ({ bugName, isVisible, onClose }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!isVisible || !bugName) return null;

  const bugInsights = {
    "Null Dereference": {
      emoji: "🕳️",
      realWorld:
        "This happens when you try to use a variable that's empty. Like asking 'What's your favorite color?' to someone who isn't there!",
      codeExample: "user.name // Crashes if user is null",
      preventTip: "Always check: if (user) { console.log(user.name); }",
      whenItHappens: "API calls, form data, database results",
      severity: "HIGH",
      color: "#ff4444",
    },
    "Array Overflow": {
      emoji: "📦",
      realWorld:
        "You tried to get item #10 from a list that only has 5 items. Like asking for the 10th slice of a 5-slice pizza!",
      codeExample: "items[9] // Crashes if items has only 5 elements",
      preventTip: "Check length first: if (index < items.length) { ... }",
      whenItHappens: "Loops, user input, data processing",
      severity: "MEDIUM",
      color: "#ffaa44",
    },
    "SQL Injection": {
      emoji: "💉",
      realWorld:
        "Hackers can sneak evil commands through your login form. Like someone whispering instructions to your database behind your back!",
      codeExample: "SELECT * WHERE user='" + "' + userInput + '",
      preventTip: "Use prepared statements: SELECT * WHERE user=?",
      whenItHappens: "Login forms, search boxes, any user input",
      severity: "CRITICAL",
      color: "#cc0000",
    },
    "Race Condition": {
      emoji: "🏃‍♂️",
      realWorld:
        "Two parts of your program raced to finish first and crashed into each other. Like two people trying to go through a door at the same time!",
      codeExample: "counter++ // Unsafe if multiple threads access",
      preventTip: "Use locks: synchronized(lock) { counter++; }",
      whenItHappens: "Multi-threaded apps, async operations",
      severity: "HIGH",
      color: "#ff6600",
    },
  };

  const insight = bugInsights[bugName] || {
    emoji: "🐛",
    realWorld: `You just encountered a ${bugName}! This is a common coding issue.`,
    codeExample: "// Code example not available",
    preventTip: "Follow best practices to avoid this issue.",
    whenItHappens: "Various programming scenarios",
    severity: "MEDIUM",
    color: "#ffaa44",
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "rgba(0, 0, 0, 0.95)",
        border: `3px solid ${insight.color}`,
        borderRadius: "12px",
        padding: "20px",
        maxWidth: "500px",
        zIndex: 2000,
        boxShadow: `0 0 30px ${insight.color}50`,
        animation: "slideIn 0.3s ease-out",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "15px" }}>
        <div style={{ fontSize: "32px", marginBottom: "8px" }}>
          {insight.emoji}
        </div>
        <div
          style={{ color: insight.color, fontSize: "16px", fontWeight: "bold" }}
        >
          BUG ELIMINATED: {bugName}
        </div>
        <div style={{ color: "#ffaa44", fontSize: "10px", marginTop: "4px" }}>
          Severity: {insight.severity} | 🧠 Learning Moment!
        </div>
      </div>

      {/* Real-world explanation */}
      <div
        style={{
          background: "rgba(255, 170, 68, 0.1)",
          border: "1px solid #ffaa44",
          borderRadius: "6px",
          padding: "12px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            color: "#ffaa44",
            fontSize: "12px",
            fontWeight: "bold",
            marginBottom: "6px",
          }}
        >
          🌍 What this means in plain English:
        </div>
        <div style={{ color: "#ffffff", fontSize: "11px", lineHeight: "1.4" }}>
          {insight.realWorld}
        </div>
      </div>

      {/* Code insight */}
      {showDetails && (
        <>
          <div
            style={{
              background: "rgba(255, 68, 68, 0.1)",
              border: "1px solid #ff4444",
              borderRadius: "6px",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                color: "#ff4444",
                fontSize: "10px",
                fontWeight: "bold",
                marginBottom: "4px",
              }}
            >
              ❌ Problematic Code:
            </div>
            <code
              style={{
                color: "#ffcccc",
                fontSize: "9px",
                fontFamily: "monospace",
              }}
            >
              {insight.codeExample}
            </code>
          </div>

          <div
            style={{
              background: "rgba(0, 255, 65, 0.1)",
              border: "1px solid #00ff41",
              borderRadius: "6px",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                color: "#00ff41",
                fontSize: "10px",
                fontWeight: "bold",
                marginBottom: "4px",
              }}
            >
              ✅ How to prevent it:
            </div>
            <code
              style={{
                color: "#ccffcc",
                fontSize: "9px",
                fontFamily: "monospace",
              }}
            >
              {insight.preventTip}
            </code>
          </div>

          <div
            style={{ color: "#00d4ff", fontSize: "9px", marginBottom: "12px" }}
          >
            🎯 <strong>When you'll see this:</strong> {insight.whenItHappens}
          </div>
        </>
      )}

      {/* Actions */}
      <div style={{ textAlign: "center" }}>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: "none",
            border: "2px solid #00d4ff",
            color: "#00d4ff",
            padding: "8px 16px",
            marginRight: "10px",
            cursor: "pointer",
            fontSize: "10px",
            borderRadius: "4px",
          }}
        >
          {showDetails ? "Hide Details" : "Show Code Examples"}
        </button>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "2px solid #00ff41",
            color: "#00ff41",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: "10px",
            borderRadius: "4px",
          }}
        >
          Got It! Continue Learning
        </button>
      </div>

      <div
        style={{
          fontSize: "8px",
          color: "#666",
          textAlign: "center",
          marginTop: "10px",
          fontStyle: "italic",
        }}
      >
        🎓 You're building real coding skills through play!
      </div>
    </div>
  );
};

export default LearningSpotlight;
