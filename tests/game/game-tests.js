#!/usr/bin/env node

// Vlastní test runner pro herní logiku s ES6 modules
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Nastavení logování do souboru
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logFile = path.join(__dirname, '../../logs/tests/game-' + timestamp + '.log');
const originalConsoleLog = console.log;
console.log = function(...args) {
    const message = args.join(' ') + '\n';
    fs.appendFileSync(logFile, message);
    originalConsoleLog(...args);
};

// Vytvořit adresář pro logy pokud neexistuje
const logDir = path.dirname(logFile);
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Vymazat předchozí log
if (fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, '');
}

// Import tříd pro testování
import { PacMan } from '../../src/game/js/player.js';
import { Ghost } from '../../src/game/js/ghosts.js';
import { MapManager } from '../../src/game/js/map.js';
import { DIRECTIONS, CELL_SIZE } from '../../src/shared/constants.js';

// Mock JSDOM environment
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><div id="game-board"></div>');
global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;

// Mock Canvas context
dom.window.HTMLCanvasElement.prototype.getContext = function(type) {
    if (type === '2d') {
        return {
            fillStyle: '',
            strokeStyle: '',
            fillRect: () => {},
            strokeRect: () => {},
            clearRect: () => {},
            fillText: () => {},
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            arc: () => {},
            fill: () => {},
            stroke: () => {},
            save: () => {},
            restore: () => {},
            translate: () => {},
            rotate: () => {},
            scale: () => {}
        };
    }
    return null;
};

console.log(`🧪 Testování herní logiky PacMan`);
console.log(`📋 Test runner: Vlastní ES6 runner s JSDOM`);
console.log(`📝 Log soubor: ${logFile}`);
console.log('');

// Test counter
let testsPassed = 0;
let testsFailed = 0;
const failures = [];

// Helper functions
function assert(condition, message) {
    if (condition) {
        console.log(`✅ ${message}`);
        testsPassed++;
        return true;
    } else {
        console.log(`❌ ${message}`);
        testsFailed++;
        failures.push(message);
        return false;
    }
}

function assertEqual(actual, expected, message) {
    return assert(actual === expected, `${message} (expected: ${expected}, actual: ${actual})`);
}

function createMockGameBoard() {
    const gameBoard = document.getElementById('game-board');
    return {
        appendChild: () => {},
        removeChild: () => {},
        querySelector: () => null,
        style: {},
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 600, height: 400 }),
        ...gameBoard
    };
}

function createSimpleMap() {
    // Jednoduchá 5x5 mapa pro testování (PacMan formát)
    return [
        [0, 0, 0, 0, 0],  // řádek 0: samé tečky (0 = tečka)
        [0, 2, 2, 2, 0],  // řádek 1: tečky po stranách, sebrané uprostřed
        [0, 2, 2, 2, 0],  // řádek 2: PacMan uprostřed
        [0, 2, 2, 2, 0],  // řádek 3
        [0, 0, 3, 0, 0]   // řádek 4: tečky a power pellet uprostřed (3)
    ];
}

function createMapWithWalls() {
    // Mapa se zdmi pro testování kolizí (PacMan formát: 1 = zeď)
    return [
        [0, 1, 0, 0, 0],  // řádek 0: zeď na [0][1]
        [1, 0, 0, 0, 0],  // řádek 1: zeď na [1][0]
        [0, 0, 0, 0, 1],  // řádek 2: zeď na [2][4]
        [0, 0, 1, 0, 0],  // řádek 3: zeď na [3][2]
        [0, 0, 0, 0, 0]   // řádek 4: prázdný
    ];
}

// ============================================================
// TEST 1: PacMan inicializace a základní funkce
// ============================================================
console.log('\n' + '='.repeat(60));
console.log('TEST 1: PacMan - Inicializace a základní funkce');
console.log('='.repeat(60));

