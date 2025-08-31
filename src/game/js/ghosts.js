import { GAME_CONFIG } from '../../shared/constants.js';

class Ghost {
    constructor(x, y, index) {
        this.x = x * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
        this.y = y * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
        this.gridX = x;
        this.gridY = y;
        this.startX = this.x;
        this.startY = this.y;
        this.startGridX = x;
        this.startGridY = y;
        
        this.color = GAME_CONFIG.GHOSTS.COLORS[index % 4];
        const dirKeys = Object.keys(GAME_CONFIG.DIRECTIONS);
        this.direction = dirKeys[Math.floor(Math.random() * 4)];
        this.speed = GAME_CONFIG.GHOSTS.NORMAL_SPEED;
        this.isChasing = false;
        this.ghostMultiplier = 1;
    }

    update(player, frightenedMode, hasWallFn) {
        // Check if ghost can see Pac-Man
        this.isChasing = false;
        if (!frightenedMode) {
            const dx = player.gridX - this.gridX;
            const dy = player.gridY - this.gridY;
            
            // Check if in same row or column
            if (dx === 0 || dy === 0) {
                let canSee = true;
                
                // Check for walls between ghost and Pac-Man
                if (dx === 0) {
                    const dir = dy > 0 ? 'DOWN' : 'UP';
                    for (let y = Math.min(this.gridY, player.gridY); y <= Math.max(this.gridY, player.gridY); y++) {
                        if (hasWallFn(this.gridX, y, dir)) {
                            canSee = false;
                            break;
                        }
                    }
                } else {
                    const dir = dx > 0 ? 'RIGHT' : 'LEFT';
                    for (let x = Math.min(this.gridX, player.gridX); x <= Math.max(this.gridX, player.gridX); x++) {
                        if (hasWallFn(x, this.gridY, dir)) {
                            canSee = false;
                            break;
                        }
                    }
                }
                
                if (canSee) {
                    this.isChasing = true;
                }
            }
        }
        
        // Determine movement
        const possibleDirs = [];
        const currentDir = this.direction;
        const oppositeDir = GAME_CONFIG.DIRECTIONS[currentDir].opposite;
        
        for (let dir in GAME_CONFIG.DIRECTIONS) {
            if (dir !== oppositeDir && !hasWallFn(this.gridX, this.gridY, dir)) {
                possibleDirs.push(dir);
            }
        }
        
        // If at intersection or need to turn
        if (Math.abs(this.x - (this.gridX * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2)) < 2 &&
            Math.abs(this.y - (this.gridY * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2)) < 2) {
            
            let newDirection = currentDir;
            
            if (frightenedMode) {
                // Random movement when frightened
                if (possibleDirs.length > 0) {
                    newDirection = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                }
            } else if (this.isChasing && possibleDirs.length > 0) {
                // Chase Pac-Man
                let bestDir = possibleDirs[0];
                let bestDist = Infinity;
                
                possibleDirs.forEach(dir => {
                    const nextX = this.gridX + GAME_CONFIG.DIRECTIONS[dir].x;
                    const nextY = this.gridY + GAME_CONFIG.DIRECTIONS[dir].y;
                    const dist = Math.abs(nextX - player.gridX) + Math.abs(nextY - player.gridY);
                    if (dist < bestDist) {
                        bestDist = dist;
                        bestDir = dir;
                    }
                });
                
                newDirection = bestDir;
            } else if (possibleDirs.length > 0) {
                // Random movement
                if (!hasWallFn(this.gridX, this.gridY, currentDir) && Math.random() > 0.3) {
                    newDirection = currentDir;
                } else {
                    newDirection = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                }
            }
            
            this.direction = newDirection;
            this.x = this.gridX * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
            this.y = this.gridY * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
        }
        
        // Move ghost
        const dir = GAME_CONFIG.DIRECTIONS[this.direction];
        this.x += dir.x * this.speed;
        this.y += dir.y * this.speed;
        this.gridX = Math.floor(this.x / GAME_CONFIG.MAP.CELL_SIZE);
        this.gridY = Math.floor(this.y / GAME_CONFIG.MAP.CELL_SIZE);
        
        // Tunnel wrap
        if (this.x < 0) this.x = (GAME_CONFIG.MAP.BOARD_WIDTH - 1) * GAME_CONFIG.MAP.CELL_SIZE;
        if (this.x > (GAME_CONFIG.MAP.BOARD_WIDTH - 1) * GAME_CONFIG.MAP.CELL_SIZE) this.x = 0;
    }

