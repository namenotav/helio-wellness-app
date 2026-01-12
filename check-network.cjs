const WebSocket = require('ws');
const fs = require('fs');
const ws = new WebSocket('ws://localhost:9222/devtools/page/6ACE26B58C240FEA80398840D7A0E22A');
const output = [];

ws.on('open', async () => {
  let id = 1;
  const send = (m, p = {}) => new Promise(r => { 
    const myId = id++;
    const handler = d => { const msg = JSON.parse(d); if(msg.id === myId) { ws.removeListener('message', handler); r(msg.result); }};
    ws.on('message', handler);
    ws.send(JSON.stringify({id:myId,method:m,params:p})); 
  });
  
  // Enable network and console
  await send('Network.enable');
  await send('Console.enable');
  await send('Runtime.enable');
  output.push('Enabled Network, Console, Runtime');
  
  // Collect network requests
  const requests = [];
  ws.on('message', d => {
    try {
      const msg = JSON.parse(d);
      if (msg.method === 'Network.requestWillBeSent') {
        requests.push(msg.params.request.url.substring(0, 100));
      }
      if (msg.method === 'Network.loadingFailed') {
        output.push('NETWORK FAILURE: ' + JSON.stringify(msg.params).substring(0, 200));
      }
    } catch(e) {}
  });
  
  // Try to manually import the AIAssistantModal
  output.push('\\nAttempting dynamic import...');
  const importResult = await send('Runtime.evaluate', { 
    expression: `
      (async () => {
        try {
          const mod = await import('./src/components/AIAssistantModal');
          return 'SUCCESS: ' + typeof mod.default;
        } catch (e) {
          return 'ERROR: ' + e.message;
        }
      })()
    `,
    awaitPromise: true
  });
  output.push('Import result: ' + (importResult?.result?.value || JSON.stringify(importResult)));
  
  // Check if Suspense boundary error
  const suspense = await send('Runtime.evaluate', { 
    expression: `JSON.stringify({
      suspenseCount: document.querySelectorAll('[data-reactroot]').length,
      errorBoundary: !!document.querySelector('[class*=error]'),
      errorText: document.querySelector('[class*=error]')?.textContent?.substring(0, 100)
    })`
  });
  output.push('Suspense check: ' + suspense?.result?.value);
  
  // Check console errors
  output.push('Network requests made: ' + requests.length);
  requests.forEach(r => output.push('  - ' + r));
  
  // Write to file
  fs.writeFileSync('network-output.txt', output.join('\n'));
  console.log('Output written to network-output.txt');
  
  ws.close();
  process.exit(0);
});

ws.on('error', e => { output.push('Error: ' + e.message); fs.writeFileSync('network-output.txt', output.join('\n')); process.exit(1); });
setTimeout(() => { output.push('Timeout'); fs.writeFileSync('network-output.txt', output.join('\n')); process.exit(0); }, 15000);
