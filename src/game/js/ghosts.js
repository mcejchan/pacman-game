import { CELL_SIZE, BOARD_WIDTH, BOARD_HEIGHT, GHOST_SPEED, DIRECTIONS } from '../../shared/constants.js';

export class Ghost {
    constructor(x, y, color, gameBoard, gameMap, callbacks) {
        this.gridX = x;
        this.gridY = y;
        this.pixelX = x * CELL_SIZE;
        this.pixelY = y * CELL_SIZE;
        this.color = color;
        this.direction = this.getRandomDirection();
        this.element = null;
        this.frightened = false;
        this.eaten = false;
        this.returning = false;
        this.homeX = x;
        this.homeY = y;
        
        // Dependencies
        this.gameBoard = gameBoard;
        this.gameMap = gameMap;
        this.callbacks = callbacks; // { getPacman, updateScore, loseLife, getGhostsEaten, incrementGhostsEaten }
    }

    create() {
        this.element = document.createElement('div');
        this.element.className = 'ghost ' + this.color;
        this.updatePosition();
        this.gameBoard.appendChild(this.element);
    }

    updatePosition() {
        this.element.style.left = this.pixelX + 'px';
        this.element.style.top = this.pixelY + 'px';
    }

    move() {
        if (this.eaten && !this.returning) return;

        // Kontrola, zda jsme na hranici buňky
        const onGridX = this.pixelX % CELL_SIZE === 0;
        const onGridY = this.pixelY % CELL_SIZE === 0;
        const onGrid = onGridX && onGridY;

        // Změna směru pouze na hranici buňky
        if (onGrid) {
            let newDirection = null;
            
            if (this.returning) {
                // Návrat domů
                newDirection = this.getHomeDirection();
                if (this.gridX === this.homeX && this.gridY === this.homeY) {
                    this.respawn();
                }
            } else if (this.frightened) {
                newDirection = this.getFleeDirection();
            } else if (this.detectPlayer()) {
                newDirection = this.getChaseDirection();
            } else {
                newDirection = this.getRandomValidDirection();
            }

            if (newDirection) {
                this.direction = newDirection;
            }
        }

        // Pohyb
        this.pixelX += this.direction.x * GHOST_SPEED;
        this.pixelY += this.direction.y * GHOST_SPEED;

        // Teleportace
        if (this.pixelX < -CELL_SIZE) {
            this.pixelX = BOARD_WIDTH * CELL_SIZE;
            this.gridX = BOARD_WIDTH - 1;
        } else if (this.pixelX > BOARD_WIDTH * CELL_SIZE) {
            this.pixelX = -CELL_SIZE;
            this.gridX = 0;
        }

        // Aktualizace mřížkové pozice
        const newGridX = Math.round(this.pixelX / CELL_SIZE);
        const newGridY = Math.round(this.pixelY / CELL_SIZE);

        if (newGridX !== this.gridX || newGridY !== this.gridY) {
            this.gridX = newGridX;
            this.gridY = newGridY;
        }

        this.updatePosition();
        
        if (!this.returning) {
            this.checkCollisionWithPacman();
        }
    }

    detectPlayer() {
        const pacman = this.callbacks.getPacman();
        
        // Kontrola přímé viditelnosti
        if (this.gridX === pacman.gridX) {
            const minY = Math.min(this.gridY, pacman.gridY);
            const maxY = Math.max(this.gridY, pacman.gridY);
            
            for (let y = minY + 1; y < maxY; y++) {
                if (this.gameMap[y][this.gridX] === 1) return false;
            }
            return true;
        } else if (this.gridY === pacman.gridY) {
            const minX = Math.min(this.gridX, pacman.gridX);
            const maxX = Math.max(this.gridX, pacman.gridX);
            
            for (let x = minX + 1; x < maxX; x++) {
                if (this.gameMap[this.gridY][x] === 1) return false;
            }
            return true;
        }
        
        return false;
    }

