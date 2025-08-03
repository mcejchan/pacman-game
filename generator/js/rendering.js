function renderMap(map) {
    const display = document.getElementById('map-display');
    display.innerHTML = '';
    display.style.width = BOARD_WIDTH * CELL_SIZE + 'px';
    display.style.height = BOARD_HEIGHT * CELL_SIZE + 'px';
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.left = x * CELL_SIZE + 'px';
            cell.style.top = y * CELL_SIZE + 'px';
            
            const value = map[y][x];
            
            if (value & WALL_TOP) cell.classList.add('wall-top');
            if (value & WALL_LEFT) cell.classList.add('wall-left');
            if (value & DOT) cell.classList.add('dot');
            if (value & POWER_PELLET) cell.classList.add('power-pellet');
            if (value & 64) cell.classList.add('inaccessible');
            
            if (value & PACMAN_SPAWN) {
                cell.classList.add('pacman-spawn');
                const marker = document.createElement('span');
                marker.className = 'spawn-marker';
                marker.textContent = 'P';
                cell.appendChild(marker);
            }
            if (value & GHOST_SPAWN) {
                cell.classList.add('ghost-spawn');
                const marker = document.createElement('span');
                marker.className = 'spawn-marker';
                marker.textContent = 'G';
                cell.appendChild(marker);
            }
            
            // Vizuální okraje
            if (y === BOARD_HEIGHT - 1) {
                cell.style.borderBottom = '3px solid #00f';
            }
            if (x === BOARD_WIDTH - 1) {
                cell.style.borderRight = '3px solid #00f';
            }
            
            display.appendChild(cell);
        }
    }
}

function displayMapData(map) {
    const dataEl = document.getElementById('map-data');
    dataEl.textContent = 'const MAP = [\n';
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        dataEl.textContent += '    [';
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const value = map[y][x] & ~64;
            dataEl.textContent += value.toString().padStart(2);
            if (x < BOARD_WIDTH - 1) dataEl.textContent += ',';
        }
        dataEl.textContent += ']';
        if (y < BOARD_HEIGHT - 1) dataEl.textContent += ',';
        dataEl.textContent += '\n';
    }
    
    dataEl.textContent += '];\n\n';
    
    // Statistiky
    let dotCount = 0;
    let pelletCount = 0;
    let accessibleCount = 0;
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (map[y][x] & DOT) dotCount++;
            if (map[y][x] & POWER_PELLET) pelletCount++;
            if (!(map[y][x] & 64)) accessibleCount++;
        }
    }
    
    dataEl.textContent += `// Konstanty:\n`;
    dataEl.textContent += `// const WALL_TOP = 1, WALL_LEFT = 2, DOT = 4, POWER_PELLET = 8;\n`;
    dataEl.textContent += `// const PACMAN_SPAWN = 16, GHOST_SPAWN = 32;\n\n`;
    dataEl.textContent += `// Statistiky:\n`;
    dataEl.textContent += `// Počet teček: ${dotCount}\n`;
    dataEl.textContent += `// Počet power pelletů: ${pelletCount}\n`;
    dataEl.textContent += `// Celkem k sebrání: ${dotCount + pelletCount}\n`;
    dataEl.textContent += `// Dostupných políček: ${accessibleCount} z ${BOARD_WIDTH * BOARD_HEIGHT}\n`;
    dataEl.textContent += `// Využití plochy: ${Math.round(accessibleCount / (BOARD_WIDTH * BOARD_HEIGHT) * 100)}%\n`;
}