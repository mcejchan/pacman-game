# Tests

Testovací suite pro PacMan projekt.

## Struktura

- `generator/` - Testy pro generátor map
  - `generator.test.js` - Hlavní test suite pro map generátor
  - `fixtures/` - Testovací data
- `game/` - Testy pro herní logiku (budoucí)
  - `game.test.js` - Testy herní logiky (TBD)

## Spouštění testů

```bash
# Testy generátoru
node tests/generator/generator.test.js

# Všechny testy (v budoucnu)
npm test
```

## Logy

Výstupy testů se ukládají do `logs/tests/` s timestampem:
- `generator-YYYY-MM-DD-HH-MM-SS.log`
- `game-YYYY-MM-DD-HH-MM-SS.log`

## Testovací frameworky

Aktuálně používáme vlastní testovací systém. V budoucnu plánujeme přechod na:
- Jest pro unit testy
- Cypress pro E2E testy