const WebSocket = require('ws');
const fs = require('fs');
const ws = new WebSocket('ws://localhost:9222/devtools/page/6ACE26B58C240FEA80398840D7A0E22A');
const output = [];

ws.on('open', async () => {
  let id = 1;
  const send = (m, p = {}) => new Promise(r => { 
    const myId = id++;
    const handler = d => { const msg = JSON.parse(d); if(msg.id === myId) { ws.removeListener('message', handler); r(msg.result); }};
    ws.on('message', handler);
    ws.send(JSON.stringify({id:myId,method:m,params:p})); 
  });
  
  await send('Runtime.enable');
  output.push('Runtime enabled');
  
  // Check all modal elements
  const modals = await send('Runtime.evaluate', { 
    expression: `JSON.stringify([...document.querySelectorAll('[class*=modal]')].map(m => ({cls:m.className.substring(0,60), text:m.textContent?.substring(0,40)})))`
  });
  output.push('Modals: ' + modals?.result?.value);
  
  // Check if window.setShowAIAssistantModal is defined
  const setter = await send('Runtime.evaluate', { expression: `typeof window.setShowAIAssistantModal` });
  output.push('Setter type: ' + setter?.result?.value);
  
  // Call the setter!
  const call = await send('Runtime.evaluate', { expression: `window.setShowAIAssistantModal ? (window.setShowAIAssistantModal(true), 'CALLED') : 'NO SETTER'` });
  output.push('Setter result: ' + call?.result?.value);
  
  // Wait 3s
  await new Promise(r => setTimeout(r, 3000));
  
  // Check modal state after
  const afterCall = await send('Runtime.evaluate', { 
    expression: `JSON.stringify({aiModal: !!document.querySelector('.ai-assistant-modal'), anyModalCount: document.querySelectorAll('[class*=modal]').length, loadingText: document.querySelector('.modal-loading')?.textContent?.substring(0,50) })`
  });
  output.push('After 3s: ' + afterCall?.result?.value);
  
  // Write to file
  fs.writeFileSync('test-output.txt', output.join('\n'));
  console.log('Output written to test-output.txt');
  
  ws.close();
  process.exit(0);
});

ws.on('error', e => { output.push('Error: ' + e.message); fs.writeFileSync('test-output.txt', output.join('\n')); process.exit(1); });
setTimeout(() => { output.push('Timeout'); fs.writeFileSync('test-output.txt', output.join('\n')); process.exit(0); }, 10000);
