# PacMan Level Generator

Náhodný generátor levelů pro PacMan hru s pokročilými algoritmy pro vytváření hratelných labyrintů.

## Struktura souborů

```
generator/
├── index.html          # Hlavní HTML soubor
├── css/
│   └── generator.css   # Styly pro vizualizaci
├── js/
│   ├── constants.js    # Konstanty a konfigurace
│   ├── mapGeneration.js # Algoritmy generování mapy
│   ├── pathfinding.js  # Algoritmy pathfindingu a oprav
│   ├── rendering.js    # Vykreslování a export
│   └── main.js         # Hlavní logika aplikace
└── README.md           # Tento soubor

```

## Funkce generátoru

### Algoritmus generování

1. **Náhodné zdi** - Základní náhodné rozmístění zdí
2. **Uzavření okrajů** - Vytvoření hranic mapy
3. **Okrajová cesta** - Zajištění průchodnosti po obvodu
4. **Spawn pointy** - Umístění startovních pozic pro PacMana a duchy
5. **Ověření dostupnosti** - Kontrola a oprava nedostupných oblastí
6. **Oprava slepých uliček** - Eliminace příliš malých uzavřených prostor
7. **Přidání teček** - Rozmístění bodů ke sbírání

### Bitová reprezentace

- `WALL_TOP = 1` - Zeď nahoře
- `WALL_LEFT = 2` - Zeď vlevo  
- `DOT = 4` - Tečka
- `POWER_PELLET = 8` - Power pellet
- `PACMAN_SPAWN = 16` - Spawn point PacMana
- `GHOST_SPAWN = 32` - Spawn point duchů

### Vizuální prvky

- **Modré zdi** - Hranice labyrintu
- **Žluté tečky** - Sbírací body
- **Pulsující power pellety** - Speciální bonusy
- **Barevné spawn zóny** - Startovní pozice
- **Červené oblasti** - Nedostupná místa (debug)

## Použití

1. Otevřít `index.html` v prohlížeči
2. Kliknout na "Generovat novou mapu"
3. Zkopírovat vygenerovaný JavaScript kód
4. Použít konstanty v hlavní hře

## Konfigurace

V `constants.js` lze upravit:
- `BOARD_WIDTH/HEIGHT` - Rozměry mapy
- `WALL_PROBABILITY` - Hustota zdí
- `CELL_SIZE` - Velikost buněk pro vykreslení