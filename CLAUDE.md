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
├── index.html          # Main HTML file
├── style.css           # Game styling and animations
├── script.js           # Core game logic and AI
├── PACMAN_DESIGN.md    # Game design document
├── CLAUDE.md           # This configuration file
├── .gitignore          # Git ignore rules
└── .claude/            # Local Claude settings (not in git)
    └── github_token.txt # GitHub access token
```

### Game Features Implemented
- ✅ PacMan movement with WASD/Arrow keys
- ✅ 4 Ghosts with intelligent AI behavior
- ✅ Dynamic speed system (slower when eating dots, faster on empty paths)
- ✅ Power pellets and frightened ghost mode
- ✅ Collision detection and scoring system
- ✅ Multiple lives and level progression

### Development Workflow
1. **Local Development**: Edit files in this directory
2. **Testing**: Open `index.html` in browser for local testing
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
# Common git operations
git add .
git commit -m "Description"
git push origin main

# Running local server (if needed)
python -m http.server 8000  # or any local server

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