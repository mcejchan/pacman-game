// Herní konstanty
export const CELL_SIZE = 30;
export const BOARD_WIDTH = 19;
export const BOARD_HEIGHT = 21;
export const PACMAN_SPEED = 2;
export const GHOST_SPEED = 2;
export const FRIGHTENED_DURATION = 7000;
export const FRIGHTENED_END_WARNING = 2000;

// Směry
export const DIRECTIONS = {
    UP: { x: 0, y: -1, name: 'up' },
    DOWN: { x: 0, y: 1, name: 'down' },
    LEFT: { x: -1, y: 0, name: 'left' },
    RIGHT: { x: 1, y: 0, name: 'right' }
};