    getChaseDirection() {
        const possibleDirs = this.getPossibleDirections();
        if (possibleDirs.length === 0) return this.direction;
        
        const pacman = this.callbacks.getPacman();
        let bestDir = possibleDirs[0];
        let minDist = Infinity;

        for (const dir of possibleDirs) {
            const nextX = this.gridX + dir.x;
            const nextY = this.gridY + dir.y;
            const dist = Math.abs(nextX - pacman.gridX) + Math.abs(nextY - pacman.gridY);
            
            if (dist < minDist) {
                minDist = dist;
                bestDir = dir;
            }
        }

        return bestDir;
    }

    getFleeDirection() {
        const possibleDirs = this.getPossibleDirections();
        if (possibleDirs.length === 0) return this.direction;
        
        const pacman = this.callbacks.getPacman();
        let bestDir = possibleDirs[0];
        let maxDist = 0;

        for (const dir of possibleDirs) {
            const nextX = this.gridX + dir.x;
            const nextY = this.gridY + dir.y;
            const dist = Math.abs(nextX - pacman.gridX) + Math.abs(nextY - pacman.gridY);
            
            if (dist > maxDist) {
                maxDist = dist;
                bestDir = dir;
            }
        }

        return bestDir;
    }

    getHomeDirection() {
        const possibleDirs = this.getPossibleDirections();
        if (possibleDirs.length === 0) return this.direction;

        let bestDir = possibleDirs[0];
        let minDist = Infinity;

        for (const dir of possibleDirs) {
            const nextX = this.gridX + dir.x;
            const nextY = this.gridY + dir.y;
            const dist = Math.abs(nextX - this.homeX) + Math.abs(nextY - this.homeY);
            
            if (dist < minDist) {
                minDist = dist;
                bestDir = dir;
            }
        }

        return bestDir;
    }

    getRandomValidDirection() {
        const possibleDirs = this.getPossibleDirections();
        if (possibleDirs.length === 0) return this.direction;
        
        return possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
    }

    getPossibleDirections() {
        const dirs = [];
        const opposite = this.getOppositeDirection();

        for (const dir of Object.values(DIRECTIONS)) {
            if (dir === opposite) continue;
            
            const nextX = this.gridX + dir.x;
            const nextY = this.gridY + dir.y;
            
            if (this.canMoveTo(nextX, nextY)) {
                dirs.push(dir);
            }
        }

        return dirs;
    }

    canMoveTo(x, y) {
        if (x < 0 || x >= BOARD_WIDTH) return true; // Teleportace
        if (y < 0 || y >= BOARD_HEIGHT) return false;
        
        return this.gameMap[y] && this.gameMap[y][x] !== 1;
    }

    getOppositeDirection() {
        if (this.direction === DIRECTIONS.UP) return DIRECTIONS.DOWN;
        if (this.direction === DIRECTIONS.DOWN) return DIRECTIONS.UP;
        if (this.direction === DIRECTIONS.LEFT) return DIRECTIONS.RIGHT;
        if (this.direction === DIRECTIONS.RIGHT) return DIRECTIONS.LEFT;
        return null;
    }

    getRandomDirection() {
        const dirs = Object.values(DIRECTIONS);
        return dirs[Math.floor(Math.random() * dirs.length)];
    }

    checkCollisionWithPacman() {
        const pacman = this.callbacks.getPacman();
        const dx = Math.abs(this.pixelX - pacman.pixelX);
        const dy = Math.abs(this.pixelY - pacman.pixelY);

        if (dx < 20 && dy < 20) {
            if (this.frightened && !this.eaten) {
                this.eaten = true;
                this.callbacks.incrementGhostsEaten();
                const ghostsEaten = this.callbacks.getGhostsEaten();
                this.callbacks.updateScore(200 * Math.pow(2, ghostsEaten - 1));
                this.element.style.opacity = '0.3';
                this.returning = true;
            } else if (!this.frightened && !this.eaten) {
                this.callbacks.loseLife();
            }
        }
    }

    respawn() {
        this.eaten = false;
        this.returning = false;
        this.frightened = false;
        this.element.style.opacity = '1';
        this.element.className = 'ghost ' + this.color;
        this.direction = this.getRandomDirection();
    }

    setFrightened(value, ending = false) {
        if (this.eaten) return;
        
        this.frightened = value;
        if (value) {
            this.element.className = 'ghost frightened' + (ending ? ' ending' : '');
        } else {
            this.element.className = 'ghost ' + this.color;
        }
    }
}