#!/usr/bin/env node

// Import konstant a funkcí z generátoru
const fs = require('fs');
const path = require('path');

// Nastavení logování do souboru
const logFile = path.join(__dirname, 'test-output.log');
const originalConsoleLog = console.log;
console.log = function(...args) {
    const message = args.join(' ') + '\n';
    fs.appendFileSync(logFile, message);
    originalConsoleLog(...args);
};

// Vymazat předchozí log
if (fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, '');
}

// Načtení JS souborů jako stringy a jejich vyhodnocení
const constantsPath = path.join(__dirname, 'generator/js/constants.js');
const mapGenPath = path.join(__dirname, 'generator/js/mapGeneration.js');
const pathfindingPath = path.join(__dirname, 'generator/js/pathfinding.js');

const constantsCode = fs.readFileSync(constantsPath, 'utf8');
const mapGenCode = fs.readFileSync(mapGenPath, 'utf8');
const pathfindingCode = fs.readFileSync(pathfindingPath, 'utf8');

// Vyhodnotit kód (definovat konstanty a funkce)
// Upravit const na var pro globální dostupnost
const fixedConstantsCode = constantsCode.replace(/const /g, 'var ');
eval(fixedConstantsCode);
eval(mapGenCode);
eval(pathfindingCode);

console.log(`🧪 Testování generátoru PacMan mapy`);
console.log(`📏 Rozměry mapy: ${BOARD_WIDTH}x${BOARD_HEIGHT}`);
console.log(`🎯 Konstanty: WALL_TOP=${WALL_TOP}, WALL_LEFT=${WALL_LEFT}, DOT=${DOT}`);
console.log('');

// Funkce pro vytvoření testovací matice s průjezdnými okraji
function createPassableMap() {
    const map = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
    
    // PŘIDAT VNĚJŠÍ HRANICE pro zabránění vypadnutí z mapy
    
    // Horní okraj - všechny pozice mají WALL_TOP
    for (let x = 0; x < BOARD_WIDTH; x++) {
        map[0][x] |= WALL_TOP;
    }
    
    // Levý okraj - všechny pozice mají WALL_LEFT  
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        map[y][0] |= WALL_LEFT;
    }
    
    // Spodní okraj (virtuální řada) - všechny pozice mají WALL_TOP
    for (let x = 0; x < BOARD_WIDTH; x++) {
        map[BOARD_HEIGHT-1][x] |= WALL_TOP;
    }
    
    // Pravý okraj (virtuální sloupec) - všechny pozice mají WALL_LEFT
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        map[y][BOARD_WIDTH-1] |= WALL_LEFT;
    }
    
    // Přidat nějaké zdi do středu pro realističnost
    map[5][8] = WALL_TOP | WALL_LEFT; // zeď uprostřed
    map[6][9] = WALL_LEFT;
    map[7][7] = WALL_TOP;
    
    // Přidat ghost spawn pozice uprostřed (stejně jako originální generátor)
    const centerX = Math.floor(BOARD_WIDTH / 2);
    const centerY = Math.floor(BOARD_HEIGHT / 2);
    map[centerY][centerX] |= GHOST_SPAWN;
    if (centerX - 1 >= 0) map[centerY][centerX - 1] |= GHOST_SPAWN;
    if (centerX + 1 < BOARD_WIDTH) map[centerY][centerX + 1] |= GHOST_SPAWN;
    if (centerY + 1 < BOARD_HEIGHT) map[centerY + 1][centerX] |= GHOST_SPAWN;
    
    return map;
}

