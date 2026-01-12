const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:9222/devtools/page/6ACE26B58C240FEA80398840D7A0E22A');

ws.on('open', async () => {
  let id = 1;
  const send = (m, p = {}) => new Promise(r => { 
    const myId = id++;
    ws.once('message', d => { const msg = JSON.parse(d); if(msg.id === myId) r(msg.result); });
    ws.send(JSON.stringify({id:myId,method:m,params:p})); 
  });
  
  await send('Runtime.enable');
  
  // Check all modal elements
  const modals = await send('Runtime.evaluate', { 
    expression: `JSON.stringify([...document.querySelectorAll('[class*=modal]')].map(m => ({tag:m.tagName, cls:m.className.substring(0,100), text:m.textContent?.substring(0,80)})))`
  });
  console.log('Modals:', modals?.result?.value);
  
  // Check React state - is showAIAssistantModal true?
  const state = await send('Runtime.evaluate', { 
    expression: `
      // Try to find React fiber with showAIAssistantModal state
      const root = document.querySelector('#root');
      const key = Object.keys(root || {}).find(k => k.startsWith('__reactContainer'));
      if (key && root[key]?.stateNode?.current?.memoizedState) {
        'has react'
      } else {
        'no react state access'
      }
    `
  });
  console.log('React:', state?.result?.value);
  
  // Check if window.setShowAIAssistantModal is defined
  const setter = await send('Runtime.evaluate', { 
    expression: `typeof window.setShowAIAssistantModal`
  });
  console.log('Setter exists:', setter?.result?.value);
  
  // If setter exists, call it!
  if (setter?.result?.value === 'function') {
    const call = await send('Runtime.evaluate', { 
      expression: `window.setShowAIAssistantModal(true); 'called setShowAIAssistantModal(true)'`
    });
    console.log('Setter call:', call?.result?.value);
    
    await new Promise(r => setTimeout(r, 3000));
    
    const afterCall = await send('Runtime.evaluate', { 
      expression: `JSON.stringify({aiModal: !!document.querySelector('.ai-assistant-modal'), modalOverlay: !!document.querySelector('.modal-overlay'), loading: !!document.querySelector('.modal-loading')})`
    });
    console.log('After setter:', afterCall?.result?.value);
  }
  
  ws.close();
  process.exit(0);
});

ws.on('error', e => { console.error('Error:', e.message); process.exit(1); });
setTimeout(() => process.exit(0), 10000);
