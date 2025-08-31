import { GAME_CONFIG } from '../../shared/constants.js';
import { MAP_DATA } from '../../shared/mapData.js';
import { Player } from './player.js';
import { GhostManager } from './ghosts.js';
import { MapRenderer } from './map.js';

export class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.player = null;
        this.ghostManager = null;
        this.mapRenderer = null;
        
        // Game state
        this.gameMap = [];
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.dotsRemaining = 0;
        this.isPaused = false;
        this.isGameOver = false;
        this.frightenedMode = false;
        this.frightenedTimer = 0;
        
        // Animation
        this.animationFrame = 0;
        this.lastTime = 0;
        this.gameLoopId = null;
    }

    init() {
        this.setupCanvas();
        this.loadLevel(0);
        this.setupEventListeners();
        this.gameLoop();
    }

    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = GAME_CONFIG.CANVAS.WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS.HEIGHT;
    }

    loadLevel(levelIndex) {
        this.gameMap = JSON.parse(JSON.stringify(MAP_DATA.levels[levelIndex % MAP_DATA.levels.length]));
        this.dotsRemaining = 0;
        this.frightenedMode = false;
        this.frightenedTimer = 0;
        
        this.mapRenderer = new MapRenderer(this.gameMap);
        this.findSpawnPoints();
        this.ghostManager = new GhostManager(this.gameMap);
        this.countDots();
    }

    findSpawnPoints() {
        for (let y = 0; y < GAME_CONFIG.MAP.BOARD_HEIGHT - 1; y++) {
            for (let x = 0; x < GAME_CONFIG.MAP.BOARD_WIDTH - 1; x++) {
                const cell = this.gameMap[y][x];
                
                if (cell & GAME_CONFIG.MAP.PACMAN_SPAWN) {
                    this.player = new Player(x, y);
                }
            }
        }

        // Fallback if no spawn point found
        if (!this.player) {
            this.player = new Player(1, 1);
        }
    }

    countDots() {
        for (let y = 0; y < GAME_CONFIG.MAP.BOARD_HEIGHT - 1; y++) {
            for (let x = 0; x < GAME_CONFIG.MAP.BOARD_WIDTH - 1; x++) {
                const cell = this.gameMap[y][x];
                if (cell & GAME_CONFIG.MAP.DOT || cell & GAME_CONFIG.MAP.POWER_PELLET) {
                    this.dotsRemaining++;
                }
            }
        }
    }

    hasWall(x, y, direction) {
        if (x < 0 || x >= GAME_CONFIG.MAP.BOARD_WIDTH - 1 || 
            y < 0 || y >= GAME_CONFIG.MAP.BOARD_HEIGHT - 1) return true;
        
        const cell = this.gameMap[y][x];
        
        switch(direction) {
            case 'UP':
                return (cell & GAME_CONFIG.MAP.WALL_TOP) !== 0;
            case 'DOWN':
                if (y >= GAME_CONFIG.MAP.BOARD_HEIGHT - 2) return true;
                return (this.gameMap[y + 1][x] & GAME_CONFIG.MAP.WALL_TOP) !== 0;
            case 'LEFT':
                return (cell & GAME_CONFIG.MAP.WALL_LEFT) !== 0;
            case 'RIGHT':
                if (x >= GAME_CONFIG.MAP.BOARD_WIDTH - 2) return true;
                return (this.gameMap[y][x + 1] & GAME_CONFIG.MAP.WALL_LEFT) !== 0;
        }
        return false;
    }

    update() {
        if (!this.isPaused && !this.isGameOver) {
            this.player.update(this.gameMap, this.hasWall.bind(this));
            this.ghostManager.update(this.player, this.frightenedMode, this.hasWall.bind(this));
            
            this.checkCollisions();
            this.updateFrightenedMode();
            this.animationFrame++;
            
            // Check for level complete
            if (this.dotsRemaining === 0) {
                this.levelComplete();
            }
        }
    }

    checkCollisions() {
        const gridX = this.player.gridX;
        const gridY = this.player.gridY;
        const cell = this.gameMap[gridY][gridX];

        // Check dots
        if (cell & GAME_CONFIG.MAP.DOT) {
            this.gameMap[gridY][gridX] &= ~GAME_CONFIG.MAP.DOT;
            this.score += GAME_CONFIG.SCORING.DOT;
            this.dotsRemaining--;
            this.player.speed = GAME_CONFIG.PLAYER.EATING_SPEED;
        } else if (cell & GAME_CONFIG.MAP.POWER_PELLET) {
            this.gameMap[gridY][gridX] &= ~GAME_CONFIG.MAP.POWER_PELLET;
            this.score += GAME_CONFIG.SCORING.POWER_PELLET;
            this.dotsRemaining--;
            this.activateFrightenedMode();
            this.player.speed = GAME_CONFIG.PLAYER.EATING_SPEED;
        } else {
            this.player.speed = GAME_CONFIG.PLAYER.EMPTY_SPEED;
        }

        // Check ghost collisions
        this.ghostManager.checkPlayerCollision(this.player, this.frightenedMode, (ghost) => {
            if (this.frightenedMode) {
                // Eat ghost
                this.score += GAME_CONFIG.SCORING.GHOST_BASE * ghost.ghostMultiplier;
                ghost.ghostMultiplier *= 2;
                ghost.resetPosition();
            } else {
                // Lose life
                this.loseLife();
            }
        });
    }

    activateFrightenedMode() {
        this.frightenedMode = true;
        this.frightenedTimer = GAME_CONFIG.GHOSTS.FRIGHTENED_DURATION;
        this.ghostManager.setFrightened(true);
    }

    updateFrightenedMode() {
        if (this.frightenedMode) {
            this.frightenedTimer--;
            if (this.frightenedTimer <= 0) {
                this.frightenedMode = false;
                this.ghostManager.setFrightened(false);
            }
        }
    }

    loseLife() {
        this.lives--;
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.resetPositions();
        }
    }

    resetPositions() {
        this.player.reset();
        this.ghostManager.resetAll();
    }

    gameOver() {
        this.isGameOver = true;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'block';
    }

    levelComplete() {
        this.isPaused = true;
        document.getElementById('levelScore').textContent = this.score;
        document.getElementById('levelComplete').style.display = 'block';
    }

    nextLevel() {
        this.level++;
        this.loadLevel(this.level - 1);
        document.getElementById('levelComplete').style.display = 'none';
        this.isPaused = false;
    }

    restart() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.isGameOver = false;
        this.isPaused = false;
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('levelComplete').style.display = 'none';
        this.loadLevel(0);
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = GAME_CONFIG.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw map
        this.mapRenderer.draw(this.ctx, this.animationFrame);
        
        // Draw player
        this.player.draw(this.ctx);
        
        // Draw ghosts
        this.ghostManager.draw(this.ctx, this.frightenedMode, this.frightenedTimer, this.animationFrame);
        
        // Update UI
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }

    gameLoop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = timestamp - this.lastTime;
        
        if (deltaTime >= 16) { // ~60fps
            this.update();
            this.lastTime = timestamp;
        }
        
        this.draw();
        this.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.isGameOver) return;
            
            switch(e.key.toLowerCase()) {
                case 'arrowup':
                case 'w':
                    e.preventDefault();
                    this.player.setNextDirection('UP');
                    break;
                case 'arrowdown':
                case 's':
                    e.preventDefault();
                    this.player.setNextDirection('DOWN');
                    break;
                case 'arrowleft':
                case 'a':
                    e.preventDefault();
                    this.player.setNextDirection('LEFT');
                    break;
                case 'arrowright':
                case 'd':
                    e.preventDefault();
                    this.player.setNextDirection('RIGHT');
                    break;
                case ' ':
                    e.preventDefault();
                    this.isPaused = !this.isPaused;
                    break;
                case 'r':
                    e.preventDefault();
                    this.restart();
                    break;
            }
        });
    }
}

// Global functions for HTML buttons
window.restartGame = () => {
    if (window.game) {
        window.game.restart();
    }
};

window.nextLevel = () => {
    if (window.game) {
        window.game.nextLevel();
    }
};