import {
  Application,
  Container,
  Graphics,
  Text,
  Sprite,
  Assets,
} from "pixi.js";
import { GAME_CONFIG, DIFFICULTY_CONFIG } from "./config.js";
import GameAPI from "./api.js";

export class PromptInvadersGame {
  constructor(canvasElement, onScoreUpdate, onTestResult, onGameOver) {
    this.canvas = canvasElement;
    this.onScoreUpdate = onScoreUpdate;
    this.onTestResult = onTestResult;
    this.onGameOver = onGameOver;

    this.app = null;
    this.gameState = "waiting"; // waiting, playing, paused, gameOver
    this.player = null;
    this.enemies = [];
    this.bullets = [];
    this.powerUps = [];
    this.particleEffects = [];

    // Game stats
    this.score = 0;
    this.wave = 1;
    this.lives = GAME_CONFIG.LIVES;
    this.enemiesKilled = 0;
    this.totalEnemies = 0;
    this.waveBugs = []; // Store current wave's AI-generated bugs

    // Input handling
    this.keys = {};
    this.lastBulletTime = 0;
    this.maxBulletsOnScreen = 5;
    this.isPaused = false;
    this.audioEnabled = true;
    this.audioCtx = null;

    // Containers for different game elements
    this.gameContainer = null;
    this.playerContainer = null;
    this.enemyContainer = null;
    this.bulletContainer = null;
    this.effectsContainer = null;
    this.uiContainer = null;

    this.initializeInput();
  }

  async init() {
    try {
      // Create PIXI Application
      this.app = new Application();
      await this.app.init({
        width: GAME_CONFIG.CANVAS_WIDTH,
        height: GAME_CONFIG.CANVAS_HEIGHT,
        backgroundAlpha: 0, // transparent canvas to show container bg
        antialias: false, // For pixel-perfect retro look
      });

      // Add canvas to DOM
      this.canvas.appendChild(this.app.canvas);

      // Create containers
      this.gameContainer = new Container();
      this.playerContainer = new Container();
      this.enemyContainer = new Container();
      this.bulletContainer = new Container();
      this.effectsContainer = new Container();
      this.uiContainer = new Container();

      // Add containers in proper order
      this.app.stage.addChild(this.gameContainer);
      this.gameContainer.addChild(this.effectsContainer);
      this.gameContainer.addChild(this.bulletContainer);
      this.gameContainer.addChild(this.enemyContainer);
      this.gameContainer.addChild(this.playerContainer);
      this.app.stage.addChild(this.uiContainer);

      // Preload optional sprite assets (fallback to vector if unavailable)
      await this.preloadAssets();

      // Create player
      this.createPlayer();

      // Start game loop
      this.app.ticker.add(this.gameLoop.bind(this));

      console.log("🎮 Game initialized successfully!");
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize game:", error);
      return false;
    }
  }

  async preloadAssets() {
    try {
      Assets.add([
        { alias: "player", src: "/assets/player_ship.svg" },
        { alias: "enemy", src: "/assets/bug_enemy.svg" },
        { alias: "p_double", src: "/assets/powerup_double.svg" },
        { alias: "p_shield", src: "/assets/powerup_shield.svg" },
      ]);
      await Assets.load(["player", "enemy", "p_double", "p_shield"]);
    } catch {
      // Ignore asset loading issues; vector fallback will be used
    }
  }

  createPlayer() {
    let player;
    try {
      const tex = Assets.get("player");
      if (tex) {
        player = new Sprite(tex);
        player.anchor.set(0.5);
        player.width = GAME_CONFIG.PLAYER_WIDTH;
        player.height = GAME_CONFIG.PLAYER_HEIGHT;
      }
    } catch {
      // Asset not preloaded; fallback to vector graphics
    }
    if (!player) {
      const g = new Graphics();
      g.rect(
        -GAME_CONFIG.PLAYER_WIDTH / 2,
        -GAME_CONFIG.PLAYER_HEIGHT / 2,
        GAME_CONFIG.PLAYER_WIDTH,
        GAME_CONFIG.PLAYER_HEIGHT
      );
      g.fill(GAME_CONFIG.PLAYER_COLOR);
      const detail = new Graphics();
      detail.rect(-5, -GAME_CONFIG.PLAYER_HEIGHT / 2, 10, 5);
      detail.fill(GAME_CONFIG.COLORS.NEON_BLUE);
      g.addChild(detail);
      player = g;
    }

    // Position player
    player.x = GAME_CONFIG.CANVAS_WIDTH / 2;
    player.y = GAME_CONFIG.CANVAS_HEIGHT - 50;

    this.player = player;
    this.playerContainer.addChild(player);
  }