// Funkce pro vytvoření testovací matice s neprůjezdnými okraji
function createNonPassableMap() {
    const map = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
    
    // PŘIDAT VNĚJŠÍ HRANICE (stejné jako u průjezdné matice)
    
    // Horní okraj - všechny pozice mají WALL_TOP
    for (let x = 0; x < BOARD_WIDTH; x++) {
        map[0][x] |= WALL_TOP;
    }
    
    // Levý okraj - všechny pozice mají WALL_LEFT  
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        map[y][0] |= WALL_LEFT;
    }
    
    // Spodní okraj (virtuální řada) - všechny pozice mají WALL_TOP
    for (let x = 0; x < BOARD_WIDTH; x++) {
        map[BOARD_HEIGHT-1][x] |= WALL_TOP;
    }
    
    // Pravý okraj (virtuální sloupec) - všechny pozice mají WALL_LEFT
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        map[y][BOARD_WIDTH-1] |= WALL_LEFT;
    }
    
    // Přidat blokující zdi na okrajích hratelné oblasti
    map[0][3] |= WALL_LEFT;           // horní řada - blokuje horizontální pohyb
    map[0][7] |= WALL_LEFT;           // horní řada - další blok
    map[BOARD_HEIGHT-2][5] |= WALL_LEFT;  // spodní hratelná řada - blokuje horizontální pohyb
    
    map[2][0] |= WALL_TOP;            // levý sloupec - blokuje vertikální pohyb
    map[4][BOARD_WIDTH-2] |= WALL_TOP;    // pravý hratelný sloupec - blokuje vertikální pohyb
    map[8][BOARD_WIDTH-2] |= WALL_TOP;    // pravý hratelný sloupec - další blok
    
    // Přidat ghost spawn pozice uprostřed (stejně jako originální generátor)
    const centerX = Math.floor(BOARD_WIDTH / 2);
    const centerY = Math.floor(BOARD_HEIGHT / 2);
    map[centerY][centerX] |= GHOST_SPAWN;
    if (centerX - 1 >= 0) map[centerY][centerX - 1] |= GHOST_SPAWN;
    if (centerX + 1 < BOARD_WIDTH) map[centerY][centerX + 1] |= GHOST_SPAWN;
    if (centerY + 1 < BOARD_HEIGHT) map[centerY + 1][centerX] |= GHOST_SPAWN;
    
    return map;
}

// Funkce pro vizualizaci matice
function printMap(map, title) {
    console.log(`\n📋 ${title}:`);
    console.log('    ' + Array.from({length: BOARD_WIDTH}, (_, i) => i.toString().padStart(2)).join(' '));
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        const row = map[y].map(val => val.toString().padStart(2)).join(' ');
        console.log(`${y.toString().padStart(2)}: ${row}`);
    }
}

// Test funkce
function testPerimeterPassability(map, testName) {
    console.log(`\n🔄 Testování: ${testName}`);
    printMap(map, 'Matice dat');
    
    let passCount = 0;
    let failCount = 0;
    const failures = [];
    
    console.log('🔍 Testování průjezdnosti okrajů:');
    
    // Test horní řady (y = 0) - horizontální pohyb (zleva doprava)
    // OPRAVA: Hratelná oblast je 0 až BOARD_WIDTH-2, testujeme průjezd mezi buňkami
    // VYNECHAT rohy [0][0] a [0][BOARD_WIDTH-2], které mají vnější zdi
    console.log(`\n📍 Horní řada (y=0) - hratelná oblast [1..${BOARD_WIDTH-3}] (bez rohů):`);
    for (let x = 1; x < BOARD_WIDTH - 2; x++) {  // OPRAVA: začít od 1, skončit -2
        const hasWallLeft = (map[0][x] & WALL_LEFT) !== 0;
        if (hasWallLeft) {
            failures.push(`❌ [0][${x}] má WALL_LEFT (${map[0][x]})`);
            failCount++;
        } else {
            passCount++;
        }
    }
    
    // Test spodní řady (y = BOARD_HEIGHT-2) - horizontální pohyb  
    // OPRAVA: Testujeme skutečnou spodní hratelnou řadu, vynechat rohy
    console.log(`\n📍 Spodní řada (y=${BOARD_HEIGHT-2}) - hratelná oblast [1..${BOARD_WIDTH-3}] (bez rohů):`);
    for (let x = 1; x < BOARD_WIDTH - 2; x++) {  // OPRAVA: začít od 1, skončit -2
        const hasWallLeft = (map[BOARD_HEIGHT-2][x] & WALL_LEFT) !== 0;  // OPRAVA: -2
        if (hasWallLeft) {
            failures.push(`❌ [${BOARD_HEIGHT-2}][${x}] má WALL_LEFT (${map[BOARD_HEIGHT-2][x]})`);
            failCount++;
        } else {
            passCount++;
        }
    }
    
    // Test levý sloupec (x = 0) - vertikální pohyb (shora dolů)
    // VYNECHAT rohy [0][0] a [BOARD_HEIGHT-2][0], které mají vnější zdi
    console.log(`\n📍 Levý sloupec (x=0) - hratelná oblast [1..${BOARD_HEIGHT-3}] (bez rohů):`);
    for (let y = 1; y < BOARD_HEIGHT - 2; y++) {  // OPRAVA: začít od 1, skončit -2
        const hasWallTop = (map[y][0] & WALL_TOP) !== 0;
        if (hasWallTop) {
            failures.push(`❌ [${y}][0] má WALL_TOP (${map[y][0]})`);
            failCount++;
        } else {
            passCount++;
        }
    }
    
    // Test pravý sloupec (x = BOARD_WIDTH-2) - vertikální pohyb
    // OPRAVA: Testujeme skutečný pravý hratelný sloupec, vynechat rohy
    console.log(`\n📍 Pravý sloupec (x=${BOARD_WIDTH-2}) - hratelná oblast [1..${BOARD_HEIGHT-3}] (bez rohů):`);
    for (let y = 1; y < BOARD_HEIGHT - 2; y++) {  // OPRAVA: začít od 1, skončit -2
        const hasWallTop = (map[y][BOARD_WIDTH-2] & WALL_TOP) !== 0;  // OPRAVA: -2
        if (hasWallTop) {
            failures.push(`❌ [${y}][${BOARD_WIDTH-2}] má WALL_TOP (${map[y][BOARD_WIDTH-2]})`);
            failCount++;
        } else {
            passCount++;
        }
    }
    
    // Výsledky
    console.log(`\n📊 Výsledky testu:`);
    console.log(`✅ Průchozí pozice: ${passCount}`);
    console.log(`❌ Neprůchozí pozice: ${failCount}`);
    
    if (failures.length > 0) {
        console.log(`\n🔍 Detaily chyb:`);
        failures.forEach(failure => console.log(failure));
    }
    
    // Vizualizace rohů hratelné oblasti
    console.log(`\n🔲 Kontrola rohů hratelné oblasti:`);
    const corners = [
        {name: 'Levý horní', y: 0, x: 0},
        {name: 'Pravý horní', y: 0, x: BOARD_WIDTH-2},    // OPRAVA: -2
        {name: 'Levý spodní', y: BOARD_HEIGHT-2, x: 0},   // OPRAVA: -2  
        {name: 'Pravý spodní', y: BOARD_HEIGHT-2, x: BOARD_WIDTH-2}  // OPRAVA: -2
    ];
    
    corners.forEach(corner => {
        const value = map[corner.y][corner.x];
        const hasWallTop = (value & WALL_TOP) !== 0;
        const hasWallLeft = (value & WALL_LEFT) !== 0;
        console.log(`${corner.name} [${corner.y}][${corner.x}]: ${value} (TOP:${hasWallTop}, LEFT:${hasWallLeft})`);
    });
    
    return failCount === 0;
}

