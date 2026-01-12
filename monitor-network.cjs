const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:9222/devtools/page/AFA10FC729A3022946AA32879DD9C426');

let msgId = 0;
const pending = {};

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    pending[id] = { resolve, reject };
    ws.send(JSON.stringify({ id, method, params }));
    setTimeout(() => {
      if (pending[id]) {
        reject(new Error('Timeout'));
        delete pending[id];
      }
    }, 30000);
  });
}

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  
  // Log network events
  if (msg.method === 'Network.requestWillBeSent') {
    const url = msg.params.request.url;
    if (url.includes('chunk') || url.includes('Assistant')) {
      console.log('📤 Request:', url.slice(-80));
    }
  }
  if (msg.method === 'Network.loadingFailed') {
    console.log('❌ FAILED:', msg.params.errorText, msg.params.requestId);
  }
  if (msg.method === 'Network.responseReceived') {
    const url = msg.params.response.url;
    if (url.includes('chunk') || url.includes('Assistant')) {
      console.log('📥 Response:', msg.params.response.status, url.slice(-80));
    }
  }
  
  // Log console errors
  if (msg.method === 'Runtime.exceptionThrown') {
    console.log('🔴 EXCEPTION:', msg.params.exceptionDetails.text);
    console.log('   Stack:', msg.params.exceptionDetails.exception?.description?.slice(0, 200));
  }
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    console.log('🔴 Console error:', msg.params.args.map(a => a.value || a.description).join(' ').slice(0, 200));
  }
  
  if (msg.id && pending[msg.id]) {
    pending[msg.id].resolve(msg);
    delete pending[msg.id];
  }
});

ws.on('open', async () => {
  console.log('✅ Connected - Monitoring network and console\n');
  
  try {
    await send('Runtime.enable');
    await send('Network.enable');
    
    // First close any existing modal
    await send('Runtime.evaluate', {
      expression: `(() => {
        const loading = document.querySelector('.modal-loading');
        if (loading) loading.parentElement?.click();
      })()`,
      returnByValue: true
    });
    await new Promise(r => setTimeout(r, 500));
    
    console.log('🔵 Clicking AI Coach button...\n');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent.includes('AI Coach'));
        if (btn) btn.click();
      })()`,
      returnByValue: true
    });
    
    // Wait and monitor
    console.log('⏳ Monitoring for 10 seconds...\n');
    await new Promise(r => setTimeout(r, 10000));
    
    // Final state check
    const state = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        hasAIModal: !!document.querySelector('.ai-assistant-modal'),
        hasLoading: !!document.querySelector('.modal-loading'),
        loadingText: document.querySelector('.modal-loading')?.textContent
      })`,
      returnByValue: true
    });
    console.log('\n📊 Final state:', state.result?.result?.value);
    
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  ws.close();
  process.exit(0);
});

ws.on('error', (e) => {
  console.error('WebSocket error:', e.message);
  process.exit(1);
});
