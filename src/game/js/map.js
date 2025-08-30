import { CELL_SIZE, BOARD_WIDTH, BOARD_HEIGHT } from '../../shared/constants.js';
import { MAP } from '../../shared/mapData.js';

export class MapManager {
    constructor(gameBoard) {
        this.gameBoard = gameBoard;
        this.gameMap = [];
        this.totalDots = 0;
    }

    initialize() {
        // Nastavení rozměrů herního pole
        this.gameBoard.style.width = BOARD_WIDTH * CELL_SIZE + 'px';
        this.gameBoard.style.height = BOARD_HEIGHT * CELL_SIZE + 'px';

        // Kopírování mapy
        this.gameMap = MAP.map(row => [...row]);
        this.totalDots = 0;
        
        // Vykreslení mapy
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.left = x * CELL_SIZE + 'px';
                cell.style.top = y * CELL_SIZE + 'px';
                cell.id = `cell-${x}-${y}`;

                if (this.gameMap[y][x] === 1) {
                    cell.classList.add('wall');
                } else if (this.gameMap[y][x] === 0) {
                    cell.classList.add('dot');
                    this.totalDots++;
                } else if (this.gameMap[y][x] === 3) {
                    cell.classList.add('dot', 'power-pellet');
                    this.totalDots++;
                }

                this.gameBoard.appendChild(cell);
            }
        }
    }

    updateDotDisplay(x, y) {
        const cell = document.getElementById(`cell-${x}-${y}`);
        if (cell) {
            cell.classList.remove('dot', 'power-pellet');
        }
    }

    getMap() {
        return this.gameMap;
    }

    getTotalDots() {
        return this.totalDots;
    }

    decrementDots() {
        this.totalDots--;
    }

    reset() {
        // Vyčistí herní plochu
        this.gameBoard.innerHTML = '';
        // Znovu inicializuje mapu
        this.initialize();
    }
}