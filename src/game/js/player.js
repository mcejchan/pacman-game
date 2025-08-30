import { CELL_SIZE, BOARD_WIDTH, BOARD_HEIGHT, PACMAN_SPEED } from '../../shared/constants.js';

export class PacMan {
    constructor(x, y, gameBoard, gameMap, callbacks) {
        this.gridX = x;
        this.gridY = y;
        this.pixelX = x * CELL_SIZE;
        this.pixelY = y * CELL_SIZE;
        this.targetX = this.pixelX;
        this.targetY = this.pixelY;
        this.direction = null;
        this.nextDirection = null;
        this.element = null;
        this.moving = false;
        
        // Dependencies
        this.gameBoard = gameBoard;
        this.gameMap = gameMap;
        this.callbacks = callbacks; // { updateDotDisplay, updateScore, activateFrightenedMode, checkWin }
    }

    create() {
        this.element = document.createElement('div');
        this.element.className = 'pacman';
        this.updatePosition();
        this.gameBoard.appendChild(this.element);
    }

    updatePosition() {
        this.element.style.left = this.pixelX + 'px';
        this.element.style.top = this.pixelY + 'px';
    }

    move() {
        if (!this.direction && !this.nextDirection) return;

        // Kontrola, zda jsme na hranici buňky
        const onGridX = this.pixelX % CELL_SIZE === 0;
        const onGridY = this.pixelY % CELL_SIZE === 0;
        const onGrid = onGridX && onGridY;

        // Pokus o změnu směru na hranici buňky
        if (onGrid && this.nextDirection) {
            const nextGridX = this.gridX + this.nextDirection.x;
            const nextGridY = this.gridY + this.nextDirection.y;
            
            if (this.canMoveTo(nextGridX, nextGridY)) {
                this.direction = this.nextDirection;
                this.nextDirection = null;
            }
        }

        // Pokud není směr nebo jsme na hranici a nemůžeme pokračovat
        if (!this.direction) return;
        
        if (onGrid) {
            const nextGridX = this.gridX + this.direction.x;
            const nextGridY = this.gridY + this.direction.y;
            
            if (!this.canMoveTo(nextGridX, nextGridY)) {
                this.moving = false;
                return;
            }
        }

        // Pohyb
        this.moving = true;
        this.pixelX += this.direction.x * PACMAN_SPEED;
        this.pixelY += this.direction.y * PACMAN_SPEED;

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
            this.collectDot();
        }

        // Aktualizace směrové třídy
        this.element.className = 'pacman ' + (this.direction ? this.direction.name : '');
        this.updatePosition();
    }

    canMoveTo(x, y) {
        // Kontrola teleportace
        if (x < 0 || x >= BOARD_WIDTH) return true;
        if (y < 0 || y >= BOARD_HEIGHT) return false;
        
        return this.gameMap[y] && this.gameMap[y][x] !== 1;
    }

    collectDot() {
        if (!this.gameMap[this.gridY] || this.gameMap[this.gridY][this.gridX] === undefined) return;
        
        const cellValue = this.gameMap[this.gridY][this.gridX];
        
        if (cellValue === 0) {
            this.gameMap[this.gridY][this.gridX] = 2;
            this.callbacks.updateDotDisplay(this.gridX, this.gridY);
            this.callbacks.updateScore(10);
            this.callbacks.checkWin();
        } else if (cellValue === 3) {
            this.gameMap[this.gridY][this.gridX] = 2;
            this.callbacks.updateDotDisplay(this.gridX, this.gridY);
            this.callbacks.updateScore(50);
            this.callbacks.activateFrightenedMode();
            this.callbacks.checkWin();
        }
    }
}