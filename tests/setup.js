// Global test setup pro JSDOM
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock Canvas API pro JSDOM
global.HTMLCanvasElement.prototype.getContext = function(contextType) {
  if (contextType === '2d') {
    return {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '10px Arial',
      textAlign: 'left',
      textBaseline: 'top',
      
      // Drawing methods
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      clearRect: jest.fn(),
      fillText: jest.fn(),
      strokeText: jest.fn(),
      
      // Path methods
      beginPath: jest.fn(),
      closePath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      arc: jest.fn(),
      arcTo: jest.fn(),
      
      // Transform methods
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      
      // State methods
      save: jest.fn(),
      restore: jest.fn(),
      
      // Other methods
      fill: jest.fn(),
      stroke: jest.fn(),
      clip: jest.fn(),
      isPointInPath: jest.fn(() => false),
      drawImage: jest.fn(),
      createImageData: jest.fn(),
      getImageData: jest.fn(),
      putImageData: jest.fn(),
    };
  }
  return null;
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

// Mock performance.now
global.performance = {
  now: jest.fn(() => Date.now())
};

// Setup logování testů
const logDir = path.join(__dirname, '../logs/tests');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Globální test logger
global.testLogger = {
  logs: [],
  log: function(message, testName = 'general') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${testName}: ${message}`;
    this.logs.push(logEntry);
    console.log(logEntry);
  },
  
  saveToFile: function(filename) {
    const logPath = path.join(logDir, filename);
    const content = this.logs.join('\n') + '\n';
    fs.writeFileSync(logPath, content);
    this.logs = []; // Clear after save
  }
};

// Jest hooks
beforeEach(() => {
  // Reset DOM před každým testem
  document.body.innerHTML = '';
  
  // Reset mocks
  jest.clearAllMocks();
  
  // Clear console logs
  global.testLogger.logs = [];
});

afterEach(() => {
  // Cleanup after each test
  if (global.testLogger.logs.length > 0) {
    const testName = expect.getState().currentTestName || 'unknown';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    global.testLogger.saveToFile(`jest-${testName.replace(/\s+/g, '-')}-${timestamp}.log`);
  }
});

console.log('🧪 Jest setup completed with JSDOM and Canvas mocking');