    setFrightened(frightened) {
        if (frightened) {
            this.speed = GAME_CONFIG.GHOSTS.FRIGHTENED_SPEED;
            // Reverse direction
            this.direction = GAME_CONFIG.DIRECTIONS[this.direction].opposite;
        } else {
            this.speed = GAME_CONFIG.GHOSTS.NORMAL_SPEED;
            this.ghostMultiplier = 1;
        }
    }

    resetPosition() {
        this.x = 9 * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
        this.y = 9 * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
        this.gridX = 9;
        this.gridY = 9;
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.gridX = this.startGridX;
        this.gridY = this.startGridY;
        const dirKeys = Object.keys(GAME_CONFIG.DIRECTIONS);
        this.direction = dirKeys[Math.floor(Math.random() * 4)];
        this.speed = GAME_CONFIG.GHOSTS.NORMAL_SPEED;
        this.ghostMultiplier = 1;
    }

    draw(ctx, frightenedMode, frightenedTimer, animationFrame) {
        if (frightenedMode) {
            ctx.fillStyle = frightenedTimer < 120 && Math.floor(frightenedTimer / 20) % 2 ? 
                GAME_CONFIG.COLORS.FRIGHTENED_GHOST_FLASH : 
                GAME_CONFIG.COLORS.FRIGHTENED_GHOST;
        } else {
            ctx.fillStyle = this.color;
        }
        
        ctx.beginPath();
        ctx.arc(this.x, this.y - 2, GAME_CONFIG.MAP.CELL_SIZE * GAME_CONFIG.GHOSTS.SIZE, Math.PI, 0, false);
        ctx.lineTo(this.x + GAME_CONFIG.MAP.CELL_SIZE * GAME_CONFIG.GHOSTS.SIZE, this.y + GAME_CONFIG.MAP.CELL_SIZE * 0.3);
        
        // Wavy bottom
        for (let i = 0; i < 4; i++) {
            const waveX = this.x + GAME_CONFIG.MAP.CELL_SIZE * GAME_CONFIG.GHOSTS.SIZE - (i + 1) * (GAME_CONFIG.MAP.CELL_SIZE * 0.2);
            const waveY = this.y + GAME_CONFIG.MAP.CELL_SIZE * 0.3 + Math.sin(animationFrame * 0.1 + i) * 2;
            ctx.lineTo(waveX, waveY);
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Eyes
        if (!frightenedMode) {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(this.x - 5, this.y - 2, 4, 0, Math.PI * 2);
            ctx.arc(this.x + 5, this.y - 2, 4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(this.x - 5, this.y - 2, 2, 0, Math.PI * 2);
            ctx.arc(this.x + 5, this.y - 2, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

export class GhostManager {
    constructor(gameMap) {
        this.ghosts = [];
        this.createGhosts(gameMap);
    }

    createGhosts(gameMap) {
        // Find ghost spawn points
        for (let y = 0; y < GAME_CONFIG.MAP.BOARD_HEIGHT - 1; y++) {
            for (let x = 0; x < GAME_CONFIG.MAP.BOARD_WIDTH - 1; x++) {
                const cell = gameMap[y][x];
                if (cell & GAME_CONFIG.MAP.GHOST_SPAWN) {
                    this.ghosts.push(new Ghost(x, y, this.ghosts.length));
                }
            }
        }
        
        // Create 4 ghosts if not enough spawn points
        while (this.ghosts.length < 4) {
            this.ghosts.push(new Ghost(9, 9, this.ghosts.length));
        }
    }

    update(player, frightenedMode, hasWallFn) {
        this.ghosts.forEach(ghost => {
            ghost.update(player, frightenedMode, hasWallFn);
        });
    }

    setFrightened(frightened) {
        this.ghosts.forEach(ghost => {
            ghost.setFrightened(frightened);
        });
    }

    checkPlayerCollision(player, frightenedMode, collisionCallback) {
        this.ghosts.forEach(ghost => {
            const dist = Math.sqrt(Math.pow(ghost.x - player.x, 2) + Math.pow(ghost.y - player.y, 2));
            if (dist < GAME_CONFIG.MAP.CELL_SIZE * 0.7) {
                collisionCallback(ghost);
            }
        });
    }

    resetAll() {
        this.ghosts.forEach(ghost => {
            ghost.reset();
        });
    }

    draw(ctx, frightenedMode, frightenedTimer, animationFrame) {
        this.ghosts.forEach(ghost => {
            ghost.draw(ctx, frightenedMode, frightenedTimer, animationFrame);
        });
    }
}