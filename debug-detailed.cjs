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
  
  // Log ALL network requests
  if (msg.method === 'Network.requestWillBeSent') {
    const url = msg.params.request.url;
    console.log('📤 REQ:', url.slice(-100));
  }
  if (msg.method === 'Network.loadingFailed') {
    console.log('❌ NETWORK FAILED:', msg.params.errorText);
  }
  if (msg.method === 'Network.responseReceived') {
    const url = msg.params.response.url;
    const status = msg.params.response.status;
    if (status !== 200 || url.includes('chunk')) {
      console.log('📥 RSP:', status, url.slice(-100));
    }
  }
  
  // Log console with full details
  if (msg.method === 'Runtime.consoleAPICalled') {
    const args = msg.params.args.map(a => {
      if (a.type === 'object' && a.preview) {
        return JSON.stringify(a.preview.properties?.reduce((o, p) => {
          o[p.name] = p.value;
          return o;
        }, {}) || a.preview);
      }
      return a.value || a.description || a.type;
    });
    if (msg.params.type === 'error') {
      console.log('🔴 ERROR:', args.join(' ').slice(0, 300));
    }
  }
  
  // Log exceptions with stack
  if (msg.method === 'Runtime.exceptionThrown') {
    const ex = msg.params.exceptionDetails;
    console.log('💥 EXCEPTION:', ex.text);
    if (ex.exception?.description) {
      console.log('   STACK:', ex.exception.description.slice(0, 500));
    }
  }
  
  if (msg.id && pending[msg.id]) {
    pending[msg.id].resolve(msg);
    delete pending[msg.id];
  }
});

ws.on('open', async () => {
  console.log('✅ Connected\n');
  
  try {
    await send('Runtime.enable');
    await send('Network.enable');
    
    // Clear modal first
    await send('Runtime.evaluate', {
      expression: `document.querySelector('.modal-loading')?.parentElement?.remove()`,
      returnByValue: true
    });
    await new Promise(r => setTimeout(r, 500));
    
    // Set up global error handler
    await send('Runtime.evaluate', {
      expression: `
        window.onerror = function(msg, url, line, col, error) {
          console.error('GLOBAL ERROR:', msg, url, line, col, error?.stack);
          return false;
        };
        window.addEventListener('unhandledrejection', function(e) {
          console.error('UNHANDLED PROMISE:', e.reason?.message || e.reason, e.reason?.stack);
        });
      `,
      returnByValue: true
    });
    
    console.log('🔵 Clicking AI Coach...\n');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('AI Coach'));
        if (btn) btn.click();
      })()`,
      returnByValue: true
    });
    
    console.log('⏳ Monitoring 15 seconds...\n');
    await new Promise(r => setTimeout(r, 15000));
    
    // Check final state
    const state = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        modal: !!document.querySelector('.ai-assistant-modal'),
        loading: !!document.querySelector('.modal-loading'),
        text: document.querySelector('.modal-loading')?.textContent,
        scriptErrors: document.querySelectorAll('script[onerror]').length
      })`,
      returnByValue: true
    });
    console.log('\n📊 Final:', state.result?.result?.value);
    
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  ws.close();
  process.exit(0);
});

ws.on('error', (e) => console.error('WS Error:', e.message));
