import React, { useEffect, useState } from "react";
// Monaco editor import will be added after dependency install

export default function DebugModal({
  buggyCode,
  failingTest,
  hints,
  onApplyFix,
  onClose,
  testResult,
  ghostDiff,
  isVisible,
  hpLoss,
  retryHint,
}) {
  const [code, setCode] = useState(buggyCode || "");
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setCode(buggyCode || "");
    setIsRunning(false);
  }, [buggyCode, isVisible]);

  useEffect(() => {
    if (testResult === "pass" || testResult === "fail") {
      setIsRunning(false);
    }
  }, [testResult]);

  if (!isVisible) return null;

  return (
    <div className="debug-modal-overlay">
      <div className="debug-modal">
        <div className="modal-header">
          <h2>🧩 Debug-Quest: Freeze-Time Puzzle</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-content">
          <div className="buggy-code-section">
            <h3>Buggy Code</h3>
            <pre className="buggy-code-block">{buggyCode}</pre>
          </div>
          <div className="failing-test-section">
            <h3>Failing Test</h3>
            <pre className="failing-test-block">{failingTest}</pre>
          </div>
          <div className="hints-section">
            <h3>Hints</h3>
            <ul>
              {(hints || []).map((hint, i) => (
                <li key={i} className="hint-bullet">
                  • {hint}
                </li>
              ))}
              {retryHint && (
                <li className="hint-bullet retry">• {retryHint}</li>
              )}
            </ul>
          </div>
          <div className="editor-section">
            <h3>Fix the Bug</h3>
            {/* Monaco Editor will go here */}
            <textarea
              className="debug-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={Math.min(15, code.split("\n").length + 2)}
              spellCheck={false}
            />
            {ghostDiff && <pre className="ghost-diff">{ghostDiff}</pre>}
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="apply-btn"
            onClick={() => {
              setIsRunning(true);
              onApplyFix(code);
            }}
            disabled={isRunning}
          >
            Apply & Run Test
          </button>
          {isRunning && (
            <div className="test-progress-bar">
              <div className="progress-spinner" />
              <span>Running test...</span>
            </div>
          )}
          {testResult === "pass" && (
            <div className="test-success">
              ✅ Test Passed! Enemy self-destructs!
            </div>
          )}
          {testResult === "fail" && (
            <div className="test-failure">
              ❌ Test Failed! You lose {hpLoss} HP. Try again with an extra
              hint.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
