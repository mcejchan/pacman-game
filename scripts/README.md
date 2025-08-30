# Scripts

Build a development skripty pro PacMan projekt.

## Plánované skripty

- `build.js` - Build proces pro produkci
- `dev-server.js` - Vývojový server s live reload

## Použití

```bash
# Development server
node scripts/dev-server.js

# Production build
node scripts/build.js
```

## Build proces

Build proces bude zahrnovat:
- Minifikaci JavaScript modulů
- CSS optimalizaci
- Kopírování assets
- Generování source map
- Bundle analýzu

## Dev server

Development server poskytne:
- Live reload při změnách souborů
- HTTPS pro testování ES6 modulů
- Proxy pro API calls
- Hot module replacement