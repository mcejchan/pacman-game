# PacMan Game - Claude Code Configuration

## Project Overview
This is a classic PacMan game implementation using HTML5 Canvas, CSS, and JavaScript. The game features intelligent ghost AI, dynamic speed mechanics, and classic PacMan gameplay.

## Development Setup

### GitHub Configuration
- **Repository**: https://github.com/mcejchan/pacman-game
- **GitHub Pages**: https://mcejchan.github.io/pacman-game/
- **Access Token**: Located in `.claude/github_token.txt` (local only, not in git)

### Authentication
When performing git operations, use the token from `.claude/github_token.txt`:
```bash
# Token is stored locally in:
cat .claude/github_token.txt
```

### Project Structure
```
/
├── index.html              # Main HTML file (root for GitHub Pages)
├── generator.html          # Map generator (GitHub Pages accessible)
├── generator/index.html    # Legacy redirect to generator.html
├── package.json           # Node.js dependencies and scripts
├── jest.config.js         # Jest testing configuration
├── PACMAN_DESIGN.md       # Game design document
├── CLAUDE.md              # This configuration file
├── .gitignore             # Git ignore rules
├── src/                   # Source code directory
│   ├── game/              # Main PacMan game
│   │   ├── css/game.css   # Game styling and animations
│   │   └── js/            # Game modules
│   │       ├── game.js    # Main game controller
│   │       ├── player.js  # PacMan logic
│   │       ├── ghosts.js  # Ghost AI
│   │       └── map.js     # Map management
│   ├── generator/         # Map generator tool
│   │   └── js/            # Generator modules
│   └── shared/            # Shared components
│       ├── constants.js   # Game constants
│       └── mapData.js     # Map data
├── tests/                 # Test suite
│   ├── game/              # Game logic tests
│   └── generator/         # Generator tests
├── logs/                  # Test logs (git-ignored)
└── .claude/               # Local Claude settings (not in git)
    └── github_token.txt   # GitHub access token
```

### Game Features Implemented
- ✅ PacMan movement with WASD/Arrow keys
- ✅ 4 Ghosts with intelligent AI behavior
- ✅ Dynamic speed system (slower when eating dots, faster on empty paths)
- ✅ Power pellets and frightened ghost mode
- ✅ Collision detection and scoring system
- ✅ Multiple lives and level progression

### Development Workflow
1. **Local Development**: 
   - Main game: Edit files in `src/game/`
   - Generator: Edit files in `src/generator/`
   - Tests: Run `npm test` for all tests
2. **Testing**: 
   - Browser: Open root `index.html` for production version
   - Generator: Open `src/generator/index.html` for map generator
   - Unit tests: `npm test` (66 automated tests)
3. **Deployment**: `git push origin main` automatically updates GitHub Pages
4. **Live URL**: Changes appear at https://mcejchan.github.io/pacman-game/

### Mandatory Testing Protocol
**IMPORTANT**: After every code change, ALWAYS follow this sequence:
1. Run appropriate tests to verify functionality
2. Fix any errors or failing tests
3. Re-run tests until all pass
4. Only then commit and push changes

For the PacMan generator:
```bash
# Run generator tests
node test-generator.js

# Only commit if tests pass
git add .
git commit -m "Description"
git push origin main
```

### Commands to Remember
```bash
# Testing (run before commits)
npm test                    # All tests (generator + game + ghost AI)
npm run test:game           # PacMan tests only
npm run test:ghost          # Ghost AI tests only  
npm run test:generator      # Generator tests only

# Development
npm run dev                 # Serve game on localhost:8080
npm run dev:generator       # Serve generator on localhost:8081

# URLs
# Main game: https://mcejchan.github.io/pacman-game/
# Generator: https://mcejchan.github.io/pacman-game/generator.html

# Common git operations
git add .
git commit -m "Description"
git push origin main

# Cleanup
npm run clean               # Remove test logs
npm run clean:all           # Remove all logs

# Checking GitHub Pages status
curl -H "Authorization: token $(cat .claude/github_token.txt)" \
  https://api.github.com/repos/mcejchan/pacman-game/pages
```

### Ghost AI Behavior Rules
- Ghosts move randomly but cannot turn 180 degrees
- They detect player in horizontal/vertical line of sight
- When they see player, they chase (unless it violates turn rules)
- When player disappears from sight, they return to random movement
- In frightened mode (after power pellet), they flee from player

### Speed Mechanics
- **Base speed**: Reference speed for all entities
- **PacMan eating dots**: 90% of base speed (ghosts can catch up)
- **PacMan on empty paths**: 110% of base speed (faster than ghosts)
- **Ghost speed**: Always base speed (except in frightened mode)