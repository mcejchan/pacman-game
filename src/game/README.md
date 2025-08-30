# PacMan Game

Hlavní herní implementace PacMan hry s HTML5 Canvas a ES6 moduly.

## Struktura

- `index.html` - Hlavní HTML soubor hry
- `css/game.css` - Styly hry
- `js/` - JavaScript moduly:
  - `game.js` - Hlavní herní logika a koordinace
  - `player.js` - PacMan třída a logika hráče
  - `ghosts.js` - Ghost třída a AI duchů
  - `map.js` - Správa mapy a vykreslování
  - `script.js.backup` - Původní monolitický kód (záloha)

## Funkce

- ✅ PacMan pohyb (WASD/šipky)
- ✅ 4 duchové s inteligentní AI
- ✅ Frightened mode po snědení power pellet
- ✅ Systém životů a skóre
- ✅ Teleportace přes okraje mapy
- ✅ Detekce kolizí
- ✅ Ovládání: Pauza (mezerník), Restart (R)

## Spuštění

Otevři `index.html` v moderním prohlížeči s podporou ES6 modulů.

## Vývoj

Hra používá ES6 moduly, takže je nutné spouštět přes HTTP server nebo file:// protokol s povoleným CORS.