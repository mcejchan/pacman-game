import { CELL_SIZE, FRIGHTENED_DURATION, FRIGHTENED_END_WARNING, DIRECTIONS } from '../../shared/constants.js';
import { PacMan } from './player.js';
import { Ghost } from './ghosts.js';
import { MapManager } from './map.js';

export class Game {
    constructor() {
        // Herní stav
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameRunning = true;
        this.paused = false;
        this.frightenedMode = false;
        this.frightenedTimer = null;
        this.ghostsEaten = 0;
        this.animationId = null;
        
        // Herní objekty
        this.gameBoard = null;
        this.mapManager = null;
        this.pacman = null;
        this.ghosts = [];
    }

    initialize() {
        this.gameBoard = document.getElementById('game-board');
        
        // Inicializace mapy
        this.mapManager = new MapManager(this.gameBoard);
        this.mapManager.initialize();
        
        // Vytvoření PacMana s callback funkcemi
        const pacmanCallbacks = {
            updateDotDisplay: (x, y) => this.mapManager.updateDotDisplay(x, y),
            updateScore: (points) => this.addScore(points),
            activateFrightenedMode: () => this.activateFrightenedMode(),
            checkWin: () => this.checkWin()
        };
        
        this.pacman = new PacMan(9, 15, this.gameBoard, this.mapManager.getMap(), pacmanCallbacks);
        this.pacman.create();

        // Vytvoření duchů s callback funkcemi
        const ghostCallbacks = {
            getPacman: () => this.pacman,
            updateScore: (points) => this.addScore(points),
            loseLife: () => this.loseLife(),
            getGhostsEaten: () => this.ghostsEaten,
            incrementGhostsEaten: () => this.ghostsEaten++
        };

        this.ghosts = [
            new Ghost(9, 9, 'blinky', this.gameBoard, this.mapManager.getMap(), ghostCallbacks),
            new Ghost(8, 9, 'pinky', this.gameBoard, this.mapManager.getMap(), ghostCallbacks),
            new Ghost(10, 9, 'inky', this.gameBoard, this.mapManager.getMap(), ghostCallbacks),
            new Ghost(9, 10, 'clyde', this.gameBoard, this.mapManager.getMap(), ghostCallbacks)
        ];

        this.ghosts.forEach(ghost => ghost.create());

        // Aktualizace UI
        this.updateScore();
        this.updateLives();
        this.updateLevel();

        // Start herní smyčky
        this.gameLoop();
        
        // Nastavení ovládání
        this.setupControls();
    }

    gameLoop() {
        if (this.gameRunning && !this.paused) {
            this.pacman.move();
            this.ghosts.forEach(ghost => ghost.move());
        }
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    addScore(points) {
        this.score += points;
        this.mapManager.decrementDots();
        this.updateScore();
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    updateLives() {
        document.getElementById('lives').textContent = this.lives;
    }

    updateLevel() {
        document.getElementById('level').textContent = this.level;
    }

    activateFrightenedMode() {
        this.frightenedMode = true;
        this.ghostsEaten = 0;
        
        this.ghosts.forEach(ghost => ghost.setFrightened(true));

        if (this.frightenedTimer) {
            clearTimeout(this.frightenedTimer);
        }

        setTimeout(() => {
            if (this.frightenedMode) {
                this.ghosts.forEach(ghost => ghost.setFrightened(true, true));
            }
        }, FRIGHTENED_DURATION - FRIGHTENED_END_WARNING);

        this.frightenedTimer = setTimeout(() => {
            this.frightenedMode = false;
            this.ghosts.forEach(ghost => ghost.setFrightened(false));
        }, FRIGHTENED_DURATION);
    }

    loseLife() {
        this.lives--;
        this.updateLives();
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.resetPositions();
        }
    }

    resetPositions() {
        // Reset PacMana
        this.pacman.gridX = 9;
        this.pacman.gridY = 15;
        this.pacman.pixelX = this.pacman.gridX * CELL_SIZE;
        this.pacman.pixelY = this.pacman.gridY * CELL_SIZE;
        this.pacman.direction = null;
        this.pacman.nextDirection = null;
        this.pacman.element.className = 'pacman';
        this.pacman.updatePosition();

        // Reset duchů
        this.ghosts.forEach((ghost, i) => {
            const positions = [
                { x: 9, y: 9 },
                { x: 8, y: 9 },
                { x: 10, y: 9 },
                { x: 9, y: 10 }
            ];
            
            ghost.gridX = positions[i].x;
            ghost.gridY = positions[i].y;
            ghost.pixelX = ghost.gridX * CELL_SIZE;
            ghost.pixelY = ghost.gridY * CELL_SIZE;
            ghost.direction = ghost.getRandomDirection();
            ghost.frightened = false;
            ghost.eaten = false;
            ghost.returning = false;
            ghost.element.style.opacity = '1';
            ghost.element.className = 'ghost ' + ghost.color;
            ghost.updatePosition();
        });

        // Zrušit frightened mode
        this.frightenedMode = false;
        if (this.frightenedTimer) {
            clearTimeout(this.frightenedTimer);
        }

        // Krátká pauza před pokračováním
        this.paused = true;
        setTimeout(() => {
            this.paused = false;
        }, 1000);
    }

    gameOver() {
        this.gameRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        alert('Game Over! Final Score: ' + this.score);
    }

    checkWin() {
        if (this.mapManager.getTotalDots() === 0) {
            this.nextLevel();
        }
    }

    nextLevel() {
        this.level++;
        this.updateLevel();
        
        // Restart s novou mapou
        this.mapManager.reset();
        this.resetPositions();
        
        alert('Level ' + this.level + '!');
    }

    restartGame() {
        // Stop current game
        this.gameRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.frightenedTimer) {
            clearTimeout(this.frightenedTimer);
        }

        // Reset všech hodnot
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameRunning = true;
        this.paused = false;
        this.frightenedMode = false;
        this.ghostsEaten = 0;

        // Vyčistit a znovu inicializovat
        this.gameBoard.innerHTML = '';
        this.initialize();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.paused) return;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.pacman.nextDirection = DIRECTIONS.UP;
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.pacman.nextDirection = DIRECTIONS.DOWN;
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.pacman.nextDirection = DIRECTIONS.LEFT;
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.pacman.nextDirection = DIRECTIONS.RIGHT;
                    e.preventDefault();
                    break;
                case ' ':
                    this.paused = !this.paused;
                    e.preventDefault();
                    break;
                case 'r':
                case 'R':
                    this.restartGame();
                    e.preventDefault();
                    break;
            }
        });
    }
}