const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);

async function tap(x, y) {
  await execAsync(`adb shell input tap ${x} ${y}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getUIText() {
  await execAsync("adb shell uiautomator dump /sdcard/window_dump.xml");
  const { stdout } = await execAsync("adb shell cat /sdcard/window_dump.xml");
  return stdout;
}

async function test() {
  console.log(" Checking Food Tab...");
  await tap(300, 1400);
  await sleep(2000);
  
  const xml = await getUIText();
  console.log("\n Looking for 300 in Food Tab...");
  
  if (xml.includes("text=\"300\"")) {
    console.log(" SUCCESS: 300 calories IS in Food Tab!");
  } else {
    console.log(" FAIL: 300 calories NOT in Food Tab either");
  }
  
  // Extract all text with numbers
  const regex = /text="([^"]*[0-9][^"]*)"/g;
  let match;
  const found = [];
  while ((match = regex.exec(xml)) !== null) {
    if (!match[1].includes("&#")) {
      found.push(match[1]);
    }
  }
  console.log("\n All text with numbers found:");
  found.slice(0, 15).forEach(t => console.log(`   "${t}"`));
  
  console.log("\n\n Checking Home Screen...");
  await tap(180, 1400);
  await sleep(2000);
  
  const homeXml = await getUIText();
  console.log("\n Looking for 300 on Home...");
  
  if (homeXml.includes("text=\"300\"")) {
    console.log(" 300 calories IS on Home Screen!");
  } else {
    console.log(" 300 calories NOT on Home Screen");
  }
  
  // Extract home screen text
  const homeFound = [];
  let homeMatch;
  while ((homeMatch = regex.exec(homeXml)) !== null) {
    if (!homeMatch[1].includes("&#")) {
      homeFound.push(homeMatch[1]);
    }
  }
  console.log("\n Home Screen text with numbers:");
  homeFound.slice(0, 15).forEach(t => console.log(`   "${t}"`));
}

test().catch(console.error);
