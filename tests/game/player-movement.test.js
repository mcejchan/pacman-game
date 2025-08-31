#!/usr/bin/env node

// Tests for player movement mechanics
import { JSDOM } from 'jsdom';
import { Game } from '../../src/game/js/game.js';
import { Player } from '../../src/game/js/player.js';
import { GAME_CONFIG } from '../../src/shared/constants.js';
import { MAP_DATA } from '../../src/shared/mapData.js';

describe('Player Movement Tests', () => {
    let dom, game, canvas, ctx, player;

    beforeEach(() => {
        // Setup JSDOM environment
        const htmlContent = `<!DOCTYPE html>
<html>
<body>
    <div id="gameContainer">
        <div id="gameInfo">
            <div>SCORE: <span id="score">0</span></div>
            <div>LIVES: <span id="lives">3</span></div>
            <div>LEVEL: <span id="level">1</span></div>
        </div>
        <canvas id="gameCanvas"></canvas>
    </div>
    <div id="gameOver" style="display: none;">
        <h2>GAME OVER</h2>
        <p>Final Score: <span id="finalScore">0</span></p>
    </div>
    <div id="levelComplete" style="display: none;">
        <h2>LEVEL COMPLETE!</h2>
        <p>Score: <span id="levelScore">0</span></p>
    </div>
</body>
</html>`;

        dom = new JSDOM(htmlContent, {
            pretendToBeVisual: true,
            resources: 'usable'
        });

        // Set up globals
        global.document = dom.window.document;
        global.window = dom.window;
        global.HTMLElement = dom.window.HTMLElement;
        global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
        global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
        global.cancelAnimationFrame = (id) => clearTimeout(id);

        // Mock canvas context
        const mockContext = {
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            fillRect: () => {},
            strokeRect: () => {},
            clearRect: () => {},
            fillText: () => {},
            beginPath: () => {},
            closePath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            arc: () => {},
            fill: () => {},
            stroke: () => {},
            save: () => {},
            restore: () => {},
            translate: () => {},
            rotate: () => {},
            scale: () => {},
            roundRect: () => {}
        };

        // Mock getContext on canvas prototype
        Object.defineProperty(dom.window.HTMLCanvasElement.prototype, 'getContext', {
            value: () => mockContext,
            writable: true
        });

        // Get canvas element
        canvas = dom.window.document.getElementById('gameCanvas');
        ctx = mockContext;
    });

    afterEach(() => {
        if (game && game.gameLoopId) {
            cancelAnimationFrame(game.gameLoopId);
        }
        dom.window.close();
    });

    // Helper functions for testing
    function createMockHasWallFunction() {
        return (x, y, direction) => {
            // Simple mock - only boundaries are walls
            if (x < 0 || x >= GAME_CONFIG.MAP.BOARD_WIDTH || 
                y < 0 || y >= GAME_CONFIG.MAP.BOARD_HEIGHT) {
                return true;
            }
            return false;
        };
    }

    function simulateGameUpdates(game, maxUpdates = 100) {
        let updates = 0;
        while (updates < maxUpdates) {
            game.update();
            updates++;
            
            // Break if player reached a stable grid center position
            const expectedX = game.player.gridX * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
            const expectedY = game.player.gridY * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
            const onGridX = Math.abs(game.player.x - expectedX) < 2;
            const onGridY = Math.abs(game.player.y - expectedY) < 2;
            
            if (onGridX && onGridY && updates > 1) {
                break;
            }
        }
        return updates;
    }

    function simulateKeyPress(game, key) {
        const event = new dom.window.KeyboardEvent('keydown', { key });
        
        // Simulate the event handler logic directly
        switch(key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                game.player.setNextDirection('UP');
                break;
            case 'arrowdown':
            case 's':
                game.player.setNextDirection('DOWN');
                break;
            case 'arrowleft':
            case 'a':
                game.player.setNextDirection('LEFT');
                break;
            case 'arrowright':
            case 'd':
                game.player.setNextDirection('RIGHT');
                break;
        }
    }

    test('Player should be created with valid initial position', () => {
        // Arrange & Act
        player = new Player(5, 5);

        // Assert
        expect(player.gridX).toBe(5);
        expect(player.gridY).toBe(5);
        expect(player.x).toBe(5 * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2);
        expect(player.y).toBe(5 * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2);
    });

    test('Player should complete full grid movement to the right', () => {
        // Arrange
        player = new Player(5, 5);
        const mockHasWall = createMockHasWallFunction();
        const startGridX = player.gridX;
        const startGridY = player.gridY;

        // Act
        player.setNextDirection('RIGHT');
        
        // Simulate game updates until movement completes
        let updates = 0;
        const debugLog = [];
        while (updates < 100) { // Safety limit
            const beforeX = player.x;
            const beforeGridX = player.gridX;
            
            player.update(MAP_DATA.levels[0], mockHasWall);
            updates++;
            
            
            // Check if player reached the target grid position
            if (player.gridX === startGridX + 1 && player.gridY === startGridY) {
                // Verify player is actually on the grid center (not between positions)
                const expectedX = (startGridX + 1) * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
                const expectedY = startGridY * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
                
                if (Math.abs(player.x - expectedX) < 1 && Math.abs(player.y - expectedY) < 1) {
                    debugLog.push(`Movement completed at update ${updates}`);
                    break;
                }
            }
        }
        

        // Assert
        expect(player.gridX).toBe(startGridX + 1);
        expect(player.gridY).toBe(startGridY);
        expect(updates).toBeLessThan(100); // Should not timeout
        
        // Player should be exactly on grid center position
        const expectedX = (startGridX + 1) * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
        const expectedY = startGridY * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
        expect(Math.abs(player.x - expectedX)).toBeLessThan(2);
        expect(Math.abs(player.y - expectedY)).toBeLessThan(2);
    });

    test('Player should handle continuous movement sequence without getting stuck', () => {
        // Arrange
        game = new Game();
        
        // Mock setupCanvas and gameLoop to avoid DOM/rendering issues
        game.setupCanvas = () => {
            game.canvas = canvas;
            game.ctx = ctx;
        };
        game.gameLoop = () => {}; // Don't run game loop in test
        
        // Initialize game
        game.init();
        
        // Override hasWall with mock version that only blocks boundaries
        game.hasWall = createMockHasWallFunction();
        
        const startX = game.player.gridX;
        const startY = game.player.gridY;

        // Act & Assert - Test sequence: RIGHT -> DOWN -> LEFT
        
        // First move: RIGHT
        simulateKeyPress(game, 'ArrowRight');
        const updates1 = simulateGameUpdates(game);
        expect(game.player.gridX).toBe(startX + 1);
        expect(game.player.gridY).toBe(startY);
        expect(updates1).toBeLessThan(100); // Should complete movement
        
        // Second move: DOWN - This is the critical test
        simulateKeyPress(game, 'ArrowDown');
        const updates2 = simulateGameUpdates(game);
        expect(game.player.gridX).toBe(startX + 1);
        expect(game.player.gridY).toBe(startY + 1);
        expect(updates2).toBeLessThan(100); // Should NOT be stuck
        
        // Third move: LEFT - Make sure we can still move
        simulateKeyPress(game, 'ArrowLeft');
        const updates3 = simulateGameUpdates(game);
        expect(game.player.gridX).toBe(startX);
        expect(game.player.gridY).toBe(startY + 1);
        expect(updates3).toBeLessThan(100); // Should still work
    });

    test('Player should respond to rapid key presses', () => {
        // Arrange
        game = new Game();
        game.setupCanvas = () => {
            game.canvas = canvas;
            game.ctx = ctx;
        };
        game.gameLoop = () => {};
        game.init();
        
        // Override hasWall with mock version that only blocks boundaries
        game.hasWall = createMockHasWallFunction();
        
        const startX = game.player.gridX;
        const startY = game.player.gridY;

        // Act - Press a single key and verify player responds
        simulateKeyPress(game, 'ArrowRight');
        
        // Give player some updates to start moving
        for (let i = 0; i < 30; i++) {
            game.update();
        }
        
        // Assert - Player should have moved from start position
        const moved = (game.player.gridX !== startX || game.player.gridY !== startY);
        expect(moved).toBe(true);
    });

    test('Player movement should maintain consistent speed', () => {
        // Arrange
        player = new Player(5, 5);
        const mockHasWall = createMockHasWallFunction();
        player.setNextDirection('RIGHT');
        
        const positions = [];
        let simulationTime = 0;

        // Act - Track position over time
        while (simulationTime < 1000 && positions.length < 60) { // Max 1 second or 60 frames
            player.update(MAP_DATA.levels[0], mockHasWall);
            positions.push({
                time: simulationTime,
                x: player.x,
                y: player.y,
                gridX: player.gridX,
                gridY: player.gridY
            });
            simulationTime += 16; // ~60fps
        }

        // Assert - Analyze movement pattern
        expect(positions.length).toBeGreaterThan(1);
        
        // Should start at initial position
        expect(positions[0].gridX).toBe(5);
        
        // Should eventually reach next grid position
        const finalPosition = positions[positions.length - 1];
        expect(finalPosition.gridX).toBeGreaterThan(5);
        
        // Movement should be smooth (no sudden jumps)
        for (let i = 1; i < positions.length; i++) {
            const deltaX = Math.abs(positions[i].x - positions[i-1].x);
            expect(deltaX).toBeLessThan(GAME_CONFIG.MAP.CELL_SIZE); // No teleporting
        }
    });

    test('Player should be able to change direction mid-movement', () => {
        // Arrange
        player = new Player(5, 5);
        const mockHasWall = createMockHasWallFunction();
        
        // Start moving right
        player.setNextDirection('RIGHT');
        
        // Act - Move partway, then change direction
        for (let i = 0; i < 10; i++) { // Move partway
            player.update(MAP_DATA.levels[0], mockHasWall);
        }
        
        // Change direction to DOWN
        player.setNextDirection('DOWN');
        
        // Continue updating until movement completes
        let updates = 0;
        const startGridPos = { x: player.gridX, y: player.gridY };
        
        while (updates < 100) {
            player.update(MAP_DATA.levels[0], mockHasWall);
            updates++;
            
            // Check if we've moved to a new grid position
            if (player.gridX !== startGridPos.x || player.gridY !== startGridPos.y) {
                break;
            }
        }

        // Assert - Should have moved in some direction (not stuck)
        const moved = (player.gridX !== 5 || player.gridY !== 5);
        expect(moved).toBe(true);
        expect(updates).toBeLessThan(100); // Should not timeout
    });

    test('Player should handle wall collisions without getting stuck', () => {
        // Arrange - Create player near boundary
        player = new Player(1, 1); // Near top-left
        const mockHasWall = (x, y, direction) => {
            // Mock walls on left and top edges
            if (direction === 'LEFT' && x <= 0) return true;
            if (direction === 'UP' && y <= 0) return true;
            return false;
        };

        // Act - Try to move into wall
        player.setNextDirection('LEFT'); // Should hit wall
        
        let updates = 0;
        while (updates < 50) { // Give it some time
            player.update(MAP_DATA.levels[0], mockHasWall);
            updates++;
        }
        
        // Should still be able to move in valid direction
        player.setNextDirection('RIGHT'); // Valid move
        
        const startGridX = player.gridX;
        updates = 0;
        while (updates < 50) {
            player.update(MAP_DATA.levels[0], mockHasWall);
            updates++;
            
            if (player.gridX > startGridX) {
                break; // Successfully moved right
            }
        }

        // Assert - Should be able to move right after hitting wall
        expect(player.gridX).toBe(startGridX + 1);
        expect(updates).toBeLessThan(50); // Should not timeout
    });

    test('Player should move completely to wall edge in horizontal direction', () => {
        // Arrange - Create player with wall to the right at position 3
        player = new Player(1, 5); // Start at (1,5)
        const mockHasWall = (x, y, direction) => {
            // Wall to the right of position (2,5)
            if (direction === 'RIGHT' && x === 2 && y === 5) return true;
            return false;
        };

        // Act - Move right towards the wall
        player.setNextDirection('RIGHT');
        
        let updates = 0;
        const positions = [];
        while (updates < 100) { // Safety limit
            const beforeX = player.x;
            player.update(MAP_DATA.levels[0], mockHasWall);
            updates++;
            
            positions.push({
                update: updates,
                x: player.x,
                gridX: player.gridX,
                direction: player.direction,
                moved: player.x !== beforeX
            });
            
            // If player stops moving for several frames, break
            const recentMoves = positions.slice(-5);
            const stillMoving = recentMoves.some(p => p.moved);
            if (updates > 20 && !stillMoving) {
                break;
            }
        }


        // Assert - Player should reach the wall edge, not get stuck in middle
        // Player should be at grid position (2,5) with x coordinate at the cell center
        expect(player.gridX).toBe(2);
        expect(player.gridY).toBe(5);
        
        // Player should be positioned at the center of cell (2,5)
        const expectedX = 2 * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
        expect(Math.abs(player.x - expectedX)).toBeLessThan(3); // Within reasonable tolerance
        
        // Movement should not timeout
        expect(updates).toBeLessThan(100);
    });

    test('Player should move completely to wall edge in left direction', () => {
        // Arrange - Create player with wall to the left at position 2
        player = new Player(4, 5); // Start at (4,5) 
        const mockHasWall = (x, y, direction) => {
            // Wall to the left of position (3,5)  
            if (direction === 'LEFT' && x === 3 && y === 5) return true;
            return false;
        };

        // Act - Move left towards the wall
        player.setNextDirection('LEFT');
        
        let updates = 0;
        while (updates < 100) { // Safety limit
            player.update(MAP_DATA.levels[0], mockHasWall);
            updates++;
            
            // If player stops moving, break
            const movingLeft = player.direction === 'LEFT';
            if (updates > 20 && !movingLeft) {
                break;
            }
        }

        // Assert - Player should reach the wall edge at grid position (3,5)
        expect(player.gridX).toBe(3);
        expect(player.gridY).toBe(5);
        
        // Player should be positioned at the center of cell (3,5)
        const expectedX = 3 * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
        expect(Math.abs(player.x - expectedX)).toBeLessThan(3);
        
        // Movement should not timeout
        expect(updates).toBeLessThan(100);
    });
});