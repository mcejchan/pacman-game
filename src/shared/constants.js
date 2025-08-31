export const GAME_CONFIG = {
    CANVAS: {
        WIDTH: 570,  // 19 * 30
        HEIGHT: 630  // 21 * 30
    },
    
    MAP: {
        TILE_SIZE: 30,
        WIDTH: 19,
        HEIGHT: 21,
        TILES: {
            WALL: 1,
            DOT: 0,
            EMPTY: 2,
            POWER_PELLET: 3,
            PLAYER_START: 'P',
            GHOST_START: 'G'
        }
    },
    
    PLAYER: {
        SIZE: 20,
        BASE_SPEED: 120, // pixels per second
        EATING_SPEED_MODIFIER: 0.9,
        EMPTY_PATH_SPEED_MODIFIER: 1.1
    },
    
    GHOSTS: {
        SIZE: 20,
        BASE_SPEED: 120, // pixels per second
        FRIGHTENED_SPEED_MODIFIER: 0.7,
        FRIGHTENED_DURATION: 7000, // milliseconds
        SIGHT_DISTANCE: 150,
        SIGHT_TOLERANCE: 15
    },
    
    COLORS: {
        PLAYER: '#FFFF00',
        GHOST_RED: '#FF0000',
        GHOST_PINK: '#FFB8FF',
        GHOST_CYAN: '#00FFFF', 
        GHOST_ORANGE: '#FFB852',
        FRIGHTENED_GHOST: '#0000FF',
        FRIGHTENED_GHOST_FLASH: '#FFFFFF',
        WALL: '#0000FF',
        DOT: '#FFFF00',
        POWER_PELLET: '#FFFF00'
    },
    
    SCORING: {
        DOT: 10,
        POWER_PELLET: 50,
        GHOST: 200
    },
    
    DIRECTIONS: {
        UP: { x: 0, y: -1, name: 'up' },
        DOWN: { x: 0, y: 1, name: 'down' },
        LEFT: { x: -1, y: 0, name: 'left' },
        RIGHT: { x: 1, y: 0, name: 'right' }
    }
};