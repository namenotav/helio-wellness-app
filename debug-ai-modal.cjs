const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:9222/devtools/page/6ACE26B58C240FEA80398840D7A0E22A');

let msgId = 1;
const consoleMessages = [];

const evaluate = (expression) => new Promise((resolve) => {
  const id = msgId++;
  const handler = (data) => {
    const msg = JSON.parse(data);
    if (msg.id === id) {
      ws.off('message', handler);
      resolve(msg);
    }
  };
  ws.on('message', handler);
  ws.send(JSON.stringify({
    id,
    method: 'Runtime.evaluate',
    params: { expression, returnByValue: true, awaitPromise: true }
  }));
});

ws.on('open', async () => {
  console.log('✅ Connected\n');
  
  // Enable console & Runtime
  ws.send(JSON.stringify({ id: msgId++, method: 'Runtime.enable' }));
  ws.send(JSON.stringify({ id: msgId++, method: 'Console.enable' }));
  ws.send(JSON.stringify({ id: msgId++, method: 'Log.enable' }));
  
  await new Promise(r => setTimeout(r, 500));
  
  // Check for existing errors
  console.log('1️⃣ Checking for existing errors...');
  const errorCheck = await evaluate(`
    JSON.stringify({
      jsErrors: window.__ERRORS__ || [],
      lastError: window.lastError || null,
      hasReactError: !!document.querySelector('#root > [class*="error"]'),
      suspenseCount: document.querySelectorAll('*').length
    })
  `);
  console.log('   Existing errors:', errorCheck.result?.result?.value);
  
  // Check if AIAssistantModal chunk loaded
  console.log('\n2️⃣ Checking loaded chunks...');
  const chunkCheck = await evaluate(`
    JSON.stringify({
      scripts: Array.from(document.querySelectorAll('script[src]')).map(s => s.src.split('/').pop()),
      styleSheets: document.styleSheets.length,
      hasAIModule: typeof window.AIAssistantModal !== 'undefined'
    })
  `);
  console.log('   Chunks:', chunkCheck.result?.result?.value);
  
  // Check network for failed requests
  console.log('\n3️⃣ Triggering AI modal import manually...');
  const importTest = await evaluate(`
    (async () => {
      try {
        const module = await import('/src/components/AIAssistantModal.jsx');
        return { success: true, hasDefault: !!module.default };
      } catch (err) {
        return { success: false, error: err.message, stack: err.stack?.slice(0, 300) };
      }
    })()
  `);
  console.log('   Import result:', JSON.stringify(importTest.result?.result?.value || importTest.result?.exceptionDetails?.text, null, 2));
  
  // Check if the modal state setter exists
  console.log('\n4️⃣ Checking React state...');
  const reactCheck = await evaluate(`
    JSON.stringify({
      hasSetShowAIAssistantModal: typeof window.setShowAIAssistantModal === 'function',
      modalStateType: typeof window.setShowAIAssistantModal
    })
  `);
  console.log('   React state:', reactCheck.result?.result?.value);
  
  // Check what's inside the loading div
  console.log('\n5️⃣ Checking Suspense boundary...');
  const suspenseCheck = await evaluate(`
    const loading = document.querySelector('.modal-loading');
    if (loading) {
      const parent = loading.parentElement;
      const grandparent = parent?.parentElement;
      return JSON.stringify({
        loadingText: loading.textContent,
        parentTag: parent?.tagName,
        parentClass: parent?.className,
        grandparentTag: grandparent?.tagName,
        grandparentClass: grandparent?.className,
        siblingCount: parent?.children?.length
      });
    }
    return 'NO_LOADING_FOUND';
  `);
  console.log('   Suspense:', suspenseCheck.result?.result?.value);
  
  ws.close();
  process.exit(0);
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.method === 'Console.messageAdded' || msg.method === 'Log.entryAdded') {
    const text = msg.params?.message?.text || msg.params?.entry?.text;
    if (text && (text.includes('error') || text.includes('Error') || text.includes('fail'))) {
      console.log('🔴 Console:', text.slice(0, 200));
    }
  }
});

ws.on('error', (e) => console.error('Error:', e.message));
setTimeout(() => process.exit(1), 15000);
