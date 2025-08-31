#!/usr/bin/env node

/**
 * Debug script pro testování player movement bez browseru
 * Spuštění: node test-player-debug.js
 */

import { createRequire } from 'module';
import { JSDOM } from 'jsdom';

// Setup JSDOM environment
const dom = new JSDOM(`<!DOCTYPE html><canvas id="gameCanvas"></canvas>`, {
    pretendToBeVisual: true,
    resources: "usable"
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
global.CanvasRenderingContext2D = dom.window.CanvasRenderingContext2D;
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.performance = { now: () => Date.now() };

// Mock window functions that game.js expects
global.window.restartGame = () => {};
global.window.nextLevel = () => {};

// Mock canvas context methods
const mockContext = {
    fillRect: () => {},
    strokeRect: () => {},
    fillText: () => {},
    measureText: () => ({ width: 100 }),
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    beginPath: () => {},
    arc: () => {},
    lineTo: () => {},
    closePath: () => {},
    fill: () => {},
    stroke: () => {},
    clearRect: () => {},
    drawImage: () => {},
    setLineDash: () => {}
};

// Override getContext to return mock
HTMLCanvasElement.prototype.getContext = function() {
    return mockContext;
};

// Import game modules
import { Game } from './src/game/js/game.js';
import { Player } from './src/game/js/player.js';
import { GAME_CONFIG } from './src/shared/constants.js';

console.log('🎮 PacMan Player Movement Debug Test');
console.log('=====================================\n');

// Test utility functions
function createTestPlayer(x, y) {
    const player = new Player(x, y);
    return player;
}

function simulateMovement(player, direction, steps, hasWallFn) {
    const positions = [];
    let overshootDetected = false;
    let jumpBackDetected = false;
    let maxDistanceFromCenter = 0;
    
    player.setNextDirection(direction);
    
    for (let i = 0; i < steps; i++) {
        const beforePos = { x: player.x, y: player.y };
        
        player.update(null, hasWallFn);
        
        const afterPos = { x: player.x, y: player.y };
        
        // Calculate distance from cell center
        const centerX = player.gridX * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
        const centerY = player.gridY * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
        const distanceFromCenter = Math.abs(player.x - centerX) + Math.abs(player.y - centerY);
        
        // Track max distance
        maxDistanceFromCenter = Math.max(maxDistanceFromCenter, distanceFromCenter);
        
        // Detect overshoot
        if (distanceFromCenter > GAME_CONFIG.MAP.CELL_SIZE / 2) {
            overshootDetected = true;
        }
        
        // Detect jump back
        const jumpDistance = Math.abs(beforePos.x - afterPos.x) + Math.abs(beforePos.y - afterPos.y);
        if (jumpDistance > GAME_CONFIG.PLAYER.BASE_SPEED * 2) {
            jumpBackDetected = true;
        }
        
        positions.push({
            step: i,
            before: beforePos,
            after: afterPos,
            direction: player.direction,
            gridPos: { x: player.gridX, y: player.gridY },
            distanceFromCenter: distanceFromCenter.toFixed(1),
            jumpDistance: jumpDistance.toFixed(1)
        });
        
        // Stop if player stops moving
        if (!player.direction && i > 5) break;
    }
    
    return {
        positions,
        overshootDetected,
        jumpBackDetected,
        maxDistanceFromCenter: maxDistanceFromCenter.toFixed(1),
        finalPos: { x: player.x.toFixed(1), y: player.y.toFixed(1) },
        finalGridPos: { x: player.gridX, y: player.gridY }
    };
}

// Test scenarios
console.log('📝 Testing Wall Collision Scenarios\n');

// Scenario 1: Right wall collision
console.log('1️⃣  RIGHT WALL TEST');
console.log('   Starting at (1,5), moving RIGHT towards wall at (2,5)');

const player1 = createTestPlayer(1, 5);
const mockHasWallRight = (x, y, direction) => {
    return direction === 'RIGHT' && x === 2 && y === 5;
};

const result1 = simulateMovement(player1, 'RIGHT', 50, mockHasWallRight);
console.log(`   Result: Final pos ${result1.finalPos.x}, ${result1.finalPos.y}`);
console.log(`   Grid pos: (${result1.finalGridPos.x}, ${result1.finalGridPos.y})`);
console.log(`   Max distance from center: ${result1.maxDistanceFromCenter}px`);
console.log(`   Overshoot detected: ${result1.overshootDetected ? '❌ YES' : '✅ NO'}`);
console.log(`   Jump back detected: ${result1.jumpBackDetected ? '❌ YES' : '✅ NO'}`);

if (result1.overshootDetected || result1.jumpBackDetected) {
    console.log('   🔍 Problem positions:');
    result1.positions
        .filter(p => parseFloat(p.distanceFromCenter) > 20 || parseFloat(p.jumpDistance) > 4)
        .slice(-5)
        .forEach(p => {
            console.log(`      Step ${p.step}: pos(${p.after.x.toFixed(1)}, ${p.after.y.toFixed(1)}) distance:${p.distanceFromCenter} jump:${p.jumpDistance}`);
        });
}

console.log('');

// Scenario 2: Left wall collision
console.log('2️⃣  LEFT WALL TEST');
console.log('   Starting at (3,6), moving LEFT towards wall at (2,6)');

const player2 = createTestPlayer(3, 6);
const mockHasWallLeft = (x, y, direction) => {
    return direction === 'LEFT' && x === 2 && y === 6;
};

const result2 = simulateMovement(player2, 'LEFT', 50, mockHasWallLeft);
console.log(`   Result: Final pos ${result2.finalPos.x}, ${result2.finalPos.y}`);
console.log(`   Grid pos: (${result2.finalGridPos.x}, ${result2.finalGridPos.y})`);
console.log(`   Max distance from center: ${result2.maxDistanceFromCenter}px`);
console.log(`   Overshoot detected: ${result2.overshootDetected ? '❌ YES' : '✅ NO'}`);
console.log(`   Jump back detected: ${result2.jumpBackDetected ? '❌ YES' : '✅ NO'}`);

console.log('');

// Scenario 3: Test with real game instance
console.log('3️⃣  REAL GAME TEST');
console.log('   Testing with actual Game instance and real hasWall function');

try {
    const game = new Game();
    game.setupCanvas = () => {
        game.canvas = document.getElementById('gameCanvas');
        game.ctx = mockContext;
    };
    game.gameLoop = () => {}; // Disable game loop
    
    game.init();
    
    // Position player manually
    game.player.x = 60;
    game.player.y = 220;
    game.player.gridX = 1;
    game.player.gridY = 5;
    
    console.log(`   Starting position: pixel(${game.player.x}, ${game.player.y}) grid(${game.player.gridX}, ${game.player.gridY})`);
    
    // Check wall detection
    const wallRight = game.hasWall(1, 5, 'RIGHT');
    const wallDown = game.hasWall(1, 5, 'DOWN');
    console.log(`   Wall RIGHT from (1,5): ${wallRight ? '🧱 YES' : '✅ NO'}`);
    console.log(`   Wall DOWN from (1,5): ${wallDown ? '🧱 YES' : '✅ NO'}`);
    
    // Test movement
    game.player.setNextDirection('RIGHT');
    const realResult = simulateMovement(game.player, 'RIGHT', 50, game.hasWall.bind(game));
    
    console.log(`   Real game result: Final pos ${realResult.finalPos.x}, ${realResult.finalPos.y}`);
    console.log(`   Max distance from center: ${realResult.maxDistanceFromCenter}px`);
    console.log(`   Overshoot detected: ${realResult.overshootDetected ? '❌ YES' : '✅ NO'}`);
    console.log(`   Jump back detected: ${realResult.jumpBackDetected ? '❌ YES' : '✅ NO'}`);
    
} catch (error) {
    console.log(`   ❌ Error testing with real game: ${error.message}`);
}

console.log('\n=====================================');

// Analysis and recommendations
console.log('📊 ANALYSIS & RECOMMENDATIONS');
console.log('');

const allResults = [result1, result2];
const problemsFound = allResults.filter(r => r.overshootDetected || r.jumpBackDetected);

if (problemsFound.length > 0) {
    console.log('❌ PROBLEMS DETECTED:');
    console.log('   - Wall collision logic still has overshoot/jump-back issues');
    console.log('   - Recommended actions:');
    console.log('     1. Run debug HTML page in browser for visual inspection');
    console.log('     2. Add detailed logging to Player.update() method');
    console.log('     3. Test with real map data and hasWall function');
    console.log('     4. Check timing issues with requestAnimationFrame');
    console.log('');
    console.log('💡 Debug commands to try:');
    console.log('   - Open debug-player-movement.html in browser');
    console.log('   - Use test buttons to reproduce specific scenarios');
    console.log('   - Watch real-time position and collision data');
} else {
    console.log('✅ NO PROBLEMS DETECTED in basic tests');
    console.log('   - Mock tests pass, but real game might still have issues');
    console.log('   - Recommended: Test with actual game in browser');
}

console.log('\n🔧 Next steps:');
console.log('   1. npm run dev (start local server)');
console.log('   2. Open http://localhost:8080/debug-player-movement.html');  
console.log('   3. Use WASD keys to move player');
console.log('   4. Watch debug panel for overshoot/jump-back detection');
console.log('   5. Use test buttons to reproduce specific collision scenarios');