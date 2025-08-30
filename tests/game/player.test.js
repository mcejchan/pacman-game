// Testy pro PacMan třídu
import { PacMan } from '../../src/game/js/player.js';
import { DIRECTIONS } from '../../src/shared/constants.js';

describe('PacMan Class Tests', () => {
  let mockGameBoard, mockMap, mockCallbacks;
  let pacman;

  beforeEach(() => {
    global.testLogger.log('=== Setting up PacMan test ===', 'player.test');
    
    // Mock game board element
    mockGameBoard = {
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      querySelector: jest.fn(),
      style: {}
    };

    // Mock mapy - jednoduchá 5x5 mapa bez zdí
    mockMap = [
      [4, 4, 4, 4, 4],  // řádek 0: samé tečky
      [4, 0, 0, 0, 4],  // řádek 1: tečky po stranách
      [4, 0, 0, 0, 4],  // řádek 2: PacMan uprostřed
      [4, 0, 0, 0, 4],  // řádek 3
      [4, 4, 4, 4, 4]   // řádek 4: samé tečky
    ];

    // Mock callback funkcí
    mockCallbacks = {
      updateDotDisplay: jest.fn(),
      updateScore: jest.fn(), 
      activateFrightenedMode: jest.fn(),
      checkWin: jest.fn()
    };

    global.testLogger.log('Mock environment prepared', 'player.test');
  });

  describe('Inicializace PacMana', () => {
    test('vytvoří PacMana na správné pozici', () => {
      global.testLogger.log('Test: Vytvoření PacMana na pozici [2,2]', 'player.test');
      
      pacman = new PacMan(2, 2, mockGameBoard, mockMap, mockCallbacks);
      
      expect(pacman.x).toBe(2);
      expect(pacman.y).toBe(2);
      expect(pacman.direction).toBe(DIRECTIONS.RIGHT);
      expect(pacman.nextDirection).toBe(DIRECTIONS.RIGHT);
      
      global.testLogger.log(`✅ PacMan vytvořen: x=${pacman.x}, y=${pacman.y}, směr=${pacman.direction}`, 'player.test');
    });

    test('vytvoří DOM element při zavolání create()', () => {
      global.testLogger.log('Test: Vytvoření DOM elementu', 'player.test');
      
      pacman = new PacMan(2, 2, mockGameBoard, mockMap, mockCallbacks);
      pacman.create();
      
      expect(mockGameBoard.appendChild).toHaveBeenCalled();
      expect(pacman.element).toBeDefined();
      
      global.testLogger.log('✅ DOM element vytvořen a přidán do game board', 'player.test');
    });
  });

  describe('Pohyb PacMana', () => {
    beforeEach(() => {
      pacman = new PacMan(2, 2, mockGameBoard, mockMap, mockCallbacks);
      pacman.create();
    });

    test('změní směr pohybu', () => {
      global.testLogger.log('Test: Změna směru pohybu na LEFT', 'player.test');
      
      const originalDirection = pacman.direction;
      pacman.changeDirection(DIRECTIONS.LEFT);
      
      expect(pacman.nextDirection).toBe(DIRECTIONS.LEFT);
      global.testLogger.log(`✅ Směr změněn z ${originalDirection} na ${pacman.nextDirection}`, 'player.test');
    });

    test('pohne se doprava', () => {
      global.testLogger.log('Test: Pohyb doprava z [2,2] na [3,2]', 'player.test');
      
      const originalX = pacman.x;
      pacman.changeDirection(DIRECTIONS.RIGHT);
      pacman.move();
      
      expect(pacman.x).toBe(originalX + 1);
      expect(pacman.y).toBe(2);
      
      global.testLogger.log(`✅ PacMan se posunul z [${originalX},2] na [${pacman.x},2]`, 'player.test');
    });

    test('pohne se doleva', () => {
      global.testLogger.log('Test: Pohyb doleva z [2,2] na [1,2]', 'player.test');
      
      const originalX = pacman.x;
      pacman.changeDirection(DIRECTIONS.LEFT);
      pacman.move();
      
      expect(pacman.x).toBe(originalX - 1);
      expect(pacman.y).toBe(2);
      
      global.testLogger.log(`✅ PacMan se posunul z [${originalX},2] na [${pacman.x},2]`, 'player.test');
    });

    test('pohne se nahoru', () => {
      global.testLogger.log('Test: Pohyb nahoru z [2,2] na [2,1]', 'player.test');
      
      const originalY = pacman.y;
      pacman.changeDirection(DIRECTIONS.UP);
      pacman.move();
      
      expect(pacman.x).toBe(2);
      expect(pacman.y).toBe(originalY - 1);
      
      global.testLogger.log(`✅ PacMan se posunul z [2,${originalY}] na [2,${pacman.y}]`, 'player.test');
    });

    test('pohne se dolů', () => {
      global.testLogger.log('Test: Pohyb dolů z [2,2] na [2,3]', 'player.test');
      
      const originalY = pacman.y;
      pacman.changeDirection(DIRECTIONS.DOWN);
      pacman.move();
      
      expect(pacman.x).toBe(2);
      expect(pacman.y).toBe(originalY + 1);
      
      global.testLogger.log(`✅ PacMan se posunul z [2,${originalY}] na [2,${pacman.y}]`, 'player.test');
    });
  });

  describe('Sbírání teček', () => {
    beforeEach(() => {
      // Umístit PacMana na pozici s tečkou
      pacman = new PacMan(0, 0, mockGameBoard, mockMap, mockCallbacks);
      pacman.create();
    });

    test('sebere tečku a aktualizuje skóre', () => {
      global.testLogger.log('Test: Sebrání tečky na pozici [0,0]', 'player.test');
      
      // Zkontroluj že na pozici [0,0] je tečka (hodnota 4)
      expect(mockMap[0][0]).toBe(4);
      
      // Simuluj pohyb na pozici s tečkou
      pacman.move();
      
      // Ověř že byly zavolány callback funkce
      expect(mockCallbacks.updateScore).toHaveBeenCalledWith(10);
      expect(mockCallbacks.updateDotDisplay).toHaveBeenCalledWith(0, 0);
      
      global.testLogger.log('✅ Tečka sebrána, skóre aktualizováno (+10 bodů)', 'player.test');
    });

    test('neudělá nic na prázdném políčku', () => {
      global.testLogger.log('Test: Pohyb na prázdné políčko [1,1]', 'player.test');
      
      // Přesun PacMana na prázdné políčko
      pacman = new PacMan(1, 1, mockGameBoard, mockMap, mockCallbacks);
      pacman.create();
      
      expect(mockMap[1][1]).toBe(0); // prázdné políčko
      
      pacman.move();
      
      // Callback funkce by neměly být zavolány pro prázdné políčko
      expect(mockCallbacks.updateScore).not.toHaveBeenCalled();
      expect(mockCallbacks.updateDotDisplay).not.toHaveBeenCalled();
      
      global.testLogger.log('✅ Na prázdném políčku se nestalo nic', 'player.test');
    });
  });

  describe('Kolizní detekce', () => {
    beforeEach(() => {
      // Mapa se zdí pro testování kolizí
      mockMap = [
        [0, 1, 0],  // řádek 0: zeď uprostřed (WALL_TOP)
        [2, 0, 0],  // řádek 1: zeď vlevo (WALL_LEFT) 
        [0, 0, 0]   // řádek 2: prázdný
      ];
      
      pacman = new PacMan(1, 1, mockGameBoard, mockMap, mockCallbacks);
      pacman.create();
    });

    test('zastaví se před zdí při pohybu nahoru', () => {
      global.testLogger.log('Test: Kolize se zdí při pohybu nahoru', 'player.test');
      
      const originalY = pacman.y;
      pacman.changeDirection(DIRECTIONS.UP);
      
      // Pokus o pohyb nahoru (měl by být blokován zdí)
      pacman.move();
      
      // PacMan by měl zůstat na původní pozici
      expect(pacman.y).toBe(originalY);
      
      global.testLogger.log(`✅ PacMan zablokován zdí, zůstal na pozici [1,${pacman.y}]`, 'player.test');
    });

    test('zastaví se před zdí při pohybu doleva', () => {
      global.testLogger.log('Test: Kolize se zdí při pohybu doleva', 'player.test');
      
      const originalX = pacman.x;
      pacman.changeDirection(DIRECTIONS.LEFT);
      
      // Pokus o pohyb doleva (měl by být blokován zdí)
      pacman.move();
      
      // PacMan by měl zůstat na původní pozici  
      expect(pacman.x).toBe(originalX);
      
      global.testLogger.log(`✅ PacMan zablokován zdí, zůstal na pozici [${pacman.x},1]`, 'player.test');
    });
  });

  describe('Edge cases a hranice mapy', () => {
    test('nepovolí pohyb mimo mapu', () => {
      global.testLogger.log('Test: Pohyb mimo hranice mapy', 'player.test');
      
      // PacMan na levém okraji
      pacman = new PacMan(0, 2, mockGameBoard, mockMap, mockCallbacks);
      pacman.create();
      
      const originalX = pacman.x;
      pacman.changeDirection(DIRECTIONS.LEFT);
      pacman.move();
      
      // Měl by zůstat na původní pozici (nemůže jít mimo mapu)
      expect(pacman.x).toBe(originalX);
      
      global.testLogger.log(`✅ PacMan nemůže opustit mapu, zůstal na pozici [${pacman.x},2]`, 'player.test');
    });
  });

  afterEach(() => {
    global.testLogger.log('=== PacMan test completed ===', 'player.test');
  });
});