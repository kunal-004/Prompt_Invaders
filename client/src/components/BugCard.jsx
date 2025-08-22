const BugCard = ({ bug }) => {
  if (!bug) return null;
  const { bugName, explanation, severity, points, testCode } = bug;
  const quickTake = {
    NullPointer: "Tried to use something that wasn't there yet.",
    IndexOutOfBounds: "Looked past the end of a list.",
    TypeError: "Used the wrong kind of thing.",
    ReferenceError: "Named something that doesn't exist.",
    SyntaxError: "Typing/grammar error in code.",
    MemoryLeak: "Forgot to tidy up memory.",
    RaceCondition: "Two actions collided in time.",
    BufferOverflow: "Put too much into a container.",
    LogicError: "Steps fine, idea wrong.",
    InfiniteLoop: "Didn't know when to stop.",
  };
  return (
    <div
      style={{
        border: "2px solid #ff0080",
        padding: "10px",
        marginTop: "10px",
        borderRadius: "4px",
        background: "rgba(0,0,0,0.6)",
      }}
    >
      <div style={{ color: "#ff0080", fontSize: 12, marginBottom: 6 }}>
        🐛 Bug Spotlight: <span className="bug-name">{bugName}</span>
      </div>
      <div style={{ color: "#ccc", fontSize: 10, marginBottom: 6 }}>
        {explanation || "AI explains this bug when shot."}
      </div>
      <div style={{ color: "#ffaa44", fontSize: 10, marginBottom: 6 }}>
        Severity: {severity || "—"} | Points: {points || "—"}
      </div>
      <div style={{ color: "#00d4ff", fontSize: 10, marginBottom: 6 }}>
        Quick takeaway:{" "}
        {quickTake[bugName] || "A common coding mistake was shown and fixed."}
      </div>
      {testCode && (
        <details>
          <summary
            style={{ color: "#00d4ff", cursor: "pointer", fontSize: 10 }}
          >
            View Test
          </summary>
          <pre
            style={{
              fontSize: 8,
              color: "#ff6666",
              background: "#1a0000",
              padding: 6,
              overflow: "auto",
            }}
          >
            {testCode}
          </pre>
        </details>
      )}
      <div style={{ fontSize: 9, color: "#66ff66", marginTop: 6 }}>
        Tip: Watch the failing test, then the fix. You learn as you play!
      </div>
    </div>
  );
};

export default BugCard;
