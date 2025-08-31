import { GAME_CONFIG } from '../../shared/constants.js';

export class MapRenderer {
    constructor(gameMap) {
        this.gameMap = gameMap;
    }

    draw(ctx, animationFrame) {
        for (let y = 0; y < GAME_CONFIG.MAP.BOARD_HEIGHT - 1; y++) {
            for (let x = 0; x < GAME_CONFIG.MAP.BOARD_WIDTH - 1; x++) {
                const cell = this.gameMap[y][x];
                const cellX = x * GAME_CONFIG.MAP.CELL_SIZE;
                const cellY = y * GAME_CONFIG.MAP.CELL_SIZE;
                
                this.drawWalls(ctx, cell, cellX, cellY, x, y);
                this.drawDots(ctx, cell, cellX, cellY, animationFrame);
            }
        }
    }

    drawWalls(ctx, cell, cellX, cellY, x, y) {
        ctx.strokeStyle = GAME_CONFIG.COLORS.WALL;
        ctx.lineWidth = 2;
        
        if (cell & GAME_CONFIG.MAP.WALL_TOP) {
            ctx.beginPath();
            ctx.moveTo(cellX, cellY);
            ctx.lineTo(cellX + GAME_CONFIG.MAP.CELL_SIZE, cellY);
            ctx.stroke();
        }
        
        if (cell & GAME_CONFIG.MAP.WALL_LEFT) {
            ctx.beginPath();
            ctx.moveTo(cellX, cellY);
            ctx.lineTo(cellX, cellY + GAME_CONFIG.MAP.CELL_SIZE);
            ctx.stroke();
        }
        
        // Draw right wall if at edge
        if (x === GAME_CONFIG.MAP.BOARD_WIDTH - 2 && this.gameMap[y][x + 1] & GAME_CONFIG.MAP.WALL_LEFT) {
            ctx.beginPath();
            ctx.moveTo(cellX + GAME_CONFIG.MAP.CELL_SIZE, cellY);
            ctx.lineTo(cellX + GAME_CONFIG.MAP.CELL_SIZE, cellY + GAME_CONFIG.MAP.CELL_SIZE);
            ctx.stroke();
        }
        
        // Draw bottom wall if at edge
        if (y === GAME_CONFIG.MAP.BOARD_HEIGHT - 2 && this.gameMap[y + 1][x] & GAME_CONFIG.MAP.WALL_TOP) {
            ctx.beginPath();
            ctx.moveTo(cellX, cellY + GAME_CONFIG.MAP.CELL_SIZE);
            ctx.lineTo(cellX + GAME_CONFIG.MAP.CELL_SIZE, cellY + GAME_CONFIG.MAP.CELL_SIZE);
            ctx.stroke();
        }
    }

    drawDots(ctx, cell, cellX, cellY, animationFrame) {
        ctx.fillStyle = GAME_CONFIG.COLORS.DOT;
        
        // Draw dots
        if (cell & GAME_CONFIG.MAP.DOT) {
            ctx.beginPath();
            ctx.arc(
                cellX + GAME_CONFIG.MAP.CELL_SIZE / 2, 
                cellY + GAME_CONFIG.MAP.CELL_SIZE / 2, 
                3, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // Draw power pellets
        if (cell & GAME_CONFIG.MAP.POWER_PELLET) {
            const size = 8 + Math.sin(animationFrame * 0.1) * 2;
            ctx.beginPath();
            ctx.arc(
                cellX + GAME_CONFIG.MAP.CELL_SIZE / 2, 
                cellY + GAME_CONFIG.MAP.CELL_SIZE / 2, 
                size, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
        }
    }
}