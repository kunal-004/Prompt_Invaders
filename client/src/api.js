import axios from "axios";
import { API_CONFIG, DIFFICULTY_CONFIG } from "./config.js";

class GameAPI {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 12000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", error);
        return Promise.reject(error);
      }
    );
  }

  async generateWaveBugs(wave, enemyCount = 4) {
    try {
      if (!navigator.onLine) throw new Error("offline");

      // Get difficulty configuration for this wave
      const waveConfig =
        DIFFICULTY_CONFIG.WAVE_THEMES[wave] ||
        DIFFICULTY_CONFIG.WAVE_THEMES[
          ((wave - 1) % DIFFICULTY_CONFIG.MAX_WAVE) + 1
        ];

      const response = await this.client.post(
        API_CONFIG.ENDPOINTS.GENERATE_WAVE_BUGS,
        {
          wave,
          theme: waveConfig.theme,
          complexity: waveConfig.complexity,
          examples: waveConfig.examples,
          enemyCount,
          difficultyMultiplier:
            Math.floor((wave - 1) / DIFFICULTY_CONFIG.MAX_WAVE) + 1,
        }
      );

      return response.data.bugs || this.getFallbackBugs(enemyCount);
    } catch (error) {
      console.error("Failed to generate wave bugs:", error);
      return this.getFallbackBugs(enemyCount);
    }
  }

  getFallbackBugs(count) {
    const fallbacks = DIFFICULTY_CONFIG.FALLBACK_BUGS;
    const bugs = [];
    for (let i = 0; i < count; i++) {
      bugs.push(fallbacks[i % fallbacks.length]);
    }
    return bugs;
  }

  async generateTest(bugName, playerLevel = 1) {
    try {
      if (!navigator.onLine) throw new Error("offline");
      const response = await this.client.post(
        API_CONFIG.ENDPOINTS.GENERATE_TEST,
        {
          bugName,
          playerLevel,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to generate test:", error);
      // Return mock data if API fails
      const mock = this.getMockTest(bugName);
      return { ...mock, error: "Using demo test (offline or API error)." };
    }
  }

  async fixBug(bugName, testCode, userCode) {
    try {
      if (!navigator.onLine) throw new Error("offline");
      const response = await this.client.post(API_CONFIG.ENDPOINTS.FIX_BUG, {
        bugName,
        testCode,
        userCode,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fix bug:", error);
      // Return mock success
      const modified =
        typeof userCode === "string" && userCode.trim().length > 0;
      const looksEdited = modified && !/TODO|fixme|placeholder/i.test(userCode);
      const testPassed = looksEdited;
      return {
        bugName,
        testPassed,
        fixCode: testPassed ? userCode || `// Fixed: ${bugName}` : userCode,
        explanation: testPassed
          ? `Bug ${bugName} has been resolved!`
          : `The fix didn't pass the tests. Try focusing on the failing assertion and edge cases.`,
        executionTime: 45,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async saveScore(username, score, wave) {
    try {
      if (!navigator.onLine) throw new Error("offline");
      const response = await this.client.post(API_CONFIG.ENDPOINTS.SAVE_SCORE, {
        username,
        score,
        wave,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to save score:", error);
      return {
        error:
          "Failed to save score. You appear to be offline. Try again later.",
      };
    }
  }

  async getLeaderboard() {
    try {
      if (!navigator.onLine) throw new Error("offline");
      const response = await this.client.get(API_CONFIG.ENDPOINTS.GET_SCORES);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      // Return mock leaderboard
      return [
        { username: "CodeMaster", score: 15420, wave: 5, date: new Date() },
        { username: "BugHunter", score: 12300, wave: 4, date: new Date() },
        { username: "DevNinja", score: 9800, wave: 3, date: new Date() },
      ];
    }
  }

  async getBugTypes() {
    try {
      const response = await this.client.get(API_CONFIG.ENDPOINTS.GET_BUGS);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch bug types:", error);
      return [];
    }
  }

  getMockTest(bugName) {
    const mockTests = {
      NullPointer: {
        buggyCode: `function getUserName(user) {
  // BUG: doesn't handle null/undefined user
  return user.name.toUpperCase();
}

module.exports = { getUserName };`,
        testCode: `describe('NullPointer Bug Test', () => {
  it('should handle null object access', () => {
    const obj = null;
    expect(() => obj.property).toThrow();
  });
});`,
        explanation:
          "This test demonstrates a NullPointer bug: accessing properties on null objects.",
        bugSeverity: "High",
        pointsWorth: 150,
        hints: [
          "Check for null/undefined before property access.",
          "Consider using optional chaining or default values.",
        ],
      },
      IndexOutOfBounds: {
        buggyCode: `function getItem(arr, idx) {
  // BUG: no bounds checking
  return arr[idx];
}

module.exports = { getItem };`,
        testCode: `describe('IndexOutOfBounds Bug Test', () => {
  it('should handle array bounds checking', () => {
    const arr = [1, 2, 3];
    expect(arr[5]).toBeUndefined();
  });
});`,
        explanation:
          "This test shows IndexOutOfBounds: accessing array elements beyond the length.",
        bugSeverity: "Medium",
        pointsWorth: 100,
        hints: [
          "Validate the index against array length.",
          "Return undefined or throw a clear error when out of range.",
        ],
      },
    };

    return (
      mockTests[bugName] || {
        buggyCode: `// ${bugName} - buggy placeholder implementation\nfunction solve(input) {\n  // TODO: fix me\n  return input;\n}\n\nmodule.exports = { solve };`,
        testCode: `describe('${bugName} Bug Test', () => {
  it('should demonstrate the bug', () => {
    expect(false).toBe(true); // Simulated failure
  });
});`,
        explanation: `This test demonstrates the ${bugName} bug.`,
        bugSeverity: "Medium",
        pointsWorth: 100,
        hints: [
          "Read the failing assertion carefully.",
          "Start with the simplest change to make the test pass.",
        ],
        bugName,
        testPassed: false,
        executionTime: 67,
        timestamp: new Date().toISOString(),
      }
    );
  }

  async healthCheck() {
    try {
      const response = await this.client.get("/");
      return response.data;
    } catch (error) {
      console.error("Backend health check failed:", error);
      return { status: "offline", error: error.message };
    }
  }
}

export default new GameAPI();
