// Krok 1: Náhodné generování zdí
function generateRandomWalls() {
    const map = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (Math.random() < WALL_PROBABILITY) {
                map[y][x] |= WALL_TOP;
            }
            if (Math.random() < WALL_PROBABILITY) {
                map[y][x] |= WALL_LEFT;
            }
        }
    }
    
    return map;
}

// Krok 2: Uzavření okrajů
function sealBorders(map) {
    // Horní řada
    for (let x = 0; x < BOARD_WIDTH; x++) {
        map[0][x] |= WALL_TOP;
    }
    
    // Spodní řada - přidat zeď nad spodní řadou
    for (let x = 0; x < BOARD_WIDTH; x++) {
        if (BOARD_HEIGHT - 1 < BOARD_HEIGHT) {
            map[BOARD_HEIGHT - 1][x] |= WALL_TOP;
        }
    }
    
    // Levý sloupec
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        map[y][0] |= WALL_LEFT;
    }
    
    // Pravý sloupec - přidat zeď vlevo od pravého sloupce
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        if (BOARD_WIDTH - 1 < BOARD_WIDTH) {
            map[y][BOARD_WIDTH - 1] |= WALL_LEFT;
        }
    }
}

// Krok 3: Vytvoření okrajové cesty
function createPerimeterPath(map) {
    // Odstranit levé zdi pro horní i spodní řadu (průjezd zleva doprava)
    for (let x = 0; x < BOARD_WIDTH; x++) {
        map[0][x] &= ~WALL_LEFT;                    // horní řada (index 0)
        map[BOARD_HEIGHT - 1][x] &= ~WALL_LEFT;     // spodní řada (index BOARD_HEIGHT-1)
    }
    
    // Odstranit horní zdi pro levý i pravý sloupec (průjezd shora dolů)
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        map[y][0] &= ~WALL_TOP;                     // levý sloupec (index 0)
        map[y][BOARD_WIDTH - 1] &= ~WALL_TOP;       // pravý sloupec (index BOARD_WIDTH-1)
    }
    
    // Připojit rohy - odstranit obě zdi v rozích
    map[0][0] &= ~(WALL_LEFT | WALL_TOP);                                   // levý horní
    map[0][BOARD_WIDTH - 1] &= ~WALL_TOP;                                   // pravý horní
    map[BOARD_HEIGHT - 1][0] &= ~WALL_LEFT;                                 // levý spodní
    map[BOARD_HEIGHT - 1][BOARD_WIDTH - 1] &= ~(WALL_LEFT | WALL_TOP);      // pravý spodní
}

// Krok 4: Přidání spawn pointů a domku duchů
function addSpawnPoints(map) {
    // PacMan spawn - náhodně v dolní polovině
    let pacX, pacY;
    const centerX = Math.floor(BOARD_WIDTH / 2);
    const centerY = Math.floor(BOARD_HEIGHT / 2);
    
    do {
        pacX = Math.floor(Math.random() * (BOARD_WIDTH - 2)) + 1;
        pacY = Math.floor(Math.random() * 3) + (BOARD_HEIGHT - 4);
    } while (Math.abs(pacX - centerX) <= 2 && Math.abs(pacY - centerY) <= 2);
    
    map[pacY][pacX] |= PACMAN_SPAWN;
    
    // Domeček duchů uprostřed 3x3
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const x = centerX + dx;
            const y = centerY + dy;
            
            if (x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT) {
                // Zdi kolem domečku
                if (dy === -1) map[y][x] |= WALL_TOP;
                if (dx === -1) map[y][x] |= WALL_LEFT;
                if (dy === 1 && y + 1 < BOARD_HEIGHT) map[y + 1][x] |= WALL_TOP;
                if (dx === 1 && x + 1 < BOARD_WIDTH) map[y][x + 1] |= WALL_LEFT;
            }
        }
    }
    
    // Výjezd nahoru - odstranit horní zeď uprostřed
    map[centerY - 1][centerX] &= ~WALL_TOP;
    
    // Ghost spawny
    map[centerY][centerX] |= GHOST_SPAWN;
    if (centerX - 1 >= 0) map[centerY][centerX - 1] |= GHOST_SPAWN;
    if (centerX + 1 < BOARD_WIDTH) map[centerY][centerX + 1] |= GHOST_SPAWN;
    if (centerY + 1 < BOARD_HEIGHT) map[centerY + 1][centerX] |= GHOST_SPAWN;
    
    return { pacX, pacY, ghostX: centerX, ghostY: centerY - 1 };
}

