// Kontrola dostupnosti pomocí flood fill
function isReachableToPerimeter(map, startX, startY) {
    const visited = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(false));
    const queue = [[startX, startY]];
    visited[startY][startX] = true;
    
    while (queue.length > 0) {
        const [x, y] = queue.shift();
        
        // Kontrola, zda jsme dosáhli okrajové cesty (pozice 0 a BOARD_WIDTH-1/BOARD_HEIGHT-1)
        if (x === 0 || x === BOARD_WIDTH - 1 || y === 0 || y === BOARD_HEIGHT - 1) {
            return true;
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
    
    return false;
}

// Probourat cestu k okraji
function breakPathToPerimeter(map, startX, startY) {
    const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    let attempts = 0;
    
    while (!isReachableToPerimeter(map, startX, startY) && attempts < 100) {
        // Použít BFS k nalezení nejbližší zdi k proražení
        const visited = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(false));
        const queue = [[startX, startY, []]];
        visited[startY][startX] = true;
        let wallToBreak = null;
        
        while (queue.length > 0 && !wallToBreak) {
            const [x, y, path] = queue.shift();
            
            // Zkusit všechny směry
            for (const dir of directions) {
                let nx = x, ny = y;
                switch(dir) {
                    case 'UP': ny--; break;
                    case 'DOWN': ny++; break;
                    case 'LEFT': nx--; break;
                    case 'RIGHT': nx++; break;
                }
                
                if (nx >= 0 && nx < BOARD_WIDTH && ny >= 0 && ny < BOARD_HEIGHT) {
                    if (!canMove(map, x, y, dir)) {
                        // Našli jsme zeď - zkontrolovat, jestli vede k novému prostoru
                        if (!visited[ny] || !visited[ny][nx]) {
                            wallToBreak = { x, y, dir };
                            break;
                        }
                    } else if (!visited[ny][nx]) {
                        visited[ny][nx] = true;
                        queue.push([nx, ny, [...path, {x, y, dir}]]);
                    }
                }
            }
        }
        
        // Prorazit zeď
        if (wallToBreak) {
            switch(wallToBreak.dir) {
                case 'UP':
                    map[wallToBreak.y][wallToBreak.x] &= ~WALL_TOP;
                    break;
                case 'DOWN':
                    if (wallToBreak.y + 1 < BOARD_HEIGHT) 
                        map[wallToBreak.y + 1][wallToBreak.x] &= ~WALL_TOP;
                    break;
                case 'LEFT':
                    map[wallToBreak.y][wallToBreak.x] &= ~WALL_LEFT;
                    break;
                case 'RIGHT':
                    if (wallToBreak.x + 1 < BOARD_WIDTH) 
                        map[wallToBreak.y][wallToBreak.x + 1] &= ~WALL_LEFT;
                    break;
            }
        }
        
        attempts++;
    }
}

// Detekce a oprava slepých uliček
function fixDeadEnds(map) {
    // Najít všechny oblasti pomocí flood fill
    const visited = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(false));
    const regions = [];
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (!visited[y][x]) {
                const region = floodFillRegion(map, x, y, visited);
                if (region.cells.length > 0) {
                    regions.push(region);
                }
            }
        }
    }
    
    // Pro každou oblast zkontrolovat počet vstupů
    for (const region of regions) {
        if (region.cells.length >= 3 && region.cells.length < 30) {
            const entries = countRegionEntries(map, region);
            
            if (entries.length === 1) {
                // Slepá ulička - probourat náhodnou zeď
                breakRandomWallInRegion(map, region);
            }
        }
    }
}

function floodFillRegion(map, startX, startY, visited) {
    const region = { cells: [], borders: [] };
    const queue = [[startX, startY]];
    visited[startY][startX] = true;
    
    while (queue.length > 0) {
        const [x, y] = queue.shift();
        region.cells.push({ x, y });
        
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
            
            if (canMove(map, x, y, dir)) {
                if (nx >= 0 && nx < BOARD_WIDTH && ny >= 0 && ny < BOARD_HEIGHT && !visited[ny][nx]) {
                    visited[ny][nx] = true;
                    queue.push([nx, ny]);
                }
            } else {
                // Zeď - přidat do seznamu hranic
                region.borders.push({ x, y, dir });
            }
        }
    }
    
    return region;
}

function countRegionEntries(map, region) {
    const entries = [];
    const cellSet = new Set(region.cells.map(c => `${c.x},${c.y}`));
    
    for (const border of region.borders) {
        let nx = border.x, ny = border.y;
        
        switch(border.dir) {
            case 'UP': ny--; break;
            case 'DOWN': ny++; break;
            case 'LEFT': nx--; break;
            case 'RIGHT': nx++; break;
        }
        
        // Pokud soused není v regionu, je to vstup
        if (nx >= 0 && nx < BOARD_WIDTH && ny >= 0 && ny < BOARD_HEIGHT) {
            if (!cellSet.has(`${nx},${ny}`)) {
                entries.push(border);
            }
        }
    }
    
    return entries;
}

function breakRandomWallInRegion(map, region) {
    if (region.borders.length === 0) return;
    
    // Vybrat náhodnou zeď k proboření
    const wall = region.borders[Math.floor(Math.random() * region.borders.length)];
    
    switch(wall.dir) {
        case 'UP':
            map[wall.y][wall.x] &= ~WALL_TOP;
            break;
        case 'DOWN':
            if (wall.y + 1 < BOARD_HEIGHT) 
                map[wall.y + 1][wall.x] &= ~WALL_TOP;
            break;
        case 'LEFT':
            map[wall.y][wall.x] &= ~WALL_LEFT;
            break;
        case 'RIGHT':
            if (wall.x + 1 < BOARD_WIDTH) 
                map[wall.y][wall.x + 1] &= ~WALL_LEFT;
            break;
    }
}