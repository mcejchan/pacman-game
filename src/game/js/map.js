import { GAME_CONFIG } from '../../shared/constants.js';

export class MapManager {
    constructor(mapData) {
        this.originalMap = JSON.parse(JSON.stringify(mapData));
        this.currentMap = JSON.parse(JSON.stringify(mapData));
        this.tileSize = GAME_CONFIG.MAP.TILE_SIZE;
        this.width = this.currentMap[0].length;
        this.height = this.currentMap.length;
        this.totalDots = this.countTotalDots();
        this.collectedDots = 0;
    }

    countTotalDots() {
        let count = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.currentMap[y][x] === GAME_CONFIG.MAP.TILES.DOT || 
                    this.currentMap[y][x] === GAME_CONFIG.MAP.TILES.POWER_PELLET) {
                    count++;
                }
            }
        }
        return count;
    }

    getTile(x, y) {
        if (y < 0 || y >= this.height || x < 0 || x >= this.width) {
            return GAME_CONFIG.MAP.TILES.WALL;
        }
        return this.currentMap[y][x];
    }

    setTile(x, y, value) {
        if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
            this.currentMap[y][x] = value;
        }
    }

    isWall(position) {
        const tileX = Math.floor(position.x / this.tileSize);
        const tileY = Math.floor(position.y / this.tileSize);
        return this.getTile(tileX, tileY) === GAME_CONFIG.MAP.TILES.WALL;
    }

    hasDot(tileX, tileY) {
        return this.getTile(tileX, tileY) === GAME_CONFIG.MAP.TILES.DOT;
    }

    hasPowerPellet(tileX, tileY) {
        return this.getTile(tileX, tileY) === GAME_CONFIG.MAP.TILES.POWER_PELLET;
    }

    collectDot(tileX, tileY) {
        if (this.hasDot(tileX, tileY)) {
            this.setTile(tileX, tileY, GAME_CONFIG.MAP.TILES.EMPTY);
            this.collectedDots++;
            return true;
        }
        return false;
    }

    collectPowerPellet(tileX, tileY) {
        if (this.hasPowerPellet(tileX, tileY)) {
            this.setTile(tileX, tileY, GAME_CONFIG.MAP.TILES.EMPTY);
            this.collectedDots++;
            return true;
        }
        return false;
    }

    areAllDotsCollected() {
        return this.collectedDots >= this.totalDots;
    }

    getPlayerTile(position) {
        return {
            x: Math.floor(position.x / this.tileSize),
            y: Math.floor(position.y / this.tileSize)
        };
    }

    getPlayerStartPosition() {
        // Find player start position (P in map data)
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.originalMap[y][x] === GAME_CONFIG.MAP.TILES.PLAYER_START) {
                    return {
                        x: x * this.tileSize + this.tileSize / 2,
                        y: y * this.tileSize + this.tileSize / 2
                    };
                }
            }
        }
        // Fallback position
        return { x: this.tileSize * 9.5, y: this.tileSize * 15 };
    }

    getGhostStartPositions() {
        const positions = [];
        // Find ghost start positions (G in map data)
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.originalMap[y][x] === GAME_CONFIG.MAP.TILES.GHOST_START) {
                    positions.push({
                        x: x * this.tileSize + this.tileSize / 2,
                        y: y * this.tileSize + this.tileSize / 2
                    });
                }
            }
        }
        
        // If not enough ghost positions found, create default ones
        while (positions.length < 4) {
            const baseX = 9 * this.tileSize + this.tileSize / 2;
            const baseY = 9 * this.tileSize + this.tileSize / 2;
            positions.push({
                x: baseX + (positions.length * this.tileSize),
                y: baseY
            });
        }
        
        return positions.slice(0, 4); // Return only first 4 positions
    }

    getMapWidth() {
        return this.width;
    }

    getMapHeight() {
        return this.height;
    }

    getTileSize() {
        return this.tileSize;
    }

    resetMap() {
        this.currentMap = JSON.parse(JSON.stringify(this.originalMap));
        this.collectedDots = 0;
    }

    render(ctx) {
        ctx.save();
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.currentMap[y][x];
                const pixelX = x * this.tileSize;
                const pixelY = y * this.tileSize;

                switch (tile) {
                    case GAME_CONFIG.MAP.TILES.WALL:
                        this.renderWall(ctx, pixelX, pixelY);
                        break;
                    case GAME_CONFIG.MAP.TILES.DOT:
                        this.renderDot(ctx, pixelX, pixelY);
                        break;
                    case GAME_CONFIG.MAP.TILES.POWER_PELLET:
                        this.renderPowerPellet(ctx, pixelX, pixelY);
                        break;
                    case GAME_CONFIG.MAP.TILES.EMPTY:
                    case GAME_CONFIG.MAP.TILES.PLAYER_START:
                    case GAME_CONFIG.MAP.TILES.GHOST_START:
                        // Empty space - no rendering needed
                        break;
                }
            }
        }
        
        ctx.restore();
    }

    renderWall(ctx, x, y) {
        ctx.fillStyle = GAME_CONFIG.COLORS.WALL;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
    }

    renderDot(ctx, x, y) {
        ctx.fillStyle = GAME_CONFIG.COLORS.DOT;
        ctx.beginPath();
        ctx.arc(
            x + this.tileSize / 2,
            y + this.tileSize / 2,
            2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    renderPowerPellet(ctx, x, y) {
        ctx.fillStyle = GAME_CONFIG.COLORS.POWER_PELLET;
        ctx.beginPath();
        ctx.arc(
            x + this.tileSize / 2,
            y + this.tileSize / 2,
            6,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}