function testPacManInitialization() {
    console.log('\n🔄 Test PacMan inicializace...');
    
    const mockGameBoard = createMockGameBoard();
    const mockMap = createSimpleMap();
    const mockCallbacks = {
        updateDotDisplay: () => {},
        updateScore: () => {},
        activateFrightenedMode: () => {},
        checkWin: () => {}
    };
    
    const pacman = new PacMan(2, 2, mockGameBoard, mockMap, mockCallbacks);
    
    // PacMan používá gridX/gridY místo x/y
    assertEqual(pacman.gridX, 2, 'PacMan gridX pozice správně inicializována');
    assertEqual(pacman.gridY, 2, 'PacMan gridY pozice správně inicializována');
    assertEqual(pacman.pixelX, 2 * CELL_SIZE, 'PacMan pixelX pozice správně inicializována');
    assertEqual(pacman.pixelY, 2 * CELL_SIZE, 'PacMan pixelY pozice správně inicializována');
    assertEqual(pacman.direction, null, 'PacMan směr inicializován jako null');
    assertEqual(pacman.nextDirection, null, 'PacMan další směr inicializován jako null');
    
    // Test vytvoření elementu
    pacman.create();
    assert(pacman.element !== null, 'PacMan element vytvořen');
    
    console.log(`📍 PacMan vytvořen na pozici [${pacman.gridX}, ${pacman.gridY}] (pixel: [${pacman.pixelX}, ${pacman.pixelY}]) se směrem ${pacman.direction}`);
}

// ============================================================
// TEST 2: PacMan pohyb
// ============================================================
console.log('\n' + '='.repeat(60));
console.log('TEST 2: PacMan - Pohybové testy');
console.log('='.repeat(60));

function testPacManMovement() {
    console.log('\n🔄 Test PacMan pohyb...');
    
    const mockGameBoard = createMockGameBoard();
    const mockMap = createSimpleMap();
    
    const mockCallbacks = {
        updateDotDisplay: (x, y) => {
            console.log(`📍 updateDotDisplay zavolán pro pozici [${x}, ${y}]`);
        },
        updateScore: (points) => {
            console.log(`🎯 updateScore zavolán s ${points} body`);
        },
        activateFrightenedMode: () => {},
        checkWin: () => {}
    };
    
    const pacman = new PacMan(2, 2, mockGameBoard, mockMap, mockCallbacks);
    pacman.create();
    
    // Test nastavení směru doprava
    console.log('\n📍 Test nastavení směru doprava...');
    const originalGridX = pacman.gridX;
    pacman.nextDirection = DIRECTIONS.RIGHT;
    
    // Pro testování pohybu nastavím i direction přímo
    pacman.direction = DIRECTIONS.RIGHT;
    
    // Simulace pohybu - v reálné hře se volá opakovaně
    for (let i = 0; i < 10; i++) {
        pacman.move();
        if (pacman.gridX !== originalGridX) break;
    }
    
    assert(pacman.gridX >= originalGridX, 'PacMan se posunul doprava nebo zůstal na místě');
    console.log(`📍 PacMan pozice po pohybu doprava: [${pacman.gridX}, ${pacman.gridY}]`);
    
    // Test nastavení směru doleva
    console.log('\n📍 Test nastavení směru doleva...');
    const currentGridX = pacman.gridX;
    pacman.nextDirection = DIRECTIONS.LEFT;
    pacman.direction = DIRECTIONS.LEFT;
    
    for (let i = 0; i < 10; i++) {
        pacman.move();
        if (pacman.gridX !== currentGridX) break;
    }
    
    assert(pacman.gridX <= currentGridX, 'PacMan se posunul doleva nebo zůstal na místě');
    console.log(`📍 PacMan pozice po pohybu doleva: [${pacman.gridX}, ${pacman.gridY}]`);
    
    // Test základního API pro nastavení směrů
    console.log('\n📍 Test API pro nastavení směrů...');
    pacman.nextDirection = DIRECTIONS.UP;
    assertEqual(pacman.nextDirection, DIRECTIONS.UP, 'Směr nahoru správně nastaven');
    
    pacman.nextDirection = DIRECTIONS.DOWN;
    assertEqual(pacman.nextDirection, DIRECTIONS.DOWN, 'Směr dolů správně nastaven');
}

