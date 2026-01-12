const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:9222/devtools/page/6ACE26B58C240FEA80398840D7A0E22A');

ws.on('open', async () => {
  console.log('Connected\n');
  
  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.enable'
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  
  if (msg.id === 1) {
    // Get all button text content
    ws.send(JSON.stringify({
      id: 2,
      method: 'Runtime.evaluate',
      params: {
        expression: `JSON.stringify(
          Array.from(document.querySelectorAll('button')).map((b, i) => ({
            index: i,
            text: b.textContent.slice(0, 80).replace(/\\s+/g, ' ').trim(),
            classes: b.className.slice(0, 50)
          }))
        )`,
        returnByValue: true
      }
    }));
  }
  
  if (msg.id === 2) {
    console.log('Buttons found:');
    const buttons = JSON.parse(msg.result?.result?.value || '[]');
    buttons.forEach(b => {
      console.log(`  [${b.index}] "${b.text}" (${b.classes})`);
    });
    ws.close();
    process.exit(0);
  }
});

ws.on('error', (e) => console.error('Error:', e.message));
setTimeout(() => process.exit(1), 10000);
