// Test AI Coach from the app via Chrome DevTools Protocol
const WebSocket = require('ws');

const wsUrl = 'ws://localhost:9222/devtools/page/B36C08397EFC88D76755647A6ACDF94E';

async function testAICoach() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let messageId = 1;
    
    ws.on('open', () => {
      console.log('✅ Connected to Helio WebView');
      console.log('🤖 Attempting to open AI Coach modal...');
      
      // Try to click the AI Coach button
      ws.send(JSON.stringify({
        id: messageId++,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            // Find and click the AI Coach button
            const buttons = Array.from(document.querySelectorAll('button'));
            const aiButton = buttons.find(b => 
              b.textContent.includes('Talk to Your AI Coach') ||
              b.textContent.includes('AI Coach') ||
              b.textContent.includes('🤖')
            );
            
            if (aiButton) {
              aiButton.click();
              'Clicked AI Coach button!';
            } else {
              // Try the setShowAIAssistantModal global function
              if (window.setShowAIAssistantModal) {
                window.setShowAIAssistantModal(true);
                'Opened via setShowAIAssistantModal';
              } else {
                'AI Coach button not found';
              }
            }
          `,
          returnByValue: true
        }
      }));
    });
    
    ws.on('message', (data) => {
      const response = JSON.parse(data);
      if (response.id === 1) {
        console.log('Result:', response.result?.result?.value);
        
        // Wait 2 seconds then check if modal opened
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: messageId++,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                const text = document.body.innerText;
                const hasAIModal = text.includes('AI Coach') && (
                  text.includes('Type your message') ||
                  text.includes('How can I help') ||
                  text.includes('wellness') ||
                  text.includes('Send')
                );
                
                JSON.stringify({
                  modalOpen: hasAIModal,
                  textSnippet: text.substring(0, 1500)
                });
              `,
              returnByValue: true
            }
          }));
        }, 2000);
      } else if (response.id === 2) {
        try {
          const result = JSON.parse(response.result?.result?.value);
          console.log('\n📱 AI COACH MODAL STATUS:');
          console.log('Modal Open:', result.modalOpen ? '✅ YES' : '❌ NO');
          console.log('\n📄 Current Page Text:');
          console.log(result.textSnippet);
        } catch (e) {
          console.log('Parse error:', e.message);
        }
        ws.close();
        resolve();
      }
    });
    
    ws.on('error', (err) => {
      console.error('❌ Error:', err.message);
      reject(err);
    });
    
    setTimeout(() => {
      ws.close();
      resolve();
    }, 15000);
  });
}

testAICoach().catch(console.error);