// Přidání teček
function addDots(map, pacX, pacY) {
    const visited = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(false));
    const queue = [[pacX, pacY]];
    visited[pacY][pacX] = true;
    
    while (queue.length > 0) {
        const [x, y] = queue.shift();
        
        // Přidat tečku pokud není spawn point
        if (!(map[y][x] & PACMAN_SPAWN) && !(map[y][x] & GHOST_SPAWN)) {
            map[y][x] |= DOT;
        }
        
        // Kontrola všech směrů
        if (canMove(map, x, y, 'UP') && y > 0 && !visited[y-1][x]) {
            visited[y-1][x] = true;
            queue.push([x, y-1]);
        }
        if (canMove(map, x, y, 'DOWN') && y < BOARD_HEIGHT-1 && !visited[y+1][x]) {
            visited[y+1][x] = true;
            queue.push([x, y+1]);
        }
        if (canMove(map, x, y, 'LEFT') && x > 0 && !visited[y][x-1]) {
            visited[y][x-1] = true;
            queue.push([x-1, y]);
        }
        if (canMove(map, x, y, 'RIGHT') && x < BOARD_WIDTH-1 && !visited[y][x+1]) {
            visited[y][x+1] = true;
            queue.push([x+1, y]);
        }
    }
    
    // Power pellety v rozích
    const corners = [
        [1, 1],
        [BOARD_WIDTH-2, 1],
        [1, BOARD_HEIGHT-2],
        [BOARD_WIDTH-2, BOARD_HEIGHT-2]
    ];
    
    for (const [x, y] of corners) {
        if (visited[y][x] && !(map[y][x] & GHOST_SPAWN) && !(map[y][x] & PACMAN_SPAWN)) {
            map[y][x] |= POWER_PELLET;
            map[y][x] &= ~DOT;
        }
    }
    
    // Označit nedostupná místa
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (!visited[y][x]) {
                map[y][x] |= 64;
            }
        }
    }
}

function canMove(map, fromX, fromY, direction) {
    const cell = map[fromY][fromX];
    
    switch(direction) {
        case 'UP':
            return !(cell & WALL_TOP);
            
        case 'DOWN':
            if (fromY + 1 >= BOARD_HEIGHT) return false;
            return !(map[fromY + 1][fromX] & WALL_TOP);
            
        case 'LEFT':
            return !(cell & WALL_LEFT);
            
        case 'RIGHT':
            if (fromX + 1 >= BOARD_WIDTH) return false;
            return !(map[fromY][fromX + 1] & WALL_LEFT);
    }
    return false;
}

// Hlavní funkce generování
function generateMap() {
    // Krok 1: Náhodné zdi
    let map = generateRandomWalls();
    
    // Krok 2: Uzavřít okraje
    sealBorders(map);
    
    // Krok 3: Spawn pointy
    const { pacX, pacY, ghostX, ghostY } = addSpawnPoints(map);
    
    // Krok 4: Zkontrolovat dostupnost a případně probourat cesty
    breakPathToPerimeter(map, pacX, pacY);
    breakPathToPerimeter(map, ghostX, ghostY);
    
    // Krok 5: Opravit slepé uličky
    fixDeadEnds(map);
    
    // Krok 6: Okrajová cesta (po všech úpravách, aby zůstala neporušená)
    createPerimeterPath(map);
    
    // Krok 7: Přidat tečky
    addDots(map, pacX, pacY);
    
    return map;
}