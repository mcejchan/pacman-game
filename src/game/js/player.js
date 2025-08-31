import { GAME_CONFIG } from '../../shared/constants.js';

export class Player {
    constructor(startPosition) {
        this.position = { ...startPosition };
        this.startPosition = { ...startPosition };
        this.direction = null;
        this.nextDirection = null;
        this.speed = GAME_CONFIG.PLAYER.BASE_SPEED;
        this.size = GAME_CONFIG.PLAYER.SIZE;
        this.isEating = false;
    }

    setDirection(direction) {
        this.nextDirection = direction;
    }

    update(deltaTime, mapManager) {
        // Try to change direction if possible
        if (this.nextDirection && this.canChangeDirection(this.nextDirection, mapManager)) {
            this.direction = this.nextDirection;
            this.nextDirection = null;
        }

        // Move in current direction
        if (this.direction && this.canMove(this.direction, mapManager)) {
            this.move(deltaTime, mapManager);
        } else {
            // Stop if hitting wall
            this.direction = null;
        }

        // Update eating state
        const playerTile = mapManager.getPlayerTile(this.position);
        this.isEating = mapManager.hasDot(playerTile.x, playerTile.y);
    }

    canChangeDirection(direction, mapManager) {
        const testPosition = { ...this.position };
        const moveDistance = 2; // Small test distance

        switch (direction) {
            case 'up':
                testPosition.y -= moveDistance;
                break;
            case 'down':
                testPosition.y += moveDistance;
                break;
            case 'left':
                testPosition.x -= moveDistance;
                break;
            case 'right':
                testPosition.x += moveDistance;
                break;
        }

        return !mapManager.isWall(testPosition);
    }

    canMove(direction, mapManager) {
        return this.canChangeDirection(direction, mapManager);
    }

    move(deltaTime, mapManager) {
        const currentSpeed = this.isEating ? 
            this.speed * GAME_CONFIG.PLAYER.EATING_SPEED_MODIFIER :
            this.speed * GAME_CONFIG.PLAYER.EMPTY_PATH_SPEED_MODIFIER;

        const distance = currentSpeed * deltaTime / 1000;

        switch (this.direction) {
            case 'up':
                this.position.y -= distance;
                break;
            case 'down':
                this.position.y += distance;
                break;
            case 'left':
                this.position.x -= distance;
                break;
            case 'right':
                this.position.x += distance;
                break;
        }

        // Handle tunnel wrapping
        this.handleTunnelWrap(mapManager);
    }

    handleTunnelWrap(mapManager) {
        const mapWidth = mapManager.getMapWidth();
        const tileSize = mapManager.getTileSize();
        
        if (this.position.x < -this.size / 2) {
            this.position.x = mapWidth * tileSize + this.size / 2;
        } else if (this.position.x > mapWidth * tileSize + this.size / 2) {
            this.position.x = -this.size / 2;
        }
    }

    reset(startPosition) {
        this.position = { ...startPosition };
        this.direction = null;
        this.nextDirection = null;
        this.isEating = false;
    }

    render(ctx) {
        ctx.save();
        ctx.fillStyle = GAME_CONFIG.COLORS.PLAYER;
        
        // Draw PacMan as circle
        ctx.beginPath();
        ctx.arc(
            this.position.x,
            this.position.y,
            this.size / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Draw mouth based on direction
        if (this.direction) {
            ctx.fillStyle = '#000';
            ctx.beginPath();
            
            let startAngle, endAngle;
            switch (this.direction) {
                case 'right':
                    startAngle = -Math.PI / 6;
                    endAngle = Math.PI / 6;
                    break;
                case 'left':
                    startAngle = Math.PI - Math.PI / 6;
                    endAngle = Math.PI + Math.PI / 6;
                    break;
                case 'up':
                    startAngle = -Math.PI / 2 - Math.PI / 6;
                    endAngle = -Math.PI / 2 + Math.PI / 6;
                    break;
                case 'down':
                    startAngle = Math.PI / 2 - Math.PI / 6;
                    endAngle = Math.PI / 2 + Math.PI / 6;
                    break;
            }

            ctx.arc(
                this.position.x,
                this.position.y,
                this.size / 2,
                startAngle,
                endAngle
            );
            ctx.lineTo(this.position.x, this.position.y);
            ctx.fill();
        }

        ctx.restore();
    }

    getCollisionBounds() {
        return {
            x: this.position.x - this.size / 2,
            y: this.position.y - this.size / 2,
            width: this.size,
            height: this.size
        };
    }
}