  createBullet(x, y) {
    if (this.bullets.length >= this.maxBulletsOnScreen) return; // Cap bullets
    const bullet = new Graphics();
    bullet.rect(
      -GAME_CONFIG.BULLET_WIDTH / 2,
      -GAME_CONFIG.BULLET_HEIGHT / 2,
      GAME_CONFIG.BULLET_WIDTH,
      GAME_CONFIG.BULLET_HEIGHT
    );
    bullet.fill(GAME_CONFIG.BULLET_COLOR);
    bullet.x = x;
    bullet.y = y;
    bullet.velocity = -GAME_CONFIG.BULLET_SPEED;

    this.bullets.push(bullet);
    this.bulletContainer.addChild(bullet);

    this.playBeep(520, 0.05);
  }

  createEnemy(x, y, bugType) {
    let enemy;
    try {
      const tex = Assets.get("enemy");
      if (tex) {
        enemy = new Sprite(tex);
        enemy.anchor.set(0.5);
        enemy.width = GAME_CONFIG.ENEMY_WIDTH;
        enemy.height = GAME_CONFIG.ENEMY_HEIGHT;
      }
    } catch {
      // Asset not preloaded; fallback to vector graphics
    }
    if (!enemy) {
      const g = new Graphics();
      g.rect(
        -GAME_CONFIG.ENEMY_WIDTH / 2,
        -GAME_CONFIG.ENEMY_HEIGHT / 2,
        GAME_CONFIG.ENEMY_WIDTH,
        GAME_CONFIG.ENEMY_HEIGHT
      );
      g.fill(GAME_CONFIG.ENEMY_COLOR);
      enemy = g;
    }

    // Add bug name text
    const bugText = new Text({
      text: bugType,
      style: {
        fontFamily: "monospace",
        fontSize: 8,
        fill: 0xffffff,
      },
    });
    bugText.anchor.set(0.5);
    bugText.y = -20;
    enemy.addChild(bugText);

    enemy.x = x;
    enemy.y = y;
    enemy.bugType = bugType;
    enemy.health = 1;
    enemy.dir = 1; // 1 right, -1 left
    enemy.speed = GAME_CONFIG.ENEMY_SPEED + (this.wave - 1) * 0.2;
    enemy.baseX = x;
    enemy.waveOffset = Math.random() * Math.PI * 2;

    this.enemies.push(enemy);
    this.enemyContainer.addChild(enemy);
  }

  async startWave() {
    this.enemies = [];
    this.enemyContainer.removeChildren();

    // Generate AI bugs for this wave
    const enemyCount = GAME_CONFIG.ENEMY_ROWS * GAME_CONFIG.ENEMY_COLS;

    this.onTestResult({
      type: "info",
      message: `🤖 AI generating ${enemyCount} unique bugs for Wave ${this.wave}...`,
    });

    try {
      this.waveBugs = await GameAPI.generateWaveBugs(this.wave, enemyCount);
    } catch (error) {
      console.error("Failed to generate wave bugs, using fallback:", error);
      this.waveBugs = DIFFICULTY_CONFIG.FALLBACK_BUGS.slice(0, enemyCount);
    }

    const bugsThisWave = Math.min(this.waveBugs.length, GAME_CONFIG.ENEMY_COLS);
    const startX =
      (GAME_CONFIG.CANVAS_WIDTH -
        (bugsThisWave - 1) * GAME_CONFIG.ENEMY_SPACING_X) /
      2;

    let bugIndex = 0;
    for (let row = 0; row < GAME_CONFIG.ENEMY_ROWS; row++) {
      for (let col = 0; col < bugsThisWave; col++) {
        const x = startX + col * GAME_CONFIG.ENEMY_SPACING_X;
        const y = GAME_CONFIG.ENEMY_START_Y + row * GAME_CONFIG.ENEMY_SPACING_Y;
        const bugType = this.waveBugs[bugIndex % this.waveBugs.length];
        bugIndex++;

        this.createEnemy(x, y, bugType);
      }
    }

    this.totalEnemies = this.enemies.length;
    this.enemiesKilled = 0;

    // Get wave theme for display
    const waveConfig =
      DIFFICULTY_CONFIG.WAVE_THEMES[this.wave] ||
      DIFFICULTY_CONFIG.WAVE_THEMES[
        ((this.wave - 1) % DIFFICULTY_CONFIG.MAX_WAVE) + 1
      ];

    this.onTestResult({
      type: "info",
      message: `🚀 Wave ${this.wave}: ${waveConfig.theme} (${waveConfig.complexity})`,
    });

    console.log(
      `🚀 Wave ${this.wave} started with ${this.totalEnemies} AI-generated enemies:`,
      this.waveBugs
    );
  }

