const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function tap(x, y) {
  await execAsync(`adb shell input tap ${x} ${y}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function inputText(text) {
  const escaped = text.replace(/\s/g, '%s');
  await execAsync(`adb shell input text "${escaped}"`);
}

async function getUINumbers() {
  await execAsync('adb shell uiautomator dump /sdcard/window_dump.xml');
  const { stdout } = await execAsync('adb shell cat /sdcard/window_dump.xml');
  const numbers = [];
  const regex = /text="([^"]*\d[^"]*)"/g;
  let match;
  while ((match = regex.exec(stdout)) !== null) {
    const text = match[1];
    const numMatch = text.match(/\d+/g);
    if (numMatch) {
      numbers.push(...numMatch.map(n => parseInt(n)));
    }
  }
  return numbers.filter(n => n > 0 && n < 100000);
}

async function test() {
  console.log(' Opening Food Tab...');
  await tap(300, 1400);
  await sleep(2000);
  
  console.log(' Tapping Add Food...');
  await tap(970, 1400);
  await sleep(2000);
  
  console.log(' Selecting Breakfast...');
  await tap(280, 800);
  await sleep(1000);
  
  console.log(' Entering meal name...');
  await tap(558, 450);
  await sleep(500);
  await inputText('Test');
  await sleep(500);
  
  console.log(' Entering calories...');
  await tap(558, 650);
  await sleep(500);
  await execAsync('adb shell input keyevent 67 67 67');
  await inputText('300');
  await sleep(500);
  
  console.log(' Saving meal...');
  await tap(558, 1350);
  await sleep(3000);
  
  console.log('\n Checking Home Screen...');
  await tap(180, 1400);
  await sleep(2000);
  
  const numbers = await getUINumbers();
  console.log(`Found numbers: ${numbers.join(', ')}`);
  console.log(`\n Looking for 300 calories...`);
  if (numbers.includes(300)) {
    console.log(' SUCCESS: 300 calories found on Home Screen!');
  } else {
    console.log(' FAIL: 300 calories NOT found');
    console.log('   This means data is NOT syncing to Home Screen');
  }
}

test().catch(console.error);
