// Test AI Coach modal with duplicate render detection
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/6ACE26B58C240FEA80398840D7A0E22A');

ws.on('open', async () => {
  let id = 1;
  const send = (method, params = {}) => {
    const i = id++;
    return new Promise((res) => {
      const handler = (data) => {
        const msg = JSON.parse(data);
        if (msg.id === i) { 
          ws.removeListener('message', handler); 
          res(msg.result || msg); 
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  };
  
  try {
    await send('Runtime.enable');
    await send('Console.enable');
    
    // Collect console messages
    const consoleMessages = [];
    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.method === 'Console.messageAdded') {
        consoleMessages.push(msg.params.message.text);
      }
    });
    
    console.log('1. Clicking AI Coach button...');
    
    // Click AI Coach button (first button contains "AI Coach")
    const clickResult = await send('Runtime.evaluate', {
      expression: `
        const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('AI Coach'));
        if (btn) {
          btn.click();
          'clicked AI Coach button';
        } else {
          'button not found';
        }
      `
    });
    console.log('   Result:', clickResult.result?.value);
    
    // Wait for modal to attempt loading
    console.log('2. Waiting 3 seconds for modal...');
    await new Promise(r => setTimeout(r, 3000));
    
    // Check what rendered
    console.log('3. Checking DOM state...');
    const domCheck = await send('Runtime.evaluate', {
      expression: `
        JSON.stringify({
          // Count Suspense loading indicators
          loadingDivs: document.querySelectorAll('.modal-loading').length,
          loadingTexts: [...document.querySelectorAll('.modal-loading')].map(d => d.textContent),
          
          // Check for error boundaries triggered
          errorBoundaries: document.querySelectorAll('.error-boundary-container').length,
          errorTexts: [...document.querySelectorAll('.error-boundary-container')].map(d => d.textContent?.substring(0,100)),
          
          // Check for actual AI modal
          aiModalExists: !!document.querySelector('.ai-assistant-modal'),
          aiModalClass: document.querySelector('.ai-assistant-modal')?.className,
          
          // All modal-related elements
          allModalElements: [...document.querySelectorAll('[class*="modal"]')].map(m => ({
            tag: m.tagName,
            class: m.className?.substring(0,80),
            text: m.textContent?.substring(0,50)
          })),
          
          // Network pending - check for chunk loading
          documentReadyState: document.readyState
        }, null, 2)
      `
    });
    
    console.log('DOM STATE:');
    console.log(domCheck.result?.value);
    
    // Check console for any chunk loading errors
    console.log('\n4. Console messages during load:');
    consoleMessages.slice(-10).forEach(m => console.log('   ', m.substring(0, 150)));
    
    console.log('\n5. Closing modal...');
    await send('Runtime.evaluate', {
      expression: `
        // Try clicking close button or backdrop
        document.querySelector('.modal-close')?.click();
        document.querySelector('.modal-overlay')?.click();
        // Also try escape key
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      `
    });
    
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  ws.close();
  process.exit(0);
});

ws.on('error', e => console.error('WS Error:', e.message));
setTimeout(() => process.exit(0), 15000);
