const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:9222/devtools/page/6ACE26B58C240FEA80398840D7A0E22A');

ws.on('open', async () => {
  const send = (expr) => new Promise((resolve) => { 
    const id = Math.random();
    const handler = d => { 
      const msg = JSON.parse(d); 
      if(msg.id === id) { 
        ws.removeListener('message', handler); 
        resolve(msg.result?.result?.value || JSON.stringify(msg)); 
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({id, method:'Runtime.evaluate', params:{expression:expr}})); 
  });
  
  console.log('Base:', await send('document.baseURI'));
  console.log('Location:', await send('location.href'));
  console.log('Scripts:', await send('[...document.querySelectorAll("script[src]")].map(s=>s.src).slice(0,3).join(" | ")'));
  
  ws.close();
  process.exit(0);
});

ws.on('error', e => { console.log('Error:', e.message); process.exit(1); });
setTimeout(() => { console.log('Timeout'); process.exit(0); }, 8000);