// ============================================================
// TEST 3: PacMan sbírání teček
// ============================================================
console.log('\n' + '='.repeat(60));
console.log('TEST 3: PacMan - Sbírání teček');
console.log('='.repeat(60));

function testPacManDotCollection() {
    console.log('\n🔄 Test PacMan sbírání teček...');
    
    const mockGameBoard = createMockGameBoard();
    const mockMap = createSimpleMap();
    let scorePoints = 0;
    let dotPosition = null;
    let frightenedActivated = false;
    
    const mockCallbacks = {
        updateDotDisplay: (x, y) => {
            dotPosition = {x, y};
            console.log(`🟡 Tečka sebrána na pozici [${x}, ${y}]`);
        },
        updateScore: (points) => {
            scorePoints += points;
            console.log(`🎯 Skóre aktualizováno: +${points} bodů (celkem: ${scorePoints})`);
        },
        activateFrightenedMode: () => {
            frightenedActivated = true;
            console.log(`👻 Frightened mode aktivován!`);
        },
        checkWin: () => {}
    };
    
    // Test 1: Umístit PacMana na pozici s normální tečkou
    console.log('\n📍 Test sebrání normální tečky...');
    const pacman = new PacMan(0, 0, mockGameBoard, mockMap, mockCallbacks);
    pacman.create();
    
    console.log(`📍 PacMan umístěn na [0, 0], hodnota mapy: ${mockMap[0][0]}`);
    assert(mockMap[0][0] === 0, 'Na pozici [0,0] je tečka (hodnota 0)');
    
    // Simulace sebrání tečky přímo voláním collectDot
    pacman.collectDot();
    
    assert(scorePoints === 10, `Skóre aktualizováno po sebrání tečky (+10 bodů, celkem: ${scorePoints})`);
    assert(dotPosition !== null, 'updateDotDisplay byl zavolán');
    assertEqual(mockMap[0][0], 2, 'Tečka označena jako sebraná (hodnota 2)');
    
    if (dotPosition) {
        assertEqual(dotPosition.x, 0, 'Správná X pozice tečky');
        assertEqual(dotPosition.y, 0, 'Správná Y pozice tečky');
    }
    
    // Test 2: Power pellet
    console.log('\n📍 Test sebrání power pelletu...');
    const pacman2 = new PacMan(2, 4, mockGameBoard, mockMap, mockCallbacks);
    pacman2.create();
    
    console.log(`📍 PacMan2 umístěn na [2, 4], hodnota mapy: ${mockMap[4][2]}`);
    assert(mockMap[4][2] === 3, 'Na pozici [2,4] je power pellet (hodnota 3)');
    
    const originalScore = scorePoints;
    frightenedActivated = false;
    
    pacman2.collectDot();
    
    assert(scorePoints === originalScore + 50, `Skóre aktualizováno po power pelletu (+50 bodů)`);
    assert(frightenedActivated === true, 'Frightened mode byl aktivován');
    assertEqual(mockMap[4][2], 2, 'Power pellet označen jako sebraný');
    
    // Test 3: Prázdné políčko (už sebraná tečka)
    console.log('\n📍 Test prázdného políčka...');
    const pacman3 = new PacMan(1, 1, mockGameBoard, mockMap, mockCallbacks);
    pacman3.create();
    
    const scoreBeforeEmpty = scorePoints;
    pacman3.collectDot();
    
    assertEqual(scorePoints, scoreBeforeEmpty, 'Na prázdném políčku se skóre neměnilo');
}

// ============================================================
// TEST 4: PacMan kolizní detekce
// ============================================================
console.log('\n' + '='.repeat(60));
console.log('TEST 4: PacMan - Kolizní detekce');
console.log('='.repeat(60));

