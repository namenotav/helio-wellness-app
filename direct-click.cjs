// Direct click test
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:9222/devtools/page/6ACE26B58C240FEA80398840D7A0E22A');

ws.on('open', async () => {
  let id = 1;
  const send = (m, p = {}) => new Promise(r => { 
    const i = id++; 
    const h = (d) => { const msg = JSON.parse(d); if(msg.id === i) { ws.removeListener('message', h); r(msg.result); }};
    ws.on('message', h);
    ws.send(JSON.stringify({id:i,method:m,params:p})); 
  });
  
  await send('Runtime.enable');
  
  // Click first button (AI Coach)
  console.log('Clicking first button...');
  const click = await send('Runtime.evaluate', { 
    expression: 'document.querySelectorAll("button")[0].click(); "clicked first button"' 
  });
  console.log('Click:', click?.value);
  
  // Wait
  await new Promise(r => setTimeout(r, 3000));
  
  // Check DOM
  console.log('Checking DOM after 3s...');
  const dom = await send('Runtime.evaluate', { 
    expression: 'JSON.stringify({ loadingDivs: document.querySelectorAll(".modal-loading").length, aiModal: !!document.querySelector(".ai-assistant-modal"), modals: [...document.querySelectorAll("[class*=modal]")].map(m=>m.className.substring(0,50)).slice(0,5) })'
  });
  console.log('DOM:', dom?.value);
  
  ws.close();
  process.exit(0);
});

ws.on('error', e => console.error('WS Error:', e.message));
setTimeout(() => process.exit(0), 10000);
