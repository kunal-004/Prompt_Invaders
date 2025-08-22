const GameHUD = ({ score, wave, lives, highScore, connectionStatus }) => {
  return (
    <div className="game-hud">
      <div className="hud-left">
        <div className="score-display">SCORE: {score.toLocaleString()}</div>
        {typeof highScore === "number" && (
          <div className="score-display" style={{ color: "#ffaa44" }}>
            HIGH: {highScore.toLocaleString()}
          </div>
        )}
        <div className={`connection-status ${connectionStatus || "checking"}`}>
          {connectionStatus === "online"
            ? "🟢 ONLINE"
            : connectionStatus === "offline"
            ? "🔴 OFFLINE"
            : "🟡 CHECKING..."}
        </div>
      </div>

      <div className="hud-center">
        <div className="wave-display">WAVE {wave}</div>
      </div>

      <div className="hud-right">
        <div className="lives-display">
          LIVES: {"💚".repeat(Math.max(0, lives))}
        </div>
        <div style={{ fontSize: "10px", color: "#888", marginTop: "5px" }}>
          ← → MOVE | SPACE SHOOT
        </div>
      </div>
    </div>
  );
};

export default GameHUD;
