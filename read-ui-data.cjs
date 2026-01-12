// Read UI data from Helio app via Chrome DevTools Protocol
const WebSocket = require('ws');

// Get page ID from command line or use default
const pageId = process.argv[2] || 'B36C08397EFC88D76755647A6ACDF94E';
const wsUrl = `ws://localhost:9222/devtools/page/${pageId}`;

async function readUIData() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const results = {};
    let messageId = 1;
    
    ws.on('open', () => {
      console.log('✅ Connected to Helio WebView');
      
      // Get all visible text from the page
      ws.send(JSON.stringify({
        id: messageId++,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            // Get key data from the UI
            const getText = (selector) => {
              const el = document.querySelector(selector);
              return el ? el.textContent.trim() : null;
            };
            
            // Get all text content from page
            const allText = document.body.innerText;
            
            // Try to find specific values
            const stepMatch = allText.match(/(\\d{1,3}(?:,\\d{3})*|\\d+)\\s*(?:steps|Steps)/);
            const levelMatch = allText.match(/Level\\s*(\\d+)/i);
            const streakMatch = allText.match(/(\\d+)\\s*(?:Day\\s*Streak|day streak)/i);
            const xpMatch = allText.match(/(\\d+)\\s*XP/i);
            const scoreMatch = allText.match(/Health\\s*Score[:\\s]*(\\d+)/i);
            const waterMatch = allText.match(/(\\d+)\\/8/);
            
            JSON.stringify({
              pageTitle: document.title,
              steps: stepMatch ? stepMatch[1] : 'not found',
              level: levelMatch ? levelMatch[1] : 'not found',
              streak: streakMatch ? streakMatch[1] : 'not found',
              xp: xpMatch ? xpMatch[1] : 'not found',
              healthScore: scoreMatch ? scoreMatch[1] : 'not found',
              water: waterMatch ? waterMatch[1] : 'not found',
              textSample: allText.substring(0, 2000)
            });
          `,
          returnByValue: true
        }
      }));
    });
    
    ws.on('message', (data) => {
      const response = JSON.parse(data);
      if (response.result && response.result.result) {
        const value = response.result.result.value;
        try {
          const parsed = JSON.parse(value);
          console.log('\n📱 UI DATA FROM HELIO APP:');
          console.log('═══════════════════════════════════════');
          console.log('Page Title:', parsed.pageTitle);
          console.log('Steps:', parsed.steps);
          console.log('Level:', parsed.level);
          console.log('Streak:', parsed.streak);
          console.log('XP:', parsed.xp);
          console.log('Health Score:', parsed.healthScore);
          console.log('Water:', parsed.water);
          console.log('\n📄 RAW TEXT SAMPLE:');
          console.log('───────────────────────────────────────');
          console.log(parsed.textSample);
          console.log('═══════════════════════════════════════');
          
          results.data = parsed;
        } catch (e) {
          console.log('Raw value:', value);
          results.raw = value;
        }
        ws.close();
        resolve(results);
      }
    });
    
    ws.on('error', (err) => {
      console.error('❌ WebSocket error:', err.message);
      reject(err);
    });
    
    ws.on('close', () => {
      console.log('Connection closed');
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      ws.close();
      reject(new Error('Timeout'));
    }, 10000);
  });
}

readUIData()
  .then(results => {
    console.log('\n✅ UI DATA EXTRACTION COMPLETE');
  })
  .catch(err => {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  });