  async shootEnemy(enemy) {
    try {
      // Show test generation
      this.onTestResult({
        type: "generating",
        bugName: enemy.bugType,
        message: `🔍 Generating test for ${enemy.bugType}...`,
      });

      // Generate AI test
      const testResult = await GameAPI.generateTest(enemy.bugType, this.wave);

      // Show failing test
      this.onTestResult({
        type: "failure",
        bugName: enemy.bugType,
        testCode: testResult.testCode,
        explanation: testResult.explanation,
        severity: testResult.bugSeverity,
        points: testResult.pointsWorth,
      });

      // Simulate test fix after a delay
      setTimeout(async () => {
        try {
          const fixResult = await GameAPI.fixBug(
            enemy.bugType,
            testResult.testCode
          );

          this.onTestResult({
            type: "success",
            bugName: enemy.bugType,
            fixCode: fixResult.fixCode,
            explanation: fixResult.explanation,
            points: testResult.pointsWorth,
          });

          // Award points and destroy enemy
          this.addScore(testResult.pointsWorth || GAME_CONFIG.POINTS_PER_ENEMY);
          this.destroyEnemy(enemy);
        } catch (error) {
          console.error("Error fixing bug:", error);
          // Still destroy enemy but show error
          this.onTestResult({
            type: "error",
            bugName: enemy.bugType,
            message: "Failed to fix bug, but enemy destroyed!",
          });
          this.destroyEnemy(enemy);
        }
      }, 2000); // 2 second delay to show the failing test
    } catch (error) {
      console.error("Error shooting enemy:", error);
      // Fallback: just destroy the enemy
      this.destroyEnemy(enemy);
    }
  }

