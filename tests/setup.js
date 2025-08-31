// Jest setup file for ES6 modules and JSDOM environment
import { TextEncoder, TextDecoder } from 'util';

// Polyfills for JSDOM
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window.requestAnimationFrame and cancelAnimationFrame  
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock performance.now
global.performance = {
  now: () => Date.now()
};