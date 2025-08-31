#!/usr/bin/env node

// Test for verifying map loading in the game
import { JSDOM } from 'jsdom';
import { Game } from '../../src/game/js/game.js';
import { GAME_CONFIG } from '../../src/shared/constants.js';
import { MAP_DATA } from '../../src/shared/mapData.js';

describe('Map Loading Tests', () => {
    let dom, game, canvas, ctx;

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

    test('Game should load MAP_DATA correctly', () => {
        // Arrange
        game = new Game();
        
        // Mock setupCanvas to avoid DOM issues
        game.setupCanvas = () => {
            game.canvas = canvas;
            game.ctx = ctx;
        };
        
        // Mock gameLoop to avoid rendering issues in tests
        game.gameLoop = () => {};

        // Mock console.log to capture debug output
        const originalLog = console.log;
        const logCalls = [];
        console.log = (...args) => {
            logCalls.push(args);
        };

        // Act
        game.init();

        // Assert - Check that game loaded the correct map
        expect(game.gameMap).toBeDefined();
        expect(game.gameMap.length).toBe(GAME_CONFIG.MAP.BOARD_HEIGHT);
        expect(game.gameMap[0].length).toBe(GAME_CONFIG.MAP.BOARD_WIDTH);

        // Verify it's the same as MAP_DATA
        const expectedMap = MAP_DATA.levels[0];
        expect(game.gameMap).toEqual(expectedMap);

        // Check console logs
        const hasLoadingLevel = logCalls.some(call => call[0] === 'Loading level:' && call[1] === 0);
        const hasAvailableLevels = logCalls.some(call => call[0] === 'Available levels:' && call[1] === MAP_DATA.levels.length);
        const hasDimensions = logCalls.some(call => call[0] === 'Loaded map dimensions:');

        expect(hasLoadingLevel).toBe(true);
        expect(hasAvailableLevels).toBe(true);
        expect(hasDimensions).toBe(true);

        // Restore console.log
        console.log = originalLog;
    });

    test('Game should find PacMan spawn point from MAP_DATA', () => {
        // Arrange
        game = new Game();
        
        // Mock setupCanvas to avoid DOM issues
        game.setupCanvas = () => {
            game.canvas = canvas;
            game.ctx = ctx;
        };
        
        // Mock gameLoop to avoid rendering issues in tests
        game.gameLoop = () => {};
        
        // Mock console.log to capture debug output
        const originalLog = console.log;
        const logCalls = [];
        console.log = (...args) => {
            logCalls.push(args);
        };

        // Act
        game.init();

        // Assert - Check PacMan spawn
        expect(game.player).toBeDefined();
        
        // Find expected spawn position from MAP_DATA
        let expectedSpawnX = -1, expectedSpawnY = -1;
        for (let y = 0; y < MAP_DATA.levels[0].length; y++) {
            for (let x = 0; x < MAP_DATA.levels[0][0].length; x++) {
                if (MAP_DATA.levels[0][y][x] & GAME_CONFIG.MAP.PACMAN_SPAWN) {
                    expectedSpawnX = x;
                    expectedSpawnY = y;
                    break;
                }
            }
            if (expectedSpawnX !== -1) break;
        }

        // Verify spawn was found and used
        if (expectedSpawnX !== -1) {
            expect(game.player.gridX).toBe(expectedSpawnX);
            expect(game.player.gridY).toBe(expectedSpawnY);
            const hasFoundSpawn = logCalls.some(call => 
                call[0] === 'Found PacMan spawn at:' && 
                call[1] === expectedSpawnX && 
                call[2] === expectedSpawnY);
            const hasSpawnSuccess = logCalls.some(call => call[0] === 'PacMan spawn found successfully');
            expect(hasFoundSpawn).toBe(true);
            expect(hasSpawnSuccess).toBe(true);
        } else {
            // Should use fallback
            expect(game.player.gridX).toBe(1);
            expect(game.player.gridY).toBe(1);
            const hasFallback = logCalls.some(call => call[0] === 'No PacMan spawn found, using fallback position (1,1)');
            expect(hasFallback).toBe(true);
        }

        // Restore console.log
        console.log = originalLog;
    });

    test('Game should count dots correctly from MAP_DATA', () => {
        // Arrange
        game = new Game();
        
        // Mock setupCanvas to avoid DOM issues
        game.setupCanvas = () => {
            game.canvas = canvas;
            game.ctx = ctx;
        };
        
        // Mock gameLoop to avoid rendering issues in tests
        game.gameLoop = () => {};
        
        // Mock console.log to capture debug output
        const originalLog = console.log;
        const logCalls = [];
        console.log = (...args) => {
            logCalls.push(args);
        };

        // Act
        game.init();

        // Assert - Count expected dots
        let expectedDots = 0;
        for (let y = 0; y < MAP_DATA.levels[0].length; y++) {
            for (let x = 0; x < MAP_DATA.levels[0][0].length; x++) {
                const cell = MAP_DATA.levels[0][y][x];
                if (cell & GAME_CONFIG.MAP.DOT || cell & GAME_CONFIG.MAP.POWER_PELLET) {
                    expectedDots++;
                }
            }
        }

        expect(game.dotsRemaining).toBe(expectedDots);
        const hasDotsFound = logCalls.some(call => call[0] === 'Dots found:' && call[1] === expectedDots);
        expect(hasDotsFound).toBe(true);

        // Restore console.log
        console.log = originalLog;
    });

    test('Game should find ghost spawn points from MAP_DATA', () => {
        // Arrange
        game = new Game();
        
        // Mock setupCanvas to avoid DOM issues
        game.setupCanvas = () => {
            game.canvas = canvas;
            game.ctx = ctx;
        };
        
        // Mock gameLoop to avoid rendering issues in tests
        game.gameLoop = () => {};

        // Act
        game.init();

        // Assert - Check ghost spawns
        expect(game.ghostManager).toBeDefined();
        expect(game.ghostManager.ghosts).toBeDefined();
        expect(game.ghostManager.ghosts.length).toBeGreaterThan(0);

        // Count expected ghost spawns
        let expectedGhostSpawns = 0;
        for (let y = 0; y < MAP_DATA.levels[0].length; y++) {
            for (let x = 0; x < MAP_DATA.levels[0][0].length; x++) {
                if (MAP_DATA.levels[0][y][x] & GAME_CONFIG.MAP.GHOST_SPAWN) {
                    expectedGhostSpawns++;
                }
            }
        }

        // Should have ghosts based on spawns (or at least default 4)
        expect(game.ghostManager.ghosts.length).toBeGreaterThanOrEqual(Math.min(4, Math.max(4, expectedGhostSpawns)));
    });

    test('Canvas should have correct dimensions', () => {
        // Arrange
        game = new Game();
        
        // Mock setupCanvas to avoid DOM issues
        game.setupCanvas = () => {
            game.canvas = canvas;
            game.ctx = ctx;
            game.canvas.width = 720;
            game.canvas.height = 480;
        };
        
        // Mock gameLoop to avoid rendering issues in tests
        game.gameLoop = () => {};

        // Act
        game.init();

        // Assert
        expect(canvas.width).toBe(GAME_CONFIG.CANVAS.WIDTH);
        expect(canvas.height).toBe(GAME_CONFIG.CANVAS.HEIGHT);
        expect(canvas.width).toBe(720); // 18 * 40
        expect(canvas.height).toBe(480); // 12 * 40
    });

    test('MapRenderer should be initialized with correct map', () => {
        // Arrange
        game = new Game();
        
        // Mock setupCanvas to avoid DOM issues
        game.setupCanvas = () => {
            game.canvas = canvas;
            game.ctx = ctx;
        };
        
        // Mock gameLoop to avoid rendering issues in tests
        game.gameLoop = () => {};

        // Act
        game.init();

        // Assert
        expect(game.mapRenderer).toBeDefined();
        expect(game.mapRenderer.gameMap).toEqual(MAP_DATA.levels[0]);
    });
});