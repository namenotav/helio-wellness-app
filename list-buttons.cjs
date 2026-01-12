const http = require('http');
const WebSocket = require('ws');

http.get('http://localhost:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const pageId = JSON.parse(data)[0]?.id;
    console.log('Page:', pageId);
    
    const ws = new WebSocket(`ws://localhost:9222/devtools/page/${pageId}`);
    
    ws.on('open', () => {
      // List all buttons
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            Array.from(document.querySelectorAll('button')).map(b => {
              return b.textContent?.trim().substring(0, 60) || 'no-text';
            }).join('\\n')
          `,
          returnByValue: true
        }
      }));
    });
    
    ws.on('message', (msg) => {
      const response = JSON.parse(msg.toString());
      if (response.id === 1) {
        console.log('\\n=== BUTTONS ON PAGE ===\\n');
        console.log(response.result?.result?.value || 'No buttons');
        ws.close();
      }
    });
  });
});