// Test vnějších hranic - ověření, že nelze vypadnout z mapy
function testMapBoundaries(map, testName) {
    console.log(`\n🔒 Testování vnějších hranic: ${testName}`);
    
    let passCount = 0;
    let failCount = 0;
    const failures = [];
    
    // Test horního okraje - všechny pozice musí mít WALL_TOP
    console.log(`\n📍 Horní okraj - všechny pozice [0..${BOARD_WIDTH-1}] musí mít WALL_TOP:`);
    for (let x = 0; x < BOARD_WIDTH; x++) {
        const hasWallTop = (map[0][x] & WALL_TOP) !== 0;
        if (!hasWallTop) {
            failures.push(`❌ [0][${x}] NEMÁ WALL_TOP (${map[0][x]}) - lze vypadnout nahoru!`);
            failCount++;
        } else {
            passCount++;
        }
    }
    
    // Test levého okraje - všechny pozice musí mít WALL_LEFT
    console.log(`\n📍 Levý okraj - všechny pozice [0..${BOARD_HEIGHT-1}] musí mít WALL_LEFT:`);
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        const hasWallLeft = (map[y][0] & WALL_LEFT) !== 0;
        if (!hasWallLeft) {
            failures.push(`❌ [${y}][0] NEMÁ WALL_LEFT (${map[y][0]}) - lze vypadnout vlevo!`);
            failCount++;
        } else {
            passCount++;
        }
    }
    
    // Test spodního okraje - pozice BOARD_HEIGHT-1 musí mít WALL_TOP
    console.log(`\n📍 Spodní okraj - virtuální řada [${BOARD_HEIGHT-1}][x] musí mít WALL_TOP:`);
    for (let x = 0; x < BOARD_WIDTH; x++) {
        const hasWallTop = (map[BOARD_HEIGHT-1][x] & WALL_TOP) !== 0;
        if (!hasWallTop) {
            failures.push(`❌ [${BOARD_HEIGHT-1}][${x}] NEMÁ WALL_TOP (${map[BOARD_HEIGHT-1][x]}) - lze vypadnout dolů!`);
            failCount++;
        } else {
            passCount++;
        }
    }
    
    // Test pravého okraje - pozice BOARD_WIDTH-1 musí mít WALL_LEFT  
    console.log(`\n📍 Pravý okraj - virtuální sloupec [y][${BOARD_WIDTH-1}] musí mít WALL_LEFT:`);
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        const hasWallLeft = (map[y][BOARD_WIDTH-1] & WALL_LEFT) !== 0;
        if (!hasWallLeft) {
            failures.push(`❌ [${y}][${BOARD_WIDTH-1}] NEMÁ WALL_LEFT (${map[y][BOARD_WIDTH-1]}) - lze vypadnout vpravo!`);
            failCount++;
        } else {
            passCount++;
        }
    }
    
    // Výsledky
    console.log(`\n📊 Výsledky testu hranic:`);
    console.log(`✅ Zabezpečené hranice: ${passCount}`);
    console.log(`❌ Nezabezpečené hranice: ${failCount}`);
    
    if (failures.length > 0) {
        console.log(`\n🔍 Detaily problémů s hranicemi:`);
        failures.forEach(failure => console.log(failure));
    }
    
    return failCount === 0;
}

