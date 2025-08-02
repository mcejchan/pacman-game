class PacManGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 30;
        this.mapWidth = 19;
        this.mapHeight = 21;
        
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        
        this.baseSpeed = 0.0005;
        this.pacmanSpeed = this.baseSpeed;
        this.ghostSpeed = this.baseSpeed;
        
        this.lastUpdateTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        this.map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
            [1,3,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1,3,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1],
            [1,2,2,2,2,2,1,2,2,1,2,2,1,2,2,2,2,2,1],
            [1,1,1,1,1,2,1,1,0,1,0,1,1,2,1,1,1,1,1],
            [0,0,0,0,1,2,1,0,0,0,0,0,1,2,1,0,0,0,0],
            [1,1,1,1,1,2,1,0,1,0,1,0,1,2,1,1,1,1,1],
            [0,0,0,0,0,2,0,0,1,4,1,0,0,2,0,0,0,0,0],
            [1,1,1,1,1,2,1,0,1,1,1,0,1,2,1,1,1,1,1],
            [0,0,0,0,1,2,1,0,0,0,0,0,1,2,1,0,0,0,0],
            [1,1,1,1,1,2,1,1,0,1,0,1,1,2,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1,2,1],
            [1,3,2,2,1,2,2,2,2,1,2,2,2,2,1,2,2,3,1],
            [1,1,1,2,1,2,1,2,1,1,1,2,1,2,1,2,1,1,1],
            [1,2,2,2,2,2,1,2,2,1,2,2,1,2,2,2,2,2,1],
            [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        
        this.pacman = {
            x: 9,
            y: 15,
            direction: 0,
            nextDirection: 0,
            isEating: false
        };
        
        this.ghosts = [
            { x: 9, y: 9, direction: 0, color: '#ff0000', mode: 'scatter', target: null, lastDirection: 0 },
            { x: 8, y: 9, direction: 0, color: '#ffb8ff', mode: 'scatter', target: null, lastDirection: 0 },
            { x: 10, y: 9, direction: 0, color: '#00ffff', mode: 'scatter', target: null, lastDirection: 0 },
            { x: 9, y: 10, direction: 0, color: '#ffb852', mode: 'scatter', target: null, lastDirection: 0 }
        ];
        
        this.directions = {
            0: { x: 0, y: 0 },
            1: { x: 0, y: -1 },
            2: { x: 1, y: 0 },
            3: { x: 0, y: 1 },
            4: { x: -1, y: 0 }
        };
        
        this.keys = {};
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateUI();
        this.gameLoop();
        this.gameRunning = true;
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.handleInput(e.key);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restart();
        });
    }
    
    handleInput(key) {
        if (!this.gameRunning || this.gamePaused) return;
        
        switch(key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                this.pacman.nextDirection = 1;
                break;
            case 'arrowright':
            case 'd':
                this.pacman.nextDirection = 2;
                break;
            case 'arrowdown':
            case 's':
                this.pacman.nextDirection = 3;
                break;
            case 'arrowleft':
            case 'a':
                this.pacman.nextDirection = 4;
                break;
            case ' ':
                this.togglePause();
                break;
            case 'r':
                this.restart();
                break;
        }
    }
    
    togglePause() {
        this.gamePaused = !this.gamePaused;
        document.getElementById('gameStatus').textContent = this.gamePaused ? 'PAUZA' : '';
    }
    
    restart() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameRunning = true;
        this.gamePaused = false;
        
        this.pacman.x = 9;
        this.pacman.y = 15;
        this.pacman.direction = 0;
        this.pacman.nextDirection = 0;
        
        this.ghosts.forEach((ghost, i) => {
            ghost.x = 9 + (i % 2 === 0 ? 0 : i === 1 ? -1 : 1);
            ghost.y = 9 + (i > 1 ? 1 : 0);
            ghost.direction = 0;
            ghost.mode = 'scatter';
            ghost.target = null;
            ghost.lastDirection = 0;
        });
        
        this.resetMap();
        this.updateUI();
        document.getElementById('gameStatus').textContent = '';
    }
    
    resetMap() {
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                if (this.map[y][x] === 0 && (x === 0 || x === this.mapWidth - 1)) {
                    continue;
                }
                if (this.map[y][x] === 0) {
                    this.map[y][x] = 2;
                }
            }
        }
    }
    
    updatePacmanSpeed() {
        const currentCell = this.map[Math.floor(this.pacman.y)][Math.floor(this.pacman.x)];
        if (currentCell === 2 || currentCell === 3) {
            this.pacman.isEating = true;
            this.pacmanSpeed = this.baseSpeed * 0.9;
        } else {
            this.pacman.isEating = false;
            this.pacmanSpeed = this.baseSpeed * 1.1;
        }
    }
    
    canMove(x, y, direction) {
        const dir = this.directions[direction];
        const newX = x + dir.x;
        const newY = y + dir.y;
        
        if (newX < 0) return { x: this.mapWidth - 1, y: newY };
        if (newX >= this.mapWidth) return { x: 0, y: newY };
        if (newY < 0 || newY >= this.mapHeight) return null;
        
        const cell = this.map[Math.floor(newY)][Math.floor(newX)];
        return cell !== 1 ? { x: newX, y: newY } : null;
    }
    
    movePacman() {
        if (this.pacman.nextDirection !== this.pacman.direction) {
            const nextMove = this.canMove(this.pacman.x, this.pacman.y, this.pacman.nextDirection);
            if (nextMove) {
                this.pacman.direction = this.pacman.nextDirection;
            }
        }
        
        const move = this.canMove(this.pacman.x, this.pacman.y, this.pacman.direction);
        if (move) {
            this.pacman.x = move.x;
            this.pacman.y = move.y;
            
            const cellX = Math.floor(this.pacman.x);
            const cellY = Math.floor(this.pacman.y);
            const cell = this.map[cellY][cellX];
            
            if (cell === 2) {
                this.map[cellY][cellX] = 0;
                this.score += 10;
            } else if (cell === 3) {
                this.map[cellY][cellX] = 0;
                this.score += 50;
                this.frightenGhosts();
            }
        }
        
        this.updatePacmanSpeed();
    }
    
    frightenGhosts() {
        this.ghosts.forEach(ghost => {
            ghost.mode = 'frightened';
            ghost.direction = this.getOppositeDirection(ghost.direction);
        });
        
        setTimeout(() => {
            this.ghosts.forEach(ghost => {
                if (ghost.mode === 'frightened') {
                    ghost.mode = 'scatter';
                }
            });
        }, 8000);
    }
    
    getOppositeDirection(direction) {
        const opposites = { 1: 3, 2: 4, 3: 1, 4: 2, 0: 0 };
        return opposites[direction] || 0;
    }
    
    canGhostSeePlayer(ghost) {
        const dx = this.pacman.x - ghost.x;
        const dy = this.pacman.y - ghost.y;
        
        if (Math.abs(dx) < 0.1 && dy !== 0) {
            const startY = Math.min(ghost.y, this.pacman.y);
            const endY = Math.max(ghost.y, this.pacman.y);
            for (let y = Math.floor(startY); y <= Math.ceil(endY); y++) {
                if (this.map[y] && this.map[y][Math.floor(ghost.x)] === 1) {
                    return false;
                }
            }
            return true;
        }
        
        if (Math.abs(dy) < 0.1 && dx !== 0) {
            const startX = Math.min(ghost.x, this.pacman.x);
            const endX = Math.max(ghost.x, this.pacman.x);
            for (let x = Math.floor(startX); x <= Math.ceil(endX); x++) {
                if (this.map[Math.floor(ghost.y)] && this.map[Math.floor(ghost.y)][x] === 1) {
                    return false;
                }
            }
            return true;
        }
        
        return false;
    }
    
    getDirectionToTarget(ghost, targetX, targetY) {
        const directions = [1, 2, 3, 4];
        let bestDirection = 0;
        let minDistance = Infinity;
        
        for (let dir of directions) {
            if (dir === this.getOppositeDirection(ghost.lastDirection)) continue;
            
            const move = this.canMove(ghost.x, ghost.y, dir);
            if (move) {
                const distance = Math.sqrt(
                    Math.pow(move.x - targetX, 2) + Math.pow(move.y - targetY, 2)
                );
                if (distance < minDistance) {
                    minDistance = distance;
                    bestDirection = dir;
                }
            }
        }
        
        return bestDirection;
    }
    
    moveGhost(ghost) {
        let targetX = ghost.x;
        let targetY = ghost.y;
        
        if (ghost.mode === 'frightened') {
            targetX = Math.random() * this.mapWidth;
            targetY = Math.random() * this.mapHeight;
        } else if (this.canGhostSeePlayer(ghost)) {
            ghost.mode = 'chase';
            targetX = this.pacman.x;
            targetY = this.pacman.y;
        } else if (ghost.mode === 'chase') {
            ghost.mode = 'scatter';
        }
        
        if (ghost.mode === 'scatter') {
            const directions = [1, 2, 3, 4];
            const validDirections = directions.filter(dir => {
                if (dir === this.getOppositeDirection(ghost.lastDirection)) return false;
                return this.canMove(ghost.x, ghost.y, dir) !== null;
            });
            
            if (validDirections.length > 0) {
                ghost.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
            }
        } else {
            ghost.direction = this.getDirectionToTarget(ghost, targetX, targetY);
        }
        
        const move = this.canMove(ghost.x, ghost.y, ghost.direction);
        if (move) {
            ghost.lastDirection = ghost.direction;
            ghost.x = move.x;
            ghost.y = move.y;
        } else {
            const directions = [1, 2, 3, 4];
            const validDirections = directions.filter(dir => 
                this.canMove(ghost.x, ghost.y, dir) !== null
            );
            if (validDirections.length > 0) {
                ghost.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
                const newMove = this.canMove(ghost.x, ghost.y, ghost.direction);
                if (newMove) {
                    ghost.lastDirection = ghost.direction;
                    ghost.x = newMove.x;
                    ghost.y = newMove.y;
                }
            }
        }
    }
    
    checkCollisions() {
        this.ghosts.forEach(ghost => {
            const distance = Math.sqrt(
                Math.pow(this.pacman.x - ghost.x, 2) + 
                Math.pow(this.pacman.y - ghost.y, 2)
            );
            
            if (distance < 0.8) {
                if (ghost.mode === 'frightened') {
                    ghost.x = 9;
                    ghost.y = 9;
                    ghost.mode = 'scatter';
                    this.score += 200;
                } else {
                    this.lives--;
                    if (this.lives <= 0) {
                        this.gameOver();
                    } else {
                        this.resetPositions();
                    }
                }
            }
        });
    }
    
    resetPositions() {
        this.pacman.x = 9;
        this.pacman.y = 15;
        this.pacman.direction = 0;
        this.pacman.nextDirection = 0;
        
        this.ghosts.forEach((ghost, i) => {
            ghost.x = 9 + (i % 2 === 0 ? 0 : i === 1 ? -1 : 1);
            ghost.y = 9 + (i > 1 ? 1 : 0);
            ghost.direction = 0;
            ghost.mode = 'scatter';
        });
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('gameStatus').textContent = 'GAME OVER';
    }
    
    update(deltaTime) {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.movePacman();
        this.ghosts.forEach(ghost => this.moveGhost(ghost));
        this.checkCollisions();
        this.updateUI();
        
        let dotsRemaining = 0;
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                if (this.map[y][x] === 2 || this.map[y][x] === 3) {
                    dotsRemaining++;
                }
            }
        }
        
        if (dotsRemaining === 0) {
            this.level++;
            this.baseSpeed += 0.01;
            this.resetMap();
            this.resetPositions();
        }
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const cell = this.map[y][x];
                const drawX = x * this.cellSize;
                const drawY = y * this.cellSize;
                
                switch(cell) {
                    case 1:
                        this.ctx.fillStyle = '#0000ff';
                        this.ctx.fillRect(drawX, drawY, this.cellSize, this.cellSize);
                        break;
                    case 2:
                        this.ctx.fillStyle = '#ffff00';
                        this.ctx.beginPath();
                        this.ctx.arc(drawX + this.cellSize/2, drawY + this.cellSize/2, 2, 0, Math.PI * 2);
                        this.ctx.fill();
                        break;
                    case 3:
                        this.ctx.fillStyle = '#ffff00';
                        this.ctx.beginPath();
                        this.ctx.arc(drawX + this.cellSize/2, drawY + this.cellSize/2, 8, 0, Math.PI * 2);
                        this.ctx.fill();
                        break;
                }
            }
        }
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        const pacX = this.pacman.x * this.cellSize + this.cellSize/2;
        const pacY = this.pacman.y * this.cellSize + this.cellSize/2;
        this.ctx.arc(pacX, pacY, this.cellSize/2 - 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ghosts.forEach(ghost => {
            this.ctx.fillStyle = ghost.mode === 'frightened' ? '#0000ff' : ghost.color;
            this.ctx.beginPath();
            const ghostX = ghost.x * this.cellSize + this.cellSize/2;
            const ghostY = ghost.y * this.cellSize + this.cellSize/2;
            this.ctx.arc(ghostX, ghostY, this.cellSize/2 - 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastUpdateTime;
        
        if (deltaTime >= this.frameInterval) {
            this.update(deltaTime);
            this.draw();
            this.lastUpdateTime = currentTime;
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

const game = new PacManGame();