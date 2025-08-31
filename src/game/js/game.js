import { GAME_CONFIG } from '../../shared/constants.js';
import { MAP_DATA } from '../../shared/mapData.js';
import { Player } from './player.js';
import { GhostManager } from './ghosts.js';
import { MapManager } from './map.js';

export class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.player = null;
        this.ghostManager = null;
        this.mapManager = null;
        this.gameState = 'ready'; // ready, playing, paused, gameOver, win
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.lastTime = 0;
        this.gameLoop = null;
        this.keys = {};
    }

    initialize() {
        this.setupCanvas();
        this.setupEventListeners();
        this.initializeGame();
        this.updateDisplay();
        this.start();
    }

    setupCanvas() {
        const gameBoard = document.getElementById('game-board');
        this.canvas = document.createElement('canvas');
        this.canvas.width = GAME_CONFIG.CANVAS.WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS.HEIGHT;
        this.ctx = this.canvas.getContext('2d');
        
        gameBoard.appendChild(this.canvas);
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.handleKeyPress(e.code);
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Prevent arrow key scrolling
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });
    }

    handleKeyPress(code) {
        switch (code) {
            case 'Space':
                this.togglePause();
                break;
            case 'KeyR':
                if (this.gameState === 'gameOver' || this.gameState === 'win') {
                    this.restart();
                }
                break;
        }
    }

    initializeGame() {
        this.mapManager = new MapManager(MAP_DATA.levels[this.level - 1]);
        this.player = new Player(this.mapManager.getPlayerStartPosition());
        this.ghostManager = new GhostManager(this.mapManager.getGhostStartPositions(), this.mapManager);
        this.gameState = 'ready';
    }

    start() {
        this.gameState = 'playing';
        this.lastTime = performance.now();
        this.gameLoop = requestAnimationFrame((time) => this.update(time));
    }

    update(currentTime) {
        if (this.gameState !== 'playing') {
            if (this.gameState === 'ready' || this.gameState === 'paused') {
                this.gameLoop = requestAnimationFrame((time) => this.update(time));
            }
            return;
        }

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update game objects
        this.updatePlayerInput();
        this.player.update(deltaTime, this.mapManager);
        this.ghostManager.update(deltaTime, this.player);

        // Check collisions
        this.checkCollisions();

        // Check win/lose conditions
        this.checkGameConditions();

        // Render
        this.render();

        // Continue game loop
        this.gameLoop = requestAnimationFrame((time) => this.update(time));
    }

    updatePlayerInput() {
        let direction = null;

        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            direction = 'up';
        } else if (this.keys['ArrowDown'] || this.keys['KeyS']) {
            direction = 'down';
        } else if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            direction = 'left';
        } else if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            direction = 'right';
        }

        if (direction) {
            this.player.setDirection(direction);
        }
    }

    checkCollisions() {
        // Check dot collection
        const playerTile = this.mapManager.getPlayerTile(this.player.position);
        if (this.mapManager.collectDot(playerTile.x, playerTile.y)) {
            this.score += GAME_CONFIG.SCORING.DOT;
            this.updateDisplay();
        }

        // Check power pellet collection
        if (this.mapManager.collectPowerPellet(playerTile.x, playerTile.y)) {
            this.score += GAME_CONFIG.SCORING.POWER_PELLET;
            this.ghostManager.activateFrightened();
            this.updateDisplay();
        }

        // Check ghost collisions
        const ghostCollision = this.ghostManager.checkPlayerCollision(this.player.position);
        if (ghostCollision) {
            if (ghostCollision.frightened) {
                this.score += GAME_CONFIG.SCORING.GHOST;
                this.ghostManager.eatGhost(ghostCollision.ghost);
                this.updateDisplay();
            } else {
                this.playerDied();
            }
        }
    }

    checkGameConditions() {
        // Check if all dots collected
        if (this.mapManager.areAllDotsCollected()) {
            this.levelComplete();
        }
    }

    playerDied() {
        this.lives--;
        this.updateDisplay();

        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Reset positions
            this.player.reset(this.mapManager.getPlayerStartPosition());
            this.ghostManager.resetPositions();
        }
    }

    levelComplete() {
        this.gameState = 'win';
        this.level++;
        this.showGameWin();
    }

    gameOver() {
        this.gameState = 'gameOver';
        this.showGameOver();
    }

    restart() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.initializeGame();
        this.updateDisplay();
        this.hideOverlays();
        this.start();
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showPaused();
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.hidePaused();
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render map
        this.mapManager.render(this.ctx);

        // Render game objects
        this.player.render(this.ctx);
        this.ghostManager.render(this.ctx);
    }

    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }

    showPaused() {
        document.querySelector('.paused').style.display = 'block';
    }

    hidePaused() {
        document.querySelector('.paused').style.display = 'none';
    }

    showGameOver() {
        document.querySelector('.game-over').style.display = 'block';
    }

    showGameWin() {
        document.querySelector('.game-win').style.display = 'block';
    }

    hideOverlays() {
        document.querySelector('.paused').style.display = 'none';
        document.querySelector('.game-over').style.display = 'none';
        document.querySelector('.game-win').style.display = 'none';
    }
}