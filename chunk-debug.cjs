const WebSocket = require('ws');
const fs = require('fs');
const ws = new WebSocket('ws://localhost:9222/devtools/page/6ACE26B58C240FEA80398840D7A0E22A');
const output = [];

ws.on('open', async () => {
  let id = 1;
  const send = (m, p = {}) => new Promise((resolve, reject) => { 
    const myId = id++;
    const timeout = setTimeout(() => { reject(new Error('Timeout')); }, 5000);
    const handler = d => { 
      const msg = JSON.parse(d); 
      if(msg.id === myId) { 
        clearTimeout(timeout);
        ws.removeListener('message', handler); 
        resolve(msg.result); 
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({id:myId,method:m,params:p})); 
  });
  
  await send('Runtime.enable');
  
  // Check base URL
  const baseUrl = await send('Runtime.evaluate', { expression: `document.baseURI` });
  output.push('Base URI: ' + baseUrl?.result?.value);
  
  // Check location
  const loc = await send('Runtime.evaluate', { expression: `location.href` });
  output.push('Location: ' + loc?.result?.value);
  
  // Find all script tags to understand URL pattern
  const scripts = await send('Runtime.evaluate', { 
    expression: `JSON.stringify([...document.querySelectorAll('script[src]')].map(s => s.src).slice(0, 5))`
  });
  output.push('Scripts: ' + scripts?.result?.value);
  
  // Check for failed imports by looking at window errors
  const errors = await send('Runtime.evaluate', { 
    expression: `window.__VITE_PRELOAD_ERROR__ || window.__lastError__ || 'no error stored'`
  });
  output.push('Window errors: ' + errors?.result?.value);
  
  // Try fetching the chunk directly
  output.push('\\nTrying to fetch AIAssistantModal chunk...');
  const fetchResult = await send('Runtime.evaluate', { 
    expression: `
      (async () => {
        try {
          // Get all script tags to find URL pattern
          const scripts = [...document.querySelectorAll('script[src]')];
          const mainScript = scripts.find(s => s.src.includes('entry-'));
          if (!mainScript) return 'No main script found';
          
          const base = mainScript.src.replace(/\\/[^\\/]+$/, '');
          const chunkUrl = base + '/chunk-1768138096896-AIAssistantModal.js';
          
          const res = await fetch(chunkUrl);
          return 'Fetch: ' + res.status + ' ' + res.statusText + ' URL: ' + chunkUrl;
        } catch (e) {
          return 'Fetch error: ' + e.message;
        }
      })()
    `,
    awaitPromise: true
  });
  output.push('Chunk fetch: ' + fetchResult?.result?.value);
  
  fs.writeFileSync('chunk-debug.txt', output.join('\n'));
  console.log('Output written to chunk-debug.txt');
  
  ws.close();
  process.exit(0);
});

ws.on('error', e => { output.push('WS Error: ' + e.message); fs.writeFileSync('chunk-debug.txt', output.join('\n')); process.exit(1); });
setTimeout(() => { output.push('Timeout'); fs.writeFileSync('chunk-debug.txt', output.join('\n')); process.exit(0); }, 15000);
