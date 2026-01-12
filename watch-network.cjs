const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:9222/devtools/page/6ACE26B58C240FEA80398840D7A0E22A');

let msgId = 1;

ws.on('open', async () => {
  console.log('Connected\n');
  
  // Enable network monitoring
  ws.send(JSON.stringify({ id: msgId++, method: 'Network.enable' }));
  ws.send(JSON.stringify({ id: msgId++, method: 'Runtime.enable' }));
  
  // Wait for enable
  await new Promise(r => setTimeout(r, 500));
  
  // Click AI Coach button
  console.log('Clicking AI Coach button...');
  ws.send(JSON.stringify({
    id: msgId++,
    method: 'Runtime.evaluate',
    params: {
      expression: `
        const btns = document.querySelectorAll('button');
        const aiBtn = Array.from(btns).find(b => b.textContent.includes('AI Coach'));
        if (aiBtn) { aiBtn.click(); 'clicked'; }
        else 'not_found';
      `,
      returnByValue: true
    }
  }));
  
  // Wait for network activity
  console.log('Watching network for 5 seconds...\n');
  await new Promise(r => setTimeout(r, 5000));
  
  // Check final state
  console.log('\nFinal check...');
  ws.send(JSON.stringify({
    id: 999,
    method: 'Runtime.evaluate',
    params: {
      expression: `JSON.stringify({
        loading: !!document.querySelector('.modal-loading'),
        loadingText: document.querySelector('.modal-loading')?.textContent,
        aiModalClass: document.querySelector('[class*="ai-assistant"]')?.className
      })`,
      returnByValue: true
    }
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  
  // Network request
  if (msg.method === 'Network.requestWillBeSent') {
    const url = msg.params.request?.url;
    if (url && (url.includes('chunk') || url.includes('AIAssistant'))) {
      console.log(`📤 Request: ${url.split('/').pop()}`);
    }
  }
  
  // Network response  
  if (msg.method === 'Network.responseReceived') {
    const url = msg.params.response?.url;
    const status = msg.params.response?.status;
    if (url && (url.includes('chunk') || url.includes('AIAssistant'))) {
      console.log(`📥 Response: ${status} - ${url.split('/').pop()}`);
    }
  }
  
  // Network failed
  if (msg.method === 'Network.loadingFailed') {
    console.log(`❌ Failed: ${msg.params.errorText} - ${msg.params.blockedReason || ''}`);
  }
  
  // Final check response
  if (msg.id === 999) {
    console.log('State:', msg.result?.result?.value);
    ws.close();
    process.exit(0);
  }
});

ws.on('error', (e) => console.error('Error:', e.message));
setTimeout(() => { console.log('Timeout'); process.exit(1); }, 15000);
