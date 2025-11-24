import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyCKyEoqo9pdsZ6b1nZxuQ6v7gEEJR7QUVY';
const genAI = new GoogleGenerativeAI(API_KEY);

async function testGemini() {
  try {
    console.log('Testing Gemini 2.5 Flash...\n');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('Say hello and introduce yourself as a wellness coach in one sentence.');
    const response = await result.response;
    
    console.log('✅ SUCCESS! Gemini 2.5 Flash is working!');
    console.log('\nAI Response:', response.text());
    console.log('\n=== Your AI is ready to use! ===');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testGemini();