// Test dostupnosti ghost spawn pozic - ověření, že duchové mohou dostat se na okrajové cesty
function testGhostSpawnReachability(map, testName) {
    console.log(`\n👻 Testování dostupnosti ghost spawn pozic: ${testName}`);
    
    let passCount = 0;
    let failCount = 0;
    const failures = [];
    
    // Najít všechny ghost spawn pozice
    const ghostSpawns = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (map[y][x] & GHOST_SPAWN) {
                ghostSpawns.push({x, y});
            }
        }
    }
    
    console.log(`\n📍 Nalezeny ghost spawn pozice: ${ghostSpawns.map(gs => `[${gs.y}][${gs.x}]`).join(', ')}`);
    
    if (ghostSpawns.length === 0) {
        failures.push(`❌ Žádné ghost spawn pozice nenalezeny!`);
        failCount++;
        console.log(`\n📊 Výsledky testu ghost spawn:`);
        console.log(`✅ Dostupné spawny: ${passCount}`);
        console.log(`❌ Nedostupné spawny: ${failCount}`);
        failures.forEach(failure => console.log(failure));
        return false;
    }
    
    // Pro každý ghost spawn testovat dostupnost na okrajové cesty
    for (const spawn of ghostSpawns) {
        const reachableEdges = [];
        
        // Test dostupnosti na všechny 4 okrajové cesty
        const edges = [
            { name: 'horní okraj', targets: Array.from({length: BOARD_WIDTH-2}, (_, i) => ({x: i+1, y: 0})) },
            { name: 'spodní okraj', targets: Array.from({length: BOARD_WIDTH-2}, (_, i) => ({x: i+1, y: BOARD_HEIGHT-2})) },
            { name: 'levý okraj', targets: Array.from({length: BOARD_HEIGHT-2}, (_, i) => ({x: 0, y: i+1})) },
            { name: 'pravý okraj', targets: Array.from({length: BOARD_HEIGHT-2}, (_, i) => ({x: BOARD_WIDTH-2, y: i+1})) }
        ];
        
        for (const edge of edges) {
            for (const target of edge.targets) {
                if (isPathReachable(map, spawn.x, spawn.y, target.x, target.y)) {
                    reachableEdges.push(`${edge.name}[${target.y}][${target.x}]`);
                    break; // Stačí jeden dostupný bod na každém okraji
                }
            }
        }
        
        if (reachableEdges.length === 4) {
            console.log(`✅ Ghost spawn [${spawn.y}][${spawn.x}] má přístup ke všem okrajům: ${reachableEdges.join(', ')}`);
            passCount++;
        } else {
            failures.push(`❌ Ghost spawn [${spawn.y}][${spawn.x}] má přístup jen k ${reachableEdges.length}/4 okrajům: ${reachableEdges.join(', ')}`);
            failCount++;
        }
    }
    
    // Výsledky
    console.log(`\n📊 Výsledky testu ghost spawn:`);
    console.log(`✅ Dostupné spawny: ${passCount}`);
    console.log(`❌ Nedostupné spawny: ${failCount}`);
    
    if (failures.length > 0) {
        console.log(`\n🔍 Detaily problémů s ghost spawny:`);
        failures.forEach(failure => console.log(failure));
    }
    
    return failCount === 0;
}

