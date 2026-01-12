// Close AI Coach modal
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/B36C08397EFC88D76755647A6ACDF94E');

ws.on('open', () => {
  console.log('Connected');
  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression: 'if(window.setShowAIAssistantModal) { window.setShowAIAssistantModal(false); "closed modal" } else { "no global handler" }',
      returnByValue: true
    }
  }));
});

ws.on('message', (data) => {
  const r = JSON.parse(data);
  if (r.id === 1) {
    console.log('Result:', r.result?.result?.value);
    
    // Now get UI state
    setTimeout(() => {
      ws.send(JSON.stringify({
        id: 2,
        method: 'Runtime.evaluate',
        params: {
          expression: 'document.body.innerText',
          returnByValue: true
        }
      }));
    }, 500);
  } else if (r.id === 2) {
    console.log('\n📱 Current UI:\n');
    console.log(r.result?.result?.value?.substring(0, 2000));
    ws.close();
    process.exit(0);
  }
});

setTimeout(() => process.exit(0), 10000);
