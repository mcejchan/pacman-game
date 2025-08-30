import { generateMap } from './mapGeneration.js';
import { renderMap, displayMapData } from './rendering.js';

function generateNewMap() {
    const map = generateMap();
    renderMap(map);
    displayMapData(map);
}

// Globální export pro HTML onclick
window.generateNewMap = generateNewMap;

// První generování
generateNewMap();