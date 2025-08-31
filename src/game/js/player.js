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
        // Visual debug directly in HTML instead of console
        const debugEl = document.getElementById('debugConsoleReplace') || (() => {
            const el = document.createElement('div');
            el.id = 'debugConsoleReplace';
            el.style.cssText = 'position:fixed;bottom:10px;left:10px;background:rgba(255,0,0,0.9);color:white;padding:5px;font-size:10px;max-height:100px;overflow-y:auto;width:300px;z-index:2000;';
            document.body.appendChild(el);
            return el;
        })();
        
        debugEl.innerHTML = `🚀 UPDATE: x=${this.x.toFixed(1)}, dir=${this.direction}, time=${new Date().toLocaleTimeString()}` + '<br>' + (debugEl.innerHTML || '');
        
        console.log(`🚀 PLAYER UPDATE CALLED! x=${this.x.toFixed(1)}, direction=${this.direction}`);
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
        console.log(`🟢 MOVEMENT: direction=${this.direction}, x=${this.x.toFixed(1)}`);
        if (this.direction) {
            const dir = GAME_CONFIG.DIRECTIONS[this.direction];
            const newX = this.x + dir.x * this.speed;
            const newY = this.y + dir.y * this.speed;
            console.log(`🟢 CALCULATED: newX=${newX.toFixed(1)}, newY=${newY.toFixed(1)}, dir=${JSON.stringify(dir)}`);
            
            // Calculate which grid cell we would move into
            const targetGridX = Math.round((newX - GAME_CONFIG.MAP.CELL_SIZE / 2) / GAME_CONFIG.MAP.CELL_SIZE);
            const targetGridY = Math.round((newY - GAME_CONFIG.MAP.CELL_SIZE / 2) / GAME_CONFIG.MAP.CELL_SIZE);
            
            
            // Check if we would hit a wall by moving to new position
            let canMove = true;
            
            // Check for wall collision when leaving current cell edge
            const centerX = currentGridX * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
            const centerY = currentGridY * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
            const halfCell = GAME_CONFIG.MAP.CELL_SIZE / 2;
            
            // Calculate cell boundaries 
            const rightEdge = centerX + halfCell;   // e.g. x=120 for cell center x=100
            const leftEdge = centerX - halfCell;    // e.g. x=80 for cell center x=100  
            const bottomEdge = centerY + halfCell;  // e.g. y=240 for cell center y=220
            const topEdge = centerY - halfCell;     // e.g. y=200 for cell center y=220
            
            // Check collision BEFORE hitting the edge - when approaching within one step
            console.log(`🟡 COLLISION CHECK: direction=${this.direction}, leftEdge=${leftEdge}, rightEdge=${rightEdge}, newX=${newX.toFixed(1)}, newY=${newY.toFixed(1)}`);
            if (this.direction === 'RIGHT' && newX > rightEdge - this.speed) {
                console.log(`🔴 WALL CHECK: Approaching RIGHT edge! currentX=${this.x.toFixed(1)} newX=${newX.toFixed(1)}, rightEdge=${rightEdge}, grid=(${currentGridX},${currentGridY})`);
                // Will hit or cross right edge - check for right wall
                canMove = !hasWallFn(currentGridX, currentGridY, 'RIGHT');
                console.log(`🔴 hasWall result: ${hasWallFn(currentGridX, currentGridY, 'RIGHT')}, canMove=${canMove}`);
            } else if (this.direction === 'LEFT' && newX < leftEdge + this.speed) {
                console.log(`🔴 WALL CHECK: Approaching LEFT edge! currentX=${this.x.toFixed(1)} newX=${newX.toFixed(1)}, leftEdge=${leftEdge}, grid=(${currentGridX},${currentGridY})`);
                // Will hit or cross left edge - check for left wall  
                canMove = !hasWallFn(currentGridX, currentGridY, 'LEFT');
                console.log(`🔴 hasWall result: ${hasWallFn(currentGridX, currentGridY, 'LEFT')}, canMove=${canMove}`);
            } else if (this.direction === 'DOWN' && newY > bottomEdge - this.speed) {
                console.log(`🔴 WALL CHECK: Approaching DOWN edge! currentY=${this.y.toFixed(1)} newY=${newY.toFixed(1)}, bottomEdge=${bottomEdge}, grid=(${currentGridX},${currentGridY})`);
                // Will hit or cross bottom edge - check for bottom wall
                canMove = !hasWallFn(currentGridX, currentGridY, 'DOWN');
                console.log(`🔴 hasWall result: ${hasWallFn(currentGridX, currentGridY, 'DOWN')}, canMove=${canMove}`);
            } else if (this.direction === 'UP' && newY < topEdge + this.speed) {
                console.log(`🔴 WALL CHECK: Approaching UP edge! currentY=${this.y.toFixed(1)} newY=${newY.toFixed(1)}, topEdge=${topEdge}, grid=(${currentGridX},${currentGridY})`);
                // Will hit or cross top edge - check for top wall
                canMove = !hasWallFn(currentGridX, currentGridY, 'UP');
                console.log(`🔴 hasWall result: ${hasWallFn(currentGridX, currentGridY, 'UP')}, canMove=${canMove}`);
            }
            
            if (!canMove) {
                console.log(`🛑 WALL COLLISION DETECTED! Stopping player at edge`);
                // Stop precisely at the edge where collision was detected
                if (this.direction === 'RIGHT') {
                    console.log(`🛑 Stopping RIGHT: x=${this.x.toFixed(1)} -> ${rightEdge - 1}`);
                    this.x = rightEdge - 1; // Stop just before right edge (e.g. x=119)
                } else if (this.direction === 'LEFT') {
                    console.log(`🛑 Stopping LEFT: x=${this.x.toFixed(1)} -> ${leftEdge + 1}`);
                    this.x = leftEdge + 1; // Stop just after left edge (e.g. x=81)
                } else if (this.direction === 'DOWN') {
                    console.log(`🛑 Stopping DOWN: y=${this.y.toFixed(1)} -> ${bottomEdge - 1}`);
                    this.y = bottomEdge - 1; // Stop just before bottom edge
                } else if (this.direction === 'UP') {
                    console.log(`🛑 Stopping UP: y=${this.y.toFixed(1)} -> ${topEdge + 1}`);
                    this.y = topEdge + 1; // Stop just after top edge
                }
                
                // Keep current grid position and stop movement
                this.gridX = currentGridX;
                this.gridY = currentGridY;
                this.direction = null;
                console.log(`🛑 Player stopped at (${this.x.toFixed(1)}, ${this.y.toFixed(1)}), grid=(${this.gridX},${this.gridY})`);
                
                // Update debug panel with collision info
                const collisionEl = document.getElementById('debugLastCollision');
                if (collisionEl) {
                    const timestamp = new Date().toLocaleTimeString();
                    collisionEl.textContent = `Last collision: ${this.direction} at ${timestamp} - stopped at (${this.x.toFixed(1)}, ${this.y.toFixed(1)})`;
                }
                
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
        
        // Update debug panel if it exists
        this.updateDebugPanel(currentGridX, currentGridY, hasWallFn);
    }
    
    updateDebugPanel(gridX, gridY, hasWallFn) {
        if (typeof document === 'undefined') return; // Skip in tests
        
        const posEl = document.getElementById('debugPosition');
        const gridEl = document.getElementById('debugGrid');
        const dirEl = document.getElementById('debugDirection');
        const wallsEl = document.getElementById('debugWalls');
        const distanceEl = document.getElementById('debugDistance');
        const edgesEl = document.getElementById('debugEdges');
        
        if (!posEl) return; // Debug panel not present
        
        // Calculate debug info
        const centerX = gridX * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
        const centerY = gridY * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
        const halfCell = GAME_CONFIG.MAP.CELL_SIZE / 2;
        
        const rightEdge = centerX + halfCell;
        const leftEdge = centerX - halfCell;
        const bottomEdge = centerY + halfCell;
        const topEdge = centerY - halfCell;
        
        const distanceX = (this.x - centerX).toFixed(1);
        const distanceY = (this.y - centerY).toFixed(1);
        
        // Check walls
        const wallUp = hasWallFn ? hasWallFn(gridX, gridY, 'UP') : '?';
        const wallDown = hasWallFn ? hasWallFn(gridX, gridY, 'DOWN') : '?';  
        const wallLeft = hasWallFn ? hasWallFn(gridX, gridY, 'LEFT') : '?';
        const wallRight = hasWallFn ? hasWallFn(gridX, gridY, 'RIGHT') : '?';
        
        // Update display
        posEl.textContent = `Position: x=${this.x.toFixed(1)}, y=${this.y.toFixed(1)}`;
        gridEl.textContent = `Grid: (${gridX}, ${gridY})`;
        dirEl.textContent = `Direction: ${this.direction || 'none'} | Next: ${this.nextDirection || 'none'} | Speed: ${this.speed}`;
        wallsEl.textContent = `Walls: U=${wallUp} D=${wallDown} L=${wallLeft} R=${wallRight}`;
        distanceEl.textContent = `Distance from center: x=${distanceX}, y=${distanceY}`;
        edgesEl.textContent = `Edges: L=${leftEdge} R=${rightEdge} T=${topEdge} B=${bottomEdge}`;
        
        // Add more debug info to help diagnose
        const lastCondition = document.getElementById('debugLastCondition') || (() => {
            const el = document.createElement('div');
            el.id = 'debugLastCondition';
            el.style.color = '#ff9999';
            document.getElementById('debugPanel').appendChild(el);
            return el;
        })();
        
        if (this.direction === 'LEFT') {
            const newX = this.x - this.speed;
            const willTrigger = newX < leftEdge + this.speed;
            lastCondition.textContent = `LEFT check: currentX=${this.x.toFixed(1)} newX=${newX.toFixed(1)} < leftEdge+speed=${leftEdge + this.speed} = ${willTrigger}`;
        }
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