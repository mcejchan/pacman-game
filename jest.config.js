export default {
  // Testovací prostředí
  testEnvironment: 'jsdom',
  
  // ES modules podpora
  preset: null,
  
  // Transform nastavení pro ES modules
  transform: {},
  
  // Testovací soubory
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],
  
  // Coverage nastavení
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js'
  ],
  
  // Výstup
  verbose: true,
  
  // Setup soubory
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Module directories
  moduleDirectories: ['node_modules', 'src'],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ]
};