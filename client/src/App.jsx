import { useState, useRef, useEffect, useCallback } from "react";
import "./styles.css";
import { PromptInvadersGame } from "./Game.js";
import StartScreen from "./components/StartScreen.jsx";
import GameOverScreen from "./components/GameOverScreen.jsx";
import GameHUD from "./components/GameHUD.jsx";
import TestConsole from "./components/TestConsole.jsx";
import BugBoard from "./components/BugBoard.jsx";
import BugCard from "./components/BugCard.jsx";
import LearningSpotlight from "./components/LearningSpotlight.jsx";
import GameAPI from "./api.js";
import SRS from "./utils/SpacedRepetitionManager.js";
function App() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);

  const [gameState, setGameState] = useState("start"); // start, playing, gameOver
  const [gameStats, setGameStats] = useState({
    score: 0,
    wave: 1,
    lives: 3,
  });
  const [highScore, setHighScore] = useState(0);
  const [testResult, setTestResult] = useState(null);
  const [bugCard, setBugCard] = useState(null);
  const [bugsKilled, setBugsKilled] = useState([]);
  const [currentUsername, setCurrentUsername] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("checking"); // checking | online | offline
  const [showLearningSpotlight, setShowLearningSpotlight] = useState(false);
  const [currentLearningBug, setCurrentLearningBug] = useState(null);

  // (moved below callbacks)

  const handleStartGame = (username) => {
    setCurrentUsername(username || "Guest");
    setGameStats({ score: 0, wave: 1, lives: 3 });
    setTestResult(null);
    setGameState("playing");
  };

  const handleScoreUpdate = useCallback((stats) => {
    setGameStats(stats);
    // Only update high score display if current score exceeds it
    setHighScore((prev) => Math.max(prev, stats.score || 0));
  }, []);

  const handleTestResult = useCallback((result) => {
    setTestResult(result);

    // Track bugs killed for BugBoard
    if (result?.type === "success" && result?.bugName) {
      setBugsKilled((prev) => [
        ...prev,
        {
          bugName: result.bugName,
          points: result.points,
          timestamp: Date.now(),
          fixed: true,
        },
      ]);

      // Show learning spotlight for successful bug kills
      setCurrentLearningBug(result.bugName);
      setShowLearningSpotlight(true);
    }

    if (result?.type === "failure") {
      setBugCard({
        bugName: result.bugName,
        explanation: result.explanation,
        severity: result.severity,
        points: result.points,
        testCode: result.testCode,
      });
    } else if (result?.type === "success") {
      setBugCard((prev) =>
        prev ? { ...prev, explanation: result.explanation } : prev
      );
      if (result?.bugName) {
        SRS.recordOutcome(result.bugName, true);
      }
    } else if (result?.type === "wave-complete") {
      setBugCard(null);
    }

    if (result?.type === "retry") {
      if (result?.bugName) {
        SRS.recordOutcome(result.bugName, false);
      }
    }
  }, []);

  const handleGameOver = useCallback((finalStats) => {
    setGameStats((prev) => ({ ...prev, ...finalStats }));
    setGameState("gameOver");
  }, []);

  // Initialize game when moving to playing state
  useEffect(() => {
    // Offline/online status
    const updateStatus = () =>
      setConnectionStatus(navigator.onLine ? "online" : "offline");
    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    // Load high score from database when app starts
    const loadHighScore = async () => {
      try {
        const leaderboard = await GameAPI.getLeaderboard();
        if (leaderboard && leaderboard.length > 0) {
          const topScore = leaderboard[0].score || 0;
          setHighScore(topScore);
        }
      } catch (error) {
        console.log("Could not load high score:", error);
      }
    };

    loadHighScore();

    const initializeGame = async () => {
      try {
        const game = new PromptInvadersGame(
          canvasRef.current,
          handleScoreUpdate,
          handleTestResult,
          handleGameOver
        );

        const initialized = await game.init();
        if (initialized) {
          gameRef.current = game;
          game.startGame();
          console.log("🎮 Game initialized and started!");
        } else {
          console.error("❌ Failed to initialize game");
          setGameState("start");
        }
      } catch (error) {
        console.error("❌ Game initialization error:", error);
        setGameState("start");
      }
    };

    if (gameState === "playing" && canvasRef.current && !gameRef.current) {
      initializeGame();
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, [gameState, handleScoreUpdate, handleTestResult, handleGameOver]);

  const handleRestart = (username) => {
    if (gameRef.current) {
      gameRef.current.destroy();
      gameRef.current = null;
    }

    setCurrentUsername(username || currentUsername);
    setGameStats({ score: 0, wave: 1, lives: 3 });
    setTestResult(null);
    setBugsKilled([]); // Reset bugs killed for new game
    setGameState("playing");
  };

  const handleBackToMenu = () => {
    if (gameRef.current) {
      gameRef.current.destroy();
      gameRef.current = null;
    }

    setGameState("start");
    setGameStats({ score: 0, wave: 1, lives: 3 });
    setTestResult(null);
    setBugsKilled([]); // Reset bugs killed when going to menu
    setCurrentUsername("");
  };

  // Mobile controls
  const onPress = (code) => () => gameRef.current?.setKey(code, true);
  const onRelease = (code) => () => gameRef.current?.setKey(code, false);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    gameRef.current?.setAudioEnabled(!newMuted);
  };
  const togglePause = () => {
    gameRef.current?.togglePause();
    // Force a small state change to trigger label refresh if needed
    setTestResult((t) => (t ? { ...t } : t));
  };

  return (
    <div className="App">
      {gameState === "start" && <StartScreen onStartGame={handleStartGame} />}

      {gameState === "playing" && (
        <div className="game-container">
          <div className="game-canvas-container">
            <div ref={canvasRef} style={{ width: "100%", height: "100%" }} />

            <GameHUD
              score={gameStats.score}
              wave={gameStats.wave}
              lives={gameStats.lives}
              highScore={highScore}
              connectionStatus={connectionStatus}
            />

            <div className="controls-info">
              <div>🎮 CONTROLS:</div>
              <div>← → Move</div>
              <div>SPACE Shoot</div>
              <div>Player: {currentUsername}</div>
              <div>
                Status:{" "}
                {connectionStatus === "online" ? "🟢 Online" : "🟥 Offline"}
              </div>
              <div style={{ marginTop: 8 }}>
                <button
                  className="btn"
                  onClick={togglePause}
                  style={{ padding: "6px 10px", fontSize: 10 }}
                >
                  {gameRef.current?.isPaused ? "RESUME" : "PAUSE"}
                </button>
                <button
                  className="btn"
                  onClick={toggleMute}
                  style={{
                    padding: "6px 10px",
                    fontSize: 10,
                    borderColor: "#ff0080",
                    color: "#ff0080",
                  }}
                >
                  {isMuted ? "UNMUTE" : "MUTE"}
                </button>
                <button
                  className="btn"
                  onClick={handleBackToMenu}
                  style={{
                    padding: "6px 10px",
                    fontSize: 10,
                    borderColor: "#8000ff",
                    color: "#8000ff",
                  }}
                >
                  EXIT
                </button>
              </div>
            </div>

            {/* Mobile touch controls */}
            <div
              style={{
                position: "absolute",
                bottom: 10,
                right: 10,
                display: "flex",
                gap: 8,
              }}
            >
              <button
                className="btn"
                onTouchStart={onPress("ArrowLeft")}
                onTouchEnd={onRelease("ArrowLeft")}
                onMouseDown={onPress("ArrowLeft")}
                onMouseUp={onRelease("ArrowLeft")}
                onMouseLeave={onRelease("ArrowLeft")}
                style={{ padding: "10px 12px" }}
              >
                ◄
              </button>
              <button
                className="btn"
                onTouchStart={onPress("ArrowRight")}
                onTouchEnd={onRelease("ArrowRight")}
                onMouseDown={onPress("ArrowRight")}
                onMouseUp={onRelease("ArrowRight")}
                onMouseLeave={onRelease("ArrowRight")}
                style={{ padding: "10px 12px" }}
              >
                ►
              </button>
              <button
                className="btn"
                onTouchStart={onPress("Space")}
                onTouchEnd={onRelease("Space")}
                onMouseDown={onPress("Space")}
                onMouseUp={onRelease("Space")}
                onMouseLeave={onRelease("Space")}
                style={{
                  padding: "10px 12px",
                  borderColor: "#00d4ff",
                  color: "#00d4ff",
                }}
              >
                FIRE
              </button>
            </div>
          </div>

          <div className="game-sidebar">
            <TestConsole testResult={testResult} />
            <BugCard bug={bugCard} />
            <BugBoard gameStats={gameStats} bugsKilled={bugsKilled} />
          </div>
        </div>
      )}

      {gameState === "gameOver" && (
        <GameOverScreen
          score={gameStats.score}
          wave={gameStats.wave}
          onRestart={handleRestart}
          onBackToMenu={handleBackToMenu}
        />
      )}

      {/* Learning Spotlight - appears after successful bug kills */}
      <LearningSpotlight
        bugName={currentLearningBug}
        isVisible={showLearningSpotlight}
        onClose={() => {
          setShowLearningSpotlight(false);
          setCurrentLearningBug(null);
        }}
      />
    </div>
  );
}

export default App;
