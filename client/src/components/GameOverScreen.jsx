import { useState } from 'react';
import GameAPI from '../api.js';

const GameOverScreen = ({ score, wave, onRestart, onBackToMenu }) => {
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSaveScore = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      await GameAPI.saveScore(username.trim(), score, wave);
      setSaved(true);
      
      // Auto restart after saving
      setTimeout(() => {
        onRestart(username.trim());
      }, 2000);
      
    } catch (error) {
      console.error('Failed to save score:', error);
      setError('Failed to save score. Try again!');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !saved) {
      handleSaveScore();
    }
  };

  const getPerformanceMessage = () => {
    if (score >= 10000) return "🏆 LEGENDARY DEBUGGER!";
    if (score >= 5000) return "🥇 MASTER CODE HUNTER!";
    if (score >= 2500) return "🥈 SENIOR BUG SLAYER!";
    if (score >= 1000) return "🥉 JUNIOR DEVELOPER!";
    return "👨‍💻 CODING CADET";
  };

  return (
    <div className="game-over-screen">
      <div className="game-title" style={{ color: '#ff0080' }}>
        MISSION COMPLETE
      </div>
      
      <div className="final-score">
        {getPerformanceMessage()}
      </div>

      <div style={{ 
        fontSize: '14px', 
        color: '#00d4ff', 
        margin: '20px 0',
        textAlign: 'center' 
      }}>
        <div>FINAL SCORE: {score.toLocaleString()}</div>
        <div>WAVES SURVIVED: {wave - 1}</div>
        <div style={{ fontSize: '10px', color: '#666', marginTop: '10px' }}>
          Bugs eliminated with AI-generated tests!
        </div>
      </div>

      {!saved ? (
        <div>
          <div style={{ margin: '20px 0' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Enter username for leaderboard"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={20}
              autoFocus
            />
          </div>

          {error && (
            <div style={{ color: '#ff4444', fontSize: '10px', margin: '10px 0' }}>
              {error}
            </div>
          )}

          <div>
            <button 
              className="btn" 
              onClick={handleSaveScore}
              disabled={saving || !username.trim()}
              style={{ 
                opacity: (saving || !username.trim()) ? 0.5 : 1,
                cursor: (saving || !username.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'SAVING...' : 'SAVE & PLAY AGAIN'}
            </button>
            
            <button 
              className="btn" 
              onClick={onBackToMenu}
              style={{ borderColor: '#8000ff', color: '#8000ff' }}
            >
              MAIN MENU
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ 
            color: '#44ff44', 
            fontSize: '12px', 
            margin: '20px 0' 
          }}>
            ✅ Score saved to leaderboard!
            <br />
            Starting new mission...
          </div>
          
          <div className="loading">Preparing next wave</div>
        </div>
      )}

      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '8px',
        color: '#666',
        textAlign: 'center'
      }}>
        🧠 Every bug taught you something new
        <br />
        Thanks to AI-powered learning!
      </div>
    </div>
  );
};

export default GameOverScreen;
