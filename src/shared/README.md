# Shared Components

Sdílené komponenty a konstanty používané napříč celým projektem.

## Soubory

- `constants.js` - Herní konstanty (rozměry, rychlosti, časování)
- `mapData.js` - Výchozí mapa PacMan hry

## Použití

```javascript
import { CELL_SIZE, DIRECTIONS } from './constants.js';
import { MAP } from './mapData.js';
```

## Konstanty

- `CELL_SIZE` - Velikost jedné buňky v pixelech (30px)
- `BOARD_WIDTH/HEIGHT` - Rozměry herní plochy (19x21)
- `PACMAN_SPEED/GHOST_SPEED` - Rychlosti pohybu (2px/frame)
- `DIRECTIONS` - Objekt se směrovými vektory
- `FRIGHTENED_DURATION` - Doba trvání frightened módu (7s)

## Mapová data

Mapa je 2D pole kde:
- `1` = zeď
- `0` = cesta s tečkou
- `2` = prázdná cesta
- `3` = power pellet