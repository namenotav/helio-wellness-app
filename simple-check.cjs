// Simple check for AI modal state
const WebSocket = require('ws');

async function check() {
  const ws = new WebSocket('ws://localhost:9222/devtools/page/6ACE26B58C240FEA80398840D7A0E22A');
  
  return new Promise((resolve) => {
    let id = 1;
    const pending = new Map();
    let done = false;
    
    ws.on('open', async () => {
      const send = (method, params = {}) => {
        const i = id++;
        return new Promise((res) => {
          pending.set(i, res);
          ws.send(JSON.stringify({ id: i, method, params }));
        });
      };
      
      try {
        // Enable console
        await send('Runtime.enable');
        
        // Click Home tab
        await send('Runtime.evaluate', { expression: `document.querySelector('button.nav-item')?.click()` });
        await new Promise(r => setTimeout(r, 500));
        
        // Click AI Coach
        const clickResult = await send('Runtime.evaluate', { 
          expression: `
            const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('AI Coach'));
            btn ? (btn.click(), 'clicked') : 'not found';
          `
        });
        console.log('Click result:', clickResult.result?.value);
        
        // Wait 3s
        await new Promise(r => setTimeout(r, 3000));
        
        // Get state
        const result = await send('Runtime.evaluate', {
          expression: `
            JSON.stringify({
              loadingDiv: document.querySelector('.modal-loading')?.textContent,
              errorBoundary: document.querySelector('.error-boundary-container')?.textContent?.substring(0,100),
              aiModal: !!document.querySelector('.ai-assistant-modal'),
              allModals: [...document.querySelectorAll('[class*="modal"]')].map(m => m.className).slice(0,5)
            })
          `
        });
        
        console.log('RESULT:', result.result?.value);
        done = true;
        ws.close();
        resolve();
      } catch (e) {
        console.error('Error:', e.message);
        done = true;
        ws.close();
        resolve();
      }
    });
    
    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg.result || msg);
        pending.delete(msg.id);
      }
    });
    
    ws.on('error', (e) => {
      if (!done) console.error('WS Error:', e.message);
    });
    
    setTimeout(() => { 
      if (!done) {
        done = true;
        ws.close(); 
        resolve(); 
      }
    }, 15000);
  });
}

check();
