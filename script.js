// Herní konstanty
const CELL_SIZE = 30;
const BOARD_WIDTH = 19;
const BOARD_HEIGHT = 21;
const PACMAN_SPEED = 2;
const GHOST_SPEED = 2;
const FRIGHTENED_DURATION = 7000;
const FRIGHTENED_END_WARNING = 2000;

// Herní mapa (1 = zeď, 0 = cesta s tečkou, 2 = prázdná cesta, 3 = power pellet)
const MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,3,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1],
    [2,2,2,1,0,1,0,0,0,0,0,0,0,1,0,1,2,2,2],
    [1,1,1,1,0,1,0,1,1,2,1,1,0,1,0,1,1,1,1],
    [0,0,0,0,0,0,0,1,2,2,2,1,0,0,0,0,0,0,0],
    [1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1],
    [2,2,2,1,0,1,0,0,0,0,0,0,0,1,0,1,2,2,2],
    [1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
    [1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Herní proměnné
let gameBoard;
let pacman;
let ghosts = [];
let score = 0;
let lives = 3;
let level = 1;
let gameMap = [];
let totalDots = 0;
let gameRunning = true;
let paused = false;
let frightenedMode = false;
let frightenedTimer = null;
let ghostsEaten = 0;
let animationId = null;

// Směry
const DIRECTIONS = {
    UP: { x: 0, y: -1, name: 'up' },
    DOWN: { x: 0, y: 1, name: 'down' },
    LEFT: { x: -1, y: 0, name: 'left' },
    RIGHT: { x: 1, y: 0, name: 'right' }
};

class PacMan {
    constructor(x, y) {
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
    }

    create() {
        this.element = document.createElement('div');
        this.element.className = 'pacman';
        this.updatePosition();
        gameBoard.appendChild(this.element);
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
        
        return gameMap[y] && gameMap[y][x] !== 1;
    }

    collectDot() {
        if (!gameMap[this.gridY] || gameMap[this.gridY][this.gridX] === undefined) return;
        
        const cellValue = gameMap[this.gridY][this.gridX];
        
        if (cellValue === 0) {
            gameMap[this.gridY][this.gridX] = 2;
            score += 10;
            totalDots--;
            updateDotDisplay(this.gridX, this.gridY);
            updateScore();
            checkWin();
        } else if (cellValue === 3) {
            gameMap[this.gridY][this.gridX] = 2;
            score += 50;
            totalDots--;
            updateDotDisplay(this.gridX, this.gridY);
            updateScore();
            activateFrightenedMode();
            checkWin();
        }
    }
}

class Ghost {
    constructor(x, y, color) {
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
    }

    create() {
        this.element = document.createElement('div');
        this.element.className = 'ghost ' + this.color;
        this.updatePosition();
        gameBoard.appendChild(this.element);
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
        // Kontrola přímé viditelnosti
        if (this.gridX === pacman.gridX) {
            const minY = Math.min(this.gridY, pacman.gridY);
            const maxY = Math.max(this.gridY, pacman.gridY);
            
            for (let y = minY + 1; y < maxY; y++) {
                if (gameMap[y][this.gridX] === 1) return false;
            }
            return true;
        } else if (this.gridY === pacman.gridY) {
            const minX = Math.min(this.gridX, pacman.gridX);
            const maxX = Math.max(this.gridX, pacman.gridX);
            
            for (let x = minX + 1; x < maxX; x++) {
                if (gameMap[this.gridY][x] === 1) return false;
            }
            return true;
        }
        
        return false;
    }

    getChaseDirection() {
        const possibleDirs = this.getPossibleDirections();
        if (possibleDirs.length === 0) return this.direction;

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
        
        return gameMap[y] && gameMap[y][x] !== 1;
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
        const dx = Math.abs(this.pixelX - pacman.pixelX);
        const dy = Math.abs(this.pixelY - pacman.pixelY);

        if (dx < 20 && dy < 20) {
            if (this.frightened && !this.eaten) {
                this.eaten = true;
                ghostsEaten++;
                score += 200 * Math.pow(2, ghostsEaten - 1);
                updateScore();
                this.element.style.opacity = '0.3';
                this.returning = true;
            } else if (!this.frightened && !this.eaten) {
                loseLife();
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

function initGame() {
    gameBoard = document.getElementById('game-board');
    gameBoard.style.width = BOARD_WIDTH * CELL_SIZE + 'px';
    gameBoard.style.height = BOARD_HEIGHT * CELL_SIZE + 'px';

    // Kopírování mapy
    gameMap = MAP.map(row => [...row]);
    totalDots = 0;
    
    // Vykreslení mapy
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.left = x * CELL_SIZE + 'px';
            cell.style.top = y * CELL_SIZE + 'px';
            cell.id = `cell-${x}-${y}`;

            if (gameMap[y][x] === 1) {
                cell.classList.add('wall');
            } else if (gameMap[y][x] === 0) {
                cell.classList.add('dot');
                totalDots++;
            } else if (gameMap[y][x] === 3) {
                cell.classList.add('dot', 'power-pellet');
                totalDots++;
            }

            gameBoard.appendChild(cell);
        }
    }

    // Vytvoření PacMana
    pacman = new PacMan(9, 15);
    pacman.create();

    // Vytvoření duchů
    ghosts = [
        new Ghost(9, 9, 'blinky'),
        new Ghost(8, 9, 'pinky'),
        new Ghost(10, 9, 'inky'),
        new Ghost(9, 10, 'clyde')
    ];

    ghosts.forEach(ghost => ghost.create());

    // Start herní smyčky
    gameLoop();
}

function gameLoop() {
    if (gameRunning && !paused) {
        pacman.move();
        ghosts.forEach(ghost => ghost.move());
    }
    animationId = requestAnimationFrame(gameLoop);
}

function updateDotDisplay(x, y) {
    const cell = document.getElementById(`cell-${x}-${y}`);
    if (cell) {
        cell.classList.remove('dot', 'power-pellet');
    }
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function updateLives() {
    document.getElementById('lives').textContent = lives;
}

function updateLevel() {
    document.getElementById('level').textContent = level;
}

function activateFrightenedMode() {
    frightenedMode = true;
    ghostsEaten = 0;
    
    ghosts.forEach(ghost => ghost.setFrightened(true));

    if (frightenedTimer) {
        clearTimeout(frightenedTimer);
    }

    setTimeout(() => {
        if (frightenedMode) {
            ghosts.forEach(ghost => ghost.setFrightened(true, true));
        }
    }, FRIGHTENED_DURATION - FRIGHTENED_END_WARNING);

    frightenedTimer = setTimeout(() => {
        frightenedMode = false;
        ghosts.forEach(ghost => ghost.setFrightened(false));
    }, FRIGHTENED_DURATION);
}

function loseLife() {
    lives--;
    updateLives();
    
    if (lives <= 0) {
        gameOver();
    } else {
        resetPositions();
    }
}

function resetPositions() {
    // Reset PacMana
    pacman.gridX = 9;
    pacman.gridY = 15;
    pacman.pixelX = pacman.gridX * CELL_SIZE;
    pacman.pixelY = pacman.gridY * CELL_SIZE;
    pacman.direction = null;
    pacman.nextDirection = null;
    pacman.element.className = 'pacman';
    pacman.updatePosition();

    // Reset duchů
    ghosts.forEach((ghost, i) => {
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
    frightenedMode = false;
    if (frightenedTimer) {
        clearTimeout(frightenedTimer);
    }

    // Pauza před restartem
    paused = true;
    setTimeout(() => {
        paused = false;
    }, 1000);
}

function gameOver() {
    gameRunning = false;
    document.querySelector('.game-over').style.display = 'block';
}

function checkWin() {
    if (totalDots === 0) {
        gameRunning = false;
        document.querySelector('.game-win').style.display = 'block';
    }
}

function nextLevel() {
    level++;
    updateLevel();
    
    // Reset mapy
    gameMap = MAP.map(row => [...row]);
    totalDots = 0;
    
    // Aktualizace teček
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const cell = document.getElementById(`cell-${x}-${y}`);
            if (cell) {
                if (gameMap[y][x] === 0) {
                    cell.classList.add('dot');
                    totalDots++;
                } else if (gameMap[y][x] === 3) {
                    cell.classList.add('dot', 'power-pellet');
                    totalDots++;
                }
            }
        }
    }
    
    resetPositions();
    document.querySelector('.game-win').style.display = 'none';
    gameRunning = true;
}

function restartGame() {
    // Zastavit animaci
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    // Reset všech proměnných
    score = 0;
    lives = 3;
    level = 1;
    totalDots = 0;
    gameRunning = true;
    paused = false;
    frightenedMode = false;
    ghostsEaten = 0;
    
    updateScore();
    updateLives();
    updateLevel();
    
    // Vyčištění herní plochy
    gameBoard.innerHTML = '';
    
    // Zrušení timerů
    if (frightenedTimer) {
        clearTimeout(frightenedTimer);
    }
    
    // Skrytí zpráv
    document.querySelector('.game-over').style.display = 'none';
    document.querySelector('.game-win').style.display = 'none';
    document.querySelector('.paused').style.display = 'none';
    
    // Vyčištění objektů
    pacman = null;
    ghosts = [];
    
    // Reinicializace hry
    initGame();
}

// Ovládání
document.addEventListener('keydown', (e) => {
    if (!gameRunning && e.key.toLowerCase() === 'r') {
        if (document.querySelector('.game-win').style.display === 'block') {
            nextLevel();
        } else {
            restartGame();
        }
        return;
    }

    if (!gameRunning || !pacman) return;

    switch(e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
            e.preventDefault();
            pacman.nextDirection = DIRECTIONS.UP;
            if (!pacman.direction) {
                pacman.direction = DIRECTIONS.UP;
            }
            break;
        case 'arrowdown':
        case 's':
            e.preventDefault();
            pacman.nextDirection = DIRECTIONS.DOWN;
            if (!pacman.direction) {
                pacman.direction = DIRECTIONS.DOWN;
            }
            break;
        case 'arrowleft':
        case 'a':
            e.preventDefault();
            pacman.nextDirection = DIRECTIONS.LEFT;
            if (!pacman.direction) {
                pacman.direction = DIRECTIONS.LEFT;
            }
            break;
        case 'arrowright':
        case 'd':
            e.preventDefault();
            pacman.nextDirection = DIRECTIONS.RIGHT;
            if (!pacman.direction) {
                pacman.direction = DIRECTIONS.RIGHT;
            }
            break;
        case ' ':
            e.preventDefault();
            paused = !paused;
            document.querySelector('.paused').style.display = paused ? 'block' : 'none';
            break;
        case 'r':
            e.preventDefault();
            restartGame();
            break;
    }
});

// Start hry
initGame();