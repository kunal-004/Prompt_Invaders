import { useState, useEffect } from "react";

const BugBoard = ({ gameStats, bugsKilled = [] }) => {
  const [totalBugsKilled, setTotalBugsKilled] = useState(0);
  const [uniqueBugTypes, setUniqueBugTypes] = useState(new Set());
  const [learningStats, setLearningStats] = useState({
    testsGenerated: 0,
    bugsFixed: 0,
    conceptsLearned: 0,
  });

  useEffect(() => {
    if (bugsKilled.length > 0) {
      setTotalBugsKilled(bugsKilled.length);
      const types = new Set(bugsKilled.map((bug) => bug.bugName || bug));
      setUniqueBugTypes(types);

      setLearningStats({
        testsGenerated: bugsKilled.length,
        bugsFixed: bugsKilled.filter((bug) => bug.fixed).length,
        conceptsLearned: types.size,
      });
    }
  }, [bugsKilled]);

  const getBugTypeColor = (bugType) => {
    const colors = {
      NullPointer: "#ff0080",
      IndexOutOfBounds: "#00d4ff",
      TypeError: "#00ff41",
      ReferenceError: "#8000ff",
      SyntaxError: "#ffaa44",
      MemoryLeak: "#ff6666",
      RaceCondition: "#66ff66",
      BufferOverflow: "#ff8800",
      LogicError: "#cc66ff",
      InfiniteLoop: "#ff4444",
    };
    return colors[bugType] || "#ffffff";
  };

  const getProgressMessage = () => {
    if (totalBugsKilled >= 50) return "🎓 Code Master!";
    if (totalBugsKilled >= 25) return "👨‍💻 Senior Debugger";
    if (totalBugsKilled >= 10) return "🐛 Bug Hunter";
    if (totalBugsKilled >= 5) return "🔍 Code Detective";
    if (totalBugsKilled >= 1) return "🚀 Getting Started";
    return "🎯 Ready to Learn";
  };

  return (
    <div className="bug-board">
      <h3>🐛 BUG HUNTING PROGRESS</h3>

      <div style={{ marginBottom: "15px" }}>
        <div
          style={{ color: "#00ff41", fontSize: "12px", marginBottom: "5px" }}
        >
          {getProgressMessage()}
        </div>
        <div style={{ color: "#00d4ff", fontSize: "10px" }}>
          Wave: {gameStats?.wave || 1} | Score:{" "}
          {(gameStats?.score || 0).toLocaleString()}
        </div>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <div
          style={{ color: "#ffaa44", fontSize: "11px", marginBottom: "8px" }}
        >
          📊 LEARNING STATS:
        </div>
        <div style={{ fontSize: "9px", lineHeight: "1.4" }}>
          <div style={{ color: "#ff0080" }}>
            🎯 Bugs Eliminated: {totalBugsKilled}
          </div>
          <div style={{ color: "#00d4ff" }}>
            🧪 AI Tests Generated: {learningStats.testsGenerated}
          </div>
          <div style={{ color: "#00ff41" }}>
            ✅ Concepts Learned: {learningStats.conceptsLearned}
          </div>
          <div style={{ color: "#8000ff" }}>
            🛠️ Bugs Fixed: {learningStats.bugsFixed}
          </div>
        </div>
      </div>

      {uniqueBugTypes.size > 0 && (
        <div>
          <div
            style={{ color: "#ffaa44", fontSize: "11px", marginBottom: "8px" }}
          >
            🎓 BUG TYPES MASTERED:
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px",
              fontSize: "8px",
            }}
          >
            {Array.from(uniqueBugTypes).map((bugType, index) => (
              <div
                key={index}
                style={{
                  background: "rgba(0,0,0,0.6)",
                  border: `1px solid ${getBugTypeColor(bugType)}`,
                  color: getBugTypeColor(bugType),
                  padding: "2px 6px",
                  borderRadius: "3px",
                  fontSize: "8px",
                }}
              >
                {bugType}
              </div>
            ))}
          </div>
        </div>
      )}

      {totalBugsKilled === 0 && (
        <div
          style={{
            color: "#666",
            fontSize: "10px",
            textAlign: "center",
            padding: "20px 0",
            lineHeight: "1.6",
          }}
        >
          🎯 Start shooting enemies to track your learning!
          <br />
          <br />
          Each bug you eliminate teaches you:
          <br />• How the bug works
          <br />• Why it's dangerous
          <br />• How AI fixes it
          <br />
          <br />
          🧠 Learn coding by playing!
        </div>
      )}

      <div
        style={{
          fontSize: "8px",
          color: "#666",
          textAlign: "center",
          marginTop: "15px",
          fontStyle: "italic",
        }}
      >
        "Every bug defeated makes you a better coder!"
      </div>
    </div>
  );
};

export default BugBoard;
