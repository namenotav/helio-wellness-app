const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:9222/devtools/page/A0192DE173FB6914A106E3D42F217E50');

ws.on('open', async () => {
  const send = (expr) => new Promise((resolve) => { 
    const id = Math.random();
    const handler = d => { 
      const msg = JSON.parse(d); 
      if(msg.id === id) { 
        ws.removeListener('message', handler); 
        resolve(msg.result?.result?.value || 'NO_VALUE'); 
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({id, method:'Runtime.evaluate', params:{expression:expr}})); 
  });
  
  console.log('Base:', await send('document.baseURI'));
  console.log('Href:', await send('location.href'));
  console.log('First script src:', await send('document.querySelector("script[src]")?.src || "none"'));
  
  ws.close();
  process.exit(0);
});

ws.on('error', e => { console.log('Error:', e.message); process.exit(1); });
setTimeout(() => { console.log('Timeout'); process.exit(0); }, 8000);
