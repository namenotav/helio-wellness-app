const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:9222/devtools/page/6ACE26B58C240FEA80398840D7A0E22A');

const results = [];

ws.on('open', async () => {
  let id = 1;
  const send = (m, p = {}) => new Promise(r => { 
    const myId = id++;
    const h = (d) => { 
      const msg = JSON.parse(d); 
      if(msg.id === myId) { 
        ws.removeListener('message', h); 
        r(msg.result); 
      }
    };
    ws.on('message', h);
    ws.send(JSON.stringify({id:myId,method:m,params:p})); 
  });
  
  await send('Runtime.enable');
  
  // 1. Get button info
  const btn = await send('Runtime.evaluate', { 
    expression: `JSON.stringify({exists: !!document.querySelectorAll('button')[0], text: document.querySelectorAll('button')[0]?.textContent?.substring(0,40)})`
  });
  results.push('Button: ' + btn?.result?.value);
  
  // 2. Click using React's handler pattern
  const click = await send('Runtime.evaluate', { 
    expression: `
      const btn = document.querySelectorAll('button')[0];
      if (btn) {
        // Try simulating a real pointer event (works better with React)
        const rect = btn.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        btn.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true,cancelable:true,pointerId:1,pointerType:'touch',clientX:x,clientY:y}));
        btn.dispatchEvent(new PointerEvent('pointerup', {bubbles:true,cancelable:true,pointerId:1,pointerType:'touch',clientX:x,clientY:y}));
        btn.dispatchEvent(new MouseEvent('click', {bubbles:true,cancelable:true,clientX:x,clientY:y}));
        'clicked'
      } else { 'no btn' }
    `
  });
  results.push('Click: ' + click?.result?.value);
  
  // Wait 2s
  await new Promise(r => setTimeout(r, 2000));
  
  // 3. Check modal state
  const modal = await send('Runtime.evaluate', { 
    expression: `JSON.stringify({aiModal: !!document.querySelector('.ai-assistant-modal'), anyModal: document.querySelectorAll('[class*=modal]').length })`
  });
  results.push('Modal: ' + modal?.result?.value);
  
  // Print all results
  console.log('=== RESULTS ===');
  results.forEach(r => console.log(r));
  
  ws.close();
  process.exit(0);
});

ws.on('error', e => { console.error('Error:', e.message); process.exit(1); });
setTimeout(() => { console.log('Timeout'); process.exit(0); }, 8000);
