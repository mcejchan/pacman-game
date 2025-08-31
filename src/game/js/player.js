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
        
        // Try to change direction
        if (this.nextDirection) {
            const nextGridX = Math.floor(this.x / GAME_CONFIG.MAP.CELL_SIZE);
            const nextGridY = Math.floor(this.y / GAME_CONFIG.MAP.CELL_SIZE);
            
            if (!hasWallFn(nextGridX, nextGridY, this.nextDirection)) {
                // Center on grid before turning
                if (Math.abs(this.x - (nextGridX * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2)) < 3 &&
                    Math.abs(this.y - (nextGridY * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2)) < 3) {
                    this.x = nextGridX * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
                    this.y = nextGridY * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
                    this.direction = this.nextDirection;
                    this.nextDirection = null;
                }
            }
        }
        
        // Move player
        if (this.direction) {
            const dir = GAME_CONFIG.DIRECTIONS[this.direction];
            const newX = this.x + dir.x * this.speed;
            const newY = this.y + dir.y * this.speed;
            
            const gridX = Math.floor(newX / GAME_CONFIG.MAP.CELL_SIZE);
            const gridY = Math.floor(newY / GAME_CONFIG.MAP.CELL_SIZE);
            
            if (!hasWallFn(gridX, gridY, this.direction)) {
                this.x = newX;
                this.y = newY;
                this.gridX = gridX;
                this.gridY = gridY;
                
                // Tunnel wrap
                if (this.x < 0) this.x = (GAME_CONFIG.MAP.BOARD_WIDTH - 2) * GAME_CONFIG.MAP.CELL_SIZE;
                if (this.x > (GAME_CONFIG.MAP.BOARD_WIDTH - 2) * GAME_CONFIG.MAP.CELL_SIZE) this.x = 0;
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