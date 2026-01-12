// Debug AI Coach loading issue
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/B36C08397EFC88D76755647A6ACDF94E');

ws.on('open', () => {
  console.log('Connected - checking for errors and loading states');
  
  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression: `
        // Check for any error messages
        const errors = [];
        
        // Check console errors
        if (window.__lastError) errors.push('Last error: ' + window.__lastError);
        
        // Check for loading states
        const loadingElements = document.body.innerText.match(/Loading[^\\n]*/gi) || [];
        
        // Check for error boundaries
        const errorBoundaryText = document.body.innerText.includes('encountered an error');
        
        // Check if AI modal is actually mounted
        const aiModalExists = !!document.querySelector('[class*="ai-assistant"]') || 
                              !!document.querySelector('[class*="modal"]');
        
        // Get all visible modals
        const modals = Array.from(document.querySelectorAll('[class*="modal"]')).map(m => ({
          className: m.className,
          visible: getComputedStyle(m).display !== 'none',
          text: m.innerText?.substring(0, 100)
        }));
        
        JSON.stringify({
          loadingElements,
          errorBoundaryText,
          aiModalExists,
          modals: modals.slice(0, 5),
          bodyLength: document.body.innerText.length
        }, null, 2);
      `,
      returnByValue: true
    }
  }));
});

ws.on('message', (data) => {
  const r = JSON.parse(data);
  if (r.id === 1) {
    console.log('\n📊 DEBUG INFO:');
    try {
      const info = JSON.parse(r.result?.result?.value);
      console.log(JSON.stringify(info, null, 2));
    } catch (e) {
      console.log('Raw:', r.result?.result?.value);
    }
    ws.close();
    process.exit(0);
  }
});

ws.on('error', (e) => console.error('Error:', e));
setTimeout(() => process.exit(0), 10000);