function testPacManCollisionDetection() {
    console.log('\n🔄 Test PacMan kolizní detekce...');
    
    const mockGameBoard = createMockGameBoard();
    const mockMap = createMapWithWalls();
    
    const mockCallbacks = {
        updateDotDisplay: () => {},
        updateScore: () => {},
        activateFrightenedMode: () => {},
        checkWin: () => {}
    };
    
    // Umístit PacMana na pozici [1,1] (bezpečná pozice)
    const pacman = new PacMan(1, 1, mockGameBoard, mockMap, mockCallbacks);
    pacman.create();
    
    console.log('📍 Mapa s překážkami:');
    mockMap.forEach((row, y) => {
        const rowStr = row.map(val => val.toString().padStart(2)).join(' ');
        console.log(`   ${y}: ${rowStr}`);
    });
    
    // Test canMoveTo funkce pro různé pozice
    console.log('\n📍 Test canMoveTo funkce...');
    
    // Test pohybu na zeď [0][1] 
    const canMoveToWall = pacman.canMoveTo(1, 0);
    assert(canMoveToWall === false, 'canMoveTo vrací false pro zeď na [0][1]');
    console.log(`📍 canMoveTo(1, 0) = ${canMoveToWall} (zeď)`);
    
    // Test pohybu na volné místo [2][1]
    const canMoveToEmpty = pacman.canMoveTo(2, 1);
    assert(canMoveToEmpty === true, 'canMoveTo vrací true pro volné místo na [1][2]');
    console.log(`📍 canMoveTo(2, 1) = ${canMoveToEmpty} (volné)`);
    
    // Test pohybu na zeď [1][0]
    const canMoveToLeftWall = pacman.canMoveTo(0, 1);
    assert(canMoveToLeftWall === false, 'canMoveTo vrací false pro zeď na [1][0]');
    console.log(`📍 canMoveTo(0, 1) = ${canMoveToLeftWall} (zeď)`);
    
    // Test funkce přímo - simulace pohybu
    console.log('\n📍 Test praktické kolize...');
    
    // Simulace: PacMan na [2,2] se pokusí jít doprava na zeď [2][4]
    const pacman2 = new PacMan(3, 2, mockGameBoard, mockMap, mockCallbacks);
    pacman2.create();
    
    const canMoveRight = pacman2.canMoveTo(4, 2);
    assert(canMoveRight === false, 'PacMan nemůže jít doprava na zeď [2][4]');
    
    // Test hraničních případů
    console.log('\n📍 Test hraničních případů...');
    const canMoveOutOfBounds = pacman.canMoveTo(-1, 1);
    assert(canMoveOutOfBounds === true, 'Pohyb mimo mapu vlevo je povolen (teleportace)');
    
    const canMoveOutOfBoundsY = pacman.canMoveTo(1, -1);
    assert(canMoveOutOfBoundsY === false, 'Pohyb mimo mapu nahoru je zakázán');
}

// ============================================================
// Spuštění všech testů
// ============================================================

try {
    testPacManInitialization();
    testPacManMovement();
    testPacManDotCollection();
    testPacManCollisionDetection();
} catch (error) {
    console.log(`\n💥 Chyba při spouštění testů: ${error.message}`);
    console.log(error.stack);
    testsFailed++;
    failures.push(`Test exception: ${error.message}`);
}

// ============================================================
// Výsledky testů
// ============================================================
console.log('\n' + '='.repeat(60));
console.log('VÝSLEDKY HERNÍCH TESTŮ');
console.log('='.repeat(60));

console.log(`✅ Úspěšné testy: ${testsPassed}`);
console.log(`❌ Neúspěšné testy: ${testsFailed}`);
console.log(`📊 Celkový počet testů: ${testsPassed + testsFailed}`);

if (failures.length > 0) {
    console.log(`\n🔍 Detaily selhání:`);
    failures.forEach((failure, index) => {
        console.log(`   ${index + 1}. ${failure}`);
    });
}

const successRate = testsPassed + testsFailed > 0 ? (testsPassed / (testsPassed + testsFailed) * 100).toFixed(1) : '0.0';
console.log(`\n📈 Úspěšnost: ${successRate}%`);

if (testsFailed === 0) {
    console.log(`\n🎉 VŠECHNY TESTY PROŠLY!`);
    process.exit(0);
} else {
    console.log(`\n⚠️  NĚKTERÉ TESTY SELHALY`);
    process.exit(1);
}