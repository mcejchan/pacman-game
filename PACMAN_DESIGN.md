# PacMan - Herní design

## Základní funkcionalita

### 1. Herní pole a mapa
- 2D mřížka s pevnými rozměry (19x21 buněk)
- Elementy mapy:
  - Zdi (neprůchodné)
  - Cesty (průchodné)
  - Tečky k sebrání (malé body)
  - Power pellety (velké body)
  - Spawn pozice pro PacMana
  - Spawn pozice pro duchy (domeček duchů)

### 2. PacMan (hráč)
- Ovládání: šipky nebo WASD klávesy
- Animace otáčení úst podle směru pohybu
- Kolize se zdmi (nemůže projít)
- Sbírání teček a power pelletů
- Teleportace přes okraje mapy (tunel)

#### Rychlost PacMana:
- **Při žrání teček**: O 10% pomalejší než základní rychlost (duchové ho dohánějí)
- **Na vyčištěné ploše**: O 10% rychlejší než základní rychlost (uteče duchům)
- **Základní rychlost**: Referenční rychlost pro výpočet rychlosti duchů

### 3. Duchové (4 kusy)

#### Základní chování duchů:
1. **Náhodný pohyb**: Duchové se pohybují náhodně po mapě
2. **Zákaz otáčení o 180°**: Duch se nikdy nesmí otočit zpět (z severu na jih, z východu na západ, atd.)
3. **Nutnost využití cest**: Když se chce duch otočit, musí najít cestu (křižovatku) a vrátit se na původní místo z jiného směru

#### Chování při detekci hráče:
1. **Detekce hráče**: Duch "vidí" hráče, pokud:
   - Je s ním v horizontální NEBO vertikální rovině
   - Mezi nimi není překážka (zeď)
2. **Pronásledování**: Jakmile duch uvidí hráče, vydá se za ním (pokud to neporušuje pravidlo o otáčení o 180°)
3. **Ztráta cíle**: Pokud se hráč ztratí z dohledu (není v rovině nebo je mezi nimi zeď), duch "zapomene" na hráče a vrací se k náhodnému pohybu

#### Módy duchů:
- **Normal mode**: Standardní chování (náhodný pohyb + pronásledování)
- **Frightened mode**: Po snězení power pelletu - duchové utíkají od hráče a lze je sníst

### 4. Herní logika

#### Bodování:
- Malá tečka: 10 bodů
- Power pellet: 50 bodů
- Duch (ve frightened mode): 200/400/800/1600 bodů (postupně)

#### Systém životů:
- Hráč začína s 3 životy
- Ztráta života při kontaktu s duchem (v normal mode)
- Game over při ztrátě všech životů

#### Levely:
- Postupné zvyšování obtížnosti
- Změna rychlosti pohybu
- Změna délky frightened mode

### 5. Grafika a vizuál
- Sprite animace pro PacMana (otáčení úst)
- Barevní duchové (4 různé barvy)
- Jednoduchá 2D mapa
- Animace sbírání teček
- Vizuální indikace frightened mode (blikající duchové)

### 6. Technická implementace
- **HTML**: Základní struktura stránky
- **CSS**: Styling, animace, layout
- **JavaScript**: Herní logika, pohyb, kolize
- **Vykreslování**: Canvas nebo CSS Grid
- **Framerate**: 60 FPS nebo podle možností prohlížeče

## Struktura souborů
```
/
├── index.html      # Hlavní HTML soubor
├── style.css       # CSS styly a animace
├── script.js       # Herní logika
└── assets/         # Obrázky, zvuky (volitelné)
```

## Ovládání
- **Šipky** nebo **WASD**: Pohyb PacMana
- **Mezerník**: Pauza hry (volitelné)
- **R**: Restart hry (volitelné)