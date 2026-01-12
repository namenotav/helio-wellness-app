const http = require('http');

// Get page info
const getPageId = () => new Promise((resolve, reject) => {
  http.get('http://localhost:9222/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const pages = JSON.parse(data);
      resolve(pages[0]?.id);
    });
  }).on('error', reject);
});

// WebSocket connection
const connect = (pageId) => new Promise((resolve, reject) => {
  const WebSocket = require('ws');
  const ws = new WebSocket(`ws://localhost:9222/devtools/page/${pageId}`);
  ws.on('open', () => resolve(ws));
  ws.on('error', reject);
});

// Send command
let cmdId = 1;
const send = (ws, method, params = {}) => new Promise((resolve) => {
  const id = cmdId++;
  const handler = (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.id === id) {
      ws.off('message', handler);
      resolve(msg.result);
    }
  };
  ws.on('message', handler);
  ws.send(JSON.stringify({ id, method, params }));
});

// Get object properties
const getObjectProps = async (ws, objectId) => {
  try {
    const result = await send(ws, 'Runtime.getProperties', {
      objectId,
      ownProperties: true,
      accessorPropertiesOnly: false
    });
    const props = {};
    for (const prop of (result.result || [])) {
      if (prop.value) {
        props[prop.name] = prop.value.value || prop.value.description || prop.value.type;
      }
    }
    return props;
  } catch {
    return null;
  }
};

// Format console args
const formatArgs = async (ws, args) => {
  const formatted = [];
  for (const arg of args) {
    if (arg.type === 'string') {
      formatted.push(arg.value);
    } else if (arg.type === 'object' && arg.objectId) {
      const props = await getObjectProps(ws, arg.objectId);
      if (props) {
        // Check for Error properties
        if (props.message || props.stack) {
          formatted.push(`Error: ${props.message}\n${props.stack || ''}`);
        } else {
          formatted.push(JSON.stringify(props, null, 2));
        }
      } else {
        formatted.push(arg.description || arg.className || '[Object]');
      }
    } else if (arg.description) {
      formatted.push(arg.description);
    } else {
      formatted.push(arg.value || arg.type);
    }
  }
  return formatted.join(' ');
};

(async () => {
  try {
    const pageId = await getPageId();
    console.log('📱 Page:', pageId);
    
    const ws = await connect(pageId);
    console.log('✅ Connected\n');
    
    // Enable domains
    await send(ws, 'Runtime.enable');
    await send(ws, 'Log.enable');
    await send(ws, 'Network.enable');
    
    // Collect all errors
    const errors = [];
    const networkFailures = [];
    
    // Listen for console messages - with full object inspection
    ws.on('message', async (data) => {
      const msg = JSON.parse(data.toString());
      
      if (msg.method === 'Runtime.consoleAPICalled') {
        const { type, args } = msg.params;
        if (type === 'error' || type === 'warning') {
          const text = await formatArgs(ws, args);
          console.log(`🔴 ${type.toUpperCase()}: ${text}`);
          errors.push({ type, text });
        }
      }
      
      if (msg.method === 'Runtime.exceptionThrown') {
        const ex = msg.params.exceptionDetails;
        const text = ex.exception?.description || ex.text;
        console.log(`💥 EXCEPTION: ${text}`);
        if (ex.stackTrace) {
          console.log('   Stack:', ex.stackTrace.callFrames.map(f => `${f.functionName}@${f.url}:${f.lineNumber}`).join('\n         '));
        }
        errors.push({ type: 'exception', text });
      }
      
      if (msg.method === 'Log.entryAdded') {
        const entry = msg.params.entry;
        if (entry.level === 'error') {
          console.log(`📋 LOG ERROR: ${entry.text}`);
          errors.push({ type: 'log', text: entry.text });
        }
      }
      
      if (msg.method === 'Network.loadingFailed') {
        const { requestId, errorText, blockedReason } = msg.params;
        console.log(`❌ NETWORK FAIL: ${errorText} (${blockedReason || 'no reason'})`);
        networkFailures.push(msg.params);
      }
    });
    
    // Wait for existing errors to flush
    await new Promise(r => setTimeout(r, 2000));
    console.log('\n========== CLICKING AI COACH ==========\n');
    
    // Click AI Coach button
    const clickResult = await send(ws, 'Runtime.evaluate', {
      expression: `
        (function() {
          // Try multiple selectors
          const selectors = [
            'button:has-text("AI Coach")',
            '[style*="667eea"]', // The gradient color
            'button:contains("AI")',
          ];
          
          // Find all buttons
          const buttons = document.querySelectorAll('button');
          for (const btn of buttons) {
            const text = btn.textContent || btn.innerText || '';
            if (text.includes('AI Coach') || text.includes('🤖')) {
              btn.click();
              return 'Clicked: ' + text.substring(0, 50);
            }
          }
          
          // Try the hero button specifically (from HomeTab)
          const heroBtn = document.querySelector('button[style*="667eea"]');
          if (heroBtn) {
            heroBtn.click();
            return 'Clicked hero button';
          }
          
          return 'Button not found';
        })()
      `,
      returnByValue: true
    });
    console.log('🖱️ Click:', clickResult.result?.value);
    
    // Monitor for 20 seconds
    console.log('⏳ Monitoring for 20 seconds...\n');
    await new Promise(r => setTimeout(r, 20000));
    
    // Final check
    const finalState = await send(ws, 'Runtime.evaluate', {
      expression: `
        JSON.stringify({
          hasModal: !!document.querySelector('.ai-assistant-modal, [class*="ai-modal"], [class*="AIAssistant"]'),
          hasLoading: !!document.body.textContent.includes('Loading'),
          loadingText: (document.body.textContent.match(/Loading[^.]*\\.\\.\\./) || [''])[0],
          modalContent: document.querySelector('.ai-assistant-modal')?.innerHTML?.substring(0, 200) || 'none',
          suspenseCount: document.querySelectorAll('[data-suspense], .suspense-fallback').length,
          errorBoundaries: document.body.textContent.includes('error') || document.body.textContent.includes('Error'),
        })
      `,
      returnByValue: true
    });
    
    console.log('\n========== FINAL STATE ==========');
    console.log(JSON.parse(finalState.result?.value || '{}'));
    console.log('\n========== ERRORS COLLECTED ==========');
    console.log(`Total errors: ${errors.length}`);
    errors.forEach((e, i) => console.log(`${i+1}. [${e.type}] ${e.text?.substring(0, 500)}`));
    console.log('\n========== NETWORK FAILURES ==========');
    console.log(`Total failures: ${networkFailures.length}`);
    networkFailures.forEach(f => console.log(`- ${f.errorText}`));
    
    ws.close();
  } catch (err) {
    console.error('Script error:', err);
  }
})();
