const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:9222/devtools/page/6ACE26B58C240FEA80398840D7A0E22A');

let msgId = 1;

const evaluate = (expression) => new Promise((resolve) => {
  const id = msgId++;
  const handler = (data) => {
    const msg = JSON.parse(data);
    if (msg.id === id) {
      ws.off('message', handler);
      resolve(msg.result?.result?.value);
    }
  };
  ws.on('message', handler);
  ws.send(JSON.stringify({
    id,
    method: 'Runtime.evaluate',
    params: { expression, returnByValue: true }
  }));
});

ws.on('open', async () => {
  console.log('✅ Connected to WebView\n');
  
  await evaluate('true'); // Runtime enable
  
  // Step 1: Click Home tab
  console.log('1️⃣ Clicking Home tab...');
  const homeResult = await evaluate(`
    const homeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Home'));
    if (homeBtn) { homeBtn.click(); 'HOME_CLICKED'; }
    else 'HOME_NOT_FOUND';
  `);
  console.log('   Result:', homeResult);
  
  // Wait for navigation
  await new Promise(r => setTimeout(r, 1500));
  
  // Step 2: List buttons on Home tab
  console.log('\n2️⃣ Buttons on Home tab:');
  const buttonsJson = await evaluate(`
    JSON.stringify(
      Array.from(document.querySelectorAll('button')).map((b, i) => ({
        index: i,
        text: b.textContent.slice(0, 60).replace(/\\s+/g, ' ').trim()
      }))
    )
  `);
  const buttons = JSON.parse(buttonsJson || '[]');
  buttons.forEach(b => console.log(`   [${b.index}] "${b.text}"`));
  
  // Step 3: Look for AI Coach button
  console.log('\n3️⃣ Looking for AI Coach button...');
  const aiBtn = buttons.find(b => 
    b.text.toLowerCase().includes('ai coach') || 
    b.text.toLowerCase().includes('ai assistant') ||
    b.text.includes('🤖')
  );
  
  if (aiBtn) {
    console.log('   Found at index:', aiBtn.index);
    console.log('   Text:', aiBtn.text);
    
    // Click it
    console.log('\n4️⃣ Clicking AI Coach button...');
    const clickResult = await evaluate(`
      const btn = document.querySelectorAll('button')[${aiBtn.index}];
      if (btn) { btn.click(); 'CLICKED'; }
      else 'NOT_FOUND';
    `);
    console.log('   Result:', clickResult);
    
    // Wait for modal
    await new Promise(r => setTimeout(r, 3000));
    
    // Check modal state
    console.log('\n5️⃣ Modal state after 3s:');
    const modalState = await evaluate(`
      JSON.stringify({
        hasModal: !!document.querySelector('.ai-assistant-modal, [class*="ai-modal"], [class*="AIAssistant"]'),
        hasLoading: !!document.querySelector('.modal-loading'),
        loadingText: document.querySelector('.modal-loading')?.textContent || null,
        modalClasses: Array.from(document.querySelectorAll('[class*="modal"]')).map(e => e.className).slice(0, 5),
        suspenseElements: document.querySelectorAll('[data-suspense], .suspense').length,
        errors: Array.from(document.querySelectorAll('.error, [class*="error"]')).map(e => e.textContent?.slice(0, 50))
      })
    `);
    console.log('  ', modalState);
  } else {
    console.log('   ❌ AI Coach button NOT FOUND in buttons list');
  }
  
  ws.close();
  process.exit(0);
});

ws.on('error', (e) => console.error('Error:', e.message));
setTimeout(() => process.exit(1), 20000);
