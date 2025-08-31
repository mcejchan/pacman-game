# Player Movement Testing Guide

## Současné testy a jejich limity

### 1. Aktuální Jest testy (`tests/game/player-movement.test.js`)

**Celkem 11 testů:**

1. **Player creation test** ✅
   - Testuje základní vytvoření playera s validní pozicí

2. **Full grid movement test** ✅ 
   - Player se pohybuje o celé políčko doprava
   - **Limit**: Testuje pouze ideální podmínky bez překážek

3. **Continuous movement sequence** ✅
   - Testuje sérii pohybů bez zaseknutí
   - **Limit**: Používá mock hasWall, neodpovídá skutečné mapě

4. **Rapid key presses** ✅
   - Testuje rychlé stisky kláves
   - **Limit**: Kontroluje pouze že se player pohnul, ne jak přesně

5. **Consistent speed** ✅
   - Testuje konstantní rychlost pohybu
   - **Limit**: Mock prostředí, ne reálná hra

6. **Direction change mid-movement** ✅
   - Testuje změnu směru během pohybu
   - **Limit**: Ideální podmínky bez zdí

7. **Wall collisions without getting stuck** ✅
   - Základní test kolize se zdí
   - **Limit**: Starý test, neodhaluje overshoot problém

8. **Move completely to wall edge (horizontal)** ✅
   - Test horizontálního pohybu ke zdi
   - **Nově opravený**: Očekává zastavení na okraji políčka

9. **Move completely to wall edge (left)** ✅
   - Test pohybu vlevo ke zdi
   - **Nově opravený**: Očekává zastavení na okraji políčka

10. **Smooth wall collision (no overshoot)** ✅
    - **Nový test**: Detekuje overshoot a jump-back glitch
    - Testuje že player nepřekročí zeď o více než tolerance
    - Detekuje skoky zpět větší než 2x rychlost

11. **Stop smoothly without position jumps** ✅
    - **Nový test**: Detekuje neplynulé pohyby
    - Testuje že nejsou velké skoky zpět v pozici

### 2. Problémy s aktuálním testováním

#### A) Mock vs Reality Gap
```javascript
// Testy používají zjednodušený mock:
const mockHasWall = (x, y, direction) => {
    if (direction === 'RIGHT' && x === 2 && y === 5) return true;
    return false;
};

// Skutečná hra používá komplexní bit-flag logiku:
return (this.gameMap[y][x + 1] & GAME_CONFIG.MAP.WALL_LEFT) !== 0;
```

#### B) Chybí reálné mapové data
- Testy nepoužívají skutečnou mapu s bit-flagy
- Neodhalují problémy s konkrétními buňkami mapy
- Mock má jen jednu zeď, skutečná mapa má stovky

#### C) Časování a framerate
- Testy nerespektují game loop timing (16ms frames)
- Všechny update() volání jsou synchronní
- Skutečná hra má ~60fps s deltaTime

#### D) UI a vizuální feedback
- Testy nevidí canvas rendering
- Nelze detekovat vizuální glitche "očima"
- Žádná interakce s klávesnicí/eventlisteners

## 3. Navržené vylepšení lokálního testování

### A) Vytvoření debug HTML stránky
```html
<!-- debug-player-movement.html -->
<canvas id="debugCanvas" width="800" height="600"></canvas>
<div id="debugInfo">
  <p>Position: <span id="position"></span></p>
  <p>Grid: <span id="grid"></span></p>
  <p>Direction: <span id="direction"></span></p>
  <p>Speed: <span id="speed"></span></p>
</div>
<div id="controls">
  <button onclick="testWallCollision()">Test Wall Collision</button>
  <button onclick="testOvershoot()">Test Overshoot Scenario</button>
</div>
```

### B) Přidání debug metod do Player třídy
```javascript
export class Player {
    // ... existující kód
    
    getDebugInfo() {
        return {
            pixelPos: { x: this.x, y: this.y },
            gridPos: { x: this.gridX, y: this.gridY },
            direction: this.direction,
            nextDirection: this.nextDirection,
            speed: this.speed,
            distanceFromCenter: this.getDistanceFromCellCenter()
        };
    }
    
    getDistanceFromCellCenter() {
        const centerX = this.gridX * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
        const centerY = this.gridY * GAME_CONFIG.MAP.CELL_SIZE + GAME_CONFIG.MAP.CELL_SIZE / 2;
        return {
            x: this.x - centerX,
            y: this.y - centerY
        };
    }
}
```

### C) Automated visual regression testing
```javascript
// test-visual-movement.js
function captureMovementSequence(startPos, direction, expectedStops) {
    const frames = [];
    // Zachytit každý frame pohybu
    // Detekovat vizuální skoky
    // Porovnat s expected trajectory
}
```

### D) Real-time collision testing
```javascript
// test-real-collisions.js  
function testAllWallCollisions() {
    const problematicCells = [];
    
    // Test každé buňky mapy
    for (let y = 0; y < GAME_CONFIG.MAP.BOARD_HEIGHT; y++) {
        for (let x = 0; x < GAME_CONFIG.MAP.BOARD_WIDTH; x++) {
            const cell = gameMap[y][x];
            
            // Test všech směrů pro tuto buňku
            ['UP', 'DOWN', 'LEFT', 'RIGHT'].forEach(direction => {
                if (hasWall(x, y, direction)) {
                    const result = testCollisionAtCell(x, y, direction);
                    if (result.hasOvershoot || result.hasJumpBack) {
                        problematicCells.push({x, y, direction, ...result});
                    }
                }
            });
        }
    }
    
    return problematicCells;
}
```

### E) Manual testing pomocí dev tools
```javascript
// Přidat do window pro console debugging
window.debugPlayer = {
    teleport: (x, y) => game.player.x = x, game.player.y = y,
    setDirection: (dir) => game.player.setNextDirection(dir),
    getInfo: () => game.player.getDebugInfo(),
    testWallAt: (x, y, dir) => game.hasWall(x, y, dir)
};
```

## 4. Doporučené další kroky

### Krok 1: Vytvoření debug stránky
- Jednoduchá HTML stránka s canvas
- Real-time zobrazení pozice a debug info
- Možnost testovat specifické scénáře

### Krok 2: Přidání logging do Player.js
- Dočasné console.log pro problematické oblasti
- Detekce konkrétních podmínek kdy nastává overshoot

### Krok 3: Test se skutečnou mapou
- Najít konkrétní buňky kde se problém projevuje
- Test s reálnými bit-flagy místo mocků

### Krok 4: Framerate accurate testing  
- Testování s setTimeout/requestAnimationFrame
- Zachování 16ms timing mezi updaty

### Krok 5: User acceptance testing
- Ruční testování v browseru
- Subjektivní hodnocení "cítí se správně"

## 5. Podezřelé oblasti ke kontrole

1. **Tunnel wrapping logic** (řádky 113-120 v player.js)
   - Může interferovat s wall collision
   
2. **Grid calculation precision** 
   - `Math.round()` vs `Math.floor()`/`Math.ceil()`
   
3. **Speed variability**
   - `EATING_SPEED` vs `EMPTY_SPEED` vs `BASE_SPEED`
   
4. **Direction change timing**
   - Kdy přesně se aplikuje `nextDirection`

5. **HasWall bit-flag logic**
   - `WALL_LEFT` vs `WALL_RIGHT` semantika
   - Edge case handling na okrajích mapy