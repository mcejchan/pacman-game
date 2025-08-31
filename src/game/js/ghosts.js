import { GAME_CONFIG } from '../../shared/constants.js';

class Ghost {
    constructor(startPosition, color, type) {
        this.position = { ...startPosition };
        this.startPosition = { ...startPosition };
        this.direction = 'up';
        this.previousDirection = null;
        this.speed = GAME_CONFIG.GHOSTS.BASE_SPEED;
        this.size = GAME_CONFIG.GHOSTS.SIZE;
        this.color = color;
        this.type = type;
        this.mode = 'scatter'; // scatter, chase, frightened, eaten
        this.frightenedTimer = 0;
        this.canSeePlayer = false;
        this.lastPlayerPosition = null;
    }

    update(deltaTime, player, mapManager) {
        if (this.mode === 'frightened') {
            this.frightenedTimer -= deltaTime;
            if (this.frightenedTimer <= 0) {
                this.mode = 'scatter';
            }
        }

        this.checkPlayerVisibility(player, mapManager);
        this.updateDirection(player, mapManager);
        this.move(deltaTime, mapManager);
    }

    checkPlayerVisibility(player, mapManager) {
        const dx = Math.abs(player.position.x - this.position.x);
        const dy = Math.abs(player.position.y - this.position.y);
        const maxDistance = GAME_CONFIG.GHOSTS.SIGHT_DISTANCE;

        // Check if player is in line of sight (horizontal or vertical)
        const isHorizontal = dy < GAME_CONFIG.GHOSTS.SIGHT_TOLERANCE && dx < maxDistance;
        const isVertical = dx < GAME_CONFIG.GHOSTS.SIGHT_TOLERANCE && dy < maxDistance;

        if (isHorizontal || isVertical) {
            // Check for walls blocking the view
            if (!this.hasWallBetween(this.position, player.position, mapManager)) {
                this.canSeePlayer = true;
                this.lastPlayerPosition = { ...player.position };
                return;
            }
        }

        this.canSeePlayer = false;
    }

    hasWallBetween(pos1, pos2, mapManager) {
        const steps = 20;
        const dx = (pos2.x - pos1.x) / steps;
        const dy = (pos2.y - pos1.y) / steps;

        for (let i = 1; i < steps; i++) {
            const checkPos = {
                x: pos1.x + dx * i,
                y: pos1.y + dy * i
            };
            if (mapManager.isWall(checkPos)) {
                return true;
            }
        }
        return false;
    }

    updateDirection(player, mapManager) {
        const possibleDirections = this.getPossibleDirections(mapManager);
        
        if (possibleDirections.length === 0) return;

        let targetDirection;

        if (this.mode === 'frightened') {
            // Flee from player
            targetDirection = this.getFleeDirection(player, possibleDirections);
        } else if (this.canSeePlayer || this.mode === 'chase') {
            // Chase player
            const target = this.canSeePlayer ? player.position : this.lastPlayerPosition;
            if (target) {
                targetDirection = this.getChaseDirection(target, possibleDirections);
            } else {
                targetDirection = this.getRandomDirection(possibleDirections);
            }
        } else {
            // Random movement
            targetDirection = this.getRandomDirection(possibleDirections);
        }

        if (targetDirection && possibleDirections.includes(targetDirection)) {
            this.previousDirection = this.direction;
            this.direction = targetDirection;
        }
    }

    getPossibleDirections(mapManager) {
        const directions = ['up', 'down', 'left', 'right'];
        const possible = [];

        for (const dir of directions) {
            // Don't allow 180-degree turns
            if (this.isOppositeDirection(dir, this.direction)) {
                continue;
            }

            if (this.canMoveInDirection(dir, mapManager)) {
                possible.push(dir);
            }
        }

        // If no directions possible except turning around, allow it
        if (possible.length === 0) {
            const opposite = this.getOppositeDirection(this.direction);
            if (this.canMoveInDirection(opposite, mapManager)) {
                possible.push(opposite);
            }
        }

        return possible;
    }

    canMoveInDirection(direction, mapManager) {
        const testPosition = { ...this.position };
        const testDistance = this.size;

        switch (direction) {
            case 'up':
                testPosition.y -= testDistance;
                break;
            case 'down':
                testPosition.y += testDistance;
                break;
            case 'left':
                testPosition.x -= testDistance;
                break;
            case 'right':
                testPosition.x += testDistance;
                break;
        }

        return !mapManager.isWall(testPosition);
    }

    getChaseDirection(targetPosition, possibleDirections) {
        let bestDirection = null;
        let bestDistance = Infinity;

        for (const direction of possibleDirections) {
            const testPos = this.getPositionInDirection(direction);
            const distance = this.getDistance(testPos, targetPosition);
            
            if (distance < bestDistance) {
                bestDistance = distance;
                bestDirection = direction;
            }
        }

        return bestDirection;
    }

    getFleeDirection(player, possibleDirections) {
        let bestDirection = null;
        let bestDistance = 0;

        for (const direction of possibleDirections) {
            const testPos = this.getPositionInDirection(direction);
            const distance = this.getDistance(testPos, player.position);
            
            if (distance > bestDistance) {
                bestDistance = distance;
                bestDirection = direction;
            }
        }

        return bestDirection;
    }

