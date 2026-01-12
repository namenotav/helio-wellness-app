// Script to add gifUrl to all exercises in exerciseLibraryExpanded.js
// Run with: node add-gif-urls.js

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'exerciseLibraryExpanded.js');

console.log('📝 Adding gifUrl to all exercises...');
console.log('File:', filePath);

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Pattern to match exercise objects
// Matches: icon: '💪'\n  },
// And adds: icon: '💪',\n    gifUrl: '/assets/exercise-gifs/EXERCISE_ID.gif'\n  },
const pattern = /(\s+id: '([^']+)',[\s\S]*?icon: '[^']+')(\n\s+})/g;

let matchCount = 0;
const updatedContent = content.replace(pattern, (match, beforeIcon, exerciseId, afterIcon) => {
  matchCount++;
  // Check if gifUrl already exists
  if (match.includes('gifUrl:')) {
    return match; // Skip if already has gifUrl
  }
  return `${beforeIcon},\n    gifUrl: '/assets/exercise-gifs/${exerciseId}.gif'${afterIcon}`;
});

// Write back to file
fs.writeFileSync(filePath, updatedContent, 'utf8');

console.log(`✅ Added gifUrl to ${matchCount} exercises!`);
console.log('');
console.log('📦 Next steps:');
console.log('1. Download exercise GIFs from Pexels/Pixabay');
console.log('2. Rename them to match exercise IDs (chest-1.gif, back-1.gif, etc.)');
console.log('3. Place in: public/assets/exercise-gifs/');
console.log('4. Rebuild app: npm run build');
console.log('');
console.log('💡 Fallback: If GIF not found, CSS animation will show automatically!');
