import { GAME_CONFIG } from '../../shared/constants.js';

export class Player {
    constructor(gridX, gridY) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.x = gridX * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
        this.y = gridY * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
        this.startX = this.x;
        this.startY = this.y;
        this.startGridX = gridX;
        this.startGridY = gridY;
        
        this.direction = null;
        this.nextDirection = null;
        this.speed = GAME_CONFIG.PLAYER.BASE_SPEED;
        this.mouthOpen = 0;
    }

    setNextDirection(direction) {
        this.nextDirection = direction;
    }

    update(gameMap, hasWallFn) {
        if (!this.direction && !this.nextDirection) return;
        
        // Calculate current grid position based on center of player
        const currentGridX = Math.round((this.x - GAME_CONFIG.MAP.CELL_SIZE / 2) / GAME_CONFIG.MAP.CELL_SIZE);
        const currentGridY = Math.round((this.y - GAME_CONFIG.MAP.CELL_SIZE / 2) / GAME_CONFIG.MAP.CELL_SIZE);
        
        // Try to change direction
        if (this.nextDirection) {
            const centerX = currentGridX * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
            const centerY = currentGridY * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
            
            // If player has no current direction, start moving immediately
            if (!this.direction) {
                // Check if new direction is valid
                if (!hasWallFn(currentGridX, currentGridY, this.nextDirection)) {
                    // Snap to grid center and start moving
                    this.x = centerX;
                    this.y = centerY;
                    this.gridX = currentGridX;
                    this.gridY = currentGridY;
                    this.direction = this.nextDirection;
                    this.nextDirection = null;
                }
            } else {
                // Player is already moving, check if we can change direction
                const distanceFromCenter = Math.abs(this.x - centerX) + Math.abs(this.y - centerY);
                
                if (distanceFromCenter <= this.speed * 1.5) {
                    // Check if new direction is valid
                    if (!hasWallFn(currentGridX, currentGridY, this.nextDirection)) {
                        // Snap to grid center and change direction
                        this.x = centerX;
                        this.y = centerY;
                        this.gridX = currentGridX;
                        this.gridY = currentGridY;
                        this.direction = this.nextDirection;
                        this.nextDirection = null;
                    }
                }
            }
        }
        
        // Move player in current direction
        if (this.direction) {
            const dir = GAME_CONFIG.DIRECTIONS[this.direction];
            const newX = this.x + dir.x * this.speed;
            const newY = this.y + dir.y * this.speed;
            
            // Calculate which grid cell we would move into
            const targetGridX = Math.round((newX - GAME_CONFIG.MAP.CELL_SIZE / 2) / GAME_CONFIG.MAP.CELL_SIZE);
            const targetGridY = Math.round((newY - GAME_CONFIG.MAP.CELL_SIZE / 2) / GAME_CONFIG.MAP.CELL_SIZE);
            
            
            // Check if we would hit a wall by moving to new position
            let canMove = true;
            
            // Check for wall collision when approaching cell edge or moving to different cell
            const centerX = currentGridX * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
            const centerY = currentGridY * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
            const halfCell = GAME_CONFIG.MAP.CELL_SIZE / 2;
            
            
            // If moving horizontally and approaching right/left edge of current cell
            if (this.direction === 'RIGHT' && newX > centerX + halfCell - this.speed) {
                canMove = !hasWallFn(currentGridX, currentGridY, this.direction);
            } else if (this.direction === 'LEFT' && newX < centerX - halfCell + this.speed) {
                canMove = !hasWallFn(currentGridX, currentGridY, this.direction);
            }
            // If moving vertically and approaching top/bottom edge of current cell  
            else if (this.direction === 'UP' && newY < centerY - halfCell + this.speed) {
                canMove = !hasWallFn(currentGridX, currentGridY, this.direction);
            } else if (this.direction === 'DOWN' && newY > centerY + halfCell - this.speed) {
                canMove = !hasWallFn(currentGridX, currentGridY, this.direction);
            }
            // Also check if we're moving to a different grid cell (original logic)
            else if (targetGridX !== currentGridX || targetGridY !== currentGridY) {
                canMove = !hasWallFn(currentGridX, currentGridY, this.direction);
            }
            
            if (!canMove) {
                
                // Stop at edge of current cell when hitting wall, not at center
                let stopX = this.x;
                let stopY = this.y;
                
                if (this.direction === 'RIGHT') {
                    stopX = centerX + halfCell - 1; // Stop just before right edge
                } else if (this.direction === 'LEFT') {
                    stopX = centerX - halfCell + 1; // Stop just after left edge
                } else if (this.direction === 'UP') {
                    stopY = centerY - halfCell + 1; // Stop just after top edge
                } else if (this.direction === 'DOWN') {
                    stopY = centerY + halfCell - 1; // Stop just before bottom edge
                }
                
                
                this.x = stopX;
                this.y = stopY;
                this.gridX = currentGridX;
                this.gridY = currentGridY;
                this.direction = null;
                return;
            }
            
            // Can move safely - update position
            this.x = newX;
            this.y = newY;
            this.gridX = targetGridX;
            this.gridY = targetGridY;
            
            // Handle tunnel wrapping
            if (this.x < GAME_CONFIG.MAP.CELL_SIZE / 2) {
                this.x = (GAME_CONFIG.MAP.BOARD_WIDTH - 1) * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
                this.gridX = GAME_CONFIG.MAP.BOARD_WIDTH - 1;
            }
            if (this.x > (GAME_CONFIG.MAP.BOARD_WIDTH - 0.5) * GAME_CONFIG.MAP.CELL_SIZE) {
                this.x = GAME_CONFIG.MAP.CELL_SIZE / 2;
                this.gridX = 0;
            }
        }
        
        // Animate mouth
        this.mouthOpen = (this.mouthOpen + 0.15) % (Math.PI * 2);
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.gridX = this.startGridX;
        this.gridY = this.startGridY;
        this.direction = null;
        this.nextDirection = null;
        this.speed = GAME_CONFIG.PLAYER.BASE_SPEED;
    }

    draw(ctx) {
        ctx.fillStyle = GAME_CONFIG.COLORS.PLAYER;
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Rotate based on direction
        let rotation = 0;
        if (this.direction === 'RIGHT') rotation = 0;
        else if (this.direction === 'DOWN') rotation = Math.PI / 2;
        else if (this.direction === 'LEFT') rotation = Math.PI;
        else if (this.direction === 'UP') rotation = -Math.PI / 2;
        ctx.rotate(rotation);
        
        // Draw Pac-Man with animated mouth
        const mouthAngle = Math.abs(Math.sin(this.mouthOpen)) * 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, GAME_CONFIG.MAP.CELL_SIZE * GAME_CONFIG.PLAYER.SIZE, mouthAngle, Math.PI * 2 - mouthAngle);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}