    getRandomDirection(possibleDirections) {
        return possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
    }

    getPositionInDirection(direction) {
        const testPos = { ...this.position };
        const moveDistance = this.size * 2;

        switch (direction) {
            case 'up':
                testPos.y -= moveDistance;
                break;
            case 'down':
                testPos.y += moveDistance;
                break;
            case 'left':
                testPos.x -= moveDistance;
                break;
            case 'right':
                testPos.x += moveDistance;
                break;
        }

        return testPos;
    }

    getDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    isOppositeDirection(dir1, dir2) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        return opposites[dir1] === dir2;
    }

    getOppositeDirection(direction) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        return opposites[direction];
    }

    move(deltaTime, mapManager) {
        let currentSpeed = this.speed;
        
        if (this.mode === 'frightened') {
            currentSpeed *= GAME_CONFIG.GHOSTS.FRIGHTENED_SPEED_MODIFIER;
        }

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

    activateFrightened() {
        if (this.mode !== 'eaten') {
            this.mode = 'frightened';
            this.frightenedTimer = GAME_CONFIG.GHOSTS.FRIGHTENED_DURATION;
            // Reverse direction when frightened
            this.direction = this.getOppositeDirection(this.direction);
        }
    }

    eat() {
        this.mode = 'eaten';
        this.resetPosition();
    }

    resetPosition() {
        this.position = { ...this.startPosition };
        this.direction = 'up';
        this.mode = 'scatter';
        this.frightenedTimer = 0;
        this.canSeePlayer = false;
        this.lastPlayerPosition = null;
    }

    render(ctx) {
        ctx.save();
        
        if (this.mode === 'frightened') {
            ctx.fillStyle = this.frightenedTimer > 1000 ? 
                GAME_CONFIG.COLORS.FRIGHTENED_GHOST : 
                GAME_CONFIG.COLORS.FRIGHTENED_GHOST_FLASH;
        } else {
            ctx.fillStyle = this.color;
        }

        // Draw ghost body (rounded rectangle)
        const radius = this.size / 2;
        ctx.beginPath();
        ctx.roundRect(
            this.position.x - radius,
            this.position.y - radius,
            this.size,
            this.size,
            radius
        );
        ctx.fill();

        // Draw eyes
        ctx.fillStyle = '#fff';
        const eyeSize = 3;
        const eyeOffset = 4;
        
        // Left eye
        ctx.beginPath();
        ctx.arc(
            this.position.x - eyeOffset,
            this.position.y - 3,
            eyeSize,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Right eye
        ctx.beginPath();
        ctx.arc(
            this.position.x + eyeOffset,
            this.position.y - 3,
            eyeSize,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Draw pupils
        if (this.mode !== 'frightened') {
            ctx.fillStyle = '#000';
            const pupilSize = 1;
            
            // Left pupil
            ctx.beginPath();
            ctx.arc(
                this.position.x - eyeOffset,
                this.position.y - 3,
                pupilSize,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // Right pupil
            ctx.beginPath();
            ctx.arc(
                this.position.x + eyeOffset,
                this.position.y - 3,
                pupilSize,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        ctx.restore();
    }

    checkPlayerCollision(playerPosition, playerSize) {
        const dx = Math.abs(this.position.x - playerPosition.x);
        const dy = Math.abs(this.position.y - playerPosition.y);
        const minDistance = (this.size + playerSize) / 2 - 2; // Small overlap tolerance

        return dx < minDistance && dy < minDistance;
    }
}

export class GhostManager {
    constructor(startPositions, mapManager) {
        this.ghosts = [
            new Ghost(startPositions[0], GAME_CONFIG.COLORS.GHOST_RED, 'blinky'),
            new Ghost(startPositions[1], GAME_CONFIG.COLORS.GHOST_PINK, 'pinky'),
            new Ghost(startPositions[2], GAME_CONFIG.COLORS.GHOST_CYAN, 'inky'),
            new Ghost(startPositions[3], GAME_CONFIG.COLORS.GHOST_ORANGE, 'clyde')
        ];
        this.mapManager = mapManager;
    }

    update(deltaTime, player) {
        for (const ghost of this.ghosts) {
            ghost.update(deltaTime, player, this.mapManager);
        }
    }

    activateFrightened() {
        for (const ghost of this.ghosts) {
            ghost.activateFrightened();
        }
    }

    checkPlayerCollision(playerPosition) {
        for (const ghost of this.ghosts) {
            if (ghost.checkPlayerCollision(playerPosition, GAME_CONFIG.PLAYER.SIZE)) {
                return {
                    ghost: ghost,
                    frightened: ghost.mode === 'frightened'
                };
            }
        }
        return null;
    }

    eatGhost(ghost) {
        ghost.eat();
    }

    resetPositions() {
        for (const ghost of this.ghosts) {
            ghost.resetPosition();
        }
    }

    render(ctx) {
        for (const ghost of this.ghosts) {
            ghost.render(ctx);
        }
    }
}