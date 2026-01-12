const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:9222/devtools/page/6ACE26B58C240FEA80398840D7A0E22A');

ws.on('open', async () => {
  let id = 1;
  const send = (m, p = {}) => new Promise(r => { 
    const h = (d) => { const msg = JSON.parse(d); if(msg.id === id) { ws.removeListener('message', h); r(msg.result); }};
    ws.on('message', h);
    ws.send(JSON.stringify({id:id++,method:m,params:p})); 
  });
  
  await send('Runtime.enable');
  
  // Check first button details
  const btn = await send('Runtime.evaluate', { 
    expression: `
      const btn = document.querySelectorAll('button')[0];
      JSON.stringify({
        exists: !!btn,
        tagName: btn?.tagName,
        text: btn?.textContent?.substring(0, 50),
        onclick: typeof btn?.onclick,
        hasReactProps: Object.keys(btn || {}).filter(k => k.startsWith('__react')).length,
        disabled: btn?.disabled,
        clickType: typeof btn?.click
      })
    `
  });
  console.log('Button 0:', btn?.result?.value);
  
  // Try to manually dispatch click event
  console.log('\\nDispatch click event...');
  const dispatch = await send('Runtime.evaluate', { 
    expression: `
      const btn = document.querySelectorAll('button')[0];
      if (btn) {
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
        btn.dispatchEvent(clickEvent);
        'dispatched'
      } else {
        'no button'
      }
    `
  });
  console.log('Dispatch result:', dispatch?.result?.value);
  
  await new Promise(r => setTimeout(r, 3000));
  
  // Check if modal appeared
  const check = await send('Runtime.evaluate', { 
    expression: `
      JSON.stringify({
        aiModalExists: !!document.querySelector('.ai-assistant-modal'),
        modals: document.querySelectorAll('[class*=modal]').length,
        loadingDivs: document.querySelectorAll('.modal-loading').length
      })
    `
  });
  console.log('After click:', check?.result?.value);
  
  ws.close();
  process.exit(0);
});

ws.on('error', e => console.error('WS Error:', e.message));
setTimeout(() => process.exit(0), 10000);
