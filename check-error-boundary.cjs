// Check ErrorBoundary state and find why AI modal isn't loading
const WebSocket = require('ws');

async function debugAIModal() {
  const ws = new WebSocket('ws://localhost:9222/devtools/page/6ACE26B58C240FEA80398840D7A0E22A');
  
  return new Promise((resolve, reject) => {
    let msgId = 1;
    const pending = new Map();
    
    ws.on('open', async () => {
      console.log('✅ Connected to DevTools');
      
      const send = (method, params = {}) => {
        const id = msgId++;
        return new Promise((res, rej) => {
          pending.set(id, { resolve: res, reject: rej });
          ws.send(JSON.stringify({ id, method, params }));
        });
      };
      
      try {
        // First, navigate to Home tab if not already there
        console.log('\n📱 Ensuring Home tab is active...');
        await send('Runtime.evaluate', {
          expression: `
            // Find Home button and click it
            const homeBtn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Home'));
            if (homeBtn) homeBtn.click();
            'Home tab clicked'
          `
        });
        
        await new Promise(r => setTimeout(r, 500));
        
        // Reset modal state first
        console.log('🔄 Resetting modal state...');
        await send('Runtime.evaluate', {
          expression: `
            window.setShowAIAssistantModal && window.setShowAIAssistantModal(false);
            'Modal closed'
          `
        });
        
        await new Promise(r => setTimeout(r, 300));
        
        // Clear console
        console.log('🧹 Clearing console...');
        await send('Runtime.evaluate', {
          expression: `console.clear(); 'cleared'`
        });
        
        // Enable console monitoring
        await send('Runtime.enable');
        
        const consoleMessages = [];
        ws.on('message', (data) => {
          const msg = JSON.parse(data);
          if (msg.method === 'Runtime.consoleAPICalled') {
            const text = msg.params.args.map(a => a.value || a.description || '').join(' ');
            consoleMessages.push(`[${msg.params.type}] ${text}`);
          }
          if (msg.method === 'Runtime.exceptionThrown') {
            consoleMessages.push(`[EXCEPTION] ${msg.params.exceptionDetails.text}`);
          }
        });
        
        // Now open the AI modal
        console.log('\n🚀 Opening AI Coach modal...');
        const openResult = await send('Runtime.evaluate', {
          expression: `
            // Click AI Coach button
            const btn = [...document.querySelectorAll('button')].find(b => 
              b.textContent.includes('AI Coach') || 
              b.textContent.includes('🤖')
            );
            if (btn) {
              btn.click();
              'Clicked AI Coach button'
            } else {
              'AI Coach button not found'
            }
          `
        });
        console.log('Open result:', openResult.result?.value);
        
        // Wait for lazy load to attempt
        console.log('\n⏳ Waiting for lazy load (3s)...');
        await new Promise(r => setTimeout(r, 3000));
        
        // Check state
        console.log('\n🔍 Checking DOM state...');
        const stateResult = await send('Runtime.evaluate', {
          expression: `
            const state = {
              // Check for modal components in DOM
              hasModalLoading: !!document.querySelector('.modal-loading'),
              modalLoadingText: document.querySelector('.modal-loading')?.textContent || '',
              
              // Check for actual AIAssistantModal
              hasAIModal: !!document.querySelector('.ai-assistant-modal'),
              
              // Check for ErrorBoundary error state
              hasErrorBoundary: !!document.querySelector('.error-boundary-container'),
              errorBoundaryText: document.querySelector('.error-boundary-content p')?.textContent || '',
              
              // Check for Suspense components
              suspenseCount: document.querySelectorAll('[data-suspense]').length,
              
              // Check all divs with "loading" in class
              loadingDivs: [...document.querySelectorAll('div[class*="loading"]')].map(d => ({
                class: d.className,
                text: d.textContent.substring(0, 50)
              })),
              
              // Check all error-related elements
              errorElements: [...document.querySelectorAll('[class*="error"]')].map(e => ({
                class: e.className,
                text: e.textContent.substring(0, 50)
              })),
              
              // Count of AIAssistantModal occurrences
              aiModalCount: document.querySelectorAll('.ai-assistant-modal').length
            };
            JSON.stringify(state, null, 2);
          `
        });
        
        console.log('State:', stateResult.result?.value);
        
        // Check if chunk files exist
        console.log('\n📦 Checking chunk availability...');
        const chunkResult = await send('Runtime.evaluate', {
          expression: `
            // Try to manually import the AIAssistantModal
            const result = { importAttempted: false, error: null };
            try {
              result.importAttempted = true;
              // Check if the chunk file can be fetched
              const chunks = performance.getEntriesByType('resource')
                .filter(r => r.name.includes('chunk') && r.name.includes('.js'))
                .map(r => r.name.split('/').pop());
              result.loadedChunks = chunks;
            } catch (e) {
              result.error = e.message;
            }
            JSON.stringify(result);
          `
        });
        console.log('Chunks:', chunkResult.result?.value);
        
        // Get console messages
        console.log('\n📋 Console messages during modal open:');
        consoleMessages.forEach(msg => console.log('  ', msg));
        
        // Check the actual React error
        console.log('\n🔴 Checking for React errors...');
        const errorCheck = await send('Runtime.evaluate', {
          expression: `
            // Check window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__
            const errors = [];
            
            // Check if there's a global error
            if (window.__error) errors.push(window.__error.message);
            
            // Check for any unhandled promise rejections
            // Look for error boundaries that might have caught something
            const errorBoundaries = document.querySelectorAll('.error-boundary-container');
            if (errorBoundaries.length > 0) {
              errors.push('ErrorBoundary is showing');
            }
            
            JSON.stringify({ errors, errorCount: errors.length });
          `
        });
        console.log('Error check:', errorCheck.result?.value);
        
        ws.close();
        resolve();
        
      } catch (error) {
        console.error('Error:', error);
        ws.close();
        reject(error);
      }
    });
    
    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id).resolve(msg.result || msg);
        pending.delete(msg.id);
      }
    });
    
    ws.on('error', reject);
    
    setTimeout(() => {
      ws.close();
      resolve();
    }, 15000);
  });
}

debugAIModal().catch(console.error);
