import { useState } from "react";

const StartScreen = ({ onStartGame }) => {
  const [username, setUsername] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);

  const handleStart = () => {
    const name = username.trim() || "Guest";
    onStartGame(name);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleStart();
    }
  };

  return (
    <div className="start-screen">
      <div className="game-title">PROMPT INVADERS</div>

      <div className="game-subtitle">
        🎯 <strong>Learn coding by shooting bugs!</strong>
        <br />
        Skip boring PDFs → Blast bugs → AI explains them instantly.
        <br />
        <span style={{ color: "#00ff41" }}>
          Active learning that sticks in your brain!
        </span>
      </div>

      <div style={{ margin: "20px 0" }}>
        <input
          type="text"
          className="input-field"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
          maxLength={20}
          autoFocus
        />
      </div>

      <div>
        <button className="btn" onClick={handleStart}>
          START MISSION
        </button>
        <button
          className="btn"
          onClick={() => onStartGame("Guest")}
          style={{ borderColor: "#ff0080", color: "#ff0080" }}
        >
          QUICK PLAY
        </button>

        <button
          className="btn"
          onClick={() => setShowInstructions(!showInstructions)}
          style={{ borderColor: "#00d4ff", color: "#00d4ff" }}
        >
          {showInstructions ? "HIDE" : "HOW TO PLAY"}
        </button>
      </div>

      {showInstructions && (
        <div
          style={{
            maxWidth: "500px",
            margin: "20px auto",
            padding: "20px",
            border: "2px solid #00d4ff",
            borderRadius: "8px",
            fontSize: "10px",
            lineHeight: "1.6",
            color: "#00d4ff",
            textAlign: "left",
          }}
        >
          <h4 style={{ color: "#00ff41", marginBottom: "10px" }}>
            � WHY THIS BEATS READING DOCS:
          </h4>
          <ul style={{ paddingLeft: "20px", marginBottom: "15px" }}>
            <li>🎮 Interactive = more memorable than reading</li>
            <li>🎯 See bugs fail in real tests</li>
            <li>🤖 AI explains WHY each bug breaks code</li>
            <li>⚡ Learn by doing, not by reading boring PDFs</li>
            <li>🧠 Visual + hands-on = knowledge that sticks</li>
            <li>🚀 Build debugging skills through gameplay</li>
          </ul>

          <h4 style={{ color: "#ff0080", marginBottom: "10px" }}>
            🎮 SIMPLE CONTROLS:
          </h4>
          <ul style={{ paddingLeft: "20px", marginBottom: "15px" }}>
            <li>← → arrows to move your ship</li>
            <li>SPACEBAR to shoot bugs</li>
            <li>Each bug teaches you something new</li>
            <li>No coding experience required!</li>
          </ul>

          <h4 style={{ color: "#8000ff", marginBottom: "10px" }}>
            🧠 LEARNING PROCESS:
          </h4>
          <ul style={{ paddingLeft: "20px" }}>
            <li>1. Shoot a bug (like "Null Pointer")</li>
            <li>2. See the bug fail in a real test</li>
            <li>3. AI explains what went wrong</li>
            <li>4. Watch AI fix the code</li>
            <li>5. You remember it forever!</li>
          </ul>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "8px",
          color: "#666",
        }}
      >
        Powered by Gemini AI • Interactive Learning Revolution
      </div>
    </div>
  );
};

export default StartScreen;
