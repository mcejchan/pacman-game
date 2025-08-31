#!/usr/bin/env node

/**
 * Simple debug test pro Player třídu bez browser dependencies
 * Spuštění: node test-player-simple.js
 */

import { JSDOM } from 'jsdom';

// Setup minimal JSDOM environment  
const dom = new JSDOM(`<!DOCTYPE html><div></div>`);
global.window = dom.window;
global.document = dom.window.document;

// Import modules
import { Player } from './src/game/js/player.js';
import { GAME_CONFIG } from './src/shared/constants.js';

console.log('🎮 PacMan Player Movement Simple Debug');
console.log('======================================\n');

// Test utility
function simulateCollisionTest(player, direction, steps, hasWallFn) {
    const positions = [];
    let overshootDetected = false;
    let jumpBackDetected = false;
    let maxDistanceFromCenter = 0;
    
    player.setNextDirection(direction);
    
    for (let i = 0; i < steps; i++) {
        const beforePos = { x: player.x, y: player.y };
        
        // Call player update
        player.update(null, hasWallFn);
        
        const afterPos = { x: player.x, y: player.y };
        
        // Calculate distance from cell center
        const centerX = player.gridX * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
        const centerY = player.gridY * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
        const distanceFromCenter = Math.abs(player.x - centerX) + Math.abs(player.y - centerY);
        
        // Track metrics
        maxDistanceFromCenter = Math.max(maxDistanceFromCenter, distanceFromCenter);
        
        // Detect overshoot (more than half cell from center)
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
            x: afterPos.x.toFixed(1),
            y: afterPos.y.toFixed(1), 
            gridX: player.gridX,
            gridY: player.gridY,
            direction: player.direction || 'null',
            distanceFromCenter: distanceFromCenter.toFixed(1),
            jumpDistance: jumpDistance.toFixed(1)
        });
        
        // Stop if player stops
        if (!player.direction && i > 10) break;
    }
    
    return {
        positions,
        overshootDetected,
        jumpBackDetected,
        maxDistanceFromCenter: maxDistanceFromCenter.toFixed(1)
    };
}

// Test RIGHT wall collision
console.log('1️⃣  RIGHT WALL COLLISION TEST');
console.log('   Player starts at (1,5), moves RIGHT, hits wall at (2,5)');

const player1 = new Player(1, 5); // Start at grid (1,5)
const mockHasWallRight = (x, y, direction) => {
    // Wall to the right of position (2,5)
    return direction === 'RIGHT' && x === 2 && y === 5;
};

const result1 = simulateCollisionTest(player1, 'RIGHT', 60, mockHasWallRight);

console.log(`   Final position: x=${result1.positions[result1.positions.length-1].x}, y=${result1.positions[result1.positions.length-1].y}`);
console.log(`   Final grid: (${result1.positions[result1.positions.length-1].gridX}, ${result1.positions[result1.positions.length-1].gridY})`);
console.log(`   Max distance from center: ${result1.maxDistanceFromCenter}px`);
console.log(`   Overshoot detected: ${result1.overshootDetected ? '❌ YES' : '✅ NO'}`);
console.log(`   Jump back detected: ${result1.jumpBackDetected ? '❌ YES' : '✅ NO'}`);

if (result1.overshootDetected || result1.jumpBackDetected) {
    console.log('\n   🔍 Movement trace (last 10 steps):');
    result1.positions.slice(-10).forEach(p => {
        console.log(`      Step ${p.step}: x=${p.x}, dir=${p.direction}, distFromCenter=${p.distanceFromCenter}, jump=${p.jumpDistance}`);
    });
}

console.log('\n');

// Test LEFT wall collision  
console.log('2️⃣  LEFT WALL COLLISION TEST');
console.log('   Player starts at (3,6), moves LEFT, hits wall at (2,6)');

const player2 = new Player(3, 6); // Start at grid (3,6)
const mockHasWallLeft = (x, y, direction) => {
    // Wall to the left of position (2,6)
    return direction === 'LEFT' && x === 2 && y === 6;
};

const result2 = simulateCollisionTest(player2, 'LEFT', 60, mockHasWallLeft);

console.log(`   Final position: x=${result2.positions[result2.positions.length-1].x}, y=${result2.positions[result2.positions.length-1].y}`);
console.log(`   Final grid: (${result2.positions[result2.positions.length-1].gridX}, ${result2.positions[result2.positions.length-1].gridY})`);
console.log(`   Max distance from center: ${result2.maxDistanceFromCenter}px`);
console.log(`   Overshoot detected: ${result2.overshootDetected ? '❌ YES' : '✅ NO'}`);
console.log(`   Jump back detected: ${result2.jumpBackDetected ? '❌ YES' : '✅ NO'}`);

if (result2.overshootDetected || result2.jumpBackDetected) {
    console.log('\n   🔍 Movement trace (last 10 steps):');
    result2.positions.slice(-10).forEach(p => {
        console.log(`      Step ${p.step}: x=${p.x}, dir=${p.direction}, distFromCenter=${p.distanceFromCenter}, jump=${p.jumpDistance}`);
    });
}

console.log('\n======================================');

// Analysis
console.log('📊 ANALYSIS SUMMARY\n');

const allResults = [result1, result2];
const problemCount = allResults.filter(r => r.overshootDetected || r.jumpBackDetected).length;

if (problemCount > 0) {
    console.log(`❌ ${problemCount}/2 tests detected problems`);
    console.log('');
    console.log('🔧 RECOMMENDED ACTIONS:');
    console.log('   1. Open debug-player-movement.html in browser for visual testing');
    console.log('   2. npm run dev && open http://localhost:8080/debug-player-movement.html'); 
    console.log('   3. Use test buttons to reproduce wall collision scenarios');
    console.log('   4. Watch real-time position tracking in debug panel');
    console.log('   5. Add temporary console.log to Player.update() for detailed tracing');
} else {
    console.log('✅ All tests passed - no overshoot or jump-back detected');
    console.log('');
    console.log('💡 BUT: These are simplified mock tests.');
    console.log('   Real game might still have issues with:');
    console.log('   - Complex map bit-flag logic');
    console.log('   - Timing and frame rate variations'); 
    console.log('   - Browser-specific rendering behavior');
    console.log('');
    console.log('🔧 RECOMMENDED VERIFICATION:');
    console.log('   1. Test in actual game browser environment');
    console.log('   2. npm run dev && open http://localhost:8080');
    console.log('   3. Try moving player into various walls manually');
    console.log('   4. Look for visual glitches or stuttering');
}

console.log('\n🎯 Key areas to investigate:');
console.log('   - Cell edge detection timing');  
console.log('   - hasWall() function accuracy with real map data');
console.log('   - Speed calculations during eating vs empty movement');
console.log('   - Direction change timing near walls');
console.log('   - Tunnel wrapping interference with wall collision');

console.log('\n📝 Debug tools available:');
console.log('   - debug-player-movement.html (visual real-time debugging)');
console.log('   - TESTING_PLAYER_MOVEMENT.md (comprehensive test strategy)');
console.log('   - Jest tests in tests/game/player-movement.test.js (automated)');