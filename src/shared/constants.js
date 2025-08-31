export const GAME_CONFIG = {
    CANVAS: {
        WIDTH: 570,  // (19-1) * 30
        HEIGHT: 600  // (21-1) * 30
    },
    
    MAP: {
        CELL_SIZE: 30,
        BOARD_WIDTH: 19,
        BOARD_HEIGHT: 21,
        // Bit flags for map elements
        WALL_TOP: 1,
        WALL_LEFT: 2,
        DOT: 4,
        POWER_PELLET: 8,
        PACMAN_SPAWN: 16,
        GHOST_SPAWN: 32
    },
    
    PLAYER: {
        BASE_SPEED: 2,
        EATING_SPEED: 1.8,  // BASE_SPEED * 0.9
        EMPTY_SPEED: 2.2,   // BASE_SPEED * 1.1
        SIZE: 0.4           // Multiplier for CELL_SIZE
    },
    
    GHOSTS: {
        NORMAL_SPEED: 2,
        FRIGHTENED_SPEED: 1.2,  // BASE_SPEED * 0.6
        FRIGHTENED_DURATION: 600, // frames (10 seconds at 60fps)
        SIZE: 0.4,              // Multiplier for CELL_SIZE
        COLORS: ['#ff0000', '#00ffff', '#ffb8ff', '#ffb852']
    },
    
    COLORS: {
        BACKGROUND: '#000',
        WALL: '#2121ff',
        DOT: '#ffb897',
        POWER_PELLET: '#ffb897',
        PLAYER: '#ffff00',
        FRIGHTENED_GHOST: '#2121ff',
        FRIGHTENED_GHOST_FLASH: '#ffffff'
    },
    
    SCORING: {
        DOT: 10,
        POWER_PELLET: 50,
        GHOST_BASE: 200
    },
    
    DIRECTIONS: {
        UP: { x: 0, y: -1, opposite: 'DOWN' },
        DOWN: { x: 0, y: 1, opposite: 'UP' },
        LEFT: { x: -1, y: 0, opposite: 'RIGHT' },
        RIGHT: { x: 1, y: 0, opposite: 'LEFT' }
    }
};