// Pomocná funkce pro testování dostupnosti mezi dvěma body pomocí BFS
function isPathReachable(map, startX, startY, targetX, targetY) {
    if (startX === targetX && startY === targetY) return true;
    
    const visited = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(false));
    const queue = [[startX, startY]];
    visited[startY][startX] = true;
    
    while (queue.length > 0) {
        const [x, y] = queue.shift();
        
        if (x === targetX && y === targetY) {
            return true;
        }
        
        // Kontrola všech směrů
        const directions = [
            { dx: 0, dy: -1, dir: 'UP' },
            { dx: 0, dy: 1, dir: 'DOWN' },
            { dx: -1, dy: 0, dir: 'LEFT' },
            { dx: 1, dy: 0, dir: 'RIGHT' }
        ];
        
        for (const { dx, dy, dir } of directions) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < BOARD_WIDTH && ny >= 0 && ny < BOARD_HEIGHT && 
                !visited[ny][nx] && canMove(map, x, y, dir)) {
                visited[ny][nx] = true;
                queue.push([nx, ny]);
            }
        }
    }
    
    return false;
}

// Test s původním generátorem pro porovnání
function testOriginalGenerator() {
    console.log('\n' + '='.repeat(60));
    console.log('TEST 3: Původní generátor');
    console.log('='.repeat(60));
    console.log('🔄 Generuji mapu původním generátorem...');
    const originalMap = generateMap();
    const success3a = testPerimeterPassability(originalMap, 'Původní generátor');
    const success3b = testMapBoundaries(originalMap, 'Původní generátor');
    const success3c = testGhostSpawnReachability(originalMap, 'Původní generátor');
    return success3a && success3b && success3c;
}

// Spuštění testů
console.log('\n' + '='.repeat(60));
console.log('TEST 1: Matice s průjezdnými okraji');
console.log('='.repeat(60));
const passableMap = createPassableMap();
const success1a = testPerimeterPassability(passableMap, 'Průjezdná matice');
const success1b = testMapBoundaries(passableMap, 'Průjezdná matice');
const success1c = testGhostSpawnReachability(passableMap, 'Průjezdná matice');

console.log('\n' + '='.repeat(60));
console.log('TEST 2: Matice s neprůjezdnými okraji');
console.log('='.repeat(60));
const nonPassableMap = createNonPassableMap();
const success2a = testPerimeterPassability(nonPassableMap, 'Neprůjezdná matice');
const success2b = testMapBoundaries(nonPassableMap, 'Neprůjezdná matice');
const success2c = testGhostSpawnReachability(nonPassableMap, 'Neprůjezdná matice');

// Test původního generátoru
const success3 = testOriginalGenerator();

console.log('\n' + '='.repeat(60));
console.log('SHRNUTÍ TESTŮ');
console.log('='.repeat(60));

const success1 = success1a && success1b && success1c;
const success2 = success2a || success2b || !success2c;  // Měl by selhat alespoň jeden test

console.log(`Test 1 (průjezdná):`);
console.log(`  - Průjezdnost okrajů: ${success1a ? '✅ PROŠEL' : '❌ SELHAL'}`);  
console.log(`  - Vnější hranice: ${success1b ? '✅ PROŠEL' : '❌ SELHAL'}`);
console.log(`  - Ghost spawn dostupnost: ${success1c ? '✅ PROŠEL' : '❌ SELHAL'}`);
console.log(`  - Celkově: ${success1 ? '✅ PROŠEL' : '❌ SELHAL'}`);

console.log(`\nTest 2 (neprůjezdná):`);
console.log(`  - Průjezdnost okrajů: ${success2a ? '❌ Neočekávaně prošel' : '✅ Správně selhal'}`);
console.log(`  - Vnější hranice: ${success2b ? '✅ PROŠEL' : '❌ SELHAL'}`);
console.log(`  - Ghost spawn dostupnost: ${success2c ? '✅ PROŠEL' : '❌ SELHAL'}`);
console.log(`  - Celkově: ${!success2a ? '✅ SPRÁVNĚ SELHAL' : '❌ NEOČEKÁVANĚ PROŠEL'}`);

console.log(`\nTest 3 (původní generátor): ${success3 ? '✅ PROŠEL' : '❌ SELHAL'}`);

if (success1 && !success2a && success1b) {
    console.log(`\n🎉 TESTOVACÍ LOGIKA FUNGUJE SPRÁVNĚ!`);
    if (success3) {
        console.log(`🎯 Původní generátor vytváří průjezdné okraje i zabezpečené hranice.`);
    } else {
        console.log(`⚠️  Původní generátor má problém!`);
    }
    process.exit(success3 ? 0 : 2);
} else {
    console.log(`\n💥 PROBLÉM S TESTOVACÍ LOGIKOU!`);
    process.exit(1);
}