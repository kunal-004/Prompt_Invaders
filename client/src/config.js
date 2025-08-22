// Game configuration constants
export const GAME_CONFIG = {
  // Canvas dimensions
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,

  // Player settings
  PLAYER_WIDTH: 40,
  PLAYER_HEIGHT: 30,
  PLAYER_SPEED: 5,
  PLAYER_COLOR: 0x00ff41,

  // Enemy settings
  ENEMY_WIDTH: 35,
  ENEMY_HEIGHT: 25,
  ENEMY_SPEED: 1,
  ENEMY_COLOR: 0xff0080,
  ENEMY_ROWS: 2, // Reduced from 3 for shorter waves
  ENEMY_COLS: 4, // Reduced from 8 for shorter waves
  ENEMY_SPACING_X: 80,
  ENEMY_SPACING_Y: 60,
  ENEMY_START_Y: 50,

  // Bullet settings
  BULLET_WIDTH: 4,
  BULLET_HEIGHT: 10,
  BULLET_SPEED: 8,
  BULLET_COLOR: 0x00d4ff,

  // Game mechanics
  LIVES: 3,
  POINTS_PER_ENEMY: 100,
  WAVE_BONUS: 500,

  // Colors
  COLORS: {
    NEON_GREEN: 0x00ff41,
    NEON_BLUE: 0x00d4ff,
    NEON_PINK: 0xff0080,
    NEON_PURPLE: 0x8000ff,
    WHITE: 0xffffff,
    BLACK: 0x000000,
  },
};

// Dynamic difficulty configuration for AI-generated bugs
export const DIFFICULTY_CONFIG = {
  WAVE_THEMES: {
    1: {
      theme: "Basic Programming",
      complexity: "Beginner",
      examples: ["null reference", "undefined variable", "syntax error"],
    },
    2: {
      theme: "Data Handling",
      complexity: "Intermediate",
      examples: ["array bounds", "type conversion", "string manipulation"],
    },
    3: {
      theme: "Web Security",
      complexity: "Advanced",
      examples: ["SQL injection", "XSS vulnerability", "CSRF attack"],
    },
    4: {
      theme: "Concurrency",
      complexity: "Expert",
      examples: ["race condition", "deadlock", "thread synchronization"],
    },
    5: {
      theme: "Performance",
      complexity: "Master",
      examples: ["memory leak", "infinite recursion", "algorithm complexity"],
    },
    6: {
      theme: "Architecture",
      complexity: "Architect",
      examples: [
        "design pattern violation",
        "circular dependency",
        "tight coupling",
      ],
    },
    7: {
      theme: "Advanced Security",
      complexity: "Security Expert",
      examples: [
        "buffer overflow",
        "privilege escalation",
        "cryptographic weakness",
      ],
    },
    8: {
      theme: "Distributed Systems",
      complexity: "System Expert",
      examples: [
        "network partition",
        "consensus failure",
        "distributed deadlock",
      ],
    },
  },

  MAX_WAVE: 8, // After this, cycle with increasing difficulty multiplier

  // Fallback bugs if AI generation fails
  FALLBACK_BUGS: [
    "NullPointer",
    "IndexOutOfBounds",
    "TypeError",
    "ReferenceError",
    "SyntaxError",
    "MemoryLeak",
    "RaceCondition",
    "BufferOverflow",
  ],
};

// Legacy bug types (kept for fallback)
export const BUG_TYPES = [
  "NullPointer",
  "IndexOutOfBounds",
  "TypeError",
  "ReferenceError",
  "SyntaxError",
  "MemoryLeak",
  "RaceCondition",
  "BufferOverflow",
  "LogicError",
  "InfiniteLoop",
];

// API endpoints
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || "http://localhost:3001",
  ENDPOINTS: {
    GENERATE_TEST: "/generate-test",
    GENERATE_WAVE_BUGS: "/generate-wave-bugs", // New endpoint for wave-based bug generation
    FIX_BUG: "/fix-bug",
    SAVE_SCORE: "/score",
    GET_SCORES: "/scores",
    GET_BUGS: "/bugs",
  },
};
