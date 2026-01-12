// Get all buttons on screen
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/6ACE26B58C240FEA80398840D7A0E22A');

ws.on('open', async () => {
  let id = 1;
  const send = (method, params = {}) => {
    const i = id++;
    return new Promise((res) => {
      const handler = (data) => {
        const msg = JSON.parse(data);
        if (msg.id === i) { 
          ws.removeListener('message', handler); 
          res(msg.result || msg); 
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  };
  
  await send('Runtime.enable');
  
  // Get all buttons on screen
  const r = await send('Runtime.evaluate', {
    expression: `
      [...document.querySelectorAll('button')].slice(0,20).map(b => ({
        text: b.textContent.trim().substring(0,50),
        className: b.className,
        visible: b.offsetParent !== null
      }))
    `,
    returnByValue: true
  });
  
  console.log('BUTTONS:', JSON.stringify(r.result?.value, null, 2));
  ws.close();
});

ws.on('error', e => console.error('Error:', e.message));
setTimeout(() => process.exit(0), 8000);
