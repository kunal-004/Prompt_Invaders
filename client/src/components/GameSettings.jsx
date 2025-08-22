import React, { useState } from "react";

export default function GameSettings({ isVisible, onClose, onApplySettings }) {
  const [settings, setSettings] = useState({
    difficulty: "medium",
    bugTypes: {
      beginner: true,
      intermediate: true,
      advanced: true,
    },
    learningMode: "interactive",
    explanationDetail: "detailed",
    waveLength: "short",
    audioEnabled: true,
    showCodeExamples: true,
    pauseOnExplanation: true,
  });

  const handleSettingChange = (category, key, value) => {
    if (category) {
      setSettings((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value,
        },
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const applySettings = () => {
    onApplySettings(settings);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="game-settings-overlay">
      <div className="game-settings">
        <div className="settings-header">
          <h2>🎮 Game Settings</h2>
          <button onClick={onClose} className="close-btn">
            ×
          </button>
        </div>

        <div className="settings-content">
          {/* Learning Experience */}
          <div className="setting-section">
            <h3>📚 Learning Experience</h3>

            <div className="setting-item">
              <label>Learning Mode:</label>
              <select
                value={settings.learningMode}
                onChange={(e) =>
                  handleSettingChange(null, "learningMode", e.target.value)
                }
              >
                <option value="interactive">
                  🎯 Interactive (Recommended)
                </option>
                <option value="explanatory">📖 Detailed Explanations</option>
                <option value="quick">⚡ Quick & Simple</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Bug Explanation Detail:</label>
              <select
                value={settings.explanationDetail}
                onChange={(e) =>
                  handleSettingChange(null, "explanationDetail", e.target.value)
                }
              >
                <option value="simple">🌟 Simple (Plain English)</option>
                <option value="detailed">🧠 Detailed (Code + Context)</option>
                <option value="technical">⚙️ Technical (Full Details)</option>
              </select>
            </div>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.showCodeExamples}
                  onChange={(e) =>
                    handleSettingChange(
                      null,
                      "showCodeExamples",
                      e.target.checked
                    )
                  }
                />
                Show code examples in explanations
              </label>
            </div>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.pauseOnExplanation}
                  onChange={(e) =>
                    handleSettingChange(
                      null,
                      "pauseOnExplanation",
                      e.target.checked
                    )
                  }
                />
                Pause game during bug explanations
              </label>
            </div>
          </div>

          {/* Difficulty & Bug Types */}
          <div className="setting-section">
            <h3>🎯 Difficulty & Bug Types</h3>

            <div className="setting-item">
              <label>Overall Difficulty:</label>
              <select
                value={settings.difficulty}
                onChange={(e) =>
                  handleSettingChange(null, "difficulty", e.target.value)
                }
              >
                <option value="easy">🟢 Easy (Beginner Friendly)</option>
                <option value="medium">🟡 Medium (Balanced)</option>
                <option value="hard">🔴 Hard (Challenge Mode)</option>
                <option value="adaptive">🎲 Adaptive (AI Adjusts)</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Bug Types to Include:</label>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.bugTypes.beginner}
                    onChange={(e) =>
                      handleSettingChange(
                        "bugTypes",
                        "beginner",
                        e.target.checked
                      )
                    }
                  />
                  🟢 Beginner (Null, Array bounds)
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.bugTypes.intermediate}
                    onChange={(e) =>
                      handleSettingChange(
                        "bugTypes",
                        "intermediate",
                        e.target.checked
                      )
                    }
                  />
                  🟡 Intermediate (Logic, Type errors)
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.bugTypes.advanced}
                    onChange={(e) =>
                      handleSettingChange(
                        "bugTypes",
                        "advanced",
                        e.target.checked
                      )
                    }
                  />
                  🔴 Advanced (Concurrency, Memory)
                </label>
              </div>
            </div>

            <div className="setting-item">
              <label>Wave Length:</label>
              <select
                value={settings.waveLength}
                onChange={(e) =>
                  handleSettingChange(null, "waveLength", e.target.value)
                }
              >
                <option value="short">⚡ Short (3-5 bugs)</option>
                <option value="medium">⏱️ Medium (6-8 bugs)</option>
                <option value="long">🏃 Long (10+ bugs)</option>
              </select>
            </div>
          </div>

          {/* Audio & Visual */}
          <div className="setting-section">
            <h3>🎵 Audio & Visual</h3>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.audioEnabled}
                  onChange={(e) =>
                    handleSettingChange(null, "audioEnabled", e.target.checked)
                  }
                />
                Enable sound effects
              </label>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <div className="learning-tip">
            💡 <strong>Tip:</strong> Interactive mode with detailed explanations
            maximizes learning retention!
          </div>
          <div className="settings-buttons">
            <button onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button onClick={applySettings} className="apply-btn">
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
