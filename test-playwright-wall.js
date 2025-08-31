import { chromium } from 'playwright';

async function testWallCollision() {
    console.log('🎮 Starting Playwright Wall Collision Test');
    
    // Launch browser
    const browser = await chromium.launch({ 
        headless: false,  // Set to true for headless
        slowMo: 100       // Slow down actions for better debugging
    });
    
    const page = await browser.newPage();
    
    // Listen to console messages from the page
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('🚀') || text.includes('🔴') || text.includes('🛑') || text.includes('🟢') || text.includes('🟡')) {
            console.log(`PAGE LOG: ${text}`);
        }
    });
    
    try {
        console.log('📡 Navigating to game...');
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
        
        // Wait for game to load
        await page.waitForSelector('#gameCanvas', { timeout: 10000 });
        console.log('✅ Game loaded');
        
        // Wait a bit for game initialization
        await page.waitForTimeout(2000);
        
        // Get initial debug info
        const debugInfo = await page.evaluate(() => {
            const debugPanel = document.getElementById('debugPanel');
            return debugPanel ? debugPanel.innerText : 'No debug panel found';
        });
        console.log('📊 Initial debug info:', debugInfo);
        
        // Get red debug box info
        const redBoxInfo = await page.evaluate(() => {
            const redBox = document.getElementById('debugConsoleReplace');
            return redBox ? redBox.innerHTML : 'No red box found';
        });
        console.log('🔴 Red debug box:', redBoxInfo);
        
        console.log('🎯 Starting movement test - pressing LEFT key...');
        
        // Simulate movement - press LEFT key multiple times
        for (let i = 0; i < 10; i++) {
            await page.keyboard.press('ArrowLeft');
            await page.waitForTimeout(100);
            
            // Check position after each key press
            const position = await page.evaluate(() => {
                const posEl = document.getElementById('debugPosition');
                const dirEl = document.getElementById('debugDirection');
                const wallsEl = document.getElementById('debugWalls');
                const collisionEl = document.getElementById('debugLastCollision');
                
                return {
                    position: posEl ? posEl.textContent : 'N/A',
                    direction: dirEl ? dirEl.textContent : 'N/A', 
                    walls: wallsEl ? wallsEl.textContent : 'N/A',
                    collision: collisionEl ? collisionEl.textContent : 'N/A'
                };
            });
            
            console.log(`Step ${i + 1}:`, position);
            
            // If we detect collision, stop
            if (position.collision && !position.collision.includes('null')) {
                console.log('🛑 Collision detected, stopping test');
                break;
            }
        }
        
        // Get final debug info
        const finalDebugInfo = await page.evaluate(() => {
            const debugPanel = document.getElementById('debugPanel');
            const redBox = document.getElementById('debugConsoleReplace');
            
            return {
                debugPanel: debugPanel ? debugPanel.innerText : 'No debug panel found',
                redBox: redBox ? redBox.innerHTML.split('<br>').slice(0, 5).join('\\n') : 'No red box found',
                consoleOutput: 'Check browser console for detailed logs'
            };
        });
        
        console.log('\n📋 FINAL RESULTS:');
        console.log('================');
        console.log('Debug Panel:', finalDebugInfo.debugPanel);
        console.log('\nRed Box (last 5 updates):', finalDebugInfo.redBox);
        
        // Take a screenshot for visual verification
        await page.screenshot({ path: 'wall-collision-test.png', fullPage: true });
        console.log('📸 Screenshot saved as wall-collision-test.png');
        
        // Keep browser open for manual inspection
        console.log('\n🔍 Browser will stay open for 30 seconds for manual inspection...');
        await page.waitForTimeout(30000);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
        console.log('🏁 Test completed');
    }
}

// Run the test
testWallCollision().catch(console.error);