  destroyEnemy(enemy) {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
      this.enemyContainer.removeChild(enemy);
      this.enemiesKilled++;

      // Create explosion effect
      this.createExplosion(enemy.x, enemy.y);
      this.playBeep(180, 0.08);

      // Chance to drop a power-up
      if (Math.random() < 0.2) {
        this.spawnPowerUp(enemy.x, enemy.y);
      }

      // Check if wave is complete
      if (this.enemies.length === 0) {
        this.completeWave();
      }
    }
  }

  createExplosion(x, y) {
    // Particle burst
    const particles = [];
    for (let i = 0; i < 12; i++) {
      const p = new Graphics();
      p.rect(-2, -2, 4, 4).fill(GAME_CONFIG.COLORS.NEON_PINK);
      p.x = x;
      p.y = y;
      p.vx = (Math.random() - 0.5) * 6;
      p.vy = (Math.random() - 0.5) * 6;
      p.alpha = 1;
      particles.push(p);
      this.effectsContainer.addChild(p);
    }

    const animate = () => {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // gravity
        p.alpha -= 0.03;
        if (p.alpha <= 0) {
          this.effectsContainer.removeChild(p);
          particles.splice(i, 1);
        }
      }
      if (particles.length > 0) requestAnimationFrame(animate);
    };
    animate();
  }

  completeWave() {
    const waveBonus = GAME_CONFIG.WAVE_BONUS * this.wave;
    this.addScore(waveBonus);

    this.onTestResult({
      type: "wave-complete",
      wave: this.wave,
      bonus: waveBonus,
      message: `🎉 Wave ${this.wave} completed! Bonus: ${waveBonus} points`,
    });

    this.wave++;

    // Start next wave after delay
    setTimeout(() => {
      this.startWave();
    }, 3000);
  }

  addScore(points) {
    this.score += points;
    this.onScoreUpdate({
      score: this.score,
      wave: this.wave,
      lives: this.lives,
    });
  }

  loseLife() {
    this.lives--;
    this.onScoreUpdate({
      score: this.score,
      wave: this.wave,
      lives: this.lives,
    });

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  gameOver() {
    this.gameState = "gameOver";
    this.onGameOver({
      score: this.score,
      wave: this.wave,
      enemiesKilled: this.enemiesKilled,
    });
  }

  gameLoop() {
    if (this.gameState !== "playing" || this.isPaused) return;

    this.handleInput();
    this.updateBullets();
    this.updateEnemies();
    this.checkCollisions();
    this.updateEffects();
    this.updatePowerUps();
  }

  handleInput() {
    if (!this.player) return;

    // Move player
    if (
      this.keys["ArrowLeft"] &&
      this.player.x > GAME_CONFIG.PLAYER_WIDTH / 2
    ) {
      this.player.x -= GAME_CONFIG.PLAYER_SPEED;
    }
    if (
      this.keys["ArrowRight"] &&
      this.player.x < GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PLAYER_WIDTH / 2
    ) {
      this.player.x += GAME_CONFIG.PLAYER_SPEED;
    }

    // Shoot bullets (limit rate)
    if (this.keys["Space"]) {
      const currentTime = Date.now();
      if (currentTime - this.lastBulletTime > 200) {
        // 200ms between bullets
        this.createBullet(this.player.x, this.player.y);
        this.lastBulletTime = currentTime;
      }
    }
  }

  updateBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.y += bullet.velocity;

      // Remove bullets that are off screen
      if (bullet.y < 0) {
        this.bullets.splice(i, 1);
        this.bulletContainer.removeChild(bullet);
      }
    }
  }

  updateEnemies() {
    // Group side-to-side with sine bob and edge bounce
    let minX = Infinity,
      maxX = -Infinity;
    for (const enemy of this.enemies) {
      enemy.x += enemy.speed * enemy.dir;
      enemy.y += 0.05 + Math.sin((enemy.x + enemy.waveOffset) * 0.02) * 0.05;
      minX = Math.min(minX, enemy.x);
      maxX = Math.max(maxX, enemy.x);

      // Reached player line
      if (enemy.y > GAME_CONFIG.CANVAS_HEIGHT - 100) {
        this.loseLife();
        this.destroyEnemy(enemy);
      }
    }

    // Bounce all when hitting edges
    if (minX < 40 || maxX > GAME_CONFIG.CANVAS_WIDTH - 40) {
      for (const enemy of this.enemies) {
        enemy.dir *= -1;
        enemy.y += 10; // drop down on bounce
      }
    }
  }

  checkCollisions() {
    // Check bullet-enemy collisions
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];

        // Simple collision detection
        if (
          !enemy.pending &&
          Math.abs(bullet.x - enemy.x) < GAME_CONFIG.ENEMY_WIDTH / 2 &&
          Math.abs(bullet.y - enemy.y) < GAME_CONFIG.ENEMY_HEIGHT / 2
        ) {
          // Remove bullet
          this.bullets.splice(i, 1);
          this.bulletContainer.removeChild(bullet);

          // Mark as pending and trigger AI test
          enemy.pending = true;
          this.shootEnemy(enemy);
          break;
        }
      }
    }

    // Player-powerup collisions
    if (this.player) {
      for (let k = this.powerUps.length - 1; k >= 0; k--) {
        const p = this.powerUps[k];
        if (
          Math.abs(p.x - this.player.x) < 20 &&
          Math.abs(p.y - this.player.y) < 20
        ) {
          this.applyPowerUp(p.type);
          this.effectsContainer.removeChild(p.g);
          this.powerUps.splice(k, 1);
          this.playBeep(700, 0.08);
        }
      }
    }
  }

  updateEffects() {
    // Update any particle effects here
  }

  updatePowerUps() {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];
      p.y += 1.2; // fall speed
      p.g.y = p.y;
      p.g.x = p.x;
      if (p.y > GAME_CONFIG.CANVAS_HEIGHT + 20) {
        this.effectsContainer.removeChild(p.g);
        this.powerUps.splice(i, 1);
      }
    }
  }

  spawnPowerUp(x, y) {
    const type = Math.random() < 0.5 ? "double-shot" : "shield";
    let g;
    try {
      const tex = Assets.get(type === "double-shot" ? "p_double" : "p_shield");
      if (tex) {
        g = new Sprite(tex);
        g.anchor?.set?.(0.5);
        g.width = 16;
        g.height = 16;
      }
    } catch {
      // fall through to vector fallback
    }
    if (!g) {
      g = new Graphics();
      if (type === "double-shot") {
        g.rect(-6, -6, 12, 12).fill(GAME_CONFIG.COLORS.NEON_BLUE);
      } else {
        g.circle(0, 0, 6).fill(GAME_CONFIG.COLORS.NEON_GREEN);
      }
    }
    g.x = x;
    g.y = y;
    const p = { type, x, y, g };
    this.powerUps.push(p);
    this.effectsContainer.addChild(g);
  }

  applyPowerUp(type) {
    if (type === "double-shot") {
      const originalCreateBullet = this.createBullet.bind(this);
      const endTime = Date.now() + 8000; // 8s
      this.maxBulletsOnScreen = 8;
      this.onTestResult({
        type: "info",
        message: "🔫 Double Shot activated for 8s!",
      });
      this.createBullet = (x, y) => {
        originalCreateBullet(x - 8, y);
        originalCreateBullet(x + 8, y);
      };
      setTimeout(() => {
        this.createBullet = originalCreateBullet;
        this.maxBulletsOnScreen = 5;
        this.onTestResult({ type: "info", message: "🔫 Double Shot expired" });
      }, endTime - Date.now());
    }
    if (type === "shield") {
      this.lives += 1;
      this.onScoreUpdate({
        score: this.score,
        wave: this.wave,
        lives: this.lives,
      });
      this.onTestResult({ type: "info", message: "🛡️ Extra life gained!" });
    }
  }

  initializeInput() {
    this._handleKeyDown = (e) => {
      this.keys[e.code] = true;
      if (e.code === "Space") {
        e.preventDefault();
      }
      if (e.code === "KeyP") {
        this.togglePause();
      }
    };
    this._handleKeyUp = (e) => {
      this.keys[e.code] = false;
    };
    window.addEventListener("keydown", this._handleKeyDown);
    window.addEventListener("keyup", this._handleKeyUp);
  }

  startGame() {
    this.gameState = "playing";
    this.score = 0;
    this.wave = 1;
    this.lives = GAME_CONFIG.LIVES;
    this.waveBugs = []; // Reset wave bugs
    this.startWave();

    this.onScoreUpdate({
      score: this.score,
      wave: this.wave,
      lives: this.lives,
    });
  }

  pauseGame() {
    this.isPaused = true;
  }

  resumeGame() {
    this.isPaused = false;
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    this.onTestResult({
      type: "info",
      message: this.isPaused ? "⏸️ Paused" : "▶️ Resumed",
    });
  }

  resetGame() {
    this.gameState = "waiting";
    this.enemies = [];
    this.bullets = [];
    this.enemyContainer.removeChildren();
    this.bulletContainer.removeChildren();
    this.effectsContainer.removeChildren();

    this.score = 0;
    this.wave = 1;
    this.lives = GAME_CONFIG.LIVES;
    this.enemiesKilled = 0;
    this.waveBugs = []; // Reset wave bugs
  }

  destroy() {
    if (this.app) {
      this.app.destroy(true, true);
    }
    if (this._handleKeyDown)
      window.removeEventListener("keydown", this._handleKeyDown);
    if (this._handleKeyUp)
      window.removeEventListener("keyup", this._handleKeyUp);
  }

  // External control for mobile buttons
  setKey(code, pressed) {
    this.keys[code] = pressed;
  }

  // Audio helpers using WebAudio API
  ensureAudio() {
    if (!this.audioCtx) {
      try {
        this.audioCtx = new (window.AudioContext ||
          window.webkitAudioContext)();
      } catch {
        // Audio not available; disable audio
        this.audioEnabled = false;
      }
    }
    // Resume if needed (some browsers start suspended)
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {
        /* ignore */
      });
    }
  }

  playBeep(freq = 440, duration = 0.1) {
    if (!this.audioEnabled) return;
    this.ensureAudio();
    const ctx = this.audioCtx;
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      // Quick envelope to avoid clicks
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.04, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.01);
      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {
          // Ignore disconnect errors
        }
      };
    } catch {
      // Audio oscillators not supported or user gesture missing
    }
  }

  setAudioEnabled(enabled) {
    this.audioEnabled = enabled;
  }
}
