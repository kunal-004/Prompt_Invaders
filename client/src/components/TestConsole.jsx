import { useState, useEffect, useMemo } from "react";

const TestConsole = ({ testResult }) => {
  const [messages, setMessages] = useState([]);
  const [showLearningMode, setShowLearningMode] = useState(true);

  useEffect(() => {
    if (testResult) {
      const timestamp = new Date().toLocaleTimeString();
      let message = {
        id: Date.now(),
        timestamp,
        type: testResult.type,
        content: testResult,
      };

      setMessages((prev) => [...prev, message].slice(-10)); // Keep last 10 messages
    }
  }, [testResult]);

  const plainExplain = useMemo(
    () => ({
      // Dynamic explanations based on real bug names
      "Null Dereference":
        "🎯 You tried to use something that was empty/null - like asking a ghost to dance!",
      "Undefined Access":
        "🕳️ You reached for something that wasn't there - like opening an empty box.",
      "Array Overflow":
        "📦 You tried to grab item #10 from a box that only has 5 items.",
      "SQL Injection":
        "💉 Hackers can sneak evil code through your login form - always clean user input!",
      "XSS Vulnerability":
        "🎭 Malicious scripts can pretend to be your website - sanitize everything!",
      "Race Condition":
        "🏃‍♂️ Two processes raced to finish first and crashed into each other.",
      "Memory Leak":
        "🧠💧 Your program keeps asking for memory but forgets to give it back.",
      "Buffer Overflow":
        "🪣 You poured too much water (data) into a small cup (buffer).",
      Deadlock:
        "🔒 Two programs are waiting for each other forever - like a polite door standoff!",

      // Fallback explanations
      NullPointer: "Tried to use something that doesn't exist yet.",
      IndexOutOfBounds: "Looked for an item past the end of a list.",
      TypeError: "Mixed up types (like adding a number to a word).",
      ReferenceError: "Used a name the program doesn't recognize.",
      SyntaxError: "Code grammar typo. The computer couldn't read it.",
      MemoryLeak: "Forgot to clean up, so memory kept filling up.",
      RaceCondition: "Two things happened at once and clashed.",
      BufferOverflow: "Packed more data than a container could hold.",
      LogicError: "The steps were valid, but the idea was wrong.",
      InfiniteLoop: "Got stuck repeating forever.",
    }),
    []
  );

  const renderMessage = (msg) => {
    const { content, timestamp } = msg;

    switch (content.type) {
      case "generating":
        return (
          <div key={msg.id} className="test-output">
            <div className="test-warning">
              [{timestamp}] {content.message}
            </div>
          </div>
        );

      case "failure":
        return (
          <div key={msg.id} className="test-output">
            <div className="test-failure">
              [{timestamp}] 🎯 BUG DETECTED: {content.bugName}
            </div>
            <div className="test-warning">
              Severity: {content.severity} | Points: {content.points}
            </div>

            {/* Learning-focused explanation */}
            <div
              style={{
                background: "rgba(255, 170, 68, 0.1)",
                border: "1px solid #ffaa44",
                padding: "8px",
                margin: "8px 0",
                borderRadius: "4px",
              }}
            >
              <div
                style={{
                  color: "#ffaa44",
                  fontSize: "11px",
                  fontWeight: "bold",
                  marginBottom: "4px",
                }}
              >
                🧠 What you just learned by shooting this bug:
              </div>
              <div
                style={{
                  color: "#ffaa44",
                  fontSize: "10px",
                  lineHeight: "1.4",
                }}
              >
                {plainExplain[content.bugName] ||
                  "A common coding issue was demonstrated."}
              </div>
            </div>

            <div style={{ color: "#666", fontSize: "9px", margin: "5px 0" }}>
              Technical details: {content.explanation}
            </div>

            <details style={{ margin: "5px 0" }}>
              <summary
                style={{ color: "#ff6666", fontSize: "9px", cursor: "pointer" }}
              >
                👀 View the failing test code
              </summary>
              <pre
                style={{
                  fontSize: "8px",
                  color: "#ff6666",
                  backgroundColor: "#1a0000",
                  padding: "5px",
                  borderRadius: "2px",
                  overflow: "auto",
                  maxHeight: "80px",
                  marginTop: "4px",
                }}
              >
                {content.testCode}
              </pre>
            </details>
          </div>
        );

      case "success":
        return (
          <div key={msg.id} className="test-output">
            <div className="test-success">
              [{timestamp}] 🎉 BUG ELIMINATED: {content.bugName}
            </div>
            <div className="test-success">
              +{content.points} points | Knowledge gained!
            </div>

            {/* Victory learning moment */}
            <div
              style={{
                background: "rgba(0, 255, 65, 0.1)",
                border: "1px solid #00ff41",
                padding: "8px",
                margin: "8px 0",
                borderRadius: "4px",
              }}
            >
              <div
                style={{
                  color: "#00ff41",
                  fontSize: "11px",
                  fontWeight: "bold",
                  marginBottom: "4px",
                }}
              >
                🏆 Victory! You now understand:
              </div>
              <div
                style={{
                  color: "#00ff41",
                  fontSize: "10px",
                  lineHeight: "1.4",
                }}
              >
                How to prevent {content.bugName} in real code. This knowledge
                will save you debugging time!
              </div>
            </div>

            <div style={{ color: "#66ff66", fontSize: "9px", margin: "5px 0" }}>
              Fix explanation: {content.explanation}
            </div>
            <div style={{ color: "#00d4ff", fontSize: "9px", margin: "5px 0" }}>
              💡 Pro tip: You can now recognize and avoid this bug pattern in
              your own projects.
            </div>
          </div>
        );

      case "wave-complete":
        return (
          <div key={msg.id} className="test-output">
            <div className="test-success">
              [{timestamp}] 🎉 {content.message}
            </div>
            <div className="test-warning">
              Advancing to Wave {content.wave}...
            </div>
          </div>
        );

      case "error":
        return (
          <div key={msg.id} className="test-output">
            <div className="test-failure">
              [{timestamp}] ⚠️ {content.bugName}: {content.message}
            </div>
          </div>
        );
      case "info":
        return (
          <div key={msg.id} className="test-output">
            <div className="test-warning">
              [{timestamp}] {content.message}
            </div>
          </div>
        );

      default:
        return (
          <div key={msg.id} className="test-output">
            <div>
              [{timestamp}] {JSON.stringify(content)}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="test-console">
      <h3>🧠 LEARNING CONSOLE</h3>
      <div
        style={{
          fontSize: "11px",
          color: "#ffaa44",
          textAlign: "left",
          marginBottom: "8px",
        }}
      >
        Shoot bugs → Learn concepts → Remember forever
      </div>

      <div style={{ height: "calc(100% - 76px)", overflowY: "auto" }}>
        {messages.length === 0 ? (
          <div
            style={{
              color: "#666",
              fontSize: "10px",
              textAlign: "center",
              padding: "20px 0",
              lineHeight: "1.8",
            }}
          >
            🎯 <strong>Active Learning Mode Activated!</strong>
            <br />
            <br />
            🎮 <strong>How it works:</strong>
            <br />
            • Shoot a bug → See it fail in a test
            <br />
            • AI explains WHY it breaks
            <br />
            • Watch the AI fix it
            <br />
            • You remember it forever!
            <br />
            <br />
            📚 <strong>Why this beats reading docs:</strong>
            <br />
            • Interactive = memorable
            <br />
            • See real code examples
            <br />
            • Learn by doing, not reading
            <br />
            <br />
            <span style={{ color: "#00ff41" }}>
              🚀 Start shooting to learn your first bug!
            </span>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "5px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "8px",
          color: "#8000ff",
          textAlign: "center",
        }}
      >
        <button
          onClick={() => setShowLearningMode(!showLearningMode)}
          style={{
            background: "none",
            border: "1px solid #8000ff",
            color: "#8000ff",
            fontSize: "8px",
            padding: "2px 6px",
            cursor: "pointer",
          }}
        >
          {showLearningMode ? "📖 Learning Mode" : "🤖 Tech Mode"}
        </button>
      </div>
    </div>
  );
};

export default TestConsole;
