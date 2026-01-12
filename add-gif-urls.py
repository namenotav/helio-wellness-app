import re

# Read the file
with open('src/data/exerciseLibraryExpanded.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all exercise blocks
# Pattern: icon: '...' followed by newline and closing brace
pattern = r"(\s+id: '([^']+)',[\s\S]*?icon: '[^']+')(\n\s+})"

def replacement(match):
    before_icon = match.group(1)
    exercise_id = match.group(2)
    after_icon = match.group(3)
    
    # Check if gifUrl already exists in this exercise
    if 'gifUrl' in before_icon:
        return match.group(0)
    
    # Add gifUrl before the closing brace
    return f"{before_icon},\n    gifUrl: '/assets/exercise-gifs/{exercise_id}.gif'{after_icon}"

# Apply the replacement
updated_content = re.sub(pattern, replacement, content)

# Write back
with open('src/data/exerciseLibraryExpanded.js', 'w', encoding='utf-8') as f:
    f.write(updated_content)

# Count results
gif_count = updated_content.count('gifUrl:')
print(f"✅ Added gifUrl to exercises!")
print(f"📊 Total exercises with gifUrl: {gif_count}")
print(f"")
print(f"Next steps:")
print(f"1. Download exercise GIFs from Pexels/Pixabay")
print(f"2. Place in: public/assets/exercise-gifs/")
print(f"3. Name them: chest-1.gif, chest-2.gif, back-1.gif, etc.")
print(f"4. Build and test!")
