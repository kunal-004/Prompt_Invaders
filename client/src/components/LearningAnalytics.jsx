import React, { useState, useMemo } from "react";

export default function LearningAnalytics({ bugsKilled, isVisible, onClose }) {
  const [_selectedTimeframe, _setSelectedTimeframe] = useState("session"); // session, today, week

  const analytics = useMemo(() => {
    // Process bugs killed to extract learning insights
    const conceptsLearned = new Set();
    const skillCategories = {
      "Memory Management": 0,
      "Null Safety": 0,
      "Array Operations": 0,
      Security: 0,
      Concurrency: 0,
      "Type Safety": 0,
      "Logic & Flow": 0,
    };

    const bugTypeMapping = {
      "Null Dereference": { category: "Null Safety", difficulty: "Beginner" },
      "Array Overflow": {
        category: "Array Operations",
        difficulty: "Beginner",
      },
      "SQL Injection": { category: "Security", difficulty: "Intermediate" },
      "XSS Vulnerability": { category: "Security", difficulty: "Intermediate" },
      "Race Condition": { category: "Concurrency", difficulty: "Advanced" },
      "Memory Leak": {
        category: "Memory Management",
        difficulty: "Intermediate",
      },
      "Buffer Overflow": {
        category: "Memory Management",
        difficulty: "Advanced",
      },
      Deadlock: { category: "Concurrency", difficulty: "Advanced" },
      "Type Error": { category: "Type Safety", difficulty: "Beginner" },
      "Logic Error": { category: "Logic & Flow", difficulty: "Intermediate" },
    };

    bugsKilled.forEach((bug) => {
      conceptsLearned.add(bug);
      const mapping = bugTypeMapping[bug] || {
        category: "Logic & Flow",
        difficulty: "Beginner",
      };
      skillCategories[mapping.category]++;
    });

    const totalBugs = bugsKilled.length;
    const uniqueConcepts = conceptsLearned.size;
    const skillsWithProgress = Object.entries(skillCategories).filter(
      ([, count]) => count > 0
    );

    return {
      totalBugsKilled: totalBugs,
      uniqueConcepts,
      conceptsLearned: Array.from(conceptsLearned),
      skillCategories,
      skillsWithProgress,
      learningEfficiency:
        totalBugs > 0 ? ((uniqueConcepts / totalBugs) * 100).toFixed(1) : 0,
      nextRecommendations: getNextRecommendations(skillCategories, bugsKilled),
    };
  }, [bugsKilled]);

  const getNextRecommendations = (skills, killed) => {
    const recommendations = [];

    if (skills["Null Safety"] === 0) {
      recommendations.push({
        bug: "Null Dereference",
        reason: "Essential foundation - most common beginner bug",
        priority: "high",
      });
    }

    if (skills["Array Operations"] === 0) {
      recommendations.push({
        bug: "Array Overflow",
        reason: "Array handling is fundamental to programming",
        priority: "high",
      });
    }

    if (skills["Security"] === 0 && killed.length > 3) {
      recommendations.push({
        bug: "SQL Injection",
        reason: "Security awareness is crucial for web development",
        priority: "medium",
      });
    }

    if (skills["Concurrency"] === 0 && killed.length > 8) {
      recommendations.push({
        bug: "Race Condition",
        reason: "Advanced topic - master basics first, then tackle threading",
        priority: "low",
      });
    }

    return recommendations.slice(0, 3);
  };

  const getSkillLevel = (bugsCount) => {
    if (bugsCount < 3) return { level: "Novice", color: "#ffaa44", width: 25 };
    if (bugsCount < 8)
      return { level: "Learning", color: "#00d4ff", width: 50 };
    if (bugsCount < 15)
      return { level: "Competent", color: "#00ff41", width: 75 };
    return { level: "Expert", color: "#ff00ff", width: 100 };
  };

  if (!isVisible) return null;

  const overallLevel = getSkillLevel(analytics.totalBugsKilled);

  return (
    <div className="learning-analytics-overlay">
      <div className="learning-analytics">
        <div className="analytics-header">
          <h2>📊 Your Learning Journey</h2>
          <button onClick={onClose} className="close-btn">
            ×
          </button>
        </div>

        <div className="analytics-content">
          {/* Overall Progress */}
          <div className="progress-section">
            <div className="overall-stats">
              <div className="stat-card primary">
                <div className="stat-value">{analytics.totalBugsKilled}</div>
                <div className="stat-label">Bugs Defeated</div>
              </div>
              <div className="stat-card secondary">
                <div className="stat-value">{analytics.uniqueConcepts}</div>
                <div className="stat-label">Concepts Learned</div>
              </div>
              <div className="stat-card tertiary">
                <div className="stat-value">
                  {analytics.learningEfficiency}%
                </div>
                <div className="stat-label">Learning Efficiency</div>
              </div>
            </div>

            <div className="level-progress">
              <div className="level-info">
                <span
                  className="current-level"
                  style={{ color: overallLevel.color }}
                >
                  {overallLevel.level} Developer
                </span>
                <span className="progress-text">
                  {analytics.totalBugsKilled}/20 to next level
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${overallLevel.width}%`,
                    background: overallLevel.color,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Skill Categories */}
          <div className="skills-section">
            <h3>🎯 Skill Categories Mastered</h3>
            <div className="skills-grid">
              {analytics.skillsWithProgress.map(([skill, count]) => {
                const skillLevel = getSkillLevel(count);
                return (
                  <div key={skill} className="skill-card">
                    <div className="skill-header">
                      <span className="skill-name">{skill}</span>
                      <span className="skill-count">×{count}</span>
                    </div>
                    <div className="skill-progress">
                      <div
                        className="skill-bar"
                        style={{
                          width: `${skillLevel.width}%`,
                          background: skillLevel.color,
                        }}
                      />
                    </div>
                    <div
                      className="skill-level"
                      style={{ color: skillLevel.color }}
                    >
                      {skillLevel.level}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Concepts Learned */}
          {analytics.conceptsLearned.length > 0 && (
            <div className="concepts-section">
              <h3>🧠 Concepts You've Mastered</h3>
              <div className="concepts-list">
                {analytics.conceptsLearned.map((concept, index) => (
                  <div key={index} className="concept-badge">
                    {concept}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Recommendations */}
          {analytics.nextRecommendations.length > 0 && (
            <div className="recommendations-section">
              <h3>🎯 Recommended Next Steps</h3>
              <div className="recommendations-list">
                {analytics.nextRecommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`recommendation ${rec.priority}-priority`}
                  >
                    <div className="rec-header">
                      <span className="rec-bug">{rec.bug}</span>
                      <span className={`rec-priority priority-${rec.priority}`}>
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="rec-reason">{rec.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Tips */}
          <div className="tips-section">
            <h3>💡 Pro Learning Tips</h3>
            <div className="tips-list">
              <div className="tip">
                <span className="tip-icon">🎯</span>
                <span>
                  Focus on understanding WHY bugs happen, not just fixing them
                </span>
              </div>
              <div className="tip">
                <span className="tip-icon">🔄</span>
                <span>
                  Revisit concepts after a few days to strengthen memory
                </span>
              </div>
              <div className="tip">
                <span className="tip-icon">🧠</span>
                <span>
                  Try to predict what will break before shooting the bug
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-footer">
          <div className="learning-motto">
            "Every bug you defeat builds your debugging superpowers! 🦸‍♂️"
          </div>
        </div>
      </div>
    </div>
  );
}
