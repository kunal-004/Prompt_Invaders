import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { API_CONFIG } from "../config.js";
import GameAPI from "../api.js";

const Leaderboard = ({ onHighScoreUpdate }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Socket.IO connection (best-effort)
    let socketConnection;
    try {
      socketConnection = io(API_CONFIG.SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnectionAttempts: 3,
      });
    } catch (error) {
      console.warn("Socket init failed, running in offline mode", error);
    }

    // Join leaderboard room
    socketConnection?.emit("joinLeaderboard");

    // Listen for new scores
    socketConnection?.on("newScore", (newScore) => {
      setScores((prevScores) => {
        const updated = [newScore, ...prevScores]
          .sort(
            (a, b) => b.score - a.score || new Date(b.date) - new Date(a.date)
          )
          .slice(0, 10);

        // Update high score when new scores come in
        if (updated.length > 0 && onHighScoreUpdate) {
          onHighScoreUpdate(updated[0].score || 0);
        }

        return updated;
      });
    });

    // Load initial leaderboard
    const loadInitialLeaderboard = async () => {
      try {
        setLoading(true);
        const leaderboardData = await GameAPI.getLeaderboard();
        setScores(leaderboardData);

        // Update the high score in parent component
        if (
          leaderboardData &&
          leaderboardData.length > 0 &&
          onHighScoreUpdate
        ) {
          onHighScoreUpdate(leaderboardData[0].score || 0);
        }
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialLeaderboard();

    return () => {
      try {
        socketConnection?.disconnect();
      } catch (error) {
        console.debug("Socket disconnect ignored", error);
      }
    };
  }, [onHighScoreUpdate]);

  const getRankEmoji = (rank) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `${rank}.`;
    }
  };

  return (
    <div className="leaderboard">
      <h3>🏆 HIGH SCORES</h3>
      {loading ? (
        <div className="loading">Loading scores</div>
      ) : scores.length === 0 ? (
        <div style={{ color: "#666", fontSize: "10px", textAlign: "center" }}>
          No scores yet!
          <br />
          Be the first to play.
        </div>
      ) : (
        <div>
          {scores.map((score, index) => (
            <div
              key={`${score.username}-${score.date}`}
              className="leaderboard-entry"
            >
              <span className="leaderboard-rank">
                {getRankEmoji(index + 1)}
              </span>
              <span className="leaderboard-name">{score.username}</span>
              <span className="leaderboard-score">
                {score.score.toLocaleString()}
              </span>
            </div>
          ))}
          {scores.length < 10 && (
            <div
              style={{
                color: "#666",
                fontSize: "8px",
                textAlign: "center",
                marginTop: "10px",
              }}
            >
              {10 - scores.length} more slots available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
